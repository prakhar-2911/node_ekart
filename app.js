const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const MONGODB_URI = 'mongodb+srv://prakhar_sharma:PSnaeT3iHcHvT1PX@cluster0-db0aq.mongodb.net/shop';
const User = require('./models/user');
const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views','views');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
secret: 'my secret',
resave: false,
saveUninitialised: false,
store: store
}));

const csrfProtection = csrf();

app.use(csrfProtection);

app.use(flash());


app.use((req, res, next) => {
if(!req.session.user){
  return next();
}
User.findById(req.session.user._id).then(user => {
req.user = user;
next();
}).catch(err => console.log(err));
});


app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);


mongoose
.connect(MONGODB_URI)
.then(result => {
app.listen(3000, () => {
console.log('Node.js Server is running on port 3000');
})}
)
.catch(err => console.log(err));
// mongoConnect(() => 
// app.listen(3000, () => {
// console.log('Node.js Server is running on port 3000');
// });
// });
