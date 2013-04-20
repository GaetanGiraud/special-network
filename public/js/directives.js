'use strict';

/* Directives */


angular.module('CareKids.directives', []).
  directive('content', ['$compile', function($compile) {
    
    return {
      restrict: 'A',
      scope: {
        item: '='  
      },
    link: function(scope, elem, attrs) {
      var templateImage = '<img ng-src = "{{ item | thumbPicture }}" alt = "{{ item.title }}">';
      var templateVideo = '<div video = "{{ item.name }}" >';
      var html;
      
      scope.$watch('item', function(item) {
        if (angular.isDefined(item)) {
          console.log('logging item')
          console.log(item);
          if (item.type == "picture") html = $compile(templateImage)(scope);
          if (item.type == "video") html = $compile(templateVideo)(scope);
          elem.append(html);
        }
      });
    }
   }
  }]).
  directive('paginate',['$compile', '$http', '$window', '$rootScope', function($compile, $http, $window, $rootScope) {
    var page = 2;
    
    $rootScope.$on('$routeChangeSuccess', function() {
           $(window).unbind('scroll');
           page = 2;
    });
    
       return {
         restrict: 'A',
           scope: {
             newPageTarget: '=',
             url: '@'
           },
         template: '<div><i class = "icon-spinner icon-spin"></i> {{ status }}</div>',
         replace: true,
         link: function(scope, elem, attrs) {
         
         //var html;
         scope.status = 'Loading';

          $(window).bind('scroll', function(event) {
             if ($(window).scrollTop() > ($(document).height() - $(window).height() - 50)) {
                scope.loadNewPage();
                page++;
              }
           });
         
          
          // load new page function
            scope.loadNewPage = function() {
              if (angular.isUndefined(scope.url) || scope.url == null || scope.url == '') return; // do nothing if the url has not been loaded.
              $http({method: 'GET', url: scope.url, params: {'page': page} })
                .success(function(data) {
                  //data = [];
                  // if not result, unbind the scroll event.
                  if (data.length == 0) {
                    scope.status = 'End of page'; 
                    $(window).unbind('scroll');
                    
                    // remove the spinner if present
                    if (angular.isDefined(elem.children()[0])) {
                      elem.children()[0].remove();
                    }
                    
                  }
                  scope.newPageTarget = scope.newPageTarget.concat(data);
                 });
            }
          
          }
        
      }
  }])
