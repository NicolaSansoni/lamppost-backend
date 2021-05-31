'use strict'

const HttpStatus = require('http-status-codes')
const fs = require('fs').promises
const path = require('path')
const debug = require('debug')('llu: events')
const {Op} = require("sequelize");
const Event = require('../../models/event')
const lamppost = require('../lamppost')

const rootDir = 'ROOT' in process.env
    ? process.env.ROOT
    : path.dirname('../../main.js') // same as '../..' but is clearer about which dir we are choosing and why
const videosDir = `${rootDir}/${require('../../config/config.json').videosDirectory}`

module.exports.update = async function (req, res, next) {
    debug("events.update called")
    let event = null
    try {
        const eventType = req.body.eventType
        const videoFile = req.body.videoFile

        // create a db entry so that an ID is created
        event = await Event.create({
            type: eventTypeStrToInt(eventType),
            videoFile: videoFile
        })

        await event.save();

        res.status(HttpStatus.OK).send('event update successful')

    } catch (e) {
        debug("Error in Events.update")
        debug("%O", e)
        next(e)
    }
    if (event) {
        try {
            await lamppost.sendEvent(event)
        } catch (e) {
            debug("Error when sending data to server: \n %O", e)
        }
    }


    function eventTypeStrToInt(eventTypeStr) {
        switch (eventTypeStr) {
            case "illegalcross":
                return 1
            case "congestion":
                return 2
            case "onroad":
                return 3
            case "invasion":
                return 4
            case "accident":
                return 5
            case "nopark":
                return 6
            default:
                throw EvalError(`event type not recognised: ${eventTypeStr}`)
        }
    }
}

module.exports.deleteOlds = async function () {
    const ttlStr = require('../../config/config.json').events.ttl

    const hours = +ttlStr.match(/\d*(?=h)/) //"123h" => 123
    const minutes = hours * 60 + ttlStr.match(/\d+(?=m)/) //"123m" => 123
    const seconds = minutes * 60 + ttlStr.match(/\d+(?=s)/) //"123s" => 123

    const ttl = seconds * 1000 + ttlStr.match(/\d+$/) // "123s456" => 456

    // get the list of entries to delete
    const oldestAllowedTimestamp = Date.now() - ttl

    const listOlds = await Event.findAll({
        where: {
            updatedAt: {
                [Op.lt]: oldestAllowedTimestamp
            }
        }
    })

    // delete them all concurrently
    await Promise.all(listOlds.map(async item => {
        try {
            const file = item.videoFile
            try {
                await fs.unlink(file)
            } catch (e) {
                // if the file doesn't exist continue anyway
                if (e.code === "ENOENT")
                    debug("File not found: %s", file)
                else
                    { // noinspection ExceptionCaughtLocallyJS
                        throw  e
                    }
            }
            item.videoFile = null
            await item.save()
        } catch (e) {
            debug("Error when deleting old events: \n %O", e)
        }
    }))
}
