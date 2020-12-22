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

const timerUpdateStatus = 5 * 60 * 1000
jobs.updateStatus = setInterval(sendDataToServer, timerUpdateStatus)

/* Database */
const {Sequelize} = require('sequelize')
const sqlzOptions = require('config/sequelize/config.json')

const sequelize = new Sequelize(sqlzOptions)
try {
    await sequelize.authenticate();
    debug('Connection to the database has been established successfully.');
} catch (error) {
    debug('Unable to connect to the database: \n %O', error);
}

module.exports = {app, appInternal, jobs, sequelize}
