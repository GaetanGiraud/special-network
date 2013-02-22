'use strict';

/* Controllers */

function AppCtrl($scope, User) {
  
}

function LoginCtrl($scope, $http, User, $location) {
  
 $scope.users = User.query();

  $scope.addUser = function() {
    console.log('Trying to create user: '+ $scope.newUser.email);
    var user = User.save($scope.newUser, 
      function(){
        console.log('User added: ' + user.email);
        $location.path('/view2');
      },
      function(){
        console.log('Error');
      }
    );
    $scope.user = user;
  }
  
  
  $scope.login = function() {
    var user = $http.post('/api/login', $scope.user). 
      success(function(){
        console.log('User added: ' + user.email);
        $location.path('/users/' + user._id);
      }).
      error(function(){
        console.log('Error login');
        
      });
    $scope.user = user;
  }

}
LoginCtrl.$inject = ['$scope', '$http', 'User', '$location'];


function UserCtrl($scope, User, $routeParams) {
  $scope.user =  User.get({userId: $routeParams.userId});
  
  
}
UserCtrl.$inject = ['$scope', 'User', '$routeParams'];
