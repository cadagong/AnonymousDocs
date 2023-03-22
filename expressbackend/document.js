const Mongoose = require("mongoose")

const DocumentSchema = new Mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        trim: true
    }, 
    creator: {
        type: String, 
        required: true
    },
    section: [String], 
    sectionQueue: [[String]], 
    collaborators: [], 
    comments: [{ 
        comment: String, 
        date: Date, 
        user: String
    }]
}, { collection: "documents" })

exports.Document = Mongoose.model("Document", DocumentSchema)