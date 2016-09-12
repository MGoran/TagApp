angular.module('annotationController.controller', []).controller('AnnotationControllerCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state, cameraMovement, recorderControll, $interval, $cordovaEmailComposer, $filter, $cordovaFileTransfer) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
    if (ionic.Platform.isIOS()) {
      $scope.directory = cordova.file.documentsDirectory;
    } else {
      $scope.directory = cordova.file.dataDirectory;
    }
    console.log($scope.directory);
  });
  $scope.getCameraView = function() {
    if ($rootScope.selectedCam.cameraType === "Axis") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=1";
    } else if ($rootScope.selectedCam.cameraType === "Dahua") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=5&subtype=1";
    }
  }
  $scope.hidePlaybackVideo = function() {
    $scope.showPlaybackVideoModal = false;
  }
  $scope.$on("$ionicView.enter", function(event, data) {
    console.log($rootScope.selectedCam);
    $scope.getCameraView();
    $scope.recorder = {};
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
  $scope.hidePlaybackList = function() {
    $scope.showPlaybackListModal = false;
  }
  $scope.ptzMove = function(direction, command) {
    var promise = cameraMovement.move(direction, command, $rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.ptzZoom = function(direction, command) {
    var promise = cameraMovement.zoom(direction, command, $rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.gotoPreset = function(index, command) {
    var promise = cameraMovement.preset(index, $rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    })
  }


  $scope.getRecorderState = function() {
    $scope.getCameraView();
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
        console.log(response);
        $scope.recorder.recording = response.data.recording;
        $scope.recorder.streaming = response.data.streaming;
        $scope.recorder.duration = response.data.duration;
        $scope.recorder.time = new Date().getTime() - ($scope.recorder.duration);
        $scope.recorder.recording_id = response.data.recording_id;
        $scope.recorder.start = new Date(response.data.start);
        var promise = recorderControll.setTeamName($rootScope.data.team1, $rootScope.selectedCam);
        promise.then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        })
        var promise = recorderControll.setTeamName($rootScope.data.team2, $rootScope.selectedCam);
        promise.then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
        $scope.getRecordingDetails();
      }
      if ($scope.recorder.recording) {
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
      }
      console.log($scope.recorder);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.startRecorder = function() {
    $scope.showLoading();
    var promise = recorderControll.startRecorder($rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
      $timeout(function() {
        var date = $filter("date")(new Date(), "dd MMMM yyyy - hh-mm a");
        var filename = "capture - " + date;
        if ($rootScope.data.recordings[filename] === undefined) {
          console.log("NEW RECORDING");
          localStorage.lastRecordedVideo = filename;
          console.log(date);
          $rootScope.data.recordings["capture - " + date] = {
            annotations: [],
            recording_id: response.data.recording_id
          }
          $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
          console.log($rootScope.data.recordings)
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);
        }
        console.log($rootScope.data.recordings);
        $scope.getRecorderState();
        $scope.hideLoading();
      }, 1000);

    }, function(error) {
      $scope.hideLoading();
      console.log(error);
      if (error.status === -1) {
        alert("Connection with recorder not possible!");
      }
    })
  }

  $scope.stopRecorder = function() {
    var promise = recorderControll.stopRecorder($rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
      $timeout(function() {
        $scope.getRecorderState();
        $scope.sendRecordingXML();
      }, 1000);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.$on('timer-tick', function(event, args) {

    $scope.timerCurrentTime = args.millis;
  });

  $scope.addEvent = function(event, team, team_id) {
    team.team_id = team_id;
    if (!$scope.recorder.recording) return false;
    $scope.selection = {};
    console.log($scope.recorder);
    console.log($rootScope.data);
    $rootScope.data.recordings = JSON.parse(localStorage.recordings);
    event.currentDate = new Date();
    event.duration_before = $scope.timerCurrentTime - (event.time_after * 1000);
    event.duration_after = $scope.timerCurrentTime + (event.time_after * 1000);
    if ($rootScope.data.player_picker) {
      $scope.selectPlayer(event, team);
    } else {
      $scope.addEventToList(event, team, null);
    }
  }

  $scope.selectPlayer = function(event, team) {
    var html = "";
    html += '<ion-list>';
    console.log(team);
    angular.forEach(team.players, function(player) {
      html += ' <ion-radio ng-model="selection.player" ng-value="' + player.id + '">#' + player.number + ' - ' + player.name + '</ion-radio>';
    })
    html += '</ion-list>'
    var myPopup = $ionicPopup.show({
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
    myPopup.then(function(res) {
      console.log(res);
      var player = null;
      if (res.player !== undefined) {
        var player = $filter("filter")(team.players, {
          id: res.player
        })[0];
      }
      $scope.addEventToList(event, team, player);

    })
  };

  $scope.addEventToList = function(event, team, player) {
    $rootScope.data.recordings = JSON.parse(localStorage.recordings);
    console.log($rootScope.data.recordings)
    console.log($rootScope.data.recordings[localStorage.lastRecordedVideo]);
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
    } else if ($rootScope.selectedCam.recorderType === "Panofield") {
      $scope.showLoading();
      var annotation = {
        team: team,
        player: player,
        start: new Date().getTime() - (parseInt(event.time_before) * 1000),
        end: new Date().getTime() + (parseInt(event.time_after) * 1000),
        event: event,
        camera: $rootScope.selectedCam,
      }
      console.log(annotation);
      var promise = recorderControll.addEvent(annotation, $rootScope.selectedCam);
      promise.then(function(response) {
        console.log(response);
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
          console.log($rootScope.data.recordings)
          $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
          $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);
          $scope.hideLoading();
        }, function(error) {

        })
      }, function(error) {
        console.log(error)
      });
    }
  }

  $scope.removeEvent = function(array, index) {
    console.log(array.length);
    console.log(index);
    index++;
    array.splice(array.length - index, 1);
    $scope.data.currentProject.annotations = array;
    localStorage.recordings = JSON.stringify($rootScope.data.recordings);
  }

  $scope.sendRecordingXML = function() {
    var annotations = $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations;
    if (annotations.length === 0) return false;
    var camera = annotations[0].camera;
    var xml = '<?xml version="1.0"?>';
    xml += '<recording>';
    xml += "	<camera type='" + camera.cameraType + "' ip='" + camera.cameraIP + "'></camera>";
    xml += "	<recorder type='" + camera.recorderType + "' ip='" + camera.recorderIP + "'></recorder>";
    xml += "	<annotations>";
    angular.forEach(annotations, function(a) {
      xml += "	<annotation>";
      xml += "		<team>" + a.team.name + "</team>";
      if (a.player !== null) {
        xml += "  <player number='" + a.player.number + "'>" + a.player.name + "</player>";
      }
      xml += "		<event start='" + a.start + "' end='" + a.end + "'>" + a.event.name + "</event>";
      xml += "  </annotation>";
    });
    xml += "	</annotations>";
    xml += '</recording>';
    console.log(xml);

    var filename = localStorage.lastRecordedVideo + ".xml";

    // window.resolveLocalFileSystemURL($scope.directory, function(directoryEntry) {
    //   directoryEntry.getFile(filename, {
    //     create: true
    //   }, function(fileEntry) {
    //     fileEntry.createWriter(function(fileWriter) {
    //       fileWriter.onwriteend = function(e) {
            // for real-world usage, you might consider passing a success callback
            //console.log('Write of file "' + $scope.directory + filename + '"" completed.');
            //var filePath = $scope.directory + filename;
            //var filePath = fileEntry.nativeURL;
            //  var filePath = $scope.directory + filename;
            $cordovaEmailComposer.isAvailable().then(function() {
              var email = {
                to: $rootScope.data.email_to,
                cc: '',
                bcc: [],
                attachments: [],
                subject: $rootScope.data.email_subject,
                body: xml,
                isHtml: false
              };
              console.log(email)
              $cordovaEmailComposer.open(email).then(null, function() {
                console.log("email client closed");
              });
            }, function() {
              alert("Email service not available")
            });
        //  };
		//
    //       fileWriter.onerror = function(e) {
    //         // you could hook this up with our global error handler, or pass in an error callback
    //         alert('Write failed: ' + e.toString());
		//
    //       };
		//
    //       var blob = new Blob([xml], {
    //         type: 'text/xml'
    //       });
    //       fileWriter.write(blob);
    //     }, errorHandler.bind(null, filename));
    //   }, errorHandler.bind(null, filename));
    // }, errorHandler.bind(null, filename));

  }
  $scope.stringToBool = function(value) {
    if (value.toLowerCase() === "true") return true;
    return false
  }

  $scope.getExportQueue = function() {
    $scope.showLoading();
    var promise = recorderControll.getExportQueue($rootScope.selectedCam);
    promise.then(
      function(response) {
        console.log(response);
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
        console.log(videos);
        $scope.hideLoading();
        $scope.isDownloaded();
      },
      function(error) {
        console.log(error);
        $scope.hideLoading();
      }
    )
  }

  $scope.isDownloaded = function() {

    $scope.fileExists = [];
    console.log($scope.data.videos.length);
    for (i = 0; i < $scope.data.videos.length; i++) {
      var video = $scope.data.videos[i];
      var targetPath = $scope.directory + video.file_name.replace(/\s+/g, '');
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
  $scope.startPlayback = function(targetPath) {
    $scope.showPlaybackVideoModal = true;
    //video_src = "videos/example2.mp4"
    targetPath = decodeURI(targetPath);
    console.log(targetPath);
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

  $scope.showPlaybackVideo = function(video) {
    console.log(video);
    var video_src = "http://" + $rootScope.selectedCam.recorderIP + "/download/" + $scope.recorder.recordingDetails.directory + "/Export/" + video.file_name;
    video_src = encodeURI(video_src);
    console.log(video_src);
    var url = video_src;

    var targetPath = $scope.directory + video.file_name.replace(/\s+/g, '');

    var trustHosts = true;
    var options = {
      "headers": {
        'Authorization': 'Basic ' + btoa($rootScope.selectedCam.username + ':' + $rootScope.selectedCam.password)
      }
    };
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

  $scope.getRecordingDetails = function() {
    $scope.showLoading();
    var promise = recorderControll.getDetailsOfRecording($rootScope.selectedCam, $scope.recorder.recording_id);
    promise.then(
      function(response) {
        $scope.data.playbackList = response.data.export;
        $scope.recorder.recordingDetails = response.data;
        $scope.hideLoading();
      },
      function(error) {
        console.log(error);
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

    console.log('Error (' + fileName + '): ' + msg);
  }
});