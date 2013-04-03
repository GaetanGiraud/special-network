'use strict';

/* Controllers */

function AppCtrl($scope, AuthService, $location, Child, $rootScope, Alert) {
  /*
   * 
   * The application controller handles the socket.io interface.
   * It receives socket messages from the server and propagate them through  the application.
   * It gathers application messages and send them to the server.
   */
  
  
  // connection logic
  var socket;
	var firstconnect = true;
  
  $scope.connect = function connect() {
			if(firstconnect) {
	        	socket = io.connect(null);
            firstconnect = false;
			}
			else {
				socket.socket.reconnect();
			}
		}

    // connect to the server on start up.
    $scope.connect();
     
    // watch the logged in variable for changes. When value goes from false to true, attempt connection.
    $rootScope.$watch('loggedin', function(loggedin) {
        if (loggedin) {
        scope.connect();
      }
     });
     
    
    // handling communication messages.
     
    socket.on('error', function (reason){
      //Alert.error('We are unable to connect to the server. We might be having technical difficulties,' +
      //    ' if so we are probably working on them right now.'+
      //    ' Alternatively, you might want to check your internet connection. ');
      console.error('error', reason);
     });
      
    socket.on('disconnect', function (reason){
    //      Alert.error('You have been disconnected. We might be having technical difficulties,' +
    //      ' if so we are probably working on them right now.'+
    //      ' Alternatively, you might want to check your internet connection. ');
          
        console.error('disconnect', reason);
    });
      
    socket.on('connect', function (){
        //  Alert.success('You are connected!');
          console.info('successfully established a working and authorized connection');
    });
      
  
  // receiving events from the server and dispaching to the application
        
        socket.on('newComment', function (data) {
            $scope.$broadcast('event:newComment', data);
            console.log('new Comment');
        });
        
        socket.on('newDiscussion', function (data) {
            $scope.$broadcast('event:newDiscussion', data);
            console.log(data);
            console.log('new Discussion');
        });
      
        socket.on('discussionSavedSuccess', function (data) {
          console.log('success ' + data);
            $scope.$broadcast('event:discussionSavedSuccess', data);
        });
       
  // receiving events from the application and dispaching them to the server
       
         $scope.$on('event:commentAdded', function(event, index, comment, id) {
           socket.emit('commentAdded', { 'comment': comment, 'discussionId': id});
         });
        
        $scope.$on('event:discussionCreated', function(event, discussion) { 
           socket.emit('discussionCreated', discussion);          
        });
        
        $scope.$on('event:socketDisconnect', function() {
           Alert.error('You have been disconnected from the server');
           socket.disconnect();
        });
    // }
  //});





  $scope.openLoginDialog = function() { 
    AuthService.loginModal(function(result){
      if (result) {
        $location.path('/');
      }
    });
  }
  
  // for the menu bar
  $scope.$watch('currentUser', function(currentUser) {
    if(currentUser) {
      $scope.followed = Child.query({following: true});
      console.log(currentUser);
      if (!currentUser.settings.optOut) { $scope.myChildren = Child.query(); }
    } 
  });
  
}
AppCtrl.$inject = ['$scope', 'AuthService', '$location', 'Child', '$rootScope', 'Alert'];

function DialogCtrl($scope, dialog){
  $scope.close = function(result){
    dialog.close(result);
  };
}
DialogCtrl.$inject = ['$scope', 'dialog'];

