'use strict'

const {Sequelize} = require('sequelize')
const debug = require('debug')('llu-test:')

let options = require('config.json').sequelize
options.database = options.database.concat('__test__')

const sequelize = new Sequelize(options)
try {
    await sequelize.authenticate();
    debug('Connection to the test database has been established successfully.');
} catch (error) {
    debug('Unable to connect to the test database!')
    throw error
}

module.exports = {sequelize}
