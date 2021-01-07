'use strict'

const fetch = require('node-fetch')
const debug = require('debug')('llu:lamppost')
const Event = require('../models/event')
const config = require('../config.json')

const endpointUrl = `http://${config.endpoint.host}:${config.endpoint.port}/safePath/updateLamppostStatus`

module.exports.sendDataToServer = async function () {

    try {

        const list = await Event.findAll({
            where: { active: true }
        })

        await Promise.all( list.map(sendEvent) )

    } catch (e) {
        debug("Error when sending data to server: \n %O", e)
    }

    async function sendEvent(event) {
        const id = event.agentId
        const status = event.type
        // TODO: handle video URLs better
        const videoUrl = event.videoFile
        const alert = 'event'

        const res = await fetch(endpointUrl, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: id,
                status: status,
                videoUrl: videoUrl,
                alert_type: alert,
            })
        })

        if (
            'status' in res && res.status >= 300
            || 'statusCode' in res && res.statusCode >= 300
        ) {
            throw new Error(res)
        }
    }
}