/*
 * 
 * 
 * User login and Logout
 * 
 * 
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
        $location.path('/home');
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

function UserCtrl($scope, User, $rootScope, Alert, Location, GeoCoder) {
    
  $scope.undoLocUpdate = "false";
  var previousLocation = [];
  
  $scope.$watch('currentUser', function(currentUser) {
    if (angular.isUndefined(currentUser.location)) {
      $scope.currentUser.location = {};
    } 
  });
  
  /*$scope.location = Location.get({locationId: $rootScope.currentUser._location}, 
     function(location) {
          
        if (angular.isUndefined(location.lat)) {
           $scope.showLocationWidget = true;
        } else {         
          previousLocation[0] = angular.copy(location);
        }
   });
   */


  $scope.updateUser = function(isUndo) {  
    User.update({userId: $scope.currentUser._id}, $scope.currentUser, 
      function(user){
        $rootScope.currentUser = user;
        $scope.undoLocUpdate= isUndo;
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
    $scope.updateUser(false);
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
           $scope.currentUser.location = angular.extend($scope.currentUser.location, results);
           previousLocation[0] = angular.copy($scope.currentUser.location);
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
    
    if (($scope.currentUser.location.formattedAddress.length < 5) && angular.isArray($scope.locations)) {
     $scope.locations = null;
     $scope.undoLocUpdate = "false";
    }
    if ($scope.currentUser.location.formattedAddress.length > 5 ) {
      GeoCoder.getLocation($scope.currentUser.location, function(results) {
        $scope.locations = results;
      });
    } 
  }
  
 /* $scope.updateLocation = function(isUndo) {
    Location.update({locationId: $scope.location._id}, $scope.location, 
      function(location){
        $scope.location = location;
        $scope.undoLocUpdate= isUndo;
      }, 
      function(err){ 
        Alert.error('A system error while saving your location. Could you try again?' );
      }
    );
  }*/
  
  $scope.validateAdress = function($index) {
    var newAddress = $scope.locations[$index];
   
    GeoCoder.parseAddress(newAddress, function(result) {
       $scope.currentUser.location = angular.extend($scope.currentUser.location, result);
       previousLocation[1] = angular.copy($scope.currentUser.location);
       $scope.locations = null;
       $scope.updateUser("true");  
    });
  }
 
  $scope.undoLocation = function() {
    $scope.currentUser.location = previousLocation[0];
    $scope.updateUser("false");
  }
}
UserCtrl.$inject = ['$scope', 'User', '$rootScope', 'Alert', 'Location', 'GeoCoder'];

/*
 * 
 * 
 * Controllers for Discussion logic 
 * 
 * 
 */
 
function DiscussionCtrl($scope, $location) {

    $scope.createDiscussion = function() {
      $scope.newDiscussion.children = [];
    // linking chosen children to the discussion
       if ($scope.newDiscussion.type == 'update') {
         
         for(var i = 0; i < $scope.children.length; i++) {
           console.log($scope.children[i].send)
           if ($scope.children[i].send) { 
             $scope.newDiscussion.children.push($scope.children[i]); 
             }
         } 
       }
      $scope.$emit('event:discussionCreated', $scope.newDiscussion );
      $scope.discussions.unshift(angular.copy($scope.newDiscussion));
      $scope.newDiscussion.content = '';
      $scope.newDiscussion.children = ''; 
      
    }   
   
   
   $scope.$on('event:createDiscussion', function(){
      $scope.createDiscussion(); 
    });
    
    $scope.$on('event:newComment', function(event, comment) {
      console.log(comment);  
      for(var i = 0; i < $scope.discussions.length; i ++) {
        console.log($scope.discussions[i]._id);
        if ( $scope.discussions[i]._id == comment.discussionId) {
           $scope.$apply($scope.discussions[i].comments.push(comment.comment));
          break;     
        }
      }
    });
    
    $scope.$on('event:newDiscussion', function(event, discussion) {
      var location = $location.path();
      
      if (/children/.exec(location) != null && discussion.children.indexOf($scope.child._id) != -1) {
         $scope.$apply($scope.discussions.unshift(discussion));
      }
      if (/home/.exec(location) != null) {
         $scope.$apply($scope.discussions.unshift(discussion));
      }
      if (/question/.exec(location) != null && discussion.type == 'question' ) {
         $scope.$apply($scope.discussions.unshift(discussion));
      }
    });
    
    
     $scope.$on('event:discussionSavedSuccess', function(event, discussion) {
      $scope.$apply($scope.discussions[0] = discussion);
    });
    
    $scope.$on('event:commentAdded', function(event, index, comment) {
      $scope.discussions[index].comments.push(comment);
    });

}
DiscussionCtrl.$inject = ['$scope', '$location'];

function newCommentCtrl($scope) {
  $scope.newComment = {};
  
  $scope.$watch('currentUser', function(currentUser) {
      $scope.$watch('newComment', function(newComment) {
        $scope.newComment._creator = {_id: currentUser._id, name: currentUser.name, picture: currentUser.picture};
      });
  });
    
  $scope.createComment = function(index) {
      var discussionId = $scope.$parent.discussions[index]._id;
      $scope.$emit('event:commentAdded', index, $scope.newComment, discussionId );
      $scope.newComment = '';
  }
  
}
newCommentCtrl.$inject = ['$scope'];


/*
 *  Views controller.
 * 
 * They handle the logic and the data that is pecific to views
 * 
 */ 

/* 
 * 
 * Children ctrl for handling the children summary page.
 * Child ctrl for specific parts.
 * 
 * 
 */



function ChildrenCtrl($scope, Child, Alert, User) {
  //setting up some default values
  $scope.notFollowing = true;
  
  $scope.$watch('currentUser', function(currentUser) {
    if (angular.isDefined(currentUser)) {
      $scope.optOut = currentUser.settings.createChildOptOut;
    }
  });
 
  $scope.relationships = [
    {name:'Mother'},
    {name:'Father'},
    {name:'Grandpa'},
    {name:'Grandma'},
    {name:'Family'},
    {name:'Friend'}
  ];
  
  
  $scope.newChild = {
    creator: {
       _user: $scope.currentUser._id,
      relationship: "Mother"
      }
  };

  $scope.followedChildren = Child.query({following: true});

  // if the user has not opted to only follow children, show their children  
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
          _user: $scope.currentUser._id,
         relationship: "Mother"
        }
     };
   }, function(err) {
     Alert.error('Something happend in the system');
   });
  } 
  
  $scope.registerOptOut = function() {
    User.update({userId: $scope.currentUser._id}, {'settings.createChildOptOut': true}, 
      function() {
         $scope.optOut = true; 
      });
  }
  
}
ChildrenCtrl.$inject = ['$scope', 'Child', 'Alert', 'User'];

