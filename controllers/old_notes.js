const { request } = require('express')

const notesRouter = require('express').Router()
const Note = require('../models/note')

const { info } = require('../utils/logger')
// const { requestLogger } = require('../utils/middleware')

notesRouter.get('/', (req, res) => {
    Note.find({}).then( notes => {
        res.json({
                    notes: notes,
                    type: 'Get'
                })
    })
})

notesRouter.get('/:id', (req, res, next) => {
    Note.findById(req.params.id)
        .then(note => {
            if (note) {
                res.json({
                    note: [note],
                    type: 'Get:ID'
                })
            } else {
                res.status(404).json({
                    notes: [],
                    status: {
                        'error':'Data not found!',
                        'code': 404
                    }
                    
                })
            }
        })
        .catch(error => next(error))
})

notesRouter.post('/', (req, res, next) => {
    const body = req.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    info(note)

    note.save().then(savedNode => {
        res.json({
            note: savedNode, 
            type: 'POST'
        })
        // Note.find({}).then(notes => {
        //     res.json(notes)
        // })
    })
    .catch(error => next(error))
})

notesRouter.delete('/:id', (req, res, next) => {
    Note.findByIdAndRemove(req.params.id)
    .then( result => {
        console.log(result);
        res.status(204).json({
            type: 'DELETE'
        })
    })
    .catch(error => next(error))
})

notesRouter.put('/:id', (req, res, next) => {
    const body = req.body
    const { content, important } = req.body

    Note.findByIdAndUpdate(
        req.params.id, 
        {content, important},
        { new: true, runValidators: true, context: 'query'} )
        .then( updateNode => {
            res.json({
                    updateNode
            })  // --> vrne samo updatano
            // Note.find({}).then(notes => {
            //     res.json(notes)
            // })
        })
        .catch(error => next(error))
})

module.exports = notesRouter