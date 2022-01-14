Draughts
========

This is an implementation of international draughts for CSE1300. It supports all of the following
features:

 - Multiple concurrent games via online multiplayer
 - Resigning from a game
 - Detection of users disconnections
 - Forced piece captures (as per the official regulations)
 - Piece capture deltas
 - King pieces
 - Viewable game history
 - An incredibly simple and usable interface
 - Far more comments than you have ever written

The following features are missing (and probably won't get added due to time constraints):

 - Detection of game draws
 - Timers


Setup
-----

To setup the draughts server for your own use, you need to run the following commands:

```sh
git clone "git@github.com:MayteSteeghs/draughts.git"  # Clone the repository
cd draughts/draughts                                  # Navigate to the repo
npm install                                           # Install dependencies
npm start                                             # Start the server
```

By default the server will be serving locally on port 3000. If you want to configure this, you can
figure out which parts of the code you need to change with the following command:

```sh
grep -R --exclude-dir=node_modules/ 3000
```


Authors
-------

Mayte Steeghs && Thomas Voss
