'use strict';

/* Services */


// Registering REST resources

angular.module('followService', []).
factory('FollowService', ['Message', '$rootScope', function(Message, $rootScope){
  return { 
    unfollow: function(child, callback) {
      $http.put('/api/children/' + child._id + '/follow', { action: 'unfollow' }).success(function(data) {
       $rootScope.$broadcast('unFollowingChild', data);
       callback(data);
      });
    },
    follow: function(child) {
      $http.put('/api/children/' + child._id + '/follow', { action: 'unfollow' }).success(function(data) {
        $rootScope.$broadcast('unFollowingChild', data);
        callback(data);
      })
   },
   sendMessage: function(data) {
      
          Message.send({
            content: $scope.currentUser.name + " wants to follow " + data.name,
            action: { 
              actionType: "following",
              target: data._id
              },
            _creator: $scope.currentUser,
            receivers: [ { '_user': data.creator._user } ]
          })
    }
  }
}]);
