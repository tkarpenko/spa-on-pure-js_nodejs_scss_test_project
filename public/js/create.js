'use strict';

/* 
* ========================================================
* "Create" logic is implemented by 
* CreateModel, CreateView and CreateController Classes.
* "Create-" Classes extend "Form-" Classes: FormModel, 
* FormView and FormController.
*
* So, "Create-" Classes manages form's behaviour,
* provide interaction with User and save new data.
* ========================================================
*/


/*
* CreateMadel constructor inherits variable and Event objects
* from FormModel constructor for managing form's behaviour
*/
function CreateModel(fields) {
  // Checking incoming data
  if ( ! isCorrectInitData( fields ) ) return;

  // Call the FormModel constructor
  // with CreateModel context 
  FormModel.call(this, fields);
}
/*
* CreateModel Methods:
* All methods are inherited from FormModel prototype
*/
CreateModel.prototype = Object.create( FormModel.prototype );
CreateModel.prototype.constructor = CreateModel;

// Method save new data
CreateModel.prototype.saveItem = function(form) {
  // Checking incoming data
  if ( form.nodeName !== 'FORM' ) return;

  var formData = $(form).serializeArray(),
      customerJSON = {};

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

  // Send request to server for saving
  $.ajax({
    type: 'POST',
    url: "/customers/create",
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
* CreateView constructor inherits variable and Event objects
* from FormView constructor for interaction with User
*/
function CreateView(model, elements) {
  // Checking incoming data
  if ( model.constructor.name !== 'CreateModel' ) return;
  if ( elements.form.nodeName !== 'FORM') return;

  // Call the FormView constructor 
  // with CreateView context
  FormView.call(this, model, elements);
}
/*
* CreateView Methods:
* consists of methods that are inherited from FormView prototype
* and its own method for working exactly with Create Page
*/
CreateView.prototype = Object.create( FormView.prototype );
CreateView.prototype.constructor = CreateView;

/* setPageTitles fill HTML template with content for Create Page */
CreateView.prototype.setPageTitles = function() {
  document.querySelector('.tt_title span').innerHTML = 'Create';
  this._elements.submitButton.innerHTML = 'Create';
  this._elements.submitButton.setAttribute('data-hover','Create');
};


// ======================================================

/*
* CreateController constructor coordinate interaction
* between CreateModel and CreateView.
*
* CreateController is the first what is created
* with getting URL to the Create Page (#/create).
* Then instances of CreateModel and CreateView are created within.
*
* CreateController inherits logic of FormController
* and coordinate the Form's Classes (FormView and FormModel).
*/
function CreateController () {
  /* 
  * Setup and create all necessary variables: 
  */
  // Find all necessary HTML elements 
  var form = document.querySelector('form');
  var formElemets = $('form input, form select, form [type="submit"]');
  var viewElements = {};

  // Prepare init data for creating new instance of CreateView Class
  viewElements['form'] = form;
  viewElements.fields = $('form input, form select');
  for ( var i = 0, len = formElemets.length; i < len; i++ ) {
    viewElements[ formElemets[i].name ] = formElemets[i];
  }

  // create new instance of CreateModel Class
  // init data must be presented to CreateModel constructor
  // in object
  /* {
        ...
        'formFieldName' : 'validationRule1|validationRule2|...|validationRuleN',
        ...
      }
  */
  this._model = new CreateModel({
    'name' : 'validName|required|minLength_3|maxLength_100',
    'email' : 'validEmail|required',
    'telephone' : 'validTelehone|maxLength_20',
    'address[state]' : 'validState|required',
    'address[city]' : 'validCity',
    'address[street]' : 'validStreet|required',
    'address[zip]' : 'validZip|minLength_4|required'
  });
  // create new instance of CreateView Class
  this._view = new CreateView(this._model, viewElements);


  // Call the FormController constructor 
  // with CreateController context
  FormController.call(this);
  var _this = this;

  /* 
  * Events processing: 
  */
  // When formSubmited event fired then
  // ask CreateModel to save new data
  this._view.formSubmited.attach( function() {
    _this._model.saveItem( _this._view._elements.form );
  });


  /* 
  * From the very beginning set specific content to form's template 
  * and initialize the initial status of form's validity
  */
  this._view.setPageTitles();
  this.validateForm();
}
/*
* CreateController Methods:
* All methods are inherited from FormController prototype
*/
CreateController.prototype = Object.create( FormController.prototype );
CreateController.prototype.constructor = CreateController;

