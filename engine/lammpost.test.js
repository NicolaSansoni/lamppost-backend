'use strict'

const db = require('../test_helpers/database')

jest.mock('node-fetch')
const fetch = require('node-fetch')

jest.mock('../models/event')

// initialized in beforeAll since it requires the database to import the Model Event correctly
let lamppost
let Event

beforeAll(async () => {
    await db.get()
    lamppost = require('./lamppost')
    Event = require('../models/event')
})
afterAll(async () => await db.release())

describe("lamppost.sendDataToServer", () => {
    test("todo: 1 - 1 is number", async () => {
        let res = await (async () => 1 - 1)()
        expect(typeof res).toBe(typeof 12)
    })
})
