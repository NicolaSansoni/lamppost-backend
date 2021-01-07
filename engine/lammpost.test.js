'use strict'

//tested module
const lamppost = require('./lamppost')

//module dependencies
const Event = require('../models/event')
jest.mock('node-fetch')
const fetch = require('node-fetch')

//test dependencies
const db = require('../test_helpers/database')

beforeAll(async () => await db.get())
afterAll(async () => await db.release())

describe("lamppost.sendDataToServer", () => {
    test("todo: 1 - 1 is number", async () => {
        let res = await (async () => 1 - 1)()
        expect(typeof res).toBe(typeof 12)
    })
})
