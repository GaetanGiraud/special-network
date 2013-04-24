'use strict';

/* Services */


// Registering REST resources

angular.module('SocketServices', []).
  factory('Socket', ['$rootScope', function($rootScope) {
    var socket;
    var currentRoom = null;
    var firstconnect = true;
      
    var connect = function() {
          if(firstconnect) {
                socket = io.connect(null);
                firstconnect = false;
          }
          else {
            socket.socket.reconnect();
          }
          
      socket.on('error', function (reason){
          console.error('error', reason);
        });
      
      socket.on('disconnect', function (reason){
        console.info('disconnect', reason);
      });
      
      socket.on('connect', function (){
          console.info('successfully established a working and authorized connection');
      });
    }

     // disconnect socket on page change
   $rootScope.$on('$routeChangeSuccess', function() {
      if (currentRoom != null) {
         socket.emit('unsubscribe', { 'room': currentRoom});
         console.log('deconnected from: ' + currentRoom);
         currentRoom = null;
        }
   });
  
  //if (angular.isDefined(socket)) {

 // }

    return {
      connect: function() {
        connect();
        return;
      },
      socket: function() {
        return socket;  
      },
      subscribe: function(room) {
        currentRoom = angular.copy(room);
        socket.emit('subscribe', { 'room': room});
        console.log('connected to: ' + room)
        return;
      },
      unsubscribe: function(room) {
        socket.emit('unsubscribe', { 'room': room});
        console.log('deconnected from: ' + room)
        return;
      }
      
      
      
      
      
      
    };
  }])
  
 
  


