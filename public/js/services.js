'use strict';

/* Services */


// Registering REST resources

angular.module('CareKids.services', ['ngResource']).
  factory('User', function($resource){
    return $resource('api/users/:userId', {userId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }).
 factory('Location', ['$resource', function($resource){
    return $resource('api/locations/:locationId', {locationId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }]).
  factory('Alert', ['$rootScope', function($rootScope) {

     // refreshing the alert messages on page change
     $rootScope.$on('$routeChangeSuccess', function() {
       $rootScope.alert = '';
       $rootScope.modalAlert = '';
      });


    // Types are linked to twitter bootstrap alert classes. Possible message types: 'success', 'error', 'info'. Others defaulft to standard alert.
    return {
      success: function(message, type) {
        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert alert-success'};
        if (angular.isUndefined(type)) $rootScope.alert = {msg: message, type: 'alert alert-success'};
      },
      error: function(message, type) {
        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert alert-error'};
        if (angular.isUndefined(type)) $rootScope.alert = {msg: message, type: 'alert alert-error'};
      },
      info: function(message, type) {
        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert alert-info'};
        if (angular.isUndefined(type)) $rootScope.alert = {msg: message, type: 'alert alert-info'};
      },
      warning: function(message, type) {
        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert'};
        if (angular.isUndefined(type)) $rootScope.alert = {msg: message, type: 'alert'};
      }
    };
  }]).
  value('version', '0.1');
  
 
  


