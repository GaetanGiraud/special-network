'use strict';

/* Controllers */

function AppCtrl($scope, AuthService, $location) {
  $scope.openLoginDialog = function() { 
    AuthService.loginModal(function(result){
      if (result) {
        $location.path('/home');
      }
    });
  }
  
}
AppCtrl.$inject = ['$scope', 'AuthService', '$location'];

function HomeCtrl($scope) {
    
}
HomeCtrl.$inject = ['$scope'];


function DialogCtrl($scope, dialog){
  $scope.close = function(result){
    console.log('closing dialog');
    dialog.close(result);
  };
}
DialogCtrl.$inject = ['$scope', 'dialog'];

function LoginCtrl($scope, User, $rootScope, $location, AuthService) {

  /*$scope.close = function() {
    $scope.$parent.close();  
  }*/

  $scope.register = function() {
    var user = User.save($scope.newUser, 
      function() {
        console.log(user);
        $scope.isNotRegistered = false;
        /* $scope.$parent.msg = {
          content: "Welcome <strong>" + user.name + "</strong>. Sign in using the crentials you provide at registration.", 
          type: 'alert-sucess'
        }; */
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
        $scope.$parent.close('User Logged in');
        //$rootScope.msg = {content: 'Thank you for logging in', type: 'success'};
        //$location.path('/home');
        
      } else {
        $scope.msg = {content: 'Error logging in, please try again', type: 'error'};
      }
    });
  }

}
LoginCtrl.$inject = ['$scope', 'User', '$rootScope', '$location', 'AuthService'];


function UserCtrl($scope, User, $rootScope) {
  $scope.user = User.get({userId: $rootScope.currentUser._id});
  
  $scope.updateUser = function() {
    var id = $scope.user._id;
    var userData = $scope.user;
    delete userData._id; // stripping the id for mongoDB
    User.update({userId: id}, userData, 
      function(user){
        $scope.user = user;
        console.log('User successfullt updated');
      }, 
      function(err){
        console.log('Error updating user: ' + err);
      }
    );
  }
  
  
  //$scope.$parent.isLoggedIn = true;
}
UserCtrl.$inject = ['$scope', 'User', '$rootScope'];

function LogoutCtrl($scope, AuthService) {
  AuthService.logout();
}
LogoutCtrl.$inject = ['$scope', 'AuthService'];
