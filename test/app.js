var request = require('supertest');
var app = require('../app.js');
var server = request.agent('http://localhost:3000');
var assert = require('chai').assert

var Event = require('../models/Event');
var Meeting = require('../models/Meeting');

var csrf = "";


describe('GET /', function() {

  before(function(done) {
    setTimeout(done, 4000);
  });

  it('should return 200 OK', function(done) {
    server
      .get('/')
      .expect(200, done);
  });
});

describe('GET /csrf', function() {
  it('should get CSRF Token', function(done) {
    server
      .get('/csrf')
      .end(function(err, res) {
        if (err) return done(err);
        console.log(res.body)
        csrf = res.body.csrf;
        done();
      })
  });
});


describe('Authentication', function() {



  it('should get signup page', function(done) {
    server
      .get('/signup')
      .expect(200, done);
  })

  it('should register user', function(done) {
    server
      .post('/signup')
      .send({_csrf: csrf, email:'backjo@mail.uc.edu', password: 'jonaback2334', confirmPassword: 'jonaback2334'})
      .expect(302, done);
  });

  it('should logout user', function(done) {
    server
      .get('/logout')
      .expect(302, done);
  })

  it('should get login page', function(done) {
    server
      .get('/login')
      .expect(200, done);
  });

  it('should login successfully', function(done) {
    server
      .post('/login')
      .send({_csrf: csrf, email: 'backjo@mail.uc.edu', password: 'jonaback2334'})
      .expect(302, done);
  })
});

describe('Member CRUD tests', function() {
  it('should add a new member', function(done) {
    server
      .post('/member/add')
      .send({_csrf: csrf, mnum:'M04297884', email: 'backjo@mail.uc.edu', firstName: 'Jonah', lastName: 'Back', major: 'Computer Science'})
      .expect(302, done);
  });
});

describe('Event CRUD tests', function() {
  var eventID = "";
  it('should GET event page', function(done) {
    server
      .get('/event/add')
      .expect(200,done)
  })

  it('should POST event', function(done) {
    server
      .post('/event/add')
      .send({
        _csrf:csrf,
        title: 'debugTour',
        starttime: '31 December 1999 1:00 PM',
        endtime: '31 December 1999 2:00 PM',
        location: '407 ERC',
        summary: 'TEST'
      })
      .end(function(err,res) {
        Event.findOne({'title': 'debugTour'},function(err, evt) {
          if(err || !evt)
            return done(err);
          eventID = evt.id;
          done();
        })
      })

  });


  it('should DELETE event', function(done) {
    server
      .del('/event/'+eventID)
      .send({_csrf:csrf})
      .end(function(err, res) {
        Event.findOne({"_id":eventID}, function(err, evt) {
          if(err || evt)
            return done(err);
          done();
        })
      })
  })
});

describe('Meeting CRUD tests', function() {
  var meetingID = "";
  it('should GET meeting page', function(done) {
    server
      .get('/meeting/add')
      .expect(200,done)
  })

  it('should POST meeting', function(done) {
    var summary = "Unit Test Meeting";
    server
      .post('/meeting/add')
      .send({
        _csrf:csrf,
        date: new Date(),
        room: '407 ERC',
        summary: summary
      })
      .end(function(err, res) {
        Meeting.findOne({"summary": summary}, function(err, meeting) {
          if(err || !meeting)
            return done(err)
          meetingID = meeting.id;
          done();
        })
      })

  });

  // card swip signin is deprecated
  // it('Should sign into meeting using cardswipe', function(done) {
  //   var ISO = "6015899400214891";
  //   var mnum = "M04297884";

  //   server
  //     .post('/meeting/' + meetingID)
  //     .send({
  //       _csrf: csrf,
  //       iso: ISO
  //     })
  //     .end(function(err, res) {
  //       Meeting.findOne({"_id":meetingID}, function(err, meeting) {
  //         if(!meeting || err)
  //           return done(err);
  //         assert.lengthOf(meeting.attendees,1,'Should be one attendee');
  //         assert.equal(meeting.attendees[0], mnum, "Attendee should be swiper");
  //         done();
  //       })
  //     })
  // });

  it('Should delete meeting', function(done) {
    Meeting.remove({"_id":meetingID}, function(err, meeting) {
      if(err) return done(err)
      done();
    });
  })



});
