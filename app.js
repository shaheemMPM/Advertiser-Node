const express               = require('express'),
      app                   = express(),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      bodyParser            = require('body-parser'),
      admin                 = require('./models/admin'),
      localStratergy        = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost/whatsadvertiser_adminapp', {useNewUrlParser: true, useUnifiedTopology: true})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(require('express-session')({
  secret: 'Ruby is the best language to code',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static('public'))

passport.use(new localStratergy(admin.authenticate()))
passport.serializeUser(admin.serializeUser())
passport.deserializeUser(admin.deserializeUser())

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
  res.render('upload')
})

app.get('/admoniter', isLoggedIn, (req, res) => {
  res.render('moniterad')
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
  res.render('register')
})

app.post('/login', passport.authenticate('local', {
    successRedirect : '/dashboard',
    failureRedirect : '/'
  }), (req, res) => {
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
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
  res.redirect('/logout')
}

let port = process.env.PORT || 3000

app.listen(port, () => console.log(`App Started Running At Port ${port}`))
