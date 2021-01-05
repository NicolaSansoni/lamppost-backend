'use strict'

class Response {
    status(statusCode) {
        this.statusCode = statusCode
        return this
    }
    send(data) {
        this.data = data
        return this
    }
}

module.exports = Response
