const express = require('express');
const router = express.Router();
const { getHomeStatus, restartApp } = require('../controllers/app.controller');

router.get('/', getHomeStatus);
router.post('/restart', restartApp);

module.exports = router;
