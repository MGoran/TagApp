angular.module('eventTypes.controller', []).controller('EventTypesCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  if (localStorage.event_types !== undefined)
    $rootScope.data.event_types = JSON.parse(localStorage.event_types);

  $scope.remove = function(array, index) {
    array.splice(index, 1);
    //$rootScope.data.event_types = array;
    localStorage.event_types = JSON.stringify(array);
  }
  $scope.addNewEventTypeModal = function() {
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.newEventType">',
      title: 'New Event Type name',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.newEventType) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.data.newEventType;
          }
        }
      }]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
      $rootScope.data.event_types.push({
        "name": res
      });
      localStorage.event_types = JSON.stringify($rootScope.data.event_types);
			$scope.data.newEventType = "";
    });
  }
});
