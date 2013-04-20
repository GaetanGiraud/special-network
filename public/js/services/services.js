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
  factory('Child', ['$resource', function($resource){
    return $resource('api/children/:childId', {childId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }]).
  factory('Discussion', ['$resource', function($resource){
    return $resource('api/discussions/:discussiondId', {discussiondId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }]).
  factory('Tag', ['$resource', function($resource){
    return $resource('api/tags/:tagId', {tagId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }]).
  factory('Question', ['$resource', function($resource){
    return $resource('api/questions/:questionId', {questionId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }]).
  factory('Message', ['Socket', '$http', '$rootScope', function(Socket, $http, $rootScope){
    var page =1;
      $rootScope.$on('$routeChangeSuccess', function() {
        page = 1;
      });  
      
    return { 
       query: function(callback) {
         if (angular.isUndefined(callback)) var callback = function(err, data) {} ;
         
         $http.get('api/messages', { params: {page: page}}).success(function(data) {
            page ++;
            console.log(data);
            return callback(null, data);
         }).error(function(err) {
           return callback(err, null);
         })
       },
       getUnreadMessagesCount: function(callback) {
         $http.get('api/messages/count').success(function(data) {
           
            return callback(null, data);
         }).error(function(err) {
           return callback(err, null);
         })
       },
       send: function(newMessage) {
          Socket.socket().emit('messageCreated', newMessage);
          return;
       },
       update: function(message, data, callback) {
         if (angular.isUndefined(callback)) var callback = function(err, data) {} ;
         
         $http.put('api/messages/' + message._id, data).
         success(function(data) {
            return callback(null, data);
         }).error(function(err) {
           return callback(err, null);
         })
       },
       reply: function(reply, messageId) {
         Socket.socket().emit('replyAdded', { 'reply': reply, 'messageId': messageId});
         return;
       }
    }
  }]).
  factory('Albums', function() {
    
    
    
  }).
  factory('Alert', ['$rootScope', '$anchorScroll', '$location', function($rootScope, $anchorScroll, $location) {

     // refreshing the alert messages on page change
    /* $rootScope.$on('$routeChangeSuccess', function() {
       $rootScope.alert = '';
       $rootScope.modalAlert = '';
      });
    */

    // Types are linked to twitter bootstrap alert classes. Possible message types: 'success', 'error', 'info'. Others defaulft to standard alert.
    return {
      success: function(message, type) {

        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert alert-success'};
        if (angular.isUndefined(type)) {
           $rootScope.alert = {msg: message, type: 'alert alert-success'};
           $location.hash('banner');
           $anchorScroll();
          // $location.hash('');
          }
      },
      error: function(message, type) {
        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert alert-error'};
        if (angular.isUndefined(type)){ 
          $rootScope.alert = {msg: message, type: 'alert alert-error'};
          $location.hash('banner');
          $anchorScroll();
          //$location.hash('');
        }
      },
      info: function(message, type) {
        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert alert-info'};
        if (angular.isUndefined(type)) {
           $rootScope.alert = {msg: message, type: 'alert alert-info'};
                              $location.hash('banner');
        $anchorScroll();
           //$location.hash('');
         }
      },
      warning: function(message, type) {
        
        if (type == 'modal') $rootScope.modalAlert = {msg: message, type: 'alert'};
        if (angular.isUndefined(type)){ 

         $rootScope.alert = {msg: message, type: 'alert'};
                           $location.hash('banner');
        $anchorScroll();
         //$location.hash('');
       }
      }
    };
  }]).
  factory('GoogleApi', ['$window', function($window) {
    var clientId = '724910639732.apps.googleusercontent.com';
    var apiKey = 'AIzaSyDksAsTFgEvILZgCSUXLTGGfQf2zWdeAx0';
    var scopes = 'https://www.googleapis.com/auth/youtube';
    var oauthCallback = 'http://localhost:3000/user';
    var clientSecret = 'OEnZehcGWe77xt6IbJoXwoT0';
    var token;
    
    return {
      load: function() {
        gapi.client.setApiKey(apiKey);
        //gapi.client.load('youtube', 'v3', makeRequest);
     },
     checkAuth: function(callback) {
       gapi.auth.authorize({client_id: clientId, scope: scopes}, callback)
      /*var query = 'https://accounts.google.com/o/oauth2/auth?' +
                    'client_id=' + clientId + '&' +
                    'redirect_uri=' + oauthCallback + '&' +
                    'scope=' + scopes + '&' +
                    'response_type=code&' +
                    'access_type=offline';
      $window.location = authQuery;*/
     }

    
  }
  }]).
  value('version', '0.1');
  
 
  


