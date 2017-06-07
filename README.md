Node-SaddleCreek
===================
#### ProLog/ProWares SOAP XML API Wrapper
This is a Node.js Module will allow you to hook into Saddle Creek's Inventory, Fulfillment, &amp; ASN API Endpoints 

----------

Setup
-------

There two way for setting up the warehouse connector:
    
    var warehouse = require('<...>/warehouse')
    warehouse.settings({ ... });


    var warehouse = require('<...>/warehouse').settings({ ... });


The settings object could contain these properties:

    { 
      uselocalWsdl: true, // if FALSE it fallbacks to remoteWsdl 
      localWsdl: 'local/uri/of/wsdl/file',
      remoteWsdl: 'http://remote.url/wsdl/provider',
      credentials: {
        SystemId: 'xxxxxxxxx',  // For testing use '999system'
        Password: 'xxxxxx'      // For testing use 'prolog'
      },
      debugLogs: false  // Only use it during development 
    }
Recommended to use a local Wsdl file, think what would happen if your server restart in a moment when the remote WSDL server is not online. It will never get connected!
One caveat I think on this subject is, if  ProLog company decides to change specification, the local file has no way to know this happened. The remote way is no a total warranty neither as all this connector would fail anyway if they introduce several changes in the future.

----------


Methods
-------

####warehouse.getInventoryStatus( productArray, callback );

######**Arguments**
**productArray**: 
 Accepts 'productId' or [ 'productId1', 'productId2', ... ] 
 
**callback ( err, result )**: 
 Accepts only function and is **required**
 Arguments passed: 
 - Error Object or *null*
 - Result Object { 'Product',   'QuantityAvailable',   'QuantityOnHand',   'QuantityAllocated',  'QuantityExpected',  'QuantityFrozen' } 
 

----------

####warehouse.createOrders( orderObjArray, callback);

######**Arguments**
**orderObjArray**: 
 Accepts {orderObject} or [ {orderObject}, {orderObject}, ... ] and is **required**
 Expected orderObject to be in this form:
 
 ```json
   {
       "OrderNumber": "",
       "CustomerNumber": "",
       "CustomerPO": "",
       "CustomerOrderNumber": "",
       "OrderDate": "date-time",
       "Delay": 15,
       "AutoAllocate": true,
       "PartialShip": true,
       "SplitShip": false,
       "ShippingService": "",
       "BillThirdParty": false,
       "SaturdayDelivery": false,
       "Residential": true,
       "InsurePackages": false,
       "InsureThreshold": 100.00,
       "PackingListTemplate": "",
       "PackingListComment": "",
       "AccountNumber": "",
       "EmailConfirmationAddress": "",
       "OrderProcessingVariation": "",
       "Subtotal": 0.00,
       "Shipping": 0.00,
       "Handling": 0.00,
       "Discount": 0.00,
       "Tax": 0.00,
       "Total": 0.00,
       "ref1": "",
       "ref2": "",
       "ref3": "",
       "ref4": "",
       "ref5": "",
       "OrderLines": [
           {
               "Product": "",
               "Quantity": 1,
               "Description": "",
               "Price": 0.00,
               "DeclaredValue": 0.00,
               "Allocations": [{
                   "Warehouse": "",
                   "Quantity": 1
               }],
               "ref1": "",
               "ref2": "",
               "ref3": ""
           }
       ],
       "BillingAddress": {
           "FirstName": "", 
           "LastName": "",
           "CompanyName": "", 
           "Address1": "",
           "Address2": "",
           "City": "",
           "State": "",
           "PostalCode": "",
           "Country": "",
           "PhoneNumber": ""
       },
       "ShippingAddress": {
           "FirstName": "",
           "LastName": "",
           "CompanyName": "",
           "Address1": "",
           "Address2": "",
           "City": "",
           "State": "",
           "PostalCode": "",
           "Country": "",
           "PhoneNumber": "" 
       }
   }
  
```
 
**callback ( err, result )**: 
 Accepts only function and is **required**
 Arguments passed: 
 - Error Object or *null* --> Note: Albeit the error object contains validation error info, it is not normalized therefore is not suitable to client side validation, suggested a client side validation
 - Result Object ( an object representing the raw response from the service intended for debugging use, remember that with the sole fact that the err argument is *null* is enough to know that the order was sent successfuly  note: if one item fails they the whole batch is aborted this is prologs response) 
 
 ----------

####warehouse.getTrackingStatus( orderNumberArray, callback );

######**Arguments**
**orderNumberArray**: 
 Accepts  'orderId' or [  'orderId',  'orderId', ... ] and is **required**
 
