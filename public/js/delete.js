'use strict';

/* 
* ========================================================
* "Delete" logic is implemented by 
* DeleteModel, DeleteView and DeleteController Classes.
*
* So, "Delete-" Classes provide ability 
* of deleting existing data.
* ========================================================
*/


/*
* DeleteModel constructor 
*/
var DeleteModel = function() {
  // Checking that "this" points to DeleteModel instance
  if ( ! (this instanceof DeleteModel ) ) {
    return new DeleteModel();
  }
};
/*
* DeleteModel Methods:
*/
DeleteModel.prototype.constructor = DeleteModel;
/* Method make request to server for deleting
info about customer with ID={id} */
DeleteModel.prototype.removeCustomer = function(id) {
  // Checking incoming data
  if ( typeof id !== 'number' || id < 0 ) return;
  if ( this._customers[ id ] === undefined ) return;

  var _this = this;

  $.ajax({
    type: "DELETE",
    url: "/customers/delete/" + id,
    data: JSON.stringify( this._customers[ id ] ),
    dataType: "json",
    contentType: "application/json; charset=utf-8"
  })
  .done( function () {
    // update list of customers
    _this.getCustomers();
  })
  .fail( function (err) {
    console.log('Error after delete request: ',err);
  });
};


// ======================================================


/*
* ListView constructor inherits Event object 
* from UpdateView constructor for 
* coordinating the deletion process
*/
var DeleteView = function(model, elements) {
  // Checking that "this" points to DeleteView instance
  if ( ! (this instanceof DeleteView ) ) {
    return new DeleteView();
  }
  // Checking incoming data
  if ( model.constructor.name !== 'ListModel' ) return;
  if ( ! elements.list ) return;

  /* 
  * Setup and create all necessary variables: 
  */
  this.deleteButtonClicked = new Event(this);
};
DeleteView.prototype.constructor = DeleteView;


// ======================================================


/*
* DeleteController constructor coordinate interaction
* between DeleteModel and DeleteView. 
*/
var DeleteController = function() {
  // Checking that "this" points to DeleteView instance
  if ( ! (this instanceof DeleteController ) ) {
    return new DeleteController();
  }

  var _this = this;
  
  /* 
  * Events processing: 
  */
  // When 'Delete Button' was clicked then
  // start deletion proccess
  this._view.deleteButtonClicked.attach(function(sender, args) {
    _this.delItem( +args.index );
  });
};
DeleteController.prototype.constructor = DeleteController;
DeleteController.prototype.delItem = function(index) {
  // Checking incoming data
  if ( typeof index !== 'number' || index < 0 ) return;

  var _this = this;

  // Hide item from in template
  this._view._elements.list.find( 'tr[data-index=' + index + ']' ).addClass('remove');
  // Wait some time till cs-animation is done and 
  // ask DeleteModel to remove info about customer
  // with ID={index} from DB
  setTimeout(function() {
    _this._model.removeCustomer( index );
  }, 500);
};