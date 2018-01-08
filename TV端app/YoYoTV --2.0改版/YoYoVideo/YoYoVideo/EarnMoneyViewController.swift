//
//  EarnMoneyViewController.swift
//  YoYoVideo
//
//  Created by li que on 2017/8/22.
//  Copyright © 2017年 li que. All rights reserved.
//

import UIKit
import Alamofire

class EarnMoneyViewController: UIViewController, UITextFieldDelegate {

    var screenWidth = UIScreen.main.bounds.width;
    var screenHeight = UIScreen.main.bounds.height;
    var withdrawBtn = UIButton(type: UIButtonType.system) as UIButton;
    var bindBtn = UIButton(type: UIButtonType.system) as UIButton;
    var textField = UITextField() as UITextField;
    var IDLabel = UILabel() as UILabel
    var isVIP = UserDefaults.standard.bool(forKey: "com.uu.VIP") || UserDefaults.standard.bool(forKey: "com.uu.VIP499") || UserDefaults.standard.bool(forKey: "com.uu.VIP199")
//    var isVIP = true
    var warnColor = UIColor(valueRGB: 0xFF8000, alpha: 1.0)
    var fontName = "PingFangSC-Regular"
    
    override var preferredFocusedView: UIView? {
        get {
            return self.withdrawBtn;
        }
    }
    
//    override func viewWillAppear(_ animated: Bool) {
//        if isVIP {
//            //点击确定之后，判断时候有效
//            let dic = UserDefaults.standard.dictionary(forKey: "returnMoney")
//            let ID = dic!["isUse"] as? Bool
//            if ID! {
//                bindBtn.isUserInteractionEnabled = false
//                textField.isUserInteractionEnabled = false
//            }
//        }
//    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        isVIP ? requestData() : self.setUpView()
    }
}

extension EarnMoneyViewController {
    func requestData() {
        let UUID = UIDevice.current.identifierForVendor?.uuidString  //deviceId
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"]  //version
        let price = (Bundle.main.infoDictionary?["price"])! //会员价格
        let platform = "apple-tv"  //platform
        
        let paramsDic = ["deviceId":UUID!,"version":version!,"price":price,"platform":platform] as [String:Any]
        Alamofire.request("http://api.100uu.tv/app/member/doAppleTVOrRukuLogin.do", method: .post, parameters: paramsDic, encoding: URLEncoding.httpBody).responseJSON{ (response) in
            if let JSON = response.result.value {
                let resultDic = JSON as! NSDictionary
//                print(resultDic["status"]!)
//                print("JSON: \(JSON)")
                UserDefaults.standard.set(resultDic, forKey: "returnMoney")
                self.setUpView()
            }
        }
    }
}

