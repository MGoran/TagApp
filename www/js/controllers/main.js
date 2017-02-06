angular.module('main.controller', []).controller('MainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $ionicLoading) {
  $rootScope.isUser = function() {
    //console.log($rootScope.user)
    return $rootScope.user !== undefined && $rootScope.user.validated
  }
  if (localStorage.vc_transparency == undefined || localStorage.vc_transparency == null || localStorage.vc_transparency == "") {
    console.log(true);
    $rootScope.data = {};
    $rootScope.data.recordings = {};
    $rootScope.data.vc_transparency = "99";
    $rootScope.data.player_picker = false;
    $rootScope.data.dahua_speed = "1";
    $rootScope.data.email_to = "goranmaslic92@gmail.com";
    $rootScope.data.email_subject = "TagApp Event";
    $rootScope.data.event_after = 10;
    $rootScope.data.event_before = 5;
    $rootScope.data.facebook_share = "EVERYONE";
    $rootScope.data.live_view = true;
    $rootScope.data.team1 = {
      "id": 1,
      "name": "Team1",
      "color": "yellow",
      "players": []
    };
    $rootScope.data.team2 = {
      "id": 2,
      "name": "Team2",
      "color": "blue",
      "players": []
    };
    $rootScope.data.event_types = [{
      "name": "Goal",
      "time_before": 10,
      "time_after": 10,
      "icon": "ion-ios-football",
      "start_counter": false,
      "generate_playback_video": true
    }, {
      "name": "Possession",
      "time_before": 10,
      "time_after": 10,
      "icon": "ion-shuffle",
      "start_counter": true,
      "generate_playback_video": false
    }, {
      "name": "Shot",
      "time_before": 10,
      "time_after": 10,
      "icon": "ion-ios-football",
      "start_counter": false,
      "generate_playback_video": true
    }, {
      "name": "Change",
      "time_before": 5,
      "time_after": 10,
      "icon": "ion-android-people",
      "start_counter": false,
      "generate_playback_video": true
    }, {
      "name": "Freekick",
      "time_before": 10,
      "time_after": 30,
      "icon": "ion-speakerphone",
      "start_counter": false,
      "generate_playback_video": true
    }, {
      "name": "Corner",
      "time_before": 10,
      "time_after": 30,
      "icon": "ion-flag",
      "start_counter": false,
      "generate_playback_video": true
    }, {
      "name": "Penalty",
      "time_before": 10,
      "time_after": 30,
      "icon": "ion-flag",
      "start_counter": false,
      "generate_playback_video": true
    }];
    $rootScope.defaultEvents = $rootScope.data.event_types;
    localStorage.team1 = JSON.stringify($rootScope.data.team1);
    localStorage.recordings = JSON.stringify($rootScope.data.recordings);
    localStorage.team2 = JSON.stringify($rootScope.data.team2);
    localStorage.event_types = JSON.stringify($rootScope.data.event_types);
    localStorage.vc_transparency = $rootScope.data.vc_transparency;
    localStorage.dahua_speed = $rootScope.data.dahua_speed;
    localStorage.email_to = $rootScope.data.email_to;
    localStorage.email_subject = $rootScope.data.email_subject;
    localStorage.event_after = $rootScope.data.event_after;
    localStorage.event_before = $rootScope.data.event_before;
    localStorage.player_picker = $rootScope.data.player_picker;
    localStorage.live_view = $rootScope.data.live_view;
    localStorage.facebook_share = $rootScope.data.facebook_share;
  } else {
    $rootScope.data = {};
    $rootScope.data.vc_transparency = localStorage.vc_transparency;
    $rootScope.data.dahua_speed = localStorage.dahua_speed;
    $rootScope.data.email_to = localStorage.email_to;
    $rootScope.data.email_subject = localStorage.email_subject;
    $rootScope.data.event_after = localStorage.event_after;
    $rootScope.data.event_before = localStorage.event_before;
    $rootScope.data.facebook_share = localStorage.facebook_share;
    $rootScope.data.team1 = JSON.parse(localStorage.team1);
    $rootScope.data.team2 = JSON.parse(localStorage.team2);
    $rootScope.data.event_types = JSON.parse(localStorage.event_types);
    $rootScope.data.player_picker = JSON.parse(localStorage.player_picker);
    $rootScope.data.live_view = JSON.parse(localStorage.live_view);
    $rootScope.data.recordings = JSON.parse(localStorage.recordings);
  }

	//Setting for One team view
  if (localStorage.one_team_view == undefined || localStorage.one_team_view == null || localStorage.one_team_view == "") {
    localStorage.one_team_view = false;
  }
  $rootScope.data.one_team_view = JSON.parse(localStorage.one_team_view);

	//Setting for sending xml
	if (localStorage.send_xml == undefined || localStorage.send_xml == null || localStorage.send_xml == "") {
    localStorage.send_xml = true;
  }
  $rootScope.data.send_xml = JSON.parse(localStorage.one_team_view);

  $scope.logout = function() {
    $rootScope.user = {};
    localStorage.user = "";
    $state.go('login');
  }
  $scope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function() {
      //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideLoading = function() {
    $ionicLoading.hide().then(function() {
      //console.log("The loading indicator is now hidden");
    });
  };
  $scope.exitApp = function() {
    ionic.Platform.exitApp();
  }
});
