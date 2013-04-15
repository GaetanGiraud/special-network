'use strict';



function MessageCtrl($scope, $location, Message, Socket, Child) {
  
  // setting up defaults
    $scope.relationships = [
      {name:'Mother'},
      {name:'Father'},
      {name:'Grandpa'},
      {name:'Grandma'},
      {name:'Family'},
      {name:'Friend'}
    ];
    
    $scope.newMessage = {};
    $scope.newMessage.receivers = [];
  
  // querying the messages in the database
    Message.query(function(err, data) {
       $scope.messages = data;  
    });
  
  /*
   * 
   * Watchers
   * 
   */
  
  
  // When currentUser is loaded, subscribe to the socket and set the creator value of new messages
    $scope.$watch('currentUser', function(currentUser) {
      if (currentUser != null) {
        $scope.newMessage._creator = { '_id': currentUser._id, 'name': currentUser.name, 'picture': currentUser.picture } ;
        Socket.subscribe('messages_' +  currentUser._id );
      }
    });
    
    // Set the action value parameter on change of messages
    $scope.$watch('currentMessage', function(currentMessage) { 
      if ( angular.isDefined($scope.currentMessage)) {  
        if( angular.isDefined($scope.currentMessage.action) && ($scope.currentMessage._creator._id != $scope.currentUser._id) ) {
          $scope.showAction = true;
        } else {
        $scope.showAction = false;
        }
      }
    });
    
    // sort the messages using underscore upon changes.
    $scope.$watch('messages', function(messages){
       var sortedMessages = _.sortBy($scope.messages, function(message) { return message.updatedAt }).reverse();    
       $scope.$safeApply($scope, function() { $scope.sortedMessages = sortedMessages; });
      }, true);
      
    /* 
     * 
     * set the currentMessage. 
     * 
     */
     
    $scope.setCurrentMessage = function(message) {
      $scope.currentMessage = message; 
      
      // Toggle the read status if not already set to true.
      if (!$scope.messageStatus(message)) {
         if ($scope.currentMessage._creator._id == $scope.currentUser._id)  { 
             $scope.currentMessage.read = true
          } else {
           for(var i =0; $scope.currentMessage.receivers.length; i++) {
            if ($scope.currentMessage.receivers[i]._user._id == $scope.currentUser._id) {
                $scope.currentMessage.receivers[i].read = true;
              break; 
            }
            }
         }
         Message.update($scope.currentMessage, {read: true});
       } 
      // toggle the actionMessage status. 
      // The Creator of the message is the requestor and do not get to see the message.
      
      if (angular.isDefined(message.action) && (message._creator._id != $scope.currentUser._id) )
       {
         $scope.actionMessage = true;
        }
    }
  
   /*
    *  Download more messages
    */
  
  $scope.moreMessages = function() { 
     Message.query(function(err, data) {
       $scope.messages = $scope.messages.concat(data);
    });
    
  }
  
  
  
   /*
    *  create a new message
    */
    
    $scope.createMessage = function() {
      
      // deep copy the message to allow manipulation on the data before sending it to the server.
      var message = angular.copy($scope.newMessage);
      // replace the receivers by their _id.
      _.each(message.receivers, function(element, index, list) {
        message.receivers[index] = { '_user': element._id._id };
      })
      
      Socket.socket().emit('messageCreated', message);
      
      // add the message to the message array and reset the newMessage values;
      $scope.messages.unshift(angular.copy($scope.newMessage));
      $scope.newMessage.content = '';
      $scope.newMessage.receivers = []; 
    }   
          
   // extract the read / unread status of a message for the currentUser
    $scope.messageStatus = function(message) {
      if (message._creator._id == $scope.currentUser._id) return message.read;  
      return _.find(message.receivers, function(receiver) { return receiver._user._id == $scope.currentUser._id  }).read;
    }
    
    $scope.messageClass = function(message) {
      $scope.$safeApply($scope, function() {
      if ($scope.messageStatus(message) && message === $scope.currentMessage) return 'read selected';
      if ($scope.messageStatus(message)) return 'read';
      return '';
    });
      
    }
    /*
     * handle the following requests logic
     */
    
    $scope.respondtoFollowingRequest = function(acceptance) {
      
      if(acceptance) {
      Child.update({'childId': $scope.currentMessage.action.target._id },
         { permission: { _user: $scope.currentMessage._creator._id,
           rights: 'write',
           relationship: $scope.relationship}
          });
       }   
      Message.update($scope.currentMessage, { action : { executed: true }});
      $scope.$safeApply($scope, function() { $scope.currentMessage.action.executed = true });
    };
    
    /*
     * Receive angular events from reply Controller.
     */
    
    $scope.$on('event:replyAdded', function(event, reply, id) {
      Socket.socket().emit('replyAdded', { 'reply': reply, 'messageId': id});
      reply.createdAt = moment().utc().format();
      $scope.currentMessage.replies.push(reply);
      $scope.currentMessage.updatedAt = moment().utc().format();
    });

   /*
    * 
    * Receiving and processing sockets on the open socket.
    * 
    */
  
  // adding a reply to a discussion
   Socket.socket().on('newReply', function(message) {
      // To check if a message has been found
      var messageFound = false;
      
      // loop through all messages until the message has been found
      for(var i = 0; i < $scope.messages.length; i ++) {
        if ( $scope.messages[i]._id == message._id) {
           var reply = _.last(message.replies);
           
           // add the reply message to the scope.
           // Change the updated date of the message.
           $scope.$apply(function() { 
             $scope.messages[i].replies.push(reply);
             $scope.messages[i].updatedAt = reply.createdAt;
             });
           messageFound = true;
          break;     
        }
      }
      // not message found, push it at the top of the message list.
      if (!messageFound) { 
       $scope.$apply(function() {
          $scope.messages.push(message);
        });
      }
    });
    
    // receiving new message
    Socket.socket().on('newMessage', function(message) {
         $scope.$apply($scope.messages.unshift(message));
    });
    
    // update message with database information after successful broadcast.
    Socket.socket().on('messageSavedSuccess', function(message) {
      $scope.$apply($scope.messages[0] = message);
      $scope.setCurrentMessage($scope.messages[0]);
    });
    

}
MessageCtrl.$inject = ['$scope', '$location', 'Message', 'Socket', 'Child'];

function newReplyCtrl($scope) {
  $scope.newReply = {};
  
  $scope.$watch('currentUser', function(currentUser) {
      if (currentUser != null) {
        $scope.$watch('newReply', function(newReply) {
          $scope.newReply._creator = {_id: currentUser._id, name: currentUser.name, picture: currentUser.picture};
        });
      }
  });
    
  $scope.createReply = function() {
      $scope.$emit('event:replyAdded', $scope.newReply, $scope.currentMessage._id );
      $scope.newReply = '';
  }
  
}
newReplyCtrl.$inject = ['$scope'];
