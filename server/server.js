require('./config/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/usuario'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    useNewUrlParser: true
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

/*const Cat = mongoose.model('Dog', { name: String });

const kitty = new Cat({ name: 'Mikado2' });
kitty.save().then(() => console.log('meow'));*/

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
})