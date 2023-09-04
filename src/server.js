const  express = require('express')
const db = require('./db')
const app = express()
app.use(express.json())
app.use('/loads')
const port = 3000

app.listen(port, () => {console.log(`Example app listening on port ${port}!`)});