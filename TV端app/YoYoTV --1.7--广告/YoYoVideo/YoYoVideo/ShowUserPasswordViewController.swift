//
//  ShowUserPasswordViewController.swift
//  YoYoVideo
//
//  Created by li que on 2017/8/28.
//  Copyright © 2017年 li que. All rights reserved.
//

import UIKit

class ShowUserPasswordViewController: UIViewController {
    
    var warnColor = UIColor(valueRGB: 0xFF8000, alpha: 1.0)
    var fontName = "PingFangSC-Regular"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let dic = UserDefaults.standard.dictionary(forKey: "returnMoney")
        let ID = dic!["code"] as? String
        let passWord = "100uu.tv"
        
        let attributeString = NSMutableAttributedString(string: "请登录http://api.100uu.tv/passport.html  查看并提取您的现金\n您的用户名是：\(ID!)\n您的初始登录密码是：\(passWord)")
        let stringLength = attributeString.length
        //从文本0开始6个字符字体HelveticaNeue-Bold,16号
        attributeString.addAttribute(NSFontAttributeName,
                                     value: UIFont(name: fontName, size: 48)!,
                                     range: NSMakeRange(0,stringLength))
        //设置字体颜色
        attributeString.addAttribute(NSForegroundColorAttributeName, value: warnColor,range: NSMakeRange(3, 33))
        attributeString.addAttribute(NSForegroundColorAttributeName, value: warnColor,range: NSMakeRange(55, 14))
        attributeString.addAttribute(NSForegroundColorAttributeName, value: warnColor,range: NSMakeRange(80, (stringLength-80)))
        //设置文字背景颜色
        attributeString.addAttribute(NSBackgroundColorAttributeName, value: UIColor.green,
                                     range: NSMakeRange(0,0))
        let titleColor = UIColor(valueRGB: 0x333333, alpha: 1.0)
        let label = UILabel(frame: CGRect(x: 168, y: 408, width: 1584, height: 264))
        label.textColor = titleColor
        label.numberOfLines = 0
        label.textAlignment = .left
        label.font = UIFont(name: fontName, size: 36)
        label.attributedText = attributeString
        self.view.addSubview(label)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    

}
