const fetch = require('node-fetch')
const debug = require('debug')('llu:lamppost')

const endpointUrl = 'http://localhost:3000/safePath/updateLamppostStatus'

async function sendDataToServer() {
    try {
        let [
            id,
            status,
            videoUrl,
            alert,
        ] = await Promise.all([
            getId(),
            getStatus(),
            getVideoUrl(),
            getAlert()
        ])

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

        debug("%O", res)
    } catch (e) {
        debug("%s", e)
    }
}

async function getId() {
    let id = 1234
    return id
}

async function getStatus() {
    let status = 3
    return status
}
async function getVideoUrl() {
    let videoUrl = 'www.fakeUrl.com/fakeVideo'
    return videoUrl
}

async function getAlert() {
    let alert = 'fakeAlert'
    return alert
}

module.exports = {sendDataToServer}
