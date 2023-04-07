
const Mongoose = require("mongoose")

const SectionSchema = new Mongoose.Schema({
    title: String, 
    assignedUser: String, 
    text: String
}, { collection: "sections" })

exports.Section = Mongoose.model("Section", SectionSchema)