Organization Manager
=================
A basic system for managing student organizations. Built for use at UC.

Built to manage meeting attendance, voting, service hours, 


## Deploying
I recommend deploying on [dokku](http://dokku.viewdocs.io/dokku/). Dokku is very powerful and will automate a lot of the junk for you.
Basic setup:
```
# On host machine, after dokku has been installed, and configured with your ssh key
$dokku apps:create ambassadors
$dokku config:set ambassadors MONGO_URL=[YOUR DATABASE STRING HERE]
# See all the useful tools dokku has to offer
$dokku help

# On your machine
$git remote add dokku dokku@[serverip] #Only needs run once
$git push dokku [branch]:master #If pushing master branch, just use $git push dokku master
```