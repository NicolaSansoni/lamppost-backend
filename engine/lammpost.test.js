'use strict'

//tested module
const lamppost = require('./lamppost')

//module dependencies
const Event = require('../models/event')
jest.mock('node-fetch')
const fetch = require('node-fetch')

//test dependencies
const db = require('../test_helpers/database')
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
                    videoFile: faker.random.image()
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
                    videoUrl: faker.random.image()
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
