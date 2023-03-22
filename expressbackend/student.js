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
    documents: []
}, { collection: "students" })

exports.Student = Mongoose.model("Student", StudentSchema)