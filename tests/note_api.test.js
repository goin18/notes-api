const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Note = require('../models/note')
const { response } = require('../app')

const api = supertest(app)

// tu nastavimo database za vsakratno tetsiranje
beforeEach(async () => {
    await Note.deleteMany({})
    //ročno vnašanje
    // let noteObject = new Note(helper.initialNotes[0])
    // await noteObject.save()
    // noteObject = new Note(helper.initialNotes[1])
    // await noteObject.save()

    // vrstni red ni določen!
    // const newObjects = helper.initialNotes.map( note => new Note(note))
    // const promiseArray = newObjects.map( note => note.save())
    // await Promise.all(promiseArray)

    for(let note of helper.initialNotes) {
        let noteObject = new Note(note)
        await noteObject.save()
    }

})

describe('when there is initially some notes saved', () => {
    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        }, 100000)

    test('all notes are reurned', async () => {
        const res = await api.get('/api/notes')
        expect(res.body.notes).toHaveLength(helper.initialNotes.length)
    })

    
})



test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    expect(response.body.notes).toHaveLength(helper.initialNotes.length)
})

test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')

    expect(response.body.notes[0].content).toBe('HTML is easy')

    const contents = response.body.notes.map(r => r.content)
    expect(contents).toContain('Browser can execute only JavaScript')
})

test('a valid note can be added', async() => {
    const newNote = {
        content: 'async/await simplifies making async calls',
        important: true
    }

    await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    // const response = await api.get('/api/notes')
    // const contents = response.body.notes.map(r => r.content)
    // expect(response.body.notes).toHaveLength(helper.initialNotes.length + 1)

    const notesAtEnd = await helper.notesInDB()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

    const contents = notesAtEnd.map(r => newNote.content)    
    expect(contents).toContain(
        'async/await simplifies making async calls'
    )
})

test('note without content is not added', async () => {
    const newNote = {
        important: false
    }

    await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)

    // const res = await api.get('/api/notes')
    // expect(res.body.notes).toHaveLength(helper.initialNotes.length)

    const notesAtEnd = await helper.notesInDB()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
})

test('a specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDB()
    const noteToView = notesAtStart[0]

    const resultNote = await api    
                                .get(`/api/notes/${noteToView.id}`)
                                .expect(200)
                                .expect('Content-Type', /application\/json/)
    
    expect(resultNote.body.note[0]).toEqual(noteToView)
})

test('a note can be delated', async () => {
    const notesAtStart = await helper.notesInDB()
    const noteToDelete = notesAtStart[1]

    await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)

    const noteAtTheEnd = await helper.notesInDB()

    expect(noteAtTheEnd).toHaveLength(helper.initialNotes.length - 1)

    const contents = noteAtTheEnd.map(r => r.content)
    expect(contents).not.toContain(noteToDelete.content)
})

afterAll(async () => {
    await mongoose.connection.close()
})