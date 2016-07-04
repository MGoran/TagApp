angular.module('dahua.controller', []).controller('DahuaCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $interval, $http, $ionicPopup, $interval, recorder) {
  $scope.team = [];
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
    $scope.getEventTypes();
    $scope.getStateOfRecorder();

  });
  $scope.blinkingColor = "white";
  $interval(function() {
    if ($scope.blinkingColor === "red")
      $scope.blinkingColor = "white";
    else
      $scope.blinkingColor = "red";
  }, 1000);
  var authdata = btoa("admin" + ':' + "admin");
  $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
  $scope.pan = function(direction, action) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/cgi-bin/ptz.cgi?action=" + action + "&channel=0&code=" + direction + "&arg1=0&arg2=" + $rootScope.data.dahua_speed + "&arg3=0",
      "method": "get",
      "headers": {
        'Authorization': 'Basic ' + authdata
      }
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
    }, function(err) {
      console.log(err);
    });
  }
  $scope.zoom = function(direction, action) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/cgi-bin/ptz.cgi?action=" + action + "&channel=0&code=" + direction + "&arg1=0&arg2=multiple&arg3=0",
      "method": "get",
      "headers": {
        'Authorization': 'Basic ' + authdata
      }
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
    }, function(err) {
      console.log(err);
    });
  }
  $scope.gotoPreset = function(index) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/cgi-bin/ptz.cgi?action=start&channel=0&code=GotoPreset&arg1=0&arg2=" + index + "&arg3=0",
      "method": "get",
      "headers": {
        'Authorization': 'Basic ' + authdata
      }
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
    }, function(err) {
      console.log(err);
    });
  }
  $scope.showEventListModal = false;
  $scope.showEventList = function() {
    $scope.getEventList();
		$scope.getRecordingDetails();
    $scope.showEventListModal = true;
  }
  $scope.hideEventList = function() {
    $scope.showEventListModal = false;
  }
  $scope.getStateOfRecorder = function() {
    var promise = recorder.getStateOfRecorder($rootScope.selectedCam.recorder_ip);
    promise.then(
      function(response) {
        $scope.data.recorder = response.data;
        console.log($scope.data);
        $scope.getTeamNames($rootScope.selectedCam.recorder_ip, $scope.data.recorder.recording_id);
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.setStateOfRecorder = function(run) {
    var data = {
      "recording": run,
      "streaming": run
    }
    var promise = recorder.setStateOfRecorder($rootScope.selectedCam.recorder_ip, data);
    promise.then(
      function(response) {
        console.log(response);
        //$scope.data.recorder = response.data;
        $scope.getStateOfRecorder();
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.getCameraProfiles = function() {
    var promise = recorder.getCameraProfiles($rootScope.selectedCam.recorder_ip);
    promise.then(
      function(response) {
        $scope.data.cameraProfiles = response;
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.getEventTypes = function() {
    var promise = recorder.getEventTypes($rootScope.selectedCam.recorder_ip);
    promise.then(
      function(response) {
        $scope.data.event_types = response.data.list;
        console.log($scope.data);
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.getEventList = function() {
    var promise = recorder.getEventList($rootScope.selectedCam.recorder_ip, $scope.data.recorder.recording_id);
    promise.then(
      function(response) {
        console.log(response);
        $scope.team[1] = response.data.team[0].name;
        $scope.team[2] = response.data.team[1].name;
        $scope.data.eventList = response.data.list;

        for (i = 0; i < $scope.data.eventList.length; i++) {
          $scope.data.eventList[i].event = $scope.data.event_types[$scope.data.eventList[i].event_type_id - 1];
          $scope.data.eventList[i].team = $scope.team[$scope.data.eventList[i].team_id];

          var dateStr = $scope.data.eventList[i].begin.split("-");
          var date = new Date(dateStr[0], dateStr[1], dateStr[2], dateStr[3], dateStr[4], dateStr[5]);
          $scope.data.eventList[i].start = date;
          var dateStr = $scope.data.eventList[i].end.split("-");
          var date = new Date(dateStr[0], dateStr[1], dateStr[2], dateStr[3], dateStr[4], dateStr[5]);
          $scope.data.eventList[i].stop = date;
          $scope.data.eventList[i].length = ($scope.data.eventList[i].stop - $scope.data.eventList[i].start) / 1000;
        }
        console.log($rootScope.eventList);
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.getTeamNames = function(ip, recording_id) {
    var promise = recorder.getTeamNames(ip, recording_id);
    promise.then(
      function(response) {
        $scope.data.teams = response.data;
        console.log($scope.data);
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.changeTeamName = function(team) {
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.teamname">',
      title: 'Enter new name for Team' + team,
      subTitle: 'Current Team name is: ' + $scope.data.teams.team[team - 1].name,
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
            data = {
              team_id: team,
              name: $scope.data.teamname
            }
            $scope.data.teamname = "";
            var promise = recorder.setTeamName($rootScope.selectedCam.recorder_ip, $scope.data.recorder.recording_id);
            promise.then(
              function(response) {
                //$scope.data.teams = response.data;
                console.log($scope.data);
                $scope.getTeamNames($rootScope.selectedCam.recorder_ip, $scope.data.recorder.recording_id);
              },
              function(error) {
                console.log(error)
              }
            );
          }
        }
      }]
    });
  }
  $scope.setEvent = function(event, team_id) {
    var data = {
      "event_type_id": event.id,
      "team_id": team_id,
      "recording_id": $scope.data.recorder.recording_id,
    }
    var promise = recorder.setEvent($rootScope.selectedCam.recorder_ip, data);
    promise.then(
      function(response) {
				console.log(response);
        var event_id = response.data.id;
        var recording_id = response.data.recording_id;
        var data = {
          recording_id: recording_id,
          selections: {
            event_id: event_id
          },
					file_name: event_id + "-" + recording_id + "-" + response.data.time
        }
        var exp_promise = recorder.queueExport($rootScope.selectedCam.recorder_ip, data);
        exp_promise.then(
          function(response) {
            console.log("exported");
            console.log(response);
            $scope.getEventList();
						$scope.getRecordingDetails();
          },
          function(error) {
            console.log(error);
          }
        )
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.exportSelectedEvents = function() {
    var selections = [];
    angular.forEach($scope.data.exportEvent, function(value, key) {
      if (value == true) selections.push({
        event_id: key
      })
    });
    var data= {
      recording_id: $rootScope.data.recorder.recording_id,
      selections: selections
    }
    var promise = recorder.queueExport($rootScope.selectedCam.recorder_ip, data);
    promise.then(
      function(response) {
        console.log(response);
        var alertPopup = $ionicPopup.alert({
          title: 'Success',
          template: "Selected Events added for export"
        });

        alertPopup.then(function(res) {
          console.log('Ok');
        });
      },
      function(error) {
        console.log(error)
      }
    );
  }
	$scope.getRecordingDetails = function(){
		var promise = recorder.getDetailsOfRecording($rootScope.selectedCam.recorder_ip, $scope.data.recorder.recording_id);
		promise.then(
			function(response) {
				console.log(response);
			},
			function(error) {
				console.log(error);
			}
		)
	}
});
