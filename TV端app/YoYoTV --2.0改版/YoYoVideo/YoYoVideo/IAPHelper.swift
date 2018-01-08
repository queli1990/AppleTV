//
//  IAPHelper.swift
//
//  Created by Tarkus Liu on 10/20/16.
//  Copyright © 2016 Vego TV Inc. All rights reserved.
//


import StoreKit

let IAP = IAPHelper.sharedInstance

public typealias ProductIdentifier = String
public typealias ProductWithExpireDate = [ProductIdentifier: Date]

public typealias ProductsRequestHandler = (_ response: SKProductsResponse?, _ error: NSError?) -> ()
public typealias PurchaseHandler = (_ productIdentifier: ProductIdentifier?, _ error: NSError?) -> ()
public typealias RestoreHandler = (_ productIdentifiers: Set<ProductIdentifier>, _ error: NSError?) -> ()
public typealias ValidateHandler = (_ statusCode: Int?, _ products: ProductWithExpireDate?, _ receipt: AnyObject?) -> ()

class IAPHelper: NSObject {
    
    fileprivate override init() {
        super.init()
        addObserver()
    }
    static let sharedInstance = IAPHelper()
    
    fileprivate var productsRequest: SKProductsRequest?
    fileprivate var productsRequestHandler: ProductsRequestHandler?
    
    fileprivate var purchaseHandler: PurchaseHandler?
    fileprivate var restoreHandler: RestoreHandler?
    
    fileprivate var observerAdded = false
    
    internal var availableProducts = [SKProduct]()
    internal var productFetched = false
    
    
    func addObserver() {
        if !observerAdded {
            observerAdded = true
            SKPaymentQueue.default().add(self)
        }
    }
    
    func removeObserver() {
        if observerAdded {
            observerAdded = false
            SKPaymentQueue.default().remove(self)
        }
    }
    
}

// MARK: StoreKit API

extension IAPHelper {
    
    func canMakePayment() -> Bool {
        return SKPaymentQueue.canMakePayments()
    }
    
    func requestProducts(_ productIdentifiers: Set<ProductIdentifier>, handler: ProductsRequestHandler? = nil) {
        productFetched = false
        
        productsRequest?.cancel()
        productsRequestHandler = handler
        
        productsRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
        productsRequest?.delegate = self
        productsRequest?.start()
    }
    
    func purchaseProduct(_ productIdentifier: ProductIdentifier, handler: @escaping PurchaseHandler) {
        purchaseHandler = handler
        
        if (productFetched && availableProducts.count == 0) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                print("IAPHelper: Retrying purchaseProduct ...")
                self.purchaseProduct(productIdentifier, handler: handler)
            }
            return
        }
        
        for product in availableProducts {
            if (product.productIdentifier == productIdentifier) {
                let payment = SKMutablePayment()
                payment.productIdentifier = productIdentifier
                SKPaymentQueue.default().add(payment)
                break;
            }
        }
    }
    
    func restorePurchases(_ handler: @escaping RestoreHandler) {
        restoreHandler = handler
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
    
    func validateReceipt(_ secret: String, handler: @escaping ValidateHandler) {
        validateReceiptInternal(isProduction: true, secret: secret) { (statusCode, products, receipt) in
            if let statusCode = statusCode , statusCode == ReceiptStatus.testReceipt.rawValue {
                self.validateReceiptInternal(isProduction: false, secret: secret, handler: { (statusCode, products, receipt) in
                    handler(statusCode, products, receipt)
                })
            } else {
                handler(statusCode, products, receipt)
            }
        }
    }
}

// MARK: SKProductsRequestDelegate

extension IAPHelper: SKProductsRequestDelegate {
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        productFetched = true
        availableProducts = []
        let products = response.products
        for product in products {
            print("IAPHelper: \(product.localizedTitle)(\(product.productIdentifier)): \(product.price)")
            availableProducts.append(product)
        }
        
        productsRequestHandler?(response, nil)
        clearRequestAndHandler()
    }
    
    func request(_ request: SKRequest, didFailWithError error: Error) {
        productFetched = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            print("IAPHelper: Retrying productsRequest ...")
            self.productsRequest?.start()
        }
        // TODO:
        //      Add deadline
        //productsRequestHandler?(response: nil, error: error)
        //clearRequestAndHandler()
    }
    
    fileprivate func clearRequestAndHandler() {
        productsRequest = nil
        productsRequestHandler = nil
    }
}

// MARK: SKPaymentTransactionObserver

