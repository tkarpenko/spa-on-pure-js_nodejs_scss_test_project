var express = require('express');
var data = require('jsonfile');
var config = require('../config');
// include Router middleware 
// to create modular mountable route handlers
// for /customers
var list = express.Router();
var validation = require('../validation');

/**
  ===========================================
  Routes to /customers
  ===========================================
*/
list.route('/')
  .get(function(request, response) {
    /* Start reading JSON */
    data.readFile( config.jsonDB, function(err, customers) {
      if (err) {
        return response.status(500).send({message:'Error with DB reading: '+err});
      }
     
      
      /* Checking is data.json is JSON file */
      try {
        var isJSON = JSON.parse( JSON.stringify( customers ) );
      } catch (parseErr) {
        console.log('Error with JSON format: ', parseErr);
      }


      /* If data.json file keeps uncorrect JSON format then response with error */
      if ( isJSON === undefined ) {
        return response.status(500).send({message:'Error with JSON format: '+err});
      }


      response.status(200).send(customers);    
    })
  });



list.route('/:id')
  .get(function(request, response) {

    /* Checking for correct URL parameter (customer's ID) */
    if ( (request.params.id).match(/^([0-9]+)$/) == null 
      || +request.params.id < 0 ) {
      return response.status(400).send('Not correct customer ID.');
    }


    /* Start reading JSON */
    data.readFile( config.jsonDB, function(err, customers) {
      if (err) {
        return response.status(500).send({message:'Error with DB reading: '+err});
      }


      /* Checking is data.json is JSON file */
      try {
        var isJSON = JSON.parse( JSON.stringify( customers ) );
      } catch (parseErr) {
        console.log('Error with JSON format: ', parseErr);
      }


      /* If data.json file keeps uncorrect JSON format then response with error */
      if ( isJSON === undefined ) {
        return response.status(500).send({message:'Error with JSON format: '+err});
      }


      var customer = customers[ +request.params.id ];
      

      /* Checking is there the customer in DB with required ID */
      if ( customer === undefined ) {
        return response.status(400).send({message:'No customer with ID=' + request.params.id + ' in DB.'});
      }


      /* Checking for validity of customer's data */
      if ( ! validation.isValidCustomerObj( customer ) ) {
        return response.status(500).send({message:'Customer data in DB is not valid.'});
      }


      /* Send Success response */
      response.status(200).send(customer);
    })
  });

module.exports = list;