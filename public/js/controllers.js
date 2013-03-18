'use strict';

/* Controllers */

function AppCtrl($scope, AuthService, $location) {
  $scope.openLoginDialog = function() { 
    AuthService.loginModal(function(result){
      if (result) {
        $location.path('/');
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
    dialog.close(result);
  };
}
DialogCtrl.$inject = ['$scope', 'dialog'];



/*
 * User login and User Administration
 * 
 */



function LoginCtrl($scope, User, $rootScope, $location, AuthService, Alert) {

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
        $scope.$parent.close();
        Alert.success('Welcome ' + $rootScope.currentUser.name + ', you have successfullt logged in!');
      } else {
        Alert.error('Error logging in, please try again', 'modal');
      }
    });
  }

}
LoginCtrl.$inject = ['$scope', 'User', '$rootScope', '$location', 'AuthService', 'Alert'];

function LogoutCtrl($scope, AuthService, Alert, $location) {
  AuthService.logout();
  $location.path('/');
  Alert.success('You have successfully logged out. See you you soon!'); 
}
LogoutCtrl.$inject = ['$scope', 'AuthService', 'Alert','$location'];


function UserCtrl($scope, User, $rootScope, Alert, Location, GeoCoder) {
  $scope.undoLocUpdate = "false";
  var previousLocation = [];
  
  //$scope.location = '';
  
  
 // $scope.test = function () {
  //  alert('It works!'); 
    
  //}
  // Fetch the user and its location
  
 /* $scope.browserLocation = function() {
    GeoCoder.getBrowserLocation(function(position){
       console.log(position);
       
       }, 
       function() {
        Alert.info("To complete your profile, please fill in your location!");
        });
  };*/
  
  //$scope.toggle = function() {
  //  
  //   $scope.showHelp = !$scope.showHelp ;
  //   console.log($scope.showHelp);
 // }
  
    
  $scope.user = User.get({userId: $rootScope.currentUser._id}, 
    function(user) {       
      Location.get({locationId: user._location}, 
        function(location) {
            // If the user's location lattitue is not defined, 
            // user the HTML5 location service to fetch the lat && long
            // and the google API to retrieve the address
            $scope.location = location;
            
            if (angular.isUndefined(location.lat)) {
              $scope.showLocationWidget = true;
            
          //  }
            /*  GeoCoder.getBrowserLocation(
                function(browserLoc){
                  GeoCoder.parseAddress(browserLoc[0], 
                    function(results) {
                      console.log(results);
                      $scope.location = angular.extend($scope.location, results);
                      console.log($scope.location.formattedAddress);
                      previousLocation[0] = angular.copy($scope.location);
                      $scope.updateLocation("false");
                    });
                  }, 
                  function(err) {
                    // If an error occures, or the user refuses to use the location service, 
                    // Inform the user to fill the location itself.
                    Alert.info("Please fill in your location!");
                });*/
            } else {         
            previousLocation[0] = angular.copy(location);
           }
      });
      
   });
   


  $scope.updateUser = function() {  
    User.update({userId: $scope.user._id},$scope.user, 
      function(user){
        $scope.user = user;
        Alert.success('Your settings have been successfully updated.');
      }, 
      function(err){
        Alert.error('Error updating user: ' + err);
      }
    );
  }
  
  // Event triggered by the uploader plugin. Actions to be performed after successfull upload of profile photo.
  $scope.$on('event:profilePictureUploaded', function(res, filename) {
    $scope.user.picture = filename;  
    $scope.updateUser();
  });
  
  // reset the user value to the one stored on the database.
  $scope.cancelUpdate = function() {
    $scope.user = User.get({userId: $rootScope.currentUser._id});
  }
  
  // Using the GeoCoder service.
   $scope.getBrowserLocation = function() {
    
     GeoCoder.getBrowserLocation(
       function(browserLoc, err){
         if (err) Alert.info("Please fill in your location!");
         GeoCoder.parseAddress(browserLoc[0], 
         function(results) {
           $scope.location = angular.extend($scope.location, results);
           previousLocation[0] = angular.copy($scope.location);
           $scope.updateLocation("true");
           $scope.showLocationWidget = false;
         });
       } 
      // function(err) {
     //               // If an error occures, or the user refuses to use the location service, 
                    // Inform the user to fill the location itself.
     //     if(err) Alert.info("Please fill in your location!");
       // }
        );
    }
    
  $scope.getLocation = function () { 
    if (previousLocation[1] != null) {
       previousLocation[0] = angular.copy(previousLocation[1]) ;
       previousLocation[1] = null;
    }
    
    if (($scope.location.formattedAddress.length < 5) && angular.isArray($scope.locations)) {
     $scope.locations = null;
     $scope.undoLocUpdate = "false";
    }
    if ($scope.location.formattedAddress.length > 5 ) {
      GeoCoder.getLocation($scope.location, function(results) {
        $scope.locations = results;
      });
    } 
  }
  
  $scope.updateLocation = function(isUndo) {
    Location.update({locationId: $scope.location._id}, $scope.location, 
      function(location){
        $scope.location = location;
        $scope.undoLocUpdate= isUndo;
        $scope.updated = {border: "4px solid blue"};
        console.log($scope.updated);
      }, 
      function(err){ 
        Alert.error('A system error while saving your location. Could you try again?' );
      }
    );
  }
  
  $scope.validateAdress = function($index) {
    var newAddress = $scope.locations[$index];
   
    GeoCoder.parseAddress(newAddress, function(result) {
       $scope.location = angular.extend($scope.location, result);
       previousLocation[1] = angular.copy($scope.location);
       $scope.locations = null;
       $scope.updateLocation("true");  
    });
  }
 
  $scope.undoLocation = function() {
    $scope.location = previousLocation[0];
    $scope.updateLocation("false");
  }
}
UserCtrl.$inject = ['$scope', 'User', '$rootScope', 'Alert', 'Location', 'GeoCoder'];


