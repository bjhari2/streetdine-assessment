const mongoose = require('mongoose')

const mongoURI = 'mongodb://localhost:27017/employees'

const connectToMongo = () => {
    mongoose.connect(mongoURI)
        .then(() => {
            console.log('Connected successfully!')
        }).catch(() => {
            console.log('Error occured!')
        })
}

module.exports = connectToMongo