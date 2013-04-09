'use strict';

/* Filters */

angular.module('CareKids.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('fromNow', function() {
    return function(date) {
      if (angular.isDefined(date) && date != null) {
        console.log(date);
        //var day = moment(date);
        return moment(date).fromNow();
      } else { return ''}
    }
  }).
  filter('thumbPicture', function() {
    return function(object) {
    if (angular.isDefined(object)) {
      if (angular.isUndefined(object.picture)) { 
           return 'images/defaults/user-default.png';  
        } else {
          if ( angular.isUndefined(object._creatorId)) {
            return 'uploads/' + object._id + '/thumbnail/' + object.picture;
          }
          return 'uploads/' + object._creatorId + '/thumbnail/' + object.picture;
        }
      } 
    }
  }).
  filter('iconPicture', function() {
    return function(object) {
    if (angular.isDefined(object)) {
      if (angular.isUndefined(object.picture)) { 
           return 'images/defaults/user-default-icon.png';  
        } else {
          if ( angular.isUndefined(object._creatorId)) {
            return 'uploads/' + object._id + '/icon/' + object.picture;
          }
          return 'uploads/' + object._creatorId + '/icon/' + object.picture;
        }
      } else { 
        return 'images/defaults/user-default-icon.png';  
      }
    }
  }).
  filter('picture', function() {
    return function(object) {
     if (angular.isDefined(object)) {
      if (angular.isUndefined(object.picture)) { 
           return 'images/defaults/user-default.png';  
        } else {
          if ( angular.isUndefined(object._creatorId)) {
            return 'uploads/' + object._id + '/' + object.picture;
          }
          return 'uploads/' + object._creatorId + '/' + object.picture;
        }
      } else {
        return 'images/defaults/user-default.png';   
      }
    } 
  }).
  filter('userPic', function() {
    return function(user) {
      if (angular.isDefined(user)) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-default.png'; 
        } else {
          var userId = user._id;
          return 'uploads/' + userId + '/' + user.picture;
        }
      }
    }
  }).
  filter('userThumbPic', function() {
    return function(user) {
      if (angular.isDefined(user)) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-thumbnail-default.png'; 
        } else {
          var userId = user._id;
          return 'uploads/' + userId + '/thumbnail/' + user.picture;
        }
     } 
    }
  }).
  filter('userIconPic', function() {
    return function(user) {
      if (angular.isDefined(user)) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-icon-default.png'; 
        } else {
          var userId = user._id;
          return 'uploads/' + userId + '/icon/' + user.picture;
        }
     } 
    }
  }).
  filter('pronomize', function() {
    return function(relationship) {
      if (['Father', 'Mother'].indexOf(relationship) != -1) return 'the ' + relationship; 
      return 'a ' + relationship;  
    }
  });
