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
  })
  .value('version', '0.1');
  
 
  


