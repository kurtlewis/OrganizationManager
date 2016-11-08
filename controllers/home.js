/**
 * GET /
 * Home page.
 */
var Event = require('../models/Event');
var Meeting = require('../models/Meeting');
var async = require('async');

exports.index = function(req, res) {
  var start = new Date(new Date().getTime() - (4 * 60 * 60 * 1000));
  console.log(start);
  var end = new Date(+new Date + 6048e5);
  console.log(end);

  async.parallel([
    function(callback){
        Event.find({$query: {starttime: {$gte: start, $lt: end}}, $orderby: {starttime:1}}, function(err, events) {
          callback(null, events);
        })
    },
    function(callback){
        Meeting.find({$query: {date: {$gte: start}}, $orderby: {date:1}}, function(err, meetings) {
          if(err) {
            console.log(err);
          }
          if(!meetings) {
            meetings = [];
          }
          callback(null, meetings[0]);
        })
    }
  ],function(err, results){
    // the results array will equal ['one','two'] even though
    // the second function had a shorter timeout.
    res.render('home', {
      title: 'Home',
      events: results[0] || [],
      meeting: results[1] || []
    });
  });

};
