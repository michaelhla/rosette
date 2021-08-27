require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const epilogue = require('epilogue');
const formData = require('express-form-data'); 
const cloudinary = require('cloudinary');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');


//bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser()); // cookie parser must use the same secret as express-session.

const cookieExpirationDate = new Date();
const cookieExpirationDays = 2;
cookieExpirationDate.setDate(cookieExpirationDate.getDate() + cookieExpirationDays);

//passport
app.use(session({ 
  secret: process.env.AUTH_SECRET,
  resave: false, 
  saveUninitialized:false, 
})); // session secret
app.use(passport.initialize());
app.use(passport.session());


/*const authconfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: 'https://localhost:3000',
  clientID: 'lJHGcsZiKrSBJwCGVbldmr8fu2zKt5KI',
  issuerBaseURL: 'https://rosette.us.auth0.com'
};*/

//cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.FILE_API_KEY, 
  api_secret: process.env.FILE_API_SECRET
})

// auth router attaches /login, /logout, and /callback routes to the baseURL

/* req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});*/

app.use(formData.parse())

app.post('/image-upload', (req, res) => {
  const values = Object.values(req.files)
  const promises = values.map(image => cloudinary.uploader.upload(image.path))
  
  Promise
    .all(promises)
    .then(results => res.json(results))
})

app.delete('/image-delete/:id', (req, res) => {
  public_id = req.params.id
  cloudinary.uploader.destroy(public_id)
  res.send(200)
})

const database = new Sequelize({
  dialect: 'sqlite',
  storage: './test.sqlite',
});

const Post = database.define('posts', {
  title: Sequelize.STRING,
  body: Sequelize.TEXT,
  views: Sequelize.INTEGER,
  text: Sequelize.TEXT, 
  fileList: Sequelize.TEXT, 
  cloudIDlist: Sequelize.TEXT,
  author: Sequelize.INTEGER 
  //topic: Sequelize.STRING,
});


const User = database.define('users', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER
},
  firstname: {
    type: Sequelize.STRING,
    notEmpty: true
},
lastname: {
    type: Sequelize.STRING,
    notEmpty: true
},
group: Sequelize.STRING,
email: {
    type: Sequelize.STRING,
    validate: {
        isEmail: true
    }
},
password: {
    type: Sequelize.STRING,
    allowNull: false
},
profilepic: Sequelize.TEXT, 
last_login: Sequelize.DATE,
status: {
    type: Sequelize.TEXT,
    defaultValue: 'active'
}
});

require('../../config/passport.js')(passport, User) //config

app.get('/logincheck', (req, res) =>{ //route called by front end component to check auth status
  //if(req.isAuthenticated()){ //returns false even with cookie and session in browser 
    res.json({isAuth: true})
})

app.get('/createAuthCookie', async (req, res) => {
  console.log('req body', req.user)
  if(req.user){
    const token = jwt.sign(req.user, process.env.AUTH_SECRET, {expiresIn: '8h'})
    res.cookie("token", token, {
      maxAge: 1000*60*60*8, 
      httpOnly: false, 
      secure: true, 
      //sameSite: false
    })
    console.log('heres your cookie', req.cookies)
    res.redirect('https://localhost:3000/postmanager')
  }
  else res.status(500)

})

app.post('/getUser', async (req, res) => {
  if(req.body.token)
  {
    var isAuth = jwt.verify(req.body.token, process.env.AUTH_SECRET)
  }
  console.log(isAuth)
  if(isAuth){
    if(isAuth.email && isAuth.password){
      var holder = await User.findOne({where: {email : isAuth.email, password : isAuth.password }})
      if(holder.length !== null){ 
        res.json({author: isAuth.id})
        console.log('found user')
        return;
      }
    }
  }
  res.status(404)
})

app.post('/isAuth', async (req, res) => { 
  if(req.body.token)
  {
    var isAuth = jwt.verify(req.body.token, process.env.AUTH_SECRET)
  }
  if(isAuth){
    if(isAuth.email && isAuth.password){
      var holder = await User.findOne({where: {email : isAuth.email, password : isAuth.password }})
      if(holder.length !== null){ 
        res.json({loggedIn: true})
        console.log('true')
        return;
      }
    }
  }
  res.json({loggedIn: false})
})

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/createAuthCookie',
  failureRedirect: '/invalidSignUp'
}
));

app.post('/signin', passport.authenticate('local-signin', 
{
  successRedirect: '/createAuthCookie',
  failureRedirect: '/invalidSignIn'
})
);

app.get('/invalidSignUp', (req, res) => { 
  res.redirect('https://localhost:3000/signup')
});

app.get('/invalidSignIn', (req, res) => { 
    res.redirect('https://localhost:3000/login')
});

app.get('/logout', (req, res) => { 
  console.log(req.isAuthenticated())
  req.session.destroy(function(err) {
    req.logOut()
    res.clearCookie('token')
    res.redirect('https://localhost:3000')
});
});

app.get('/authors/:author', (req, res) => {
Post.findAll({ 
  where: {author: req.params.author}
}).then(results => res.json(results))
})

epilogue.initialize({ app, sequelize: database });

epilogue.resource({
  model: Post,
  endpoints: ['/posts', '/posts/:id'],
});


epilogue.resource({ 
  model: User, 
  endpoints: ['/users', '/users:id']
})

const port = process.env.SERVER_PORT || 3001;

database.sync().then(() => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});