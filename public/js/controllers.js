'use strict';

/* Controllers */

/*
 * 
 * Application Level Controllers
 * Handles views independant logic such as menubar, sibebar and socket connections
 * 
 */
function AppCtrl($scope, AuthService, $location, Child, $rootScope, Alert, Socket) {

  // connect to the socket 
  Socket.connect();
  
  // function opens the Log in dialog when unauthorized access is registered.    
  $scope.openLoginDialog = function() { 
    AuthService.loginModal(function(result){
      if (result) {
        $location.path('/');
      }
    });
  }
  
  // fetching the data for the sidebar
  $scope.$watch('currentUser', function(currentUser) {
    if(currentUser != null) {
      $scope.followed = Child.query({following: true});
      if (!currentUser.settings.optOut) { $scope.myChildren = Child.query(); }
    } 
  });
  
  /*
   * 
   * Add socket handler to handle real time updates and who's online mechanism
   * 
   * 
   */
  
}
AppCtrl.$inject = ['$scope', 'AuthService', '$location', 'Child', '$rootScope', 'Alert', 'Socket'];

// controller handling modal / dialog logic.
function DialogCtrl($scope, dialog){
  
  $scope.close = function(result){
    dialog.close(result);
  };
}
DialogCtrl.$inject = ['$scope', 'dialog'];

