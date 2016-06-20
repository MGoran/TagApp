angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  if (localStorage.serverIP == undefined || localStorage.serverIP == null || localStorage.serverIP == "") {
    var serverIP = "84.104.56.233:9090";
    $rootScope.data = {};
    localStorage.serverIP = serverIP;
    $rootScope.data.serverIP = serverIP;
    localStorage.vc_transparency = "100";
    $rootScope.data.vc_transparency = "100";
  } else {
    $rootScope.data = {};
    $rootScope.data.serverIP = localStorage.serverIP;
    $rootScope.data.vc_transparency = localStorage.vc_transparency;
  }

  $ionicModal.fromTemplateUrl('../templates/modals/event-list.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    console.log("openModal");
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
})

.controller('SettingsCtrl', function($scope, $rootScope, $ionicPopup, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(true);
    $scope.saveSettings = function() {
      localStorage.serverIP = $rootScope.data.serverIP;
      localStorage.vc_transparency = $rootScope.data.vc_transparency;
      var alertPopup = $ionicPopup.alert({
        title: 'Success',
        template: "New Settings saved"
      });
      alertPopup.then(function(res) {
        console.log('Ok');
      });
    }
  })
  .controller('EventsCtrl', function($scope, $http, $ionicPopup, $rootScope, $ionicSideMenuDelegate, $ionicListDelegate) {
    $ionicSideMenuDelegate.canDragContent(true);
    $ionicListDelegate.showDelete(true);
    $rootScope.team = [];
    $scope.checkCurrentEvents = function() {
      if ($rootScope.recording_id != undefined) {
        console.log($rootScope.recording_id);
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://" + $rootScope.data.serverIP + "/api/event?recording_id=" + $rootScope.recording_id,
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
          "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/event_type",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/event",
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
              "url": "http://" + $rootScope.data.serverIP + "/api/export",
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
              // var alertPopup = $ionicPopup.alert({
              // title: 'Success',
              // template: "Event "
              // });

              // alertPopup.then(function(res) {
              // console.log('Ok');
              // });
            }, function(err) {
              console.log(err);
            });
          } else {
            console.log('Dont Export');
          }
        });
        // var alertPopup = $ionicPopup.alert({
        // title: 'New event added!',
        // template: 'Event added succesfully'
        // });

        //alertPopup.then(function(res) {
        //	console.log('Ok');
        //});
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
    $scope.data = {};
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
                "url": "http://" + $rootScope.data.serverIP + "/api/team",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/export",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/event",
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
  })

