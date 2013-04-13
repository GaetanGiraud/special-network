'use strict';


/*
 * 
 * 
 * Controllers for Discussion logic 
 * 
 * 
 */
 
function DiscussionCtrl($scope, $location, Socket) {
    
    $scope.inputType = 'text';
    
   
    $scope.setInputType = function(input) {
      $scope.inputType = input;

    }
  
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
   
    
   $scope.albums = {};
   
   $scope.removeVideoFromDiscussion = function() {
      $scope.newDiscussion.video = '';
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
   
function PictureCtrl($scope) {
    $scope.pictureUploadOptions = { 
      dropZone: '#input-picture'
     // dropZone: $('#profile-picture') 
    };
   
   
   $scope.addPicture = function(file) {
      // if pictures array inside the newDiscussion object has not been instantiated, do it.
      if (angular.isUndefined($scope.newDiscussion.pictures)) $scope.newDiscussion.pictures = [];
      console.log(file);
      console.log('adding picture to the array '+ file.name)
      $scope.newDiscussion.pictures.push({ _creatorId:  $scope.currentUser._id,
                                      title: file.title,
                                      name: file.name });
      $scope.$apply($scope.newDiscussion.pictures);
   }
   
   $scope.removePictureFromDiscussion = function($index) {
      $scope.newDiscussion.pictures.splice($index, 1);
    }
}
PictureCtrl.$inject = ['$scope'];

function VideoCtrl($scope) {
  
       
    
    $scope.videoUploadOptions = {
     dropZone: '#input-video'
     // dropZone: $('#profile-picture') 
     }
     
   
   $scope.addVideo = function(file) {
      // if pictures array inside the newDiscussion object has not been instantiated, do it.
      if (angular.isUndefined($scope.newDiscussion.video)) $scope.newDiscussion.video = {};
      $scope.newDiscussion.video =  { _creatorId:  $scope.currentUser._id,
                                      title: file.title,
                                      name: file.name };
      $scope.$apply($scope.newDiscussion.video);
      //var myPlayer = _V_("example_video_1");
   }
   
   $scope.removeVideoFromDiscussion = function() {
      $scope.newDiscussion.video = '';
    }

  
}
VideoCtrl.$inject = ['$scope'];
