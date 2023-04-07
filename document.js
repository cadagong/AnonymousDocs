const Mongoose = require("mongoose")

const DocumentSchema = new Mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        trim: true
    }, 
    creator: {
        type: Mongoose.Schema.Types.ObjectId, ref: 'Student', 
        required: true, 
    },
    section: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Section' }], 
    sectionQueue: [[String]], 
    collaborators: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Student' }], 
    comments: [{ 
        comment: String, 
        date: Date, 
        user: { type: Mongoose.Schema.Types.ObjectId, ref: 'Student' }
    }]
}, { collection: "documents" })

exports.Document = Mongoose.model("Document", DocumentSchema)