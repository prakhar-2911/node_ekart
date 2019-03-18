const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');
const app = express();

app.set('view engine', 'ejs');
app.set('views','views');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
User.findById('5c84bf42b10b274b20bc8696').then(user => {
req.user = new User(user.name, user.email, user.cart, user._id);
next();
}).catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


mongoConnect(() => {
//User.idGetter();
app.listen(3000, () => {
console.log('Node.js Server is running on port 3000');
});
});