//设置UI
extension EarnMoneyViewController {
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        print(textField.text!)
        return true
    }
    
    //立即提现按钮
    func withdrawBtnClick(button: UIButton!) {
        isVIP ? showUserPassword() : pushPurchaseViewController()
    }
    
    // 开通VIP
    func pushPurchaseViewController() {
        print("去立即开通VIP页面")
        if let navController = self.navigationController {
            let viewController = ViewController()
            navController.pushViewController(viewController, animated: true)
        }
    }
    
    // 提示用户名和密码
    func showUserPassword() {
        if let navController = self.navigationController {
            let viewController = ShowUserPasswordViewController()
            navController.pushViewController(viewController, animated: true)
        }
    }
    
    //立即绑定按钮
    func bindBtnClick(button: UIButton!) {
        let dic = UserDefaults.standard.dictionary(forKey: "returnMoney")
        let myID = dic!["id"]!  //用户的ID
        let inputWord = textField.text  //输入的码
        let platform = "apple-tv"  //platform
        if (inputWord?.characters.count == 0) {
            self.showAlert(title: "请先输入好友返现ID")
            return
        }
        
        let paramsDic = ["id":myID,"platform":platform,"code":inputWord!]
        Alamofire.request("http://api.100uu.tv/app/member/doInvite.do?", method: .post, parameters: paramsDic, encoding: URLEncoding.httpBody).responseJSON{(response) in
            if let JSON = response.result.value {
                let resultDic = JSON as! NSDictionary
                print(resultDic["status"]!)
//                print("JSON: \(JSON)")
                if (resultDic["status"]! as! String == "4") {
                    self.showAlert(title: "绑定成功")
                    self.bindBtn.isUserInteractionEnabled = false
                    self.textField.isUserInteractionEnabled = false
                } else if (resultDic["status"]! as! String == "0") {
                    self.showAlert(title: "服务端异常")
                } else if (resultDic["status"]! as! String == "2") {
                    self.showAlert(title: "邀请人或被邀请人不存在")
                } else if (resultDic["status"]! as! String == "3") {
                    self.showAlert(title: "被邀请人已经绑定过其他人的邀请ID")
                } else if (resultDic["status"]! as! String == "5") {
                    self.showAlert(title: "绑定邀请ID以及返现失败")
                } else {
                    self.showAlert(title: "绑定失败，请重试")
                }
            }
        }
    }
    
    func showAlert(title : String)  {
        let alertController = UIAlertController(title: "提示",
                                                message: title, preferredStyle: .alert)
        let cancelAction = UIAlertAction(title: "取消", style: .cancel, handler: nil)
        let okAction = UIAlertAction(title: "好的", style: .default, handler: {
            action in
            //用户点击确定按钮
        })
        alertController.addAction(cancelAction)
        alertController.addAction(okAction)
        self.present(alertController, animated: true, completion: nil)
    }
    
    func setUpView() {
        let titleColor = UIColor(valueRGB: 0x333333, alpha: 1.0)
        
        let myIDLabel = UILabel(frame: CGRect(x: 168, y: 117, width: 447-178, height: 67))
        myIDLabel.font = UIFont(name: fontName, size: 48)
        myIDLabel.textAlignment = .left
        myIDLabel.textColor = titleColor
        myIDLabel.text = "我的返现ID"
        self.view.addSubview(myIDLabel)
        
        IDLabel = UILabel(frame: CGRect(x: 168+(447-178), y: 117, width: 900, height: 67))
        IDLabel.font = UIFont(name: fontName, size: 48)
        IDLabel.textAlignment = .left
        IDLabel.textColor = warnColor
        //判断是否为VIP
        let dic = UserDefaults.standard.dictionary(forKey: "returnMoney")
        IDLabel.text = isVIP ? (dic!["code"] as? String) : "请开通优优电视会员"
        self.view.addSubview(IDLabel)
        
        withdrawBtn.frame = CGRect(x: 1483, y: 88, width: 277, height: 124)
        withdrawBtn.layer.cornerRadius = 3
        withdrawBtn.backgroundColor = UIColor.orange
        isVIP ? withdrawBtn.setTitle("立即提现", for: .normal) : withdrawBtn.setTitle("立即开通", for: .normal)
        withdrawBtn.addTarget(self, action: #selector(withdrawBtnClick(button:)), for: .primaryActionTriggered)
        self.view.addSubview(withdrawBtn)
        
        let actionLabel1 = UILabel(frame: CGRect(x: 168, y: 276, width: 1584, height: 232))
        actionLabel1.textColor = titleColor
        actionLabel1.numberOfLines = 0
        actionLabel1.textAlignment = .left
        actionLabel1.font = UIFont(name: fontName, size: 36)
        let attributeString = NSMutableAttributedString(string: "活动说明\n1、即日起购买（含已经购买）优优电视会员用户即可生成一个返现ID。\n2、将您的返现ID发送给好友，推荐好友在优优TV端（Apple TV/Android/Roku）开通优优电视会员（含已开通用户）并绑定您的返现ID，您即可获得好友VIP付费的50%现金返现。")
        //从文本0开始6个字符字体HelveticaNeue-Bold,16号
        attributeString.addAttribute(NSFontAttributeName,
                                     value: UIFont(name: fontName, size: 46)!,
                                     range: NSMakeRange(126,7))
        //设置字体颜色
        attributeString.addAttribute(NSForegroundColorAttributeName, value: warnColor,range: NSMakeRange(126, 7))
        //设置文字背景颜色
        attributeString.addAttribute(NSBackgroundColorAttributeName, value: UIColor.green,
                                     range: NSMakeRange(0,0))
        actionLabel1.attributedText = attributeString
        self.view.addSubview(actionLabel1)
        
        let bindIDLabel = UILabel(frame: CGRect(x: 168, y: 681, width: 334, height: 67))
        bindIDLabel.textAlignment = .left
        bindIDLabel.text = "绑定好友返现ID"
        bindIDLabel.textColor = titleColor
        bindIDLabel.font = UIFont(name: fontName, size: 48)
        self.view.addSubview(bindIDLabel)
        
        textField = UITextField(frame: CGRect(x: 168, y: 796, width: 1200, height: 108))
        textField.delegate = self
        textField.placeholder = "请输入好友返现ID"
        if (!isVIP || (dic!["isUse"] as? Bool)!)  {
            textField.isUserInteractionEnabled = false
        }
        textField.font = UIFont(name: fontName, size: 42)
        textField.textColor = titleColor
        self.view.addSubview(textField)
        
        bindBtn.frame = CGRect(x: 1491, y: 796, width: 261, height: 108)
        bindBtn.layer.cornerRadius = 6
        bindBtn.backgroundColor = UIColor.orange
        bindBtn.setTitle("立即绑定", for: .normal)
        if (!isVIP || (dic!["isUse"] as? Bool)!) {
            bindBtn.isUserInteractionEnabled = false
            //还需要改变btn字体颜色
        };
        bindBtn.addTarget(self, action: #selector(bindBtnClick(button:)), for: .primaryActionTriggered)
        self.view.addSubview(bindBtn)
        
        let warnLabel = UILabel(frame: CGRect(x: 168, y: 940, width: 1292, height: 50))
        warnLabel.text = "注：开通优优电视会员才可绑定好友返现ID；每位用户只能绑定一个好友的返现ID"
        warnLabel.font = UIFont(name: fontName, size: 36)
        warnLabel.textColor = titleColor
        self.view.addSubview(warnLabel)
    }
}


//将十六进制转换成rgb颜色
extension UIColor {
    //用数值初始化颜色，便于生成设计图上标明的十六进制颜色
    convenience init(valueRGB: UInt, alpha: CGFloat = 1.0) {
        self.init(
            red: CGFloat((valueRGB & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((valueRGB & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(valueRGB & 0x0000FF) / 255.0,
            alpha: alpha
        )
    }
}
