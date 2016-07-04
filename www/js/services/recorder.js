angular.module('recorder.service', []).service('recorder', function($http) {

  //Get list of camera profiles
  this.getCameraProfiles = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/camera_profile",
        "method": "GET",
      }
      return $http(settings)
    }
    //Get list of export profiles
  this.getExportProfiles = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/camera_profile",
        "method": "GET",
      }
      return $http(settings)
    }
    //Get state of recorder
  this.getStateOfRecorder = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/recorder",
        "method": "GET",
      }
      return $http(settings)
    }
    //Set state of recorder
    // {
    //   "recording": true or false(optional),
    //   "streaming": true or false(optional),
    //   "preview": true or false(optional),
    //   "camera_profile_id": camera_profile_id(optional)
    // }
  this.setStateOfRecorder = function(ip, data) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/recorder",
        "method": "PUT",
        "data": data
      }
      return $http(settings)
    }
    //Get list of recordings
  this.getListOfRecordings = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/recording",
        "method": "GET",
      }
      return $http(settings)
    }
    //Delete recording
  this.deleteRecording = function(ip, recording_id) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/recording/" + recording_id,
        "method": "DELETE",
      }
      return $http(settings)
    }
    //Get details of recording
  this.getDetailsOfRecording = function(ip, recording_id) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/recording/" + recording_id,
        "method": "GET",
      }
      return $http(settings)
    }
    //Get export queue
  this.getExportQueue = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/export",
        "method": "GET",
      }
      return $http(settings)
    }
    //Queue Video export
    // {
    //   "recording_id": recording_id,
    //   "file_name": "Name of generated video" (optional),
    //   "source": "Name of source" (optional),
    //   "generated": true or false(optional),
    //   "export_profile_id": export_profile_id(optional),
    //   "start": "yyyy-MM-dd-HH-mm-ss-fff" (optional),
    //   "duration": duration_milliseconds(optional),
    //   "event_id": event_id(optional),
    //   "upload": true or false(optional),
    //   "title": "Title of video on YouTube" (optional),
    //   "description": "Description of video on YouTube" (optional),
    //   "privacy": "public"
    //   or "private"
    //   or "unlisted" (optional),
    //   "selection": [{
    //     "start": "yyyy-MM-dd-HH-mm-ss-fff" (optional),
    //     "duration": duration_milliseconds(optional),
    //     "event_id": event_id(optional)
    //   }, {
    //     "start": "yyyy-MM-dd-HH-mm-ss-fff" (optional),
    //     "duration": duration_milliseconds(optional),
    //     "event_id": event_id(optional)
    //   }](optional)
    // }
  this.queueExport = function(ip, data) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/export",
        "method": "POST",
        "data": data
      }
      return $http(settings)
    }
    //Delete Queued video export
  this.deleteQueuedVideoExport = function(ip, export_id) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/recordings/" + export_id,
        "method": "DELETE",
      }
      return $http(settings)
    }
    //Get list of event types
  this.getEventTypes = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/event_type",
        "method": "GET",
      }
      return $http(settings)
    }
    //Add event
    // {
    //   "event_type_id": event_type_id,
    //   "team_id": 1 or 2,
    //   "recording_id": recording_id(optional),
    //   "time": "yyyy-MM-dd-HH-mm-ss-fff" (optional)
    // }
    //***If recording_id is sent, annotation of finished recording will be changed. Parameter
    //***time must be sent in this case.
  this.setEvent = function(ip, data) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/event",
        "method": "POST",
				"data": data
      }
      return $http(settings)
    }
    //Delete event
    // {
    //   "recording_id": recording_id(optional),
    //   "event_id": event_id
    // }
    //***If recording_id is sent, annotation of finished recording will be changed.
  this.deleteEvent = function(ip, data) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/event",
        "method": "DELETE",
        "data": data
      }
      return $http(settings)
    }
    //Get list of events
  this.getEventList = function(ip, recording_id) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/event?recording_id=" + recording_id,
        "method": "GET",
      }
      return $http(settings)
    }
    //Set team Name
    // {
    //   "recording_id": recording_id(optional),
    //   "team_id": 1 or 2,
    //   "name": "Name of team 1 or 2"
    // }
  this.setTeamName = function(ip, recording_id) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/team?recording_id=" + recording_id,
        "method": "PUT",
        "data": data
      }
      return $http(settings)
    }
    //Get team Name
  this.getTeamNames = function(ip, recording_id) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/team?recording_id=" + recording_id,
        "method": "GET",
      }
      return $http(settings)
    }
    //Get scheduled events
  this.getScheduledEvents = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/scheduler",
        "method": "GET",
      }
      return $http(settings)
    }
    //Add scheduled event
    // {
    //   "camera_profile_id": camera_profile_id(optional),
    //   "name": "Name of event" (optional),
    //   "begin": "yyyy-MM-dd-HH-mm-ss",
    //   "end": "yyyy-MM-dd-HH-mm-ss",
    //   "interval": repeat_interval_in_days(optional)
    // }
  this.addScheduledEvent = function(ip, data) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/scheduler",
        "method": "POST",
        "data": data
      }
      return $http(settings)
    }
    //Modify scheduled event
  this.modifyScheduledEvent = function(ip, event_id, data) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/scheduler/" + event_id,
        "method": "PUT",
        "data": data
      }
      return $http(settings)
    }
    //Delete scheduled event
  this.deleteScheduledEvent = function(ip, event_id) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/scheduler/" + event_id,
        "method": "DELETE",
      }
      return $http(settings)
    }
    //Get state of ptz
  this.getPTZState = function(ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/ptz",
        "method": "GET",
      }
      return $http(settings)
    }
    //Set state of ptz
    // {
    //   "manual": true or false(optional),
    //   "goto": "Position" (optional),
    //   "move": "Direction" (optional),
    //   "duration": duration_of_movement_milliseconds(optional),
    //   "speed": -3...3(optional)
    // }
    // Set value "manual": true to start PTZ controller.
    // Parameter goto can be: "Home" or "LeftGoal" or "Right Goal" or "Tour".
    // Parameter move can be: "Left" or "Right" or "Up" or "Down" or "LeftUp" or
    // "LeftDown" or "RightUp" or "RightDown" or "ZoomIn" or "ZoomOut" or "Stop".
    // Parameter duration specifies duration of movement, default value is 100 ms.
    // Movement can be stopped immediately with parameter "move": "Stop".
    // Paramere speed represents speed of movements. Standard speed is 0, use lower
    // values for slower movement, and higher values for faster movement.
    this.setPTZState = function(ip, data) {
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": ip + "/api/ptz",
          "method": "PUT",
          "data": data
        }
        return $http(settings)
      }
});
