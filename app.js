const Express = require("express")
const JWToken = require("jsonwebtoken")
const BodyParser = require("body-parser")
const BCrypt = require("bcryptjs")
const Mongoose = require("mongoose")
const Path = require("path")
const ejs = require('ejs');

require("dotenv").config();

const DB_URL = process.env.DB_URL
const SECRET_CODE = process.env.SECRET_CODE
const SERVER_PORT = parseInt(process.env.SERVER_PORT)
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const TOKEN_EXP_SECS = parseInt(process.env.TOKEN_EXP_SECS)

// strong password: https://www.section.io/engineering-education/password-strength-checker-javascript/
// The password is at least 8 characters long (?=.{8,}).

// The password has at least one uppercase letter (?=.*[A-Z]).

// The password has at least one lowercase letter (?=.*[a-z]).

// The password has at least one digit (?=.*[0-9]).

// The password has at least one special character ([^A-Za-z0-9]).
let passwordTester = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/
let usernameTester = /^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$/

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
            let decoded;
            try {
                decoded = JWToken.verify(auth, SECRET_CODE)
            } catch (e) {
                rej(e)
                return
            }
            let stid = decoded.id
            StudentDAO.Student.findOne({ _id: stid })
            .select("-password")
            .then((s) => {
                res(s)
            })
            .catch((err) => {
                rej("wrong token")
            })
        } 
        else if (req.query && req.query.token) {
            let auth = req.query.token;
            let decoded;
            try {
                decoded = JWToken.verify(auth, SECRET_CODE)
            } catch (e) {
                rej(e)
                return
            }
            let stid = decoded.id
            StudentDAO.Student.findOne({ _id: stid })
            .select("-password")
            .then((s) => {
                res(s)
            })
            .catch((err) => {
                rej("wrong token")
            })
        }
        else{
            rej("no token submitted")
        }
    })
}

const app = Express()

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set("views", Path.join(__dirname, "/client/html"));
app.use(Express.static(Path.join(__dirname, "/client")));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));


try {
    Mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
} catch (err) {
    console.log(err);
}


const StudentDAO = require("./student")
const DocumentDAO = require("./document")
const SectionDAO = require("./section")


app.listen(SERVER_PORT, () => {
    console.log("server up at " + SERVER_PORT)
})


