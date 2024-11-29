const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('./middleware/logger')
const bookRouter = require('./routes/book')
const err404  =require('./middleware/err-404')
const router =  express.Router()
const fileMulter = require('./middleware/file')
const fs = require('fs')
const path = require('path');
const helmet = require('helmet');
const { default: mongoose } = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const UserModel = require('./models/user_schema')


const verify = async (username, password, done) => {
  try {
    
    const user = await UserModel.findOne({ username: username });
    
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    
  
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password' });
    }

   
    return done(null, user);
  } catch (err) {
    return done(err); 
  }
};

const options = {
    usernameField:"username",
    passwordField:"password",
}

passport.use('local', new LocalStrategy(options, verify))


passport.serializeUser((user, cb) => {
    cb(null, user._id)
  })
  
  passport.deserializeUser(async (id, cb) => {
    try {
      const user = await UserModel.findById(id); 
      if (!user) {
        return cb(new Error('User not found')); 
      }
      cb(null, user); 
    } catch (err) {
      cb(err);
    }
  });

const app = express()
app.use(express.json())
app.use(helmet());
app.use(session({ secret: 'SECRET'}));
app.use(passport.initialize())
app.use(passport.session())
app.use(logger)
app.use(express.urlencoded({extended: true }));
app.use('/api',bookRouter)

app.use('/public',express.static(__dirname+'/public'))

app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'view'));

app.get('/api/login',   (req, res) => {
    res.render('user/login')
  })

app.post('/api/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    console.log("req.user: ", req.user)
    res.redirect('/api/books')
  })

app.get('/api/signup',(req,res) =>{
    res.render('user/signup',{newUser:{}})
})
app.post('/api/signup',async (req,res)=>{
    let newUser = new UserModel({
        username: req.body.username,
        password: req.body.password
    })

    try{
       await newUser.save()
    } catch (err){
       console.log(e)
    }
    res.redirect('/api/books')
})

app.get('/api/logout',  (req, res) => {
  req.logout((err) =>{
    if (err){
      return res.status(500).send('Error logging out')
    } 
    res.redirect('/api/books')
  })
 
})

app.get('/api/me',
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login')
    }
    next()
  },
  (req, res) => {
    res.render('user/profile', { user: req.user })
  }
)


app.use(err404)
app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).send('Something broke!');

});

const PORT = process.env.PORT || 3000

async function start(){
    try{
        let url = "mongodb://root:example@mongo:27017/"
        let BooksDB = await mongoose.connect(url, {
            dbName: "Library" ,
            });
        app.listen(PORT,() =>{
            console.log(`Server is running on port ${PORT}.`)
        })
    }
    catch(e){
        console.log(e)
    }
}

start()