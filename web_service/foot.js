const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const http = require("http").Server(app)
const io = require('socket.io')(http)
const db = require('./queries')
const settings = require('./settings')

let router = express.Router();
//let alarm

//for cors
const cors = require('cors');

app.use(express.json())
//app.use(express.urlencoded())
app.use('/', router)


	//for cors
app.use(cors());


app.get('/getWorkloads', db.getWorkloads)
app.get('/getWorkload', db.getWorkload)
app.get('/getWorkloadMany', db.getWorkloadMany)
app.post('/modifyWorkload', db.modifyWorkload)
app.get('/deleteWorkload', db.deleteWorkload)
app.get('/getDBs', db.getDBs)
app.get('/getSpecs', db.getSpecs)
app.get('/getResults', db.getResults)
app.post('/executeBenchmark', db.executeBenchmark)
app.get('/getResultY', db.getResultY)
app.get('/getResultE', db.getResultE)
app.get('/testRun', db.testRun)
app.get('/testStop', db.testStop)
app.get('/testResult', db.testResult)
app.get('/getResultIO', db.getResultIO)
app.get('/getResultRAW', db.getResultRAW)
/*
const alarm = io.on('connection', (socket)=>{
	console.log('user has connected')
	socket.on('msg', (data)=>{
		alarm.emit('msg', data)
		console.log(alarm)

	})
})
io.listen(8080)
*/
var server = http.listen(settings.port, settings.host,  function() {
console.log("Server running at http://%s:%s", settings.host, settings.port)
//console.log(Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))

})

module.exports = {
router
}

