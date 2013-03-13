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

function LoginCtrl($scope, User, $rootScope, $location, AuthService, Alert) {

  $scope.register = function() {
    var user = User.save($scope.newUser, 
      function() {
        $scope.isNotRegistered = false;
        $scope.user = user;
      },
    function(){
      Alert.error('A system error occurred while registering, sorry for the inconvenience.'); 
     });
  }
  
  
  $scope.login = function() {
    AuthService.login({'email': $scope.user.email, 'password': $scope.user.password}, function(loggedin) {
      if (loggedin) {
        $scope.$parent.close();
        Alert.success('Welcome ' + $rootScope.currentUser.name + ', you have successfullt logged in!');
        
      } else {
        Alert.error('Error logging in, please try again');
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

/*
 * Controlers related to Users and Children
 * 
 */


function UserCtrl($scope, User, Location, $rootScope, Alert) {
 // initialize variables and constructors
  $scope.previousLocation = [];
  $scope.undoLocUpdate = "false";
  var geocoder = new google.maps.Geocoder();
    
  // Fetch the user and its location
  $scope.user = User.get({userId: $rootScope.currentUser._id}, 
    function(user) {
      $scope.location = Location.get({locationId: user._location}, 
        function(location) {
          // copy the location to allow undo function  
          $scope.previousLocation[0] = angular.copy(location);
        });
  });

 
  // Event triggered by the uploader plugin. Actions to be performed after successfull upload of profile photo.
  $scope.$on('event:profilePictureUploaded', function(res, filename) {
    $scope.user.picture = filename;  
    $scope.updateUser();
  });
  
  // reset the user value to the one stored on the database.
  $scope.cancelUpdate = function() {
    $scope.user = User.get({userId: $rootScope.currentUser._id});
  }
  
   
  $scope.updateUser = function() {
    var id = $scope.user._id;
    var userData = $scope.user;
    
    console.log(userData);
    delete userData._id; // stripping the id for mongoDB
    
    User.update({userId: id}, userData, 
      function(user){
        $scope.user = user;
        Alert.success('Your settings have been successfully updated.');
      }, 
      function(err){
        Alert.error('Error updating user: ' + err);
      }
    );
  }
  
  // Getting the adress based on geolocation by google
   
  $scope.getLocation = function() { 
    // When starting to type in a new address, if a secondary address has been typed in, 
    //use it as previous adress for the undo function
    if ( $scope.previousLocation[1] != null) {
      $scope.previousLocation[0] = angular.copy($scope.previousLocation[1]) ;
      $scope.previousLocation[1] = null;
      $scope.undoLocUpdate = "false";
    }
    // reset the locations array when retyping a new adress from scratch
    if (($scope.location.formattedAddress.length < 5) && angular.isArray($scope.locations)) {
      $scope.locations = null;
    }
    
    // fetch adress from google map and store in array for presentation
    if ($scope.location.formattedAddress.length > 5 ) {
      geocoder.geocode({
        'address': $scope.location.formattedAddress
        }, 
        function(results, status) {
          if(status == google.maps.GeocoderStatus.OK) { 
            $scope.locations = results;
          //  return ;
          }
          if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
            $scope.locations = [{ 'formatted_address': ' No match for this adress'}];
         //   return;
           }
        // return;
       });
     }
    }
  
  $scope.updateLocation = function() {
    var id = $scope.location._id;
    //var locData = $scope.location;
    //delete locData._id;
    
    Location.update({locationId: id}, $scope.location, function(location){
        $scope.location = location;
        $scope.undoLocUpdate= "true";
      }, 
      function(err){
        Alert.error('A system error while saving your location. Could you try again?' );
      }
    );
    console.log($scope.user.location);
  }
  
  // When the user validates a proposed location, the google api object is parsed
  // and relevant information stored into the database
  $scope.validateAdress = function(index){
    
    var address = $scope.locations[index];
    
    // parsing the google api address object
    address['address_components'].forEach(function(component) {
      if ( component['types'].indexOf('street_number') != -1 ) { $scope.location.streetNumber = component['short_name']; }
      if ( component['types'].indexOf('route') != -1 ) { $scope.location.route = component['short_name']; }
      if ( component['types'].indexOf('locality') != -1 ) { $scope.location.locality = component['short_name']; }
      if ( component['types'].indexOf('country') != -1 ) { $scope.location.country = component['short_name']; }
    });
    $scope.location.lat = address["geometry"]['location']['lat']();
    $scope.location.lng = address["geometry"]['location']['lng']();   
    $scope.location.formattedAddress = address['formatted_address'];
    $scope.locations = null;
    
    $scope.previousLocation[1] = angular.copy($scope.location);
    
    // updating the location in the database
    $scope.updateLocation();  
   
  //  return ;
  }
  
  $scope.undoLocation = function() {
    
    $scope.location = $scope.previousLocation[0];
    $scope.updateLocation(); 
    $scope.undoLocUpdate = "false";
  }
  
}
UserCtrl.$inject = ['$scope', 'User', 'Location', '$rootScope', 'Alert'];

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


function MapCtrl($scope, $rootScope, Location, homeLatLng, Alert) {
 
  
  $scope.$watch('myMap', function(myMap) {
    $scope.locations = Location.query(function() {
      
      angular.forEach($scope.locations, function(location) {
        var coordinates = new google.maps.LatLng(location.lat, location.lng);
        var newMarker = new google.maps.Marker({
          map: myMap,
          position: coordinates
        });
        location.marker = newMarker;
       });
     //$scope.myMarkers.push(newMarker);
     //$scope.openMarkerInfo(newMarker);
    });
  });
 
  $scope.mapOptions = {
    center: homeLatLng,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  $scope.addMarker = function($event) {
    var newMarker = new google.maps.Marker({
      map: $scope.myMap,
      position: $event.latLng
    });
    
    Location.save({
      '_creator': $rootScope.currentUser._id,
      'lat': newMarker.getPosition().lat(),
      'lng': newMarker.getPosition().lng()
      }, 
      function(location) {
        location.marker = newMarker;
        $scope.locations.push(location);
        $scope.openMarkerInfo(location);
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
   
    
    //console.log('delete marker: ' + marker)
  //  $scope.myMarkers.push(newMarker);
  //  $scope.openMarkerInfo(newMarker);
  };
  
   
  $scope.setZoomMessage = function(zoom) {
    $scope.zoomMessage = 'You just zoomed to '+zoom+'!';
    console.log(zoom,'zoomed')
  };
   
  $scope.openMarkerInfo = function(location) {
    $scope.currentLocation = location;
    $scope.currentMarkerLat = location.marker.getPosition().lat();
    $scope.currentMarkerLng = location.marker.getPosition().lng();
    
    switch(location.locationType) {
      case 'user':
        $scope.userWindow.open($scope.myMap, location.marker);
        break;
      case 'hospital':
        $scope.userWindow.open($scope.myMap,  location.marker);
        break;
      case 'doctor':
        $scope.userWindow.open($scope.myMap,  location.marker);
        break;
      default:
        $scope.userWindow.open($scope.myMap,  location.marker);
    }
  };
   
  $scope.setMarkerPosition = function(marker, lat, lng) {
    marker.setPosition(new google.maps.LatLng(lat, lng));
  };
}
MapCtrl.$inject = ['$scope', '$rootScope', 'Location', 'homeLatLng', 'Alert'];

// To load the map you need to have the home latitude and longitude resolved beforehand!
MapCtrl.resolve = {
  homeLatLng: function($q, $http, Location) {
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
    }
}
  
