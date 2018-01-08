//
//  PolicyViewController.swift
//  YoYoVideo
//
//  Created by li que on 2017/4/24.
//  Copyright © 2017年 li que. All rights reserved.
//

import UIKit

class PolicyViewController: UIViewController {
    
    lazy var scrollView = UIScrollView()
    var screenWidth = UIScreen.main.bounds.size.width
    var screenHeight = UIScreen.main.bounds.size.height
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupScrollView()
    }

    override func viewDidLayoutSubviews() {
        scrollView.contentSize = CGSize(width: screenWidth, height: screenHeight*2)
    }
    
    override var preferredFocusedView: UIView? {
        get {
            return self.scrollView
        }
    }

}

extension PolicyViewController {
    func setupTextView () {
        let descStyle = NSMutableParagraphStyle()
        descStyle.lineSpacing = 20
        let attributes = [NSParagraphStyleAttributeName : descStyle]
        
        let textDesc:UITextView = UITextView(frame : CGRect(x:0, y: 0, width: (screenWidth), height: (screenHeight/5)))
        textDesc.attributedText = NSAttributedString(string: "优优TV是世纪优优独立自主研发的互联网视频平台，海外独家提供北京卫视、贵州卫视、湖北卫视、江西卫视、爱情保卫战等各类影视高清视频。",
                                                     attributes:attributes)
        textDesc.font = UIFont(name: "HelveticaNeue", size: 38)
        textDesc.textColor = UIColor.white
        textDesc.textAlignment = .center
        self.view.addSubview(textDesc)
    }
        
    func setupScrollView() {
        scrollView.frame = CGRect(x: 0, y: 0, width: screenWidth, height: screenHeight/2)
        scrollView.backgroundColor = UIColor.orange
        // 设置内容的滚动范围 能滚多远
        scrollView.contentSize = CGSize(width: screenWidth, height: screenHeight*2)
        
//        let array : Array = [1]
//        scrollView.panGestureRecognizer.allowedTouchTypes = [UITouchType.Indirect.rawValue]
//        scrollView.panGestureRecognizer.allowedTouchTypes = [1]
        
        self.view.addSubview(scrollView)
        
        
        
        
        let btnSubscribe = UIButton(type: UIButtonType.system)
        btnSubscribe.setTitle("立即订购", for: .normal)
        btnSubscribe.backgroundColor = UIColor(red: 173/255.0, green: 173/255.0, blue: 173/255.0, alpha: 1)
        btnSubscribe.layer.cornerRadius = 20
        btnSubscribe.frame = CGRect(x:790, y:screenHeight*3.8/5, width:260+60, height:70)
        self.view.addSubview(btnSubscribe)
    }
}






