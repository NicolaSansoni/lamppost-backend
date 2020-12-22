const {DataTypes, Model} = require('sequelize')
const {sequelize} = require('/app')

const EventTypes = {
    TERMINATED: 0,
}

class Event extends Model {
    static get EventTypes() {
        return EventTypes
    }
}

Event.init({
    agentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    type: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    videoFile: {
        type: DataTypes.STRING,
        unique: true,
        defaultValue: null,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    sequelize: sequelize,
    modelName: 'Event'
})

await Event.sync()

module.exports = Event
