'use strict';

/* Controllers */

function AppCtrl($scope, AuthService, $location, Child, $rootScope) {
  $scope.openLoginDialog = function() { 
    AuthService.loginModal(function(result){
      if (result) {
        $location.path('/');
      }
    });
  }
  
  // for the menu bar
  $rootScope.$watch('currentUser', function(currentUser) {
    if(currentUser) {
      $scope.followed = Child.query({following: true});
      console.log(currentUser);
      if (!currentUser.settings.optOut) { $scope.myChildren = Child.query(); }
    } 
  });
  
}
AppCtrl.$inject = ['$scope', 'AuthService', '$location', 'Child', '$rootScope'];

function HomeCtrl($scope, $rootScope, Discussion, $http, Alert, Child) {
    
    // setting default values for new discussions.
    var defaults = {
      'type': 'update',
      '_creator': $rootScope.currentUser._id
      }
    
    $scope.newDiscussion = defaults;

    $scope.discussions = Discussion.query({});

    $scope.children = Child.query({'post': true});
    
    $scope.createDiscussion = function() {
    
    // linking chosen children to the discussion
       if ($scope.newDiscussion.type == 'update') {
         $scope.newDiscussion.children = [];
         
         for(var i = 0; i < $scope.children.length; i++) {
           console.log($scope.children[i].send)
           if ($scope.children[i].send) { 
             $scope.newDiscussion.children.push($scope.children[i]._id); 
             }
         } 
       }
       Discussion.save($scope.newDiscussion, function(data) {
         $scope.discussions.unshift(data);
         $scope.newDiscussion = '';
       },
       function(err) {
         Alert.error(err);
      }); 
      
    }
    
    $scope.selectedDiscussion = function(type) {
      if ($scope.newDiscussion.type == type) return 'selected'; 
      return '';
    }
    
    $scope.addPicture = function(file) {
      $scope.$apply(function() {
        $scope.newDiscussion.picture = file.name; 
      });
    }
    
    $scope.$on('event:commentAdded', function(event, index, comment) {
      $scope.discussions[index].comments.push(comment);
    });
    
}
HomeCtrl.$inject = ['$scope', '$rootScope', 'Discussion', '$http', 'Alert', 'Child'];

function newCommentCtrl($scope, $rootScope, $http, Alert) {
  $scope.newComment = {};
  
  $rootScope.$watch('currentUser', function(currentUser) {
      $scope.$watch('newComment', function(newComment) {
        $scope.newComment._creator = currentUser._id;
      });
  });
    
  $scope.createComment = function(index) {
      var discussionId = $scope.$parent.discussions[index]._id;
  
      var comment = $http({method: 'POST', url: '/api/discussions/' + discussionId + '/comments' , data: $scope.newComment})
      .success(function(comment) {
        $scope.$emit('event:commentAdded', index, comment );
        $scope.newComment = '';
      });
     
  }
  
}

function QuestionsCtrl($scope, $rootScope, Discussion, $http, Alert) {
    
    // setting default values for new discussions.
    $scope.newDiscussion = {};
    $scope.newDiscussion.type ='question';
    $scope.newDiscussion._creator = $rootScope.currentUser._id;

   // querying discussions on the server.
    $scope.discussions = Discussion.query({type: 'question'});

    $scope.createQuestion = function() {
       Discussion.save($scope.newDiscussion, function(data) {
        $scope.discussions.unshift(data);
        $scope.newDiscussion = {};
        $scope.newDiscussion.type ='update';
        $scope.newDiscussion._creator = $rootScope.currentUser._id;
       },
       function(err) {
         Alert.error(err);
         //$scope.discussions[index-1] = '';
      }); 
      
    }

    $scope.createComment = function(index, newComment) {
      var discussionId = $scope.discussions[index]._id;
  
      var comment = $http({method: 'POST', url: '/api/discussions/' + discussionId + '/comments' , data: newComment})
      .success(function(comment) {
         $scope.discussions[index].comments.push(comment);
        });
    }
    
    $scope.$on('event:commentAdded', function(event, index, comment) {
      console.log('got you ' + index + ' coucou');
      $scope.discussions[index].comments.push(comment);
    });
    
}
QuestionsCtrl.$inject = ['$scope', '$rootScope', 'Discussion', '$http', 'Alert'];



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
    
  //$scope.user = User.get({userId: $rootScope.currentUser._id}, 
  //  function(user) {       
  $scope.location = Location.get({locationId: $rootScope.currentUser._location}, 
     function(location) {
     //    $scope.location = location;
          
        if (angular.isUndefined(location.lat)) {
           $scope.showLocationWidget = true;
        } else {         
          previousLocation[0] = angular.copy(location);
        }
//    });
   });
   


  $scope.updateUser = function() {  
    User.update({userId: $rootScope.currentUser._id}, $rootScope.currentUser, 
      function(user){
        $rootScope.currentUser = user;
        Alert.success('Your settings have been successfully updated.');
      }, 
      function(err){
        Alert.error('Error updating user: ' + err);
      }
    );
  }
  
  // Event triggered by the uploader plugin. Actions to be performed after successfull upload of profile photo.
  $scope.setProfilePicture = function(file) {
    $rootScope.currentUser.picture = file.name;  
    $scope.updateUser();
  };
  
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
       });
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


