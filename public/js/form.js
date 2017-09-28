'use strict';

/* 
* ========================================================
* "Form" logic is implemented by 
* FormModel, FormView and FormController Classes.
*
* So, "Form-" Classes presents the info about all customers
* and provide ability of deleting existing data.
* ========================================================
*/
var FormModel = function(fields) {
  // Checking that "this" points to FormModel instance
  if ( ! (this instanceof FormModel ) ) {
    return new FormModel( fields );
  }
  // Checking incoming data
  if ( ! isCorrectInitData( fields ) ) return;
  
  /* 
  * FieldValidation is private constructor.
  * Each form's field is the FieldValidation instance 
  *
  * provides methods for validation specific field of form 
  * and for signaling of error's appearance or disappearance
  */
  var FieldValidation = function(field, rules) {
    // Checking incoming data
    if ( ! field || ! G_PATTERS.rulesString.test( rules ) ) return;

    this._field = field,
    this._rules = rules === '' ? [] : rules.split('|');
  };
  /*
  * FieldValidation Methods:
  */
  FieldValidation.prototype = {
    // Validate field by all validation rules
    validate : function(val) {
      // Checking incoming data
      if ( $.type(val) !== 'string' ) return;

      var rule, 
          validValue,
          fieldIsValid,
          fieldHaveError;

      // Checking each validation rule. Rules were setted
      // up in controller in text format:
      /* {
        ...
        'formFieldName' : 'validationRule1|validationRule2|...|validationRuleN',
        ...
      }
      */ 
      for ( var i = 0, len = this._rules.length; i < len; i++ ) {
        if ( this._rules[i].indexOf('_') !== -1 ) {
          validValue = +this._rules[i].split('_')[1];
        } 
        rule = this._rules[i].split('_')[0];

        fieldIsValid = this[rule]( val, validValue );
        fieldHaveError = _errors[ this._field ].indexOf( this._rules[i] ) !== -1;

        if ( fieldIsValid && fieldHaveError  ) {
          this.removeError( this._rules[i] );
        }
        if ( !fieldIsValid && !fieldHaveError ) {
          this.addError( this._rules[i] );
        }
      }
    },


    removeError : function(rule) {
      // Checking incoming data
      if ( ! G_PATTERS.oneRuleName.test( rule ) ) return;

      var index = _errors[this._field].indexOf(rule);

      _errors[this._field].splice( index, 1 );
      _errors.count--;

      // Fire up event for the View to hide specific error
      // message for specific field in template
      // and provides info is there any errors
      // for current specific field
      _form.validFieldRule.notify({
        field : this._field,
        errorType : rule.split('_')[0],
        isValidField : !_errors[this._field].length
      });
    },


    addError : function(rule) {
      // Checking incoming data
      if ( ! G_PATTERS.oneRuleName.test( rule ) ) return;
      
      _errors[this._field].push( rule );
      _errors.count++;

      // Fire up event for the View to show specific error
      // message for specific field in template
      // and provides info that there is at least
      // one error on current specific field
      _form.invalidFieldRule.notify({
        field : this._field,
        errorType : rule.split('_')[0],
        isValidField : false
      });
    },


    validName : function(val) {
      return G_PATTERS.validName.test( val );
    },
    validEmail : function(val) {
      return G_PATTERS.validEmail.test( val );
    },
    validTelehone : function(val) {
      return G_PATTERS.validTelehone.test( val );
    },
    validStreet : function(val) {
      return G_PATTERS.validStreet.test( val );
    },
    validState : function(val) {
      return G_PATTERS.validState.test( val );
    },
    validState : function(val) {
      return G_PATTERS.validState.test( val );
    },
    validCity : function(val) {
      return G_PATTERS.validCity.test( val );
    },
    validZip : function(val) {
      return G_PATTERS.validZip.test( val );
    },
    required : function(val) {
      if ( $.type( val ) !== 'string' ) return false;

      return val !== '';
    },
    minLength : function(val, minLen) {
      if ( $.type( val ) !== 'string' ||
           $.type( minLen ) !== 'number' || minLen < 0) return false;

      return (val.length > minLen);
    },
    maxLength : function(val, maxLen) {
      if ( $.type( val ) !== 'string' ||
           $.type( maxLen ) !== 'number' || maxLen < 0) return false;

      return val.length < maxLen;
    }
  };
  FieldValidation.prototype.constructor = FieldValidation;


  /* 
  * Setup and create all necessary variables: 
  */
  var _errors = {};
  this._formIsValid;
  this._fields = initFields( fields );

  this.invalidFieldRule = new Event();
  this.validFieldRule = new Event();
  this.invalidForm = new Event();
  this.validForm = new Event();

  var _form = this;

  // Method check vaidity of all form
  this.validateForm = function() {
    this._formIsValid = this._formIsValid !== undefined ? this._formIsValid : !_errors.count == 0;

    if ( _errors.count == 0 && !this._formIsValid ) {
      this._formIsValid = true;
      this.validForm.notify();
    } 
    else if ( _errors.count > 0 && this._formIsValid ) {
      this._formIsValid = false;
      this.invalidForm.notify();
    }
  };

  // Util function for start initialization of public variables
  function initFields(fields) {
    // Checking incoming data
    if ( ! isCorrectInitData( fields ) ) return;

    var _fields = {};

    for ( var name in fields ) {
      _errors[name] = [];
      _fields[name] = new FieldValidation( name, fields[name] );
    }
    _errors['count'] = 0;

    return _fields;
  }
}
FormModel.prototype.constructor = FormModel;
/*
* Method implement the recursive parsing
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
FormModel.prototype.parseForm = function(formData) {
  var json = {},
      field,
      partsLen;

  for ( var i = 0, formLen = formData.length; i < formLen; i++ ) {
    if ( formData[i].name.indexOf('[') == -1 ) {
      json[ formData[i].name ] = formData[i].value;
      continue;
    } 

    field = formData[i].name.split('[');
    partsLen = field.length;
    json = parseSection( json, 0 );
  }

  function parseSection(section, j) {
    if ( ! (typeof j === 'number') || ( j < 0 ) || $.type(section) !== 'object' ) 
      return {};

    var part = field[j].split(']')[0];

    if ( j == partsLen-1 ) {
      section[ part ] = formData[i].value;
      return section;
    }

    if ( section[ part ] === undefined ) {
      section[ part ] = {};
    }
    section[ part ] = parseSection( section[ part ], j+1 );
    
    return section;
  }

  return json;
};


// ======================================================


/*
* FormView constructor provides variables
* and events for interaction with user
*/
var FormView = function(model, elements) {
  // Checking that "this" points to FormView instance
  if ( ! (this instanceof FormView ) ) {
    return new FormView(model, elements);
  }
  // Checking incoming data
  if ( model.constructor.name !== 'UpdateModel' &&
       model.constructor.name !== 'CreateModel' ) return;

  if ( elements.form.nodeName !== 'FORM') return;


  /* 
  * Setup and create all necessary variables: 
  */
  this._model = model;
  this._elements = elements;
  this.fieldChanged = new Event(this);
  this.formSubmited = new Event(this);

  var _this = this;


  /* 
  * Events processing: 
  */
  this._model.invalidFieldRule.attach( function( sender, args ) {
    _this.toggleError( args.field, args.errorType, args.isValidField );
  });

  this._model.validFieldRule.attach( function( sender, args ) {
    _this.toggleError( args.field, args.errorType, args.isValidField );
  });

  this._model.invalidForm.attach( function() {
    _this.disableForm();
  });

  this._model.validForm.attach( function() {
    _this.enableForm();
  });


  this._elements.fields.on( 'focus', function(e) {
    _this.toggleTooltip( e.target.name ); 
  });

  this._elements.fields.on( 'blur', function(e) {
    _this.toggleTooltip( e.target.name ); 
  });

  this._elements.fields.on( 'input', function(e) {
    _this.touchFieldset( e.target.name, e.target.value );
  });

  this._elements.form.onsubmit = function(e) {
    _this.formSubmited.notify();
    return false;
  };
};
/*
* FormView Methods:
*/
FormView.prototype.constructor = FormView;
FormView.prototype.toggleError = function(field, error, isValidField) {
  if ( ! G_PATTERS.oneFieldName.test( field ) ) return;
  if ( ! G_PATTERS.oneRuleName.test( error ) ) return;
  if ( typeof isValidField !== 'boolean' ) return;

  if ( ! isValidField ) {
    this._elements[ field ].parentNode.classList.add('invalid');
    this._elements[ field ].parentNode.classList.remove('valid');
  } else {
    this._elements[ field ].parentNode.classList.remove('invalid');
    this._elements[ field ].parentNode.classList.add('valid');
  }

  this._elements[ field ].parentNode.querySelector('.tt_form .errors .' + error).classList.toggle('show');
};

