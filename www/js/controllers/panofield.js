angular.module('panofield.controller', []).controller('PanofieldCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $interval, $http, $ionicPopup, $interval, $sce, $cordovaFileTransfer, recorder) {

  $scope.data = {};
  $scope.data.downloadingPlayback = false;
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
    $scope.getEventTypes();
    $scope.getStateOfRecorder();
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
  $scope.blinkingColor = "white";
  $interval(function() {
    if ($scope.blinkingColor === "red")
      $scope.blinkingColor = "white";
    else
      $scope.blinkingColor = "red";
  }, 1000);
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
  $rootScope.ptzMove = function(direction) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.recorder_ip + "/api/ptz",
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
  $scope.onUpdateTime = function(currentTime, totalTime) {
    $timeout(function() {
      $scope.currentTime = currentTime;
      $scope.totalTime = totalTime;
    })
  };

  $scope.isDownloaded = function() {

    $scope.fileExists = [];
    console.log($scope.data.videos.length);
    for (i = 0; i < $scope.data.videos.length; i++) {
      var video = $scope.data.videos[i];
      // if(ionic.Platform.isAndroid()){
      // 	var targetPath = cordova.file.externalDataDirectory + video.file_name.replace(/\s+/g, '');
      // }else{
      // 	var targetPath = cordova.file.	documentsDirectory + video.file_name.replace(/\s+/g, '');
      // }
			//alert("Check Target Path");
			alert("Check 1");
			alert(JSON.stringify(cordova));
			alert("Check 2");
			alert(JSON.stringify(cordova.file));
			alert("Check 3");
			alert(JSON.stringify(cordova.file.dataDirectory));
      var targetPath = cordova.file.dataDirectory + video.file_name.replace(/\s+/g, '');
			//alert(targetPath);
      window.resolveLocalFileSystemURL(targetPath, function() {
        $timeout(function() {
          console.log("File Found");
          $scope.fileExists.unshift(true);
          console.log($scope.fileExists);
        })
      }, function() {
        $timeout(function() {
          $scope.fileExists.unshift(false);
          console.log("File Not Found");
          console.log($scope.fileExists);
        })
      });
    }
    return false;
  }
  $scope.showPlaybackVideoModal = false;
  $scope.showPlaybackVideo = function(video) {
    // $timeout(function() {
    //   $scope.data.videos = $scope.data.videos;
    // })

    console.log(video);
    var video_src = $rootScope.selectedCam.recorder_ip + "/download/" + $scope.data.recordingDetails.directory + "/Export/" + video.file_name;
    video_src = encodeURI(video_src);
    console.log(video_src);
    var url = video_src;
    // if(ionic.Platform.isAndroid()){
    // 	var targetPath = cordova.file.externalDataDirectory + video.file_name.replace(/\s+/g, '');
    // }else{
    // 	var targetPath = cordova.file.	documentsDirectory + video.file_name.replace(/\s+/g, '');
    // }
    var targetPath = cordova.file.dataDirectory + video.file_name.replace(/\s+/g, '');
    var trustHosts = true;
    var options = {};
    window.resolveLocalFileSystemURL(targetPath, function() {
      console.log("file found");
      $scope.startPlayback(targetPath);
    }, function() {
      console.log("file not found");
      $scope.data.downloadingPlayback = true;
      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function(result) {
          console.log(result);
          $scope.startPlayback(targetPath);
          $scope.data.downloadingPlayback = false;
          $scope.isDownloaded();
        }, function(err) {
          console.log(err);
          alert(JSON.stringify(err));
          $scope.data.downloadingPlayback = false;
          $scope.isDownloaded();
        }, function(progress) {
          $timeout(function() {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
            console.log($scope.downloadProgress);
          });
        });
    });
  }
  $scope.video_src = "file:///storage/emulated/0/Android/data/com.ionicframework.panofieldcontroller439292/files/FreeKick-Evt-11-Rec-Team2-Team-2016-07-13-17-46-14-646.mp4";
  $scope.startPlayback = function(targetPath) {
    $scope.showPlaybackVideoModal = true;
    //video_src = "videos/example2.mp4"
    targetPath = decodeURI(targetPath);
    console.log(targetPath);
    // $timeout(function() {
    //   $scope.video_src = "file:///storage/emulated/0/Android/data/com.ionicframework.panofieldcontroller439292/files/FreeKick-Evt-11-Rec-Team2-Team-2016-07-13-17-46-14-646.mp4";
    // });
    // flowplayer("#playbackVideoHolderPanofield", {
    //   splash: true,
    //   embed: false,
    //   ratio: 9 / 16,
    //   clip: {
    //     live: false,
    //     sources: [{
    //       type: "video/mp4",
    //       src: targetPath
    //     }]
    //   }
    //
    // });
    $scope.config = {
      preload: "auto",
      autoPlay: false,
      sources: [{
        // src: $sce.trustAsResourceUrl(targetPath),
        src: targetPath,
        type: "video/mp4"
      }],
      theme: {
        url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
      },
      plugins: {
        controls: {
          autoHide: false,
          autoHideTime: 3000
        }
      }
    };
  }
  $scope.hidePlaybackVideo = function() {
    $scope.showPlaybackVideoModal = false;
  }
  $scope.showPlaybackListModal = false;
  $scope.showPlaybackList = function() {

    $scope.getRecordingDetails();
    $scope.getExportQueue();
    $scope.showPlaybackListModal = true;
  }
  $scope.hidePlaybackList = function() {
    $scope.showPlaybackListModal = false;
  }
  $scope.showEventListModal = false;
  $scope.showEventList = function() {
    $scope.getEventList();
    $scope.getRecordingDetails();
    $scope.getExportQueue();
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
        $scope.data.setStartTime = new Date().getTime() - response.data.duration;
        console.log($scope.data);
        $scope.getTeamNames($rootScope.selectedCam.recorder_ip, $scope.data.recorder.recording_id);
        $scope.getEventList();
        $scope.getRecordingDetails();
        $scope.data.lastEvent = false;
        $scope.hideLoading();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    );
  }
  $scope.setStateOfRecorder = function(run) {

    var data = {
      "recording": run,
      "streaming": run
    }
    if (!run) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Stop Recorder',
        template: 'Are you sure you want to stop recorder?'
      });
      confirmPopup.then(function(res) {
        if (res) {
          $scope.showLoading();
          var promise = recorder.setStateOfRecorder($rootScope.selectedCam.recorder_ip, data);
          promise.then(
            function(response) {
              console.log(response);
              //$scope.data.recorder = response.data;
              $scope.getStateOfRecorder();
              $scope.hideLoading();
            },
            function(error) {
              console.log(error);
              $scope.hideLoading();
            }
          );
        } else {

        }
      });
    } else {
      $scope.showLoading();
      var promise = recorder.setStateOfRecorder($rootScope.selectedCam.recorder_ip, data);
      promise.then(
        function(response) {
          console.log(response);
          //$scope.data.recorder = response.data;
          $scope.getStateOfRecorder();
          $scope.hideLoading();
        },
        function(error) {
          console.log(error);
          $scope.hideLoading();
        }
      );
    }
  }
  $scope.getCameraProfiles = function() {
    $scope.showLoading();
    var promise = recorder.getCameraProfiles($rootScope.selectedCam.recorder_ip);
    promise.then(
      function(response) {
        $scope.data.cameraProfiles = response;
        $scope.hideLoading();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    );
  }
  $scope.getEventTypes = function() {
    console.log("Get event Types")
    $scope.showLoading();
    var promise = recorder.getEventTypes($rootScope.selectedCam.recorder_ip);
    promise.then(
      function(response) {
        $scope.data.event_types = response.data.list;
        console.log($scope.data);
        $scope.hideLoading();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    );
  }
  $scope.getEventList = function() {
    $scope.showLoading();
    $scope.team = [];
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
        console.log($rootScope.data);
        $scope.hideLoading();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    );
  }
  $scope.getTeamNames = function(ip, recording_id) {
    $scope.showLoading();
    var promise = recorder.getTeamNames(ip, recording_id);
    promise.then(
      function(response) {
        $scope.data.teams = response.data;
        console.log($scope.data);
        $scope.hideLoading();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
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
    var event_name = event.name;
    var team_name = $scope.data.teams.team[team_id - 1].name;
    $scope.showLoading();
    var promise = recorder.setEvent($rootScope.selectedCam.recorder_ip, data);
    promise.then(
      function(response) {
        console.log(response);
        var event_id = response.data.id;
        $scope.data.lastEvent = event_id;
        var recording_id = response.data.recording_id;
        var data = {
          recording_id: recording_id,
          //selections: {
          event_id: event_id,
          //},
          file_name: "" + event_name + "-Evt-" + recording_id + "-Rec-" + team_name + "-Team-" + response.data.time
        }
        var exp_promise = recorder.queueExport($rootScope.selectedCam.recorder_ip, data);
        exp_promise.then(
          function(response) {
            console.log("exported");
            console.log(response);
            $scope.getEventList();
            $scope.getRecordingDetails();
            $scope.getExportQueue();
            $scope.hideLoading();
          },
          function(error) {
            console.log(error);
            $scope.hideLoading();
          }
        )
      },
      function(error) {
        console.log(error)
      }
    );
  }
  $scope.exportSelectedEvents = function() {
    $scope.showLoading();
    var selections = [];
    angular.forEach($scope.data.exportEvent, function(value, key) {
      if (value == true) selections.push({
        event_id: key
      })
    });
    var data = {
      recording_id: $rootScope.data.recorder.recording_id,
      selections: selections
    }
    var promise = recorder.queueExport($rootScope.selectedCam.recorder_ip, data);
    promise.then(
      function(response) {
        console.log(response);
        $scope.hideLoading();
        var alertPopup = $ionicPopup.alert({
          title: 'Success',
          template: "Selected Events added for export"
        });

        alertPopup.then(function(res) {
          console.log('Ok');
        });
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    );
  }
  $scope.getRecordingDetails = function() {
    $scope.showLoading();
    var promise = recorder.getDetailsOfRecording($rootScope.selectedCam.recorder_ip, $scope.data.recorder.recording_id);
    promise.then(
      function(response) {
        $scope.data.playbackList = response.data.export;
        $scope.data.recordingDetails = response.data;
        console.log($scope.data);
        $scope.hideLoading();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    )
  }
  $scope.getExportQueue = function() {
    $scope.showLoading();
    var promise = recorder.getExportQueue($rootScope.selectedCam.recorder_ip);
    promise.then(
      function(response) {
        console.log(response);
        $scope.data.videos = response.data.export;
        $scope.hideLoading();
        $scope.isDownloaded();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    )
  }
});
