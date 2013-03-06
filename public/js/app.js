'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('CareKids', ['CareKids.filters', 'CareKids.services', 'CareKids.directives', 'ui', 'ui.bootstrap', 'angular-auth']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //$routeProvider.when('/', {templateUrl: 'partials/', controller: UserCtrl});
    $routeProvider.when('/login', {templateUrl: 'partials/login', controller: LoginCtrl});
    $routeProvider.when('/logout', {templateUrl: 'partials/logout', controller: LogoutCtrl});
    //Restricted partials
    $routeProvider.when('/home', {templateUrl: 'partials/home', controller: UserCtrl}); 
    $routeProvider.when('/users/:userId', {templateUrl: 'partials/user', controller: UserCtrl}); 
    $routeProvider.otherwise({redirectTo: '/login'});
    $locationProvider.html5Mode(true);
  }]);
  /* .run(function($rootScope, $location, User) {
     $rootScope.$on('$routeChangeStart', function(event, next, current) {
       if (!User.isAuthenticated() && next.templateUrl != '/partials/login.html') {
                $location.path("/login");
      }
     }
   });*/

app.run(['$rootScope', 'AuthService', 'requests401', function ($rootScope, AuthService, requests401) {
    $rootScope.currentUser = null; //global variable
    $rootScope.loggedin = false;
    
    $rootScope.$watch('loggedin', function(loggedin) {
      if (loggedin == false) AuthService.ping();
    });
    
    
    $rootScope.$on('event:angular-auth-loginRequired', function() {
     console.log('401 caught');
     /*AuthService.login({'email': 'coco@gmail.com', 'password': 'gg21pon1'}, function(loggedin) {
      if (loggedin) {
        requests401.retryAll();
        console.log('logged in');
      } else {
       console.log('Try again');
       //$rootScope.
      // $scope.$parent.msg = {content: 'Error logging in, please try again', type: 'alert-error'};
      }
    });*/
   });
}]);

