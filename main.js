const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const debug = require('debug')('llu:app')
const {Sequelize} = require('sequelize')
const {normalizePort, createServer} = require('./helpers/server')

async function main() {
    /* Database */
    const sqOptions = require('./config.json').sequelize

    let sequelize
    debug('Connecting to %s...', sqOptions.database)
    try {
        sequelize = await initSequelize(sqOptions)
        debug('Connection to the database has been established successfully.')
    } catch(error) {
        debug('Unable to connect to the database! Retrying...')

        try {
            if (sqOptions.dialect === 'mysql') {
                const mysql = require('mysql2/promise')

                debug('Creating database...')
                let [host, user, password, database] = [sqOptions.host, sqOptions.username, sqOptions.password, sqOptions.database]
                const connection = await mysql.createConnection({host, user, password})
                await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
                debug('Database %s created!', database)

                sequelize = await initSequelize(sqOptions)
                debug('Connection to the database has been established successfully.')
            }
        } catch (error) {
            // Fatal
            debug('FATAL: Unable to connect to the database!')
            throw error
        }
    }

    require('./models')(sequelize)
    await sequelize.sync()

    async function initSequelize(options) {
        const sequelize = new Sequelize(options)
        await sequelize.authenticate()
        return sequelize
    }

    /* Configuration of the server that communicates with the TCU */
    let router = require('./routes')
    const port = normalizePort(process.env.PORT || '3000')

    const app = express()

    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({extended: false}))
    app.use(cookieParser())

    app.use('/', router)

    createServer(app, port)

    /* Configuration of the server that communicates with the AI module */
    const routerInternal = require('./routes/internal')
    const portInternal = normalizePort(process.env.PORT1 || '3001')

    const appInternal = express()

    appInternal.use(logger('dev'))
    appInternal.use(express.json())
    appInternal.use(express.urlencoded({extended: false}))
    appInternal.use(cookieParser())

    appInternal.use('/', routerInternal)

    createServer(appInternal, portInternal, 'localhost')

    /* Jobs */
    const jobs = {}
    const {sendDataToServer} = require('./engine/lamppost')
    const Events = require('./engine/internal/events')

    let timer
    timer = 5 * 60 * 1000 // 5 minutes
    jobs.updateStatus = {
        job: setInterval(sendDataToServer, timer)
    }

    timer = 4 * 3600 * 1000 // 4 hours
    jobs.clearOldEvents = {
        job: setInterval(Events.deleteOlds, timer)
    }
}

main().then(() => debug("LLU Initialized"))
