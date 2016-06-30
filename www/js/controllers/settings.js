angular.module('settings.controller', []).controller('SettingsCtrl', function($scope, $rootScope, $ionicPopup) {
  $rootScope.isUser = function (){
    console.log($rootScope.user)
    return $rootScope.user !==undefined && $rootScope.user.validated
  }
  $scope.saveSettings = function() {
      localStorage.vc_transparency = $rootScope.data.vc_transparency;
      localStorage.dahua_speed = $rootScope.data.dahua_speed;
      var alertPopup = $ionicPopup.alert({
        title: 'Success',
        template: "New Settings saved"
      });
      alertPopup.then(function(res) {
        console.log('Ok');
      });
    }
});
