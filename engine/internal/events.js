const HttpStatus = require('http-status-codes')
const debug = require('debug')('llu: events')
const Event = require('/models/event')

async function update (req, res, next) {
    debug("events.update called")
    try {
        const agentId = req.body.agentId
        const eventType = req.body.eventType
        const videoBlob = req.body.videoBlob

        // TODO

        res.status(HttpStatus.OK).send('update successful')
    } catch (e) {
        debug("Error in Events.update")
        debug("%O", e)
        next(e)
    }
}

module.exports = {update}
