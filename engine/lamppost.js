// TODO: Decide on what package to use to send requests

async function sendDataToServer() {
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

    // TODO: POST the data to http://localhost:8080/safePath/updateLamppostStatus

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
