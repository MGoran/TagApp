angular.module('main.controller', []).controller('MainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $ionicLoading) {
  $rootScope.isUser = function() {
    console.log($rootScope.user)
    return $rootScope.user !== undefined && $rootScope.user.validated
  }
  if (localStorage.vc_transparency == undefined || localStorage.vc_transparency == null || localStorage.vc_transparency == "") {
		console.log(true);
    $rootScope.data = {};
    $rootScope.data.vc_transparency = "50";
    $rootScope.data.dahua_speed = "1";
    $rootScope.data.email_to = "goranmaslic92@gmail.com";
    $rootScope.data.email_subject = "TagApp Event";
    $rootScope.data.event_after = 10;
    $rootScope.data.event_before = 5;
    $rootScope.data.team1 = {
      "name": "Team1",
      "players": []
    };
    $rootScope.data.team2 = {
      "name": "Team2",
      "players": []
    };
    $rootScope.data.event_types = [{
      "name": "Goal"
    }, {
      "name": "Corner"
    }];

    localStorage.team1 = JSON.stringify($rootScope.data.team1);
    localStorage.team2 = JSON.stringify($rootScope.data.team2);
    localStorage.event_types = JSON.stringify($rootScope.data.event_types);
		localStorage.vc_transparency = $rootScope.data.vc_transparency;
		localStorage.dahua_speed = $rootScope.data.dahua_speed;
		localStorage.email_to = $rootScope.data.email_to;
		localStorage.email_subject = $rootScope.data.email_subject;
		localStorage.event_after = $rootScope.data.event_after;
		localStorage.event_before = $rootScope.data.event_before;
  } else {
    $rootScope.data = {};
    $rootScope.data.vc_transparency = localStorage.vc_transparency;
    $rootScope.data.dahua_speed = localStorage.dahua_speed;
    $rootScope.data.email_to = localStorage.email_to;
    $rootScope.data.email_subject = localStorage.email_subject;
    $rootScope.data.event_after = localStorage.event_after;
    $rootScope.data.event_before = localStorage.event_before;
    $rootScope.data.team1 = JSON.parse(localStorage.team1);
    $rootScope.data.team2 = JSON.parse(localStorage.team2);
    $rootScope.data.event_types = JSON.parse(localStorage.event_types);
  }
  $scope.logout = function() {
    $rootScope.user = {};
    $state.go('login');
  }
  $scope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function() {
      console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideLoading = function() {
    $ionicLoading.hide().then(function() {
      console.log("The loading indicator is now hidden");
    });
  };
});
