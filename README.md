[![Dependency Status](http://david-dm.org/colektivo/mdk-boss.svg)](http://david-dm.org/colektivo/mdk-boss)

# Mdk-Boss

The Boss will be responsible to make you efficient moving around the museum tracking your time and pointing you how much money are you wasting.
The Boss Node app will be capturing the cards ids from the reader from different locations and store into a database.

### Requirements

node.js v0.8 (maybe node legacy)
libudev-dev (Linux only)
libusb-1.0-0-dev (Ubuntu versions missing libusb.h only)
git
npm
posgresql

### Installing on ubuntu

Due that the computer to be installed is not powerful enough to run everything on a VM the configuration was not automated with docker or vagrant.

```
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

### configuration

There are 2 configuration files: /config/config.json for the database, a sample file is provided as config.samle. Update the parameters according to your db configuration and save as config.json.

#### Configure the devices

The configuration of the devices is done through the employee module.

## usage

To access to the readers is required to have root access so is necessary to run as sudo.

```bash

npm install

npm start

```

### TO DO

* add test to scripts with test environment to avoid using dev environment for tests
* add stats representer
* namespacing avoiding globals in some cases
* decide which to use "devicePath" or "path", currently is mixed and is confusing
* code review by someone with node experience ;-)
* remove console.log
