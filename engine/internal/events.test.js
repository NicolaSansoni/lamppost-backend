'use strict'

//tested module
const events = require('./events')

//module dependencies
const fs = require('fs').promises
const Event = require('../../models/event')

//test dependencies
const faker = require('faker')
const db = require('../../test_helpers/database')
const Response = require('../../test_helpers/response')
const mockNext = jest.fn()



/*
 * If you want proper unit tests remove the initialization of the db and mock Event,
 * but know that Event is initialized when we get the database because
 * sequelize requires a db instance to create a model, so you'll need to
 * recreate it almost from scratch to make it work.
 * Also checking if the old events get terminated might be hard.
 */

beforeAll(async () => await db.get())
afterAll(async () => {
    await Event.drop()
    await db.release()
})

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
        await Event.sync({ force: true })

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

        expect(mockNext).not.toBeCalled()
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
        jest.spyOn(fs, 'writeFile').mockImplementation()
        jest.spyOn(Event, 'create')
    })

    afterAll(() => {
        fs.writeFile.mockRestore()
        Event.create.mockRestore()
    })

    beforeEach( async () => {
        jest.clearAllMocks()
        await Event.sync({force: true})
    } )

    it ('should refuse if the arguments are incorrect', async () => {
        let req = {
            body: {
                id: faker.random.number(), //agentId
                type: 1,                   //eventType
                data: faker.random.image() //videoBlob
            }
        }
        let res = new Response()
        await events.update(req, res, mockNext)

        let table = await Event.findAll()

        expect(mockNext).toBeCalled()
        expect(table).toHaveLength(0)
    })

    it ('should refuse if agentId is not a number', async () => {
        let req = {
            body: {
                agentId: faker.name.firstName(),
                eventType: 1,
                videoBlob: faker.random.image()
            }
        }
        let res = new Response()
        await events.update(req, res, mockNext)

        let table = await Event.findAll()

        expect(mockNext).toBeCalled()
        expect(table).toHaveLength(0)
    })

    it ('should refuse if eventType is not a number', async () => {
        let req = {
            body: {
                agentId: faker.random.number(),
                eventType: "crash",
                videoBlob: faker.random.image()
            }
        }
        let res = new Response()
        await events.update(req, res, mockNext)

        let table = await Event.findAll()

        expect(mockNext).toBeCalled()
        expect(table).toHaveLength(0)
    })
})

describe("events.deleteOlds", () => {
    beforeEach(async () => {
        jest.clearAllMocks()
        await Event.sync({force: true})
    })

    it("should delete old inactive events", async () => {
        let oldEvent = await Event.create({
            agentId: faker.random.number(),
            type: 1,
            active: false,
        })

        await Event.update({
            createdAt: new Date(0), // time for some Disco music!
            updatedAt: new Date(0), // feeling Funky!
        }, {
            where: {
                id: oldEvent.id
            },
            silent: true //needed to stop the db from auto updating 'updatedAt'
        })

        await events.deleteOlds()

        let table = await Event.findAll()

        expect(table).toHaveLength(0)
    })

    it("should not delete active events, no matter how old", async () => {
        let oldEvent = await Event.create({
            agentId: faker.random.number(),
            type: 1,
            active: true,
        })

        await Event.update({
            createdAt: new Date(0), // only 3 years for the best Pink Floyd's Album!
            updatedAt: new Date(0), // and only 2 years for an offer he can't refuse!
        }, {
            where: {
                id: oldEvent.id
            },
            silent: true //needed to stop the db from auto updating 'updatedAt'
        })

        await events.deleteOlds()

        let table = await Event.findAll()

        expect(table).toHaveLength(1)
    })
})
