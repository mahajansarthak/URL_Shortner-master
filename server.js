const cookieParser = require('cookie-parser')
const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const User = require('./models/user')
const app = express()

mongoose.connect('mongodb+srv://mahajansarthak:sarthakmahajan@cluster0.ry6s0cz.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }), cookieParser())


// Rendering home page
app.get('/', (req, res) => {
  isLoggedIn = false

  user = req.cookies.userID;

  if(user==undefined){
    isLoggedIn=true
  } else{
    isLoggedIn = false
  }
  
  res.render('index', {isLoggedIn: isLoggedIn})
})


// Login Page
app.get('/login', async (req, res) => {
  errorMessage =''
  res.render('login', {errorMessage: errorMessage})
})

app.post('/login', async (req, res) => {
  email = req.body.email
  password = req.body.password
  errorMessage = '';

  const user = await User.findOne({ email: email })

  if(user){
    if(user.password == password){
      let options = {
        maxAge: 1000 * 60 * 15, // would expire after 15 minutes
        httpOnly: true, // The cookie only accessible by the web server
      }
      
      res.cookie('userID', user.userID, options)
      // res.send('')
      res.redirect('/shorturl')
    } else{
      errorMessage = "Invalid login details"
      res.render('login', {errorMessage: errorMessage}) 
    }
  }else{
      errorMessage = "No users found with this email address"
      res.render('login', {errorMessage: errorMessage})
    }
})

//Logout
app.get('/logout', async (req, res) => {
  res.clearCookie('userID')
  res.redirect('/')
})

// Register Page
app.get('/register', async (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  errorMessage = '';
  
  user = {
    name : req.body.name,
    email : req.body.email,
    password : req.body.password
  }

  await User.create(user)
  res.redirect('/login')
})


//Dashboard Pages
app.get('/shorturl', async (req, res) => {
  userID = req.cookies.userID;

  const shortUrls = await ShortUrl.find({userID : userID})
  res.render('shorturl', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
  userID =  req.cookies.userID;
  await ShortUrl.create({ full: req.body.fullUrl, userID: userID })
  res.redirect('/shorturl')
})

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++
  shortUrl.save()

  res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);