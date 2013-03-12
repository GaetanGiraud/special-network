'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('CareKids', ['CareKids.filters', 'CareKids.services', 'CareKids.directives', 'ui', 'ui.bootstrap', 'auth-service']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/home', controller: HomeCtrl});
    $routeProvider.when('/logout', {templateUrl: 'partials/logout', controller: LogoutCtrl});
    
    //Restricted partials
    //$routeProvider.when('/home', {templateUrl: 'partials/userhome', controller: HomeCtrl}); 
    $routeProvider.when('/users/:userId', {templateUrl: 'partials/user', controller: UserCtrl}); 
    $routeProvider.when('/user', {templateUrl: 'partials/user', controller: UserCtrl}); 
    $routeProvider.when('/children', {templateUrl: 'partials/children', controller: ChildrenCtrl}); 
    $routeProvider.when('/children/:childId', {templateUrl: 'partials/child', controller: ChildCtrl}); 
    $routeProvider.when('/map', {templateUrl: 'partials/map', controller: MapCtrl, resolve: MapCtrl.resolve}); 
    // parameters
    $routeProvider.otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
  }]);


app.run(['$rootScope', '$location', 'AuthService', 'requests401',  function ($rootScope, $location, AuthService, requests401) {
    //global variables
    $rootScope.currentUser = null; 
    $rootScope.loggedIn = false; 
    //watching the value of the currentUser variable.
    
    $rootScope.$watch('currentUser', function(currentUser) {
      if (!currentUser) { 
        AuthService.currentUser();
      }
    });

    // On catching 401 errors, present the login modal.
    $rootScope.$on('event:angular-auth-loginRequired', function() {
      if(['/', '/login', '/logout'].indexOf($location.path()) == -1 ) { // exepting for the root and the login-logout pages
        AuthService.loginModal(function(result) {
          if(result) { return requests401.retryAll(); }
          $location.path('/');
          return false;
        });
      }
    });

    /*$rootScope.$on('$routeChangeStart', function(event, next, current) {
      console.log('routechange');
      console.log($rootScope.loggedIn);

   });*/


}]);
    

