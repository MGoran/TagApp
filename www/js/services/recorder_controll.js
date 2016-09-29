angular.module('recorderControll.service', []).service('recorderControll', function($http, $filter) {
  var service = {};
  service.getRecorderState = function(camera) {
    switch (camera.recorderType) {
      case "vMix":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
      case "Panofield":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api/recorder",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings)
  }
  service.startRecorder = function(camera) {
    switch (camera.recorderType) {
      case "vMix":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api/?function=StartRecording",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
      case "Panofield":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api/recorder",
            "method": "PUT",
            "data": {
              recording: true
            },
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings)
  }

  service.stopRecorder = function(camera) {
    switch (camera.recorderType) {
      case "vMix":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api/?function=StopRecording",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
      case "Panofield":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api/recorder",
            "method": "PUT",
            "data": {
              recording: false
            },
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings)
  }

  service.addEvent = function(annotation, camera) {
    var data = {
      "event_type_name": annotation.event.name,
      "team_id": annotation.team.team_id,
      "begin": $filter('date')(new Date(annotation.start), "yyyy-MM-dd-HH-mm-ss-sss"),
      "end": $filter('date')(new Date(annotation.end), "yyyy-MM-dd-HH-mm-ss-sss")
    }
    if (annotation.player !== "undefined" && annotation.player !== null)
      data.player_name = annotation.player.name;
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + camera.recorderIP + "/api/event",
      "method": "POST",
      "data": data,
      "headers": {
        'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
      }
    }
    return $http(settings);
  }

  service.deleteEvent = function(annotation, camera) {
    var data = {
      "event_id": annotation.id
    }
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + camera.recorderIP + "/api/event",
      "method": "DELETE",
      "data": data,
      "headers": {
        'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
      }
    }
    return $http(settings);
  }


  service.setTeamName = function(team, camera) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + camera.recorderIP + "/api/team",
      "method": "PUT",
      "data": {
        team_id: team.id,
        name: team.name
      },
      "headers": {
        'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
      }
    }
    return $http(settings);
  }

  //Get export queue
  service.getExportQueue = function(camera) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + camera.recorderIP + "/api/export",
      "method": "GET",
      "headers": {
        'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
      }
    }
    return $http(settings)
  }

  service.queueExport = function(camera, data) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + camera.recorderIP + "/api/export",
      "method": "POST",
      "data": data,
      "headers": {
        'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
      }
    }
    console.log(settings);
    return $http(settings)
  }

  //Get details of recording
  service.getDetailsOfRecording = function(camera, recording_id) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://" + camera.recorderIP + "/api/recording/" + recording_id,
      "method": "GET",
      "headers": {
        'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
      }
    }
    return $http(settings)
  }

  return service;
});
