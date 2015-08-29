'use strict';

/* 
* ========================================================
* "Update" logic is implemented by 
* UpdateModel, UpdateView and UpdateController Classes.
* "Update-" Classes extend "Form-" Classes: FormModel, 
* FormView and FormController.
*
* So, "Update-" Classes manages form's behaviour,
* provide interaction with User and update existing data.
* ========================================================
*/


/*
* UpdateModel constructor inherits variable and Event objects
* from FormModel constructor for managing form's behaviour
*/
function UpdateModel(fields) {
  // Checking incoming data
  if ( ! isCorrectInitData( fields ) ) return;

  // Call the FormModel constructor
  // with CreateModel context  
  FormModel.call(this, fields);

  // Event signal of successful loading of data
  // from server. After this event the form's
  // fields will be filled by appropriate data
  // (UpdateView will worry about it)
  this.customerInfoLoaded = new Event();
}
/*
* UpdateModel Methods:
* consists of methods that are inherited from FormModel prototype
* and its own method for working exactly with Update Page
*/
UpdateModel.prototype = Object.create( FormModel.prototype );
UpdateModel.prototype.constructor = UpdateModel;

// Method loads data about customer with ID={id} 
UpdateModel.prototype.loadCustomerInfo = function(id) {
  // Checking incoming data
  if ( ! G_PATTERS.onlyNumbers.test(''+id) || id < 0 ) return;

  var _this = this;

  $.ajax({
    type : 'GET',
    url: "/customers/"+id,
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  })
  .done( function( customer ) {
    // Checking incoming data
    if ( ! isValidCustomerObj( customer ) ) return;

    // Fire up the event that data about customer
    // was loaded successfully
    _this.customerInfoLoaded.notify({ customer : customer });
  })
  .fail( function( response ) {
    console.log('fail:', response);
    window.location.href = '/';
  })
};

// Method update data about customer with ID={id} 
UpdateModel.prototype.updateItem = function(form, id) {
  // Checking incoming data
  if ( $.type(id) !== 'number' ||  +id < 0 ) return;
  if ( form.nodeName !== 'FORM' ) return;

  var formData = $(form).serializeArray(),
      customerJSON = {},
      _this = this;

  /*
  * Parse form data with recrsive parseForm()
  * that have:
  * incoming data: serialized form:
  * [
  *   {
  *     'name' : 'field1',
  *     'value' : 'value1'
  *   }
  *   {
  *     'name' : 'sect1[field2]',
  *     'value' : 'value2'
  *   }
  *   {
  *     'name' : 'sect1[sect2][field3]',
  *     'value' : 'value3'
  *   }
  *   {
  *     'name' : 'sect1[sect2][field4]',
  *     'value' : 'value4'
  *   }
  * ]
  * 
  * outcomint data: object
  * {
  *   'field1' : 'value1',
  *   'sect1' : {
  *     'field2' : 'value2',
  *     'sect2' : {
  *       'field3' : 'value3',
  *       'field4' : 'value4',
  *     }
  *   }
  * }
  *
  */
  customerJSON = this.parseForm( formData );

  // Checking data
  if ( ! isValidCustomerObj( customerJSON ) ) return false;

  // Send request to server for updating
  $.ajax({
    type: 'PUT',
    url: "/customers/update/" + id,
    data: JSON.stringify( customerJSON ),
    dataType: "json",
    contentType: "application/json; charset=utf-8"
  })
  .done( function() {
    window.location.href = '/';
  })
  .fail( function(err) {
    console.log('Error on server: ', err);
  });   
  return false;
};


// ======================================================


/*
* UpdateView constructor inherits variable and Event objects
* from FormView constructor for interaction with User
*/
function UpdateView(model, elements) {
  // Checking incoming data
  if ( model.constructor.name !== 'UpdateModel' ) return;
  if ( elements.form.nodeName !== 'FORM') return;

  // Call the FormView constructor 
  // with UpdateView context
  FormView.call(this, model, elements);
}
/*
* UpdateView Methods:
* consists of methods that are inherited from FormView prototype
* and its own method for working exactly with Update Page
*/
UpdateView.prototype = Object.create( FormView.prototype );
UpdateView.prototype.constructor = UpdateView;