/*
 * 
 * 
 * User Logic
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
        Alert.success('Welcome ' + $scope.currentUser.name + ', you have successfullt logged in!');
      } else {
        Alert.error('Error logging in, please try again');
      }
    });
  }
  
  // When login in / registering using the login modal, the following functions are called.
  
  $scope.modalRegister = function() {
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
  
  $scope.modalLogin = function() {
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
  
  // Setting up some default values
  $scope.undoLocUpdate = "false";
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
        Alert.success('Your settings have been successfully updated.');
      }, 
      function(err){
        Alert.error('Error updating user: ' + err);
      }
    );
  }
  
  // Event triggered by the uploader directive. Actions to be performed after successfull upload of profile photo.
  $scope.setProfilePicture = function(file) {
    $rootScope.currentUser.picture = file.name;  
    $scope.updateUser(false);
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
     $scope.undoLocUpdate = "false";
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
 
function DiscussionCtrl($scope, $location, Socket) {

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
      Socket.socket().emit('discussionCreated', $scope.newDiscussion);
      
      $scope.discussions.unshift(angular.copy($scope.newDiscussion));
      $scope.newDiscussion.content = '';
      $scope.newDiscussion.children = ''; 
      
    }   
   
   
   $scope.$on('event:createDiscussion', function(){
      $scope.createDiscussion(); 
    });
    
   // Add new comment received on the opened socket / room.
   Socket.socket().on('newComment', function(comment) {
      console.log(comment);  
      for(var i = 0; i < $scope.discussions.length; i ++) {
        if ( $scope.discussions[i]._id == comment.discussionId) {
           $scope.$apply($scope.discussions[i].comments.push(comment.comment));
          break;     
        }
      }
    });
    
    // Add new discussion received on the opened socket / room.
    Socket.socket().on('newDiscussion', function(discussion) {
      $scope.$apply($scope.discussions.unshift(discussion));
    });
    
    // After creating discussion, update discussion with info sent back from the server.
    Socket.socket().on('discussionSavedSuccess', function(discussion) {
      $scope.$apply($scope.discussions[0] = discussion);
    });
    
    // Process event emited by new Comment controller
    $scope.$on('event:commentAdded', function(event, index, comment, id) {
      $scope.discussions[index].comments.push(comment);
      Socket.socket().emit('commentAdded', { 'comment': comment, 'discussionId': id});
    });

}
DiscussionCtrl.$inject = ['$scope', '$location', 'Socket'];

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

function MessageCtrl($scope, $location, Message, Socket, Child) {
    
     
  $scope.relationships = [
    {name:'Mother'},
    {name:'Father'},
    {name:'Grandpa'},
    {name:'Grandma'},
    {name:'Family'},
    {name:'Friend'}
  ];
  
    $scope.newMessage = {};
    $scope.newMessage.receivers = [];
    
    Message.query(function(err, data) {
       $scope.messages = data;  
    });
    
    $scope.$watch('currentUser', function(currentUser) {
      if (currentUser != null) {
        $scope.newMessage._creator = { '_id': currentUser._id, 'name': currentUser.name, 'picture': currentUser.picture } ;
        Socket.subscribe('messages_' +  currentUser._id );
      }
    });
    
    $scope.$watch('currentMessage', function(currentMessage) { 
      if ( angular.isDefined($scope.currentMessage)) {  
        console.log(currentMessage);
        if( angular.isDefined($scope.currentMessage.action) && ($scope.currentMessage._creator._id != $scope.currentUser._id) ) {
          $scope.showAction = true;
        } else {
        $scope.showAction = false;
        }
      }
    });
    
    $scope.messageStatus = function(message) {
      if (message._creator._id == $scope.currentUser._id) return message.read;  
      return _.find(message.receivers, function(receiver) { return receiver._user._id == $scope.currentUser._id  }).read;
    }
    
    $scope.setCurrentMessage = function(message) {
      $scope.currentMessage = message; 
      
  //    if (($scope.currentMessage._creator._id == $scope.currentUser._id) && (!$scope.currentMessage.read)) {
         $scope.currentMessage.read = true;
         Message.update($scope.currentMessage, {read: true});
    //   } 
      
      if (angular.isDefined(message.action) && (message._creator._id != $scope.currentUser._id) )
       {
         $scope.actionMessage = true;
        }
    }
  
    $scope.createMessage = function() {
      var message = angular.copy($scope.newMessage);
      _.each(message.receivers, function(element, index, list) {
        message.receivers[index] = { '_user': element._id._id };
      })
      console.log(message.receivers);
      
      Socket.socket().emit('messageCreated', message);
      $scope.messages.unshift(angular.copy($scope.newMessage));
      $scope.newMessage.content = '';
      $scope.newMessage.receivers = []; 
    }   
    
    $scope.respondtoFollowingRequest = function(acceptance) {
      if(acceptance) {
      Child.update({'childId': $scope.currentMessage.action.target._id },
         { permission: { _user: $scope.currentMessage._creator._id,
           rights: 'write',
           relationship: $scope.relationship}
          });
       }   
      Message.update($scope.currentMessage, {'action.executed': true});
    };
    
 // $scope.$on('event:createMessage', function(){
 //     $scope.createMessage(); 
 // });
    
   Socket.socket().on('newReply', function(reply) {
      console.log(reply);  
      for(var i = 0; i < $scope.messages.length; i ++) {
        console.log($scope.messages[i]._id);
        console.log(reply.messageId);
        if ( updatedAt[i]._id == reply.messageId) {
           $scope.$apply($scope.messages[i].replies.push(reply.reply));
           $scope.$apply($scope.messages[i].updatedAt = reply.reply.createdAt);
          break;     
        }
      }
    });
    
    
    Socket.socket().on('newMessage', function(message) {
         $scope.$apply($scope.messages.unshift(message));
    });
    
    Socket.socket().on('messageSavedSuccess', function(message) {
      $scope.$apply($scope.messages[0] = message);
    });
    
    $scope.$on('event:replyAdded', function(event, reply, id) {
      Socket.socket().emit('replyAdded', { 'reply': reply, 'messageId': id});
      //reply.createdAt =  Date.now();
      $scope.currentMessage.replies.push(reply);
      //$scope.currentMessage.updatedAt = reply.createdAt;
      //$scope.$digest($scope.messages);
      
      //console.log($scope.currentMessage.updatedAt);
    });

}
MessageCtrl.$inject = ['$scope', '$location', 'Message', 'Socket', 'Child'];

function newReplyCtrl($scope) {
  $scope.newReply = {};
  
  $scope.$watch('currentUser', function(currentUser) {
      if (currentUser != null) {
        $scope.$watch('newReply', function(newReply) {
          $scope.newReply._creator = {_id: currentUser._id, name: currentUser.name, picture: currentUser.picture};
        });
      }
  });
    
  $scope.createReply = function() {
      $scope.$emit('event:replyAdded', $scope.newReply, $scope.currentMessage._id );
      $scope.newReply = '';
  }
  
}
newReplyCtrl.$inject = ['$scope'];

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

  $scope.famillyChildren = Child.query({following: 'familly'});
  
  $scope.followedChildren = Child.query({following: 'others'});
  
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
  
  $scope.getRelationship = function(child) { 
    for(var i=0; child.permissions.length; i++) {
      if (child.permissions[i]._user == $scope.currentUser._id) {
        return child.permissions[i].relationship;
        break;  
      }
    }
  }
}
ChildrenCtrl.$inject = ['$scope', 'Child', 'Alert', 'User'];

function ChildCtrl($scope, $http, $rootScope, $routeParams, Discussion, Child, $location, Socket) {
  
   // setting up default values for discussions on the page. Logic is in Discussion controller.
    
    $scope.newDiscussion = {};
    $scope.newDiscussion.type ='update';
    $scope.$watch('currentUser', function(currentUser) {
      if (currentUser != null) {
        $scope.newDiscussion._creator = { '_id': currentUser._id, 'name': currentUser.name, 'picture': currentUser.picture } ;
      }
    });
    $scope.children = [];
    $scope.discussions = [];
    $scope.authorize = {};
    
   // querying discussions on the server.
    

    $scope.child = Child.get({childId:  $routeParams.childId }, function(child){
      // add the child to the discussion object.
      child.send = true;
      $scope.children.push(child);
      
      // fill in the child superpowers as discussiont tags by default
      $scope.newDiscussion.tags = child.superpowers;
      
      $scope.discussions = Discussion.query({'children':  child._id, 'page': 1});
      Socket.subscribe('child_' +  child._id );
      //console.log($scope.discussions);
      $scope.paginationUrl = '/api/discussions?children=' + $scope.child._id;
      
      console.log($scope.currentUser._id );
      console.log(child.creator._user);
      
      if ($scope.currentUser._id == child.creator._user) $scope.authorize.edit = true;
      
      for(var i = 0; child.permissions.length; i++) {
        if (child.permissions[i]._user == $scope.currentUser._id) {
          var permission = child.permissions[i];
          console.log(permission);
          if (permission.rights == 'write') $scope.authorize.post = true;
          break;
        }   
      }
      //console.log(child.permissions);
      //permission = child.permissions.indexOf( );
      
    });
    

   $scope.updateChild = function() {
     Child.update({childId: $scope.child._id}, $scope.child, 
      function(child){
        $scope.child = child;
        $location.url('/children/' + $scope.child.pageTitle);
        
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
  
    
   $scope.removeSuperpower = function(index) {
    $scope.child.superpowers.splice(index, 1);
    $scope.updateChild();
  }



  
  
}
ChildCtrl.$inject = ['$scope', '$http', '$rootScope', '$routeParams', 'Discussion', 'Child','$location', 'Socket'];

/*
 * 
 * Home Controller
 * 
 * Controlls the home thread
 * 
 * 
 */



