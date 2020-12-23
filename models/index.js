'use strict'

let fs       = require('fs')
let path     = require('path')
let basename = path.basename(__filename)

module.exports = (sequelize) => {
    fs.readdirSync(__dirname)
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
        })
        .forEach(file => require(path.join(__dirname, file))(sequelize))
}
