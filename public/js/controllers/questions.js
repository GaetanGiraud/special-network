function QuestionsCtrl($scope, $rootScope, Discussion, $http, Alert, Socket) {
   // Socket.subscribe('Questions');
    // setting default values for new discussions.
    $scope.newDiscussion = {};
     
    $scope.newDiscussion = {};
    $scope.$watch('currentUser', function(user) {
      if (user != null ) {
        $scope.newDiscussion._creator = { '_id': user._id, 'name': user.name, 'picture': user.picture } ;
      }  
    });
    $scope.newDiscussion.type ='question';
    
    $scope.discussions = Discussion.query({type: 'question'});

    //$scope.children = Child.query({'post': true});
    $scope.children = [];

}
QuestionsCtrl.$inject = ['$scope', '$rootScope', 'Discussion', '$http', 'Alert', 'Socket'];
