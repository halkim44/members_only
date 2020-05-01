var express = require('express');
var router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Message = require('../models/message');

var user_controller = require('../controllers/UserController');
var message_controller = require('../controllers/MessageController');


/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.user ? 'user' : '';
  Message.find()
    .populate(user)
    .exec( (err, list_messages) => {
      if (err) { return next(err); }

      res.render('index', {
        title: 'Members Only',
        username: req.user ? req.user.username : undefined,
        messages: list_messages
      });
    });
});

router.get('/signup', user_controller.user_signup_get);
router.post('/signup', user_controller.user_signup_post);

router.get('/login', user_controller.user_login_get);

// user login authentications
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({
      username: username
    }, (err, user) => {
      if (err) {
        return done(err);
      };
      if (!user) {
        return done(null, false, {
          msg: "Incorrect username"
        });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // password match! log user in
          return done(null, user)
        } else {
          // password do not match!
          return done(null, false, {
            msg: "Incorrect password"
          });
        }
      });
    });
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);
router.post('/add-message', message_controller.message_create_post);

module.exports = router;