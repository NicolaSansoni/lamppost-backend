'use strict'

const lamppost = require('./lamppost')

const db = require('../test_helpers/database')

jest.mock('node-fetch')
const fetch = require('node-fetch')

jest.mock('../models/event')
const Event = require('../models/event')

beforeAll(async () => await db.get())
afterAll(async () => await db.release())

describe("lamppost.sendDataToServer", () => {
    test("todo: 1 - 1 is number", async () => {
        let res = await (async () => 1 - 1)()
        expect(typeof res).toBe(typeof 12)
    })
})
