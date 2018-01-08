//
//  AppDelegate.swift
//  YoYoVideo
//
//  Created by li que on 2017/2/20.
//  Copyright © 2017年 li que. All rights reserved.
//

import UIKit
import TVMLKit

var jsCallback = JSValue()


func isPurchased() -> Bool {
    return UserDefaults.standard.bool(forKey: "com.uu.VIP")
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, TVApplicationControllerDelegate {

    var window: UIWindow?
    var appController: TVApplicationController?
    
//    static let TVBaseURL = "http://api.ottcloud.tv/smarttv/huace/"
    static let TVBaseURL = "http://localhost:9001/"
//    static let TVBaseURL = "http://47.93.83.7:8099/AppleTV-Versions/Version-1.1/server/"
//    static let TVBaseURL = "http://www.100uu.tv:8099/server/"
    static let TVBootURL = "\(AppDelegate.TVBaseURL)js/application.js"
    
//    http://47.93.83.7:8099/server/js/application.js
//    http://api.ottcloud.tv/smarttv/huace/application.js
    
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey : Any]? = nil) -> Bool {
        
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // 1
        let appControllerContext = TVApplicationControllerContext()
        
        // 2
        guard let javaScriptURL = NSURL(string: AppDelegate.TVBootURL) else {
            fatalError("unable to create NSURL")
        }
        appControllerContext.javaScriptApplicationURL = javaScriptURL as URL
        appControllerContext.launchOptions["BASEURL"] = AppDelegate.TVBaseURL
        
        // 3
        appController = TVApplicationController(context: appControllerContext, window: window, delegate: self)
        
        let uuid : String = (UIDevice.current.identifierForVendor?.uuidString)!
        print("sss",uuid)
        
        IAP.requestProducts(Set<ProductIdentifier>(arrayLiteral: "com.uu.VIP"))
        validateSubscriptionIfNeeded()
        
        // Load Swift context into JavaScript
        loadInAppPurchaseView()
        
//        let alertController = UIAlertController(title: "系统提示",
//                                                message: AppDelegate.TVBootURL, preferredStyle: .alert)
//        let cancelAction = UIAlertAction(title: "取消", style: .cancel, handler: nil)
//        let okAction = UIAlertAction(title: "好的", style: .default, handler: {
//            action in
//            print("点击了确定")
//        })
//        
//        alertController.addAction(cancelAction)
//        alertController.addAction(okAction)
//        
//        window?.rootViewController?.present(alertController, animated: true, completion: nil)
        
        return true   
    }
    
    func validateSubscriptionIfNeeded() {
        let validatedAt = UserDefaults.standard.double(forKey: "receipt_validated_at")
        let now = NSDate().timeIntervalSince1970
        if (now - validatedAt < 86400) {
            return
        } 
        IAP.validateReceipt("f3a2caf8481e4db9a00f1ded035a034c") { (statusCode, products, receipt) in
            if (products == nil || products!.isEmpty) {
                UserDefaults.standard.set(false, forKey: "com.uu.VIP")
                UserDefaults.standard.synchronize()
                return
            }
            if let expireDate = products!["com.uu.VIP"] {
                if (expireDate.timeIntervalSince1970 < now) {
                    print("Subscription expired ...")
                    UserDefaults.standard.set(false, forKey: "com.uu.VIP")
                    UserDefaults.standard.synchronize()
                }
            }
        }
    }
    
    func loadInAppPurchaseView(){
        
        appController?.evaluate(inJavaScriptContext: {(evaluation: JSContext) -> Void in
            
            if let _jsCallback = evaluation.objectForKeyedSubscript("jsCallback") {
                jsCallback = _jsCallback
            }
            
            let pushNativeViewBlock : @convention(block) () -> Void = {
                () -> Void in
                DispatchQueue.main.async(execute: {
                    if let navController = self.appController?.navigationController {
                        let viewController = ViewController()
                        navController.pushViewController(viewController, animated: true)
                    }
                })
            }
            
            let jsIsPurchased : @convention(block) () -> Bool = {
                return isPurchased()
            }
            
            let bundleVersion: @convention(block) () -> Void = {
                return Bundle.main.infoDictionary?["CFBundleVersion"]
            }
            
            evaluation.setObject(unsafeBitCast(pushNativeViewBlock, to: AnyObject.self), forKeyedSubscript: "pushNativeView" as (NSCopying & NSObjectProtocol)!)
            evaluation.setObject(unsafeBitCast(jsIsPurchased, to: AnyObject.self), forKeyedSubscript: "isPurchased" as (NSCopying & NSObjectProtocol)!)
            evaluation.setObject(unsafeBitCast(bundleVersion, to: AnyObject.self), forKeyedSubscript: "bundleVersion" as (NSCopying & NSObjectProtocol)!)
            
        }, completion: {(Bool) -> Void in
            //done running the script
        })
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        IAP.removeObserver()
    }
}

