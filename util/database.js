const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = callback => {

MongoClient.connect('mongodb+srv://prakhar_sharma:PSnaeT3iHcHvT1PX@cluster0-db0aq.mongodb.net/test?retryWrites=true', {useNewUrlParser: true})
.then((result) => {
console.log('Conected!');
callback(result);
})
.catch((err) => {
console.log(err);
});
};

module.exports = mongoConnect;


