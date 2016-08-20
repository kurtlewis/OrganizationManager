/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var refresh = require('google-refresh-token');
var Settings = require('./models/Settings');
var moment = require('moment');

var refreshToken = function() {
  console.log('refresh called');
  Settings.findOne({}, function(err, settings) {

    if(settings && settings.refreshToken) {
      refresh(settings.refreshToken, secrets.google.clientID, secrets.google.clientSecret, function(err, json, res) {
        settings.calendarKey = json.accessToken;
        settings.save();
      });
    }
  });
  setTimeout(refreshToken, 1000*60*30)
};
refreshToken();


/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var forgotController = require('./controllers/forgot');
var resetController = require('./controllers/reset');

var memberController = require('./controllers/member');
var meetingController = require('./controllers/meeting');
var eventController = require('./controllers/event');
var settingsController = require('./controllers/settings');

var Settings = require('./models/Settings');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});





/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var week = (day * 7);
var month = (day * 30);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  }, function(e) {
    app.listen(app.get('port'), function() {
      console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
    });
    app.isReady = true;
  })
}));
app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.token = req.csrfToken();
  res.locals.secrets = secrets;
  res.locals.moment = moment;
  next();
});
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});

if (process.env.NODE_ENV !== 'production') {
  console.log("not production")
  app.get('/csrf', function (req, res, next) {
    res.json({
      csrf: req.csrfToken()
    })
  })
  app.use(express.errorHandler());
}


/**
 * Application routes.
 */
app.get('/member', memberController.getMembers);
app.get('/member/add', passportConf.isAuthenticated, memberController.getAddMember)
app.post('/member/add', passportConf.isAuthenticated, memberController.postMember);
app.get('/member/lookup/:mnum', memberController.postMemberLookup);

app.get('/member/:id', passportConf.isAuthenticated, memberController.getMember);
app.post('/member/:id', passportConf.isAuthenticated, memberController.addEvent)
app.del('/member/:id', passportConf.isAuthenticated, memberController.deleteMember);


app.get('/meeting', meetingController.getMeeting);
app.get('/meeting/add', passportConf.isAuthenticated, meetingController.getAddMeeting);
app.post('/meeting/add', passportConf.isAuthenticated, meetingController.postMeeting);
app.get('/meeting/:id', passportConf.isAuthenticated, meetingController.getMeeting);
app.post('/meeting/:id', passportConf.isAuthenticated, meetingController.postMNum);

app.get('/event', eventController.getEvents);
app.get('/event/add',passportConf.isAuthenticated, eventController.addEvent);
app.post('/event/add', passportConf.isAuthenticated, eventController.postEvent);
app.get('/event/:id', eventController.getEvent);
app.post('/event/:id', eventController.postUpdate);
app.get('/event/:id/edit', passportConf.isAuthenticated, eventController.editEvent);
app.del('/event/:id', passportConf.isAuthenticated, eventController.deleteEvent);
app.get('/event/:id/:mnum/deny', passportConf.isAuthenticated, eventController.denyAttendance)
app.get('/event/:id/:mnum', passportConf.isAuthenticated, eventController.postConfirmation);

app.get('/settings',passportConf.isAuthenticated, settingsController.getSettings);
app.post('/settings', passportConf.isAuthenticated, settingsController.postSettings);

app.post('/reset', passportConf.isAuthenticated, settingsController.resetData);

app.get('/', homeController.index);
app.get('/apply', function(req, res) {
    res.render('apply', {
        title: 'Apply'
    })
})
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', forgotController.getForgot);
app.post('/forgot', forgotController.postForgot);
app.get('/reset/:token', resetController.getReset);
app.post('/reset/:token', resetController.postReset);
app.get('/signup',  userController.getSignup);
app.post('/signup',  userController.postSignup);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

app.get('/auth/google', passport.authenticate('google', { scope: 'profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/glass.timeline', accessType: 'offline'}));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/virtual', function(req, res) {
  res.render('virtual');
})
/**
 * Start Express server.
 */


Settings.findOne(function(err, settings) {
  if(settings) {
    app.locals.organization = settings.organizationName;
    app.locals.eventsEnabled = settings.eventsEnabled ? true : false;
    app.locals.minimumMinutes = settings.organizationMinutes;
  } else {
    app.locals.organization = "Test Organization";
    app.locals.eventsEnabled = true;
    app.locals.minimumMinutes = 360;
  }
});

app.locals.organization = 'CEAS Amb';

module.exports = app;
