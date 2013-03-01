'use strict';

/* Controllers */

function AppCtrl($scope, $rootScope, User, AuthService) {
  $scope.msg = '';
  
  $scope.isLoggedIn = AuthService.isLoggedIn(function(result){
    $scope.isLoggedIn = result;
  });
  $scope.current_user = AuthService.currentUser(function(user){
     $scope.current_user = user;
    });
 // AuthService.isLoggedIn( function(result) {
  //   $rootScope.isLoggedIn = result;
 // });
 //console.log($rootScope.isLoggedIn);
}
AppCtrl.$inject = ['$scope', '$rootScope', 'User', 'AuthService'];

function LoginCtrl($scope, User, $rootScope, $location, AuthService) {
 //$scope.isregistered = true;
  $scope.isRegistered = true;
  
  AuthService.isLoggedIn(function(result){
    if (result){
      $scope.$parent.msg = {content: 'You are already logged in!', type: 'alert-info'};
      //$scope.$parent.errors = 'You are already logged in!';
    //  $rootScope.errors = 'You are already logged in!';
      };
  });

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
    AuthService.login($scope.user, function(loggedin) {
      if (loggedin) {
        console.log('logged in');
        $location.path('/');
      } else {
       $scope.$parent.msg = {content: 'Error logging in, please try again', type: 'alert-error'};
      }
    });
  }

}
LoginCtrl.$inject = ['$scope', 'User', '$rootScope', '$location', 'AuthService'];


function UserCtrl($scope, User, AuthService) {

}
UserCtrl.$inject = ['$scope', 'User', 'AuthService'];

function LogoutCtrl($scope, AuthService) {
  AuthService.logout();
}
LogoutCtrl.$inject = ['$scope', 'AuthService'];
