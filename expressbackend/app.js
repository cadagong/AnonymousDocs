const Express = require("express")
const JWToken = require("jsonwebtoken")
const BodyParser = require("body-parser")
const BCrypt = require("bcryptjs")
const Mongoose = require("mongoose")

require("dotenv").config();

const DB_URL = process.env.DB_URL
const SECRET_CODE = process.env.SECRET_CODE
const SERVER_PORT = parseInt(process.env.SERVER_PORT)
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const TOKEN_EXP_SECS = parseInt(process.env.TOKEN_EXP_SECS)

let signToken = (student) => {
    return JWToken.sign({ 
        id: student._id.toString()
    }, SECRET_CODE, { // default SHA256
        expiresIn: TOKEN_EXP_SECS 
    })
}

let checkToken = (req) => {
    return new Promise((res, rej) => {
        if (req.headers && req.headers.authorization) {
            let auth = req.headers.authorization.split(' ')[1];
            let decoded
            try {
                decoded = JWToken.verify(auth, SECRET_CODE)
            } catch (e) {
                rej(e)
                return
            }
            let stid = decoded.id
            StudentDAO.Student.findOne({ _id: stid })
            .then((s) => {
                res(s)
            })
            .catch((err) => {
                rej("wrong token")
            })
        } else{
            rej("no token submitted")
        }
    })
}

const app = Express()
app.use(BodyParser.json())

try {
    Mongoose.connect(DB_URL, 
        { useNewUrlParser: true, useUnifiedTopology: true })
} catch (err) {
    console.log(err);
}


