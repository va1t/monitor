// grab the packages we need
let app = require('express')()
let http = require('http').Server(app)
let io = require('socket.io')(http)

let mysql = require('mysql')
let MySQLEvents = require('mysql-events')

let port = process.env.PORT || 3001

let bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Watch MySQL for Changes
let mysqlEventWatcher = MySQLEvents({
    host: 'localhost',
    user: 'root',
    password: '123456'
})

let watcher = mysqlEventWatcher.add(
    'monitor.nodes',
    (oldRow, newRow, event) => {
        //row inserted
       if (oldRow === null) {
         //insert code goes here
       }
   
        //row deleted
       if (newRow === null) {
         //delete code goes here
       }
   
        //row updated
       if (oldRow !== null && newRow !== null) {
         //update code goes here
         io.sockets.emit(newRow.fields.uid, newRow.fields)
         console.log('update happened', newRow)
       }
   
       //detailed event information
       //console.log(event)
     }, 
     'match this string or regex'
)

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
  

let update_node = (data) => {

}

// routes will go here
app.post('/update_node', function(req, res) {
    console.log(JSON.stringify(req.body,null,2))

    values = {
        id : req.body.id,
        ip : req.body.network.ip,
        memory : req.body.memory.percent,
        disk : req.body.disk.percent,
        user : req.body.user,
        battery : req.body.battery,
        uid : req.body.uid
    }

    console.log(JSON.stringify(values,null,2))

    connection.query('SELECT * FROM nodes WHERE id = ?', values.id, (err, results) => {
        if(err) console.log(err)
        else {
            if(results.length >= 1) {
                connection.query('UPDATE nodes SET memory = ?, disk = ?, battery = ?, user = ?, ip = ?, uid = ? WHERE id = ?', [values.memory, values.disk, values.battery, values.user, values.ip, values.uid, values.id], (err, results) => {
                    if(err) throw err;
                    else {
                        console.log('UPDATE Node Results: ', results);
                    }
                })
            } else {
                connection.query('INSERT INTO nodes set ?', values, (err, results) => {
                    if (err) throw err;
                    else {
                        console.log('INSERT Node Results: ', results);
                    }
                });
            }
            console.log(results)
        }
    })

    res.sendStatus(200)

});

// Socket IO Stuff
io.on('connection', (socket) => {

    console.log('Web Client Connected!')

    socket.on('get_nodes', (data) => {
        console.log(data)
        connection.query('SELECT * FROM nodes WHERE uid = ?', data.googleId, (err, results) => {
            console.log(data.googleId)
            if(err) console.log(err)
            else {
                console.log(results)
                socket.emit(data.googleId, results)
            }
        })
    })    
})


// start the server
http.listen(port, () => {
    console.log('Server Started! At http://localhost:' + port)
})
