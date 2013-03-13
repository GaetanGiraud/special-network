'use strict';

/* Services */


// Registering REST resources

angular.module('CareKids.services', ['ngResource']).
  factory('User', function($resource){
    return $resource('api/users/:userId', {userId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }).
 factory('Location', function($resource){
    return $resource('api/locations/:locationId', {locationId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }).
  factory('Alert', function($rootScope) {

    // Types are linked to twitter bootstrap alert classes. Possible message types: 'success', 'error', 'info'. Others defaulft to standard alert.
    return {
      success: function(message) {
        $rootScope.alert = {msg: message, type: 'alert alert-success'};
      },
      error: function(message) {
        $rootScope.alert = {msg: message, type: 'alert alert-error'};
      },
      info: function(message) {
        $rootScope.alert = {msg: message, type: 'alert alert-info'};
      },
      warning: function(message) {
        $rootScope.alert = {msg: message, type: 'alert'};
      }
      
    };
  })
  .value('version', '0.1');
  
 
  


