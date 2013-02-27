'use strict';


// Declare app level module which depends on filters, and services
angular.module('CareKids', ['CareKids.filters', 'CareKids.services', 'CareKids.directives', 'ui']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/homepage', controller: AppCtrl});
    $routeProvider.when('/login', {templateUrl: 'partials/login', controller: LoginCtrl});
    $routeProvider.when('/users/:userId', {templateUrl: 'partials/user', controller: UserCtrl}); 
    $routeProvider.when('/logout', {templateUrl: 'partials/bye', controller: LogoutCtrl});
    $routeProvider.otherwise({redirectTo: '/login'});
    $locationProvider.html5Mode(true);
  }]);
