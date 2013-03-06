'use strict';

/* Controllers */

function AppCtrl($scope, $rootScope, User, AuthService, requests401) {
  
         
    
}
AppCtrl.$inject = ['$scope', '$rootScope', 'User', 'AuthService', 'requests401'];

function LoginCtrl($scope, User, $rootScope, $location, AuthService) {
 // $scope.isRegistered = true;
  
  if (AuthService.isLoggedIn) {
      $scope.$parent.msg = {content: 'You are already logged in!', type: 'alert-info'};
      //$scope.$parent.errors = 'You are already logged in!';
    //  $rootScope.errors = 'You are already logged in!';
  };

  $scope.register = function() {
    var user = User.save($scope.newUser, 
      function() {
        console.log(user);
        $scope.isRegistered = true;
        $scope.$parent.msg = {
          content: "Welcome <strong>" + user.name + "</strong>. Sign in using the crentials you provide at registration.", 
          type: 'alert-sucess'
        }; 
        $scope.user = user;
        //$location.path('/');
      },
    function(){
      $scope.$parent.msg = {content: 'An error occurred while registerig', type: 'alert-error' }; 
     });
  }
  
  
  $scope.login = function() {
    AuthService.login({'email': $scope.user.email, 'password': $scope.user.password}, function(loggedin) {
      if (loggedin) {
        console.log('logged in');
        $location.path('/home');
      } else {
       $scope.$parent.msg = {content: 'Error logging in, please try again', type: 'alert-error'};
      }
    });
  }

}
LoginCtrl.$inject = ['$scope', 'User', '$rootScope', '$location', 'AuthService'];


function UserCtrl($scope, User, AuthService) {
  $scope.$parent.isLoggedIn = true;
}
UserCtrl.$inject = ['$scope', 'User', 'AuthService'];

function LogoutCtrl($scope, AuthService) {
  AuthService.logout();
}
LogoutCtrl.$inject = ['$scope', 'AuthService'];
