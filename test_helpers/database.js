'use strict'

// quick settings
const CREATE = true
const DROP = true

const {Sequelize} = require('sequelize')
const mysql = require('mysql2/promise')
const debug = require('debug')('llu-test:')

let options = require('../test_helpers/config.json').sequelize
options.database = options.database.concat(process.pid)

let instance = null
let uses = 0

async function getInstance() {

    uses++

    // singleton behaviour
    if (uses > 1) {
        while (!instance) {
            // wait
            await new Promise(() => setTimeout(() => null))
        }
        return instance
    }

    debug("These tests require a database to be open and listening to work.")

    try {
        if (CREATE) {
            // raw database creation
            if (options.dialect !== 'mysql')
                debug("Database dialect not fully supported in tests. Cannot create.")
            else {
                debug('Creating database...')
                let [host, user, password, database] = [options.host, options.username, options.password, options.database]
                const connection = await mysql.createConnection({host, user, password})
                await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
                connection.end()
                debug('Database %s created!', database)
            }
        }

        // orm connection
        const sequelize = new Sequelize(options)
        await sequelize.authenticate()

        debug('Connection to the test database has been established successfully.')

        // sync models
        require('../models')(sequelize)
        await sequelize.sync()

        instance = sequelize

    } catch (error) {
        // Fatal
        uses--
        debug('FATAL: Unable to connect to the test database!')
        instance = null
        throw error
    }
}

async function release() {

    uses--

    if (uses === 0) {

        debug('Closing the connection to the database...')

        await instance.close()
        instance = null

        if (DROP) {
            // raw database drop
            if (options.dialect !== 'mysql')
                throw new Error("Database dialect not supported in tests. Cannot drop.")

            debug('Dropping database...')
            let [host, user, password, database] = [options.host, options.username, options.password, options.database]
            const connection = await mysql.createConnection({host, user, password})
            await connection.query(`DROP DATABASE IF EXISTS \`${database}\`;`)
            connection.end()
            debug('Database %s dropped!', database)
        }
    }
}

module.exports = {
    get: getInstance,
    release
}
