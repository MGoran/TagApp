angular.module('settings.controller', []).controller('SettingsCtrl', function($scope, $rootScope, $ionicPopup, $state, $ionicHistory) {
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
		localStorage.facebook_share = $rootScope.data.facebook_share;
		localStorage.live_view = $rootScope.data.live_view;
		localStorage.one_team_view = $rootScope.data.one_team_view;
		localStorage.send_xml = $rootScope.data.send_xml;
    var alertPopup = $ionicPopup.alert({
      title: 'Success',
      template: "New Settings saved"
    });
    alertPopup.then(function(res) {
      console.log('Ok');
			$ionicHistory.goBack();
    });
  }
});
