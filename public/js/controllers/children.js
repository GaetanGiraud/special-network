'use strict';


function ChildrenCtrl($scope, Child, Alert, User, FollowService, $location) {
  //setting up some default values
  $scope.notFollowing = true;

   
  $scope.famillyChildren = Child.query({following: 'familly'});
  $scope.followedChildren = Child.query({following: 'others'});
    
  $scope.$watch('currentUser', function(currentUser) {
    if (angular.isDefined(currentUser) && currentUser != null ) {
      $scope.optOut = currentUser.settings.createChildOptOut;
      if (!$scope.optOut) { $scope.children = Child.query(); }
      $scope.newChild = {
          creator: {
             _user: currentUser._id,
            relationship: "Mother"
            }
        };
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
  

  $scope.getRelationship = function(child) { 
    for(var i=0; child.permissions.length; i++) {
      if (child.permissions[i]._user == $scope.currentUser._id) {
        return child.permissions[i].relationship;
        break;  
       }
      }
  }
  
  // if the user has not opted to only follow children, show their children  
 
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
     $location.path('/children/' + child.url);
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
  
  
    //
  
  $scope.unfollow = function($index, type) {
    var child;
    if (type == 'familly') child = $scope.famillyChildren[$index];
    if (type == 'friend') child = $scope.followedChildren[$index];
    
    followService.unfollow(child, function(data) {
      $scope.famillyChildren
      if (type == 'familly') return $scope.famillyChildren.splice($index, 1);
      if (type == 'friend') return $scope.followedChildren.splice($index, 1);
     
  //     child.isFollowed = false;
    });
   }

}
ChildrenCtrl.$inject = ['$scope', 'Child', 'Alert', 'User', 'FollowService', '$location'];

function ChildCtrl($scope, $http, $rootScope, $routeParams, Discussion, Child, $location, Socket, $dialog, Alert) {
  
   // setting up default values for discussions on the page. Logic is in Discussion controller.
    $scope.overviewType = 'discussions';
    
    $scope.children = [];
    $scope.discussions = [];
    $scope.authorize = {};
    
   // querying discussions on the server.
    
   $scope.$safeApply($scope, function() {
    
    Child.get({childId:  $routeParams.childId }, function(child){
      // add the child to the discussion object.
      $scope.child = child;
      child.send = true;
      $scope.children.push(child);
      

      // fill in the child superpowers as discussiont tags by default
      
      $scope.discussions = Discussion.query({'children':  child._id, 'page': 1});
      Socket.subscribe('child_' +  child._id );
      //console.log($scope.discussions);
      $scope.paginationUrl = '/api/discussions?children=' + $scope.child._id;
      
      if ($scope.currentUser._id == child.creator._user) {
         $scope.authorize.show = true;
         // enable drag & drop of profile picture
         $scope.childProfileUpload = { dropZone: '#profile-picture' };  
       } else {
         // disable drag & drop of profile picture
         $scope.childProfileUpload = { dropZone: null };
      }
      
      for(var i = 0; child.permissions.length; i++) {
        if (child.permissions[i]._user == $scope.currentUser._id) {
          var permission = child.permissions[i];
          if (permission.rights == 'write') $scope.authorize.post = true;
        }
        break;
       }   
      
      //console.log(child.permissions);
      //permission = child.permissions.indexOf( );
      
    });
  });
   /* $scope.$watch('child.superpowers', function(superpowers) {
       if (angular.isDefined(superpowers)) {
         console.log($scope.child);
        // $scope.updateChild();
       }
      
    } , true)
*/
   // handling superpowers
   $scope.addSuperpower = function(superpower) {
     
     var isPresent = false;
      for(var i=0; i < $scope.child.superpowers.length; i++) {
        if ($scope.child.superpowers[i]._id == superpower._id)  {
          isPresent = true;
          alert('Already selected')
          break;
        }
      }
     if (!isPresent) {
       $scope.child.superpowers.push(superpower);
       $scope.updateChild();
       $http.put('/api/tags/' + superpower._id, { action: 'follow' });
       $scope.newDiscussion.tags.push(superpower);
     }
     
    }
    

    $scope.removeSuperpower = function(superpower) {
      console.log('search')
      for(var i=0; i < $scope.child.superpowers.length; i++) {
        if ($scope.child.superpowers[i]._id == superpower._id)  {
          $scope.child.superpowers.splice(i, 1);
          $scope.updateChild();
          break;
        }
      }
    }
    
   
   $scope.updateChild = function() {
     Child.update({childId: $scope.child._id}, $scope.child, 
      function(child){
        //$scope.child = child;
        $location.url('/children/' + child.url);
        
      }, 
      function(err){ 
        Alert.error('A system error while saving the page. Could you try again?' );
      }
    );
  }
    
  $scope.setProfilePicture = function(file) {
    $scope.$safeApply($scope, function() {
      $scope.child.picture = file.name ;
      $scope.updateChild();
    })
  };
  
  
  $scope.$on('event:commentAdded', function(event, comment, id) {
   
    for(var i = 0; i < $scope.results.length; i ++) {
        if ( $scope.discussions[i] == id) {
           $scope.discussions[i].comments.push(comment);
          break;     
        }
    }
  });
  
  /* To be checkd */
    Socket.socket().on('newComment', function(comment) {
      console.log(comment);  
      for(var i = 0; i < $scope.discussions.length; i ++) {
        if ( $scope.discussions[i] == comment.discussionId) {
           $scope.$apply($scope.discussions[i].comments.push(comment.comment));
          break;     
        }
      }
    });
    
    // Add new discussion received on the opened socket / room.
    
    Socket.socket().on('newDiscussion', function(discussion) {
     // $scope.$safeApply($scope.results.unshift(discussion));
     // $scope.$broadcast('event:masonryReload');
    });

    
  /*  End  */
    
    $scope.$on('newDiscussion', function(event, discussion) {
       console.log('new discusison recieved locally')
       console.log(discussion)
       
      // $scope.$safeApply($scope, function() { 
         $scope.showNewPost = false;
         //$scope.results.unshift(discussion);
         console.log($scope.results);
         //$rootScope.$broadcast('event:masonryReload');
      //  });
         
    });
    
    // After creating discussion, update discussion with info sent back from the server.
     Socket.socket().on('discussionSavedSuccess', function(discussion) {
      // for(var i = 0; i < $scope.results.length; i ++) {
        //if ( $scope.results[i]._id == id) {
          //console.log('adding ' + id);
             console.log('new discusison recieved from the server')
             console.log(discussion)
           $scope.$safeApply($scope, function(){ 
             $scope.discussions.unshift(discussion);
             Alert.success('Discussion created');
          });
          //break;     
       // }
    //  }
    });

  
  
  
  
/*   $scope.addSuperpower = function(superpower, newSuperpower) {
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
  }*/
  
    
  /* $scope.removeSuperpower = function(index) {
    $scope.child.superpowers.splice(index, 1);
    $scope.updateChild();
  }*/

  $scope.albumThumbnail = function(album) {
     if (album != null) {
       console.log()
       return _.find(album.content, function(item){ return item.type == 'picture' });
     } 
     return '';
  }
  
  // opening the albums dialog
  
  
  var opts = {
          backdrop: true,
          keyboard: true,
          backdropClick: true,
          dialogClass: 'album',
          templateUrl:  'templates/albums',
          resolve: {child: function() { return angular.copy( $scope.child) }},
          controller: 'AlbumsCtrl'
   };
  
  $scope.openAlbumDialog = function() { 
      $dialog.dialog(opts).open().then(function(result){

      });
    }  
    
    $scope.createAlbum = function(title) {
//      $http.post('/api/children/' + $scope.child._id + '/albums', { title: title})
  //      .success(function(data) {
  //        $scope.album = data;
    //  });
      
    }
    
        $scope.setOverviewType = function(overviewType) {
      $scope.overviewType = 'discussions';
     // $scope.overviewType = 'discussions';
      console.log('switch')
      //$scope.overviewType = overviewType;  
    }

  
  
}
ChildCtrl.$inject = ['$scope', '$http', '$rootScope', '$routeParams', 'Discussion', 'Child','$location', 'Socket', '$dialog', 'Alert'];

function AlbumsCtrl($scope) {
    $scope.albums = $scope.child.albums;
    $scope.page = 1;
    
    $scope.$watch('albums', function(albums) {
      $scope.album = $scope.albums[0];
      console.log('album selected');
      console.log($scope.album);
    });
    

    
    $scope.increment = function(page) {
     $scope.page = $scope.page +1; 
    }
    
    $scope.decrement = function(page) {
     $scope.page = $scope.page - 1; 
    }
    
   $scope.thumbnail = function(album) {
     if (album != null) {
       console.log()
       return _.find(album.content, function(item){ return item.type == 'picture' });
     } 
     return '';
   }
  
}
AlbumsCtrl.$inject = ['$scope']

function KidCtrl($scope) {
  
  console.log($scope.child);
  $scope.unfollow = function(child) {
    $http.put('/api/children/' + child._id + '/follow', { action: 'unfollow' }).success(function(child) {
       $rootScope.$broadcast('unFollowingChild', child);
      });
   }
      
   $scope.follow = function(child) {
        Message.send({
          content: $scope.currentUser.name + " wants to follow " + child.name,
          action: { 
            actionType: "following",
            target: child._id
            },
          _creator: $scope.currentUser,
          receivers: [ { '_user': child.creator._user } ]
        });
        
        $http.put('/api/children/' + scope.child._id + '/follow', { action: 'follow' }).success(function(child) {
          $rootScope.$broadcast('followingChild', child);
        });
      }
      
    $scope.isFollowed = function(child) {
  
    }
      
    scope.$on('followingChild', function(event, child) {
        if (child._id == $scope.child._id) scope.isFollowed = true;
    })       
  
 //   scope.$on('unFollowingChild', function(event, child) {
 //     if (child._id == $scope.child._id) scope.isFollowed = false;
 //   })     
}
  