/* fillFormWithData fill form's fields in HTML template
* with appropriate data.
*/
UpdateView.prototype.fillFormWithData = function(customer) {
  // Checking incoming data
  if ( ! isValidCustomerObj( customer ) ) return;

  var form = this._elements;

  // parse incoming data in a way
  // discribed over
  parseResponse( customer );

  // Update Class'es public variable 
  this._elements = form;

  /*
  * Util function for recursive parsing
  * of incoming data and save outcoming
  * data in variable 'form' from closure
  * incoming data:
  * {
      ...
  *   'field1' : 'value1',
  *   'sect1' : {
  *     'field2' : 'value2',
  *     'sect2' : {
  *       'field3' : 'value3',
  *       'field4' : 'value4',
  *     }
  *   },
  *   ...
  * }
  *
  * outcoming data: filled elements object:
  * {
  *   'field1' : 'value1',
  *   'sect1[field2]' : 'value2',
  *   'sect1[sect2][field3]' : 'value3',
  *   'sect1[sect2][field4]' : 'value4',
  * }
  */
  function parseResponse(customer, part) {
    // Checking incoming data
    if ( $.type(customer) !== 'string' && $.type(customer) !== 'object' ) return;

    var part = part || '',
        section,
        field;

    for ( var key in customer ) {
      if ( customer[key] instanceof Object ) {
        section = part === '' ? key : part + '['+key+']';
        parseResponse( customer[key], section );
      } else {
        field = part === '' ? key : part+'['+key+']';
        form[ field ].value = customer[ key ];
      }
    }
  }
};

/* setPageTitles fill HTML template with content for Update Page */
UpdateView.prototype.setPageTitles = function() {
  document.querySelector('.tt_title span').innerHTML = 'Update';
  this._elements.submitButton.innerHTML = 'Update';
  this._elements.submitButton.setAttribute('data-hover','Update');
};


// ======================================================


/*
* UpdateController constructor coordinate interaction
* between UpdateModel and UpdateView.
*
* UpdateController is the first what is created
* with getting URL to the Update Page (#/update/{id}).
* Then instances of CreateModel and CreateView are created within.
*
* UpdateController inherits logic of FormController
* and coordinate the Form's Classes (FormView and FormModel). 
*/
function UpdateController (params) {
  // Checking incoming data
  if ( ! G_PATTERS.onlyNumbers.test(params.id) ||  +params.id < 0 ) return;

  /* 
  * Setup and create all necessary variables: 
  */
  // Find all necessary HTML elements 
  var form = document.querySelector('form');
  var formElemets = $('form input, form select, form [type="submit"]');
  var viewElements = {};

  // Prepare init data for creating new instance of UpdateView Class
  viewElements['form'] = form;
  viewElements.fields = $('form input, form select');
  for ( var i = 0, len = formElemets.length; i < len; i++ ) {
    viewElements[ formElemets[i].name ] = formElemets[i];
  }

  // create new instance of UpdateModel Class
  // init data must be presented to CreateModel constructor
  // in object
  /* {
        ...
        'formFieldName' : 'validationRule1|validationRule2|...|validationRuleN',
        ...
      }
  */
  this._model = new UpdateModel({
    'name' : 'validName|required|minLength_3|maxLength_100',
    'email' : 'validEmail|required',
    'telephone' : 'validTelehone|maxLength_20',
    'address[state]' : 'validState|required',
    'address[city]' : 'validCity',
    'address[street]' : 'validStreet|required',
    'address[zip]' : 'validZip|minLength_4|required'
  });
  // create new instance of UpdateView Class
  this._view = new UpdateView(this._model, viewElements);


  // Call the FormController constructor 
  // with UpdateController context
  FormController.call(this);
  var _this = this;


  /* 
  * Events processing: 
  */
  // When formSubmited event fired then
  // ask UpdateModel to update data on server
  this._view.formSubmited.attach( function() {
    _this._model.updateItem( _this._view._elements.form, +params.id );
  });

  // When info about customer with ID=(/:id) have loaded 
  // from server then ask UpdateView to fill form's fields
  // in HTML template with appropriate data
  // and initialize the initial status of form's validity
  this._model.customerInfoLoaded.attach( function( sender, args ) {
    _this._view.fillFormWithData( args.customer );
    _this.validateForm();
  });
  

  /* 
  * From the very beginning set specific content to form's template 
  * and load info about customer with ID=(/:id) from server
  */
  this._view.setPageTitles();
  this._model.loadCustomerInfo( +params.id );
}
/*
* UpdateController Methods:
* All methods are inherited from FormController prototype
*/
UpdateController.prototype = Object.create( FormController.prototype );
UpdateController.prototype.constructor = UpdateController;
