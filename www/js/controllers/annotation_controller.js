angular.module('annotationController.controller', []).controller('AnnotationControllerCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state, cameraMovement, recorderControll, $interval, $cordovaEmailComposer, $filter, $cordovaFileTransfer, $ionicSideMenuDelegate, $ionicNavBarDelegate, $interval, $sce) {
  $ionicSideMenuDelegate.canDragContent(true);



  $interval(function() {
    $scope.getRecorderCmdLabel();
    $scope.getPeriodCmdLabel();
  }, 1000);

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$scope.data.live_view) $scope.data.showNewPlaybackList = true;
    if (!$rootScope.isUser()) {
      $state.go('login')
    }

    $scope.filterEventTypes();

    if (ionic.Platform.isIOS()) {
      $scope.directory = cordova.file.documentsDirectory;
    } else {
      $scope.directory = cordova.file.dataDirectory;
    }
    $scope.getRecorderState();
    $scope.data.showPlaybackVideoModal = false;
    $scope.showPlaybackListModal = false;
    $scope.data.score1 = 0;
    $scope.data.score2 = 0;

  });

  $timeout(function() {
    $scope.getExportQueue(true);
  }, 1500)
  $interval(function() {
    if ($scope.showPlaybackListModal || $scope.data.showNewPlaybackList) $scope.getExportQueue(true);
  }, 12000);

  $scope.showRecorderButton = function() {
    var endMatch = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
      event: {
        name: "End"
      }
    }, true);
    if (endMatch.length > 0) {
      return true;
    }
    if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
      return false;
    }
    if ($scope.recorder && $scope.recorder.recording) {
      return false;
    }
    return true;
  }

  $scope.$on("$ionicView.afterEnter", function(scopes, states) {
    //console.log("loaded")
    if ($rootScope.selectedCam.cameraType == 'LiveStream' && $rootScope.data.live_view) {
      //console.log("check");
      var html = "";
      html += '<video id="my_video" class="video-js vjs-default-skin" controls preload="false" width="100%" height="100%" data-setup="{}">';
      html += '	<source src="http://' + $rootScope.selectedCam.cameraIP + '/video/live.m3u8" type="application/x-mpegURL">';
      html += '</video>';
      document.getElementById("LiveStreamVideo").innerHTML = html;
      $timeout(function() {
        var player = videojs('my_video');
        player.play();
      }, 200)

    }
  });



  /**
   * [filterEventTypes - Filters unwanted event types from recorder]
   * @return {[type]} [description]
   */
  $scope.filterEventTypes = function() {
    $scope.data.event_types = $filter("filter")($scope.data.event_types, function(evt) {
      var evtName = evt.name.toLowerCase();
      return evtName !== "goal" && evtName !== "begin" && evtName !== "end" && evtName !== "start 2nd half" && evtName !== "end 1st half" && evtName !== "start match" && evtName !== "end match"
    })
  }

  $scope.getCameraView = function() {
    if ($rootScope.selectedCam.cameraType === "Axis") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=1";
    } else if ($rootScope.selectedCam.cameraType === "Dahua") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=5&subtype=1";
    }
  }
  $scope.data.periodCmdLabel = "Start Match";
  $scope.hidePlaybackVideo = function() {
    $scope.data.showPlaybackVideoModal = false;
  }
  $scope.$on("$ionicView.enter", function(event, data) {
    //console.log($rootScope.selectedCam);
    if ($rootScope.selectedCam.recorderType !== "WithoutRecorder") {
      $scope.getCameraView();
      $scope.recorder = {};
    }
    $scope.getRecorderState();
    $scope.blinkingColor = "white";
    $interval(function() {
      if ($scope.blinkingColor === "red")
        $scope.blinkingColor = "white";
      else
        $scope.blinkingColor = "red";
    }, 600);
    $scope.showPlaybackListModal = false;
  });

  $scope.showPlaybackList = function() {
    $scope.getExportQueue();
    $scope.getRecorderState();
    $scope.showPlaybackListModal = true;
  }

  $scope.showNewPBList = function() {
    $scope.getExportQueue();
    $scope.getRecorderState();
    $scope.data.showNewPlaybackList = true;
  }

  $scope.hidePlaybackList = function() {
    $scope.showPlaybackListModal = false;
  }

  $scope.showShareList = function() {
    $scope.getExportQueue();
    $scope.getRecorderState();
    $scope.showShareListModal = true;
  }

  $scope.hideShareList = function() {
    $scope.showShareListModal = false;
  }

  $scope.getTeamScores = function() {
    ////console.log($rootScope.data.recordings[localStorage.lastRecordedVideo]);
    if ($rootScope.data.recordings[localStorage.lastRecordedVideo] !== undefined && $scope.recorder && $scope.recorder.recording) {
      $scope.data.score1 = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, function(value) {
        if (value.team !== undefined) {
          return value.team.id === 1 && value.event.name === 'Goal';
        } else {
          return false
        }
      }).length;
      $scope.data.score2 = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, function(value) {
        if (value.team !== undefined) {
          return value.team.id === 2 && value.event.name === 'Goal';
        } else {
          return false;
        }
      }).length;
    } else {
      $scope.data.score1 = 0;
      $scope.data.score2 = 0;
    }
  }
  $scope.getTeamScores();

  $scope.shareVideo = function(video) {
    ////console.log(video);
    ////console.log($scope.recorder);
    var data = {
      recording_id: $scope.recorder.recording_id,
      event_id: video.event_details.id,
      service: "Facebook",
      privacy: $rootScope.data.facebook_share,
      upload: true
    }
    $scope.showLoading();
    var exp_promise = recorderControll.queueExport($rootScope.selectedCam, data);

    exp_promise.then(function(response) {
      ////console.log(response)
      $scope.hideLoading();
      var alertPopup = $ionicPopup.alert({
        title: 'Success!',
        template: 'Video shared successfuly'
      });

      alertPopup.then(function(res) {
        //console.log('Thank you for not eating my delicious ice cream cone');
      });
    }, function(error) {
      alert(error.data.error);
      $scope.hideLoading();
    })
  }

  $scope.ptzMove = function(direction, command) {
    var promise = cameraMovement.move(direction, command, $rootScope.selectedCam);
    promise.then(function(response) {
      //console.log(response);
    }, function(error) {
      //console.log(error);
    })
  }

  $scope.ptzZoom = function(direction, command) {
    var promise = cameraMovement.zoom(direction, command, $rootScope.selectedCam);
    promise.then(function(response) {
      //console.log(response);
    }, function(error) {
      //console.log(error);
    })
  }

  $scope.gotoPreset = function(index, command) {
    var promise = cameraMovement.preset(index, $rootScope.selectedCam);
    promise.then(function(response) {
      //console.log(response);
    }, function(error) {
      //console.log(error);
    })
  }


  $scope.getRecorderState = function() {
    $scope.getCameraView();
    if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
      $rootScope.recorder = $scope.recorder;
      return false;
    }
    var promise = recorderControll.getRecorderState($rootScope.selectedCam);
    promise.then(function(response) {
      if ($rootScope.selectedCam.recorderType === "vMix") {
        var xml = $.parseXML(response.data);
        $xml = $(xml);
        $scope.recorder.recording = $scope.stringToBool($xml.find("recording").text());
        $scope.recorder.streaming = $scope.stringToBool($xml.find("streaming").text());
        $scope.recorder.duration = $xml.find("recording").attr("duration");
        $scope.recorder.time = new Date().getTime() - ($scope.recorder.duration * 1000);
      } else if ($rootScope.selectedCam.recorderType === "Panofield") {
        //console.log(response.data);
        $scope.recorder.recording = response.data.recording;
        $scope.recorder.streaming = response.data.streaming;
        $scope.recorder.duration = response.data.duration;
        $scope.recorder.time = new Date().getTime() - ($scope.recorder.duration);
        $scope.recorder.recording_id = response.data.recording_id;
        $scope.recorder.start = new Date(response.data.start);

        var promise = recorderControll.setTeamName($rootScope.data.team1, $rootScope.selectedCam);
        promise.then(function(response) {
          //console.log(response);
        }, function(error) {
          //console.log(error);
        })
        var promise = recorderControll.setTeamName($rootScope.data.team2, $rootScope.selectedCam);
        promise.then(function(response) {
          //console.log(response);
        }, function(error) {
          //console.log(error);
        });
        $scope.getRecordingDetails();
        $scope.getRecorderCmdLabel();
        $rootScope.recorder = $scope.recorder;
      }
      $scope.getPeriodCmdLabel();
      if ($scope.recorder.recording) {
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        $scope.data.currentProject.recording_id = response.data.recording_id;
      }
      //console.log($scope.recorder);
    }, function(error) {
      //console.log(error);
      if (error.status === -1) {
        alert("Recorder not available");
      }
    })
  }

  /**
   * [toggleRecorder description]
   * @return {[type]} [description]
   */
  $scope.toggleRecorder = function() {

    if (!$scope.recorder.recording) {
      $scope.startRecorder();
    } else {
      $scope.stopRecorder();
    }
    $scope.getPeriodCmdLabel();
    $scope.getRecorderCmdLabel();
  }

  $scope.toggleMatchPeriod = function() {
    if ($scope.recorder === undefined || !$scope.recorder.recording) {
      $scope.startRecorder(true);
			return false;
    }

    if ($rootScope.data.recordings[localStorage.lastRecordedVideo] === undefined) {
      var date = $filter("date")(new Date($scope.recorder.time), "dd MMMM yyyy - hh-mm a");
      var filename = "capture - " + date;
      localStorage.lastRecordedVideo = filename;
      $rootScope.data.recordings[filename] = {
        annotations: [],
        recording_id: $scope.recorder.recording_id,
        period: 1,
        team1: JSON.parse(localStorage.team1),
        team2: JSON.parse(localStorage.team2)
      }
      $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
      ////console.log($rootScope.data.recordings)
      localStorage.recordings = JSON.stringify($rootScope.data.recordings);
    }
    var firstHalfEnd = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
      event: {
        name: "End 1st Half"
      }
    }, true);
    var secondHalfStart = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
      event: {
        name: "Start 2nd Half"
      }
    }, true);
    var endMatch = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
      event: {
        name: "End"
      }
    }, true);
    if (!$scope.checkEvent("Begin")) {
      var annotation = {
        event: {
          name: "Begin",
          start: $scope.timerCurrentTime,
          end: $scope.timerCurrentTime,
          time_after: $scope.timerCurrentTime,
          duration_after: $scope.timerCurrentTime * 2
        },
        camera: $rootScope.selectedCam,
      }
      //console.log(annotation);
      if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
        $rootScope.data.recordings = JSON.parse(localStorage.recordings);
        annotation.id = $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.length + 1;
        //console.log($rootScope.data.recordings)
        $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      } else {
        var promise = recorderControll.addEvent(annotation, $rootScope.selectedCam);
        promise.then(function(response) {
          annotation.id = response.data.id
          $rootScope.data.recordings = JSON.parse(localStorage.recordings)
          //console.log($rootScope.data.recordings)
          $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
          $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);
        }, function(error) {
          alert(error.data.error);
        })
      }
    } else if (firstHalfEnd.length <= 0) {
      var annotation = {
        event: {
          name: "End 1st Half",
          start: $scope.timerCurrentTime,
          end: $scope.timerCurrentTime,
          time_after: $scope.timerCurrentTime,
          duration_after: $scope.timerCurrentTime * 2
        },
        camera: $rootScope.selectedCam,
      }
      //console.log(annotation);
      document.getElementById("match-timer").stop();
      if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
        $rootScope.data.recordings = JSON.parse(localStorage.recordings);
        annotation.id = $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.length + 1;
        //console.log($rootScope.data.recordings)
        $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      } else {
        var promise = recorderControll.addEvent(annotation, $rootScope.selectedCam);
        promise.then(function(response) {
          //console.log(response);
          annotation.id = response.data.id
          $rootScope.data.recordings = JSON.parse(localStorage.recordings)
          //console.log($rootScope.data.recordings)
          $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
          $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);
        }, function(error) {
          alert(error.data.error);
        })
      }
    } else if (secondHalfStart.length <= 0) {
      var annotation = {
        event: {
          name: "Start 2nd Half",
          start: $scope.timerCurrentTime,
          end: $scope.timerCurrentTime,
          time_after: $scope.timerCurrentTime,
          duration_after: $scope.timerCurrentTime * 2
        },
        camera: $rootScope.selectedCam,
      }
      //console.log(annotation);
      document.getElementById("match-timer").start();
      if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
        $rootScope.data.recordings = JSON.parse(localStorage.recordings);
        annotation.id = $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.length + 1;
        //console.log($rootScope.data.recordings)
        $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      } else {
        var promise = recorderControll.addEvent(annotation, $rootScope.selectedCam);
        promise.then(function(response) {
          //console.log(response);
          annotation.id = response.data.id
          $rootScope.data.recordings = JSON.parse(localStorage.recordings)
          //console.log($rootScope.data.recordings)
          $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
          $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);
        }, function(error) {
          alert(error.data.error);
        })
      }
    } else if (endMatch.length <= 0) {
      var annotation = {
        event: {
          name: "End",
          start: $scope.timerCurrentTime,
          end: $scope.timerCurrentTime,
          time_after: $scope.timerCurrentTime,
          duration_after: $scope.timerCurrentTime * 2
        },
        camera: $rootScope.selectedCam,
      }
      //console.log(annotation);
      if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
        $rootScope.data.recordings = JSON.parse(localStorage.recordings);
        annotation.id = $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.length + 1;
        //console.log($rootScope.data.recordings)
        $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
        $scope.showStopRecorderPrompt();
      } else {
        var promise = recorderControll.addEvent(annotation, $rootScope.selectedCam);
        promise.then(function(response) {
          //console.log(response);
          annotation.id = response.data.id
          $rootScope.data.recordings = JSON.parse(localStorage.recordings)
          //console.log($rootScope.data.recordings);
          $scope.showStopRecorderPrompt();
          $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
          $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);
        }, function(error) {
          alert(error.data.error);
        })
      }

    } else {
      $scope.stopRecorder();
    }
    $scope.getRecorderCmdLabel();
    $scope.getPeriodCmdLabel();
  }


  $scope.showStopRecorderPrompt = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Match Finished',
      template: 'Do you want to stop recorder?'
    });

    confirmPopup.then(function(res) {
      if (res) {
        $scope.stopRecorder();
      } else {
        //console.log("Continue")
      }
    });
  };


  $scope.getRecorderCmdLabel = function() {
    $timeout(function() {
      if ($scope.recorder !== undefined && $scope.recorder.recording) {
        $scope.data.recorderCmdLabel = "Stop recorder";
      } else {
        $scope.data.recorderCmdLabel = "Start recorder";
      }
    });

  }
  $scope.getRecorderCmdLabel();

  $scope.getPeriodCmdLabel = function() {
    $timeout(function() {
      $rootScope.data.recordings = JSON.parse(localStorage.recordings);
      var startMatch = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
        event: {
          name: "Begin"
        }
      }, true);
      var firstHalfEnd = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
        event: {
          name: "End 1st Half"
        }
      }, true);
      var secondHalfStart = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
        event: {
          name: "Start 2nd Half"
        }
      }, true);
      var endMatch = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
        event: {
          name: "End"
        }
      }, true);

      if ($scope.recorder !== undefined && !$scope.recorder.recording) {
        $scope.data.periodCmdLabel = "Start Match";
      } else if (startMatch.length <= 0) {
        $scope.data.periodCmdLabel = "Start Match";
      } else if (firstHalfEnd.length <= 0) {
        $scope.data.periodCmdLabel = "End 1st Half";
      } else if (secondHalfStart.length <= 0) {
        $scope.data.periodCmdLabel = "Start 2nd Half";
      } else if (endMatch.length <= 0) {
        $scope.data.periodCmdLabel = "End Match";
      } else {
        $scope.data.periodCmdLabel = "Game Finished";
      }
    }, 100)
  }

  $scope.startRecorder = function(startMatch) {
    if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
      var date = $filter("date")(new Date(), "dd MMMM yyyy - hh-mm a");
      var filename = "capture - " + date;
      if ($rootScope.data.recordings[filename] === undefined) {
        //console.log("NEW RECORDING");

        localStorage.lastRecordedVideo = filename;
        //console.log(date);
        $rootScope.data.recordings[filename] = {
          annotations: [],
          recording_id: "WithoutRecorder",
          period: 1,
          team1: JSON.parse(localStorage.team1),
          team2: JSON.parse(localStorage.team2)
        }

        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        //console.log($rootScope.data.recordings)
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      }
      if (!$scope.recorder) $scope.recorder = {};
      $scope.recorder.recording = true;
      $scope.recorder.time = new Date().getTime();
      return false;
    }
    $scope.showLoading();
    var promise = recorderControll.startRecorder($rootScope.selectedCam);
    promise.then(function(response) {
      //console.log(response);
      if (response.data.result === false) {
        alert(response.data.error);
        $scope.hideLoading();
        return false;
      }

      $scope.recorderCheck = $interval(function() {
        console.log("Checking recorder state");
        if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
          $rootScope.recorder = $scope.recorder;
          return false;
        }
        var promise = recorderControll.getRecorderState($rootScope.selectedCam);
				var requestTimeStart = Date.now();
        promise.then(function(response) {
					console.log(Date.now() - requestTimeStart);
          if ($rootScope.selectedCam.recorderType === "Panofield") {
            $scope.recorder.recording = response.data.recording;
            if (!$scope.recorder.recording) {
              alert("TagApp detected that recorder has stopped!");
              $interval.cancel($scope.recorderCheck);
              $scope.startRecorder();
            }
          }
        }, function(err) {
          alert(error.data.error);
        });
      }, 5000);
      $timeout(function() {
        var date = $filter("date")(new Date(), "dd MMMM yyyy - hh-mm a");
        var filename = "capture - " + date;
        if ($rootScope.data.recordings[filename] === undefined) {
          //console.log("NEW RECORDING");

          localStorage.lastRecordedVideo = filename;
          //console.log(date);
          //console.log($scope.recorder);
          $rootScope.data.recordings[filename] = {
            annotations: [],
            recording_id: $scope.recorder.recording_id,
            period: 1,
            team1: JSON.parse(localStorage.team1),
            team2: JSON.parse(localStorage.team2)
          }

          $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
          //console.log($rootScope.data.recordings)
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);


        }
				$timeout(function(){
					if(startMatch) $scope.toggleMatchPeriod(startMatch);
				},1000)
        //console.log($rootScope.data.recordings);
        $scope.getRecorderState();
        $scope.hideLoading();
        $scope.getTeamScores();
      }, 1000);


    }, function(error) {
      $scope.hideLoading();
      //console.log(error);
      if (error.status === -1) {
        alert("Connection with recorder not possible!");
      } else {
        alert(error.data.error)
      }
    })
  }

  $scope.stopRecorder = function() {
    if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
      $scope.recorder.recording = false;
      $scope.sendRecordingXML();
      return false;
    }
    $scope.showLoading();
    $interval.cancel($scope.recorderCheck);
    var promise = recorderControll.stopRecorder($rootScope.selectedCam);
    promise.then(function(response) {
      //console.log(response);
      $timeout(function() {
        $scope.getRecorderState();
        $scope.sendRecordingXML();
        $scope.hideLoading();
        $scope.getTeamScores();
      }, 1000);
    }, function(error) {
      //console.log(error);
    })
  }

  $scope.$on('timer-tick', function(event, args) {
    $scope.timerCurrentTime = args.millis;
  });

  $scope.goal = function(team, team_id) {
    var event = {
      generate_playback_video: true,
      icon: "ion-ios-football",
      name: "Goal",
      start_counter: false,
      time_after: 10,
      time_before: 10
    }
    $scope.addEvent(event, team, team_id);
  }
  $scope.addEvent = function(event, team, team_id) {
    //console.log(event);
    team.team_id = team_id;
    if (!$scope.recorder.recording) return false;
    $scope.selection = {};
    //console.log($scope.recorder);
    //console.log($rootScope.data);
    $rootScope.data.recordings = JSON.parse(localStorage.recordings);
    event.currentDate = new Date();
    event.duration_before = $scope.timerCurrentTime - (event.time_after * 1000);
    event.duration_after = $scope.timerCurrentTime + (event.time_after * 1000);
    if ($rootScope.data.player_picker) {
      $scope.selectPlayer(event, team);
    } else {
      $scope.addEventToList(event, team, null);
    }
    if(event.name === "Goal"){
         $scope.getTeamScores();
    }
  }

  $scope.selectPlayer = function(event, team) {
    var html = "";
    $scope.selectedEvent = event;
    $scope.teamSelected = team;
    html += '<ion-list>';
    //console.log(team);
    angular.forEach(team.players, function(player) {
      html += ' <ion-radio ng-model="selection.player" ng-click="playerSelected(selection, teamSelected, selectedEvent)" ng-value="' + player.id + '">#' + player.number + ' - ' + player.name + '</ion-radio>';
    })
    html += '</ion-list>'
    $scope.myPopup = $ionicPopup.show({
      template: html,
      title: 'Select player',
      subTitle: 'Not required',
      scope: $scope,
      buttons: [{
        text: '<b>Continue</b>',
        type: 'button-positive',
        onTap: function(e) {
          return $scope.selection;
        }
      }]
    });
    $scope.myPopup.then(function(res) {
      //console.log(res);
      var player = null;
      if (res === undefined) return false;
      if (res.player !== undefined) {
        var player = $filter("filter")(team.players, {
          id: res.player
        })[0];
      }
      $scope.addEventToList(event, team, player);

    })
  };

  $scope.playerSelected = function(res, team, event) {
    var player = null;
    if (res.player !== undefined) {
      var player = $filter("filter")(team.players, {
        id: res.player
      })[0];
    }
    $scope.addEventToList(event, team, player);
    var popup = $scope.myPopup;
    popup.close();
  }

  $scope.addEventToList = function(event, team, player) {
		console.log("ADD EVENT");
    $rootScope.data.recordings = JSON.parse(localStorage.recordings);
    //console.log($rootScope.data.recordings)
    //console.log($rootScope.data.recordings[localStorage.lastRecordedVideo]);

    if (localStorage.lastRecordedVideo === undefined || localStorage.lastRecordedVideo === "" || $rootScope.data.recordings[localStorage.lastRecordedVideo] === undefined) {
      var date = $filter("date")(new Date($scope.recorder.time), "dd MMMM yyyy - hh-mm a");
      var filename = "capture - " + date;
      localStorage.lastRecordedVideo = filename;
      $rootScope.data.recordings[filename] = {
        annotations: [],
        recording_id: $scope.recorder.recording_id,
        period: 1,
        team1: JSON.parse(localStorage.team1),
        team2: JSON.parse(localStorage.team2)
      }
      $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
      //console.log($rootScope.data.recordings)
      localStorage.recordings = JSON.stringify($rootScope.data.recordings);
    }
    $scope.data.currentProject.recording_id = $scope.recorder.recording_id;
    $rootScope.data.recordings[localStorage.lastRecordedVideo].recording_id = $scope.recorder.recording_id;
    localStorage.recordings = JSON.stringify($rootScope.data.recordings);
    if ($rootScope.selectedCam.recorderType === "vMix") {
      var annotation = {
        team: team,
        player: player,
        start: parseInt($scope.recorder.duration) - parseInt($rootScope.data.event_before),
        end: parseInt($scope.recorder.duration) + parseInt($rootScope.data.event_after),
        event: event,
        camera: $rootScope.selectedCam
      }
      $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
      localStorage.recordings = JSON.stringify($rootScope.data.recordings);
    } else if ($rootScope.selectedCam.recorderType === "Panofield" || $rootScope.selectedCam.recorderType === "WithoutRecorder") {

      //console.log($scope.recorder);
      var annotation = {
        team: team,
        player: player,
        start: new Date().getTime() - (parseInt(event.time_before) * 1000),
        end: new Date().getTime() + (parseInt(event.time_after) * 1000),
        timer_time: $scope.timerCurrentTime,
        event: event,
        camera: $rootScope.selectedCam,
      }
      //console.log("Annotation: ", annotation);
      if ($rootScope.selectedCam.recorderType === "WithoutRecorder") {
        $rootScope.data.recordings = JSON.parse(localStorage.recordings);
        $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      } else {
        $scope.showLoading();
        var promise = recorderControll.addEvent(annotation, $rootScope.selectedCam);
				//console.log(annotation);
        promise.then(function(response) {
          //console.log(response);
          annotation.id = response.data.id
          var event_id = response.data.id;
          $scope.data.lastEvent = event_id;
          var recording_id = response.data.recording_id;
          var data = {
            recording_id: recording_id,
            event_id: event_id,
            file_name: "" + event.name + "-Evt-" + recording_id + "-Rec-" + team.name + "-Team-" + response.data.time
          }
          var event_time = response.data.time;
          var exp_promise = recorderControll.queueExport($rootScope.selectedCam, data);
          exp_promise.then(function(response) {
            annotation.file_name = data.file_name;
            $rootScope.data.recordings = JSON.parse(localStorage.recordings)
            //console.log($rootScope.data.recordings)
            $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
            $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
            localStorage.recordings = JSON.stringify($rootScope.data.recordings);
            $scope.hideLoading();
            $scope.getTeamScores();
            $scope.getExportQueue(true);
						console.log($scope.data.currentProject.annotations);
          }, function(error) {
            //console.log(error);
            if (error.data)
              alert(error.data.error);
            $scope.hideLoading();
          })
        }, function(error) {
          //console.log(error)
          $scope.hideLoading();
          alert(error.data.error)
        });
      }
    }
  }
  $scope.calculateHeight = function() {
    return $(".view-container").height() - $(".header-buttons").height() + 150 + "px";
  }
  $scope.calculateBottomHeight = function() {
    return window.innerHeight - $("#scrollableContent").position().top - 10;
  }
  $scope.event_type_rows = function() {
    ////console.log($scope.data.event_types);
    var n = Math.round(($scope.data.event_types.length - 3) / 2);

    if (!$rootScope.data.one_team_view) {
      n = n / 2;
    }
    ////console.log(n)
    return new Array(n * 2)
  }

  $scope.redoLast = function(array) {
		console.log($scope.data.currentProject.annotations);
    if ($scope.data.currentProject.annotations[$scope.data.currentProject.annotations.length - 1] !== $scope.deleted_event) {
      // array.push($scope.deleted_event);
      // $scope.data.currentProject.annotations = array;
      // localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      // $scope.getTeamScores();
			$scope.deleted_event.event.begin = 	$scope.deleted_event.start;
			$scope.deleted_event.event.end = 	$scope.deleted_event.end;
			$scope.addEventToList($scope.deleted_event.event, $scope.deleted_event.team, $scope.deleted_event.player);
    }
  }

  $scope.undoLast = function(array, index) {
    var deleted_event = array.splice(index, 1)[0];
    $scope.deleted_event = deleted_event;
    $scope.data.currentProject.annotations = array;
		$rootScope.data.recordings[localStorage.lastRecordedVideo].annotations = array;
    localStorage.recordings = JSON.stringify($rootScope.data.recordings);
    $scope.getTeamScores();
    //console.log(deleted_event);
    if ($rootScope.selectedCam.recorderType !== "WithoutRecorder") {
      var promise = recorderControll.deleteEvent(deleted_event, $rootScope.selectedCam);
      promise.then(function(result) {
        console.log("event deleted", result)
      }, function(error) {
        console.log(error);
      })
    }
  }
  $scope.removeEvent = function(array, index) {
    //console.log(array.length);
    //console.log(index);
    index++;
    var deleted_event = array.splice(array.length - index, 1)[0];
    $scope.data.currentProject.annotations = array;
    localStorage.recordings = JSON.stringify($rootScope.data.recordings);
    $scope.getTeamScores();
    //console.log(deleted_event);
    if ($rootScope.selectedCam.recorderType !== "WithoutRecorder") {
      var promise = recorderControll.deleteEvent(deleted_event, $rootScope.selectedCam);
      promise.then(function(result) {
        //console.log("event deleted", result)
      }, function(error) {
        //console.log(error);
      })
    }
  }

  $scope.sendRecordingXML = function() {
    //console.log($rootScope.data);
    if (!$rootScope.data.send_xml) {
      return false;
    }
    //console.log("Send XML");
    var annotations = $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations;
    if (annotations.length === 0) return false;
    var camera = annotations[0].camera;
    var xml = '<?xml version="1.0"?>';
    xml += '<recording>';
    xml += "	<id>" + $scope.recorder.recording_id + "</id>";
    xml += "	<camera type='" + camera.cameraType + "' ip='" + camera.cameraIP + "'></camera>";
    xml += "	<recorder type='" + camera.recorderType + "' ip='" + camera.recorderIP + "'></recorder>";
    xml += "	<annotations>";
    angular.forEach(annotations, function(a, index) {
      xml += "<annotation>";
      xml += "	<id>" + a.id + "</id>"
      xml += "	<name>" + a.event.name + "</name>";
      if (a.team !== undefined)
        xml += "	<team>" + a.team.name + "</team>";
      if (isNaN(parseInt(a.event.duration_before / 1000))) {
        //console.log("timer time: " + a.timer_time);
        xml += "	<start>" + parseInt(a.timer_time / 1000) + "</start>";
        xml += "	<end>" + parseInt(a.timer_time / 1000) + "</end>"
      } else {
        xml += "	<start>" + parseInt(a.event.duration_before / 1000) + "</start>";
        xml += "	<end>" + parseInt(a.event.duration_after / 1000) + "</end>";
      }
      if (a.player !== null && a.player !== undefined) {
        xml += "  <player number='" + a.player.number + "'>" + a.player.name + "</player>";
      }
      xml += "</annotation>";
    });
    xml += "	</annotations>";
    xml += '</recording>';
    console.log(xml);
    //return false;
    var filename = localStorage.lastRecordedVideo.replace(/\s+/g, '') + ".xml";

    $cordovaEmailComposer.isAvailable().then(function() {
      var email = {
        to: $rootScope.data.email_to,
        cc: '',
        bcc: [],
        attachments: "base64:" + filename + "//" + btoa(xml),
        subject: $rootScope.data.email_subject,
        body: xml,
        isHtml: false
      };
      //console.log(email)
      $cordovaEmailComposer.open(email).then(null, function() {
        //console.log("email client closed");
      });
    }, function() {
      alert("Email service not available")
    });
  }
  $scope.stringToBool = function(value) {
    if (value.toLowerCase() === "true") return true;
    return false
  }

  $scope.getExportQueue = function(hideLoader) {
    if (!hideLoader)
      $scope.showLoading();
    var promise = recorderControll.getExportQueue($rootScope.selectedCam);
    promise.then(
      function(response) {
        //console.log(response);
        //$scope.data.videos = response.data.export;
        var videos = []
        angular.forEach(response.data.export, function(video) {
          var evtSplit = video.file_name.split("Evt-");
          if (evtSplit[1] !== undefined) {
            var recID = evtSplit[1].split("-Rec")[0];
            if (recID !== undefined && recID !== null) {
              if (parseInt(recID) === $scope.recorder.recording_id) {
                var eventDetails = $filter("filter")($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
                  file_name: video.file_name.split(".")[0]
                })[0];
                video.event_details = eventDetails;
                videos.push(video);
              }
            }
          }
        });
        $scope.data.videos = videos;
        //console.log(videos);
        $scope.hideLoading();
        $scope.isDownloaded();
      },
      function(error) {
        //console.log(error);
        $scope.hideLoading();
      }
    )
  }


  $scope.isDownloaded = function() {

    $scope.fileExists = [];
    //console.log($scope.data.videos.length);
    for (i = 0; i < $scope.data.videos.length; i++) {
      var video = $scope.data.videos[i];
      var targetPath = $scope.directory + video.file_name.replace(/\s+/g, '');
      window.resolveLocalFileSystemURL(targetPath, function() {
        $timeout(function() {
          //console.log("File Found");
          $scope.fileExists.unshift(true);
          //console.log($scope.fileExists);
        })
      }, function() {
        $timeout(function() {
          $scope.fileExists.unshift(false);
          //console.log("File Not Found");
          //console.log($scope.fileExists);
        })
      });
    }
    return false;
  }
  $scope.startPlayback = function(targetPath, skipDecode) {
    //console.log("show playback video")

    $timeout(function() {
      $scope.data.showPlaybackVideoModal = true;
      if (!skipDecode)
        targetPath = decodeURI(targetPath);
      //console.log(targetPath);
      $scope.targetPath = targetPath;

      $timeout(function() {
        //targetPath = "1.mp4";
        document.getElementById("playbackVideoPlayer").innerHTML = "";
        document.getElementById("playbackVideoPlayer").innerHTML = "<video id='videoPlayerContainer' width='100%' height='auto' controls autoplay src='" + targetPath + "'>Your browser does not support video</video>";
        document.getElementById("videoPlayerContainer").load();
      }, 2000);
    })


  }

  $scope.showPlaybackVideo = function(video) {
    ////console.log(video);
    var video_src = "http://" + $rootScope.selectedCam.recorderIP + "/download/" + $scope.recorder.recordingDetails.directory + "/Export/" + video.file_name;
    video_src = encodeURI(video_src);
    //console.log(video_src)
      ////console.log(video_src);
    var url = video_src;

    var targetPath = $scope.directory + video.file_name.replace(/\s+/g, '');
    ////console.log(targetPath)
    var trustHosts = true;
    var options = {
      "headers": {
        'Authorization': 'Basic ' + btoa($rootScope.selectedCam.username + ':' + $rootScope.selectedCam.password)
      }
    };
    window.resolveLocalFileSystemURL(targetPath, function() {
      ////console.log("file found");
      $scope.startPlayback(targetPath);
    }, function() {
      ////console.log("file not found");
      $scope.data.downloadingPlayback = true;
      ////console.log(url);
      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function(result) {
          ////console.log(result);
          $scope.startPlayback(targetPath);
          $timeout(function() {
            $scope.data.downloadingPlayback = false;
          });
          $scope.isDownloaded();
        }, function(err) {
          ////console.log(err);
          alert(JSON.stringify(err));
          $timeout(function() {
            $scope.data.downloadingPlayback = false;
          });
          $scope.isDownloaded();
        }, function(progress) {
          $timeout(function() {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
            ////console.log($scope.downloadProgress);
          });
        });
    });
  }

  $scope.playPlaybackVideo = function(video) {
    var video_src = encodeURI("http://" + $rootScope.selectedCam.recorderIP + "/download/" + $scope.recorder.recordingDetails.directory + "/Export/" + video.file_name);
    //console.log(video_src);
    $scope.startPlayback(video_src, true);
  }

  $scope.getRecordingDetails = function() {
    $scope.showLoading();
    var promise = recorderControll.getDetailsOfRecording($rootScope.selectedCam, $scope.recorder.recording_id);
    promise.then(
      function(response) {
        $scope.data.playbackList = response.data.export;
        $scope.recorder.recordingDetails = response.data;
        $scope.hideLoading();
        $scope.data.currentProject.recordingDetails = response.data;
        $rootScope.data.recordings[localStorage.lastRecordedVideo].recordingDetails = response.data;
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      },
      function(error) {
        //console.log(error);
        $scope.hideLoading();
      }
    )
  }

  var errorHandler = function(fileName, e) {
    var msg = '';

    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'Storage quota exceeded';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'File not found';
        break;
      case FileError.SECURITY_ERR:
        msg = 'Security error';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'Invalid modification';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'Invalid state';
        break;
      default:
        msg = 'Unknown error';
        break;
    };

    //console.log('Error (' + fileName + '): ' + msg);
  }


  $scope.calculateMatchTime = function() {
    if ($scope.checkEvent("Begin") && !$scope.checkEvent("End")) {
      var evt = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
        event: {
          name: "Begin"
        }
      }, true);
      var evt1st = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
        event: {
          name: "End 1st Half"
        }
      }, true);
      var evt2nd = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
        event: {
          name: "Start 2nd Half"
        }
      }, true);

      if (!$scope.checkEvent("Start 2nd Half")) {
        return $scope.recorder.time + evt[0].event.start;
      } else {
        return $scope.recorder.time + evt2nd[0].event.start - evt1st[0].event.start;
      }
    }
    return $scope.recorder.time;
  }



  $scope.checkIfMatchStarted = function() {
    if ($scope.checkEvent("Begin") && !$scope.checkEvent("End")) {
      return true;
    } else {
      return false;
    }
  }

  $scope.checkEvent = function(name) {
    var evt = $filter('filter')($rootScope.data.recordings[localStorage.lastRecordedVideo].annotations, {
      event: {
        name: name
      }
    }, true);

    if (evt.length > 0) {
      return true;
    } else {
      return false;
    }
  }
});
