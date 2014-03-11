var Member = require('../models/Member')
var request = require('request');
exports.getMembers = function(req, res) {
  Member.find(function(err, members) {
    res.render('member/list', {
      title: "Members",
      members: members
    })
  });
}

exports.postMemberLookup = function(req, res) {
  console.log(req.params.mnum);
  var requestString = 'http://tribunal.uc.edu/drupal6/student/checkin/lookup?ucid=' + req.params.mnum
  console.log("request string is:" + requestString);
  request(requestString, function(error, response, body) {
    res.send(body);
  })
}

exports.postMember = function(req, res) {

  var newMember = new Member({
    email: req.body.email,
    profile: {
      mnum: req.body.mnum,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      major: req.body.major
    }

  })
  newMember.save();
  res.redirect('/member');

}

exports.deleteMember = function(req, res) {
  console.log("deleting : " + req.params.id);
  var mnum = req.params.id;
  Member.remove({"profile.mnum": mnum}, function(err) {
    console.log(err);
  });
}

exports.getAddMember = function(req, res) {
  res.render('member/add', {
    title: "Add New Member"
  })
}