function QuestionsCtrl($scope, $rootScope, Question, $http, Alert, Socket) {
   // Socket.subscribe('Questions');
    // setting default values for new discussions.
    $scope.newQuestion = {};
    $scope.showNewQuestion = false;
    $scope.newQuestion.tags = [];
   // $scope.questions = []
    
    $scope.$watch('currentUser', function(user) {
      if (user != null ) {
        $scope.newQuestion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
      }  
    });
    
   //$scope.questions = Question.query();
   
   // for building the filter array: foo[]=val1&foo[]=val2&foo[]=val3
   
 
   $scope.myTags = $http.get('/api/tags', { params : { mytags: true } })
           .success(function(data) { 
              $scope.myTags = data;
              $scope.searchTags = angular.copy(data);
             })
  
  $scope.$watch('searchTags', function() {
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
  }, true);          
 
 $scope.search = function(term) {
   
   $http.get('http://localhost:9200/mongoquestions/_search?q',{params: {q: term }} )
   .success(function(data) {
      $scope.questions = _.map(data.hits.hits, function(hit) { return hit._source });
      
      console.log(data); 
     
    })
   //$scope.questions = data;  
   
  }
 
             
             
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
        }, 
        function(err) {
           console.log(err);
           Alert.error(err.data.err);  
        });
     
     }
}
QuestionsCtrl.$inject = ['$scope', '$rootScope', 'Question', '$http', 'Alert', 'Socket'];


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

