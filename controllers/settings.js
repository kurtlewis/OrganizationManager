var Settings = require('../models/Settings')
var gCal = require('google-calendar')
var app = require('../app');

var Member = require('../models/Member');
var Event = require('../models/Event');
var Meeting = require('../models/Meeting');


exports.getSettings = function(req, res) {
  Settings.findOne(function(err, settings){
    if(!settings)
      settings = new Settings();
    res.render('settings', {
      title: req.app.locals.organization,
      settings: settings
    });
  });
}

exports.postSettings = function(req, res) {
  Settings.findOne(function(err, settings) {
    if(!settings)
      settings = new Settings();
    settings.organizationName = req.body.organizationName;
    settings.organizationMinutes = req.body.organizationMinutes;
    settings.eventsEnabled = req.body.eventsEnabled == undefined ? false : true;
    settings.save();
    req.app.locals.organization = req.body.organizationName;
    req.app.locals.eventsEnabled = req.body.eventsEnabled;
    req.app.locals.minimumMinutes = req.body.organizationMinutes;
    console.log(req.app.locals);
    res.redirect('/settings');
  })
}

exports.resetData = function(req, res) {
  res.send(200);

  Member.find({}, function(err, members) {
    members.forEach(function(member) {
      member.events = [];
      member.meetings = 0;
      member.save();
    })
  });
  Event.find({}).remove().exec();
  Meeting.find({}).remove().exec();
}
