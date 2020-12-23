const {DataTypes, Model} = require('sequelize')

const EventTypes = {
    TERMINATED: 0,
}

class Event extends Model {
    static get EventTypes() {
        return EventTypes
    }
}

module.exports = (sequelize) => {
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
        sequelize,
        modelName: 'Event'
    })

    module.exports = Event
    return Event
}
