const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use('/', routes);

exports.api = functions.https.onRequest(app);