app.get("/", (req, res) => {
    res.sendFile(Path.join(__dirname, "/client/html/homepage.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(Path.join(__dirname, "/client/html/login.html"))
})

app.get("/sign-up", (req, res) => {
    res.sendFile(Path.join(__dirname, "/client/html/sign-up.html"))
})

app.get("/dashboard", (req, res) => {
    res.sendFile(Path.join(__dirname, "/client/html/dashboard.html"))
})

app.get("/editor", (req, res) => {
    // console.log(req);
    checkToken(req)
    .then((student) => {
        res.render('editor', { docId: req.query.docId, filename: req.query.docName });
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})


app.post("/user/signup", (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, error: "signup info not complete"})
        return
    }
    // TODO: username and password invalid
    let password = req.body.password
    if (!passwordTester.test(password)) {
        res.json({ success: false, error: "Password too simple"})
        return
    }
    let username = req.body.username
    if (!usernameTester.test(username)) {
        res.json({ success: false, error: "Username only contains alphanumeric and underscore"})
        return
    }
    let p = BCrypt.hashSync(password, SALT_ROUNDS)
    StudentDAO.Student.create({
        username: username, 
        password: p
    }).then((student) => {
        res.json({ success: true, token: signToken(student) })
    }).catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.post("/user/login", (req, res) => {
    // console.log(req.body);
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, error: "login info not complete"})
        // res.sendFile(Path.join(__dirname, "/client/html/editor.html"))
        return
    }
    StudentDAO.Student.findOne({ username: req.body.username })
    .then((student) => {
        if (!student) {
            // res.sendFile(Path.join(__dirname, "/client/html/login.html"))
            res.json({ success: false, error: "Username does not exist."})
            return
        }
        if (!BCrypt.compareSync(req.body.password, student.password)) {
            // res.sendFile(Path.join(__dirname, "/client/html/login.html"))
            res.json({ success: false, error: "Wrong password." })
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
            creator: new Mongoose.Types.ObjectId(student._id)
        }).then((doc) => {
            console.log(student.creator)
            student.documents.push(doc._id)
            doc.creator = student._id
            student.save().then((ssv) => {
                doc.save().then((sdoc) => {
                    res.json({ success: true, document: doc })
                }).catch((err) => {

                })
                
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
    let prevSections = doc.section
    
    let sections2del = doc.section.filter(sec => sec.assignedUser.toString() === student._id.toString()).map((s) => s._id)
    doc.comments = doc.comments.filter(comment => comment.user.toString() !== student._id.toString())
    doc.section = doc.section.filter(sec => sec.assignedUser.toString() !== student._id.toString())    
    doc.save().then((dsv) => {
        student.save().then((ssv) => {
            SectionDAO.Section.deleteMany({ _id: { $in: sections2del } }).then((secs) => {
                res.json({ success: true, document: dsv, student: ssv, sections: secs })
            }).catch((err) => {
                res.json({ success: false, error: "sections delete failed" })
            })
        }).catch((err2) => {
            doc.comments = prevComments
            doc.section = prevSections
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
        DocumentDAO.Document.findOne({ 
            $and: [
                {
                    _id: req.body.id, 
                }, 
                {
                    creator: student._id
                }
            ]
        })
        .then((doc) => {
            if (doc.creator.toString() !== student._id.toString()) {
                res.json({ success: false, error: "unauthd access" })
                return
            }
            StudentDAO.Student.findOne({ username: req.body.collaborator.toString() }).then((collabo) => {
                if (collabo._id.toString() === student._id.toString()) {
                    res.json({ success: false, error: "u wonna become both?" })
                    return
                }
                if (collabo.documents.includes(doc._id.toString())) {
                    res.json({ success: false, error: "double join?" })
                } else {
                    collabo.documents.push(doc._id)
                    doc.collaborators.push(collabo._id)
                }
                doc.save().then((dsv) => {
                    collabo.save().then((ssv) => {
                        res.json({ success: true, document: dsv })
                    }).catch((err2) => {
                        doc.collaborators.pop()
                        doc.save().then((dreverted) => {
                            res.json({ success: false, error: "doc update reverted, user update failed" })
                        }).catch((err) => {
                            res.json({ success: false, error: "doc update not reverted, user update failed" })
                        })
                    })
                }).catch((err) => {
                    res.json({ success: false, error: "doc update failed" })
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
    console.log(doc)
    if (doc.creator.toString() === student._id.toString()) {
        if (doc.collaborators.length > 0) {
            // promote the first collaborator as the next creator
            let nextCreator = doc.collaborators.shift()
            doc.creator = nextCreator
            return coUpdateStudentDocument(res, student, doc, (docr) => {
                docr.collaborators.unshift(nextCreator)
                docr.creator = student._id
            })
        } else {
            // remove doc
            student.save().then((ssv) => {
                let sections2del = doc.section.filter(sec => sec.assignedUser.toString() === student._id.toString()).map((s) => s._id)
                DocumentDAO.Document.findByIdAndDelete(doc._id).then((docdel) => {
                    SectionDAO.Section.deleteMany({ _id: { $in: sections2del } }).then((secs) => {
                        res.json({ success: true, document: docdel, user: ssv })
                    }).catch((err) => {
                        res.json({ success: false, error: "sections delete failed, doc not recovered" })
                    })
                }).catch((err) => {
                    student.documents.push(doc._id)
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
            docr.collaborators.push(student._id)
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
        .populate('section')
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
        if (student.documents.includes(req.body.id.toString())) {
            DocumentDAO.Document.findOne({ 
                $and: [
                    {
                        _id: req.body.id.toString(), 
                    }, 
                    {
                        $or: [
                            {
                                collaborators: student._id
                            }, 
                            {
                                creator: student._id
                            }
                        ]
                    }
                ]
            }).populate({
                path : 'section',
                populate : {
                    path : 'assignedUser', 
                    select: '-password -documents'
                }
            }).populate({
                path : 'comments',
                populate : {
                    path : 'user', 
                    select: '-password -documents'
                }
            }).then((doc) => {
                res.json({ success: true, document: doc })
            }).catch((err) => {
                res.json({ success: false, error: err })
            })
        } else {
            res.json({ success: false, error: "unauth access 2 doc" })
        }
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})
// write TRANSFER of a section ownership to another collab/creator
/*
Group 3
Good
- Omegle), comparison 2 other software
- clear def. of requirement in bullet pts. 
- High level Arch illustration
- Doc of Requirements in UML
Improvements
- JSON database? How might we scale it. 
- Message uniqueness, on (uid, rid) combo, how would you deal with timezones?
- screenshot notification, possibility of fingerprinting?
- How would you trust who is editing?

Group 1
Good
- extensive research of existing softwares
- Operational stakeholders
Improvements
- maybe too long the text per bullet point, too many bullet points per slide?
- data consistency when python code runs?
*/

app.get("/document/viewall", (req, res) => {
    checkToken(req)
    .then((student) => {
        DocumentDAO.Document.find({ 
            $and: [
                {
                    _id: { $in: student.documents }, 
                }, 
                {
                    $or: [
                        {
                            collaborators: student._id
                        }, 
                        {
                            creator: student._id
                        }
                    ]
                }
            ]
        }).populate({
            path : 'section',
            populate : {
                path : 'assignedUser', 
                select: '-password -documents'
            }
        }).populate({
            path : 'comments',
            populate : {
                path : 'user', 
                select: '-password -documents'
            }
        }).then((docsFound) => {
            console.log(docsFound)
            res.json({ success: true, doc: docsFound, user: student })
        }).catch((err) => {
            res.json({ success: false, error: "2" })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: "3", message: err })
    })
})

app.post("/document/comment", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id || !req.body.comment) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ 
            $and: [
                {
                    _id: req.body.id, 
                }, 
                {
                    $or: [
                        {
                            collaborators: student._id
                        }, 
                        {
                            creator: student._id
                        }
                    ]
                }
            ]
        })
        .then((doc) => {
            if (student.documents.includes(doc._id.toString())) {
                doc.comments.push({
                    user: student._id, 
                    comment: req.body.comment, 
                    date: Date.now()
                })
                doc.save().then((docsv) => {
                    res.json({ success: true, error: docsv })
                }).catch((errd) => {
                    res.json({ success: false, error: "cannot add new comment" })
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
        if (!req.body.id && !req.body.title) {
            res.json({ success: false, error: "document must have id and user to assign 2 section" })
            return
        }
        DocumentDAO.Document.findOne({ 
            $and: [
                {
                    _id: req.body.id, 
                }, 
                {
                    $or: [
                        {
                            collaborators: student._id
                        }, 
                        {
                            creator: student._id
                        }
                    ]
                }
            ]
        })
        .then((doc) => {
            if (student.documents.includes(doc._id.toString())) {
                SectionDAO.Section.create({
                    title: req.body.title, 
                    assignedUser: student._id, 
                    text: ""
                }).then((newsec) => {
                    doc.section.push(newsec._id)
                    doc.save().then((docsv) => {
                        res.json({ success: true, data: docsv })
                    }).catch((errd) => {
                        SectionDAO.Section.findByIdAndDelete(newsec._id).then((dels) => {
                            res.json({ success: false, error: "cannot add new section 0", errcont: errd })
                        })
                        .catch((eerr) => {
                            res.json({ success: false, error: "cannot add new section 1" })
                        })
                        
                    })
                }).catch((err_CreateSec) => {
                    res.json({ success: false, error: "cannot add new section 2" })
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

app.post("/document/transfersection", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id || !req.body.collaborator || !req.body.sectionid) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        StudentDAO.Student.findOne({ username: req.body.collaborator }).then((collabo) => {
            if (collabo._id.toString() === student._id.toString()) {
                res.json({ success: false, error: "u wonna transfer2 yourself?" })
                return
            }
            SectionDAO.Section.findOne({ 
                $and: [
                    {
                        _id: req.body.sectionid, 
                    }, 
                    {
                        assignedUser: student._id
                    }
                ]
            })
            .then((foundsec) => {
                if (!foundsec) {
                    res.json({ success: false, error: "unauthd access" })
                    return
                }
                DocumentDAO.Document.findOne({ 
                    $and: [
                        {
                            _id: req.body.id, 
                        }, 
                        {
                            $or: [
                                {
                                    collaborators: student._id
                                }, 
                                {
                                    creator: student._id
                                }
                            ]
                        }, 
                        {
                            $or: [
                                {
                                    collaborators: collabo._id
                                }, 
                                {
                                    creator: collabo._id
                                }
                            ]
                        }, 
                        {
                            section: foundsec._id
                        }
                    ]
                })
                .then((doc) => {
                    if (!doc) {
                        res.json({ success: false, error: "unauthd access" })
                        return
                    }
                    foundsec.assignedUser = new Mongoose.Types.ObjectId(collabo._id)
                    foundsec.save().then((savedSec) => {
                        res.json({ success: true, doc: doc, section: savedSec })
                    }).catch((err_save_sec) => {
                        res.json({ success: false, error: "cannot save section" })
                    })
                })
                .catch((err) => {
                    res.json({ success: false, error: err })
                })
            })
            .catch((find_sec_err) => {
                res.json({ success: false, error: "no such section" })
            })
        }).catch((err) => {
            res.json({ success: false, error: "cannot find collaborator" })
        })
    })
    .catch((err) => {
        res.json({ success: false, error: err })
    })
})

app.post("/document/writesection", (req, res) => {
    checkToken(req)
    .then((student) => {
        if (!req.body.id || !req.body.sectionid || !req.body.sectiontext) {
            res.json({ success: false, error: "document must have id" })
            return
        }
        DocumentDAO.Document.findOne({ 
            $and: [
                {
                    _id: req.body.id, 
                }, 
                {
                    $or: [
                        {
                            collaborators: student._id
                        }, 
                        {
                            creator: student._id
                        }
                    ]
                }
            ]
        })
        .then((doc) => {
            if (student.documents.includes(doc._id) &&
                (doc.collaborators.includes(student._id.toString()) ||
                 doc.creator.toString() === student._id.toString())) {
                SectionDAO.Section.findOne({ _id: req.body.sectionid })
                .then((foundsec) => {
                    if (foundsec.assignedUser.toString() === student._id.toString()) {
                        foundsec.text = req.body.sectiontext
                        foundsec.save().then((savedSec) => {
                            res.json({ success: true, doc: doc, section: savedSec })
                        }).catch((err_save_sec) => {
                            res.json({ success: false, error: "cannot save section" })
                        })
                    } else {
                        res.json({ success: false, error: "unauthroized section" })
                    }
                })
                .catch((find_sec_err) => {
                    res.json({ success: false, error: "no such section" })
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