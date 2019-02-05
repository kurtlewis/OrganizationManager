# Deprecated
This repository is no longer maintined. [Visit this repository for the source
code behind the new ambassadors website](https://github.com/kurtlewi/ceas-ambassadors-website).
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
# Install mongoDB Dokku plugin
$sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo
$dokku mongo:create ambassadorsDB
$dokku mongo:link ambassadorsDB ambassadors
# See all the useful tools dokku has to offer
$dokku help
# Configure the dokku instance
$dokku config:set ambassadors ADMIN_MODE=NO


# On your machine
$git remote add dokku dokku@[serverip] #Only needs run once
$git push dokku [branch]:master #If pushing master branch, just use $git push dokku master


# Creating backups of mongoDB on Dokku
$dokku mongo:export ambassadorsDB > mybackupname.dump.tar
# Importing backups:
$dokku mongo:import ambassadorsDB < mybackupname.dump.tar
```

## Testing
Tests are written in the `test` directory - you can run tests with the `npm test` command. Running tests requires a valid database connection.
### Manual Testing Areas
There are areas of the project that should be manually tested, especially when relevant code is modified. It's hard to write tests for these areas.
* TODO

## Other Notes

### Admin Mode
To improve security of the deployed application, accounts can only be created when admin mode is turned on. Likewise, the website can only be reset for a new semester when admin mode is turned on. This makes it so that arbitrary 3rd parties cannot create accounts, and users with accounts can not maliciously or accidentally reset the website. To turn on admin mode, you must have access to the server. Appropriate values for the ADMIN_MODE environment variable are `YES` and `NO`. If admin mode is not set, or is set incorrectly, it will be off.
