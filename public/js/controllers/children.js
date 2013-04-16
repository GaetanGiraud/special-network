'use strict';


function ChildrenCtrl($scope, Child, Alert, User) {
  //setting up some default values
  $scope.notFollowing = true;

    
  $scope.$watch('currentUser', function(currentUser) {
    if (angular.isDefined(currentUser) && currentUser != null ) {
      $scope.optOut = currentUser.settings.createChildOptOut;
      
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

function ChildCtrl($scope, $http, $rootScope, $routeParams, Discussion, Child, $location, Socket, $dialog, Alert) {
  
   // setting up default values for discussions on the page. Logic is in Discussion controller.
    $scope.overviewType = 'discussions';
    
    $scope.newDiscussion = {};
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
      $scope.newDiscussion.tags = angular.copy(child.superpowers);
      
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
    
   /* $scope.$watch('child.superpowers', function(superpowers) {
       if (angular.isDefined(superpowers)) {
         console.log($scope.child);
        // $scope.updateChild();
       }
      
    } , true)
*/
   $scope.updateChild = function() {
     Child.update({childId: $scope.child._id}, $scope.child, 
      function(child){
        //$scope.child = child;
        $location.url('/children/' + $scope.child.pageTitle);
        
      }, 
      function(err){ 
        Alert.error('A system error while saving the page. Could you try again?' );
      }
    );
  }
    
  $scope.setProfilePicture = function(file) {
    $scope.child.picture = file.name ;
    $scope.updateChild();
  };
  
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
