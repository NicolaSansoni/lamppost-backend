'use strict'

const fetch = require('node-fetch')
const debug = require('debug')('llu:lamppost')
const Event = require('../models/event')
const config = require('../config/config.json')
const fs = require('fs').promises
const path = require('path')
const HttpStatus = require('http-status-codes')

const endpointUrl = `http://${config.endpoint.host}:${config.endpoint.port}/safePath/updateLamppostStatus`

const rootDir = 'ROOT' in process.env
    ? process.env.ROOT
    : path.dirname('../main.js') // same as '..' but is clearer about which dir we are choosing and why
const videosDir = `${rootDir}/${require('../config/config.json').videosDirectory}`

async function sendEvent(event) {
    const id = 1 //TODO: get it from somewhere else
    const alertId = event.type
    const videoUrl = event.videoFile

    const res = await fetch(endpointUrl, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            lamp_id: id,
            alert_id: alertId,
            // videoURL: videoUrl,
        })
    })

    if (
        'status' in res && res.status >= 300
        || 'statusCode' in res && res.statusCode >= 300
    ) {
        throw new Error(res)
    }
}

async function sendDataToServer() {

    try {

        const list = await Event.findAll({})

        await Promise.all( list.map(sendEvent) )

    } catch (e) {
        debug("Error when sending data to server: \n %O", e)
    }
}



async function requestMedia(req, res, next) {
    debug("lamppost.requestMedia called")
    let fileId = req.params.file
    const file = `${videosDir}/${fileId}`

    try {
        let data = await fs.readFile(file)
        return res.status(HttpStatus.OK).send(data)
    } catch (e) {
        next(e)
    }
}

module.exports = {sendEvent, sendDataToServer, requestMedia}
