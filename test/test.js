/**
 * Created by jonathansegev on 7/21/15.
 */
var should = require('should');
var util = require('util');
var warehouse = require('../lib/warehouse').settings({
    credentials: {

        SystemId: '999system',  // For testing use
        Password: 'prolog'      // For testing use
    },
    debugLogs: false  // Only use it during development or testing
});


describe('Warehouse.getInventoryStatus', function () {

    //get all products
    describe('#arguments(callback)', function () {
        it('should return the inventory levels of all skus up for clients with less then 2000 skus', function (done) {
            warehouse.getInventoryStatus(function (err, results) {
                if (err) return done(err);
                else {
                    try {
                        results.should.be.instanceof(Array); // the assertion
                        return done(); // if the assertion passes, the done will be called
                    } catch (err2) { // here we catch an error which assertion throws when it fails
                        return done(err2); // we need to call done(err2) to finish the test which failed
                    }

                }

            })

        });
    });

    //get for specific products
    describe('#arguments(["Product1", "TestSerial"], callback)', function () {
        it('should return the stock levels of sku\'s: Product1 & TestSerial', function (done) {
            warehouse.getInventoryStatus(["Product1", "TestSerial"], function (err, results) {
                if (err) return done(err);
                else {
                    try {
                        results.should.be.instanceof(Array).and.have.lengthOf(2); // the assertion
                        return done(); // if the assertion passes, the done will be called
                    } catch (err2) { // here we catch an error which assertion throws when it fails
                        return done(err2); // we need to call done(err2) to finish the test which failed
                    }

                }

            })

        });
    });


    //get for specific product
    describe('#arguments("Product1", callback)', function () {
        it('should return the stock level of the sku:Product1', function (done) {
            warehouse.getInventoryStatus('Product1', function (err, results) {
                if (err) return done(err);
                else {
                    try {
                        results.should.be.instanceof(Array).and.have.lengthOf(1); // the assertion
                        return done(); // if the assertion passes, the done will be called
                    } catch (err2) { // here we catch an error which assertion throws when it fails
                        return done(err2); // we need to call done(err2) to finish the test which failed
                    }

                }

            })

        });
    });


});


var sampleOrder1 = {
    OrderNumber: 'sampleOrder1' + Math.floor(Math.random() * 9999999),              // req
    OrderDate: '2008-05-07T12:00:00Z',                // req
    ShippingService: 'UPS Ground',          // req
    OrderLines: [{
            Product: 'Product1',              // req
            Quantity: 1              // req
        }],
    BillingAddress: {
        FirstName: 'Michael',              // req if not CompanyName
        LastName: 'Smith',
        CompanyName: 'XYZ, Inc.',            // req if not Name
        Address1: '1234 Simple Ave',               // req
        Address2: '#25',
        City: 'San Diego',                   // req
        State: 'CA',                  // req if shipping to USA address
        PostalCode: '92120',             // req
        Country: 'US',                // req
        PhoneNumber: '555-555-5555'
    },
    ShippingAddress: {
        FirstName: 'Michael',              // req if not CompanyName
        LastName: 'Smith',
        CompanyName: 'XYZ, Inc.',            // req if not Name
        Address1: '1234 Simple Ave',               // req
        Address2: '#25',
        City: 'San Diego',                   // req
        State: 'CA',                  // req if shipping to USA address
        PostalCode: '92120',             // req
        Country: 'US',                // req
        PhoneNumber: '555-555-5555'
    }
};


var sampleOrder2 = {
    OrderNumber: 'sampleOrder2' + Math.floor(Math.random() * 9999999),              // req
    OrderDate: '2008-05-07T12:00:00Z',                // req
    ShippingService: 'UPS Ground',          // req
    OrderLines: [{
        Product: 'Product1',              // req
        Quantity: 1              // req
    }],
    BillingAddress: {
        FirstName: 'Michael',              // req if not CompanyName
        LastName: 'Smith',
        CompanyName: 'XYZ, Inc.',            // req if not Name
        Address1: '1234 Simple Ave',               // req
        Address2: '#25',
        City: 'San Diego',                   // req
        State: 'CA',                  // req if shipping to USA address
        PostalCode: '92120',             // req
        Country: 'US',                // req
        PhoneNumber: '555-555-5555'
    },
    ShippingAddress: {
        FirstName: 'Michael',              // req if not CompanyName
        LastName: 'Smith',
        CompanyName: 'XYZ, Inc.',            // req if not Name
        Address1: '1234 Simple Ave',               // req
        Address2: '#25',
        City: 'San Diego',                   // req
        State: 'CA',                  // req if shipping to USA address
        PostalCode: '92120',             // req
        Country: 'US',                // req
        PhoneNumber: '555-555-5555'
    }
};


var sampleOrder3 = {
    OrderNumber: 'sampleOrder3'+ Math.floor(Math.random() * 9999999),              // req
    OrderDate: '2008-05-07T12:00:00Z',                // req
    ShippingService: 'UPS Ground',          // req
    OrderLines: [{
        Product: 'Product1',              // req
        Quantity: 1              // req
    }],
    BillingAddress: {
        FirstName: 'Michael',              // req if not CompanyName
        LastName: 'Smith',
        CompanyName: 'XYZ, Inc.',            // req if not Name
        Address1: '1234 Simple Ave',               // req
        Address2: '#25',
        City: 'San Diego',                   // req
        State: 'CA',                  // req if shipping to USA address
        PostalCode: '92120',             // req
        Country: 'US',                // req
        PhoneNumber: '555-555-5555'
    },
    ShippingAddress: {
        FirstName: 'Michael',              // req if not CompanyName
        LastName: 'Smith',
        CompanyName: 'XYZ, Inc.',            // req if not Name
        Address1: '1234 Simple Ave',               // req
        Address2: '#25',
        City: 'San Diego',                   // req
        State: 'CA',                  // req if shipping to USA address
        PostalCode: '92120',             // req
        Country: 'US',                // req
        PhoneNumber: '555-555-5555'
    }
};



describe('Warehouse.createOrder', function () {

    //create One Order products
    describe('#arguments(sampleOrder1, callback)', function () {
        it('should return success message or error message that order has been created', function (done) {
            warehouse.createOrders(sampleOrder1, function (err, results) {
                if (err) return done(err);
                else {
                    try {
                        results.should.be.instanceof(Array); // the assertion
                        results.should.be.instanceof(Array).and.have.lengthOf(1); // the assertion
                        return done(); // if the assertion passes, the done will be called
                    } catch (err2) { // here we catch an error which assertion throws when it fails
                        return done(err2); // we need to call done(err2) to finish the test which failed
                    }

                }

            })

        });
    });

    //create multiple Orders
    describe('#arguments([sampleOrder2, sampleOrder3], callback)', function () {
        it('should return success message or error message that order has been created', function (done) {
            warehouse.createOrders([sampleOrder2, sampleOrder3], function (err, results) {

                if (err) return done(err);
                else {
                    try {
                        results.should.be.instanceof(Array).and.have.lengthOf(2); // the assertion
                        return done(); // if the assertion passes, the done will be called
                    } catch (err2) { // here we catch an error which assertion throws when it fails
                        return done(err2); // we need to call done(err2) to finish the test which failed
                    }

                }

            })

        });
    });


});

