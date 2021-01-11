'use strict'

//tested module
const lamppost = require('./lamppost')

//module dependencies
const Event = require('../models/event')
jest.mock('node-fetch')
const fetch = require('node-fetch')
const configMock = require('../test_helpers/config.json')
jest.mock('../config/config.json', () => configMock, {virtual: true})

//test dependencies
const db = require('../test_helpers/database')
const Response = require('../test_helpers/response')
const faker = require('faker')

beforeAll(async () => await db.get())
afterAll(async () => await db.release())

describe("lamppost.sendDataToServer", () => {

    beforeEach(async () => {
        jest.clearAllMocks()
        await Event.sync({force: true})
    })

    it("should send a correct request for each event", async (done) => {
        // noinspection JSUnusedLocalSymbols
        fetch.mockImplementation( async (url, opts) => {
            return {
                statusCode: 200
            }
        })

        const numOfEvents = 3

        let promises = []
        for (let i = 0; i < numOfEvents; i++) {
            promises.push(
                Event.create({
                    agentId: faker.random.number(),
                    type: faker.random.number(),
                    videoFile: faker.system.fileName()
                })
            )
        }
        await Promise.all(promises)

        await lamppost.sendDataToServer()

        expect(fetch).toBeCalledTimes(numOfEvents)
        for (const call of fetch.mock.calls) {
            expect(call[1]).toMatchObject({
                method: expect.stringMatching(/post/i),
                body: expect.any(String),
            })
            let body = JSON.parse(call[1].body)
            expect(body).toMatchObject({
                id: expect.any(Number),
                status: expect.any(Number),
                videoUrl: expect.any(String),
                alert_type: expect.any(String)
            })
        }

        done()
    })

    it("should handle a bad response without throwing", async (done) =>{
        // noinspection JSUnusedLocalSymbols
        fetch.mockImplementation( async (url, opts) => {
            return {
                statusCode: 500
            }
        })

        const numOfEvents = 3

        let promises = []
        for (let i = 0; i < numOfEvents; i++) {
            promises.push(
                Event.create({
                    agentId: faker.random.number(),
                    type: faker.random.number(),
                    videoFile: faker.system.fileName()
                })
            )
        }
        await Promise.all(promises)

        jest.spyOn(lamppost, 'sendDataToServer')
        await lamppost.sendDataToServer()

        expect(lamppost.sendDataToServer).not.toThrow()

        done()
    })
})

describe('lamppost.requestMedia', () => {

    const fs = require('fs').promises
    const path = require('path')
    const rootDir = 'ROOT' in process.env
        ? process.env.ROOT
        : path.dirname('../main.js') // same as '..' but is clearer about which dir we are choosing and why
    const videosDir = `${rootDir}/${configMock.videosDirectory}`

    const mockNext = jest.fn()

    beforeAll(async () => {
        //create media dir
        try {
            await fs.mkdir(videosDir)
        } catch (e) {
            // if the directory exists already we dont care, otherwise throw
            if (e.code !== 'EEXIST')
                throw e
        }
    })
    afterAll( async () => {
        //delete media dir
        await fs.rmdir(videosDir)
    })

    beforeEach(async () => {
        jest.clearAllMocks()
        await Event.sync({force: true})
    })
    afterEach( async () => {
        //clear media dir
        let files = await fs.readdir(videosDir)
        for (const file of files) {
            const filePath = path.join(videosDir, file)
            await fs.unlink(filePath)
        }
    })

    it("should return the data", async () => {
        let file = faker.random.alphaNumeric()
        let event = await Event.create({
            agentId: faker.random.number(),
            type: 1,
            videoFile: file
        })

        let mediaBuffer = await fs.readFile("../test_helpers/a.png")
        await fs.writeFile(`${videosDir}/${file}`, mediaBuffer)

        let res = new Response()

        await lamppost.requestMedia({params: file}, res, mockNext)

        expect(mockNext).not.toBeCalled()
        expect(res.statusCode).toBeLessThan(300)
        expect(res.data).toEqual(mediaBuffer)
    })
})
