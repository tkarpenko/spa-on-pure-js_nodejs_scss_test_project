'use strict';

/* 
* ========================================================
* Router constructor implements the Module Pattern.
* Router loads appropriate template and creates instance
* of appropriate controller for specific URL.
*
* Router maintain routes in format: 
* #/route1[/:param1[/route2[/route3[/:param2[]]]]]
* ========================================================
*/
var Router = ( function() {

  var _routes = {},
      _view = null,
      _PATTERNS = {
        path:  /^(\/?([a-z0-9-\/\:])+)$/,
        url:   /^(\/?([a-z0-9-\/])+)$/,
        param: /\/:([a-z0-9_-]{1,16})/g,
        slug: '\\/[a-z0-9_-]{1,16}'
      };


  // Method for setting up new route
  function add(path, action) {
    // Checking incoming data
    if ( path.match(_PATTERNS.path) == null ) return;
    if ( $.type(action.template)   !== 'string' ||
         $.type(action.controller) !== 'function' ) return;

    _routes[path] = action;
  }

  // Method loads appropriate template and creates instance
  // of appropriate controller
  function run() {
    var url = location.hash.slice(1) || '/',
        route;

    _view = _view || $('#tt-view');

    route = getRoute(url);

    if (_view && route.controller) {
      _view.load( route.template, function() {
        route.params ? new route.controller(route.params) : new route.controller();
      });
    }
  }

  // Private Method return template and controller 
  // for spacific URL
  function getRoute(url) {
    // Checking incoming data      
    if ( url.match(_PATTERNS.url) == null ) return;
    
    var path,
        pathWithParams;

    if ( _routes[url] ) { return _routes[url]; } 


    for ( path in _routes ) {
    
      if ( ~path.indexOf(':') ) {
        pathWithParams = new RegExp( path.replace(_PATTERNS.param, _PATTERNS.slug) );

        if ( url.match( pathWithParams ) ) {
          Object.defineProperty( _routes[path], 'params', {
            value:        getRouteParams(path, url),
            writable:     true,
            configurable: true
          });

          return _routes[path];
        }
      } 
    }
    window.location.href = '/';
    return;
  }

  /* Private method returns object with params values
  * for instance: 
  * 
  * incoming data:
  * path = #/part1/:param1/part2/:param2
  * url = #/part1/5/part2/8
  *
  * outcoming data:
  * {
  *   'param1' : 5,
  *   'param2' : 8
  * }
  */
  function getRouteParams(path, url) {
    // Checking incoming data   
    if ( path.match(_PATTERNS.path) == null ) return;
    if ( url.match(_PATTERNS.url) == null ) return;

    var pathParts = path.split('/'),
        urlParts  = url.split('/'),
        params    = {},
        paramName,
        paramValue;

    for (var i = 1, len = pathParts.length; i < len; i++) {

      if ( ~pathParts[i].indexOf(':') ) {

        paramName  = pathParts[i].slice(1);
        paramValue = urlParts[i];
        params[paramName] = paramValue;
      }
    }

    return params;
  }

  return {
    add : add,
    run : run
  };

})();


// =======================================


/*
* App routes:
*/
;(function() {
  
  Router.add('/', {
    template: 'partials/list.html', 
    controller: ListController
  });
  Router.add('/create', {
    template: 'partials/form.html', 
    controller: CreateController
  });
  Router.add('/update/:id', {
    template: 'partials/form.html',
    controller: UpdateController
  });
  
  window.addEventListener('hashchange', function(){ Router.run(); });
  window.addEventListener('load', function(){ Router.run(); });
})();