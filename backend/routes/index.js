const express = require('express');
const router = express.Router();
const { getData, postData } = require('../controllers/dataController');

router.get('/data', getData);
router.post('/data', postData);

module.exports = router;
