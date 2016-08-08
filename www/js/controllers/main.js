angular.module('main.controller', []).controller('MainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state,  $ionicLoading) {
  $rootScope.isUser = function (){
    console.log($rootScope.user)
    return $rootScope.user !==undefined && $rootScope.user.validated
  }
  if (localStorage.vc_transparency == undefined || localStorage.vc_transparency == null || localStorage.vc_transparency == "") {
    $rootScope.data = {};
    $rootScope.data.vc_transparency = "50";
    $rootScope.data.dahua_speed = "1";
		$rootScope.data.email_to = "goranmaslic92@gmail.com";
		$rootScope.data.email_subject = "TagApp Event";
  } else {
    $rootScope.data = {};
    $rootScope.data.vc_transparency = localStorage.vc_transparency;
    $rootScope.data.dahua_speed = localStorage.dahua_speed;
		$rootScope.data.email_to = localStorage.email_to;
		$rootScope.data.email_subject = localStorage.email_subject;
  }
  $scope.logout = function() {
    $rootScope.user = {};
    $state.go('login');
  }
	$scope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function(){
       console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideLoading = function(){
    $ionicLoading.hide().then(function(){
       console.log("The loading indicator is now hidden");
    });
  };
});
