var bCrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const passportJWT = require("passport-jwt");
require('dotenv').config();
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy   = passportJWT.Strategy;


module.exports = function(passport, user) {

    var User = user;
    var LocalStrategy = require('passport-local').Strategy;

    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function(req, email, password, done) {
            var generateHash = function(password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };
            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {
                if (user){
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else
                {
                    var userPassword = generateHash(password);
                    var data =
                        {
                            email: email,
                            password: userPassword,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname
                        };

                    User.create(data).then(function(newUser, created) {
                        if (!newUser) {
                            return done(null, false);
                        }
                if (newUser) {
                return done(null, newUser);
                }
            });
        }
    });
    }
));

//LOCAL SIGNIN
passport.use('local-signin', new LocalStrategy(

    {
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {
        var User = user;
        var isValidPassword = function(userpass, password) {
            return bCrypt.compareSync(password, userpass);
        }
        User.findOne({
            where: {
                email: email
            }
        }).then(function(user) {
            if (!user) {
                return done(null, false, {
                    message: 'Email does not exist'
                });
            }
            if (!isValidPassword(user.password, password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }

            var userinfo = user.get();
            req.login(user, {session: false}, function(error) {
                if (error) return next(error);
                console.log('success!')
            })
            //convert token to cookie, access and validate cookie in isAuth method using auth0 verify, pass to component
            if(req.isAuthenticated()){
                //const token = jwt.sign(userinfo, process.env.AUTH_SECRET, {expiresIn: '8h'});
                console.log('user info', userinfo)
               //need to create document.cookie and bypass fetch methods entirely (bigger security concerns though)
            }
            return done(null, userinfo);

        }).catch(function(err) {
            console.log("Error:", err);
            return done(null, false, {
                message: 'Something went wrong with your Signin'
            });

        });
    }
));
    //serialize
    passport.serializeUser(function(user, done) {
        done(null, user.id);
        });
    
        //deserialize
    passport.deserializeUser(function(id, done) {
            User.findByPk(id).then(function(user) {
                if (user) {
                    done(null, user.get());
                } else {
                    done(user.errors, null);
                }
            });
        });
    
    passport.use(new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey   : process.env.AUTH_SECRET
        },
        function (jwtPayload, cb) {
    
            //find the user in db if needed
            return User.findByPk(jwtPayload.id)
                .then(user => {
                    return cb(null, user);
                })
                .catch(err => {
                    return cb(err);
                });
        }
    ));
}

