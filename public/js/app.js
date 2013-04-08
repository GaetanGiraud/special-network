'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('CareKids', ['ngSanitize', 'CareKids.filters', 'CareKids.services', 'CareKids.directives', 'ui', 'ui.bootstrap', 'auth-service', 'geoService', 'SocketServices']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/index', controller: AppCtrl});
    $routeProvider.when('/logout', {templateUrl: 'partials/home', controller: LogoutCtrl});
    
    //Restricted partials
    $routeProvider.when('/home', {templateUrl: 'partials/home', controller: HomeCtrl}); 
    $routeProvider.when('/questions', {templateUrl: 'partials/questions', controller: QuestionsCtrl}); 
    $routeProvider.when('/messages', {templateUrl: 'partials/messages', controller: MessageCtrl}); 
     
    $routeProvider.when('/users/:userId', {templateUrl: 'partials/user', controller: UserCtrl}); 
    $routeProvider.when('/user', {templateUrl: 'partials/user', controller: UserCtrl}); 
    $routeProvider.when('/children', {templateUrl: 'partials/children', controller: ChildrenCtrl}); 
    $routeProvider.when('/children/:childId', {templateUrl: 'partials/child', controller: ChildCtrl}); 
    
    $routeProvider.when('/find', {templateUrl: 'partials/find', controller: FindCtrl}); 
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
      if (!currentUser && $location.path() != '/' ) { 
        AuthService.currentUser();
      }
    });

    // On catching 401 errors, present the login modal.
    $rootScope.$on('event:angular-auth-loginRequired', function() {
      if(['/', '/login', '/logout'].indexOf($location.path()) == -1 ) { // exepting for the root and the login-logout pages
        AuthService.loginModal(function(result) {
          if(result) { return requests401.retryAll(); }
          $location.path('/home');
          return false;
        });
      }
    });

}]);
    

