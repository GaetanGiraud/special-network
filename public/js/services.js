'use strict';

/* Services */


// Registering REST resources

angular.module('CareKids.services', ['ngResource']).
  factory('User', function($resource){
    return $resource('api/users/:userId', {userId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }).
  factory('AuthService', ['$http', '$rootScope', function($http, $rootScope) {
  
    return {
      // calls the server to check the credentials, store the result into the currentUser variable
      // and execute call back
      login: function(credentials, callback) {
        $http({method: 'POST', url: '/sessions/new', data: credentials}).
          success(function(data, status, headers, config) {
            $rootScope.currentUser = data;
            $rootScope.authenticated = true;
            return callback(true);
          }).
          error(function(data, status, headers, config) {
            return callback(false);
          });
      },
      // asks the server to destroy the session
      logout: function() {  
        $http.delete('/sessions/destroy', {}); 
         $rootScope.authenticated = false;
         $rootScope.currentUser = null; 
      },
      // asks the server to resend the session information. If session expired, 
      // servers sends error 401, triggering the http 401 interceptor.
      ping: function() { 
        $http.get('/sessions/ping')
        .success(function(data) {
          $rootScope.authenticated = true;
          $rootScope.currentUser = data; 
        });
      }
    };
  }]).value('version', '0.1');
  
 
  
  /**
 * @license Angular Auth
 * (c) 2012 Witold Szczerba
 * License: MIT
 */
angular.module('angular-auth', [])
 
  /**
   * Holds all the requests which failed due to 401 response,
   * so they can be re-requested in the future, once login is completed.
   */
  .factory('requests401', ['$injector', function($injector) {
    var buffer = [];
    var $http; //initialized later because of circular dependency problem
    function retry(config, deferred) {
      $http = $http || $injector.get('$http');
      $http(config).then(function(response) {
        deferred.resolve(response);
      });
    }
  
    return {
      add: function(config, deferred) {
        buffer.push({
          config: config, 
          deferred: deferred
        });
      },
      retryAll: function() {
        for (var i = 0; i < buffer.length; ++i) {
          retry(buffer[i].config, buffer[i].deferred);
        }
        buffer = [];
      }
    }
  }])
 
  /**
   * $http interceptor.
   * On 401 response - it stores the request and broadcasts 'event:angular-auth-loginRequired'.
   */
  .config(function($httpProvider) {
    var interceptor = function($rootScope, $q, requests401) {
      function success(response) {
        return response;
      }
 
      function error(response) {
        var status = response.status;
 
        if (status == 401) {
          var deferred = $q.defer();
          requests401.add(response.config, deferred);
          $rootScope.$broadcast('event:angular-auth-loginRequired');
          return deferred.promise;
        }
        // otherwise
        return $q.reject(response);
      }
 
      return function(promise) {
        return promise.then(success, error);
      }
 
    };
    $httpProvider.responseInterceptors.push(interceptor);
  });

