const connectToMongo = require('./db')
const express = require('express')
const app = express()
const port = 5000
connectToMongo();

app.use(express.json())

//Available routes
app.use('/auth', require('./routes/auth'))
app.use('/employees', require('./routes/employees'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})