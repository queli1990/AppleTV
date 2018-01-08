//
//  ViewController.swift
//  tuxiaobei
//
//  Created by Raecoo Cao on 03/31/16.
//  Copyright © 2016 OTT Team. All rights reserved.
//



import UIKit
import StoreKit

class ViewController: UIViewController {
    
    var UUTerms : Array = ["【首部及导言】欢迎您使用优优TV VIP会员服务协议！为使用优优TVVIP会员服务（简称为：本服务），您应当阅读并遵守《优优TV VIP会员服务协议》（简称为：本协议）。请您务必审慎阅读、充分理解各条款内容，特别是免除或限制责任的相应条款，以及开通或使用某项服务的单独协议，并选择接受或不接受。免除或限制责任条款可能以加粗等形式提示您注意。除非您已阅读并接受本协议所有条款，否则您无权使用本服务。您对本服务的任何购买或接受赠与等获取行为及登录、查看等任何使用行为即视为您已阅读并同意本协议的约束。如果您未满18周岁，请在法定监护人的陪同下阅读本协议，并特别注意未成年人使用条款。","一、【协议的范围】1.1【协议适用主体范围】本协议是您与优优之间关于您使用本服务所订立的协议。1.2【本服务内容】本协议视为《优优服务协议》（链接地址：http://……，若链接地址变更的，则以变更后的链接地址所对应的内容为准；其他链接地址变更的情形，均适用前述约定。）本协议内容同时包括优优可能不断发布的关于本服务的相关协议、业务规则等内容。上述内容一经正式发布，即为本协议不可分割的组成部分，您同样应当遵守。"]
    var termAlert : UIAlertController = UIAlertController()
    var termIndex : Int = 1
    
    
    let userDefaults = UserDefaults.standard
    
    // Mark: Properties
    var btnSubscribe = UIButton(type: UIButtonType.system) as UIButton;
    var btnBack = UIButton(type: UIButtonType.system) as UIButton;
    var btnRestore = UIButton(type: UIButtonType.system) as UIButton;
    var btnPolicy = UIButton(type: UIButtonType.system) as UIButton;
    var btnTerm = UIButton(type: UIButtonType.system) as UIButton;
    
    
    var spinnerOverlay = UIView()
    var actInd = UIActivityIndicatorView()
    
    var viewHasLoaded = false
    var restorePreferred = false
    
    override var preferredFocusedView: UIView? {
        get {
            if (isPurchased()) {
                return self.btnBack
            } else if (restorePreferred) {
                return self.btnRestore
            } else {
                return self.btnSubscribe
            }
        }
    }
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor(red: 227/255.0, green: 131/255.0, blue: 31/255.0, alpha: 1)
        super.viewDidLoad()
        
        if(!IAP.canMakePayment()) {
            let alert = UIAlertController(title: "Alert",
                                          message: "Please enable In App Purchase in Settings.",
                                          preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
            self.present(alert, animated: false, completion: { () in
                if let navController = self.navigationController {
                    navController.popToRootViewController(animated: true)
                }
            })
        }
        
        buildButtons()
        viewHasLoaded = true
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        print("Memory Warning ...")
    }
    
