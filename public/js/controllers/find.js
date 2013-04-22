'use strict';

function FindCtrl($scope, User, Alert, $http, Message, GeoCoder) {
  
  //$scope.search = {} ;
  $scope.superpowers = [];
  $scope.search.distance = 10000;
  
  $scope.distances = [
    {'label': '10 km', 'value': 10},
    {'label': '25 km', 'value': 25},
    {'label': '50 km', 'value': 50},
    {'label': '100 km', 'value': 100},
    {'label': '500 km', 'value': 500},
    {'label': 'All', 'value': 10000},
  ];
  
  
  
  // declaring the search object and reseting some defaults.
  $scope.$watch('currentUser', function(user) {
    if (user != null && angular.isDefined(user.location)) {
      $scope.location = angular.copy(user.location);
    }
  });
    
  $scope.$watch('location', function(location){
     if (angular.isDefined(location)) { 
      $scope.search.lng = location.loc[0];
      $scope.search.lat = location.loc[1];
      $scope.getResults();
     }
   },true)
  
   
  $scope.$watch('search.term', function(superpowers) {
    if (angular.isDefined($scope.search.lng) && angular.isDefined($scope.search.lat)){
      $scope.getResults();  
    }
  })
  
  $scope.addSuperpower = function(superpower) {
    $scope.superpowers.push(superpower);
    $scope.getResults ();
  }
  
  $scope.removeSuperpower = function(superpower) {
    for(var i=0; i < $scope.superpowers.length; i++) {
        if ($scope.superpowers[i]._id == superpower._id)  {
          $scope.superpowers.splice(i, 1);
          $scope.getResults();
          break;
        }
      }
  }
   
  $scope.getResults = function() {
  var url = 'api/users/search';
   var params = angular.copy($scope.search);
   
   if ($scope.superpowers.length > 0) {
     var request;
     angular.forEach($scope.superpowers, function(superpower) {
          if(!request) {
            request = 'superpowers[]=' + superpower._id;
          } else  {
            request = request + '&superpowers[]=' + superpower._id;
          }
     });
     url = url + '?' + request;
     //params = angular.extend(params, { 'superpowers': $scope.superpowers });  
   }
  
   $scope.$safeApply($scope, function() {
      $http({method: 'GET', url: url, params: params }).
      success(function(data) {
     console.log('search results');
     console.log(data);
     $scope.searchResults = data;
    });
    });
  }
  
  //

  // Present results from search request
  $scope.myChildren = function(result) {
     var myChildren = [];
     
     angular.forEach(result.children, function(child) {
       if (child._id.creator._user ==  result._id._id) {
        this.push(child);
      }
     }, myChildren);
     return myChildren;
  }
  
  $scope.getLocation = function () { 
    $scope.editInProgress = true;
    if (($scope.location.formattedAddress.length < 5) && $scope.newLocation != null) {
     $scope.newLocation = null;
    }
    if ($scope.location.formattedAddress.length > 5 ) {
      GeoCoder.getLocation($scope.location, function(results) {
        console.log(results)
        GeoCoder.parseAddress(results[0], function(parsedResult) {
           $scope.newLocation = parsedResult;
        });
      
      });
    } 
  }

  // Validate the address, parse usefull information and update user in the database.
 
  $scope.validate = function() {
       $scope.location = $scope.newLocation;
       $scope.newLocation = null;
       $scope.showEdit = false;
       $scope.editInProgress = false;
  }
  
  
  // UI stuff
  
  // Sub-menu selection
  $scope.selectedView = function(view) {
     if (view == 'find') return 'selected';
     return '';
  }
   
}
FindCtrl.$inject = ['$scope', 'User', 'Alert', '$http', 'Message', 'GeoCoder'];

