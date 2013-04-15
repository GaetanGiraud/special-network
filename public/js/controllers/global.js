'use strict';


/*
 * 
 * Application Level Controllers
 * Handles views independant logic such as menubar, sibebar and socket connections
 * 
 */
function AppCtrl($scope, AuthService, $location, Child, $rootScope, Alert, Socket, Message) {

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
      Message.getUnreadMessagesCount(function(err, data) {
        $scope.unreadMessageCount = data.messageCount;
      })
      
      if (!currentUser.settings.optOut) { $scope.myChildren = Child.query(); }
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
AppCtrl.$inject = ['$scope', 'AuthService', '$location', 'Child', '$rootScope', 'Alert', 'Socket', 'Message'];

// controller handling modal / dialog logic.
function DialogCtrl($scope, dialog){
  
  $scope.close = function(result){
    dialog.close(result);
  };
}
DialogCtrl.$inject = ['$scope', 'dialog'];

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
