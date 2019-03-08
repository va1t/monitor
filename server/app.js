// grab the packages we need
let app = require('express')()
let http = require('http').Server(app)
let io = require('socket.io')(http)

let mysql = require('mysql')

let port = process.env.PORT || 3001

let bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies



// Connect to MySQL
let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'monitor'
})

connection.connect( (err) => {
    if (err) {
        console.error(err.stack);
    } else {
        console.log('SQL Connected.')
    }
})
  

// routes will go here
app.post('/update_node', function(req, res) {
    //console.log(JSON.stringify(req.body,null,2))

    values = {
        id : req.body.id,
        ip : req.body.network.ip,
        memory : req.body.memory.percent,
        disk : req.body.disk.percent,
        user : req.body.user,
        battery : req.body.battery,
        uid : req.body.uid
    }

    //console.log(JSON.stringify(values,null,2))

    connection.query('SELECT * FROM nodes WHERE id = ?', values.id, (err, results) => {
        if(err) console.log(err)
        else {
            if(results.length >= 1) {
                connection.query('UPDATE nodes SET memory = ?, disk = ?, battery = ?, user = ?, ip = ?, uid = ? WHERE id = ?', [values.memory, values.disk, values.battery, values.user, values.ip, values.uid, values.id], (err) => {
                    if(err) throw err;
                    else {
                        connection.query('SELECT * FROM nodes WHERE uid = ?', values.uid, (err, results) => {
                            if(err) console.log(err)
                            else {
                                console.log("[UPDATE Node] ", values.id, ' : ', values.uid)
                                io.emit(values.uid, results)                              
                            }
                        })
                    }
                })
            } else {
                connection.query('INSERT INTO nodes set ?', values, (err) => {
                    if (err) throw err;
                    else {
                        connection.query('SELECT * FROM nodes WHERE uid = ?', values.uid, (err, results) => {
                            if(err) console.log(err)
                            else {
                                console.log("[INSERT Node] ", values.id, ' : ', values.uid)
                                io.emit(values.uid, results)                              
                            }
                        })
                    }
                });
            }
        }
    })

    res.sendStatus(200)

});

// Socket IO Stuff
io.on('connection', (socket) => {

    console.log('Web Client Connected!')

    socket.on('get_nodes', (data) => {
        connection.query('SELECT * FROM nodes WHERE uid = ?', data.googleId, (err, results) => {
            if(err) console.log(err)
            else {
                io.emit(data.googleId, results)
            }
        })
    })    
})


// start the server
http.listen(port, () => {
    console.log('Server Started! At http://localhost:' + port)
})
