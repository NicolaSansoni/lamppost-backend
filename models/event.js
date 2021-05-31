const {DataTypes, Model} = require('sequelize')

const EventTypes = {
    TERMINATED: 0,
}

class Event extends Model {
    static get EventTypes() {
        return EventTypes
    }

    static initialize(sequelize) {
        Event.init({
            type: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            videoFile: {
                type: DataTypes.STRING,
                defaultValue: null,
            }
        }, {
            sequelize,
            modelName: 'Event'
        })

        return Event
    }
}

module.exports = Event
