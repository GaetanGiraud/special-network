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


   $scope.createQuestion = function() {
       Question.save($scope.newQuestion, function(question) {
           $scope.questions.push(question);
        });
     
     }

}
QuestionsCtrl.$inject = ['$scope', '$rootScope', 'Question', '$http', 'Alert', 'Socket'];
