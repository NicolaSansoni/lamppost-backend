const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const debug = require('debug')('llu:app')

/* Configuration of the server that communicates with the TCU */
const indexRouter = require('./routes')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)

/* Configuration of the server that communicates with the AI module */
const internalRouter = require('/routes/internal')

const appInternal = express()

appInternal.use(logger('dev'))
appInternal.use(express.json())
appInternal.use(express.urlencoded({ extended: false }))
appInternal.use(cookieParser())

appInternal.use('/', internalRouter)

/* Jobs */
const jobs = {}
const {sendDataToServer} = require('./engine/lamppost')
const Events = require('/engine/internal/events')

jobs.updateStatus = {
    timer: 5 * 60 * 1000, // 5 minutes
    job: setInterval(sendDataToServer, this.timer)
}

jobs.clearOldEvents = {
    timer: 4 * 3600 * 1000, // 4 hours
    job: setInterval(Events.deleteOlds, this.timer)
}

/* Database */
const {Sequelize} = require('sequelize')
const sqlzOptions = require('/config.json').sequelize

const sequelize = new Sequelize(sqlzOptions)
try {
    await sequelize.authenticate();
    debug('Connection to the database has been established successfully.')
} catch (error) {
    debug('Unable to connect to the database!')
    throw error
}

module.exports = {app, appInternal, jobs, sequelize}
