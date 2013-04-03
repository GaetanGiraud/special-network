'use strict';

/* Directives */


angular.module('CareKids.directives', []).
  directive('paginate', function($http, $window) {
    var page = 2;
    
       return {
         restrict: 'A',
           scope: {
             newPageTarget: '=',
             url: '@'
           },
         template: '<i class = "icon-spinner icon-spin"></i> {{ status }}',
         link: function(scope, elem, attrs) {
        
         scope.status = 'Loading';
         $(window).bind('scroll', function(event) {
           if ($(window).scrollTop() > ($(document).height() - $(window).height() - 50)) {
             console.log('near the bottom');
             
             scope.loadNewPage();
             page++;
           }
           
          });
        
            scope.loadNewPage = function() {
              $http({method: 'GET', url: scope.url, params: {'page': page} })
                .success(function(data) {
                  
                  
                  if (data.length == 0) {
                    scope.status = 'End of page'; 
                    $(window).unbind('scroll');
                    elem.children()[0].remove();
                    
                  }
                  scope.newPageTarget = scope.newPageTarget.concat(data);
                 });
            }
          
          }
          
      }
  })
.directive('uploader', function($rootScope) {
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
           publish: '&'
           },
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
.directive('tags',[ '$http', '$compile', function($http, $compile) {
   return {
     restrict: 'E',
     scope: {
       tags: '=',
     //  create: '@'
       create: '&',
       select: '&'
       },
     template: '<ul class = "unstyled">' + 
                  '<li ng-repeat = "tag in tags">' +
                    ' {{ tag }} <button type = "button" ng-click = "remove($index)"> &times</button>' + 
                  '</li>' +
                '</ul>' +
                '<div class = "input-prepend">' +
                  '<span class= "add-on">' +
                    '<i class = "icon-tags"></i>'+ 
                  '</span>' +
                  ' <input id = "autocomplete" type ="text" ng-change="complete()" ng-model="newTag">' + 
                '</div>',
     link: function(scope, elm, attrs) {
     
  
     
     // find the input element inside the template
     var inputElm =  elm.children().children()[1];
     var ElmWidth =  inputElm.offsetWidth;

     var suggestionTemplate = '<ul class = "autocomplete">' +
                                   "<li ng-click='add($index, $event)' ng-mouseover = 'toggleClass($index)' ng-repeat = 'suggestion in suggestions' ng-class = 'highlight($index)' >" +
                                   '{{suggestion}}'+
                                   '</li></ul>';
    var createnewTemplate = '<ul class = "autocomplete">' +
                                   "<li ng-click='add()'>" +
                                   'Do you want to create a new occurence?' +
                                   '</li></ul>';
    var noresultTemplate = '<ul class = "autocomplete">' +
                                   "<li>" +
                                   'No results matching your request' +
                                   '</li></ul>';
    var html;                          

    
    // watching the bindings to set up some smart defaults
      scope.$watch('newTag', function(tag) {
        if (angular.isDefined(scope.tag) && scope.tag.length == 0) { 
            if (angular.isDefined(html)) html.remove(); 
          }
      });
      
      scope.$watch('suggestions', function(suggestions) {
        scope.selected = 0;
      });
    
    /*
     * 
     *  get the autocompletion data from the server
     * 
     */
     
     scope.complete = function() {

       // if no data entered do not show anything (Handling backspace )
       if (scope.newTag.length == 0) { 
         if (angular.isDefined(html)) html.remove(); 
      } else {
       
        $http({method: 'GET', url: attrs.url, params: {'q': scope.newTag }})
         .success(function(data) {
          if (html) html.remove();
          console.log(data);
          scope.suggestions = data;
          
          // if no data ask to create a new object
          if (data.length < 1) {
            console.log(scope.create());
            if (angular.isDefined(scope.create())) {
              html = $compile(createnewTemplate)(scope);
            } else {
              html = $compile(noresultTemplate)(scope);
            }
            
          } else {
          // compile the suggestions
            html = $compile(suggestionTemplate)(scope);
          }
          // append the result of the query to the element
          html.css('width', ElmWidth);
          $('ul.autocomplete').css('width', ElmWidth);
          elm.append(html);
        
        });
       
       }
     
      }
      // on click function
      scope.add = function($index, $event) {
        html.remove();
        if (angular.isDefined($index)) {
          scope.tags.push(scope.suggestions[$index]);
          scope.newTag = '';
          //if select action defined, trigger create action
          if (angular.isDefined(scope.select())) scope.select();
          
        } else {
          //if create action defined, trigger create action
          if (angular.isDefined(scope.create())) scope.create({string: scope.results, newObject: true});
          
          //if select action defined, trigger create action
          if (angular.isDefined(scope.select())) scope.select();
        } 
    
        
      }
      
     scope.remove = function (index) {
       scope.tags.splice(index,1);
      if (angular.isDefined(scope.select)) scope.select();
     }
      


      
      /*
       * 
       *  Handling the user interface
       * 
       */
        
      elm.bind('keydown', function(event) {
          if ((event.keyCode == '40') && (scope.suggestions.length > 1) && (scope.selected < scope.suggestions.length ) ) {
            scope.selected = scope.selected + 1; 
            scope.$apply(scope.selected);
          }
          if ((event.keyCode == '38') && (scope.suggestions.length > 1) && (scope.selected <= scope.suggestions.length ) ) {
            scope.selected = scope.selected - 1; 
            scope.$apply(scope.selected);
          }
          if ( event.keyCode == '13' ) {
            scope.$apply(scope.select(scope.selected)); 
          }
          if ( event.keyCode == '27' ) {
            html.remove();
            scope.$apply(scope.newTag = '');
          }
        });
      
      $('html').bind('mousedown', function(event) {
      //if(!$(event.target).is('#foo')) && !$(event.target).parents("#foo").is("#foo")
        if (!$(event.target).parents(elm).is(elm) && angular.isDefined(html)) { 
          scope.$apply(scope.newTag = '');
          html.remove();
        }
       });
      
      //elm.bind
      //mousedown
      scope.toggleClass = function($index) {
       scope.selected =  $index;
        
      }
      
      scope.highlight = function(index) {
       if (scope.selected == index) return 'selected';
       return '';
      }
      
      
   }
 }
}])


.directive('autocomplete',[ '$http', '$compile', function($http, $compile) {
   return {
     restrict: 'E',
     scope: {
       results: '=',
       create: '&'
       },
     template: '<input id = "autocomplete" "type ="text" ng-change="complete()" ng-model="results">',
     link: function(scope, elm, attrs) {
     
     // setting these templates outside of the directive template allow to dynamically 
     var ElmWidth = elm[0].offsetWidth;
     var suggestionTemplate = '<ul class = "autocomplete">' +
                                   "<li ng-click='select($index, $event)' ng-mouseover = 'toggleClass($index)' ng-repeat = 'suggestion in suggestions' ng-class = 'highlight($index)' >" +
                                   '{{suggestion}}'+
                                   '</li></ul>';
    var noresultTemplate = '<ul class = "autocomplete">' +
                                   "<li ng-click='select()'>" +
                                   'Do you want to create a new occurence?' +
                                   '</li></ul>';
    var html;                          

    
    // watching the bindings to set up some smart defaults
      scope.$watch('results', function(results) {
        if (angular.isDefined(scope.results)) {
          if (scope.results.length == 0) { 
            if (angular.isDefined(html)) html.remove(); 
          }
        }
      });
      
      scope.$watch('suggestions', function(suggestions) {
        scope.selected = 0;
      });
    
    /*
     * 
     *  get the autocompletion data from the server
     * 
     */
     
     scope.complete = function() {
       
       // if no data entered do not show anything (Handling backspace )
       if (scope.results.length == 0) { 
         if (angular.isDefined(html)) html.remove(); 
      } else {
       
        $http({method: 'GET', url: attrs.url, params: {'q': scope.results }})
         .success(function(data) {
          if (html) html.remove();
          console.log(data);
          scope.suggestions = data;
          
          // if no data ask to create a new object
          if (data.length < 1) {
            html = $compile(noresultTemplate)(scope);
            
          } else {
          // compile the suggestions
            html = $compile(suggestionTemplate)(scope);
          }
          // append the result of the query to the element
          html.css('width', ElmWidth);
          $('ul.autocomplete').css('width', ElmWidth);
          elm.append(html);
        
        });
       
       }
     
      }
      // on click function
      scope.select = function($index, $event) {
        html.remove();
        if (angular.isDefined($index)) {
          //scope.results.createNew = false;
          scope.results = scope.suggestions[$index];
          scope.create({string: scope.results, newObject: false });
        } else {
          //scope.results.createNew = true;
          scope.create({string: scope.results, newObject: true});
        } 
    
        
      }
      
      /*
       * 
       *  Handling the user interface
       * 
       */
        
      elm.bind('keydown', function(event) {
          if ((event.keyCode == '40') && (scope.suggestions.length > 1) && (scope.selected < scope.suggestions.length ) ) {
            scope.selected = scope.selected + 1; 
            scope.$apply(scope.selected);
          }
          if ((event.keyCode == '38') && (scope.suggestions.length > 1) && (scope.selected <= scope.suggestions.length ) ) {
            scope.selected = scope.selected - 1; 
            scope.$apply(scope.selected);
          }
          if ( event.keyCode == '13' ) {
            scope.$apply(scope.select(scope.selected)); 
          }
          if ( event.keyCode == '27' ) {
            html.remove();
            scope.results = '';
            scope.$apply(scope.results);
          }
        });
      
      scope.toggleClass = function($index) {
       scope.selected =  $index;
        
      }
      
      scope.highlight = function(index) {
       if (scope.selected == index) return 'selected';
       return '';
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
  .directive( [ 'focus', 'blur', 'keyup', 'keydown', 'keypress' ].reduce( function ( container, name ) {
    var directiveName = 'ng' + name[ 0 ].toUpperCase( ) + name.substr( 1 );

    container[ directiveName ] = [ '$parse', function ( $parse ) {
        return function ( scope, element, attr ) {
            var fn = $parse( attr[ directiveName ] );
            element.bind( name, function ( event ) {
                scope.$apply( function ( ) {
                    fn( scope, {
                        $event : event
                    } );
                } );
            } );
        };
    } ];

    return container;
}, { } ) )
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