function ChildrenCtrl($scope, User, $rootScope) {
  $scope.user = User.get({userId: $rootScope.currentUser._id});     
 
    $scope.deleteChild = function(index) {
    console.log(index);
    $scope.user.children.splice(index, 1);
  }
  
  $scope.addChild = function() {
    $scope.user.children.push($scope.newChild);
    $scope.newChild = '';
  } 
}
ChildrenCtrl.$inject = ['$scope', 'User', '$rootScope'];

function ChildCtrl($scope, $http, $rootScope, $routeParams) {
  
  $http({method: 'GET', url: '/api/children/' + $routeParams.childId})
    .success(function(data, status, headers, config) {
            $scope.child = data;
            return true;
    })
    .error(function(data, status, headers, config) {
            return data;
    });;
  
  
}
ChildCtrl.$inject = ['$scope', '$http', '$rootScope', '$routeParams'];

/*
 * 
 * Looking and finding people / places 
 * 
 * 
 * 
 */


function MapCtrl($scope, $rootScope, Location, homeLatLng, Map, Alert, User) {
  
  $scope.mapOptions = Map.setMapOptions(homeLatLng);
  
  $scope.$watch('myMap', function(myMap) {
    $scope.locations = Map.initialize(myMap);
  });
  

  $scope.endMove = function($event) {
   Map.dropEvent($event, $scope.myMap, function(newMarker) {
      if (newMarker) $scope.createLocation(newMarker);
   });
    
  }
 
   $scope.addMarker = function($event) {
    var newMarker = new google.maps.Marker({
      map: $scope.myMap,
      position: $event.latLng
    });
    $scope.createLocation(newMarker);
    
  }
    
  $scope.createLocation = function(newMarker) {
    Location.save({
      '_creator': $rootScope.currentUser._id,
      'lat': newMarker.getPosition().lat(),
      'lng': newMarker.getPosition().lng()
      }, 
      function(location) {
        location.marker = newMarker;
        $scope.locations.push(location);
        //$scope.openMarkerInfo(location);
      },
     function(){
       newMarker.setMap( null);
       Alert.error('A system error occurred, sorry for the inconvenience.'); 
     });
  };
  
  
  $scope.deleteLocation = function(location) {
    console.log('delete marker: ' + location);
    //delete $scope.myMarkers[index];
    Location.delete({'locationId': location._id},
      function() {
        return location.marker.setMap( null);
      },
      function() {
        return Alert.error('Could not delete this location'); 
      }
    );
   
  };
  
   
  $scope.setZoomMessage = function(zoom) {
    $scope.zoomMessage = 'You just zoomed to '+zoom+'!';
    console.log(zoom,'zoomed')
  };
   
  $scope.openMarkerInfo = function(location) {
    console.log('click');
    $scope.currentLocation = location;
    $scope.currentMarkerLat = location.marker.getPosition().lat();
    $scope.currentMarkerLng = location.marker.getPosition().lng();
    //$scope.userWindow.open($scope.myMap,location.marker);
    
    switch(location.locationType) {
      case 'userhome':
        User.get({userId: location._creator}, function(user) {
          $scope.user = user;
          $scope.delete = false;
          $scope.userWindow.open($scope.myMap, location.marker);
        });
        break;
      case 'hospital':
        $scope.userWindow.open($scope.myMap,  location.marker);
        break;
      case 'doctor':
        $scope.userWindow.open($scope.myMap,  location.marker);
        break;
      default:
        User.get({userId: location._creator}, function(user) {
          $scope.user = user;
          
          if (user._id != $rootScope.currentUser._id)  {         
            $scope.delete = false;
          } else {
            $scope.delete = true;
          }
          
          $scope.userWindow.open($scope.myMap, location.marker);
        });
      //$scope.userWindow.open($scope.myMap,  location.marker);
    }
  };
   
  $scope.setMarkerPosition = function(marker, lat, lng) {
    marker.setPosition(new google.maps.LatLng(lat, lng));
  };


}
MapCtrl.$inject = ['$scope', '$rootScope', 'Location', 'homeLatLng', 'Map', 'Alert', 'User'];

// To load the map you need to have the home latitude and longitude resolved beforehand!
MapCtrl.resolve = {
  homeLatLng: ['$q', '$http', 'Location', function($q, $http, Location) {
        var deferred = $q.defer();
        
         $http.get('/api/homelocation')
          .success(function(location) {
            if (angular.isDefined(location.lat)) {
              var response = new google.maps.LatLng(location.lat, location.lng);
            } else {
              var response = new google.maps.LatLng(35.0, 35.0);
            }
            deferred.resolve(response);
          })
          .error(function(err){
            deferred.resolve(err);
          });
        return deferred.promise;
    }]
}
  
