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
 
 ```javascript
    {
      OrderNumber: '',              // req
      CustomerPO: '', 
      OrderDate: '',                // req
      AutoAllocate: true||false,
      ShippingService: '',          // req
      BillThirdParty: true||false,
      AccountNumber: '',            // req if BillThidParty is true
      EmailConfirmationAddress: '', 
      OrderProcessingVariation: '',
      Subtotal: 0.00,
      Shipping: 0.00,
      Discount : 0.00,  
      Tax : 0.00,  
      Total : 0.00, 
      OrderLines: [                 // req 
        {
          Product: '',              // req (must be unique in the array one line per sku)
          Quantity: 0,              // req
          Price: 0.00
        }
      ],                        
      BillingAddress: {             //not required
        FirstName: '',              // req if not CompanyName 
        LastName: '', 
        CompanyName: '',            // req if not Name
        Address1: '',               // req
        Address2: '',
        City: '',                   // req
        State: '',                  // req if shipping to USA address
        PostalCode: '',             // req
        Country: '',                // req
        PhoneNumber: '',            
      },
      ShippingAddress: {
        CompanyName: '',            // req if not Name
        Address1: '',               // req
        Address2: '',
        City: '',                   // req
        State: '',                  // req if shipping to USA address
        PostalCode: '',             // req
        Country: '',                // req
        PhoneNumber: '',            
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
 
 
 ####warehouse.getASNStatus( ASNObj, callback );
 
 ######**Arguments**
  
 **ASNObj**:  
  - **Required**
  - Accepts a Javascript object like:
   
     ```javascript
    
     ```
    
  
 **callback ( err, result )**: 
  Accepts only function and is **required**
  Arguments passed: 
  - Error Object or *null*
  - Result Object with following form:
 
 
 TBD: Create Documentation
  

 

 
 
 

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


TODO: Create Documentation
 
 ```javascript

 ```




####warehouse.validate.Order(order);

######**Arguments**
 A superficial Validation (schema validation)
 ######**Arguments**
  
 **order**: 
   Accepts  order Object **required**
  
 **Returns**: 
  Either 'SUCCESS' or Array of issues 


TODO: Create Documentation
 
 ```javascript

 ```
 
 
 
 ####warehouse.validate.ASN(ASN);
 A superficial Validation (schema validation)
 ######**Arguments**
  
 **ASN**: 
   Accepts  ASN Object **required**
  
 **Returns**: 
  Either 'SUCCESS' or Array of issues 
 
 
 TODO: Create Documentation
  
  ```javascript
 
  ```




Tests
-------

TBD: Create tests
- [x] getInventoryStatus()
- [x] createOrders()
- [ ] getTrackingStatus()
- [ ] createASN()
- [ ] getASNStatus()