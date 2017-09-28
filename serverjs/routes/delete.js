var express = require('express');
var data = require('jsonfile');
var config = require('../config');

// include Router middleware 
// to create modular mountable route handlers
// for /customers/delete
var remove = express.Router();
var validation = require('../validation');

/**
  ===========================================
  Routes to /customers/delete
  ===========================================
*/
remove.route('/:id')
  .delete(function(request, response) {
    // console.log(request);
    /* Checking for correct URL parameter (customer's ID) */
    if ( (request.params.id).match(/^([0-9]+)$/) == null 
      || +request.params.id < 0 ) {
      return response.status(400).send({message:'Not correct customer ID.'});
    }


    /* Start reading JSON */
    data.readFile( config.jsonDB, function(err, customers) {
      if (err) {
        return response.status(500).send({message:'Error with DB reading: '+err});
      }


      /* Checking is data.json is JSON file */
      try {
        var dbCustomers = JSON.parse( JSON.stringify( customers ) );
      } catch (parseErr) {
        console.log('Error with JSON format: ', parseErr);
      }
      /* If data.json file keeps uncorrect JSON format then response with error */
      if ( dbCustomers === undefined ) {
        return response.status(500).send({message:'Error with JSON format'});
      }


      /* Checking the request data format: is it correct JSON */
      try {
        var reqCustomer = JSON.parse( JSON.stringify( request.body ) );
      } catch (parseErr) {
        console.log('Error with JSON format: ', parseErr);
      }
      /* If request data has uncorrect format then response with error */
      if ( reqCustomer === undefined ) {
        return response.status(400).send({message:'Error with request JSON format'});
      }


      var customer = dbCustomers[ +request.params.id ];

      /* Checking is there the customer in DB with required ID */
      if ( customer === undefined ) {
        return response.status(400).send({message:'No customer with ID=' + request.params.id + ' in DB.'});
      }


      /* Checking for validity of request data */
      if ( ! validation.isValidCustomerObj( reqCustomer ) ) {
        return response.status(400).send({message:'Requested data is not valid.'});
      }


      /* Checking for existence of info about requested customer */
      if ( ! validation.isDuplication( reqCustomer, customer ) ) {
        return response.status(400).send({message:'There is no info about requested customer in DB.'});
      }


      /* Delete info about requested customer */
      dbCustomers.splice(+request.params.id, 1);
      data.writeFile( config.jsonDB, dbCustomers);

      response.status(200).send({message:"Customer's info with ID="+request.params.id+" was removed successfully."});
    })
  });

module.exports = remove;