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
    password: 'Unitybank12%'
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
         io.sockets.emit('0', newRow.fields)
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
    password : 'Unitybank12%',
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
    console.log(req.body)

    req.body.address.Ethernet.forEach(element => {
        console.log(element)
    })

    for(key in req.body.address) {
        req.body.address[key].forEach(e => {
            console.log(e)
        })
    }

    values = {
        id : 0,
        memory : req.body.memory[2],
        disk : req.body.disk[3],
        battery : req.body.battery[0],
        user : req.body.user[0][0],
    }
    console.log(values)

    connection.query('SELECT * FROM nodes WHERE id = ?', values.id, (err, results) => {
        if(err) console.log(err)
        else {
            if(results.length >= 1) {
                connection.query('UPDATE nodes SET memory = ?, disk = ?, battery = ?, user = ? WHERE id = ?', [values.memory, values.disk, values.battery, values.user, values.id], (err, results) => {
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
})

// start the server
http.listen(port, () => {
    console.log('Server Started! At http://localhost:' + port)
})
