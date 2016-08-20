var Event = require('../models/Event')
var Member = require('../models/Member')
var Settings = require('../models/Settings')
var async = require('async')
var moment = require('moment');
var gcal = require('google-calendar');
var secrets = require('../config/secrets')

exports.getEvents = function(req, res) {
  Event.find(function(err, events) {
    res.render('event/list',{
      title: "Events",
      events:events,
    });
  });


};

exports.getEvent = function(req, res) {
  var id = req.params.id;
  Event.findOne({"_id":id}, function(err, event){
      if(err || !event) {
        res.render(404);
	console.log("Error finding event with id:" + id);
	console.log("err was:" + err);
      }
      else {
        async.parallel([
          function(callback){
              Member.find({'profile.mnum': {$in: event.attendees }}, function(err, members) {

                callback(null, members);
              });
          },
          function(callback){
              Member.find({'profile.mnum': {$in: event.confirmed }}, function(err, members) {

                callback(null, members);
              });
          }
        ],function(err, results){
          // the results array will equal ['one','two'] even though
          // the second function had a shorter timeout.
          res.render('event/detail', {
            title: "Register for Event",
            event: event,
            members: results[0],
            confirmed: results[1]
          });
        });
      }
  });
}

exports.addEvent = function(req, res) {
  res.render('event/add', {
    isEdit: false,
    title: 'Add Event',
    event: {
      title: '',
      starttime: '',
      endtime: '',
      location: '',
      summary: ''
    }
  });

}

exports.editEvent = function(req, res) {
  Event.findOne({_id: req.params.id}, function(err, event) {
    res.render('event/add',  {
      isEdit: true,
      title: 'Edit Event',
      event: event
    })
  });

}

exports.deleteEvent = function(req, res) {
  if(req.params.id) {
    Event.remove({_id: req.params.id}, function(err, event) {
      console.log(err);
      res.send(200);
    });
  }

}

exports.postEvent = function(req,res) {

  if(req.body.isEdit == 'true') {
    Event.findOne({_id: req.body.eventID}, function(err, evt) {
      console.log(evt);

      evt.title = req.body.title;
      evt.starttime = new Date(req.body.starttime);
      evt.endtime = new Date(req.body.endtime);
      evt.location = req.body.location;
      evt.summary = req.body.summary;
      evt.save(function(err) {
        console.log(err);
      });
    });
  } else {
    var newEvent = new Event({
      title: req.body.title,
      starttime: new Date(req.body.starttime),
      endtime: new Date(req.body.endtime),
      location: req.body.location,
      summary: req.body.summary,
      attendees: [],
      confirmed: []
    });
    newEvent.save();

    Settings.findOne({}, function (err, setting) {
      console.log("Setting calendar key");
      console.log(err);
      if (setting) {
        setting.getAccessToken(function (accessToken) {
          google_calendar = new gcal.GoogleCalendar(accessToken);
          console.log(accessToken);
          google_calendar.calendarList.list(function (err, calendarList) {
            var params = {
              start: {
                dateTime: moment(req.body.starttime).format()
              },
              end: {
                dateTime: moment(req.body.endtime).format()
              },
              summary: req.body.title,
              description: req.body.summary
            };
            google_calendar.events.insert(calendarList.items[0].id, params, function (err, calEvent) {
              console.log(calEvent.id)
              newEvent.googleID = calEvent.id;
              newEvent.save();
            });
          });
        })
      }
    })
  }

  res.redirect('/event');
}

exports.postUpdate = function(req, res) {
  var id = req.params.id;
  var mnum = req.body.mnum;

  Event.findOne({_id:id}, function(err, event) {
    event.attendees.push(mnum);
    event.save();
  });


  res.redirect('/event/' + id);

}

exports.denyAttendance = function(req, res) {
  var id = req.params.id;
  var mnum = req.params.mnum;


  Event.findOne({_id:id}, function(err, evt) {
    var index = evt.attendees.indexOf(mnum);
    if (index > -1)
      evt.attendees.splice(index, 1);
    evt.save();
  });

  res.redirect('/event/' + id);
}

exports.postConfirmation = function(req, res) {
  var id = req.params.id;
  var mnum = req.params.mnum;

  if(req.body.isDeny) {
    console.log('deny');
  }

  Event.findOne({_id:id}, function(err, event) {
    event.confirmed.push(mnum);
    Member.findOne({"profile.mnum":mnum}, function(err, member) {
      member.events.push({
        title: event.title,
        starttime: event.starttime,
        endtime: event.endtime,
        summary: event.summary,
        location: event.location
      });
      member.save();
    });
    var index = event.attendees.indexOf(mnum);
    if (index > -1)
      event.attendees.splice(index, 1);

    event.save();
  });

  res.redirect('/event/' + id);

}