.directive('uploader', ['$compile', function($compile) {
       return {
         restrict: 'A',
         scope: {
           done: '&',
           opts: '='
        //   progress: '&'
           },
         link: function(scope, elem, attrs) {
            
           var template = '<div class = "bar" ng-style="progress">' +
                '<br />' +
                '<button ng-show = "inProgress" type = "button" class= "btn" ng-click =  "abort()"> Abort</button>' +
                '<div ng-show = "!inProgress"><i class = "icon-spinner icon-spin"></i> We are processing the video ...</div>';
            var html;
            scope.progress = {width:  0 + '%' };
            
            scope.$watch('progress', function(progress) {
              if (progress.width == '100%' ) {
                 scope.inProgress = false; 
              }
              
            });
            
            scope.$watch('opts', function(opts) {
            console.log(opts);
            if (angular.isUndefined(opts)) opts = {};
            
            // replace the selector with the DOM element 
            opts.dropZone = $(opts.dropZone);
            
            opts = angular.extend(opts, {
              dataType: 'json', 
              add: function (e, data) {
                var jqXHR = data.submit()
                   // .success(function (result, textStatus, jqXHR) {/* ... */})
                    .error(function (jqXHR, textStatus, errorThrown) {
                      if (errorThrown === 'abort') {
                        alert('File Upload has been canceled');
                      }  
                    });
                  
                  opts.dropZone.text('Downloading');
                  scope.$apply(function(){
                    html = $compile(template)(scope);
                    scope.progress = 0;
                    scope.inProgress = true;
                    opts.dropZone.parent().append(html);
                    
                 });
                   // .complete(function (result, textStatus, jqXHR) {/* ... */});
              },
              progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                scope.$apply(scope.progress = {width:  progress + '%'});
                 //$('#progress .bar').css('width', progress + '%');
              },
              done:  function (e, data) {
                console.log(data);
               
                $.each(data.result, function (index, file) {
                  scope.done({file: file});
                 });
                html.remove();
                opts.dropZone.text('Drop files here!');
              }
            });
            console.log(opts);
          
           $(document).bind('drop dragover', function (e) {
              e.preventDefault();
           });
            
            elem.fileupload(opts);

            scope.abort = function() {
              alert('bindings work');
              //jqXHR.abort();
            };
            
            
            
            
          });
         }
      }
  }])
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
.directive('questionSearch',[ '$http', '$compile', '$location', function($http, $compile, $location) {
   return {
     restrict: 'A',
     scope: {
       search: '&'
      // term: '=',
     //  create: '@'
      // end: '&',
     //  add: '&'
       },
     template: '<div class="input-prepend">' + 
                 '<span class="add-on"><i class = "icon-search"></i></span>'+
                 ' <input class = "span6" placeholder = "search" id = "autocomplete" type ="search" ng-change="complete()" ng-model="term">' +
                '</div>',
     link: function(scope, elm, attrs) {

     var suggestionTemplate = '<ul class = "autocomplete">' +
                                   "<li ng-click='select($index, $event)' ng-mouseover = 'toggleClass($index)' ng-repeat = 'suggestion in suggestions' ng-class = 'highlight($index)' >" +
                                   '<i class = "icon-search"></i><span ng-bind-html-unsafe = "suggestion.term | highlight:term"></span>'+
                                   '</li>' +
                              '</ul>';
    var noresultTemplate = '<ul class = "autocomplete">' +
                                   "<li>" +
                                   'No results matching your request. Hi return to start a new search.' +
                                   '</li></ul>';
    var html;
    var inputElm =  angular.element(elm.children().children()[1]);
    var addOnElm =  angular.element(elm.children().children()[0]) ;
    var inputWidth = addOnElm[0].offsetWidth + inputElm[0].offsetWidth;
    var inputTop = inputElm[0].offsetTop + inputElm[0].offsetHeight;
    
      scope.$watch('suggestions', function(suggestions) {
        if (angular.isDefined(suggestions)) {
          if (suggestions.length == 0) {
           //scope.selected = 0;
           if (angular.isDefined(html)) html.remove(); 
          }
        }
      });
    
    /*
     * 
     *  get the autocompletion data from the server
     * 
     */
     scope.complete = function() {

       // if no data entered do not show anything (Handling backspace )
       if (scope.term.length == 0) { 
         if (angular.isDefined(html)) html.remove(); 
      } else {
       
        $http({method: 'GET', url: '/api/search' , params: {'term': scope.term }})
         .success(function(data) {
          console.log('succes fetching search data');
          if (html) html.remove();
          
           // if data is null, return
           if (data.length == 0) { 
               html = $compile(noresultTemplate)(scope);
            } else { 
            scope.suggestions = data;
            html = $compile(suggestionTemplate)(scope);
          }
          
          // append the result of the query to the element
          html.css('width', inputWidth);
          html.css('top', inputTop);
         // $('ul.autocomplete').css('width', inputWidth);
         // $('ul.autocomplete').
          console.log(html);
          console.log(elm);
          elm.append(html);
        
        });
       
       }
     
      }
      // on click function
      scope.select = function($index, $event) {
        if (angular.isDefined($index) && $index != '') {
          scope.term = scope.suggestions[$index].term;
        }
        console.log($index)
        //
        html.remove();
        //console.log(
        
        // increment the search term popularity
        $http.post('/api/search', { term: scope.term });
        $location.search({'term': scope.term}).path('/search');
        scope.term = '';
       // $location.search('term', scope.term).path('/search')
       // $location.path('/search?'

      }
    
    
      /*
       * 
       *  Handling the user interface
       * 
       */
      angular.element(inputElm).bind('focus', function(even) {
   //     addOnElm.addClass('fade');
        addOnElm.addClass('focus');
        scope.$apply(scope.selected = '');
        //addOnElm.css('border-right', 'none');
        inputElm.css('border-left', 'none');
        console.log('focussing');
      })
      
      angular.element(inputElm).bind('blur', function(even) {
        angular.element(addOnElm).removeClass('focus');
        console.log('bluring');
      })
      
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
            scope.$apply(scope.term = '');
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
      
      
  /*    function (element, start, end) { 
    var str = element.innerHTML;
    str = str.substr(0, start) +
        '<span class="hilite">' + 
        str.substr(start, end - start + 1) +
        '</span>' +
        str.substr(end + 1);
    element.innerHTML = str;
}*/
      
   }
 }
}])
.directive('tags',[ '$http', '$compile', function($http, $compile) {
   return {
     restrict: 'E',
     scope: {
       tags: '=',
     //  create: '@'
      // end: '&',
       add: '&'
       },
     template: '<div class = "input-prepend">' +
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
                                   "<li ng-click='select($index, $event)' ng-mouseover = 'toggleClass($index)' ng-repeat = 'suggestion in suggestions' ng-class = 'highlight($index)' >" +
                                   '{{suggestion.name }}'+
                                    "<li ng-show = 'createNew' ng-click='create()'>" +
                                   'Do you want to create a new occurence?' +
                                   '</li>'
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

    scope.createNew  = false;
    
    
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
     
     scope.create = function() {
         $http.post(attrs.url,  {'name': scope.newTag })
         .success(function(data) {
             html.remove();
             scope.add({tag:  data });
             scope.newTag = '';
          //if select action defined, trigger create actio
          })
     }
     
     scope.complete = function() {

       // if no data entered do not show anything (Handling backspace )
       if (scope.newTag.length == 0) { 
         if (angular.isDefined(html)) html.remove(); 
      } else {
       
        $http({method: 'GET', url: attrs.url, params: {'term': scope.newTag }})
         .success(function(data) {
          if (html) html.remove();
          console.log(data);
          scope.suggestions = data;
          
          if  (_.contains(scope.suggestions, scope.term )) {
              scope.createNew  = false;
          } else {
              scope.createNew  = true;
          }
         html = $compile(suggestionTemplate)(scope);
          
          // append the result of the query to the element
          html.css('width', ElmWidth);
          $('ul.autocomplete').css('width', ElmWidth);
          elm.append(html);
          console.log(scope.suggestions);
        
        });
       
       }
     
      }
      // on click function
      scope.select = function($index, $event) {
        html.remove();
        // follow all tags when adding them
        //$http.put('/api/tags/' + scope.suggestions[$index]._id, { action: 'follow' });
        //scope.tags.push(scope.suggestions[$index]);
        scope.newTag = '';
          //if select action defined, trigger create action
        console.log(scope.suggestions[$index]);
        scope.add({tag:  scope.suggestions[$index] });
      }
      
   /*  scope.remove = function (index) {
       scope.tags.splice(index,1);
     // if (angular.isDefined(scope.select)) scope.select();
     }*/
    
    
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
.directive('tag', function($http, $rootScope, $compile, $location){
  return {
    restrict: 'E' ,
    scope: {
      tag: '=',
      remove: '&'
    },
    //replace: true,
    template: '<span class = "tag" ng-click = "showPopover()">' +
                 '<img ng-src = "{{ tag | iconPicture }}">' +
                 ' {{ tag.name }}' +
                 ' <button type = "button" ng-show = "canRemove" ng-click = "removeTag()"> &times</button>' +
               '</span>' ,
    link: function(scope, elm, attrs) {
    var popOverTemplate =  '<div class = "custom-popover">' +
                              '<div class = "arrow-up"></div>' +
                              '<div class = "popover-inner">' +
                                '<div class = "popover-header">' +
                                  '<a ng-click = "follow()" ng-show = "!isFollowed">follow</a>' +
                                  '<a ng-click = "unfollow()" ng-show = "isFollowed">unfollow</a>' +
                                   '{{ tag.followers.length }} followers' +
                                '</div>' +
                                '<div class = "popover-body">' +
                                   '{{ tag.followers.length }} followers' +
                                '</div>' +
                              '</div>' +
                         '</div>';
    scope.isFollowed = false;
    scope.canRemove = false;
    
    var currentUserInit = false;
    var currentTagInit = false;
    var initPerformed = false;
    var clickRegistered;
    var html;
    
    // reset all tag initiation values on page change.
    scope.$on('$routeChangeSuccess', function(scope, next, current) {
      currentUserInit = false;
      currentTagInit = false;
      initPerformed = false;
      clickRegistered = false;
      
      if (angular.isDefined(html)) html.remove();
    });
   
    
    var initTag = function() {
      if (currentTagInit && currentUserInit && !initPerformed) {
        for(var i =0; i < scope.tag.followers.length; i++) {
          if ( scope.tag.followers[i] == $rootScope.currentUser._id)  {
            scope.isFollowed = true;
            initPerformed = true;
            break;
          } 
        }
      }
    }
    
    $rootScope.$watch('currentUser', function(currentUser) {
      if (angular.isDefined(currentUser) && currentUser != null) currentUserInit = true;
      initTag();
    });
    
    scope.$watch('tag', function(tag) {
      if (angular.isDefined(scope.tag.followers)) currentTagInit = true;
      initTag();        
    });
    
    attrs.$observe('action', function(action) {
      if (action) {
        scope.canRemove = true;
      }  
    })
    
    scope.showPopover = function() {
      if (clickRegistered) {
        $location.path('/topics/' + scope.tag.title);
      } else {
      console.log('showing');
      html = $compile(popOverTemplate)(scope);
      console.log(html);
      //elm.css
      elm.append(html);
      clickRegistered = true;
      }
    }
   
   $('html').bind('mousedown', function(event) {
      //if(!$(event.target).is('#foo')) && !$(event.target).parents("#foo").is("#foo")
        if (!$(event.target).parents(elm).is(elm) && angular.isDefined(html)) { 
          //scope.$apply(scope.newTag = '');
          html.remove();
          clickRegistered = false;
        }
   });
    
    scope.removeTag = function() {
      //console.log('remove');
      scope.remove({ tag: scope.tag }); 
    }
     
     scope.unfollow = function() {
        $http.put('/api/tags/' + scope.tag._id, { action: 'unfollow' }).success(function(tag) {
          console.log(tag)
          scope.tag = tag; 
          $rootScope.$broadcast('unFollowingTag', tag);
               //$rootScope.$safeApply(scope, function() { scope.isFollowed = false });  
          
        });
         
         scope.isFollowed = false;
      }
      
      scope.follow = function() {
        $http.put('/api/tags/' + scope.tag._id, { action: 'follow' }).success(function(tag) {
          //console.log(tag)
          scope.tag = tag;
          $rootScope.$broadcast('followingTag', tag);
          //$rootScope.$safeApply(scope, function() { scope.isFollowed = true });  
        });
        scope.isFollowed = true;  

       
      }
      
    scope.$on('followingTag', function(event, tag) {
        if (tag._id == scope.tag._id) scope.isFollowed = true;
     })       
  
    scope.$on('unFollowingTag', function(event, tag) {
      if (tag._id == scope.tag._id) scope.isFollowed = false;
    })             
      
      
    }
  }
  
  

  
})
.directive('kid', function($http, Message, $rootScope, $compile, $location, Child){
  return {
    restrict: 'E' ,
    scope: {
      child: '='
    },
    replace: true,
    template: '<div class = "child">' +
                 '<img ng-src = "{{ child | userIconPic }}">' +
                 ' {{ child.name }}' +
                  '<button class= "btn" type="button" ng-click = "follow()" ng-show = "!isFollowed"> Follow</button>' +
                  '<span ng-show = "isFollowed && !isValidated" >Following request sent.</span>' +
                  '<button class= "btn" type="button" ng-click = "unfollow()" ng-show = "isFollowed && isValidated "> Unfollow me</button>' +
                  '<span ng-show = "child.superpowers.length == 0"> No superpower registerd</span>' +
                 '<ul class = "unstyled">' +
                    '<li ng-repeat = "superp in child.superpowers">' +
                       '<tag tag= "superp"></tag>' +
                     '</li>' +
                  '</ul>' +
               '</div>' ,
    link: function(scope, elm, attrs) {
  
    
    
    var currentUserInit = false;
    var currentChildInit = false;
    var initPerformed = false;
    
    // reset all tag initiation values on page change.
    scope.$on('$routeChangeSuccess', function(scope, next, current) {
      currentUserInit = false;
      currentChildInit = false;
      initPerformed = false;
    });
   
    
    var initChild = function() {
      if (currentChildInit && currentUserInit && !initPerformed) {
        scope.isFollowed = false;
        scope.isValidated = false;
        console.log('permissions  ' + scope.child.name);
        console.log('rootScope currentUser ' + $rootScope.currentUser._id);
        
        if (angular.isArray(scope.child.permissions)) {
          for(var i =0; i < scope.child.permissions.length; i++) {
            console.log(scope.child.permissions)
            if ( scope.child.permissions[i]._user == $rootScope.currentUser._id)  {

              
              if(scope.child.permissions[i].validated == true) { 
                scope.isValidated = true;
                console.log('isValidated  ' + scope.child.name);
                
                 }
              
              scope.isFollowed = true;
              console.log(scope.isFollowed);
              initPerformed = true;
              break;
              //return;
            } 
          
          }
         } 
        // else {
         // if ( scope.child.permissions._user == $rootScope.currentUser._id)  {
         //   scope.isFollowed = true;
         //   initPerformed = true;
         // }
       // }
      }
    }
    
    scope.$watch('isFollowed', function(data) { console.log(data) })
    
    $rootScope.$watch('currentUser', function(currentUser) {
      if (angular.isDefined(currentUser) && currentUser != null) currentUserInit = true;
      initChild();
    });
    
    scope.$watch('child', function(child) {
      if (angular.isDefined(scope.child.permissions)) currentChildInit = true;
      initChild();        
    })
    
     scope.unfollow = function() {
        $http.put('/api/children/' + scope.child._id + '/follow', { action: 'unfollow' }).success(function(child) {
          scope.child = child; 
          $rootScope.$broadcast('unFollowingChild', child);
               //$rootScope.$safeApply(scope, function() { scope.isFollowed = false });  
          
        });
         
         scope.isFollowed = false;
      }
      
      scope.follow = function() {
        console.log('following');
        Message.send({
          content: $rootScope.currentUser.name + " wants to follow " + scope.child.name,
          action: { 
            actionType: "following",
            target: scope.child._id
            },
          _creator: $rootScope.currentUser,
          receivers: [ { '_user': scope.child.creator._user } ]
        });
        console.log('querying :')
        console.log('/api/children/' + scope.child._id + '/follow');
        
        
        $http.put('/api/children/' + scope.child._id + '/follow', { action: 'follow' }).success(function(child) {
          console.log(child);
          //scope.child = child; 
               //$rootScope.$safeApply(scope, function() { scope.isFollowed = false });  
          scope.isFollowed = true; 
          scope.isValidated = false; 
          $rootScope.$broadcast('followingChild', child);
        });
      }
      
    scope.$on('followingChild', function(event, child) {
        if (child._id == scope.child._id) scope.isFollowed = true;
     })       
  
    scope.$on('unFollowingChild', function(event, child) {
      if (child._id == scope.child._id) scope.isFollowed = false;
    })             
      
      
    }
  }
  
  

  
})


.directive('autocomplete',[ '$http', '$compile', function($http, $compile) {
   return {
     restrict: 'E',
     scope: {
       results: '='
       },
     template:  '<div class = "input-prepend">' +
                 '<span class= "add-on">' +
                    '<i class = "icon-user"></i>'+ 
                  '</span>' +
                  ' <input id = "autocomplete" type ="text" ng-change="complete()" ng-model="term">' + 
                '</div>' +
                '<ul class = "unstyled">' + 
                  '<li ng-repeat = "user in results">' +
                    '<img ng-src = "{{ user._id | userIconPic }}"/> {{ user._id.name  }} <button type = "button" ng-click = "remove($index)"> &times</button>' + 
                  '</li>' +
                '</ul>',
     link: function(scope, elm, attrs) {
     
     // setting these templates outside of the directive template allow to dynamically 
     //var ElmWidth = elm[0].offsetWidth;
     var inputElm =  elm.children().children()[1];
     var ElmWidth =  inputElm.offsetWidth;
     var suggestionTemplate = '<ul class = "autocomplete">' +
                                   "<li ng-click='select($index, $event)' ng-mouseover = 'toggleClass($index)' ng-repeat = 'suggestion in suggestions' ng-class = 'highlight($index)' >" +
                                   '<img ng-src="{{ suggestion._id | userIconPic }}"> {{suggestion._id.name}}'+
                                   '</li></ul>';
       var noresultTemplate = '<ul class = "autocomplete">' +
                                   "<li>" +
                                   'No results matching your request' +
                                   '</li></ul>';

    var html;
    
      
    // watching the bindings to set up some smart defaults
      scope.$watch('results', function(results) {
        if (angular.isDefined(scope.results)) {
          if (scope.results.length == 0) { 
            if (angular.isDefined(html)) html.remove(); 
          }
        } else {
        
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
       if (scope.term.length == 0) { 
         if (angular.isDefined(html)) html.remove(); 
      } else {
       
        $http({method: 'GET', url: attrs.url, params: {'term': scope.term }})
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
        scope.term = '';
        scope.results.push(scope.suggestions[$index]);    
      }
      
      scope.remove = function (index) {
        scope.results.splice(index,1);
        scope.term = '';
       // if (angular.isDefined(scope.select)) scope.select();
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
            scope.term = '';
            scope.$apply(scope.results);
          }
        });
        
      $('html').bind('mousedown', function(event) {
      //if(!$(event.target).is('#foo')) && !$(event.target).parents("#foo").is("#foo")
        if (!$(event.target).parents(elm).is(elm) && angular.isDefined(html)) { 
          scope.$apply(scope.term = '');
          html.remove();
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
.directive('contact', ['Socket', '$rootScope', function(Socket, $rootScope) {

          
    return {
        
      restrict: 'E', 
      scope:  { 
        user: '@',
        child: '@'
     //   templatename: '=',
     //   action: '&'
      },
      template: ' <a ng-click = "showDialog = !showDialog">Contact me </a>' +
                 '<div ng-show = "showDialog">' +
                    '<textarea ng-model = "newMessage.content"></textarea>' +
                    '<br />' +
                    '<button type="button" ng-click = "sendMessage()" class = "btn btn-success">ok</button>' + 
                    '<button type="button" ng-click = "showDialog = false" class = "btn">Cancel</button>' +
                 '</div>',
      link: function(scope, elm, attrs) {
         scope.showDialog = false;
         scope.newMessage = {};
         
         scope.$watch('child', function(child) {
           if (angular.isDefined(child) ) {
            scope.newMessage.action = { type: 'follow', target: child };
          }
         });
       
         $rootScope.$watch('currentUser', function(currentUser) {
           if (currentUser != null ) {
             scope.newMessage._creator = { '_id': currentUser._id, 'name': currentUser.name, 'picture': currentUser.picture } ;
           }
        });
         
         scope.newMessage.receivers = [];
    
         scope.$watch('user', function(user) {
         scope.newMessage.receivers.push({ '_id': user});
              console.log(scope.user);
       });
         scope.sendMessage = function () {
            Socket.socket().emit('messageCreated', scope.newMessage);
            scope.showDialog = false;
            scope.newMessage.content = '';
         }
   
      }
    }
  }])
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
  .directive('video', function($rootScope) {
    return {
      restrict: 'A', 
        scope:  { 
          video: '@'
        },
        template:  '<video id="my_video_1" class="video-js vjs-default-skin" controls ' + 
                         'preload="none">' +
                          '<source src="{{ source }}" type="video/mp4">' +
                          '</video>' ,
        replace: true,
      link: function(scope, elm, attrs) {
         scope.$watch('source', function(source) {
            if (angular.isDefined(source)) {
              var player = _V_(elm[0]);
            }
           
          });
        
        scope.$watch('video', function(isInitiated) {
          if (isInitiated && !scope.$$phase) {
             scope.source = 'http://localhost:3000/uploads/videos/' + scope.video;
          console.log(scope.source);
             
          } else {
            // remove the video is no input is provided
            /* console.log('remove the video');
            console.log(html);
            if (angular.isDefined(html))  {
               console.log('is defined html, removing it');
               html.remove();
            }
            console.log(html);*/
          }
        });
      }
    }
  })
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
  }])
 .directive('favicon', function($rootScope) {
    return function(scope, elm, attrs) {
    
      var getDomain = function(url) {
        return url.match(/:\/\/(.[^/]+)/)[1];
      }
      
      attrs.$observe('href', function(href) {
        if (angular.isDefined(href)) {
          elm.css({background: "url(http://google.com/s2/favicons?domain=" + getDomain(href) + ")" +
                              "left center no-repeat", 'padding-left': "20px"});
          
        }
      })
    }
  });
  
  
  

