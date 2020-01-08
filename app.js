// Requiring all packages
const express               = require('express'),
      app                   = express(),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      bodyParser            = require('body-parser'),
      admin                 = require('./models/admin'),
      media                 = require('./models/media'),
      adsdb                 = require('./models/ads'),
      localStratergy        = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose'),
      multer                = require('multer'),
      path                  = require('path'),
      fs                    = require('fs-extra'),
      apiRoutes             = require('./routes/api/users')

// set storage engine
const storage = multer.diskStorage({
  destination : './public/uploads/',
  filename    : function (req, file, cb){
    let tpname = file.originalname.split(".")
    tpname = tpname[0]
    tpname = tpname + '-' + Date.now() + path.extname(file.originalname)
    cb(null,tpname)
  }
})

// initialise upload variable
const upload = multer({
  storage : storage,
  limits  : {
    fileSize : 16000000
  },
  fileFilter : function(req, file, cb) {
    checkFileType(file, cb)
  }
}).single('imgad')

// checkFileType function definition
function checkFileType(file, cb) {
  // regular expression for image extensions
  const filetypes = /jpeg|jpg|png|gif|mp4/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetyp = filetypes.test(file.mimetype)
  if (extname && mimetyp) {
    return cb(null, true)
  } else {
    cb('Error : Images and Videos Only!')
  }
}

// Connecting to database
mongoose.connect('mongodb://localhost/whatsadvertiser_adminapp', {useNewUrlParser: true, useUnifiedTopology: true})

// set view engine to ejs
app.set('view engine', 'ejs')
// seting up body parser for post data collection
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
// setting up session management
app.use(require('express-session')({
  secret: 'Ruby is the best language to code',
  resave: false,
  saveUninitialized: false
}))
// setting up passport
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static('public'))

passport.use(new localStratergy(admin.authenticate()))
passport.serializeUser(admin.serializeUser())
passport.deserializeUser(admin.deserializeUser())

// setting up API routes
app.use('/api/users', apiRoutes)

// adding routes
app.get('/', isNotLoggedIn, (req, res) => {
  res.render('login')
})

app.get('/login', (req, res) => {
  res.redirect('/')
})

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.render('dashboard')
})

app.get('/adupload', isLoggedIn, (req, res) => {
  media.find({}, (err, medias) => {
    if (err) {
      res.render('upload', {mediainfo: err, medias: []})
    }else {
      res.render('upload', {medias: medias})
    }
  })
})

app.get('/createad', isLoggedIn, (req, res) => {
  media.find({}, (errs, medias) => {
    if (errs) {
      res.render('createad', {mediainfo: errs, medias: []})
    }else {
      res.render('createad', {medias: medias})
    }
  })
})

app.get('/admoniter', isLoggedIn, (req, res) => {
  adsdb.find({}, (err, ads) => {
    if (err) {
      console.log(`Error on finding adsdb : ${err}`)
      res.render('moniterad', {ads: []})
    }else {
      res.render('moniterad', {ads: ads})
    }
  })
})

app.get('/usermoniter', isLoggedIn, (req, res) => {
  res.render('moniteruser')
})

app.get('/verifysubmissions', isLoggedIn, (req, res) => {
  res.render('vsubm')
})

app.get('/redeem', isLoggedIn, (req, res) => {
  res.render('redeem')
})

app.get('/register', isLoggedIn, (req, res) => {
  res.render('adone')
})

app.get('/ad/:adid', isLoggedIn, (req, res) => {
  adsdb.findById(req.params.adid, (err, fad) => {
    res.render('adone', {ad : fad})
  })
})

app.get('/clearmediadb', isLoggedIn, (req, res) => {
  fs.emptyDir('./public/uploads/', (err) => {
    if (err) {
      console.log(`Can't Clear DB. Error : ${err}`)
      res.redirect('/adupload')
    }else {
      media.deleteMany({}, (errs) => {
        if (errs) {
          console.log(`Can't Clear DB.media Error : ${err}`)
          res.redirect('/adupload')
        }else {
          adsdb.deleteMany({}, (erdb) => {
            if (erdb) {
              console.log(`Can't Clear DB.adsdb Error : ${erdb}`)
              res.redirect('/adupload')
            }else {
              console.log(`\n\nDatabase Cleared At : ${new Date().toLocaleString()}\n\n`)
              res.redirect('/adupload')
            }
          })
        }
      })
    }
  })
})

app.get('/clearaddb', isLoggedIn, (req, res) => {
  adsdb.deleteMany({}, (erdb) => {
    if (erdb) {
      console.log(`Can't Clear DB.adsdb Error : ${erdb}`)
      res.redirect('/admoniter')
    }else {
      console.log(`\n\nAd Database Cleared At : ${new Date().toLocaleString()}\n\n`)
      res.redirect('/admoniter')
    }
  })
})

app.get('/delad/:adid', isLoggedIn, (req, res) => {
  adsdb.remove({_id: req.params.adid}, (erdb) => {
    if (erdb) {
      console.log(`Can't Delete Ad Error : ${erdb}`)
      res.redirect('/admoniter')
    }else {
      console.log(`\n\nAd With Id : ${req.params.adid} Deteled At : ${new Date().toLocaleString()}\n\n`)
      res.redirect('/admoniter')
    }
  })
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.post('/login', passport.authenticate('local', {
    successRedirect : '/dashboard',
    failureRedirect : '/'
  }), (req, res) => {
})

app.post('/register', (req, res) => {
  admin.register(new admin({username: req.body.username}), req.body.password, (err, user) => {
    if (err) {
      console.log(err)
      return res.render('register')
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/dashboard')
    })
  })
})

app.post('/adupload', isLoggedIn,(req, res) => {
  upload(req, res, (err) => {
    if (err) {
      media.find({}, (errs, medias) => {
        if (errs) {
          res.render('upload', {msg: err, mediainfo: errs, medias: []})
        }else {
          res.render('upload', {msg: err, medias: medias})
        }
      })
    }else {
      if (req.file == undefined) {
        media.find({}, (errs, medias) => {
          if (errs) {
            res.render('upload', {msg: 'Error : No File Selected!', mediainfo: errs, medias: []})
          }else {
            res.render('upload', {msg: 'Error : No File Selected!', medias: medias})
          }
        })
      }else {
        // data in req.file should store to database
        var mimetp = req.file.mimetype.split("/")[0]
        media.create({
          name: req.file.filename,
          size: req.file.size,
          type: mimetp
        }, (err, saved) => {
          if (err) {
            console.log('\n\nError on Upload to database\n\n');
            console.log(err)
            res.render('upload', {msg : `File isn't uploaded`, medias: []})
            media.find({}, (errs, medias) => {
              if (errs) {
                res.render('upload', {msg: `File isn't uploaded`, mediainfo: errs, medias: []})
              }else {
                res.render('upload', {msg: `File isn't uploaded`, medias: medias})
              }
            })
          }else {
            console.log('\n\nSuccessfully uploaded follwing row to database\n');
            console.log(saved)
            res.redirect('/adupload')
          }
        })
      }
    }
  })
})

app.post('/createad', isLoggedIn, (req, res) => {
  let medArr = req.body.medias.split("$")
  medArr.pop()
  adsdb.create({
    title: req.body.title,
    description: req.body.description,
    medias: medArr,
    users: []
  }, (err) => {
    res.redirect('/createad')
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next()
  }
  res.redirect('/dashboard')
}

let port = process.env.PORT || 3000

app.listen(port, () => console.log(`App Started Running At Port ${port}`))