.controller('StartCtrl', function($scope, $rootScope, $stateParams, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(true);
  })
  .controller('RecorderCtrl', function($scope, $stateParams, $http, $ionicPopup, $rootScope, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(true);
    $rootScope.checkStatus = function() {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
    $rootScope.startRecorder = function() {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
  })

.controller('RecordingsCtrl', function($scope, $http, $ionicPopup, $rootScope, $filter, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(true);
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + $rootScope.data.serverIP + "/api/recording",
      "method": "GET",
    }
    $http(settings).then(function(response) {
      console.log(response);
      for (i = 0; i < response.data.list.length; i++) {
        var dateStr = response.data.list[i].start.split("-");
        var date = new Date(dateStr[0], dateStr[1], dateStr[2], dateStr[3], dateStr[4], dateStr[5]);
        response.data.list[i].start = date;
        var dateStr = response.data.list[i].stop.split("-");
        var date = new Date(dateStr[0], dateStr[1], dateStr[2], dateStr[3], dateStr[4], dateStr[5]);
        response.data.list[i].stop = date;
        response.data.list[i].length = (response.data.list[i].stop - response.data.list[i].start) / 1000;
      }
      $scope.recordings = response.data;
    }, function(err) {
      console.log(err);
    });
  })
  .controller('RecordingEventsCtrl', function($scope, $http, $ionicPopup, $stateParams, $rootScope, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(true);
    if ($rootScope.events === undefined) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://" + $rootScope.data.serverIP + "/api/event_type",
        "method": "GET",
      }
      $http(settings).then(function(response) {
        console.log(response);
        $rootScope.events = response.data;
        $scope.events = response.data;
        getRecordingDetails()
      }, function(err) {
        console.log(err);
      });
    } else {
      getRecordingDetails()
    }
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + $rootScope.data.serverIP + "/api/recording/" + $stateParams.recordingId,
      "method": "GET",
    }
    $http(settings).then(function(response) {
      console.log(response);
      $scope.recordingDetails = response.data;
    }, function(err) {
      console.log(err);
    });
    $scope.showRecordingEvents = function(recording) {
      console.log(recording);
    }

    function getRecordingDetails() {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://" + $rootScope.data.serverIP + "/api/event?recording_id=" + $stateParams.recordingId,
        "method": "GET",
      }
      $http(settings).then(function(response) {
        //console.log(response);

        for (i = 0; i < response.data.list.length; i++) {
          if (response.data.list[i].team_id == 1) {
            response.data.list[i].team_name = response.data.team[0].name;
          } else {
            response.data.list[i].team_name = response.data.team[1].name;
          }
          response.data.list[i].event_name = $rootScope.events.list[response.data.list[i].event_type_id - 1].name
        }
        $scope.recordingEvents = response.data;
        console.log($scope.recordingEvents);
        //$scope.$apply();
      }, function(err) {
        console.log(err);
        $scope.err = err.data;
      });
    }

  })
  .controller('VideoServerCtrl', function($rootScope, $scope, $sce, $ionicSideMenuDelegate, $location, $ionicViewSwitcher, $state, $timeout, $http, $ionicPopup, $interval) {
    //$ionicSideMenuDelegate.canDragContent(false);
    flowplayer("#hlsjslive", {
      splash: true,
      embed: false,
      ratio: 9 / 16,

      clip: {
        live: true,
        sources: [{
          type: "application/x-mpegurl",
          //http://84.104.56.233:8080/video/live.m3u8
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
    // controller.onPlayerReady = function(API) {
    //   controller.API = API;
    //   console.log("touchscreen is", VirtualJoystick.touchScreenAvailable() ? "available" : "not available");
    //   var joystick = new VirtualJoystick({
    //     container: document.getElementById('video_container'),
    //     mouseSupport: true,
    //   });
    //   joystick.addEventListener('touchStart', function() {
    //     console.log('down')
    //   })
    //   joystick.addEventListener('touchEnd', function() {
    //     console.log('up')
    //   })
    // };
    //
    // this.config = {
    //   sources: [{
    //       src: $sce.trustAsResourceUrl("http://84.104.56.233:8080/video/live.m3u8"),
    //       type: "application/x-mpegURL"
    //     }
    //     // {src: $sce.trustAsResourceUrl("http://techslides.com/demos/sample-videos/small.webm"), type: "video/webm"},
    //     // {src: $sce.trustAsResourceUrl("http://techslides.com/demos/sample-videos/small.mp4"), type: "video/3gp"},
    //     // {src: $sce.trustAsResourceUrl("http://techslides.com/demos/sample-videos/small.ogv"), type: "video/ogg"}
    //   ],
    //   tracks: [{
    //     src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
    //     kind: "subtitles",
    //     srclang: "en",
    //     label: "English",
    //     default: ""
    //   }],
    //   theme: "lib/videogular-themes-default/videogular.css",
    //   plugins: {
    //     poster: "img/header-logo.png"
    //   }
    // };
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
        "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/ptz",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
          "url": "http://" + $rootScope.data.serverIP + "/api/event?recording_id=" + $rootScope.recording_id,
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
          "url": "http://" + $rootScope.data.serverIP + "/api/recorder",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/event_type",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/event",
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
              "url": "http://" + $rootScope.data.serverIP + "/api/export",
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
              // var alertPopup = $ionicPopup.alert({
              // title: 'Success',
              // template: "Event "
              // });

              // alertPopup.then(function(res) {
              // console.log('Ok');
              // });
            }, function(err) {
              console.log(err);
            });
          } else {
            console.log('Dont Export');
          }
        });
        // var alertPopup = $ionicPopup.alert({
        // title: 'New event added!',
        // template: 'Event added succesfully'
        // });

        //alertPopup.then(function(res) {
        //	console.log('Ok');
        //});
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
                "url": "http://" + $rootScope.data.serverIP + "/api/team",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/export",
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
        "url": "http://" + $rootScope.data.serverIP + "/api/event",
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
  })
  .controller('StreamCtrl', function($rootScope, $scope, $sce, $ionicSideMenuDelegate, $location, $ionicViewSwitcher, $state, $timeout, $http, $ionicPopup, $interval, $ionicModal) {
    var authdata = btoa("admin" + ':' + "admin");

    $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
    $scope.pan = function(direction) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://83.162.175.252:8080/cgi-bin/ptz.cgi?action=start&channel=0&code=" + direction + "&arg1=0&arg2=3&arg3=0",
        "method": "get",
        "headers": {
          'Authorization': 'Basic ' + authdata
        }
      }
      console.log(settings);
      $http(settings).then(function(response) {
        console.log(response);
        $timeout(function() {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://83.162.175.252:8080/cgi-bin/ptz.cgi?action=stop&channel=0&code=" + direction + "&arg1=0&arg2=3&arg3=0",
            "method": "get"
          }
          console.log(settings);
          $http(settings).then(function(response) {
            console.log(response);
          }, function(err) {
            console.log(err);
          });
        }, 2000);
      }, function(err) {
        console.log(err);
      });
    }
    $scope.zoom = function(direction) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://83.162.175.252:8080/cgi-bin/ptz.cgi?action=start&channel=0&code=" + direction + "&arg1=0&arg2=multiple&arg3=0",
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
        "url": "http://83.162.175.252:8080/cgi-bin/ptz.cgi?action=start&channel=0&code=GotoPreset&arg1=0&arg2=" + index + "&arg3=0",
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
  })
  .controller('RtspCtrl', function() {
    console.log("RTSP");

    flowplayer("#hlsjslive", {
      splash: true,
      embed: false,
      ratio: 9 / 16,

      clip: {
        live: true,
        sources: [{
          type: "application/x-mpegurl",
          //http://84.104.56.233:8080/video/live.m3u8
          src: "http://84.104.56.233:8080/video/live.m3u8"
        }]
      }

    });
  })
  .filter('secondsToDateTime', [function() {
    return function(seconds) {
      return new Date(1970, 0, 1).setSeconds(seconds);
    };
  }])
