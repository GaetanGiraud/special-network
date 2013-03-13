'use strict';

/* Filters */

angular.module('CareKids.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('defaultPic', ['$rootScope',function($rootScope) {
    return function(input) {
      if (angular.isUndefined(input)) {
        return 'images/user-default.png'; 
      } else {
        var userId = $rootScope.currentUser._id;
        return 'uploads/' + userId + '/' + input;
      }
    }
  }]);
