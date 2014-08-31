Member = require("../models/Member")
Event = require("../models/Event")
request = require("request")
moment = require("moment")
_ = require("underscore")
lookupService = require("../services/memberLookup")
exports.getMembers = (req, res) ->
  Member.find (err, members) ->
    if req.get('Content-Type') is 'application/json'
      res.json members
    else
      res.render "member/list",
        title: "Members"
        members: members

    return

  return

exports.getMember = (req, res) ->
  Member.findOne
    "profile.mnum": req.params.id
  , (err, member) ->
    if member
      res.render "member/detail",
        title: "Member information"
        member: member

    else
      res.status 404
      res.render "404"
    return

  return

exports.addEvent = (req, res) ->
  if req.body.title and req.body.starttime and req.body.endtime
    Member.findOne
      "profile.mnum": req.params.id
    , (err, member) ->
      if member
        member.events.push new Event(
          title: req.body.title
          starttime: new Date(req.body.starttime)
          endtime: new Date(req.body.endtime)
        )
        member.save()
      return

  res.send 200
  return

exports.postMemberLookup = (req, res) ->
  if req.query.isIso
    
    #TODO ISO lookup
    doShit()
  else
    lookupService.lookupByUcid req.params.mnum, (err, member) ->
      res.send member
      return

  return

exports.postMember = (req, res) ->
  newMember = new Member(
    email: req.body.email
    profile:
      mnum: req.body.mnum
      firstName: req.body.firstName
      lastName: req.body.lastName
      major: req.body.major
  )
  newMember.save()
  res.redirect "/member"
  return

exports.deleteMember = (req, res) ->
  mnum = req.params.id
  Member.remove
    "profile.mnum": mnum
  , (err) ->
    console.log err
    return

  return

exports.getAddMember = (req, res) ->
  res.render "member/add",
    title: "Add New Member"

  return