function ChildrenCtrl($scope, Child, Alert, User, $rootScope, $http) {
  //setting up some default values
  $scope.notFollowing = true;
  //$scope.user = {};
  
  
  
  $rootScope.$watch('currentUser', function(currentUser) {
    $scope.optOut = currentUser.settings.createChildOptOut;
  });
 
  $scope.relationships = [
    {name:'Mother'},
    {name:'Father'},
    {name:'Grandpa'},
    {name:'Grandma'},
    {name:'Family'},
    {name:'Friend'}
  ];
  
 // $scope.newChild = {};
  //$scope.newChild.creator = { _creatorId: $rootScope.currentUser._id};
 // $scope.newChild.creator.relationship = "Mother";
  
  $scope.newChild = {
    creator: {
       _creatorId: $rootScope.currentUser._id,
      relationship: "Mother"
      }
  };
  

//  $scope.search = '';
  $scope.followedChildren = Child.query({following: true}, function(data) {
    console.log(data);
   // if (data.length > 0) $scope.notFollowing = false;
  });
  
  if (!$scope.optOut) { $scope.children = Child.query(); }

 
  $scope.deleteChild = function(index) {
    Child.delete({ childId: $scope.children[index]._id }, 
      function () { Alert.success('The page has been removed from the database'); },
      function() { Alert.error('An error occured while saving in the database'); }
    );
    $scope.children.splice(index, 1);
  }
  
  $scope.addChild = function() {
   Child.save($scope.newChild, function(child) {
     $scope.children.push(child);
     Alert.success('Successfully created a page for ' +  child.name);
    
     $scope.newChild = {
       creator: {
          _creatorId: $rootScope.currentUser._id,
         relationship: "Mother"
        }
     };
   }, function(err) {
     Alert.error('Something happend in the system');
   });
  } 
  
  $scope.registerOptOut = function() {
    User.update({userId: $rootScope.currentUser._id}, {'settings.createChildOptOut': true}, 
      function() {
         $scope.optOut = true; 
      });
  }
  
}
ChildrenCtrl.$inject = ['$scope', 'Child', 'Alert', 'User', '$rootScope', '$http'];

function ChildCtrl($scope, $http, $rootScope, $routeParams, Discussion, Child) {
  
    $scope.newDiscussion = {};
    $scope.newDiscussion.type ='update';
    $scope.newDiscussion._creator = $rootScope.currentUser._id;
    $scope.newDiscussion.children = [];
    
   // querying discussions on the server.
    $scope.discussions = Discussion.query({'children':  $routeParams.childId});

   $scope.child = Child.get({childId:  $routeParams.childId });
  // $http({method: 'GET', url: '/api/children/' + $routeParams.childId})
  //  .success(function(data, status, headers, config) {
 //           $scope.child = data;
           // return true;
//    })
  //  .error(function(data, status, headers, config) {
   //         return data;
   // });
    
 
    $scope.createUpdate = function() {
       $scope.newDiscussion.children.push($scope.child._id);
       console.log('creating uppdate');
       Discussion.save($scope.newDiscussion, function(data) {
        $scope.discussions.unshift(data);
        $scope.newDiscussion.content = '';
       },
       function(err) {
         Alert.error(err);
         //$scope.discussions[index-1] = '';
      }); 
      
    }

   $scope.$on('event:commentAdded', function(event, index, comment) {
      console.log('got you ' + index + ' coucou');
      $scope.discussions[index].comments.push(comment);
    });

   $scope.updateChild = function() {
     Child.update({childId: $scope.child._id}, $scope.child, 
      function(child){
        $scope.child = child;
      }, 
      function(err){ 
        Alert.error('A system error while saving the page. Could you try again?' );
      }
    );
  }
    
  $scope.setProfilePicture = function(file) {
    $scope.child.picture = 
     { '_creatorId': $rootScope.currentUser._id, 
       'picture': file.name } ;
    $scope.updateChild();
  };
  
  $scope.addSpecialty = function(specialty) {
    if(angular.isDefined(specialty)) {
      $scope.child.specialties.push(specialty); 
      $scope.newDiscussion.content = 'I have just created the ' + specialty + ' group, join it if you are interested!';
      $scope.newDiscussion.groups  = [ specialty ];
      $scope.createUpdate();
    }  else {
       $scope.child.specialties.push($scope.child.newSpecialty);   
    }
    $scope.updateChild();
  }
  
   $scope.addSuperpower = function(superpower) {
    if(angular.isDefined(superpower)) {
      console.log('I am here');
      $scope.child.superpowers.push(superpower);  
      $scope.newDiscussion.content = 'I have just added a new superpower ( ' + superpower + ' ) to my page, come check it out!';
      $scope.newDiscussion.tags = [ superpower ];
      $scope.createUpdate();
    }  else {
       $scope.child.superpowers.push($scope.child.newSuperpower);   
    }
    
    $scope.updateChild();
  }
  
  $scope.removeSpecialty = function(index) {
    $scope.child.specialties.splice(index, 1);
    $scope.updateChild();
  }
    
    
   $scope.removeSuperpower = function(index) {
    $scope.child.superpowers.splice(index, 1);
    $scope.updateChild();
  }



  
  
}
ChildCtrl.$inject = ['$scope', '$http', '$rootScope', '$routeParams', 'Discussion', 'Child'];



/*
 * 
 * Looking and finding people / places 
 * 
 * 
 * 
 */


function MapCtrl($scope, $rootScope, Location, homeLatLng, Map, Alert, User) {
  
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
  
