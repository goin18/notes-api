const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const bcrypt = require('bcrypt')
const User = require('../models/user')
// const { application } = require('express')

const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('Test123', 10)
        const user = new User({ 
            username: 'root', 
            passwordHash,
            name: 'RootUser'
        })

        const user2 = new User({ 
            username: 'root2', 
            passwordHash,
            name: 'RootUser2'
        })

        await user.save()
        await user2.save()
    })

    test('creation succeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'newUsername',
            password: 'Test123',
            name: 'Test User'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersArEnd = await helper.usersInDB()
        expect(usersArEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersArEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper straturecode and message if username alredy taken', async () => {
        const usersArStart = await helper.usersInDB()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'Test123'
        }

        const result = await api
                            .post('/api/users')
                            .send(newUser)
                            .expect(400)
                            .expect('Content-Type', /application\/json/)
    })

    test('users are returned as json', async () => {
        const res = await api
                        .get('/api/users')
                        .expect(200)
                        .expect('Content-Type', /application\/json/)
        
            expect(res.body.users).toHaveLength(2)
    })
})

afterAll( async () => {
    await mongoose.connection.close()
})