const StudentDAO = require("./student")
const DocumentDAO = require("./document")
app.listen(SERVER_PORT, () => {
    console.log("server up at " + SERVER_PORT)
})
app.post("/user/signup", (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, error: "signup info not complete"})
        return
    }
    // TODO: username and password invalid
    let p = BCrypt.hashSync(req.body.password, SALT_ROUNDS)
    StudentDAO.Student.create({
        username: req.body.username, 
        password: p
    }).then((student) => {
        res.json({ success: true, token: signToken(student) })
    }).catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.get("/user/login", (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, error: "login info not complete"})
        return
    }
    StudentDAO.Student.findOne({ username: req.body.username })
    .then((student) => {
        if (!student) {
            res.json({ success: false, error: "user not exist"})
            return
        }
        if (!BCrypt.compareSync(req.body.password, student.password)) {
            res.json({ success: false, error: "wrong pass" })
            return
        }
        delete student.password;
        res.json({ success: true, token: signToken(student), user: student })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.post("/user/delete", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (student.documents.length > 0) {
            res.json({ success: false, error: "please quit from all documents before deleting" })
        }
        StudentDAO.Student.findByIdAndDelete(student._id).then((studentdel) => {
            delete studentdel.password;
            res.json({ success: true, error: "user delete success", user: studentdel })
        }).catch((err) => {
            res.json({ success: false, error: "user delete failed" })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.post("/document/create", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.title) {
            res.json({ success: false, error: "document must have title" })
            return
        }
        DocumentDAO.Document.create({
            title: req.body.title, 
            creator: student._id.toString()
        }).then((doc) => {
            student.documents.push(doc._id.toString())
            student.save().then((ssv) => {
                res.json({ success: true, document: doc })
            }).catch((err) => {
                res.json({ success: false, error: err })
            })
        }).catch((err) => {
            res.json({ success: false, error: err })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

let coUpdateStudentDocument = (res, student, doc, revertDocument) => {
    let prevComments = doc.comments
    doc.comments = doc.comments.filter(comment => comment.user != student._id)
    doc.save().then((dsv) => {
        student.save().then((ssv) => {
            res.json({ success: true, document: dsv, student: ssv })
        }).catch((err2) => {
            doc.comments = prevComments
            revertDocument(doc)
            doc.save().then((dreverted) => {
                res.json({ success: false, error: "doc update reverted, user update failed" })
            }).catch((err) => {
                res.json({ success: false, error: "doc update not reverted, user update failed" })
            })
        })
    }).catch((err) => {
        res.json({ success: false, error: "doc update failed" })
    })
}

app.post("/document/invite", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id || !req.body.collaborator) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ _id: req.body.id })
        .then((doc) => {
            if (doc.creator !== student._id.toString()) {
                res.json({ success: false, error: "unauthd access" })
                return
            }
            StudentDAO.Student.findOne({ username: req.body.collaborator }).then((collabo) => {
                if (collabo._id.toString() == student._id.toString()) {
                    res.json({ success: false, error: "u wonna become both?" })
                    return
                }
                if (collabo.documents.includes(doc._id.toString())) {
                    res.json({ success: false, error: "double join?" })
                } else {
                    collabo.documents.push(doc._id)
                    doc.collaborators.push(collabo._id)
                }
                return coUpdateStudentDocument(res, collabo, doc, (docr) => {
                    docr.collaborators.pop()
                })
            }).catch((err) => {
                res.json({ success: false, error: "cannot find collaborator" })
            })
        })
        .catch((err) => {
            res.json({ success: false, error: err })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

let quitADoc = (res, student, doc) => {
    if (!student.documents.includes(doc._id.toString())) {
        res.json({ success: false, error: "not joined" })
        return
    }
    let idx = student.documents.indexOf(doc._id.toString())
    if (idx > -1) {
        student.documents.splice(idx, 1);
    }
    // creator
    if (doc.creator == student._id) {
        if (doc.collaborators.length > 0) {
            // promote the first collaborator as the next creator
            let nextCreator = doc.collaborators.shift()
            doc.creator = nextCreator
            return coUpdateStudentDocument(res, student, doc, (docr) => {
                docr.collaborators.unshift(nextCreator)
                docr.creator = student._id.toString()
            })
        } else {
            // remove doc
            student.save().then((ssv) => {
                DocumentDAO.Document.findByIdAndDelete(doc._id).then((docdel) => {
                    res.json({ success: true, document: docdel, user: ssv })
                }).catch((err) => {
                    student.documents.push(doc._id.toString())
                    student.save().then((ssrv) => {
                        res.json({ success: false, error: "doc delete failed, user revert success" })
                    }).catch((err3) => {
                        res.json({ success: false, error: "doc delete failed, user revert failed" })
                    })
                })
            }).catch((err) => {
                res.json({ success: false, error: "user save failed" })
            })
        }
    } else {
        // collaborator, just remove
        let idx = student.documents.indexOf(doc._id.toString())
        if (idx > -1) {
            student.documents.splice(idx, 1);
        }
        idx = doc.collaborators.indexOf(student._id.toString())
        if (idx < 0) {
            res.json({ success: false, error: "document db link inconsistent error"})
            return
        } else {
            doc.collaborators.splice(idx, 1)
        }
        return coUpdateStudentDocument(res, student, doc, (docr) => {
            docr.collaborators.push(student._id.toString())
        })
    }
}

app.post("/document/quit", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ _id: req.body.id })
        .then((doc) => {
            return quitADoc(res, student, doc)
        })
        .catch((err) => {
            res.json({ success: false, error: err })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.get("/document/view1", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ _id: req.body.id })
        .then((doc) => {
            if (student.documents.includes(doc._id.toString())) {
                res.json({ success: true, error: doc })
            } else {
                res.json({ success: false, error: "unauth access 2 doc" })
            }
        })
        .catch((err) => {
            res.json({ success: false, error: err })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.get("/document/viewall", (req, res) => {
    checkToken(req)
    .then((student) => {
        DocumentDAO.Document.find({
            '_id': { $in: student.documents }
        }).then((docsFound) => {
            res.json({ success: true, error: docsFound })
        }).catch((err) => {
            res.json({ success: false, error: "2" })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: "3" })
    })
})

app.post("/document/comment", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id || !req.body.comment) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ _id: req.body.id })
        .then((doc) => {
            if (student.documents.includes(doc._id.toString())) {
                doc.comments.push({
                    user: student.username, 
                    comment: req.body.comment, 
                    date: Date.now()
                })
                doc.save().then((docsv) => {
                    res.json({ success: true, error: docsv })
                }).catch((errd) => {
                    res.json({ success: false, error: "cannot add new section" })
                })
            } else {
                res.json({ success: false, error: "unauth access 2 doc" })
            }
        })
        .catch((err) => {
            res.json({ success: false, error: err })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.post("/document/createsection", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ _id: req.body.id })
        .then((doc) => {
            if (student.documents.includes(doc._id.toString())) {
                doc.section.push("")
                doc.sectionQueue.push([])
                doc.save().then((docsv) => {
                    res.json({ success: true, error: docsv })
                }).catch((errd) => {
                    res.json({ success: false, error: "cannot add new section" })
                })
            } else {
                res.json({ success: false, error: "unauth access 2 doc" })
            }
        })
        .catch((err) => {
            res.json({ success: false, error: err })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.post("/document/writesection", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id || (req.body.sectionid == undefined) || !req.body.sectiontext) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ _id: req.body.id })
        .then((doc) => {
            if (student.documents.includes(doc._id.toString())) {
                doc.section[req.body.sectionid] = req.body.sectiontext;
                doc.save().then((docsv) => {
                    res.json({ success: true, error: docsv })
                }).catch((errd) => {
                    res.json({ success: false, error: "cannot add new section" })
                })
            } else {
                res.json({ success: false, error: "unauth access 2 doc" })
            }
        })
        .catch((err) => {
            res.json({ success: false, error: err })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})