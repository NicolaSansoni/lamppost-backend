const HttpStatus = require('http-status-codes')
const debug = require('debug')('llu: events')

async function update (req, res) {
    debug("events.update called")
    res.status(HttpStatus.OK).send('ok')
}

module.exports = {update}
