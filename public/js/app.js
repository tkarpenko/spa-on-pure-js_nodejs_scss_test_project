'use strict'

/*
* ==============================================
* Current Single Page Web App implements 
* the MVC Pattern.
* Model, which stores an application data model; 
* View, which renders Model for an appropriate representation; 
* and Controller, which  processes and responds to events, 
* invokes changes on the model and the view
* ==============================================
*/




/*
* ==============================================
* Event constructor implements the Mediator Pattern
* provides ability to communicate across the 
* different classes of an application
* ==============================================
*/
function Event(sender) {
  this._sender = sender;
  this._listeners = [];
}

Event.prototype = {
  attach : function (listener) {
    this._listeners.push(listener);
  },
  notify : function (args) {
    var index;

    for (index = 0; index < this._listeners.length; index += 1) {
        this._listeners[index](this._sender, args);
    }
  }
};



/* 
* ========================================= 
* Toggle Sidebar with navigation
* =========================================
*/
var navToggle = document.querySelector('#tt-sidebar-toggle');
navToggle.addEventListener( "click", function( e ) {
  document.querySelector('#tt-sidebar').classList.toggle('sidebar_open');
});


/* 
* ========================================= 
* Global patterns for validation
* =========================================
*/
var G_PATTERS = {
  oneFieldName : /^([a-z]{1,30})((\[)([a-z]{1,30})(\])+)?$/,
  oneRuleName : /^(validName|validEmail|validTelehone|validStreet|validCity|validState|validZip|required|minLength|maxLength|(minLength_([0-9]{1,4}))|(maxLength_([0-9]{1,4})))$/,
  rulesString : /^(((([a-z]{1})([a-zA-Z0-9_]{0,20}))\|+)*(([a-z]{1})([a-zA-Z0-9_]{0,20})))?$/,
  validName : /^([a-zA-Z\ ]{0,100})$/,
  validEmail : /^((([a-z0-9_\.-]+)@([a-z\.-]+)\.([a-z\.]{2,6}))|())$/,
  validTelehone : /^(((\+[0-9]{1,3})(\ \([0-9]{1,4}\))(\ [0-9-\ ]{2,11}))|())$/,
  validStreet : /^(([a-zA-Z0-9\ \.,;#\/-_]+)|())$/,
  validState : /^([a-zA-Z\ ]{0,70})$/,
  validCity : /^([a-zA-Z\ ]{0,50})$/,
  validZip : /^([0-9]{0,5})$/,
  onlyNumbers : /^([0-9]{1,5})$/,
  name : /^([a-zA-Z\ ]){3,100}$/,
  email : /^([a-z0-9_\.-]+)@([a-z\.-]+)\.([a-z\.]{2,6})$/,
  telephone : /^((\+[0-9]{1,3})(\ \([0-9]{1,4}\))(\ [0-9-\ ]{2,11}))$/,
  state : /^([a-zA-Z\ ]){3,200}$/,
  city : /^([a-zA-Z\ ]{0,100})$/,
  street : /^([a-zA-Z0-9\ \.,;#\/-_]{1,500})$/,
  zip : /^([0-9]{5})$/
};


/*
* =========================================
* Util function for checking init data
* that comes from UpdateController
*
* Init data has to have next format:
* {
*   ...
*   fieldName : 'validationRule1|validationRule2',
*   ...
* }
* =========================================
*/
function isCorrectInitData(fields) {
  for ( var name in fields ) {
    if ( ! G_PATTERS.rulesString.test( fields[name] ) ) {
      return false;
    }
  }
  return true;
}

/*
* =========================================
* Util function for recursive checking
* that all data in object with customer's info
* is valid
* =========================================
*/
function isValidCustomerObj( customer ) {
  // Checking incoming data
  if ( $.type(customer) !== 'string' && $.type(customer) !== 'object' ) return false;

  for ( var info in customer ) {
    if ( customer[ info ] instanceof Object ) {
      return isValidCustomerObj( customer[ info ] );

    } else if ( ! G_PATTERS[ info ].test( customer[ info ] ) ) {
      return false;
    }
  }

  return true;
}
