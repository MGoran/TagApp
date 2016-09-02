angular.module('annotationController.controller', []).controller('AnnotationControllerCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state, cameraMovement, recorderControll, $interval, $cordovaEmailComposer, $filter) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  $scope.getCameraView = function() {
    if ($rootScope.selectedCam.cameraType === "Axis") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=1";
    } else if ($rootScope.selectedCam.cameraType === "Dahua") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=5&subtype=1";
    }
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
  });

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
        })
      }
      console.log($scope.recorder);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.startRecorder = function() {
    var promise = recorderControll.startRecorder($rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
      $timeout(function() {
        var date = $filter("date")(new Date(), "dd MMMM yyyy - hh-mm a");
        var filename = "capture - " + date;
        if ($rootScope.data.recordings[filename] === undefined) {
          localStorage.lastRecordedVideo = filename;
          console.log(date);
          $rootScope.data.recordings["capture - " + date] = {
            annotations: [],
            recording_id: response.data.recording_id
          }
          localStorage.recordings = JSON.stringify($rootScope.data.recordings);

        }
        console.log($rootScope.data.recordings);
        $scope.getRecorderState();
      }, 1000);
    }, function(error) {
      console.log(error);
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

  $scope.addEvent = function(event, team, team_id) {
    team.team_id = team_id;
    if (!$scope.recorder.recording) return false;
    $scope.selection = {};
    console.log($scope.recorder);
    console.log($rootScope.data);
    $rootScope.data.recordings = JSON.parse(localStorage.recordings);

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
      var annotation = {
        team: team,
        player: player,
        start: parseInt($scope.recorder.duration) - parseInt($rootScope.data.event_before),
        end: parseInt($scope.recorder.duration) + parseInt($rootScope.data.event_after),
        event: event,
        camera: $rootScope.selectedCam
      }
      console.log(annotation);
      var promise = recorderControll.addEvent(annotation, $rootScope.selectedCam);
      promise.then(function(response) {
        console.log(response);
        annotation.id = response.data.id
        $rootScope.data.recordings[localStorage.lastRecordedVideo].annotations.push(annotation);
        console.log($rootScope.data.recordings[localStorage.lastRecordedVideo])
        localStorage.recordings = JSON.stringify($rootScope.data.recordings);
      }, function(error) {
        console.log(error)
      });
    }
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
    /*
     * DELETE NEXT RETURN FOR PRODUCTION
     */
    //return false;
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

      $cordovaEmailComposer.open(email).then(null, function() {
        console.log("email client closed");
      });
    }, function() {
      alert("Email service not available")
    });
  }
  $scope.stringToBool = function(value) {
    if (value.toLowerCase() === "true") return true;
    return false
  }
});
