'use strict';

/* Controllers */

function AppCtrl($scope, $rootScope, User) {
  
  
  
}

function LoginCtrl($scope, $http, User, $location) {
 //$scope.isregistered = true;
 $scope.users = User.query();


  $scope.register = function() {
    console.log('Trying to create user: '+ $scope.newUser.email);
    User.save($scope.newUser, 
      function(data){
        console.log('User added: ' + data.email);
      },
      function(){
        console.log('Error');
      }
    );
  }
  
  
 $scope.login = function() {
    $http.post('/api/login', $scope.user)
      .success(function(data, status) {
        $scope.status
        redirect.path('/');
      })
      .error(function(){

      });
  }

}
LoginCtrl.$inject = ['$scope', '$http', 'User', '$location'];


function UserCtrl($scope, User, $routeParams) {
 // $scope.user =  User.get({userId: $routeParams.userId});
  
  
}
UserCtrl.$inject = ['$scope', '$http'];

function LogoutCtrl($scope, $http) {
  
  $http.get('/logout');
  
}
LogoutCtrl.$inject = ['$scope','$http'];
