var express = require('express');
var data = require('jsonfile');
var config = require('../config');
// include Router middleware 
// to create modular mountable route handlers
// for /customers/create
var create = express.Router();
var validation = require('../validation');


/**
  ===========================================
  Routes to /customers/create
  ===========================================
*/
create.route('/')
  .post(function(request, response) {

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


      /* Checking for validity of request data */
      if ( ! validation.isValidCustomerObj( reqCustomer ) ) {
        return response.status(400).send({message:'Requested data is not valid.'});
      }


      /* Prevent the duplication */
      if ( validation.isCustomerInDB( reqCustomer, dbCustomers ) ) {
        return response.status(400).send({message:'Info about this customer already exist in DB.'});
      }
      


      /* Save data */
      dbCustomers.push( reqCustomer );
      data.writeFile( config.jsonDB, dbCustomers);


      /* Send Success response */
      return response.status(200).send({message:"Customer's info with ID="+request.params.id+" was updated successfully."});
    })
  });

module.exports = create;