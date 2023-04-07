const Mongoose = require("mongoose")

const SectionSchema = new Mongoose.Schema({
    title: String, 
    assignedUser: { type: Mongoose.Schema.Types.ObjectId, ref: 'Student' }, 
    text: String
}, { collection: "sections" })

exports.Section = Mongoose.model("Section", SectionSchema)