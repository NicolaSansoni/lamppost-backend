'use strict'

const {Sequelize} = require('sequelize')
const mysql = require('mysql2/promise')
const debug = require('debug')('llu-test:')

let options = require('../config.json').sequelize
options.database = options.database.concat('__test__')

async function initialize() {
    if (options.dialect !== 'mysql')
        throw new Error("Database dialect not supported in tests")

    try {
        debug('Creating database...')
        let [host, user, password, database] = [options.host, options.username, options.password, options.database]
        const connection = await mysql.createConnection({host, user, password})
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
        debug('Database %s created!', database)

        const sequelize = new Sequelize(options)
        await sequelize.authenticate()

        debug('Connection to the test database has been established successfully.')

        require('../models')(sequelize)
        await sequelize.sync()

    } catch (error) {
        // Fatal
        debug('FATAL: Unable to connect to the test database!')
        throw error
    }
}

async function drop() {
    if (options.dialect !== 'mysql')
        throw new Error("Database dialect not supported in tests")

    debug('Creating database...')
    let [host, user, password, database] = [options.host, options.username, options.password, options.database]
    const connection = await mysql.createConnection({host, user, password})
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\`;`)
    debug('Database %s dropped!', database)
}

module.exports = {
    init: initialize,
    drop: drop,
}
