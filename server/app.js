// grab the packages we need
let app = require('express')()
let http = require('http').Server(app);
let io = require('socket.io')(http);
let mysql = require('mysql')

let port = process.env.PORT || 3001

let bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Connect to MySQL
let connection = mysql.createConnection({
    host     : 'localhost',
    port     : '6229',
    user     : 'monitor',
    password : 'Plqa1234',
    database : 'monitor'
})

connection.connect( (err) => {
    if (err) {
        console.error(err.stack);
    }
    console.log('hi')
})
  

let update_node = (data) => {

}

// routes will go here
app.post('/update_node', function(req, res) {
    console.log(req.body)

    req.body.address.Ethernet.forEach(element => {
        console.log(element)
    })

    for(key in req.body.address) {
        req.body.address[key].forEach(e => {
            console.log(e)
        })
    }

    res.sendStatus(200)

});

// Socket IO Stuff
io.on('connection', (socket) => {
    console.log('A user connected!')
})

// start the server
http.listen(port, () => {
    console.log('Server started! At http://localhost:' + port)
})
