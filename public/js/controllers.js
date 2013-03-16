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
  // Fetch the user and its location
  
  $scope.user = User.get({userId: $rootScope.currentUser._id}, 
    function(user) {       
      $scope.location = Location.get({locationId: user._location}, 
      function(location) {
          previousLocation[0] = angular.copy(location);
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





/* 
 * Controller for the geocoder API
 * $scope is a sub-scope of the UserCtrl
 * 
 */


// function LocationCtrl($scope, Location, $rootScope, Alert) {
 // var geocoder = new google.maps.Geocoder();
  
 // $scope.undoLocUpdate = "false";
  
    // Getting the adress based on geolocation by google
  
  /*$scope.getLocation = function() { 
    
    // When starting to type in a new address, if a secondary address has been typed in, 
    //use it as previous adress for the undo function
    if ( $scope.$parent.previousLocation[1] != null) {
      $scope.$parent.previousLocation[0] = angular.copy($scope.$parent.previousLocation[1]) ;
      $scope.$parent.previousLocation[1] = null;
      $scope.undoLocUpdate = "false";
    }
    
    // reset the locations array when retyping a new adress from scratch
    if (($scope.$parent.location.formattedAddress.length < 5) && angular.isArray($scope.locations)) {
      $scope.locations = null;
    }
    
    // fetch adress from google map and store in array for presentation
    if ($scope.$parent.location.formattedAddress.length > 5 ) {
      geocoder.geocode({
        'address': $scope.$parent.location.formattedAddress
        }, 
        function(results, status) {
          if(status == google.maps.GeocoderStatus.OK) { 
            $scope.locations = results;
          }
          if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
            $scope.locations = [{ 'formatted_address': 'No match found, type some more!'}];
           }
       });
     }
    }*/
  
  /*$scope.updateLocation = function(isUndo) {
    var id = $scope.$parent.location._id;

    Location.update({locationId: id}, $scope.$parent.location, function(location){
        $scope.$parent.location = location;
        $scope.undoLocUpdate= isUndo;
      }, 
      function(err){
        Alert.error('A system error while saving your location. Could you try again?' );
      }
    );
   // console.log($scope.user.location);
  }*/
  
  // When the user validates a proposed location, the google api object is parsed
  // and relevant information stored into the database
  /*
   var address = $scope.locations[index];
   
  $scope.validateAdress = function(locations[index]){
    
    var address = $scope.locations[index];
    
    // parsing the google api address object
    address['address_components'].forEach(function(component) {
      if ( component['types'].indexOf('street_number') != -1 ) { $scope.$parent.location.streetNumber = component['short_name']; }
      if ( component['types'].indexOf('route') != -1 ) { $scope.$parent.location.route = component['short_name']; }
      if ( component['types'].indexOf('locality') != -1 ) { $scope.$parent.location.locality = component['short_name']; }
      if ( component['types'].indexOf('country') != -1 ) { $scope.$parent.location.country = component['short_name']; }
    });
    $scope.$parent.location.lat = address["geometry"]['location']['lat']();
    $scope.$parent.location.lng = address["geometry"]['location']['lng']();   
    $scope.$parent.location.formattedAddress = address['formatted_address'];
    $scope.$parent.locations = null;
    
    $scope.$parent.previousLocation[1] = angular.copy($scope.location);
    
    // updating the location in the database
    $scope.updateLocation("true");  

  }
  
  $scope.undoLocation = function() {
    $scope.$parent.location = $scope.$parent.previousLocation[0];
    $scope.updateLocation("false"); 
  }
  
}
LocationCtrl.$inject = ['$scope', 'Location', '$rootScope', 'Alert'];
*/
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
  
  /*var dummy, drag_area;

  function Dummy(map) {
    this.setMap(map);
  }
  Dummy.prototype = new google.maps.OverlayView();
  Dummy.prototype.draw = function() {};
      
  drag_area = document.getElementById("markers");
    
   // initialize map options
  $scope.mapOptions = {
    center: homeLatLng,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_LEFT 
      }
   };
 
  // waiting until the object myApp is available to intialize the markers
  $scope.$watch('myMap', function(myMap) {
  
    dummy = new Dummy(myMap);
             
    $scope.locations = Location.query(function() {
      
      angular.forEach($scope.locations, function(location) {
        var coordinates = new google.maps.LatLng(location.lat, location.lng);
        var newMarker = new google.maps.Marker({
          map: myMap,
          position: coordinates
        });
        location.marker = newMarker;
       });
    });
  });*/
 
  $scope.endMove = function($event) {
   Map.dropEvent($event, $scope.myMap, function(newMarker) {
      if (newMarker) $scope.createLocation(newMarker);
   });
    
    /*var element= $event.target;
    
    var mapDiv = $scope.myMap.getDiv(),
        mapDivLeft = mapDiv.offsetLeft,
        mapDivTop = mapDiv.offsetTop,
        mapDivWidth = mapDiv.offsetWidth,
        mapDivHeight = mapDiv.offsetHeight;
    
    var dropPosLeft = $event.clientX;
    var dropPosTop = $event.clientY;
     
    var eleWidth = element.offsetWidth,
        eleHeight = element.offsetHeight;

   
    if (dropPosLeft > mapDivLeft && dropPosLeft < (mapDivLeft + mapDivWidth) && dropPosTop > mapDivTop && dropPosTop < (mapDivTop + mapDivHeight)) {
      
      var mapPosition = new  google.maps.Point(dropPosLeft -  mapDivLeft, dropPosTop + eleHeight/2- mapDivTop);
      var LatLng = dummy.getProjection().fromContainerPixelToLatLng(mapPosition);
      
      var newMarker = new  google.maps.Marker({
        map: $scope.myMap,
        position: LatLng
      });*/

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
  
