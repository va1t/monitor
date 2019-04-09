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

let connected_clients = {

}

let connected_sockets = {

}

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
        uid : req.body.uid,
        cpu: JSON.stringify(req.body.cpu.temps)
    }

    //console.log(JSON.stringify(values,null,2))

    connection.query('SELECT * FROM nodes WHERE id = ?', values.id, (err, results) => {
        if(err) console.log(err)
        else {
            if(results.length >= 1) {
                connection.query('UPDATE nodes SET memory = ?, disk = ?, battery = ?, user = ?, ip = ?, uid = ?, cpu = ? WHERE id = ?', [values.memory, values.disk, values.battery, values.user, values.ip, values.uid,  values.cpu, values.id], (err) => {
                    if(err) throw err;
                    else {
                        connection.query('SELECT * FROM nodes WHERE uid = ?', values.uid, (err, results) => {
                            if(err) console.log(err)
                            else {
                                console.log("[UPDATE Node] ", values.id, ' : ', values.uid, '|', Object.keys(connected_clients).length, ':', Object.keys(connected_sockets).length)
                                if(connected_clients.hasOwnProperty(values.uid)){
                                    connected_clients[values.uid].forEach(element => {
                                        console.log(element.id)
                                        element.emit(values.uid, results)    
                                    })
                                }                        
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
                                if(connected_clients.hasOwnProperty(values.uid)){
                                    connected_clients[values.uid].forEach(element => {
                                        element.emit(values.uid, results)    
                                    }) 
                                }                          
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

    socket.emit('connected', () => {

    })

    socket.on('login', (data) => {
        
        if(!connected_clients.hasOwnProperty(data.googleId)) {
            connected_clients[data.googleId] = []
        }

        connected_clients[data.googleId].push(socket)
        connected_sockets[socket.id] = data.googleId

        connection.query('SELECT * FROM nodes WHERE uid = ?', data.googleId, (err, results) => {
            if(err) console.log(err)
            else {
                socket.emit(data.googleId, results)
            }
        })
    })   
    
    socket.on('disconnect', () => {
        console.log('Web Client Disconnected!')
        if(connected_clients[connected_sockets[socket.id]].length >= 1 ) {
            delete connected_clients[connected_sockets[socket.id]]
        } else {
            console.log('Splicing.. ', socket.id)
            connected_clients[connected_sockets[socket.id]].filter((value, index, arr) => {
                if(value.id === socket.id) {
                    console.log('Delete item ..', value.id, ':', socket.id)
                    connected_clients[connected_sockets[socket.id]].splice(index, 1)
                }
            }) 

            connected_clients[connected_sockets[socket.id]].forEach(e => {
                console.log('Done...!', e.id)
            })
        }
            
        delete connected_sockets[socket.id]
    })
})


// start the server
http.listen(port, () => {
    console.log('Server Started! At http://localhost:' + port)
})
