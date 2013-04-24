'use strict';

function LoginCtrl($scope, User, $rootScope, $location, AuthService, Alert) {
  
  $scope.register = function() {
    var user = User.save($scope.newUser, 
      function() {
        $scope.isNotRegistered = false;
        $scope.user = user;
        Alert.success('Welcome ' + user.name + ', you are successfully registered, log in with the password you just entered!');
      },
    function(){
      Alert.error('A system error occurred while registering, sorry for the inconvenience.'); 
     });
  }
  
  $scope.login = function() {
    AuthService.login({'email': $scope.user.email, 'password': $scope.user.password}, function(loggedin) {
      if (loggedin) {
        $location.path('/home');
       // Alert.success('Welcome ' + $scope.currentUser.name + ', you have successfullt logged in!');
      } else {
        Alert.error('Error logging in, please try again');
      }
    });
  }
  
  
  
}


LoginCtrl.$inject = ['$scope', 'User', '$rootScope', '$location', 'AuthService', 'Alert'];



function ModalLoginCtrl($scope, User, $rootScope, $location, AuthService, Alert, dialog) {

  $scope.close = function(result){
    dialog.close(result);
  };

  // When login in / registering using the login modal, the following functions are called.
  
  $scope.register = function() {
    var user = User.save($scope.newUser, 
      function() {
        $scope.isNotRegistered = false;
        $scope.user = user;
        Alert.success('Welcome ' + user.name + ', you are successfully registered, log in with the password you just entered!', 'modal');
      },
    function(){
      Alert.error('A system error occurred while registering, sorry for the inconvenience.', 'modal'); 
     });
  }
  
  $scope.login = function() {
    AuthService.login({'email': $scope.user.email, 'password': $scope.user.password}, function(loggedin) {
      console.log(loggedin);
      if (loggedin) {
        $scope.close(true);
        //$location.path('/home');
        Alert.success('Welcome ' + $rootScope.currentUser.name + ', you have successfullt logged in!');
      } else {
        Alert.error('Error logging in, please try again', 'modal');
      }
    });
  }

}
ModalLoginCtrl.$inject = ['$scope', 'User', '$rootScope', '$location', 'AuthService', 'Alert', 'dialog'];

function LogoutCtrl($scope, AuthService, Alert, $location) {
  AuthService.logout();
  $scope.$emit('event:socketDisconnect');
  $location.path('/');
  Alert.success('You have successfully logged out. See you you soon!'); 
}
LogoutCtrl.$inject = ['$scope', 'AuthService', 'Alert','$location'];

/*
 * 
 * User information
 * Geolocalisation using the google maps API to find an user location
 * 
 */

function UserCtrl($scope, User, $rootScope, Alert, Location, GeoCoder, $routeParams) {
  
  // Setting up some default values
  $scope.pictureUploadOptions = {
    dropZone: "#picture"
  };
  $scope.undoLocUpdate = false;
  var previousLocation = [];
  
  // If the current user does not have a location defined, 
  // inititialze an empty one and show the help dialog
  $scope.$watch('currentUser', function(currentUser) {
    if (currentUser != null && angular.isUndefined(currentUser.location)) {
      $scope.currentUser.location = {};
      $scope.showLocationWidget = true;
    } 
  });


  $scope.updateUser = function(isUndo) {  
    User.update({userId: $scope.currentUser._id}, $scope.currentUser, 
      function(user){
        $rootScope.currentUser = user;
        $scope.undoLocUpdate= isUndo;
        if(!isUndo) {
          Alert.success('Your settings have been successfully updated.');
        }
      }, 
      function(err){
        Alert.error('Error updating user: ' + err);
      }
    );
  }
  
  // Event triggered by the uploader directive. Actions to be performed after successfull upload of profile photo.
  $scope.setProfilePicture = function(file) {
    $scope.$safeApply($scope, function() { 
      $scope.currentUser.picture = file.name;  
      $scope.updateUser(false);
    })
  };
  
  // reset the user value to the one stored on the database.
  $scope.cancelUpdate = function() {
    $scope.user = User.get({userId: $rootScope.currentUser._id});
  }
  
  /* 
   * Get and set user location
   * 
   */
   
   // use the HTML5 location utility
   $scope.getBrowserLocation = function() {
     GeoCoder.getBrowserLocation(
       function(browserLoc, err){
         if (err) Alert.info("Please fill in your location!");
         GeoCoder.parseAddress(browserLoc[0], 
         function(results) {
           $scope.currentUser.location = angular.extend($scope.currentUser.location, results);
           previousLocation[0] = angular.copy($scope.currentUser.location);
           $scope.updateLocation("true");
           $scope.showLocationWidget = false;
         });
       });
    }
    
  // get the location using the Google Maps API
  $scope.getLocation = function () { 
    if (previousLocation[1] != null) {
       previousLocation[0] = angular.copy(previousLocation[1]) ;
       previousLocation[1] = null;
    }
    
    if (($scope.currentUser.location.formattedAddress.length < 5) && angular.isArray($scope.locations)) {
     $scope.locations = null;
     $scope.undoLocUpdate = false;
    }
    if ($scope.currentUser.location.formattedAddress.length > 5 ) {
      GeoCoder.getLocation($scope.currentUser.location, function(results) {
        $scope.locations = results;
      });
    } 
  }

  // Validate the address, parse usefull information and update user in the database.
  $scope.validateAdress = function($index) {
    var newAddress = $scope.locations[$index];
   
    GeoCoder.parseAddress(newAddress, function(result) {
       $scope.currentUser.location = angular.extend($scope.currentUser.location, result);
       previousLocation[1] = angular.copy($scope.currentUser.location);
       $scope.locations = null;
       $scope.updateUser(false);  
    });
  }
 
  $scope.undoLocation = function() {
    $scope.currentUser.location = previousLocation[0];
    $scope.locations = [];
    $scope.updateUser(true);
  }
  
  
  
  /*
   * 
   * Google APi
   * 
   */

   
  
}
UserCtrl.$inject = ['$scope', 'User', '$rootScope', 'Alert', 'Location', 'GeoCoder', '$routeParams'];
