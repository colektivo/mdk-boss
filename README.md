[![Dependency Status](http://david-dm.org/colektivo/mdk-boss.svg)](http://david-dm.org/colektivo/mdk-boss)

# Mdk-Boss

The Boss app will be responsible to make you efficient moving around the museum
tracking your time and pointing you how much money are you wasting.
The Boss Node app be responsible to get the Card id and location from
mdk-police devices.

## Mdk Time tracking architecture

![MDK Time Tracking architecture] (https://github.com/colektivo/mdk-employee/blob/master/docs/infographic/infographic.001.jpg?raw=true "MDK Time Tracking architecture")

### The other apps

* [mdk-police] (https://github.com/colektivo/mdk-police "App responsible to capture all the USB readers input")
* [mdk-employee] (https://github.com/colektivo/mdk-employee "App responsible to show the time tracking information on a touch screen")

### Requirements

node.js v0.8 or later
libudev-dev (Linux only)
libusb-1.0-0-dev (Ubuntu versions missing libusb.h only)
git
npm
posgresql

### Installing on ubuntu

Due that the computer to be installed is not powerful enough to run everything
on a VM the configuration was not automated with docker or vagrant.

```bash
git clone https://github.com/colektivo/mdk-boss.git

# node and dependencies
sudo apt-get install node
sudo apt-get install npm
sudo apt-get install libudev-dev
sudo apt-get install libusb-1.0-0-dev
sudo apt-get install nodejs-legacy
sudo apt-get install libpq
sudo apt-get install libpq-dev

# posgresql
sudo apt-get install postgresql postgresql-contrib
sudo apt-get install postgresql-client

```

### database setup

You will need to create one database per environment that you want to be able
to use, if you want to use it just for production you need
only production database.

```
boss_development
boss_test
boss_production
```

Note: you can use any name for the db but remember these names should match the
configuration file bellow.


### configuration

There is 1 configuration files: /config/config.json for the database, a sample
file is provided as config.samle. Update the parameters according
to your db configuration and save as config.json.


#### Create the required tables

From the root of your mdk-boss

```bash
node_modules/.bin/sequelize db:migrate
node_modules/.bin/sequelize db:seed
```

after that your db is ready to start, next step configure your app so the app
knows where to find the database.

Note: if you don't specify any environment the default environment is
development and the db used will be boss_development.

If you want to use production you should initialize the db like:

```bash
NODE_ENV=production node_modules/.bin/sequelize db:migrate
NODE_ENV=production node_modules/.bin/sequelize db:seed

```

## Starting the Boss

```bash

npm install

npm start

```

### TO DO

* add stats panel
* namespacing avoiding globals in some cases
* code review by someone with node experience ;-)
