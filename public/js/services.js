'use strict';

/* Services */


// Registering REST resources

angular.module('CareKids.services', ['ngResource']).
  factory('User', function($resource){
    return $resource('api/users/:userId', {userId: '@id'},
                      {update: {method: "PUT"}}
                      );
  }).
  factory('AuthService', ['$http', function($http) {
    var current_user;
  //  var isLoggedIn;
  
    return {
      // calls the server to check the credentials, store the result into the currentUser variable
      // and execute call back
      login: function(credentials, callback) {
        $http({method: 'POST', url: '/sessions/new', data: credentials}).
          success(function(data, status, headers, config) {
            current_user = data;
            return callback(true);
          }).
          error(function(data, status, headers, config) {
            current_user = '';
            return callback(false);
          });
      },
      // asks the server to destroy the session
      logout: function() {  
        $http.get('/logout'); 
        current_user = ''; 
      },
      isLoggedIn: function(callback) { 
        //if (currentUser == '' || typeof currentUser == 'undefined') {
        $http.get('/sessions/ping') 
            .success(function(data) { 
              console.log('received response from server');
              if (data == 'true') { 
                console.log('ok');
                return callback(true); 
                } else {
                  return callback(false);
                } 
            });  
        //} else { 
        return false;
          //; }
      },
      currentUser: function(callback) {
        if (current_user == '' || typeof current_user == 'undefined') {
          $http.get('/sessions') 
            .success(function(data) { 
              current_user = data.user;
              return callback(current_user); 
           })
           .error(function(error) {
             currentUser = '';
             return callback(current_user);
           });
        } else {
          
          return callback(current_user); 
        }     
     }
    };
  }]).value('version', '0.1');
  

/* Implement 401 interceptors for resource requests. 
angular.module('http-auth-interceptor', [])
  .provider('authService', function() {
    /**
     * Holds all the requests which failed due to 401 response,
     * so they can be re-requested in future, once login is completed.
     *
    var buffer = [];
    
    /**
     * Required by HTTP interceptor.
     * Function is attached to provider to be invisible for regular users of this service.
     *
    this.pushToBuffer = function(config, deferred) {
      buffer.push({
        config: config, 
        deferred: deferred
      });
    }
    
    this.$get = ['$rootScope','$injector', function($rootScope, $injector) {
      var $http; //initialized later because of circular dependency problem
      function retry(config, deferred) {
        $http = $http || $injector.get('$http');
        $http(config).then(function(response) {
          deferred.resolve(response);
        });
      }
      function retryAll() {
        for (var i = 0; i < buffer.length; ++i) {
          retry(buffer[i].config, buffer[i].deferred);
        }
        buffer = [];
      }

      return {
        loginConfirmed: function() {
          $rootScope.$broadcast('event:auth-loginConfirmed');
          retryAll();
        }
      }
    }]
  })

  /**
   * $http interceptor.
   * On 401 response - it stores the request and broadcasts 'event:angular-auth-loginRequired'.
   *
  .config(['$httpProvider', 'authServiceProvider', function($httpProvider, authServiceProvider) {
    
    var interceptor = ['$rootScope', '$q', function($rootScope, $q) {
      function success(response) {
        console.log('response intercepted');
        return response;
      }
 
      function error(response) {
        if (response.status === 401) {
          console.log('response intercepted');
          var deferred = $q.defer();
          authServiceProvider.pushToBuffer(response.config, deferred);
          $rootScope.$broadcast('event:auth-loginRequired');
          return deferred.promise;
        }
        // otherwise
        return $q.reject(response);
      }
 
      return function(promise) {
        console.log('response intercepted');
        return promise.then(success, error);
      }
 
    }];
    $httpProvider.responseInterceptors.push(interceptor);
  }]);*/
