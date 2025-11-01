const admin = require('firebase-admin');

admin.initializeApp({
  databaseURL: "https://artfestapp-73579784-1cee7-default-rtdb.firebaseio.com"
});

const db = admin.database();

module.exports = db;