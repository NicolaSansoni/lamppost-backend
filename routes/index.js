'use strict'

const express = require('express')
const lamppost = require('../engine/lamppost')

const router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  res.send('lamppost backend')
})

router.get('/getMedia/:file', lamppost.requestMedia)

module.exports = router
