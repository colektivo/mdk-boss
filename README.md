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

The second configuration file is /config/devices.json and a devices.sample is provided, is very important to have one entry per device and update the devicePath according the current path. The position is very important to do the time tracking where 1 is the first, 2 is the 2nd, and so...
The name like "entrance" is arbitrary is just to associate to a real location in the code. The lowest position will be considered as the first check-in point, and the highest will be the final.

```
{
  { "entrance": {
    "devicePath": "123:123:123",
    "position": 1
  },
  { "hall": {
    "devicePath": "456:456:456",
    "position": 2
  },
  ...  
  { "exit": {
    "devicePath": "999:999:999",
    "position": 7
  }
}

```

## usage

To access to the readers is required to have root access so is necessary to run as sudo.

```bash

npm install

sudo node boss.js

```

Open the browser on http://localhost:3000

### TO DO

* fix isReady is taking wrong data to validate
* add stats representer
* namespacing avoiding globals in some cases
* move from assert to chai to have consistency and nicer readability of the tests
* decide which to use "devicePath" or "path", currently is mixed and is confusing
* code review by someone with node experience ;-)
* fix tests
* remove console.log
