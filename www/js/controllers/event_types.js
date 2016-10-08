angular.module('eventTypes.controller', []).controller('EventTypesCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  $scope.event = {};
  if (localStorage.event_types !== undefined)
    $rootScope.data.event_types = JSON.parse(localStorage.event_types);

  $scope.remove = function(array, index) {
    array.splice(index, 1);
    //$rootScope.data.event_types = array;
    localStorage.event_types = JSON.stringify(array);
  }
  $scope.addNewEventTypeModal = function() {
    var temp = '<div class="list">';
    temp += '<label class="item item-input">';
    temp += '  <input type="text" ng-model="event.name" placeholder="Event name">';
    temp += '</label>';
    temp += '<label class="item item-input">';
    temp += '  <input type="text"  ng-model="event.time_before"  placeholder="Record time before">';
    temp += '</label>';
    temp += '<label class="item item-input">';
    temp += '  <input type="text"  ng-model="event.time_after"  placeholder="Record time after">';
    temp += '</label>';
    temp += '</div>';
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: temp,
      title: 'New Event Type',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.event.name) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.event;
          }
        }
      }]
    });
    myPopup.then(function(event) {
      console.log('Tapped!', event);
      event.icon = "ion-alert";
      event.start_counter = false;
      event.generate_playback_video = true;
      $rootScope.data.event_types.push(event);
      console.log($rootScope.data.event_types)
      localStorage.event_types = JSON.stringify($rootScope.data.event_types);
      $scope.event = {};
    });
  }

  $scope.editEventType = function(event, index) {
    console.log(event);
    $scope.event = event;
    var temp = '<div class="list">';
    temp += '<label class="item item-input">';
    temp += '  <input type="text" ng-model="event.name" placeholder="Event name">';
    temp += '</label>';
    temp += '<label class="item item-input">';
    temp += '  <input type="text"  ng-model="event.time_before"  placeholder="Record time before">';
    temp += '</label>';
    temp += '<label class="item item-input">';
    temp += '  <input type="text"  ng-model="event.time_after"  placeholder="Record time after">';
    temp += '</label>';
    temp += '</div>';
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: temp,
      title: 'Edit Event Type',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.event.name) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.event;
          }
        }
      }]
    });
    myPopup.then(function(event) {
      $rootScope.data.event_types[index] = event;
      //$rootScope.data.event_types.push(event);
      console.log($rootScope.data.event_types)
      localStorage.event_types = JSON.stringify($rootScope.data.event_types);
      $scope.event = {};
    });
  }

	$scope.reorderItem = function(item, fromIndex, toIndex) {
    //Move the item in the array
    $rootScope.data.event_types.splice(fromIndex, 1);
    $rootScope.data.event_types.splice(toIndex, 0, item);
		localStorage.event_types = JSON.stringify($rootScope.data.event_types);
  };
});
