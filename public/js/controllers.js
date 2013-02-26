'use strict';

/* Controllers */

function AppCtrl($scope, User) {
  
}

function LoginCtrl($scope, $http, User, $location) {
 $scope.isregistered = true;
 $scope.users = User.query();

  $scope.addUser = function() {
    console.log('Trying to create user: '+ $scope.user.email);
    var user = User.save($scope.user, 
      function(data){
        console.log('User added: ' + user.email);
        $location.path('/users/' + data._id );
      },
      function(){
        console.log('Error');
      }
    );
    $scope.user = user;
  }
  
  
  $scope.login = function() {
    var user = $http.post('/api/login', $scope.user);
  }

}
LoginCtrl.$inject = ['$scope', '$http', 'User', '$location'];


function UserCtrl($scope, User, $routeParams) {
  $scope.user =  User.get({userId: $routeParams.userId});
  
  
}
UserCtrl.$inject = ['$scope', 'User', '$routeParams'];
