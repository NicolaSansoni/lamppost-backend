'use strict'

const fs = require('fs').promises
const faker = require('faker')
const db = require('../../test_helpers/database')

const Response = require('../../test_helpers/response')
const mockNext = jest.fn()

// initialized in beforeAll since it requires the database to import the Model Event correctly
let events
let Event

/*
 * If you want proper unit tests remove the initialization of the db and mock Event,
 * but know that Event is initialized when we get the database because
 * sequelize requires a db instance to create a model, so you'll need to
 * recreate it almost from scratch to make it work.
 * Also checking if the old events get terminated might be hard.
 */

beforeAll(async () => {
    await db.get()
    events = require('./events')
    Event = require('../../models/event')
})
afterAll(async () => await db.release())

describe("events.update receives a proper request", () => {

    // shared objects
    let req = {
        body: {
            agentId: faker.random.number(),
            eventType: 1,
            videoBlob: faker.random.image()
        }
    }

    let oldEvent

    let res = new Response()

    beforeAll( async () => {
        jest.clearAllMocks()
        jest.spyOn(fs, 'writeFile').mockImplementation()

        oldEvent = await Event.create({
            agentId: req.body.agentId,
            type: req.body.eventType
        })

        jest.spyOn(Event, 'create')

        // function getting tested
        await events.update(req, res, mockNext)
    })

    afterAll(() => {
        fs.writeFile.mockRestore()
        Event.create.mockRestore()
    })

    it("responds to a good request with OK", async () => {
        expect(res.statusCode).toBeGreaterThan(199)
        expect(res.statusCode).toBeLessThan(300)
    })

    it('writes the data to the filesystem', async () => {
        expect(fs.writeFile).toHaveBeenCalled()
        expect(fs.writeFile.mock.calls[0][1]).toBe(req.body.videoBlob)
    })

    it('saves the data in the database', async () => {
        expect(Event.create).toHaveBeenCalled()

        let document = await Event.create.mock.results[0].value

        let data = await Event.findByPk(document.id)
        expect(data.agentId).toBe(req.body.agentId)
        expect(data.type).toBe(req.body.eventType)
    })

    it('sets old events as inactive', async () => {
        await oldEvent.reload()
        expect(oldEvent.active).toBeFalsy()
    })
})

describe("events.update receives a bad request", () => {

    beforeAll(async () => {
        jest.clearAllMocks()
        jest.spyOn(fs, 'writeFile').mockImplementation()
        jest.spyOn(Event, 'create').mockImplementation()
    })

    afterAll(() => {
        fs.writeFile.mockRestore()
        Event.create.mockRestore()
    })

    //TODO
    // it ('should refuse if the arguments are incorrect', async () => {})
    // it ('should refuse if agentId is not a number', async () => {})
    // it ('should refuse if eventType is not a number', async () => {})
})

describe("events.deleteOlds", () => {
    //TODO
})