extension IAPHelper: SKPaymentTransactionObserver {
    
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch (transaction.transactionState) {
                
            case .purchased:
                completePurchaseTransaction(transaction)
                
            case .restored:
                finishTransaction(transaction)
                
            case .failed:
                failedTransaction(transaction)
                
            case .purchasing, .deferred:
                print("IAPHelper: Purchasing")
                break
                
            }
        }
    }
    
    func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
        completeRestoreTransactions(queue, error: nil)
    }
    
    func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        completeRestoreTransactions(queue, error: error as NSError?)
    }
    
    fileprivate func completePurchaseTransaction(_ transaction: SKPaymentTransaction) {
        purchaseHandler?(transaction.payment.productIdentifier, transaction.error as NSError?)
        purchaseHandler = nil
        
        finishTransaction(transaction)
    }
    
    fileprivate func completeRestoreTransactions(_ queue: SKPaymentQueue, error: NSError?) {
        var productIdentifiers = Set<ProductIdentifier>()
        
        let transactions = queue.transactions
        
        for transaction in transactions {
            if let productIdentifier = transaction.original?.payment.productIdentifier {
                productIdentifiers.insert(productIdentifier)
            }
            
            finishTransaction(transaction)
        }
        
        
        restoreHandler?(productIdentifiers, error)
        restoreHandler = nil
    }
    
    fileprivate func failedTransaction(_ transaction: SKPaymentTransaction) {
        // NOTE: Both purchase and restore may come to this state. So need to deal with both handlers.
        
        purchaseHandler?(nil, transaction.error as NSError?)
        purchaseHandler = nil
        
        restoreHandler?(Set<ProductIdentifier>(), transaction.error as NSError?)
        restoreHandler = nil
        
        finishTransaction(transaction)
    }
    
    // MARK: Helper
    
    fileprivate func finishTransaction(_ transaction: SKPaymentTransaction) {
        switch transaction.transactionState {
        case .purchased,
             .restored,
             .failed:
            
            SKPaymentQueue.default().finishTransaction(transaction)
            
        default:
            break
        }
    }
}

// MARK: Validate Receipt

extension IAPHelper {
    
    fileprivate func validateReceiptInternal(isProduction: Bool, secret: String, handler: @escaping ValidateHandler) {
        
        let serverURL = isProduction
            ? "https://buy.itunes.apple.com/verifyReceipt"
            : "https://sandbox.itunes.apple.com/verifyReceipt"
        let appStoreReceiptURL = Bundle.main.appStoreReceiptURL
        guard let receiptData = receiptData(appStoreReceiptURL, secret: secret), let url = URL(string: serverURL) else {
            handler(ReceiptStatus.noRecipt.rawValue, nil, nil)
            return
        }
        
        let request = NSMutableURLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = receiptData
        
        let task = URLSession.shared.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) in
            
            guard let data = data , error == nil else {
                handler(nil, nil, nil)
                return
            }
            
            do {
                let json = try JSONSerialization.jsonObject(with: data, options:[]) as!  [String:AnyObject]
                
                let statusCode = json["status"] as? Int
                let products = self.parseValidateResultJSON(json as AnyObject)
                
                if let receiptList = json["latest_receipt_info"] {
                    handler(statusCode, products, receiptList)
                } else {
                    handler(statusCode, products, nil)
                }
            } catch {
                handler(nil, nil, nil)
            }
        })
        task.resume()
    }
    
    fileprivate func parseValidateResultJSON(_ json: AnyObject) -> ProductWithExpireDate? {
        var products = ProductWithExpireDate()
        var cancelledProducts = ProductWithExpireDate()
        
        if let receiptList = json["latest_receipt_info"] as? [AnyObject] {
            for receipt in receiptList {
                if let productID = receipt["product_id"] as? String {
                    
                    if let expiresDate = parseDate(receipt["expires_date"] as? String) {
                        if let existingExpiresDate = products[productID] , existingExpiresDate.timeIntervalSince1970 >= expiresDate.timeIntervalSince1970 {
                            // Do nothing
                        } else {
                            products[productID] = expiresDate
                        }
                    }
                    
                    if let cancellationDate = parseDate(receipt["cancellation_date"] as? String) {
                        if let existingExpiresDate = cancelledProducts[productID] , existingExpiresDate.timeIntervalSince1970 >= cancellationDate.timeIntervalSince1970 {
                            // Do nothing
                        } else {
                            products[productID] = cancellationDate
                        }
                    }
                }
            }
        }
        
        // Set the expired date for cancelled product to 1970.
        for (productID, cancelledExpiresDate) in cancelledProducts {
            if let expiresDate = products[productID] , expiresDate.timeIntervalSince1970 <= cancelledExpiresDate.timeIntervalSince1970 {
                products[productID] = Date(timeIntervalSince1970: 0)
            }
        }
        
        return products.isEmpty ? nil : products
    }
    
    fileprivate func receiptData(_ appStoreReceiptURL: URL?, secret: String) -> Data? {
        guard let receiptURL = appStoreReceiptURL, let receipt = try? Data(contentsOf: receiptURL) else {
            return nil
        }
        
        do {
            let receiptData = receipt.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0))
            let requestContents = ["receipt-data": receiptData, "password": secret]
            let requestData = try JSONSerialization.data(withJSONObject: requestContents, options: [])
            return requestData
        } catch let error as NSError {
            NSLog("\(error)")
        }
        
        return nil
    }
    
    fileprivate func parseDate(_ dateString: String?) -> Date? {
        guard let dateString = dateString else {
            return nil
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss z"
        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
        
        let newDateString = dateString.replacingOccurrences(of: "Etc/GMT", with: "GMT")
        return dateFormatter.date(from: newDateString)
    }
}

public enum ReceiptStatus: Int {
    case noRecipt = -999
    case valid = 0
    case testReceipt = 21007
}
