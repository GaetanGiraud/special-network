'use strict';


/*
 * 
 * Application Level Controllers
 * Handles views independant logic such as menubar, sibebar and socket connections
 * 
 */
function AppCtrl($scope, AuthService, $location, Child, $rootScope, Alert, Socket, Message, $http) {

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
  
  $scope.$watch('loggedIn', function(loggedIn) {
     if (loggedIn) {
     $scope.myTags = $http.get('/api/tags', { params : { mytags: true } })
           .success(function(data) { 
              $scope.myTags = data;
              $scope.searchTags = angular.copy(data);
             })
    }
  });
        
  // fetching the data for the sidebar
  $scope.$watch('currentUser', function(currentUser) {
    if(currentUser != null) {
      //$scope.followed = Child.query({following: true});
      Message.getUnreadMessagesCount(function(err, data) {
        $scope.unreadMessageCount = data.messageCount;
      });
    
    
    
  /*  opts = 'creator._user': {$ne: currentUser._id }, 'permissions.relationship': { $ne: 'Friend' }};
  } else if (req.query.following == "others") {
    opts = {'permissions._user': currentUser._id, 'creator._user': {$ne: currentUser._id }, 'permissions.relationship': 'Friend' };
  } else if(req.query.post) {
     opts = {'permissions._user': currentUser._id, 'permissions.rights': 'write'};
  } else {
    opts = {'creator._user': req.session.user};
  }*/
    
    
    // _.where({'permissions._user': currentUser._id, 
    
     if (!$scope.optOut) { $scope.children = Child.query(); }
     $scope.famillyChildren = Child.query({following: 'familly'});
     $scope.followedChildren = Child.query({following: 'others'});
     // if (!currentUser.settings.optOut) {  }
    } 
  });
  
  
  $scope.search = {};
  $scope.search.type = "Users";
  
  $scope.search.term = '';
  
  $scope.openFindWindow = function() {
    
    $location.path('/find');  
  }

  
  
  /*
   * 
   * Add socket handler to handle real time updates and who's online mechanism
   * 
   * 
   */
  
}
AppCtrl.$inject = ['$scope', 'AuthService', '$location', 'Child', '$rootScope', 'Alert', 'Socket', 'Message', '$http'];

// controller handling modal / dialog logic.
function DialogCtrl($scope, dialog){
  

}
DialogCtrl.$inject = ['$scope', 'dialog'];

function MyTagsCtrl($scope, $http) {
  
     
  $scope.$on('followingTag', function(event, tag) {
    $scope.myTags.push(tag);
  })       
  
  $scope.$on('unFollowingTag', function(event, tag) {
    for(var i = 0; i < $scope.myTags.length; i++) {
      if ($scope.myTags[i]._id == tag._id) {
        $scope.myTags.splice(i, 1);
        break;  
      }
      
    }
  })    
  
}
MyTagsCtrl.$inject = ['$scope', '$http'];

function HomeCtrl($scope, $rootScope, Discussion, $http, Alert, Child, Socket) {
    Socket.subscribe('discussions');
    var childrenInitialized;
    $scope.newDiscussion = {};
    
    // loading the data
    $scope.discussions = Discussion.query({'page': 1});
    $scope.children = [];
    $scope.authorize= { post : true} ;
    
    // get all the children about which the user can post.
    $scope.children = Child.query({'post': 'true'}, function() {
      if ($scope.children.length > 0) {
        $scope.initializeChildren();
      } else {
        // if the user is not allowed to post for any child, set the type to question.
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
      if(childrenInitialized) {
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
      childrenInitialized = true;
      $scope.newDiscussion.tags = angular.copy($scope.children[0].superpowers);
    }
    
     
    $scope.addPicture = function(file) {
      $scope.$apply(function() {
        $scope.newDiscussion.picture.path = file.path;
        $scope.newDiscussion.picture.title = file.name;  
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
