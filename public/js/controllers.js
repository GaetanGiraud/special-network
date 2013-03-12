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
    console.log('closing dialog');
    dialog.close(result);
  };
}
DialogCtrl.$inject = ['$scope', 'dialog'];

function LoginCtrl($scope, User, $rootScope, $location, AuthService) {

  $scope.register = function() {
    var user = User.save($scope.newUser, 
      function() {
        console.log(user);
        $scope.isNotRegistered = false;
        $scope.user = user;
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
        
      } else {
        $scope.msg = {content: 'Error logging in, please try again', type: 'error'};
      }
    });
  }

}
LoginCtrl.$inject = ['$scope', 'User', '$rootScope', '$location', 'AuthService'];


function UserCtrl($scope, User, Location, $rootScope) {
 // initialize variables and constructors
  $scope.previousLocation = [];
     
  $scope.user = User.get({userId: $rootScope.currentUser._id}, 
    function(user) {
      $scope.location = Location.get({locationId: user._location}, 
        function(location) {
           // Saving the actual location to allow undo function  
          $scope.previousLocation[0] = angular.copy(location);
        });
  });
  
  $scope.undoLocUpdate = "false";
   
  var geocoder = new google.maps.Geocoder();
  
  if ( angular.isDefined( $scope.location) == false) {
    $scope.location = {}
  } else {
    
  }
  
  $scope.$on('event:profilePictureUploaded', function(res, filename) {
    $scope.user.picture = filename;  
    $scope.updateUser();
  });
  
  
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
        console.log('User successfully updated');
      }, 
      function(err){
        console.log('Error updating user: ' + err);
      }
    );
  }
  
  /* 
   * Getting the adress based on geoloc 
   * 
   */
   
  $scope.getLocation = function() { 
    if ( $scope.previousLocation[1] != null) {
      // When starting to type in a new address, if a secondary address has been typed in, use it for undo
      $scope.previousLocation[0] = angular.copy($scope.previousLocation[1]) ;
      $scope.previousLocation[1] = null;
    }
     if ($scope.location.formattedAdress.length > 5 ) {
        
       geocoder.geocode({
         'address': $scope.location.formattedAdress
         }, 
         function(results, status) {
         if(status == google.maps.GeocoderStatus.OK) { 
           $scope.locations = results;
           return ;
         }
         if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
           $scope.locations = [{ 'formatted_address': ' No match for this adress'}];
           return;
          }
         return;
       });
     }
    }
  
  $scope.updateLocation = function(id, data) {
    Location.update({locationId: id}, data, function(location){
        $scope.location = location;
        console.log('User successfully updated');
      }, 
      function(err){
        console.log('Error updating user: ' + err);
      }
    );
    console.log($scope.user.location);
  }
  
  $scope.validateAdress = function(index){
    
    var address = $scope.locations[index];
    
    address['address_components'].forEach(function(component) {
      if ( component['types'].indexOf('street_number') != -1 ) { $scope.location.streetNumber = component['short_name']; }
      if ( component['types'].indexOf('route') != -1 ) { $scope.location.route = component['short_name']; }
      if ( component['types'].indexOf('locality') != -1 ) { $scope.location.locality = component['short_name']; }
      if ( component['types'].indexOf('country') != -1 ) { $scope.location.country = component['short_name']; }
    });
   
    $scope.location.lat = address["geometry"]['location']['lat']();
    $scope.location.lng = address["geometry"]['location']['lng']();   
    $scope.location.formattedAdress = address['formatted_address'];
    $scope.locations = null;
    
    $scope.previousLocation[1] = angular.copy($scope.location);
    
    // updating the location in the database
    var id = $scope.location._id;
    var locData = $scope.location;
    delete locData._id;
    $scope.undoLocUpdate= "true";
    
    $scope.updateLocation(id, locData);  
   
    return ;
  }
  
  $scope.undoLocation = function() {
    
    $scope.location = $scope.previousLocation[0];
    var id = $scope.location._id;
    var locData = $scope.location;
    delete locData._id;
    $scope.updateLocation(id, locData); 
    $scope.undoLocUpdate = "false";
    
    return ;
  }
  
}
UserCtrl.$inject = ['$scope', 'User', 'Location', '$rootScope'];

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

function LogoutCtrl($scope, AuthService) {
  AuthService.logout();
}
LogoutCtrl.$inject = ['$scope', 'AuthService'];

function MapCtrl($scope, $rootScope, Location, homeLocation) {
  $scope.myMarkers = [];
  $scope.homeLocation = homeLocation;
  
  /*if (angular.isDefined($rootScope.homeLocation.lat)) {
    var homeLatLng = new google.maps.LatLng($rootScope.homeLocation.lat, $rootScope.homeLocation.lng);
  } else {
   var homeLatLng = new google.maps.LatLng(35.0, 35.0);
  }
  */
 var homeLatLng = new google.maps.LatLng($scope.homeLocation.lat, $scope.homeLocation.lng);

  $scope.$watch('myMap', function(myMap) {
    var newMarker = new google.maps.Marker({
      map: myMap,
      position: homeLatLng
    });
    
   $scope.myMarkers.push(newMarker);
  });

  $scope.mapOptions = {
    center: homeLatLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  $scope.addMarker = function($event) {
    var newMarker = new google.maps.Marker({
      map: $scope.myMap,
      position: $event.latLng
    });
    
    $scope.myMarkers.push(newMarker);
    $scope.openMarkerInfo(newMarker);
  };
  
  
  $scope.deleteMarker = function(marker) {
    console.log('delete marker: ' + marker);
    //delete $scope.myMarkers[index];
    
    marker.setMap( null);
    
    //console.log('delete marker: ' + marker)
  //  $scope.myMarkers.push(newMarker);
  //  $scope.openMarkerInfo(newMarker);
  };
  
   
  $scope.setZoomMessage = function(zoom) {
    $scope.zoomMessage = 'You just zoomed to '+zoom+'!';
    console.log(zoom,'zoomed')
  };
   
  $scope.openMarkerInfo = function(marker) {
    $scope.currentMarker = marker;
    $scope.currentMarkerLat = marker.getPosition().lat();
    $scope.currentMarkerLng = marker.getPosition().lng();
    $scope.myInfoWindow.open($scope.myMap, marker);
  };
   
  $scope.setMarkerPosition = function(marker, lat, lng) {
    marker.setPosition(new google.maps.LatLng(lat, lng));
  };
}
MapCtrl.$inject = ['$scope', '$rootScope', 'Location', 'homeLocation'];

MapCtrl.resolve = {
  homeLocation : function($q, $http, Location) {
        var deferred = $q.defer();
        
         $http.get('/api/currentuser')
          .success(function(user) {
            Location.get({locationId: user._location}, 
              function(location){
                deferred.resolve(location);
            });
          })
          .error(function(data){
            deferred.resolve("error value");;
          });
        return deferred.promise;
    }
}
  
