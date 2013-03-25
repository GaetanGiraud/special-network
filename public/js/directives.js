'use strict';

/* Directives */


angular.module('CareKids.directives', []).
  directive('uploader', function($rootScope) {
       return {
         restrict: 'A',
         scope: {
           done: '&'
        //   progress: '&'
           },
         link: function(scope, elem, attrs) {
             
            elem.fileupload({
              dataType: 'json', 
     //         progress: function (e, data) {
      //            if(angular.isDefined(scope.progress)) { 
     //              var progressStatus = parseInt(data.loaded / data.total * 100, 10);
     //               scope.progress({progress: progressStatus });
     //             }
       //       },
              done:  function (e, data) {
                console.log(data);
                $.each(data.files, function (index, file) {
                  scope.done({file: file});
                 });
              }
            });
          }
      }
  })
.directive('newdiscussion', function($rootScope) {
   var editableHtml = angular.element('<div class = "editable" contenteditable ng-model = "newDiscussion.content"> </div>');
       
       return {
         restrict: 'E',
         scope: {
         //  discussionType: '@',
           publish: '&'
           },
        // replace: true,
         template: '<div class = "content">' +
                            '<div class = "btn-group fileupload-buttonbar footer">' + 
                              '<button type = "button" ng-click = "create()" class = "btn">Create</button>' + 
                              '<span class = "btn fileinput-button">' + 
                                '<i class = "icon-picture icon-white"></i>' +
                                ' <input type = "file" uploader coucou = "hello" done = "appendImage(file)" data-url="/upload" name="file" >' + 
                              '</span>' +
                            '</div>' +
                    '</div>',
         compile: function(tElem) {
           tElem.prepend(editableHtml);
           
            var link = function(scope, elem, attrs) {

                    
            scope.appendImage = function(file) { 
              
              var imageTag = '<img src = "http://localhost:3000/uploads/' + $rootScope.currentUser._id + '/thumbnail/' + file.name + '">';
              console.log (file);
               //l = $compile(imgTag)(scope);
              editableHtml.append(imageTag);
            }
          }
            
            
            return link;
            
           },
           link: function(scope) {
             
             scope.create = function() {
               scope.publish({discussion: newDiscussion});
               scope.newDiscussion = {};
             } 
                          
           }
     }
  })
.directive('contenteditable', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return; // do nothing if no ng-model
 
        // Specify how UI should be updated
        ngModel.$render = function() {
          element.html(ngModel.$viewValue || '');
        };
 
        // Listen for change events to enable binding
        element.bind('blur keyup change', function() {
          scope.$apply(read);
        });
        read(); // initialize
 
        // Write data to the model
        function read() {
          ngModel.$setViewValue(element.html());
        }
      }
    };
})
/*.directive('discussion', function() {
  return {
    restrict: 'E',
    scope: {
      discussion: '=',
      publishComment: '&'
    },
  //  replace: true,
    templateUrl: '/templates/discussion',
  }

})*/
.directive('newComment', [ '$rootScope', function($rootScope) {
  return {
    restrict: 'A',
    scope: {
      result: '='
    },
   // replace: true,
    template: '<a ng-show = "!reply" ng-click="reply = true">Reply</a>' +
              '<div class = "footer" ng-show = "reply">'+ 
                '<textarea ng-model = "newComment.content"></textarea>' + 
                '<br />' +
                ' <button class = "btn btn-primary" ng-click="create()">Post</button>' + 
                ' <button class = "btn" ng-click="reply = false">Cancel</button>' +
              '</div>',
    link: function(scope) {
    
    scope.newComment = {};
    $rootScope.$watch('currentUser', function(currentUser) {
      scope.newComment._creator = currentUser._id;
    });
    
    scope.create = function() {
      scope.publish({index: scope.index, comment: scope.newComment});
      scope.newComment = '';
      scope.reply = false;
    }
    
    }
  }   
}])

.directive('autocomplete',[ '$http', '$compile', function($http, $compile) {
   return {
     restrict: 'E',
     scope: {
       results: '='
       },
     template: '<input id = "autocomplete" "type ="text" ng-change="complete()" ng-model="term">',
     link: function(scope, elm, attrs) {
     
     var ElmWidth = elm[0].offsetWidth;
     var suggestionTemplate = '<ul class = "autocomplete">' +
                                   "<li ng-click='select($index)' ng-repeat = 'suggestion in suggestions'>" +
                                   '<img src="/uploads/{{suggestion._id}}/icon/{{suggestion.picture}}">' +
                                   '{{suggestion.name}}'+
                                   '</li></ul>';
    var html;                          
       
     scope.complete = function() {
        $http({method: 'GET', url: attrs.url, params: {'q': scope.term }})
         .success(function(data) {
          if (html) html.remove();
                console.log(data);
          scope.suggestions = data;
          html = $compile(suggestionTemplate)(scope);
          html.css('width', ElmWidth);
          $('ul.autocomplete').css('width', ElmWidth);
          elm.append(html);
        });
       
     
      }
      
      scope.select = function($index) {
        html.remove();
        scope.term = scope.suggestions[$index].name;
        scope.results = scope.suggestions[$index];
      }
    
   }
 }
}])
.directive('icon', function() {
      return function(scope, elem, attrs) {;
        var iconPath;
        scope.$watch(attrs.icon, function() { 
          iconPath = 'url(/images/' + attrs.icon + '.png)';
          elem.css('background-image', iconPath );
          elem.css('background-repeat', 'no-repeat' );
        });
      }
  })
  .directive('help', ['$compile', '$http', function($compile, $http) {

          
    return {
        
      restrict: 'A', 
      scope:  { 
        open: '=',
     //   templatename: '=',
        action: '&'
      },
      link: function(scope, elm, attrs) {
        
        var templateUrl = '/templates/'+ attrs.templatename;
        
        var html;
        var ElmleftPosition = elm[0].offsetLeft,
            ElmWidth = elm[0].offsetWidth,
            ElmTopPosition = elm[0].offsetTop;       
        
        scope.close = function() {
          scope.open = false; 
        }

      scope.$watch('open', function(open) {
        if (open) {
          $http.get(templateUrl).success(function(template) {
            html = $compile(template)(scope);
            elm.prepend(html);
            html.css('max-width', ElmWidth);
            var WidgetHeight = html[0].offsetHeight;           
            html.css('top', ElmTopPosition - WidgetHeight);
          });      
             
        } else {
          
          if (angular.isDefined(html)){
            html.remove();
          }    
        }
       });
      
      }
    }
  }])
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
