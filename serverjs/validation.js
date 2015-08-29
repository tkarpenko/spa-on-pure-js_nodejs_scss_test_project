module.exports = {
  isValidCustomerObj : function( customer ) {
    if ( typeof customer !== 'object' ) return false;

    var _PATTERS = {
      name : /^([a-zA-Z\ ]){3,100}$/,
      email : /^([a-z0-9_\.-]+)@([a-z\.-]+)\.([a-z\.]{2,6})$/,
      telephone : /^((\+[0-9]{1,3})(\ \([0-9]{1,4}\))(\ [0-9-\ ]{2,11}))$/,
      state : /^([a-zA-Z\ ]){3,200}$/,
      city : /^([a-zA-Z\ ]{0,100})$/,
      street : /^([a-zA-Z0-9\ \.,;#\/-_]{1,500})$/,
      zip : /^([0-9]{5})$/
    };

    for ( var info in customer ) {
      if ( customer[ info ] instanceof Object ) {
        return this.isValidCustomerObj( customer[ info ] );

      } else if ( customer[ info ] === undefined || 
                 !_PATTERS[ info ].test( customer[ info ] ) ) {
        return false;
      }
    }

    return true;
  },

  isDuplication : function( reqCustomer, dbCustomer ) {
    if ( (typeof dbCustomer !== typeof reqCustomer ) &&
       ( (typeof reqCustomer !== 'object') || (typeof reqCustomer !== 'string') ) ) 
      return false;

    for ( var info in reqCustomer ) {
      if ( reqCustomer[ info ] instanceof Object   &&   dbCustomer[ info ] instanceof Object) {
        
        if ( ! this.isDuplication( reqCustomer[ info ], dbCustomer[ info ] ) ) {
          return false;
        }

      } else if ( reqCustomer[ info ] === undefined || 
                  dbCustomer[ info ]  === undefined  ||
                  reqCustomer[ info ] !== dbCustomer[ info ] ) {
        return false;
      }
    }
    return true;
  },

  isCustomerInDB : function(c, customers) {
    if ( c === undefined || customers === undefined ) return;
    if ( typeof customers !== typeof c && typeof c !== 'object' ) return;

    for ( var i = 0, len = customers.length; i < len; i++ ) {
      if ( this.isDuplication( c, customers[i] ) ) {
        return true;
      }
    }
    return false;
  }
};