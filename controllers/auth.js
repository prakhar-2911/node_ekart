const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const {validationResult} = require('express-validator/check');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}))

exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get('Cookie').split('=')[1] == 'true';
  let message = req.flash('error');
  if(message.length>0){
    message = message[0];
  }
  else{
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message    
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email: email})
  .then(user => {
    if(!user){
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    bcrypt
    .compare(password, user.password)
    .then(doMatch => {
      if(doMatch){
        req.session.user = user;
        req.session.isLoggedIn=true;
        return req.session.save(err => {
        console.log(err);
        res.redirect('/')
      });
      }
       res.redirect('/login');
    }); 
    })
    .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {

  let message = req.flash('error');
  if(message.length>0){
    message = message[0];
  }
  else{
    message = null;
  }
  res.render('auth/signup',{
  path: '/signup',
  pageTitle: 'Signup',
  errorMessage: message
})
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg
    })
  }

  User.findOne({email: email})
  .then(userDoc => {
    if(userDoc){
      req.flash('error', 'E-mail already exists. Please pick a different one.')
      return res.redirect('/signup');
    }
    return bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save();
      })
      .then(result => { 
        res.redirect('/login'); 
        return transporter.sendMail({
          to: email,
          from: 'shop@node-complete.com',
          subject: 'Signup Succeeded!',
          html: '<h1> You successfully signed up! <h1>'
        });
      })
      .catch(err => {
          console.log(err)
        });    
        })
      .catch(err => console.log(err));
      };

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
  
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if(message.length>0){
    message = message[0];
  }
  else{
    message = null;
  }
  res.render('auth/reset',{
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({
      email: req.body.email
    })
    .then(user => {
      if(!user){
        req.flash('error','No account with that email found.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/ ');
      transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Password Reset',
        html: `
        <p> You requested a Password Reset </p>
        <p> Click this <a href="http://localhost/3000/reset/${token}"> link </a> to set a new password</p>
        `
      });
    })
    .catch(err => console.log(err));
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, tokenExpirationDate: {$gt: Date.now()}})
  .then(user => {
    let message = req.flash('error');
    if(message.length>0){
      message = message[0];
    }
    else{
      message = null;
    }
    
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  })
  .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
 const newPassword = req.body.password;
 const userId = req.body.userId;
 const passwordToken = req.body.passwordToken;
 let resetUser;

 User.findOne({
  resetToken: passwordToken,
  resetTokenExpiration: { $gt: Date.now() },
  _id: userId
 })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then((hashedPassword) => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
  })




}