    // MARK: initialize view
    func buildButtons(){
        if (viewHasLoaded) {
            view.subviews.forEach({ $0.removeFromSuperview() })
        }
        
        let screenSize:CGRect = UIScreen.main.bounds
        let screenWidth = screenSize.width
        let screenHeight = screenSize.height
        
        let btnTextSize:CGFloat = 35
        let btnTextFont:String  = "HelveticaNeue" // UltraLight
        let btnWidth:CGFloat    = 260
        let btnHeight:CGFloat   = 70
        
        let txtSize:CGFloat     = 30
        let txtHight:CGFloat    = 60
        
        let firstLineYPosition  = (screenHeight/5)*1.8
        let secondLineYPosition = (screenHeight/5)*2.5
        let thirdLineYPosition  = (screenHeight/5)*3.8
        
        let img = UIImage(imageLiteralResourceName: "purchase_header")
//        let headerUrl = NSURL(string: "http://api.ottcloud.tv/smarttv/zhongguolan/data/header-light.jpg")
//        let headerData = NSData(contentsOf: headerUrl! as URL)
//        let headerImage = UIImage(data: headerData! as Data)
        let headerImageView = UIImageView(image: img)
        headerImageView.frame = CGRect(x: 0, y: 0, width: screenWidth, height: 360)
        self.view.addSubview(headerImageView)
        
        
        let descStyle = NSMutableParagraphStyle()
        descStyle.lineSpacing = 20
        let attributes = [NSParagraphStyleAttributeName : descStyle]
        
        let textDesc:UITextView = UITextView(frame : CGRect(x:0, y: firstLineYPosition, width: (screenWidth), height: (screenHeight/5)))
        textDesc.attributedText = NSAttributedString(string: "您想以每月4.99美元的价格订阅UUTV VIP吗？此订阅自动续费，购买之后，每月都会自动收费，除非您在当期结束前24小时取消订阅。订阅期长1月，每月收费4.99美元。iTunes 账户续费是在当期结束前24小时内扣费4.99美元。管理您的订阅和自动续费请通过您的账户设置。隐私政策:http://100uu.tv:8099/AppleTV-Versions/policy.html服务协议:http://100uu.tv:8099/AppleTV-Versions/term.html",
                                                     attributes:attributes)
        textDesc.font = UIFont(name: btnTextFont, size: 30)
        textDesc.textColor = UIColor.white
        textDesc.textAlignment = .center
        self.view.addSubview(textDesc)
        
        if (isPurchased()){
            let txtCongrats:UITextView = UITextView(frame : CGRect(x:0, y:secondLineYPosition+60, width: screenWidth, height: txtHight+25 ))
            txtCongrats.font = UIFont(name: btnTextFont, size: txtSize+20)
            txtCongrats.text = "恭喜您已订购成功!"
            txtCongrats.textColor = UIColor(red: 250/255.0, green: 229/255.0, blue: 0/255.0, alpha: 1)
            txtCongrats.textAlignment = .center
            self.view.addSubview(txtCongrats)
            
            btnBack.setTitle("返回", for: .normal)
            btnBack.titleLabel!.font =  UIFont(name:  btnTextFont, size: btnTextSize)!
            btnBack.layer.cornerRadius = 20
            btnBack.backgroundColor = UIColor(red: 173/255.0, green: 173/255.0, blue: 173/255.0, alpha: 1)
            btnBack.frame = CGRect(x:790, y:thirdLineYPosition, width:btnWidth+80, height:btnHeight)
            btnBack.addTarget(self, action: #selector(backClicked(sender:)), for: .primaryActionTriggered)
            self.view.addSubview(btnBack)
        } else {
            let txtPrice:UITextView = UITextView(frame : CGRect(x:0, y:secondLineYPosition+60, width: screenWidth, height: txtHight+25 ))
            txtPrice.font = UIFont(name: btnTextFont, size: 60)
            txtPrice.textColor = UIColor(red: 250/255.0, green: 229/255.0, blue: 0/255.0, alpha: 1)
            //            txtPrice.text = "USD 4.99 / 月"
            txtPrice.text = "USD 4.99 / 月"
            txtPrice.textAlignment = .center
            self.view.addSubview(txtPrice)
            
            // restore button
            btnRestore.setTitle("恢复购买", for: .normal)
            btnRestore.titleLabel!.font =  UIFont(name:  btnTextFont, size: btnTextSize)!
            btnRestore.layer.cornerRadius = 20
            btnRestore.backgroundColor = UIColor(red: 173/255.0, green: 173/255.0, blue: 173/255.0, alpha: 1)
            btnRestore.frame = CGRect(x:480, y:thirdLineYPosition, width:btnWidth, height:btnHeight)
            btnRestore.addTarget(self, action: #selector(restoreClicked(button:)), for: .primaryActionTriggered)
            self.view.addSubview(btnRestore)
            
            // subscribe button
            btnSubscribe.setTitle("立即订购", for: .normal)
            btnSubscribe.backgroundColor = UIColor(red: 173/255.0, green: 173/255.0, blue: 173/255.0, alpha: 1)
            btnSubscribe.layer.cornerRadius = 20
            btnSubscribe.titleLabel!.font =  UIFont(name:  btnTextFont, size: btnTextSize)!
            btnSubscribe.frame = CGRect(x:790, y:thirdLineYPosition, width:btnWidth+60, height:btnHeight)
            btnSubscribe.addTarget(self, action: #selector(subscribeClicked(button:)), for: .primaryActionTriggered)
            self.view.addSubview(btnSubscribe)
            
            // back button
            btnBack.setTitle("返回", for: .normal)
            btnBack.titleLabel!.font =  UIFont(name:  btnTextFont, size: btnTextSize)!
            btnBack.layer.cornerRadius = 20
            btnBack.backgroundColor = UIColor(red: 173/255.0, green: 173/255.0, blue: 173/255.0, alpha: 1)
            btnBack.frame = CGRect(x:1160, y:thirdLineYPosition, width:btnWidth, height:btnHeight)
            btnBack.addTarget(self, action: #selector(backClicked(sender:)), for: .primaryActionTriggered)
            self.view.addSubview(btnBack)
            
            //policy button
            btnPolicy.setTitle("隐私协议", for: .normal)
            btnPolicy.titleLabel!.font = UIFont(name: btnTextFont, size: btnTextSize)!
            btnPolicy.layer.cornerRadius = 20
            btnPolicy.backgroundColor = UIColor(red: 173/255.0, green: 173/255.0, blue: 173/255.0, alpha: 1)
            btnPolicy.frame = CGRect(x: 610, y: btnBack.frame.maxY+30, width: 315, height: 70)
            btnPolicy.addTarget(self, action: #selector(policyClicked(button:)), for: .primaryActionTriggered)
//            self.view.addSubview(btnPolicy)
            
            //term button
            btnTerm.setTitle("服务规则", for: .normal)
            btnTerm.titleLabel!.font = UIFont(name: btnTextFont, size: btnTextSize)!
            btnTerm.layer.cornerRadius = 20
            btnTerm.backgroundColor = UIColor(red: 173/255.0, green: 173/255.0, blue: 173/255.0, alpha: 1)
            btnTerm.frame = CGRect(x: 975, y: btnBack.frame.maxY+30, width: 315, height: 70)
            btnTerm.addTarget(self, action: #selector(termClicked(button:)), for: .primaryActionTriggered)
//            self.view.addSubview(btnTerm)
        }
    }
    
    func showSpinner() {
        if (self.spinnerOverlay.subviews.isEmpty) {
            // Spinner overlay
            spinnerOverlay = UIView(frame: view.frame)
            spinnerOverlay.backgroundColor = UIColor.black
            spinnerOverlay.alpha = 0.85
            let actInd: UIActivityIndicatorView = UIActivityIndicatorView()
            actInd.frame = CGRect(x:0, y:0, width:40, height:40)
            actInd.center = spinnerOverlay.center
            actInd.hidesWhenStopped = true
            actInd.activityIndicatorViewStyle = UIActivityIndicatorViewStyle.whiteLarge
            spinnerOverlay.addSubview(actInd)
            actInd.startAnimating()
        }
        
        view.addSubview(spinnerOverlay)
    }
    
    func hideSpinner() {
        spinnerOverlay.removeFromSuperview()
    }
    
    func subscribeClicked(button: UIButton!) {
        showSpinner()
        IAP.purchaseProduct("com.uu.VIP499", handler: handlePurchase)
    }
    
    func restoreClicked(button: UIButton!) {
        showSpinner()
        IAP.restorePurchases(handleRestore)
    }
    
    func backClicked(sender: UIButton!) {
        if let navController = self.navigationController {
            navController.popToRootViewController(animated: true)
        }
    }
    
    func policyClicked(button: UIButton!) {
        let policyVC = PolicyViewController()
        navigationController?.pushViewController(policyVC, animated: true)
    }
    
    func termClicked(button: UIButton!) {
        termAlert = UIAlertController(
            title: "服务规则",
            message: UUTerms[termIndex],
            preferredStyle: .alert)
        
        // 建立[確認]按鈕
        let lastAction = UIAlertAction(
            title: "上一页",
            style: .default,
            handler: {
                (action: UIAlertAction!) -> Void in
                self.termIndex -= 1
        })
        let nextAction = UIAlertAction(
            title: "下一页",
            style: .default,
            handler: {
                (action: UIAlertAction!) -> Void in
                self.termIndex += 1
        })
        termAlert.addAction(lastAction)
        termAlert.addAction(nextAction)
        
        // 顯示提示框
        self.present(
            termAlert,
            animated: true,
            completion: nil)
    }
    
    // Mark: In-App Purchase functions
    
    func handlePurchase(productIdentifier: ProductIdentifier?, error: NSError?) {
        if productIdentifier != nil {
            print("Purchase Success")
            provideContentForProductIdentifier(productIdentifier: productIdentifier!)
        } else if error?.code == SKError.paymentCancelled.rawValue {
            print("Purchase Cancelled: \(error?.localizedDescription)")
            buildButtons()
        } else if error?.code == 3532 {
            restorePreferred = true
            buildButtons()
            updateFocusIfNeeded()
        } else {
            //print(error?.code)
            print("Purchase Error: \(error?.localizedDescription)")
        }
        
        hideSpinner()
        
    }
    
    func handleRestore(productIdentifiers: Set<ProductIdentifier>, error: NSError?) {
        if !productIdentifiers.isEmpty {
            print("Restore Success")
            for productIdentifier in productIdentifiers {
                provideContentForProductIdentifier(productIdentifier: productIdentifier)
            }
            let alertController = UIAlertController(title: "恢复购买", message: "购买状态已恢复", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "返回", style: UIAlertActionStyle.default, handler: nil))
            self.present(alertController, animated: true, completion: nil)
        } else if error?.code == SKError.unknown.rawValue {
            // NOTE: if no product ever purchased, will return this error.
            let alertController = UIAlertController(title: "恢复购买", message: "未找到购买记录, 请确认已登录的 Apple ID 是否正确", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "返回", style: UIAlertActionStyle.default, handler: nil))
            self.present(alertController, animated: true, completion: nil)
        } else if error?.code == SKError.paymentCancelled.rawValue {
            print("Restore Cancelled: \(error?.localizedDescription)")
        } else {
            print("Restore Error: \(error?.localizedDescription)")
            
        }
        hideSpinner()
    }
    
    private func provideContentForProductIdentifier(productIdentifier: String) {
        userDefaults.set(true, forKey: productIdentifier)
        userDefaults.synchronize()
        buildButtons()
    }
    
    
}