**callback ( err, result )**: 
 Accepts only function and is **required**
 Arguments passed: 
 - Error Object or *null*
 - Result is an array of Objects with following form:

 ```javascript
      {
              'OrderNumber': '...',
              'Status': '...',
              'ShippingService': '...',
              'Shipments': [
                {
                'Status': '...',
                'ShippedDate': DateTime,
                'Packages': [
                  {
                    'TrackingNumber': '...',
                    'ShippedDate': DateTime,
                    'Weight': '##.##',
                    'Cost' : '##.##'      
                  }
             ]
              }
         ]
       };
 
 
 ```
  
      
Important: 
 - If there aren't shipment then order.Shipments won't exist in the response 
 - If there aren't packages then order.Shipments.Packages won't exist neither 
 


 ----------
 
 ####warehouse.createASN( ASN, callback);
 
 ######**Arguments**
 **ASN**: 
  Accepts {ASN Object} **required**
  Expected ASN Object to be in this form:
 
 
 ```javascript

                {
                    "ASNNumber": "", // req
                    "PONumber": "",
                    "Notes": "",
                    "ExpectedDate": DateTime, // req
                    "Warehouse": "", // req
                    "Carrier": "", // req
                    "Lines": [{
                        "Sku": "", // req
                        "QuantityExpected": 0 // req
                    }]
                }
                


```
**callback ( err, result )**: 
 Accepts only function and is **required**
 Arguments passed: 
 - Error Object or *null*
 - Result is an array of Objects with following form:

 
```javascript
{
    "ProLogCode": "", 
    "ProLogMessage": ""
}



``` 

 
 

####warehouse.getASNStatus( type, asnNameString, callback );

######**Arguments**
**type**: 
 This Field tells the warehouse if the asn you are providing in the second argument is of type ASN or of type PO 
 Accepts  'ASN' or 'PO' and is **required**
 
**asn**: 
  Accepts  'Client ASN' or 'SC ASN' or 'Client PO' and is **required**
 
**callback ( err, result )**: 
 Accepts only function and is **required**
 Arguments passed: 
 - Error Object or *null*
 - Result Object with following form:

 
 ```javascript
 
    {
        "ASNNumber": "",
        "PONumber": "",
        "Status": "COMPLETE", // possible values: WORKING, EXPECTED, OPEN, COMPLETE, CANCELLED 
        "Notes": "",
        "Lines": [{
                "Sku": "",
                "Product": "",
                "QuantityExpected": 0,
                "QuantityReceived": 0,
                "QuantityStocked": 0
            }, {
                "Sku": "",
                "Product": "",
                "QuantityExpected": 0,
                "QuantityReceived": 0,
                "QuantityStocked": 0
            }]
    }

 ```



####warehouse.deleteOrder( OrderNumber, callback);
 
 ######**Arguments**
 **OrderNumber**: 
  Accepts String with the order number **required**
  Expected ASN Object to be in this form:
 
 
**callback ( err, result )**: 
 Accepts only function and is **required**
 Arguments passed: 
 - Error Object or *null*
 - Result is an array of Objects with following form:

```javascript
{
    "ProLogCode": "", //possible values: SUCCESS, AUTHENTICATION_FAILURE, INVALID_ARGS, INTERNAL_ERROR, ORDER_CANNOT_BE_FOUND, ORDER_CANNOT_BE_DELETED
    "ProLogMessage": ""
}
``` 
 ######**Addtional Notes**
 - This enpoint according to saddle creek customer service does not exist (and probably should not be used) but it's in the wsdl file and as seen in the testing it does in fact work.
 - Orders can only be deleted if they are still in the OPEN state.
 - Orders can't be deleted if they are staged. (probably haven't tested)
 



####warehouse.validate.Order(order);

######**Arguments**
 A superficial Validation (schema validation) see createOrder() for format
 ######**Arguments**
  
 **order**: 
   Accepts  order Object **required**
  
 **Returns**: 
  Either 'SUCCESS' or Array of issues 

 
 
 ####warehouse.validate.ASN(ASN);
 A superficial Validation (schema validation) see createASN() for format
 ######**Arguments**
  
 **ASN**: 
   Accepts  ASN Object **required**
  
 **Returns**: 
  Either 'SUCCESS' or Array of issues 
 
 
Implemented API Point (Based on the wsdl file)
-------
- [x] PLGetInventory
- [x] PLSubmitOrder
- [x] PLGetOrderStatus
- [x] PLSubmitASN
- [x] PLGetASNStatus

**The Following api points according to Saddle Creek Don't exist.**
***They are however disclosed in the wsdl file so ##USE AT YOUR OWN RISK##***

- [ ] PLCreateSKU
- [ ] PLGetSKUData
- [ ] PLCreateProduct
- [ ] PLUpdateOrder
- [x] PLDeleteOrder




Tests
-------
- [x] getInventoryStatus()
- [x] createOrders()
- [x] getTrackingStatus()
- [x] createASN()
- [x] getASNStatus()
- [x] deleteOrder()





