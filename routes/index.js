var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Blog = require('../models/blog');

//root route
router.get('/', function(req, res) {
	res.render('landing');
});

//show register form
router.get('/register', function(req, res) {
	res.render('register', { page: 'register' });
});

//handle sign up logic
router.post('/register', function(req, res) {
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar,
		bio: req.body.bio
	});
	if (req.body.adminCode === process.env.ADMIN_CODE) {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function() {
			if (newUser.isAdmin) {
				console.log(user.username);
				req.flash('success', 'Successfully Signed Up to SpeakUP! ' + user.username + ", You're an Admin!");
			} else {
				console.log(user.username);
				req.flash('success', 'Successfully Signed Up to SpeakUP! ' + user.username);
			}
			res.redirect('/blogs');
		});
	});
});

//show login from
router.get('/login', function(req, res) {
	res.render('login', { page: 'login' });
});

//handle login form logic

router.post('/login', function(req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/blogs',
		failureRedirect: '/login',
		failureFlash: true,
		successFlash: 'Welcome to SpeakUP, ' + req.body.username + '!'
	})(req, res);
});

//LOGOUT ROUTE
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/blogs');
});

//USER Profile Route
router.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			req.flash('error', 'Something went wrong');
			return res.redirect('/');
		}
		Blog.find().where('author.id').equals(foundUser._id).exec(function(err, blogs) {
			if (err) {
				req.flash('error', 'Something went wrong');
				return res.redirect('/');
			}
			res.render('users/show', { user: foundUser, blogs: blogs });
		});
	});
});

//EDIT ROUTE
router.get('/users/:id/edit', function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			res.redirect('back');
		} else {
			res.render('users/edit', { user: foundUser });
		}
	});
});

//Update ROUTE
router.put('/users/:id', function(req, res) {
	var newData = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar,
		bio: req.body.bio
	};
	User.findByIdAndUpdate(req.params.id, { $set: newData }, function(err, user) {
		if (err) {
			res.redirect('back');
		} else {
			req.flash('success', 'Profile Updated!');
			res.redirect('/users/' + user._id);
		}
	});
});

module.exports = router;
