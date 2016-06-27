angular.module('panofield.controller', []).controller('PanofieldCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $interval, $http, $ionicPopup) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  flowplayer("#hlsjslive", {
    splash: true,
    embed: false,
    ratio: 9 / 16,

    clip: {
      live: true,
      sources: [{
        type: "application/x-mpegurl",
        src: "http://84.104.56.233:8080/video/live.m3u8"
      }]
    }

  });
  $scope.showEventListModal = false;
  $scope.showEventList = function() {
    $scope.showEventListModal = true;
  }
  $scope.hideEventList = function() {
    $scope.showEventListModal = false;
  }
  $scope.blinkingColor = "white";
  $interval(function() {
    if ($scope.blinkingColor === "red")
      $scope.blinkingColor = "white";
    else
      $scope.blinkingColor = "red";
  }, 1000);
  var controller = this;
  controller.API = null;
  $scope.onSwipeUp = function() {
    console.log("swipe");
    $ionicViewSwitcher.nextDirection('up'); // 'forward', 'back', etc.
    $timeout(function() {
      $state.go('app.events');
    });
  }
  $rootScope.checkStatus = function() {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/recorder",
      "method": "GET",
    }
    $http(settings).then(function(response) {
      console.log(response);
      $rootScope.recorderStarted = response.data.recording;
      $rootScope.recording_id = response.data.recording_id;
    }, function(err) {
      console.log(err);
    });
  }
  $rootScope.ptzMove = function(direction) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/ptz",
      "method": "PUT",
      "data": JSON.stringify({
        "manual": true,
        "move": direction,
      })
    }
    $http(settings).then(function(response) {
      console.log(response);

    }, function(err) {
      console.log(err);
    });
  }
  $rootScope.startRecorder = function() {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/recorder",
      "method": "PUT",
      "data": JSON.stringify({
        recording: true,
        streaming: true
      })
    }
    $http(settings).then(function(response) {
      console.log(response);
      if (response.data.error != "") txt = response.data.error;
      else txt = 'Recorder started';
      var alertPopup = $ionicPopup.alert({
        title: 'Recorder',
        template: txt
      });

      alertPopup.then(function(res) {
        console.log('Ok');
        $scope.checkStatus();
      });
    }, function(err) {
      console.log(err);
    });
  }
  $rootScope.stopRecorder = function() {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/recorder",
      "method": "PUT",
      "data": "{\"recording\":false}",
      // 'headers': {'Content-Type': 'text/plain'}
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
      var alertPopup = $ionicPopup.alert({
        title: 'Recorder',
        template: 'Recorder stoped'
      });

      alertPopup.then(function(res) {
        console.log('Ok');
        $scope.checkStatus();
      });
    }, function(err) {
      console.log(err);
    });
  }
  $scope.checkStatus();
  $rootScope.team = [];
  $scope.checkCurrentEvents = function() {
    if ($rootScope.recording_id != undefined) {
      console.log($rootScope.recording_id);
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": $rootScope.selectedCam.ip + "/api/event?recording_id=" + $rootScope.recording_id,
        "method": "GET",
      }
      $http(settings).then(function(response) {
        console.log(response);
        $rootScope.team[1] = response.data.team[0].name;
        $rootScope.team[2] = response.data.team[1].name;
        $rootScope.eventList = response.data.list;

        for (i = 0; i < $rootScope.eventList.length; i++) {
          $rootScope.eventList[i].event = $rootScope.events[$rootScope.eventList[i].event_type_id - 1];
          $rootScope.eventList[i].team = $rootScope.team[$rootScope.eventList[i].team_id];

          var dateStr = $rootScope.eventList[i].begin.split("-");
          var date = new Date(dateStr[0], dateStr[1], dateStr[2], dateStr[3], dateStr[4], dateStr[5]);
          $rootScope.eventList[i].start = date;
          var dateStr = $rootScope.eventList[i].end.split("-");
          var date = new Date(dateStr[0], dateStr[1], dateStr[2], dateStr[3], dateStr[4], dateStr[5]);
          $rootScope.eventList[i].stop = date;
          $rootScope.eventList[i].length = ($rootScope.eventList[i].stop - $rootScope.eventList[i].start) / 1000;


        }
        console.log($rootScope.eventList);
      }, function(err) {
        console.log(err);
      });
    } else {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": $rootScope.selectedCam.ip + "/api/recorder",
        "method": "GET",
      }
      $http(settings).then(function(response) {
        console.log(response);
        $rootScope.recording_id = response.data.recording_id;
        $scope.checkCurrentEvents();
      }, function(err) {
        console.log(err);
      });
    }
  }
  $scope.checkCurrentEvents();
  if ($rootScope.events === undefined) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/event_type",
      "method": "GET",
    }
    $http(settings).then(function(response) {
      console.log(response);
      $rootScope.events = response.data.list;
    }, function(err) {
      console.log(err);
    });
  }
  $scope.setEvent = function(event, team_id) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/event",
      "method": "POST",
      "data": {
        'event_type_id': event.id,
        team_id: team_id
      }
    }
    $http(settings).then(function(response) {
      console.log(response);
      $scope.checkCurrentEvents();
      var event_id = response.data.id;
      var recording_id = response.data.recording_id;
      var confirmPopup = $ionicPopup.confirm({
        title: 'Event Added',
        template: 'Export this event?',
        cancelText: 'No',
        okText: 'Yes'
      });

      confirmPopup.then(function(res) {
        if (res) {
          console.log('Export');
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": $rootScope.selectedCam.ip + "/api/export",
            "method": "POST",
            "data": JSON.stringify({
              recording_id: recording_id,
              selections: {
                event_id: event_id
              }
            }),
          }
          console.log(settings);
          $http(settings).then(function(response) {
            console.log(response);
          }, function(err) {
            console.log(err);
          });
        } else {
          console.log('Dont Export');
        }
      });

    }, function(err) {
      console.log(err);
      var alertPopup = $ionicPopup.alert({
        title: 'Problem',
        template: err.data.error
      });

      alertPopup.then(function(res) {
        console.log('Ok');
      });
    });
  }
  $scope.changeTeamName = function(team) {
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.teamname">',
      title: 'Enter new name for Team' + team,
      subTitle: 'Current Team name is: ' + $rootScope.team[team],
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Save</b>',
        type: 'gm-btn-green',
        onTap: function(e) {
          if (!$scope.data.teamname) {
            //don't allow the user to close unless he enters wifi password
            console.log("skip")
              //e.preventDefault();
          } else {
            var settings = {
              "async": true,
              "crossDomain": true,
              "url": $rootScope.selectedCam.ip + "/api/team",
              "method": "PUT",
              "data": JSON.stringify({
                team_id: team,
                name: $scope.data.teamname
              }),
            }
            $http(settings).then(function(response) {
              console.log(response);
              $scope.checkCurrentEvents();
            }, function(err) {
              console.log(err);
            });
          }
        }
      }]
    });
  }
  $scope.exportEvent = [];
  $scope.exportSelectedEvents = function() {
    var selections = [];
    angular.forEach($scope.exportEvent, function(value, key) {
      if (value == true) selections.push({
        event_id: key
      })
    });
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/export",
      "method": "POST",
      "data": JSON.stringify({
        recording_id: $rootScope.recording_id,
        selections: selections
      }),
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
      var alertPopup = $ionicPopup.alert({
        title: 'Success',
        template: "Selected Events added for export"
      });

      alertPopup.then(function(res) {
        console.log('Ok');
      });
    }, function(err) {
      console.log(err);
    });
  }
  $scope.deleteEvent = function(event) {
    console.log(event);
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/api/event",
      "method": "DELETE",
      "data": JSON.stringify({
        event_id: event.id
      }),
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
      $scope.checkCurrentEvents();
    }, function(err) {
      console.log(err);
    });
  }
});
