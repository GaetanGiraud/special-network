function QuestionsCtrl($scope, $rootScope, Question, $http, Alert, Socket) {
   // Socket.subscribe('Questions');
    // setting default values for new discussions.
    $scope.newQuestion = {};
    $scope.showNewQuestion = false;
    $scope.newQuestion.tags = [];
    
    $scope.$watch('currentUser', function(user) {
      if (user != null ) {
        $scope.newQuestion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
      }  
    });
    
   $scope.questions = Question.query();
   
   // for building the filter array: foo[]=val1&foo[]=val2&foo[]=val3
   
 
   $scope.myTags = $http.get('/api/tags', { params : { mytags: true } })
           .success(function(data) { 
              $scope.myTags = data
             })

   $scope.createQuestion = function() {
       Question.save($scope.newQuestion, function(question) {
           $scope.questions.unshift(question);
        });
     
     }
     
   $scope.reloadQuestions = function() {
     console.log('triggering action')
      Question.query();
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
