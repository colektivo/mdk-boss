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

# usage

To access to the readers is required to have root access so is necessary to run as sudo.

```bash

npm install

sudo node boss.js

```

Open the browser on http://localhost:3000

### TO DO

* namespacing avoiding globals
* code review by someone with node experience ;-)

