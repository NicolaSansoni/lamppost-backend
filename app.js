const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

/* Configuration of the server that communicates with the TCU */
const indexRouter = require('./routes')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)

/* Configuration of the server that communicates with the AI module */
const internalRouter = require('./routes/internal')

const appInternal = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', internalRouter)

/* Jobs */
const jobs = {}

const {sendDataToServer} = require('./engine/lamppost')

const timerUpdateStatus = 5 * 60 * 1000

jobs.updateStatus = setInterval(sendDataToServer, timerUpdateStatus)

module.exports = {app, appInternal, jobs}