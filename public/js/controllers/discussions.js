'use strict';


/*
 * 
 * 
 * Controllers for Discussion logic 
 * 
 * 
 */
 
function DiscussionCtrl($scope, $location, Socket, $http, $dialog) {
    
    $scope.inputType = 'text';
    $scope.album = null;
   
    $scope.setInputType = function(input) {
      $scope.inputType = input;

    }
  
    $scope.createDiscussion = function() {
      $scope.newDiscussion.children = [];
    // linking chosen children to the discussion
         
      for(var i = 0; i < $scope.children.length; i++) {
           console.log($scope.children[i].send)
           if ($scope.children[i].send) { 
             $scope.newDiscussion.children.push($scope.children[i]); 
             }
       } 

      Socket.socket().emit('discussionCreated', $scope.newDiscussion);
      
     // _.each($scope.discussion.children) {
        
      
       console.log('album is not null? : ' + ($scope.album != null ));
      if ($scope.album != null ) {
         if ($scope.inputType == 'picture') var data = $scope.newDiscussion.pictures ;
         if ($scope.inputType == 'video') var data = [ $scope.newDiscussion.video ];
        
         $http.put('/api/children/' + $scope.child._id + '/albums/' + $scope.album._id, data );
      }
      
      // add new discussion to the thread
      $scope.discussions.unshift(angular.copy($scope.newDiscussion));
      
      // reset newDiscussion variable
      $scope.newDiscussion.content = '';
      $scope.newDiscussion.children = []; 
      $scope.newDiscussion.pictures = [];
      $scope.newDiscussion.video = '';
      
    }   
   
  // $scope.albums = {};
   
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
    
    // albums choice dialog
    
    
   var opts = {
          backdrop: true,
          keyboard: true,
          backdropClick: true,
          templateUrl:  'templates/albumChoice',
          resolve: {albums: function() { return angular.copy( $scope.child.albums) }},
          controller: 'AlbumChoiceCtrl'
     };
       
    $scope.openAlbumDialog = function() { 
      $dialog.dialog(opts).open().then(function(result){
        if (angular.isDefined(result)) {
          if (result.content == 'createNew') { 
            $scope.createAlbum(result.title);
            
          } else {
            $scope.album = result;
            console.log('album registered: ');
            console.log($scope.album);
          }
        }
      });
    }  
    
    $scope.createAlbum = function(title) {
      $http.post('/api/children/' + $scope.child._id + '/albums', { title: title})
        .success(function(data) {
          $scope.album = data;
      });
      
    }
    
   $scope.albumThumbnail = function(album) {
     if (album != null) {
       console.log()
       return _.find(album.content, function(item){ return item.type == 'picture' });
     } 
     return '';
   }
    
 
    

}
DiscussionCtrl.$inject = ['$scope', '$location', 'Socket', '$http', '$dialog'];

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
   
function PictureCtrl($scope, $dialog) {
    $scope.pictureUploadOptions = { 
      dropZone: '#input-picture'
     // dropZone: $('#profile-picture') 
    };
   
   
   $scope.addPicture = function(file) {
      // if pictures array inside the newDiscussion object has not been instantiated, do it.
      if (angular.isUndefined($scope.newDiscussion.pictures)) $scope.newDiscussion.pictures = [];

      $scope.newDiscussion.pictures.push({ 
                                      type: 'picture',
                                      _creatorId:  $scope.currentUser._id,
                                      title: file.title,
                                      name: file.name });
      $scope.$apply($scope.newDiscussion.pictures);
   }
   
   $scope.removePictureFromDiscussion = function($index) {
      $scope.newDiscussion.pictures.splice($index, 1);
    }
    
    
}
PictureCtrl.$inject = ['$scope', '$dialog'];

function VideoCtrl($scope) {
  

    
    $scope.videoUploadOptions = {
     dropZone: '#input-video'
     // dropZone: $('#profile-picture') 
     }
     
   
   $scope.addVideo = function(file) {
      // if pictures array inside the newDiscussion object has not been instantiated, do it.
     // if (angular.isUndefined($scope.newDiscussion.video)) $scope.newDiscussion.video = {};
      $scope.newDiscussion.video =  { type: 'video',
                                      _creatorId:  $scope.currentUser._id,
                                      title: file.title,
                                      name: file.name };
      $scope.$apply($scope.newDiscussion.video);
      console.log('my video ')
      console.log($scope.newDiscussion.video)
      //var myPlayer = _V_("example_video_1");
   }
   
   $scope.removeVideoFromDiscussion = function() {
      delete $scope.newDiscussion.video;
      console.log('video deleted')
      console.log($scope.newDiscussion.video)
    }

  
}
VideoCtrl.$inject = ['$scope'];

function AlbumChoiceCtrl($scope, dialog, albums) {
    $scope.albums = albums;
    
    $scope.selectAlbum = function($index) {
      $scope.selectedAlbum = $index;
      console.log('selected ' + $index)
    }
    
    $scope.isSelected = function($index) {
      if ($scope.selectedAlbum == $index) return 'selected';
      return '';
    }
    
       
    $scope.confirmAlbum = function() {
      if ($scope.selectedAlbum == 'createNew') {
        // create a new album in the database
        dialog.close({ content: $scope.selectedAlbum, title: $scope.newAlbumTitle });
      } else {
         dialog.close($scope.albums[$scope.selectedAlbum]);
      };
    }
    
    $scope.close = function() {
      dialog.close(); 
    }
    
   $scope.thumbnail = function(album) {
     if (album != null) {
       console.log()
       return _.find(album.content, function(item){ return item.type == 'picture' });
     } 
     return '';
   }
  
}
AlbumChoiceCtrl.$inject = ['$scope', 'dialog', 'albums']
