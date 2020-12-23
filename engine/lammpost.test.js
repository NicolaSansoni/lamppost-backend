'use strict'

const lamppost = require('./lamppost')

jest.mock('node-fetch')
const fetch = require('node-fetch')

jest.mock('/models/event')
const Event = require('/models/event')
