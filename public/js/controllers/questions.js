function QuestionsCtrl($scope, $rootScope, Question, $http, Alert, Socket, $location) {
   // Socket.subscribe('Questions');
    // setting default values for new discussions.
    
    
    
    $scope.newQuestion = {};
    $scope.showNewQuestion = false;
    $scope.newQuestion.tags = [];
    var counter = 0;
   // $scope.questions = []
    
    $scope.$watch('currentUser', function(user) {
      if (user != null ) {
        $scope.newQuestion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
      }  
    });
    
   //$scope.questions = Question.query();
   
   // for building the filter array: foo[]=val1&foo[]=val2&foo[]=val3

   
  /* $scope.$watch('searchTags', function() {
     // to do - do a search in elastic search with the tags and the terms
      if (angular.isUndefined( $location.search().term )) {
        var request;
        angular.forEach($scope.searchTags, function(tag) {
          if(!request) {
            request = 'tags[]=' + tag._id;
          } else  {
            request = request + '&tags[]=' + tag._id;
          }
        });
        console.log(request);
        $http.get('/api/questions?' + request)
        .success(function(data) {
          $scope.questions = data;  
        
       });
     }
      }, true); */
 
        
             

  
  
  // handling tags      
  
  $scope.addQuestionTag = function(tag) { 
    var isPresent = false;
      
      for(var i=0; i < $scope.newQuestion.tags.length; i++) {
        if ($scope.newQuestion.tags[i]._id == tag._id)  {
          isPresent = true;
          alert('Already selected')
          break;
        }
      }
       if (!isPresent) {
        $scope.newQuestion.tags.push(tag);
      }
    }
    
  $scope.removeQuestionTag = function(tag) {
      for(var i=0; i < $scope.newQuestion.tags.length; i++) {
        if ($scope.newQuestion.tags[i]._id == tag._id)  {
          $scope.newQuestion.tags.splice(i, 1);
          break;
        }
        
      }
    }
  
    $scope.addTag = function(tag) { 
    var isPresent = false;
      
      for(var i=0; i < $scope.searchTags.length; i++) {
        if ($scope.searchTags[i]._id == tag._id)  {
          isPresent = true;
          alert('Already selected')
          break;
        }
      }
       if (!isPresent) {
        $scope.searchTags.push(tag);
      }
    }
    
  $scope.removeTag = function(tag) {
      for(var i=0; i < $scope.searchTags.length; i++) {
        if ($scope.searchTags[i]._id == tag._id)  {
          $scope.searchTags.splice(i, 1);
          break;
        }
        
      }
    }
  
  

   $scope.createQuestion = function() {
       Question.save($scope.newQuestion, 
         function(question) {
           $scope.questions.unshift(question);
            $scope.showNewQuestion = false;
            $scope.newQuestion.tags = [];
            $scope.newQuestion.content = '';
            $scope.newQuestion.details = '';
            $scope.$emit('QuestionCreated', question);
        }, 
        function(err) {
           console.log(err);
           Alert.error(err.data.err);  
        });
     
     }
}
QuestionsCtrl.$inject = ['$scope', '$rootScope', 'Question', '$http', 'Alert', 'Socket', '$location'];


function QuestionCtrl($scope, $routeParams, Question, $http, Alert, Socket) {
   
  $scope.newAnswer = {};
  $scope.showNewAnswer = false;
  
  $scope.question = Question.get({questionId:  $routeParams.questionId }, 
    function(data) {
      $scope.question = data;
      $scope.question.answers = _.sortBy(data.answers, function(answer) { return -answer.totalVotes });
    
    });
  
  $scope.$watch('currentUser', function(currentUser) {
    console.log($scope.currentUser);
    if (angular.isDefined(currentUser) && currentUser != null) {
       $scope.newAnswer._creator = currentUser._id;
    }
  })
  
 /* $scope.totalVotes = function(answer) {
    return _.reduce(answer.votes, function(memo, vote){ return memo + vote.vote; }, 0);  
  }*/
  
  $scope.createAnswer = function() {
    $http.post('/api/questions/' + $scope.question._id + '/answers', $scope.newAnswer)
      .success(function(data) {
        $scope.question.answers.push(data);
      })
   }
   
   $scope.up = function(answer) {
     
     $http.put('/api/questions/' + $scope.question._id + '/answers/' + answer._id + '/vote', {vote: 1, _creator: $scope.currentUser._id } )
      .success(function(data) {
        answer.votes.push(data);
      })
   }
   
   $scope.down = function(answer) {
     $http.put('/api/questions/' + $scope.question._id + '/answers/' + answer._id  + '/vote', {vote: -1, _creator: $scope.currentUser._id}   )
      .success(function(data) {
        answer.votes.push(data);
      })
   }
   
   $scope.alreadyVoted = function(answer) {
     var result = _.some(answer.votes, function(vote) { return vote._creator == $scope.currentUser._id} )  ;
     return result;
     
   }
}

function newQuestionCommentCtrl($scope, $http) {
  
  $scope.newComment = {}; 
  
  $scope.$watch('currentUser', function(currentUser) {
     if (angular.isDefined(currentUser) && currentUser != null) {
       $scope.newComment._creator = currentUser._id;
     }
   })
   
   
   $scope.createComment = function() {
     $http.post('/api/questions/' + $scope.question._id + '/comments', $scope.newComment)
      .success(function(data) {
        $scope.question.comments.push(data);
        $scope.newComment = {};
        $scope.reply = false;
      })
    }
  
   $scope.createCommentToAnswer = function(answer) {
     $http.post('/api/questions/' + $scope.question._id + '/answers/' + answer._id + '/comments', $scope.newComment)
      .success(function(data) {
        for(var i = 0; i < $scope.question.answers.length; i ++) {
          if ( $scope.question.answers[i]._id == data.answerId ) {
             $scope.question.answers[i].comments.push(data.comment);
             $scope.newComment = {};
             $scope.reply = false;
             break;     
          }
        }
      })
    }
}

function TopicCtrl($scope, $routeParams, Tag, $http, Alert) {
  
  // setting up default values for discussions on the page. Logic is in Discussion controller.
   $scope.editTopic = false;
   $scope.waiting = false;
   $scope.topicPitureUpload = { dropZone: '#topic-picture' };  
   
   $scope.tag = Tag.get({tagId:  $routeParams.tagId }, function(data) { 
     $scope.tag = data })
  
   $scope.addLink = function() {
     $scope.waiting = true;
     $http.put('/api/tags/'+ $scope.tag._id +'/addlink', $scope.newLink)
     .success(function(data) {
       $scope.waiting = false;
       $scope.tag.links.push(data);
       $scope.newLink = {};
     });
       
     }
     
    $scope.removeLink = function(index) {
      $scope.tag.links.splice(index, 1);
      $scope.updateTag();
    }
    
   
   $scope.updateTag = function() {
     $scope.waiting = true;
     $scope.editTopic = false;
     Tag.update({tagId: $scope.tag._id}, $scope.tag, 
      function(tag){      
        $scope.waiting = false; 
        Alert.success('Changes saved');
      }, 
      function(err){ 
        $scope.waiting = false;
        Alert.error('A system error while saving the page. Could you try again?' );
      }
    );
  }
    
  $scope.setTopicPicture = function(file) {
    console.log(file);
    $scope.tag.picture = file.name ;
    $scope.$apply( $scope.updateTag() )
  };  
  
  
  
  
}
