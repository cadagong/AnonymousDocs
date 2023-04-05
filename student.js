const Mongoose = require("mongoose")

const StudentSchema = new Mongoose.Schema({
    username: {
        type: String, 
        unique: true, 
        required: true, 
        lowercase: true, 
        trim: true
    }, 
    password: {
        type: String, 
        required: true
    }, 
    documents: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Document' }]
}, { collection: "students" })

exports.Student = Mongoose.model("Student", StudentSchema)