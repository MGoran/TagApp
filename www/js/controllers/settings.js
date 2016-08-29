angular.module('settings.controller', []).controller('SettingsCtrl', function($scope, $rootScope, $ionicPopup, $state) {
  $rootScope.isUser = function() {
    console.log($rootScope.user)
    return $rootScope.user !== undefined && $rootScope.user.validated
  }
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
		console.log($rootScope.data);
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  $scope.saveSettings = function() {
		console.log($rootScope.data);
    localStorage.vc_transparency = $rootScope.data.vc_transparency;
    localStorage.dahua_speed = $rootScope.data.dahua_speed;
    localStorage.email_to = $rootScope.data.email_to;
    localStorage.email_subject = $rootScope.data.email_subject;
    localStorage.event_after = 10;
    localStorage.event_before = 5;
		localStorage.player_picker = $rootScope.data.player_picker;
    var alertPopup = $ionicPopup.alert({
      title: 'Success',
      template: "New Settings saved"
    });
    alertPopup.then(function(res) {
      console.log('Ok');
    });
  }
});