function HomeCtrl($scope, $rootScope, Discussion, $http, Alert, Child, Socket) {
    Socket.subscribe('discussions');
    
    $scope.newDiscussion = {};
    
    // loading the data
    $scope.discussions = Discussion.query({'page': 1});
    $scope.children = [];
    
    // get all the children about which the user can post.
    $scope.children = Child.query({'post': 'true'}, function() {
      if ($scope.children.length > 0) {
        $scope.newDiscussion.type = 'update' ;
        $scope.initializeChildren();
      } else {
        // if the user is not allowed to post for any child, set the type to question.
        $scope.newDiscussion.type = 'question' ;
      } 
    });

    // setting up watchers
    $scope.$watch('currentUser', function(user) {
      if (user != null) {
        $scope.newDiscussion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
      }
    });
    
    $scope.$watch('children', function(children) {
    // Ensure that at least one child is selected when creating an update.
      if ($scope.newDiscussion.type == 'update') {
        var count =  $scope.children.filter(function(child) { return child.send == true }).length;
        if (count == 0) {
          alert('You need to specify the child to which the update belong')
          $scope.initializeChildren();
        }
      }
    }, true);
    
   /* $scope.$watch('newDiscussion.type', function(type) {
      var childrenCount =  $scope.children.filter(function(child) { return child.send == true }).length;
      if (type == 'update') {
        $scope.initializeChildren();
      }
    });*/
    
  // Set the first child as default child && use its superpowers as default tags
    $scope.initializeChildren = function() {
      $scope.children[0].send = true;
      $scope.newDiscussion.tags = angular.copy($scope.children[0].superpowers);
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

   // UI stuff

   // highlight the selected discussion type
    $scope.selectedDiscussion = function(type) {
      if ($scope.newDiscussion.type == type) return 'selected'; 
      return '';
    }    
    
}
HomeCtrl.$inject = ['$scope', '$rootScope', 'Discussion', '$http', 'Alert', 'Child', 'Socket'];


function QuestionsCtrl($scope, $rootScope, Discussion, $http, Alert, Socket) {
   // Socket.subscribe('Questions');
    // setting default values for new discussions.
    $scope.newDiscussion = {};
     
    $scope.newDiscussion = {};
    $scope.$watch('currentUser', function(user) {
      if (user != null ) {
        $scope.newDiscussion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
      }  
    });
    $scope.newDiscussion.type ='question';
    
    $scope.discussions = Discussion.query({type: 'question'});

    //$scope.children = Child.query({'post': true});
    $scope.children = [];

}
QuestionsCtrl.$inject = ['$scope', '$rootScope', 'Discussion', '$http', 'Alert', 'Socket'];

/*
 * 
 * Looking and finding people / places 
 * 
 * 
 * 
 */
 
function FindCtrl($scope, User, Alert, $http, Message) {
  
  $scope.search = {} ;
  $scope.search.type = "Users";
  $scope.superpowers = [];
    
  $scope.distances = [
    {'label': '10 km', 'value': 10},
    {'label': '25 km', 'value': 25},
    {'label': '50 km', 'value': 50},
    {'label': '100 km', 'value': 100},
    {'label': 'All', 'value': 10000},
  ];
  
  
  
  // declaring the search object and reseting some defaults.
  $scope.$watch('currentUser', function(user) {
    if (user != null && angular.isDefined(user.location)) {
      $scope.search.lng = user.location.loc[0];
      $scope.search.lat = user.location.loc[1];
    }
  });
  
  $scope.search.distance = 10000;
  

   
  //$scope.homeLocation = $scope.currentUser.location;
   
  $scope.$watch('superpowers', function(superpowers) {
    $scope.getResults();  
  })
   
  $scope.getResults = function() {
   var params = angular.copy($scope.search);
   
   if ($scope.superpowers.length > 0) {
     params = angular.extend(params, { 'superpowers': $scope.superpowers });  
   }
  
   $http({method: 'GET', url: 'api/users/search', params: params }).
   success(function(data) {
     console.log(data);
     $scope.searchResults = data;
    });
  }
  
  //
  
  $scope.followMe = function(child) {
    Message.send({
      content: $scope.currentUser.name + " wants to follow " + child.name,
      action: { 
        actionType: "following",
        target: child._id
        },
      _creator: $scope.currentUser._id,
      receivers: [ child.creator._user ]
      });
    
  }
  
  // Present results from search request
  $scope.myChildren = function(result) {
     var myChildren = [];
     
     angular.forEach(result.children, function(child) {
       if (child.creator._user ==  result._id._id) {
        this.push(child);
      }
     }, myChildren);
     return myChildren;
  }
  
  $scope.getSuperpowers = function(result) {
    var superpowers = [];
    
    angular.forEach(result.children, function(child) {
      //console.log(child.superpowers);
      superpowers = superpowers.concat(child.superpowers);
    });
    console.log(superpowers)
    return superpowers;
  }
  
  
  // UI stuff
  
  // Sub-menu selection
  $scope.selectedView = function(view) {
     if (view == 'find') return 'selected';
     return '';
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
  
