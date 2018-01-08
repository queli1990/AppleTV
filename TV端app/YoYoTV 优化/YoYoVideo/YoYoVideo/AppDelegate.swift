//
//  AppDelegate.swift
//  YoYoVideo
//
//  Created by li que on 2017/2/20.
//  Copyright © 2017年 li que. All rights reserved.
//

import UIKit
import TVMLKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, TVApplicationControllerDelegate {

    var window: UIWindow?
    var appController: TVApplicationController?
    
//    static let TVBaseURL = "http://api.ottcloud.tv/smarttv/huace/"
//    static let TVBaseURL = "http://localhost:9001/"
    static let TVBaseURL = "http://47.93.83.7:8099/server/"
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
}