function ChildCtrl($scope, $http, $rootScope, $routeParams, Discussion, Child) {
  
   // setting up default values for discussions on the page. Logic is in Discussion controller.

    $scope.newDiscussion = {};
    $scope.newDiscussion.type ='update';
    $scope.$watch('currentUser', function(user) {
      $scope.newDiscussion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
    });
    $scope.children = [];
    
    
   // querying discussions on the server.
    $scope.discussions = Discussion.query({'children':  $routeParams.childId, 'page': 1});

    $scope.child = Child.get({childId:  $routeParams.childId }, function(child){
      child.send = true;
      $scope.children.push(child);
      $scope.newDiscussion.tags = child.superpowers;
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
     { '_creatorId': $rootScope.currentUser._id, // creator of the photo need to be recorded to recover the photos location
       'picture': file.name } ;
    $scope.updateChild();
  };
  
 /* $scope.addSpecialty = function(specialty, newSpecialty) {
    if(angular.isDefined(specialty)) {
      $scope.child.specialties.push(specialty); 
      if (newSpecialty) {
        $scope.newDiscussion.content = 'I have just created the ' + specialty + ' group, join it if you are interested!';
        $scope.newDiscussion.groups  = [ specialty ];
        $scope.$broadcast('event:createDiscussion');
      }
    }  else {
       $scope.child.specialties.push($scope.child.newSpecialty);   
    }
    $scope.updateChild();
  }*/
  
   $scope.addSuperpower = function(superpower, newSuperpower) {
    if(angular.isDefined(superpower)) {
      console.log('I am here');
      $scope.child.superpowers.push(superpower);
      console.log(superpower);
      if (newSuperpower)  {
        $scope.newDiscussion.content = 'I have just added a new superpower ( ' + superpower + ' ) to my page, come check it out!';
        $scope.newDiscussion.tags = [ superpower ];
        $scope.$broadcast('event:createDiscussion');
      } 
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


function HomeCtrl($scope, $rootScope, Discussion, $http, Alert, Child) {
    
    $scope.newDiscussion = {};
    //$scope.page = 1;
    
    // loading the data
    $scope.discussions = Discussion.query({'page': 1});

    $scope.children = Child.query({'post': true}, function(children){
      if (children.length > 0) {
        $scope.newDiscussion.type = 'update' ;
        $scope.initializeChildren();
      } else {
        $scope.newDiscussion.type = 'question' ;
        
      }
    });

    // setting up watchers
    $scope.$watch('currentUser', function(user) {
      $scope.newDiscussion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
    });
    
    $scope.$watch('children', function(children) {
      console.log('Change in chuldren');
      if ($scope.newDiscussion.type == 'update') {
        var count =  $scope.children.filter(function(child) { return child.send == true }).length;
        if (count == 0) {
          alert('You need to specify the child to which the update belong')
          $scope.initializeChildren();
        }
      }
    }, true);
    
    $scope.$watch('newDiscussion.type', function(type) {
      var childrenCount =  $scope.children.filter(function(child) { return child.send == true }).length;
      if (type == 'update') {
        $scope.initializeChildren();
      }
    });
    
  // functions
    $scope.initializeChildren = function() {
      $scope.children[0].send = true;
      $scope.newDiscussion.tags = angular.copy($scope.children[0].superpowers);
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
    
    $scope.loadTags = function(index) {
      if ($scope.children[index].send) { 
        $scope.newDiscussion.tags = $scope.children[index].superpowers;
      } else { 
          $scope.newDiscussion.tags = [];
      }
    }
    
    
}
HomeCtrl.$inject = ['$scope', '$rootScope', 'Discussion', '$http', 'Alert', 'Child'];


function QuestionsCtrl($scope, $rootScope, Discussion, $http, Alert) {
    
    // setting default values for new discussions.
    $scope.newDiscussion = {};
     
    $scope.newDiscussion = {};
    $scope.$watch('currentUser', function(user) {
      $scope.newDiscussion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
    });
    $scope.newDiscussion.type ='question';
    
    $scope.discussions = Discussion.query({type: 'question'});

    //$scope.children = Child.query({'post': true});
    $scope.children = [];

}
QuestionsCtrl.$inject = ['$scope', '$rootScope', 'Discussion', '$http', 'Alert'];

/*
 * 
 * Looking and finding people / places 
 * 
 * 
 * 
 */
 
function FindCtrl($scope, User, Alert, $http) {
  
  // declaring the search object and reseting some defaults.
  $scope.search = {} ;
  $scope.superpowers = [];
  $scope.search.lng = $scope.currentUser.location.loc[0];
  $scope.search.lat = $scope.currentUser.location.loc[1];
  $scope.search.distance = 10000;
  
  $scope.distances = [
    {'label': '10 km', 'value': 10},
    {'label': '25 km', 'value': 25},
    {'label': '50 km', 'value': 50},
    {'label': '100 km', 'value': 100},
    {'label': 'All', 'value': 10000},
  ];
   
  //$scope.homeLocation = $scope.currentUser.location;
   
  $scope.$watch('superpowers', function(superpowers) {
    console.log('superpowers changed!');
    $scope.getResults();  
    
  })
   
  $scope.getResults = function() {
   var params = angular.copy($scope.search);
   
   if ($scope.superpowers.length > 0) {
     params = angular.extend(params, { 'superpowers': $scope.superpowers });  
   }
  
   $http({method: 'GET', url: 'api/users/search', params: params }).
   success(function(data) {
     $scope.searchResults = data
     console.log('data received');
    });
   //console.log('results')
  //  User.query($scope.search) ;
    
  }
  

   
   
  $scope.selectedView = function(view) {
     if (view == 'find') return 'selected';
     return '';
  }
   
}
 
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
  