function SearchCtrl($scope, $http, $location ) {

   var getQuestions = function() {
   
   $http.get('/api/questions/search/', {params: {term: $scope.term }} )
   .success(function(data) {
      //$scope.questions = _.map(data.hits.hits, function(hit) { return hit._source });
      
      console.log(data); 
      $scope.data = data;  
    })
   //$scope.questions = data;  
   
  }     
  
  if (angular.isDefined( $location.search().term )){
     $scope.term = $location.search().term;
     
     getQuestions()
     
     console.log('term is defined');
     console.log()
    } 

}

 
function MapCtrl($scope, $rootScope, Location, homeLatLng, Map, Alert, User, Message) {
  
  $scope.mapOptions = Map.setMapOptions(homeLatLng);
  $scope.markers = [
    {locationType: 'hospital', description: 'Any medical facility where you have had a great experience.' },
    {locationType: 'shopping', description: 'Shops that provide something of great value for our kids.'},
    {locationType: 'clothing', description: 'Kids clothing'},
    {locationType: 'stroller', description: 'Baby Stuff'},
    {locationType: 'group', description: 'Support group next to you.' },
    {locationType: 'official', description: 'Official services, it can be difficult to find them, help others find their way in the bureaucratice maze'}
  ];
  
  $scope.$watch('myMap', function(myMap) {
    Map.initialize(myMap);
    $scope.locations = Map.setLocations(myMap);
    $scope.userLocations = Map.setUserLocations(myMap);
  });
  
  $scope.selectedView = function(view) {
    if (view == 'map') return 'selected';
    return '';
  }
  
  $scope.registerDrop = function($event, locationType) {
    Map.dropEvent($event, $scope.myMap, locationType, function(newMarker) {
      if (newMarker) { 
        $scope.currentLocation = {
          locationType: locationType,
          create: true,
          owner: true
          };
        $scope.currentMarker = newMarker;
        $scope.locationWindow.open($scope.myMap, $scope.currentMarker); 
      }
    });
  }
 
    
  $scope.createLocation = function() {
    Location.save({
      '_creator': $rootScope.currentUser._id,
      'name': $scope.currentLocation.name,
      'locationType': $scope.currentLocation.locationType,
      'lat': $scope.currentMarker.getPosition().lat(),
      'lng': $scope.currentMarker.getPosition().lng()
      }, 
      function(location) {
        location.marker = $scope.currentMarker;
        $scope.locations.push(location);
       // $scope.locationWindow.close();
        $scope.currentLocation.create = false;
        Alert.success('Location Added successfully!', 'modal'); 
      //  $scope.locationWindow.open($scope.myMap, $scope.currentMarker);
      },
     function(){
       $scope.removeMarker();
       Alert.error('A system error occurred, sorry for the inconvenience.'); 
     });
  };
  
  $scope.updateLocation = function() {
    Location.update({locationId: $scope.currentLocation._id}, {
      'name': $scope.currentLocation.name
      }, 
      function(location) {
        //$scope.locationWindow.close();
        Alert.success('Location Updated successfully!', 'modal'); 
      },
     function(){
      // $scope.removeMarker();
       Alert.error('A system error occurred while updated, sorry for the inconvenience.', 'modal'); 
     });
  };
  
  
  $scope.deleteLocation = function() {
    Location.delete({'locationId': $scope.currentLocation._id},
      function() {
        $scope.currentLocation.marker.setMap( null);
        $scope.currentLocation = '';
        return $scope.removeMarker();
        Alert.success('Location Deleted successfully!'); 
      },
      function() {
        return Alert.error('Could not delete this location', modal); 
      }
    );
   
  };
    
  $scope.openMarkerInfo = function(location) {
    $scope.currentLocation = location;
    $scope.currentMarkerLat = location.marker.getPosition().lat();
    $scope.currentMarkerLng = location.marker.getPosition().lng();
    
    if (location._creator == $rootScope.currentUser._id ) { 
        $scope.currentLocation.owner = true;
        $scope.locationWindow.open($scope.myMap, $scope.currentLocation.marker);
      } else {
        $scope.author = User.get({userId: location._creator});
      }
    $scope.locationWindow.open($scope.myMap, $scope.currentLocation.marker); 
  };
   
  $scope.removeMarker = function() {
     $scope.currentMarker.setMap(null);
     $scope.currentMarker = '';
  }
  
     
  /*
   * For references
   * 
   * $scope.setZoomMessage = function(zoom) {
    $scope.zoomMessage = 'You just zoomed to '+zoom+'!';
    console.log(zoom,'zoomed')
  }
  
  $scope.setMarkerPosition = function(marker, lat, lng) {
    marker.setPosition(new google.maps.LatLng(lat, lng));
  } */


}
MapCtrl.$inject = ['$scope', '$rootScope', 'Location', 'homeLatLng', 'Map', 'Alert', 'User'];

// To load the map you need to have the home latitude and longitude resolved beforehand!
MapCtrl.resolve = {
  homeLatLng: ['$q', '$http', 'Location', function($q, $http, Location) {
        var deferred = $q.defer();
        
         $http.get('/api/homelocation')
          .success(function(location) {
            if (angular.isDefined(location.loc)) {
              var response = new google.maps.LatLng(location.loc[1], location.loc[0]);
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
