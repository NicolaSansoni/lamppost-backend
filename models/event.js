const {DataTypes, Model} = require('sequelize')
const {sequelize} = require('/app')

class Event extends Model {}

Event.init({
    agentId: {
        type: DataTypes.BIGINT,
    },
    type: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    videoFile: {
        type: DataTypes.STRING,
        unique: true,
    }
}, {
    sequelize: sequelize,
    modelName: 'Event'
})

await Event.sync()

module.exports = { Event }
