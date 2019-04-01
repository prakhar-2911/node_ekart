const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
//const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');
const app = express();
const mongoose = require('mongoose');


app.set('view engine', 'ejs');
app.set('views','views');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
User.findById('5ca1b22ad449bd87c4d6c8f3').then(user => {
req.user = user;
next();
}).catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);



mongoose
.connect('mongodb+srv://prakhar_sharma:PSnaeT3iHcHvT1PX@cluster0-db0aq.mongodb.net/shop?retryWrites=true')
.then(result => {
User.findOne().then(user => {
  if(!user){
    const user = new User({
        name: 'Prakhar',
        email: 'prakhar_sharma@xyz.com',
        cart: {
            items: []
        }
    });
    user.save();
  }  
});


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