FormView.prototype.toggleTooltip = function(field) {
  if ( ! G_PATTERS.oneFieldName.test( field ) ) return;
  this._elements[ field ].parentNode.querySelector('.tt_tooltip').classList.toggle('tooltip_show');
};
FormView.prototype.disableForm = function() {
  this._elements.submitButton.setAttribute('disabled','disabled');
  this._elements.submitButton.parentNode.querySelector('.tt_tooltip').classList.add('tooltip_show');
};
FormView.prototype.enableForm = function() {
  this._elements.submitButton.removeAttribute('disabled');
  this._elements.submitButton.parentNode.querySelector('.tt_tooltip').classList.remove('tooltip_show');
};
FormView.prototype.touchFieldset = function(field, value) {
  if ( $.type(value) !== 'string' || ! G_PATTERS.oneFieldName.test( field ) ) return;

  this._elements[ field ].parentNode.classList.add('dirty');
  this.fieldChanged.notify({
    field : field,
    value : value
  }); 
};


// ======================================================


/*
* FormController constructor coordinate interaction
* between FormModel and FormView.
*/
var FormController = function() {
  // Checking that "this" points to FormController instance
  if ( ! (this instanceof FormController ) ) {
    return new FormController();
  }

  var _this = this;

  /* 
  * Events processing: 
  */
  // If User change something in any form's field
  // then ask model to validate this field and all form
  this._view.fieldChanged.attach( function( sender, args ) {
    _this._model._fields[ args.field ].validate( args.value );
    _this._model.validateForm();
  });
};
/*
* FormController Methods:
*/
FormController.prototype.constructor = FormController;
// Method calls from the very beginning, 
// before any changes 
FormController.prototype.validateForm = function() {
  var value;

  for ( var name in this._model._fields ) {
    value = this._view._elements[ name ].value;
    this._model._fields[ name ].validate( value );
  }

  this._model.validateForm();
};