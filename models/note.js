const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    // content: String,
    content: {
        type: String,
        minLength: 4,
        required: true
    },
    important: {
        type: Boolean,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: Date
})
    
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)