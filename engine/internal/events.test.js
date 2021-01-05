'use strict'

const events = require('./events')

const fs = require('fs').promises
const db = require('../../test_helpers/database')

beforeAll(async () => await db.get())
afterAll(async () => await db.release())

describe("events.update", () => {
    test("todo: 1 + 1 = 2 async", async () => {
        let res = await (async () => 1 + 1)()
        expect(res).toEqual(2)
    })
})

describe("events.deleteOlds", () => {
    test("todo: 1 * 1 != 2 async", async () => {
        let res = await (async () => 1 * 1)()
        expect(res).not.toEqual(2)
    })
})
