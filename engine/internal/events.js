'use strict'

const HttpStatus = require('http-status-codes')
const fs = require('fs/promises')
const path = require('path')
const debug = require('debug')('llu: events')
const Event = require('/models/event')
const {Op} = require("sequelize");

const rootDir = 'NODE_PATH' in process.env
    ? process.env.NODE_PATH
    : path.dirname('../../app.js') // same as '../..' but is clearer about which dir we are choosing and why
const videosDir = `${rootDir}/${require('config.json').videosDirectory}`

async function update (req, res, next) {
    debug("events.update called")
    try {
        const agentId = req.body.agentId
        const eventType = req.body.eventType
        const videoBlob = req.body.videoBlob

        // we have a new event for this agent, so the old ones have now ended
        await terminateEvents(agentId)

        // if the request is to terminate the event associated with this agent we don't have to create a new one
        // noinspection EqualityComparisonWithCoercionJS
        if (eventType != Event.EventTypes.TERMINATED) {

            // create a db entry so that an ID is created
            let event = Event.create({
                agentId: agentId,
                type: eventType
            })

            // save the video file associated to this event
            const filePath = `${videosDir}/${event.id}.mp4`

            await fs.writeFile(filePath, videoBlob)

            // now that the file is created update the db entry to reference it
            event.videoFile = filePath
            await event.save()
        }

        res.status(HttpStatus.OK).send('event update successful')

    } catch (e) {
        debug("Error in Events.update")
        debug("%O", e)
        next(e)
    }

    async function terminateEvents(agent) {

        // This should only ever find one active event but in case something
        // weird was to happen this would fix the state of the events

        const list = await Event.findAll({
            where: {
                agentId: agent,
                active: true,
            }
        })

        await Promise.all(
            list.map( async item => {
                item.active = false
                await item.save()
                return item
            })
        )
    }
}

async function deleteOlds() {
    const ttlStr = require('config.json').events.ttl

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
            },
            active: true
        }
    })

    // delete them all concurrently
    await Promise.all(listOlds.map(async item => {
        try {
            const file = `${rootDir}/${item.videoFile}`
            await fs.rm(file)
            await item.destroy()
        } catch (e) {
            debug("Error when deleting old events: \n %O", e)
        }
    }))
}
module.exports = {update, deleteOlds}
