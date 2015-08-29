'use strict';

/* 
* ========================================================
* "List" logic is implemented by 
* ListModel, ListView and ListController Classes.
* "List-" Classes are extended by "Delete-" Classes: 
* DeleteModel, DeleteView and DeleteController.
*
* So, "Delete-" Classes presents the info about all customers
* and provide ability of deleting existing data.
* ========================================================
*/


/*
* ListModel constructor inherits variable
* from DeleteModel constructor for deleting 
* info about selected customer
*/
function ListModel() {
  this._customers = {};
  this.cusomersLoaded = new Event(this);

  // Call the DeleteModel constructor
  // with ListModel context  
  DeleteModel.call(this);
  
  var _this = this;
}
/*
* ListModel Methods:
* consists of methods that are inherited from DeleteModel prototype
* and its own method for loading info about all customers from server
*/
ListModel.prototype = Object.create( DeleteModel.prototype );
ListModel.prototype.constructor = ListModel;
ListModel.prototype.getCustomers = function() {
  var _this = this;
  
  $.ajax({
    type:        'GET',
    url:         '/customers',
    dataType:    'json',
    contentType: 'application/json; charset=utf-8'
  })
  .done( function( dbCustomers ) {
    // Checking incoming data
    try           { var customersJSON = JSON.parse( JSON.stringify( dbCustomers ) ); } 
    catch ( err ) { console.log('Error: wrong data have received from server.', err); }
    if ( customersJSON === undefined ) return;

    // Fire up the event that data about all customers
    // was loaded successfully
    _this.cusomersLoaded.notify({ customers : customersJSON });
  })
  .fail( function(response) {
    console.log('ajax failed: ',response);
    window.location.href = '/';
  }); 
};


// ======================================================


/*
* ListView constructor inherits Event object 
* from UpdateView constructor for 
* coordinating the deletion process
*/
function ListView(model, elements) {
  // Checking incoming data
  if ( model.constructor.name !== 'ListModel' ) return;
  if ( ! elements.list ) return;

  /* 
  * Setup and create all necessary variables: 
  */
  // Call the DeleteView constructor 
  // with ListView context
  DeleteView.call(this, model, elements);

  this._model = model;
  this._elements = elements;

  var _this = this;

  /* 
  * Events processing: 
  */
  // After clicking on the list got to check
  // on what node exactly event 'click' was fired up
  this._elements.list.click( function(e) {
    _this.parseClick(e);
  });
};
/*
* ListView Methods:
* consists of methods that are inherited from DeleteView prototype
* and its own methods
*/
ListView.prototype = Object.create( DeleteView.prototype );
ListView.prototype.constructor = ListView;
/* rebuildList build DOM structure of list 
and fill it with appropriate data */
ListView.prototype.rebuildList = function( customers ) {
  // Checking incoming data
  if ( $.type( customers ) !== 'array' ) return;

  var items, list, tr, td, div, button, href, text, icon, address;

  list = this._elements.list;
  list.html('');

  items = this._model._customers = customers;

  if ( items.length == 0 ) {
    tr = document.createElement('tr');
    td = document.createElement('td');
    td.setAttribute('colspan', 5);
    div = document.createElement('div');
    div.innerHTML = "There is no data about customers in the database";
    td.appendChild(div);
    tr.appendChild(td);
    list[0].appendChild(tr);
    return;
  }

  for (var i = 0, len = items.length; i < len; i++) {
    address = items[i].address.state+', '+items[i].address.city+', '+items[i].address.street+'; '+items[i].address.zip;
    tr = document.createElement('tr');
    tr.setAttribute('data-index', i);

    td = document.createElement('td');
    div = document.createElement('div');
    text = document.createTextNode( items[i].name );
    div.appendChild(text);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    div = document.createElement('div');
    text = document.createTextNode( items[i].email );
    div.appendChild(text);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    div = document.createElement('div');
    text = document.createTextNode( items[i].telephone );
    div.appendChild(text);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    div = document.createElement('div');
    text = document.createTextNode( address );
    div.appendChild(text);
    td.setAttribute('title', address);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    div = document.createElement('div');

    button = document.createElement('button');
    button.setAttribute('type', 'button');
    icon = document.createElement('i');
    icon.setAttribute('class', 'glyphicon glyphicon-trash');
    button.appendChild(icon);

    href = document.createElement('a');
    href.setAttribute('href', '#/update/'+i);
    icon = document.createElement('i');
    icon.setAttribute('class', 'glyphicon glyphicon-pencil');
    href.appendChild(icon);

    div.appendChild(button);
    div.appendChild(href);
    td.appendChild(div);
    tr.appendChild(td);

    list[0].appendChild(tr);
  }
};
/* Checking what node exactly was clicked by User */
ListView.prototype.parseClick = function(e) {
  // Checking incoming data
  if ( e.target.nodeName !== 'BUTTON' && e.target.parentNode.nodeName !== 'BUTTON' ) return;

  var parentTr;
  // If User clicked on "Delete Button" then
  // fire up the event with number of current record
  parentTr = $(e.target).closest('tr');
  this.deleteButtonClicked.notify({ index : parentTr.attr('data-index') }); 
};


// ======================================================


/*
* ListController constructor coordinate interaction
* between ListModel and ListView.
*
* ListController is the first what is created
* with getting URL to the Home Page (#/).
* Then instances of ListModel and ListView are created within.
*
* ListController inherits logic of DeleteController
* and coordinate the Delete's Classes (DeleteView and DeleteModel). 
*/
function ListController () {
  /* 
  * Setup and create all necessary variables: 
  */
  // create new instances of List Classes
  this._model = new ListModel();
  this._view = new ListView(this._model, {
    list : $('#tt-list')
  });

  // Call the DeleteController constructor 
  // with ListController context
  DeleteController.call(this);

  var _this = this;

  /* 
  * Events processing: 
  */
  // When info about all customers have loaded 
  // from server then ask ListView to build HTML tags
  // and fill it with data
  this._model.cusomersLoaded.attach( function( sender, args ) {
    _this._view.rebuildList( args.customers );
  });

  /* 
  * From the very beginning ask ListModel to get 
  * customers info from server
  */
  this._model.getCustomers();
}
/*
* ListController Methods:
* All methods are inherited from DeleteController prototype
*/
ListController.prototype = Object.create( DeleteController.prototype );
ListController.prototype.constructor = ListController;
