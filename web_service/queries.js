const fs = require("fs")
const path = require('path')
const Moment = require('moment-timezone')
const settings = require('./settings')
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const util  = require('util')
//const app = express();
//const io = require('./foot')

//for response to benchmark results
const SockServer = require('socket.io')
const io = new SockServer()


//let SockList = []
const alarm = io
.on('connection', (socket) =>{
	socket.on('msg', (data)=>{
		alarm.emit('msg', data);
	})
})

io.listen(8080)

var pids = new Map()
let hostnames = [
		{"hostname" : "203.255.92.193"},
	{"hostname" : "203.255.92.194"},
{"hostname" : "203.255.92.195"}
]


/*for Logger*/
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');


const timeStampFormat = () =>{
	return Moment().format('YYYY-MM-DD HH:mm:ss.SSS zz');
}

var logger =  winston.createLogger({
    transports: [
        new (winstonDaily)({
            name: 'info-file',
            filename: './logs/info/Info.log',
        }),
        new (winston.transports.Console)({
            name: 'debug-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ],
    exceptionHandlers: [
        new (winstonDaily)({
            name: 'exception-file',
            filename: './logs/error/error.log',
        }),
        new (winston.transports.Console)({
            name: 'exception-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
            timestamp: timeStampFormat
        })
    ]
});

/*for Logger*/

//Moment.tz.setDefault('Asia/Seoul')

const mode = settings.mode

const DEBUG = (msg) =>{
	if(mode == 1)
		console.log(msg)
}


//for prop read
const PropertiesReader = require('properties-reader');
var parser = require('properties-file')
let prop
getProperty = (pty) => {return prop.get(pty);}

const Pool = require('pg').Pool

const pool = new Pool( settings.dbSetting )

let propDefault = settings.propDefault
//timeout
let timeout



const funcQuery = (sql,data, func) =>{
	logger.info("FUNC_QUERY ==> "+sql)
	pool.query(sql,data, func)
}

	
const simpleQuery = (sql, res, flag, data) => {

	logger.info("SIMPLE_QUERY ==> " + sql)
	logger.info("DATA 		  ==> " + data)
	pool.query(sql, data, (err, results) => {
//		console.log(results)
		checkErr(err, res)
		if(flag == 0)	//resp all
		{
			res.statusCode = 200
			res.send(results.rows)
			res.end()
		}
		else if(flag == 1){
				
			res.status(204).end()
		}

	})
}

const checkErr = (err, res) =>{
	if(err)
	{
		logger.error(err)
//		console.log(err)
		if(typeof res !== 'undefined')
			res.status(404).end()
	//	throw err
	}
}

const convertDate = (d) =>{
	return Moment(d).format('YYYY-MM-DD HH:mm:ss')
}

const readPropAll = (rtv) =>{
	let tempObj={}
	//	let tempPropAry= [...propAry];
	for(let item of settings.propAry){
		let temp = getProperty(item)
			//	console.log(temp)
			if(temp != null){
				if(item === 'recordcount')
					propDefault['insertcount'] = temp
				tempObj[item] = temp
			}
			else{
				tempObj[item] = propDefault[item]
			}
	}
	rtv.propValues = tempObj

}

const getWorkload = (req, res) => {
		logger.debug("GET WORKLOAD " + req.query.w_id)

		let sql = 'SELECT * FROM sk2.workload WHERE w_id = $1'

		funcQuery( sql,[req.query.w_id], (err, results)=>{
//			console.log(results)
			checkErr(err, res)
			let rtv = results.rows[0]
			prop = PropertiesReader(rtv.w_config_file_path)
			//all props read from workload file
			readPropAll(rtv)
			res.statusCode = 200
			res.send(rtv)
			res.end()
		})

}

const getWorkloadMany = (req, res) => {
		logger.debug("GET WORKLOAD MANY" + req.query.w_ids)

		let wIds  = req.query.w_ids
		let sql = 'SELECT w_id, w_config_file_path FROM sk2.workload WHERE w_id in('+wIds+')'

		funcQuery( sql,[], (err, results)=>{
			checkErr(err, res)
			let rtv = []
			results.rows.forEach(row =>{

				prop = PropertiesReader(row.w_config_file_path)
				let temp = {w_id : row.w_id}
				readPropAll(temp)
				rtv.push(temp)
			})	
			//all props read from workload file
			res.statusCode = 200
			res.send(rtv)
			res.end()
		})

}


const getWorkloads = (req, res) => {
		logger.debug("GET WORKLOADS")
		let sql = 'SELECT '+
			'w_id, w_name, w_read, w_insert, w_update, w_readmodifywrite, w_scan, w_c_timestamp, w_freq_count, w_error_count, w_d_flag '+
			'FROM sk2.workload '+
//			'WHERE w_d_flag=0 '+ 
			'ORDER BY w_id ASC'

		simpleQuery(sql, res, 0)
}

const insertAndSelect = (res, data) => {

	let insertSql = 'INSERT INTO sk2.workload '+
	'(w_name, w_config_file_path, w_read, w_insert, w_update,  w_readmodifywrite, w_scan, w_c_timestamp, w_freq_count, w_error_count, w_d_flag, w_record_count,f_id) '+
	'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 0, $9, $10)'

	let selectSql =  'SELECT '+
	'w_id, w_name, w_read, w_insert, w_update, w_readmodifywrite, w_scan, w_c_timestamp, w_freq_count, w_error_count, w_d_flag '+
	'FROM sk2.workload '+
	'WHERE w_c_timestamp= \''+data[7]+'\''

	logger.debug("insertAndSelect")
	funcQuery(insertSql, data, (err, results) =>{		
		checkErr(err, res)
		simpleQuery(selectSql, res, 0)

	})

}

const insertAndSelectBench = (res, data) =>{
	let insertSql = 'INSERT INTO sk2.run(r_s_timestamp, r_e_timestamp, r_c_timestamp, r_status_flag, r_window_size, r_threshold, r_name) VALUES(null, null, $1, 0, $2, $3, $4)'
	let selectSql = 'SELECT r_id FROM sk2.run WHERE r_c_timestamp=\''+data[0]+'\''

	logger.debug("insertAndSelectBench")

	return new Promise(function (resolve, reject) {
		funcQuery(insertSql, data, (err, ir) =>{
//			console.log("data = " + data)
//			DEBUG(ir)
			checkErr(err, res)

			funcQuery(selectSql, [], (err, results) =>{
//				console.log("select= " )
				checkErr(err, res)
//				DEBUG(results.rows)
				if(results.rows.length > 0)
					resolve(results.rows[0].r_id)
				else
					reject(new Error("Select Request Failed"))
			})
		})
	})
}

const insertAndSelectFile = (res, data) =>{

	let insertSql = "INSERT INTO sk2.file (f_size, f_path, f_type) VALUES ($1, $2, 'KB')"
	let selectSql = "SELECT f_id FROM sk2.file WHERE f_size = $1"
	
	logger.debug("insertAndSelectFile")
	return new Promise(function(resolve, reject){
		funcQuery(insertSql, data, (err, ir) =>{
			checkErr(err, res)
			funcQuery(selectSql, [data[0]],(err, sr) =>{
				checkErr(err, res)
				if(sr.rows.length > 0)
					resolve(sr.rows[0].f_id)
				else
					reject(new Error("Select Request Failed"))
			})		
		})
	})

}



const writePropfile = (res, data) =>{
	fs.writeFile(data.filePath, parser.stringify(data.wlFileProps), (err) => {
		checkErr(err, res)
	})

}

const getFileId = (res, fsize) =>{
	let sql = "SELECT * FROM sk2.file WHERE f_size = $1"

	let createFile = '/home/skhm/YCSB/inputFile/fileGen.sh '//NoSQL상태점검 스크립트 파일명(경로 명시 필요)
	let savePath = '/home/skhm/YCSB/inputFile/'
	let inputPath = ''
	return	new Promise(function(resolve, reject) {

		funcQuery(sql, [fsize], (err, results) =>{	

			checkErr(err, res)
			if(results.rows.length > 0)
			{
				resolve(results.rows[0].f_id)
			}
			else{
				inputPath=savePath+"input"+fsize
//				console.log("command = " + createFile+fsize+"KB "+inputPath)
				execSync("sh " +createFile+fsize+"KB "+inputPath)
//				console.log("input = " + inputPath)
				if(fs.existsSync(inputPath)){						
					insertAndSelectFile(res, [fsize, inputPath]).then( f_id => {
//					console.log("f_then" + f_id)
						resolve(f_id)
					})
				}
			}
		})
	})
}

//워크로드 추가 & update
const modifyWorkload = (req, res) => {
	logger.debug("MODIFY WORKLOAD " + req.body.data.modifyFlag) 
	const insertRow = (res, filePath, wlFileProps, data)=>{

		writePropfile(res, 
				{
				"filePath" : filePath,
				"wlFileProps" : wlFileProps
				})

		insertAndSelect(res, data)

	} 

	const updateRow = (res, filePath, wlFileProps, data)=>{

		writePropfile(res, 
				{
				"filePath" : filePath,
				"wlFileProps" : wlFileProps
				})
		let updateSql =  'UPDATE sk2.workload '+
			'SET w_name=$1, w_read=$2, w_insert=$3, w_update=$4, w_readmodifywrite=$5, w_scan=$6, f_id=$9, w_record_count=$8'+
			'WHERE w_id = $7'

			simpleQuery(updateSql, res, 1 ,data)

	}

		var date = new Date()
		let convD = convertDate(date)
		


//		DEBUG(req.body)
//		console.log(req.body)
		//insert
		if(req.body.data.modifyFlag == 0){
			
			let wName = req.body.data.w_name
			let wlFileProps = req.body.data.propValues
			let fsize = wlFileProps.datasize
			let rp = wlFileProps.readproportion
			let up = wlFileProps.updateproportion
			let sp = wlFileProps.scanproportion
			let ip = wlFileProps.insertproportion
			let rmwp = wlFileProps.readmodifywriteproportion
			let filePath = settings.propPath+wName+date.getTime()
			let data = [ wName, filePath,rp, ip, up, rmwp, sp, convD, wlFileProps.recordcount]
//			let fId = -1
			let inputfPath = ''
//			console.log("fsize= " +fsize)
					
			if(fsize > 0){
				getFileId(res, fsize).then(fId => {
					data.push(fId)	
					insertRow(res, filePath, wlFileProps, data)
				}) 
			}else{
				data.push(null)	
				insertRow(res, filePath, wlFileProps, data)
			}
		//modify
		}else if(req.body.data.modifyFlag == 1){
			let wName = req.body.data.w_name
			let wlFileProps = req.body.data.propValues
			let rp = wlFileProps.readproportion
			let up = wlFileProps.updateproportion
			let sp = wlFileProps.scanproportion
			let ip = wlFileProps.insertproportion
			let rmwp = wlFileProps.readmodifywriteproportion
			let filePath = settings.propPath+wName+date.getTime()
			let fsize = wlFileProps.datasize
			let data = [ wName, filePath, rp, ip, up, rmwp, sp, convD, wlFileProps.recordcount]
			let wId = req.body.data.w_id
			let checkSql = 'SELECT w_freq_count, w_config_file_path FROM sk2.workload WHERE w_id = $1'
//			DEBUG(checkSql)

			funcQuery( checkSql, [wId], (err, results) =>
			{
				
				checkErr(err, res)
				//update
				if(results.rows[0].w_freq_count == 0)
				{
			
					if(fsize > 0){
						getFileId(res, fsize).then(fId => {
							updateRow(res, results.rows[0].w_config_file_path, wlFileProps, [wName, rp, ip, up, rmwp, sp, wId, wlFileProps.recordcount , fId])
						}) 
					}else{

						updateRow(res, results.rows[0].w_config_file_path, wlFileProps, [wName, rp, ip, up, rmwp, sp, wId, wlFileProps.recordcount ,null])
					}	
						
				//create 	
				} else{
					let updateSql = 'UPDATE sk2.workload '+
	'SET w_d_timestamp = now(), w_d_flag = 1 '+
	'WHERE w_id = $1'
					
//					DEBUG(updateSql)

					funcQuery(updateSql, [wId], (err, results) =>{

						checkErr(err, res)
						if(fsize > 0){
						getFileId(res, fsize).then(fId => {
							data.push(fId)	
							insertRow(res, filePath, wlFileProps, data)
							}) 
						}else{
							data.push(null)	
							insertRow(res, filePath, wlFileProps, data)
						}

					})
				}
				
			})
		//copy
		}else{
			let wId = req.body.data.w_id
			let checkSql = 'SELECT * FROM sk2.workload WHERE w_id = $1'		
//			console.log(req.body)		
//			DEBUG(checkSql)
			funcQuery( checkSql, [wId], (err, results) => {
				checkErr(err, res)
				let row = results.rows[0]
				let name = row.w_name+'_copy'
				let filePath = settings.propPath+name+date.getTime()
				fs.copyFile(row.w_config_file_path, filePath, (err) =>
				{
					checkErr(err, res)
				})
				
				let data = [ name, filePath, row.w_read, row.w_insert, row.w_update,  row.w_readmodifywrite, row.w_scan, convD, row.w_record_count,  row.f_id]
				insertAndSelect(res, data)	
			})
		}
		

}

const getResults = (req, res) => {
	logger.debug("GET RESULTS")

	let sql = 'SELECT * FROM sk2.run'
//	DEBUG(sql)
	let rtv = null
	funcQuery(sql, [], (err, run_results) =>{
		checkErr(err, res)
		rtv = run_results.rows
		sql = 'SELECT r_id, nc_id, w_id FROM sk2.run_relation ORDER BY r_id, nc_id'	
		funcQuery(sql, [], (err, results) =>{

			checkErr(err, res)
			if(results.rows.length > 0 ){
				let _rid = -1// results.rows[0].r_id
				let _nid = -1//results.rows[0].n_id
				let w_ids=[]
				
				//prev rid, node id, flag(row, node), new rid, node id, workload
				itemFind = (flag, _nr, _nn, _nw)  => {
					rtv.forEach( r => {
						if(r.r_id === _rid)	{
							if(typeof r.relation === 'undefined')
								r.relation = []
							r.relation.push({'nc_id' : _nid, 'w_ids' : w_ids})
							return	
						}
					})
					if(flag === 0)
						_rid = _nr
					_nid = _nn
					w_ids = [_nw]

				}
				results.rows.forEach(row=>{

					if(row.r_id != _rid) {
						itemFind(0, row.r_id, row.nc_id, row.w_id)
					}else if(row.nc_id != _nid){
						itemFind(1, row.r_id, row.nc_id, row.w_id)
					}else{
						w_ids.push(row.w_id)					
					}		
				})
				if(w_ids.length > 0)
					itemFind(0, -1, -1, -1)
			}		

			res.statusCode = 200
			res.send(rtv)
			res.end()

		})

	})

}

const readFileResult = (rows, flag) =>{
	return new Promise(function (resolve, reject) {
		for(let i = 0; i < rows.length; i++){
			let data = fs.readFileSync(rows[i].ycsb_result_path).toString()
//				checkErr(err)
//			console.log(data)
			if(flag == 0){
				rows[i].ycsb = JSON.parse(data)
			}
			else if(flag==1){
				rows[i].error = data;
			}
			
//				console.log(row.ycsb)
		
		}
//		console.log(rows)
		resolve(rows)
	})
}

const getResultY = (req, res) => {

	logger.debug("GET RESULT YCSB " + req.query.r_id)

	let sql = 'SELECT nc_id, w_id, ycsb_result_path FROM sk2.run_relation rr, sk2.ycsb_result yr WHERE rr.r_id = $1 AND rr.rr_id = yr.rr_id'
	let rId = req.query.r_id;
//	console.log("rid="+rId)
//	DEBUG(sql)
	funcQuery(sql, [rId], (err, results) => {
		checkErr(err, res)
		readFileResult(results.rows, 0).then( rows =>{
			res.statusCode = 200
			res.send(rows)
			res.end()
		})
	})	
}

const getResultE = (req, res) =>{
	
	logger.debug("GET RESULT ERROR " + req.query.r_id)

	let sql = 'SELECT nc_id, w_id, ycsb_result_path FROM sk2.run_relation rr, sk2.ycsb_result yr WHERE rr.r_id = $1 AND rr.rr_id = yr.rr_id AND ycsb_result_path LIKE \'%error%\';'
	let rId = req.query.r_id
	funcQuery(sql, [rId], (err, results) =>{
		checkErr(err, res)	
		readFileResult(results.rows, 1).then( rows =>{
			res.statusCode = 200
			res.send(rows)
			res.end()
		})
	})
}

const getResultIO = (req, res) =>{
	
	logger.debug("GET RESULT ERROR " + req.query.r_id)

	let sql = 'SELECT io_result_path FROM sk2.io_result WHERE r_id = $1'
	let rId = req.query.r_id
	funcQuery(sql, [rId], (err, results) =>{
		checkErr(err, res)	
		let rtv = []
		fs.readdir(results.rows[0].io_result_path, (err, files) =>{
			let temp = {}
//			let num = files.length / 4
			files.forEach( file =>{
				let sp = file.split('_')
				if(!sp[1].includes('raw')){
					if(typeof temp[sp[0]] === 'undefined'){
						temp[sp[0]] = rtv.length
						rtv.push({"ip" : sp[0]})
					}
					
	//				console.log(file)
					let data = fs.readFileSync(results.rows[0].io_result_path+"/"+file).toString()
					rtv[temp[sp[0]]][sp[1].split('.')[0]] = JSON.parse(data) 			
				}
			})
			res.statusCode = 200
			res.send(rtv)
			res.end()

		})
	})
}


const getResultRAW = (req, res) =>{

	let sql = 'SELECT io_result_path FROM sk2.io_result WHERE r_id = $1'
	let rId = req.query.r_id
	let host = req.query.host
	console.log(rId +", " +host)
	funcQuery(sql, [rId], (err, results) =>{
		checkErr(err, res)	
		let rtv = []
		let fileName = host+"_raw.json"
		let rawfile = results.rows[0].io_result_path+"/"+fileName
/*
		let targetPath = "C:/benchmark_results/benchmark"+rId+"/"
		let mimetype = "text/plain"
		res.setHeader('Content-disposition', 'attachement; filename='+rawfile)
		res.setHeader('Content-type', mimetype)
		var filestream = fs.createReadStream(targetPath+fileName)	
		filestream.pipe(res)*/
		res.download(rawfile)

	})
}




const getSpecs = (req, res) =>{

	logger.debug("GET SPECS")

	let sql = 'SELECT * FROM sk2.node_spec AS ns, sk2.node_relation AS nr WHERE ns.ip = nr.ip' 
//	DEBUG(sql)
	simpleQuery(sql, res, 0)
}

const getDBs = (req, res) => {
		
	logger.debug("GET DBs")

	let sql = 'SELECT * FROM sk2.nosql AS n, sk2.nosql_config AS c WHERE n.n_id = c.n_id'
//	DEBUG(sql)
	funcQuery(sql, [], (err, results) =>{
		checkErr(err, res)
		let rtv = []
		let offsets = []
		sql = 'SELECT * FROM sk2.node_spec AS ns, sk2.node_relation AS nr WHERE ns.ip = nr.ip' 
		funcQuery(sql, [], (err, spec_results)=>{
			checkErr(err, res)
			let specs = spec_results.rows
		//	console.log(specs)
		//	console.log(results.rows)
			results.rows.forEach( row =>{

				let nId = row.n_id
				let offset = offsets.indexOf(nId) 
				if(offset  == -1){
					offsets.push(nId)
					rtv.push({
						n_id : nId,
						n_name : row.n_name,
						n_version : row.n_version,
						dbconfigs : [{
							n_id : nId,
							n_name : row.n_name,
							n_version : row.n_version,
							nc_id: row.nc_id,
							nc_name: row.nc_name,
							n_node_count: row.n_node_count,
							n_log_path: row.n_log_path,
							n_config_file_path: row.n_config_file_path,
							n_io_instance_name: row.n_io_instance_name,
							n_io_tracer_path: row.n_io_tracer_path,
							n_d_flag: row.n_d_flag,
							n_d_timestamp: row.n_d_timestamp,
							specs : specs.filter( item  => item.nc_id == row.nc_id)						
						}],
					})
				}else{
					rtv[offset].dbconfigs.push({
						n_id : nId,
						n_name : row.n_name,
						n_version : row.n_version,
						nc_id: row.nc_id,
						nc_name: row.nc_name,
						n_node_count: row.n_node_count,
						n_log_path: row.n_log_path,
						n_config_file_path: row.n_config_file_path,
						n_io_instance_name: row.n_io_instance_name,
						n_io_tracer_path: row.n_io_tracer_path,
						n_d_flag: row.n_d_flag,
						n_d_timestamp: row.n_d_timestamp,
						specs : specs.filter( item  => item.nc_id == row.nc_id)						
					})
				}

			})
			res.statusCode = 200
			res.send(rtv)
			res.end()
		})

	})
}

const deleteWorkload = (req, res) => {

	logger.debug("DELETE WORKLOAD " + req.query.w_ids)
	let sql = 'UPDATE sk2.workload SET w_d_flag = 1, w_d_timestamp = now() WHERE w_id in ('+req.query.w_ids+')'

//	console.log( req.query)
//	DEBUG(sql)
	simpleQuery(sql, res, 1)
}


const setErrorAndMsg = (rId, r_name) =>{

	var date = new Date()
	let convD = convertDate(date)
	let sql = 'UPDATE sk2.run SET r_status_flag=2, r_e_timestamp=now() WHERE r_id = $1'
	let errCountSql = 'UPDATE sk2.workload SET w_error_count=w_errorcount+1 WHERE w_id = $1'
	simpleQuery(sql, null, 2, [rId])	
	sql = 'SELECT w_id FROM sk2.run_relation WHERE r_id = $1'	
	funcQuery(sql, [rId], (err, results)=>{
		checkErr(err)
		results.rows.forEach(row =>{
			simpleQuery(errCountSql, null, 2, [row.w_id])
			alarm.emit("msg", data.r_name)
		})

	})
} 


const killAll = (hosts, rId, data) =>{
	let end_cmd = "ssh -q -t "
	let kill_cmd = " kill -2 " 
	let rm_cmd = " && rm -rf /var/run/iotracer.pid"
	let stop_cmd_1 = "ssh " 
	let stop_cmd_2 = " \"while [[ : ]]; do sudo kill -0 " 
	let stop_cmd_3 = " && sleep 1 || break; done\""
	hosts.forEach( (host) =>{
		if(host.pid != -1){
			let temp = end_cmd+host.hostname+kill_cmd+host.pid+rm_cmd
			let temp2 = stop_cmd_1 + host.hostname + stop_cmd_2 + host.pid + stop_cmd_3
			
			logger.debug(temp)
			logger.debug(temp2)

			execSync(temp)
			execSync(temp2)
		}
	})	
	if(rId != -1){
//		setTimeout(()=>{

			let io_data = {
					"meta" : {
						"type" : "NOSQL",
						"hostnames" : hostnames
					},
					"instance" : "cassandra",
					"watch_directory": "/ssdStorage",
					"device_manager": "/root/pack/drive-manager",
					"window_size": data.r_window_size,
					"threshold": data.r_threshold, 
					"result": "/root/output/"+rId

			}	
			let run_cmd = "echo \'" + JSON.stringify(io_data) + "\' | bash /root/scripts/bm_result.sh"
			logger.debug(run_cmd)
			exec(run_cmd, (err, stdout, stderr) =>{
				logger.debug("run cmd")
				checkErr(err)
				logger.debug(err)
				logger.debug(stdout)
				let base = "/home/skhm/IO_TRACER/"+rId 
				exec("mkdir -p "+base, (err, stdout, stderr) =>{
					let sql = "INSERT INTO sk2.io_result(p_kid, r_id, io_result_path) VALUES (1, $1, $2)"
					simpleQuery(sql, null, 2, [rId, base])
					hosts.forEach( (host)=>{
						let move_cmd = "mv "+host.hostname+"_"					
	//					let targetDir = 
						exec(move_cmd+"raw.json "+base)
						exec(move_cmd+"trace.json "+base)
						exec(move_cmd+"threshold.json "+base)
						exec(move_cmd+"dmdu.json "+base)
					})

				})
			})

//		}, 15000) //15sec
	}	

}



const n_Check = (times, result_file, check_file, rId, runYCSB, data) => {
//	let timeout//setTimeout을 clearTimeout하기 위한 역할의 변수
	if(times<1){
		return
	}

	function loop(){//해당 loop는 상태점검 결과파일이 생성될 때까지 실행을 잠시 멈추는 코드
		setTimeout(()=>{
			if(fs.existsSync(result_file)){//NoSQL상태점검 결과파일이 생성될 디렉터리 상 파일
			return;
			}else{
				logger.debug("NoSQL 상태점검 완료 대기 중.")
				loop()
			}
		}, 500)
	}

	loop()//상태점검파일이 디렉터리에 생길 때까지 실행을 멈춤.

	timeout = setTimeout(function(){
		
		if(times==1){//여기서 타임을 검사하는 이유는 node.js가 asynchronous하게 동작하기 때문에
			setErrorAndMsg(rId, data.r_name)	
			//res.status(404).end()
			logger.debug('Failed to re-run NoSQL.')
			return
		}
//		console.log("result = " + result_file)
		fs.readFile(result_file, function(err, rdata){//nosql.json은 상태점검결과 파일에 상응함.
			checkErr(err)

			let isActive = JSON.parse(rdata)
			if(isActive.result === 'active'){
				logger.debug('NoSQL in stable state. Benchmark will soon begin..')
				clearTimeout(timeout)
				//#TODO - dynamic hostnames

				let io_data = {
						"meta" : {
							"type" : "NOSQL",
							"hostnames" : hostnames
						},
						"instance" : "cassandra", //#TODO
						"watch_directory": "/ssdStorage", //#TODO
						"device_manager": "/root/pack/drive-manager", 
						"window_size": data.r_window_size,
						"threshold": data.r_threshold,
						"result": "/root/output/"+rId
				}	

				let run_cmd = "echo \'" + JSON.stringify(io_data) + "\' | bash /root/scripts/bm_start.sh"
				logger.debug(run_cmd)

				exec(run_cmd,  (err, stdout, stderr) =>{
						checkErr(err)
						logger.debug(err)
						console.log(stdout)
						console.log(err)
						let rtv = JSON.parse(stdout)
						if(rtv.status[0].pid < 0 )
						{
							logger.debug("IO TRACE Error")
							setErrorAndMsg(rId, data.r_name)	
							return
								
						}else{
							//save pid
							logger.debug(rtv)
							if(rtv.status.filter(x => x.pid == -1).length > 0){
								killAll(rtv.status, -1)							
								setErrorAndMsg(rId, data.r_name)
								return
							}
							else{
								pids.set(rId, rtv.status)
								//YCSB 실행 코드가 들어갈 부위.
								exec('java -jar '+runYCSB+' '+rId, function(err, stdout, stderr){//runnable jar 파일로 만들어줘야 실행이 가능함. java(X), 그냥 jar도 (X							
									logger.debug("java run end")
									alarm.emit("msg", data.r_name)
									checkErr(err)
									killAll(pids.get(rId), rId, data)
									pids.delete(rId)
									//send alarm
									
//									let sql = 'SELECT r_status_flag FROM sk2.run WHERE r_id = $1'	
//									
//									funcQuery(sql, [rId], (err, results) =>{
//										checkErr(err)
//										switch(results.rows[0].r_status_flag){
//											case 2 : //error 
//												break; 
//											case 3 : //complete
//												break;
//										}
//
//									})
									return	
								})//자바 파일 실행하는 코드*/
							}

						}

						
				})
			}else{
				logger.debug('Re-running requested nosql. Please wait for a moment.')//nosql에 이상이 있어서 재구동 중임.
				var script = exec(check_file, (err, stdout, stderr)=>{
					//아래 코드는 파일을 종료시키고 나서 실행되는 코드. (file close)
					checkErr(err)
				})
				n_Check(times-1, result_file, check_file, rId, runYCSB, data)
			}
		})

	}, 3000)
}



const executeBenchmark = (req, res) => {
	
	logger.debug("EXECUTE BENCHMARK " + req.body.data)
	var date = new Date()
	let convD = convertDate(date)
	let r_id

	let r_window_size = req.body.data.r_window_size
	let r_threshold = req.body.data.r_threshold

	if(typeof r_window_size === 'undefined')
		r_window_size = 10
	if(typeof r_threshold === 'undefined')
		r_threshold = 1000

	let r_name = req.body.data.r_name
	let settings = req.body.data.benchmarks
//	console.log(req.body)
//	console.log(settings.w_ids)

	let checkNosql= '/home/skhm/song_test/checkNosql.sh 0'//NoSQL상태점검 스크립트 파일명(경로 명시 필요)
	let runYCSB='/home/skhm/test_sb/App.jar'
	let nodeStatus='/home/skhm/song_test/result.json'

	let times=5//setTimeout 내 함수 반복 횟수
	
	
	insertAndSelectBench(res,[convD, r_window_size, r_threshold, ''+r_name]).then(rId => {
		let sql = 'INSERT INTO sk2.run_relation (r_id, nc_id, w_id) VALUES($1, $2, $3)'
		let count = "UPDATE sk2.workload SET w_freq_count = w_freq_count + 1 WHERE w_id = $1"

		settings.forEach(db =>{
			db.w_ids.forEach(wid =>{
				funcQuery(sql, [rId, db.nc_id, wid], (err, results)=>{
					checkErr(err, res)
					funcQuery(count, [wid], (err2 , results2) =>{
						checkErr(err, res)
					})
				})
			})
		}) 
		res.status(204).end()

		
		exec(checkNosql, (err, stdout, stderr)=>{
			//아래 코드는 파일을 종료시키고 나서 실행되는 코드. (file close)
			checkErr(err)
		})

		n_Check(times, ''+nodeStatus, checkNosql, rId, runYCSB, req.body.data)
	}).catch( err =>{
		res.status(404).end()
		throw err
	})

	    
}

const testStop = (req, res) => {
		//if ended =>

	let end_cmd = "ssh -q -t "
	let kill_cmd = " kill -9 " 
	hostnames.forEach( (host) =>{
		let temp = end_cmd+host.hostname+kill_cmd+pid
		logger.debug(temp)
		exec(temp, (err, stdout, stderr) =>{

			//get result
			checkErr(err)
			logger.debug(stderr)
			logger.debug("STOP SAFELY")
			res.statusCode = 200
			res.send("{STATUS : STOP}")
			res.end()
		})
	})	

}

const testResult= (req, res) => {
	let data = {
		"meta" : {
			"type" : "NOSQL",
			"hostnames" : hostnames
		},
		"instance" : "cassandra",
		"watch_directory": "/ssdStorage",
		"device_manager": "/root/pack/drive-manager",
		"window_size": 10,
		"threshold": 99.9999,
		"result": "/root/output/0"

	}	
	let run_cmd = "echo \'" + JSON.stringify(data) + "\' | bash /root/scripts/bm_result.sh"
	logger.debug(run_cmd)
	exec(run_cmd, (err, stdout, stderr) =>{
		logger.debug("run cmd")
		checkErr(err)
		logger.debug(err)
		logger.debug(stdout)
		res.statusCode = 200
		res.send(stdout)
		res.end()
		//run ycsb 
	})


}


const testRun = (req, res) => {
	let data = {
		"meta" : {
			"type" : "NOSQL",
			"hostnames" : hostnames
		},
		"instance" : "cassandra",
		"watch_directory": "/ssdStorage",
		"device_manager": "/root/pack/drive-manager",
		"window_size": 10,
		"threshold": 99.9999,
		"result": "/root/output/0"
	}	
	let run_cmd = "echo \'" + JSON.stringify(data) + "\' | bash /root/scripts/bm_start.sh"
	logger.debug(run_cmd)
	console.log(run_cmd)

	

	//make file
//	fs.writeFile("/root/scripts/test.conf", JSON.stringify(data), (err) => {
//		logger.debug("make file")
//		checkErr(err)
//		logger.debug(err)
//
		exec(run_cmd, (err, stdout, stderr) =>{
			logger.debug("run cmd")
			checkErr(err)
			logger.debug(err)
			console.log(stdout)
			console.log(err)
			let rtv = JSON.parse(stdout)	
			if(rtv.status[0].pid < 0 )
			{
				logger.debug("Error")
			}else{
				//save pid
				logger.debug(rtv)
				pid = rtv.status[0].pid
			}
	
			res.statusCode = 200
			res.send(stdout)
			res.end()
			//run ycsb 
		})


//	})
//	let make_cmd = "sshpass -p netdb3230 ssh 203.255.92.193 'echo "+ util.inspect(data) +" > /root/disksnoop/scripts/test.conf\'"

	//run sh
}



module.exports = {
	getWorkloads,
	getWorkload,
	getWorkloadMany,
	deleteWorkload,
	modifyWorkload,
	getDBs,
	getResultY,
	getResultE,
	getResultIO,
	getResults,
	getResultRAW,
	executeBenchmark,
	getSpecs,
	testRun,
	testStop,
	testResult,
}
