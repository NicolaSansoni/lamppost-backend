const express = require('express');
const Events = require("../../engine/internal/events");
const router = express.Router();

/* GET home page. */
router.post('/updateEvent', Events.update);

module.exports = router;