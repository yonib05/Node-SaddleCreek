var soap = require('soap');
var JaySchema = require('jayschema');
var _ = require('underscore');
var util = require('util');
var path = require('path');


module.exports = function() { 

  // Default Settings
  var defaultSettings = { 
    uselocalWsdl: true, // if FALSE it fallbacks to remoteWsdl
    localWsdl: path.resolve( __dirname + '/ProWaresService.wsdl'),
    remoteWsdl: 'http://clientws.prolog3pl.com/ProWaresService.asmx?WSDL',
    credentials: {
      SystemId: '999system',  // For testing use '999system'
      Password: 'prolog'      // For testing use 'prolog'
    },
    debugLogs: false  // Only use it during development or testing
  };


  // Definitive settings
  var settings = defaultSettings;
  

  // Cache for Client
  var initedClient;

  // Expose methods
  return {

    settings: function( customSettings ){
      settings = _.extend( defaultSettings, customSettings || {} );
      return this;
    },





    getInventory: function ( productArray, callback){ 

      var productArrayInt = [];
      if(_.isArray( productArray )){
        productArrayInt = productArray;
      } else {
        var callback = productArray;
      }
        var argumentsToSend = {
        AllProducts: !productArrayInt.length,
        Products: { string: productArrayInt }
      };
      var propertiesToPick = [
       'ProLogProductId',
       'Product',
       'QuantityAvailable',
       'QuantityOnHand',
       'QuantityAllocated',
       'QuantityExpected',
       'QuantityFrozen'
       ];

       proLog('PLGetInventory', argumentsToSend, function( err, result ){
           if (err) {
               return callback(err)
           }
           var PLInventory = result.PLGetInventoryResult.Inventory.PLInventory;
        var ProLogCode = result.PLGetInventoryResult.ProLogCode;
        var productArrayToReturn = [];

        _.forEach(PLInventory, function( product ){
          productArrayToReturn.push(_.pick( product , propertiesToPick));
        });
        return callback(null, productArrayToReturn);
      });
    },



    sendOrderToWarehouse: function (orderOrOrderArray, callback){

      var orderArrayToSend = _.isArray( orderOrOrderArray ) ? orderOrOrderArray : [orderOrOrderArray];

      // Input Validation
      var validationErrors = [];
      _.forEach( orderArrayToSend, function( order ){
        var orderValidation = validateOrder( order ); // returns array of problems or 'SUCCESS'
        if( orderValidation !== 'SUCCESS' ){
          validationErrors.push({ OrderNumber: order.OrderNumber, ErrorList: orderValidation });
            console.error(orderValidation);
          return false;
        }
      });
      if( validationErrors.length ){
        return callback( new Error('PRE_VALIDATION_ERROR'), validationErrors );
      }
        // Prepare the argumentsToSend
      var argumentsToSend = {
        Orders: []
      };
      _.forEach( orderArrayToSend, function( order ){
        // 'OrderLines' remapping to match SOAP requirement
        var remappedOrderLines = [];
        _.forEach( order.OrderLines, function( orderLine ){
          remappedOrderLines.push( { 'PLOrderLine': orderLine });
        });
        order.OrderLines = remappedOrderLines;
        // Wrapping order itself into 'PLOrder'
        argumentsToSend.Orders.push({ PLOrder: order });
      });

      proLog('PLSubmitOrder', argumentsToSend, function( err, result ){
        if(err){
          return callback( err, result );
        }
          return callback(null, result);
      });
    },





    updateTracking: function ( orderNumberOrOrderNumberArray, callback){

      var arrayOfOrderNumbers = _.isArray( orderNumberOrOrderNumberArray ) ? orderNumberOrOrderNumberArray : [ orderNumberOrOrderNumberArray ];

      var argumentsToSend = {
        OrderNumbers: { string: arrayOfOrderNumbers }
      };

      var propertiesToPick_Order = [
       'ProLogOrderId',
       'OrderNumber',
       'Status',
       'ShippingService'
       ];

       var propertiesToPick_Shipment = [
       'ProLogShipmentId',
       'Status',
       'ShippedDate',
       'ShippingService'
       ];

       var propertiesToPick_Package = [
       'ProLogTrackingNumber',
       'TrackingNumber',
       'ShippedDate',
       'Weight',
       'Cost',
       'Contents'
       ];

       proLog('PLGetOrderStatus', argumentsToSend, function( err, result ){

        if(err) return callback( err ); 

        var ordersArray = result.PLGetOrderStatusResult.Orders.PLOrderStatusHeader;
        var orderArrayToReturn = [];

        _.forEach( ordersArray, function( order ){
          var orderToPush = _.pick( order , propertiesToPick_Order) || {};
          if( order.Shipments &&  order.Shipments.PLOrderStatusShipment){
            orderToPush.Shipments = [];
            var Shipments = order.Shipments.PLOrderStatusShipment;
            _.forEach( Shipments, function( shipment ){
              var shipmentToPush = _.pick( shipment , propertiesToPick_Shipment ) || {};
              if( shipment.Packages &&  shipment.Packages.PLOrderStatusPackage){
                shipmentToPush.Packages = [];
                var Packages = shipment.Packages.PLOrderStatusPackage;
                  _.forEach(Packages, function (shipPackage) {
                      shipmentToPush.Packages.push(_.pick(shipPackage, propertiesToPick_Package) || {});
                });
              }
                orderToPush.Shipments.push(shipmentToPush);
            });
          }
            orderArrayToReturn.push(orderToPush);
        });

        //debugLog( 'Inspecting -> orderArrayToReturn',  orderArrayToReturn );
        return callback(null, orderArrayToReturn);  
      });
    }


  }; 
  



  /*      Auxiliary functions       */


  function proLog( method, args, callback ){
    if(!initedClient){
      var url = settings.uselocalWsdl ? settings.localWsdl : settings.remoteWsdl;

      // Connecting to third party SOAP provider

      soap.createClient(url, function(err, client) {
        if(err){
          console.log('soaperr:', err );
          return callback( err );
        }
          initedClient = client;
        return executeMethod(initedClient);
      });
    }else{
      return executeMethod(initedClient);
    }
      // Async method execution
    function executeMethod( client ){

      var bodyTags = {};
      bodyTags.args = _.extend( {}, settings.credentials, args );

      
      client.on('request', function(xml){
        debugLog('New XML request to ProLog ProWaresService', xml);
      });

      // Also useful for dubugging:
      //console.log(  util.inspect(client.describe(), {depth: null} ) );
      //console.log( '\n body tags: ',bodyTags, '\n method: ', method );
      
      client[ method ]( bodyTags, function( err, result, raw, soapHeader ) {
        debugLog( method +' return values', { err: err, result: result } );
        if(err){
          return callback( err, result );
        }
          // Handle prolog error code -> ProLogCode
        var methodResult = result[ method + 'Result' ] || {};
        var proLogError = methodResult.ProLogCode !== 'SUCCESS' ? methodResult.ProLogCode : null; 
        
        return callback( proLogError, result, raw, soapHeader );
      });
    }
  }

    function debugLog(title, msg) {
    var msg = util.inspect( msg, {depth: null} );
    if ( settings.debugLogs ){
      console.log('\n    Warehouse Connector DEBUG log' +'\n  · ' + title + ':\n\n ',  msg, '\n' );
    }
    }

    function validateOrder(order) {

   var orderSchema = {
    "type": "object",
    "properties": {
      "OrderNumber":              { "type": "string" },   
      "CustomerPO":               { "type": "string" }, 
      "OrderDate":                { "type": "string", "format": "date-time" },   
      "AutoAllocate":             { "type": "boolean"},
      "ShippingService":          { "type": "string" },   
      "BillThirdParty":           { "type": "boolean"},
      "AccountNumber":            { "type": "string" },   // if BillThirdParty is true
      "EmailConfirmationAddress": { "type": "string" },   // * renamed key from 'customerEmail' 
      "OrderProcessingVariation": { "type": "string" },
      "Subtotal":                 { "type": "number" },
      "Shipping":                 { "type": "number" },
      "Discount":                { "type": "number" },  
      "Tax":                     { "type": "number" },  
      "Total":                   { "type": "number" },
      "OrderLines": {                                     // * renamed key from 'LineItems'
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
         "Product":             { "type": "string" },   
         "Quantity":            { "type": "integer"},   
         "Price":               { "type": "number" }
       },
       "required": [ 'Product', 'Quantity' ]
     }
   },                                     
   "BillingAddress": {
    "type": "object",
    "properties": {
            "FirstName":            { "type": "string" },    // if not CompanyName | * renamed key from 'Name'
            "LastName":             { "type": "string" }, 
            "CompanyName":          { "type": "string" },    // if not Name
            "Address1":             { "type": "string" },   
            "Address2":             { "type": "string" },
            "City":                 { "type": "string" },   
            "State":                { "type": "string" },    // if shipping to USA address
            "PostalCode":           { "type": "string" },   
            "Country":              { "type": "string" },   
            "PhoneNumber":          { "type": "string" }   // * renamed key from 'Phone'
          }
      },
        "ShippingAddress": {
          "type": "object",
          "properties": {
            "CompanyName":          { "type": "string" },    
            "Address1":             { "type": "string" },   
            "Address2":             { "type": "string" },
            "City":                 { "type": "string" },   
            "State":                { "type": "string" },    // if shipping to USA address
            "PostalCode":           { "type": "string" },   
            "Country":              { "type": "string" },   
            "PhoneNumber":          { "type": "string" }   // * renamed key from 'Phone'
          },
          "required": [ 'Address1', 'City', 'PostalCode', 'Country' ]
        }
      },
      "required": [ 'OrderNumber', 'OrderDate', 'ShippingService', 'OrderLines', 'ShippingAddress' ]
    };

    // First, check if the order pass the jsonSchema validation
    var js = new JaySchema();
    var schemaValidationProblemList = js.validate( order, orderSchema ); // returns an array of problems

    // Second, the validations through jsonSchema v0.4 Spec doesn't have a solution for "cross-conditional required properties" and we need exactly this, so next are these validations hardcoded



    if( order.BillThirdParty && !order.AccountNumber ){
      schemaValidationProblemList.push('AccountNumber is required if BillThirdParty is true.');
    }

    //billing info in not required
      //   if (!order.BillingAddress.FirstName && !order.BillingAddress.CompanyName) {
      // schemaValidationProblemList.push('BillingAddress: Either FirstName or CompanyName is required.');
      //   }
      //   if (!order.BillingAddress.State && _.contains(['US', 'USA', '840', 'ISO 3166-2:US', 'UNITED STATES'], order.BillingAddress.Country.toUpperCase())) {
      // schemaValidationProblemList.push('BillingAddress: State is required if shipping to US address.');
      //   }
      //

      if (!order.ShippingAddress.FirstName && !order.ShippingAddress.CompanyName) {
        schemaValidationProblemList.push('ShippingAddress: Either FirstName or CompanyName is required.');
      }
        if (!order.ShippingAddress.State && _.contains(['US', 'USA', '840', 'ISO 3166-2:US', 'UNITED STATES'], order.ShippingAddress.Country.toUpperCase())) {
      schemaValidationProblemList.push('ShippingAddress: State is required if shipping to US address.');
        }
        // If validation problems, return exposing them
    if( schemaValidationProblemList.length ){
      return schemaValidationProblemList;
    }
        // If no problems, well, no problems
    return 'SUCCESS';

    }
}();

