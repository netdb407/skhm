import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex);
import { format, subDays } from 'date-fns'
// --------------------------------변수 선언 -------------------------------------------------------------------------------------------------
const addr = "http://203.255.92.192/"
const msg = {
  timeout : 3000, //3s
  remove : "정상적으로 삭제되었습니다.",
  insert : "정상적으로 추가되었습니다.",
  update : "정상적으로 변경되었습니다.",
  fail   : "비정상적인 응답입니다.",
  run    : "벤치마킹이 시작되었습니다."
}
const defaultWL =
{  "w_name" : "",
"propValues" :{
  "recordcount" : 1,
  "operationcount" : 1,
  "threadcount" : 1,
  "fieldcount": 10,
  "fieldlength": 100,
  "fieldnameprefix": "field",
  "hdrhistogram.percentiles": [95,99],
  "insertcount": 1,
  "insertorder": "hashed",
  "insertproportion": 0,
  "insertstart": 0,
  "maxscanlength": 1000,
  "minfieldlength": 1,
  "minscanlength": 1,
  "readallfields": true,
  "readmodifywriteproportion":0,
  "readproportion": 95,
  "requestdistribution": "uniform",
  "scanlengthdistribution": "uniform",
  "scanproportion": 0,
  "updateproportion": 5,
  "writeallfields": false,
  "zeropadding":1,
  "datasize": 100
}
}

const dateFormat = (date) => {
  const createTime = new Date(date)
  let year = createTime.getFullYear()
  let month = ("0"+(createTime.getMonth()+1)).slice(-2)
  let day = ("0" + createTime.getDate()).slice(-2)
  let hr = ("0" + createTime.getHours()).slice(-2)
  let min = ("0" + createTime.getMinutes()).slice(-2)
  let sec = ("0" + createTime.getSeconds()).slice(-2)
  let totalDate = year + '-' + month + '-' + day + ' ' + hr + ':' + min + ':' + sec
  if(year == 1970) {
    totalDate = null
  } return totalDate
}

//벤치마킹 결과 페이지 - 총 소요시간 포맷
const timestampFormat = (str, end) => {
  const strTime = new Date(str)
  const endTime = new Date(end)
  let diffTime = Math.abs(endTime.getTime() - strTime.getTime())

  let d = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  diffTime -= d * (1000 * 60 * 60 * 24)

  let h = Math.floor(diffTime / (1000 * 60 * 60))
  diffTime -= h * (1000 * 60 * 60)

  let m = Math.floor(diffTime / (1000 * 60))
  diffTime -= m * (1000 * 60)

  let s = Math.floor(diffTime / (1000 ))
  // diffTime -= h * (1000 * 60)

  return d + '일 ' + h + '시간 ' + m + '분 ' + s +'초 '
  // return m + '분 ' + s +'초 '
}


//snackbar
const showSnack = (msg, ctxt) =>{
  ctxt.commit('showSnack', msg)
}

//loading bar
const showLoading = ctxt =>{
  ctxt.commit('setIsLoading', true)
}

const loadingCheck = ctxt => {
  if(ctxt.state.isLoading)
  ctxt.commit('setIsLoading', false)
}


//flag 'GET', 'POST'
const REQ = (url, flag, context, data) => {
  const errFunc = (error) =>{
    loadingCheck(context)
    showSnack(msg.fail, context)
    // console.log(error)
  }
  showLoading(context)
  if(flag === 'GET'){
    return axios.get(addr+url, { params : data })
    .catch( errFunc )
  }else{
    return axios.post(addr+url, { data })
    .catch( errFunc )
  }
}


// --------------------------------/변수 선언 ---------------------------------------------------------------------------------------------



export const store = new Vuex.Store({
  // --------------------------------state -------------------------------------------------------------------------------------------------
  state : {
    isLoading : false,
    snack : { isShow : false , msg : ""},
    WLfiles : [],                                     //워크로드 전체(d_flag = 0, 1)
    WLfilesFilter : [],                               //삭제되지 않은 워크로드(d_flag = 0)
    selectedWorkload : Object.assign({},defaultWL),   // clicked workload now
    loadedWorkloads : [],                             // loaded workload
    insertWorkload :  Object.assign({},defaultWL),    //for Dialog insert
    DBfiles : [],
    DBfilesConfigs : [],                                     //DBconfig파일
    selectedDB : {},
    benchmarks : [],        //벤치마킹 DB별 WL파일 매칭하여 저장
    BMresultsOri : [],      //YCSB 결과 origin상태
    BMresultsFilter : [],   //date, status flag를 필터링하는 것
    BMresults : [],         //화면에 보여질 필터링한 최종 결과 파일, relation(n_id, w_ids의 상세 정보가 담겨있음)
    WLpropMany : [],        //벤치마킹 정보보기 페이지에서 사용할 워크로드 별 propValues를 저장
    ResultIO : [],
    activeTab : null,
    tabs : [
      {
        id: 0,
        title: '전체 결과',
        canClose : false,
        comp: 'BM_result',
        isActive : true,
        contents:[],
        w_ids:[],
      }
    ],

  },
  // --------------------------------/state -------------------------------------------------------------------------------------------------



  // --------------------------------mutations -------------------------------------------------------------------------------------------------
  mutations : {
    //snackbar
    closeSnack : (state) =>{
      state.snack.isShow = false
    },
    showSnack : (state, message) =>{
      state.snack = {isShow : true, msg : message, timeout : msg.timeout }
    },

    setIsLoading : (state, payload) => {
      state.isLoading = payload
    },
    // ---------------mutations 워크로드 설정 page---------------- //

    setWLfiles : (state, payload) =>  {
      state.WLfiles = payload
      state.WLfilesFilter = payload.filter(item => item.w_d_flag == 0)

    },


    setIsActive : (state, payload) =>  {
      const wId = payload
      state.WLfiles.forEach(value => {
        if (value.w_id === wId) value.isActive = true
        else value.isActive = false
      })
    },
    //2. 클릭한 워크로드 파일의 w_id와 일치하는 값을 가져와 state 변경
    setSelectedWorkload : (state, payload) => {
      if(typeof payload.w_id === 'undefined')
      state.selectedWorkload = Object.assign({}, defaultWL)
      else
      state.selectedWorkload = payload
    },

    setInsertWorkload : (state) =>{
      state.insertWorkload = Object.assign({},defaultWL)
    },

    addLoadedWorkloads : (state, wl) => {
      state.selectedWorkload = wl
    },

    addWorkload : (state, wl) => {
      state.WLfiles.push(wl)
      state.WLfilesFilter.push(wl)

    },

    //워크로드 삭제
    deleteWorkload: (state, wId) => {
      state.WLfiles.forEach((state, wId) =>{
        if(state.w_id == wId)
        {
          if(state.w_d_flag == 0) { //삭제 안된 flag를
            state.w_d_flag = 1 //삭제 flag로 변경
            state.w_d_flagStr = 'Y'
          }
          return
        }
      })
      state.WLfilesFilter.forEach((item, idx) => {
        if(item.w_id == wId)
        {
          state.WLfilesFilter.splice(idx, 1)  //삭제flag로 바뀐 데이터 뺌
          return
        }
      })

    },

    updateWorkload : (state, wId) =>{
      //워크로드 설정 페이지의 워크로드 테이블에 보여지는 값 새로 업데이트
      let temp = state.selectedWorkload
      state.WLfiles.forEach((item) =>{
        if(item.w_id == wId)
        {
          item.w_name = temp.w_name
          item.w_read = temp.propValues.readproportion
          item.w_update = temp.propValues.updateproportion
          item.w_insert = temp.propValues.insertproportion
          item.w_scan = temp.propValues.scanproportion
          item.w_readmodifywrite = temp.propValues.readmodifywriteproportion
          item.totalOperation = 'Read:' + item.w_read + '/' + ' Update:'+item.w_update + '/' +
          ' Insert:'+ item.w_insert + '/' + ' Scan:' + item.w_scan + '/' + ' RMW:' + item.w_readmodifywrite
          return
        }
      })
    },

    // ---------------/mutations 워크로드 설정 page---------------- //



    // ---------------mutations DB 설정 page---------------- //
    setDBfiles : (state, DB) => {
      state.DBfiles = DB
      // console.log(DB);

      let nc_idTemp = []
      state.DBfiles.forEach(db=> {
        db.dbconfigs.forEach(x=>{
          nc_idTemp.push(x)
        })
      })

      DB.forEach(db =>{
        db.dbconfigs.forEach(s => {
          s.Dbconfigs = []
          s.Dbconfigs.push(nc_idTemp) //임시 변수를 이용해 데이터 넣음
          s.Dbconfigs.forEach(g => {
            state.DBfilesConfigs = g
          })
        })
      })
    },

    setSelectedDB : (state, payload) => {
      if(typeof payload.n_id === 'undefined')
      state.selectedDB = {}
      else
      state.selectedDB = payload
    },
    setIsActiveDB : (state, payload) =>  {
      const nId = payload
      state.DBfiles.forEach(value => {
        if (value.n_id === nId) value.isActive = true
        else value.isActive = false
      })
    },
    // ---------------/mutations DB 설정 page---------------- //

    // ---------------/mutations DB 설정 page---------------- //



    // ---------------mutations 벤치마크 실행 page---------------- //
    setItems : (state, payload) => {
      state.benchmarks = payload
      // console.log(state.benchmarks);
    },

    removeItem : (state, payload) => {
      state.benchmarks[0].workloads.splice(payload, 1)
    },

    checkDBList : function(state, payload){
      let id = payload.nc_id
      let config_name = payload.drg_name
      let containCheck = false
      state.benchmarks
      .forEach((item)=> {
        if(item.nc_id === id){
          containCheck = true
          return
        }
      })
      if(!containCheck){
        state.benchmarks.push({"nc_id" : id, "drg_name" : config_name, "w_ids" : []})
      }
      return state.benchmarks
    },


    // ---------------/mutations 벤치마크 실행 page---------------- //



    // ---------------mutations 벤치마킹 결과 page---------------- //
    setWLpropMany : (state, payload) =>  {
      state.WLpropMany = payload
      // console.log(state.WLpropMany);
    },


    setBMresults : (state, _benchmarks) =>  {
      //DBconfigs파일 정보 넣기 위해 임시 변수 생성
      let nc_idTemp = []
      state.DBfiles.forEach(DB=> {
        DB.dbconfigs.forEach(x=>{
          nc_idTemp.push(x)
        })
      })
      _benchmarks.forEach(bm =>{
        bm.relation.forEach(n => {
          n.Dbconfigs = []
          n.Dbconfigs.push(nc_idTemp.find(x=> x.nc_id == n.nc_id)) //임시 변수를 이용해 데이터 넣음
          n.Dbconfigs.forEach(s => {
            s.specs.forEach(sp => {
              if(sp.n_role == 0) {
                sp.n_roleStr = 'Master'
              }else {
                sp.n_roleStr = 'Slave'
              }
            })
          })
          //워크로드 파일 정보와  propValues정보를 넣음
          n.wlconfigs = []
          n.w_ids.forEach(w_id =>{
            n.wlconfigs.push(state.WLfiles.find( x => x.w_id == w_id))

            n.wlconfigs[0].prop = {}
            state.WLpropMany.forEach(x=>{
              if(x.w_id == w_id){
                n.wlconfigs[0].prop = x.propValues
                //push함수는 배열에서만 사용하고 object에 데이터를 넣을 때는 = 으로
              }
            })
          })
        })
      })
      state.BMresultsOri = _benchmarks
      state.BMresultsFilter = _benchmarks
      state.BMresults = _benchmarks
    },


    setResultIO : (state, _resultIO) => {
      state.ResultIO = _resultIO
    },



    filterBMFlag : (state, payload) =>{
      let temp  = Object.assign([], state.BMresultsFilter)
      if(payload != 5){
        temp = temp.filter( item => item.r_status_flag == payload)
      }
      state.BMresults = temp
    },

    filterBMDate : (state, payload) =>{
      let temp  = Object.assign([], state.BMresultsOri)
      let strDate = null
      let endDate = null
      if(payload[0] !== null)
      strDate = new Date(payload[0]+" 00:00:00")
      else
      strDate = subDays(new Date(), 9999)
      if(payload[1] !== null)
      endDate = new Date(payload[1]+" 24:00:00")
      else
      endDate = new Date()

      temp = temp.filter(item => {
        let c = new Date(item.r_c_timestamp)
        let s = new Date(item.r_s_timestamp)
        let e = new Date(item.r_e_timestamp)
        if(c >= strDate && c <= endDate)
        return true
        if(s >= strDate && s <= endDate)
        return true
        if(e >= strDate && e <= endDate)
        return true
      })
      state.BMresultsFilter = temp
      state.BMresults = temp
    },

    setActiveTab: (state, id) =>{
      // let id = payload
      state.activeTab = id
      state.tabs.forEach((tab) =>{
        if (tab.id !== id) {
          tab.isActive = false
        }else{
          tab.isActive = true
        }
      })
    },

    addTab : (state, tab) =>{
      state.tabs.push(tab)
      state.activeTab = tab.id
    },


    closeTab :  (state, id) =>{
      //let index = state.tabs.indexOf(tab)
      let idx = -1
      state.tabs.forEach((data, i) => {
        if( data.id == id) {
          idx = i
          return
        }
      })
      if(idx !== -1){
        state.tabs.splice(idx, 1)
        state.activeTab = 0
      }
    },

  },
  // ---------------/mutations 벤치마킹 결과 page---------------- //

  // --------------------------------/mutations -------------------------------------------------------------------------------------------------



  // --------------------------------actions -------------------------------------------------------------------------------------------------
  actions : {
    // ---------------actions 워크로드 설정 page---------------- //

    // WLfiles의 데이터를 서버에서 가져오는 부분. 1. 파일 모두 가져옴
    getWLfiles: context => {
      return REQ('getWorkloads', 'GET', context )
      .then( response => {
        response.data.forEach( (value) => {
          value.w_c_timestamp = dateFormat(value.w_c_timestamp) //  = dateFormat(w_c_timestamp)
          value.isActive = false
          //벤치마크 실행page에서 워크로드 연산비율
          value.totalOperation = 'Read:' + value.w_read + '/' + ' Update:'+value.w_update + '/' +
          ' Insert:'+ value.w_insert + '/' + ' Scan:' + value.w_scan + '/' + ' RMW:' + value.w_readmodifywrite

          value.type = "wl"

          //삭제 여부 0:삭제 안됨, 1: 삭제됨
          if(value.w_d_flag == 0) {
            value.w_d_flagStr = 'N'
          }else{
            value.w_d_flagStr = 'Y'
          }

          // execute에서 사용할 w_name을 dra_name으로 정의
          value.drg_name = value.w_name
        })
        // console.log(response)
        context.commit('setWLfiles', response.data)
      }).then(loadingCheck(context))

    },

    //선택한 워크로드 파일의 상세정보 불러옴
    getSelectedWorkload : (context, wId) => { //워크로드 설정 페이지에서 보내주는 w_id
      return REQ('getWorkload', 'GET', context, {w_id : wId})
      .then( response => {
        let temp = response.data.propValues['hdrhistogram.percentiles']
        if(typeof temp === 'string')
        temp = temp.split(',')
        else{
          if(temp == 0) temp = []
          else          temp = [temp]
        }
        response.data.propValues['hdrhistogram.percentiles'] = temp
        response.data.w_c_timestamp = dateFormat(response.data.w_c_timestamp)
        context.commit('setSelectedWorkload', response.data)
        return response
      }).then(loadingCheck(context))
    },

    //워크로드 파일 삭제
    deleteWorkload: (context, wId) =>  {
      REQ('deleteWorkload', 'GET', context, {w_ids : wId})
      .then(response =>{
        if(response.status == 204){
          if(context.state.selectedWorkload.w_id == wId)
          context.commit('setSelectedWorkload', {})
          context.commit('deleteWorkload', wId)
        }
      }).then(()=>{
        loadingCheck(context)
        showSnack(msg.remove, context)
      })
    },
    //mdfy
    //flag = 0 : insert
    //flag = 1 : update
    //flag = 2 : copy
    modifyWorkload : (context, data) =>{
      let tmpFlag = data.modifyFlag
      //not copy
      if(tmpFlag != 2){ //copy제외
        if(tmpFlag == 0){  //insert
          data = Object.assign({}, context.state.insertWorkload)
        }else{   //update
          data = Object.assign({}, context.state.selectedWorkload)
        }
        data.modifyFlag = tmpFlag

        if(data.propValues['hdrhistogram.percentiles'].length == 0)
        data.propValues['hdrhistogram.percentiles'] = 0
        data.propValues.workload = 'com.yahoo.ycsb.workloads.CoreWorkload'
      }

      return REQ('modifyWorkload', 'POST', context, data)
      .then( response => {
        if(response.status == 204){ //update return
          context.commit('updateWorkload', data.w_id)
          showSnack(msg.update, context)
        }
        else{ //insert, update, copy

          if(tmpFlag == 1){ //update
            context.commit('deleteWorkload', data.w_id)
          }

          response.data[0].w_c_timestamp = dateFormat(response.data[0].w_c_timestamp)
          response.data[0].isActive = false
          context.commit('addWorkload', response.data[0])
          showSnack(msg.insert, context)
        }
        return response
      }).then(loadingCheck(context))
    },
    // ---------------/actions 워크로드 설정 page------------------------------------------------------------

    // ---------------actions DB 설정 page------------------------------------------------------------------


    getDBs : (context, data) =>{
      return REQ('getDBs', 'GET', context)
      .then( response =>{
        response.data.forEach( (value) => {
          value.dbconfigs.forEach( (dbconf) => {
            if(dbconf.n_d_flag == 0) {
              dbconf.n_d_flagStr = 'N'
            }else {
              dbconf.n_d_flagStr = 'Y'
            }

            // execute에서 사용할 nc_name을 drg_name으로 정의
            dbconf.drg_name = dbconf.nc_name
          })
        })
        // console.log(response)
        context.commit('setDBfiles', response.data)
        return response
      }).then(loadingCheck(context))
    },


    getSelectedDB : (context, nId) => { //payload는 워크로드 설정 페이지에서 보내주는 w_id
      return REQ('getDBs', 'GET', context, {n_id : nId})
      .then( response => {
        // let temp = response.data.propValues['hdrhistogram.percentiles']
        // if(typeof temp === 'string')
        // temp = temp.split(',')
        // else{
        //   if(temp == 0) temp = []
        //   else          temp = [temp]
        context.commit('setSelectedDB', response.data)
        return response
      }).then(loadingCheck(context))
    },
    // ---------------/actions DB 설정 page------------------------------------------------------------------





    // ---------------actions 벤치마크 실행 page-------------------------------------------------------------------
    // getBenchmarkData : (context, data) =>{
    //   REQ('', 'GET', context)
    //   .then( response =>{
    //     // console.log(response)
    //     context.commit('', response.data)
    //     return response
    //   }).then(loadingCheck(context))
    // },


    makeBenchmarks : (context, data) =>{
      let bs = context.state.benchmarks
      let nbm = []

      for(let i =0; i<bs.length ; i++){
        let b = {"nc_id" : bs[i].nc_id}
        nbm.push(b)
        let temp = []
        bs[i].w_ids.forEach(w => temp.push(w.w_id))
        nbm[i].w_ids = temp
      }
      data.benchmarks = nbm

      REQ('executeBenchmark', 'POST', context, data)
      .then( response =>{
        if(response.status == 204){
          showSnack(msg.run, context)
        }
        return response
      }).then(loadingCheck(context))
    },
    // ---------------actions 벤치마크 실행 page-------------------------------------------------------------------




    // --------------- actions 벤치마킹 결과 page-------------------------------------------------------------

    getBMresults: context => {
      REQ('getResults', 'GET', context )
      .then( response => {
        let wIds = []
        response.data.forEach( (value) => {
          //결과에서 expand로 테이블 더 보여지는 부분
          value.expanded = false
          value.relation.forEach(rel => {
            rel.w_ids.forEach(w => {
              //state.dispatch.getWLpropMany에 넘겨줄 워크로드 id
              wIds.push(w)
            })
          })
          //벤치마킹 수행 상태, 시간
          switch (value.r_status_flag )
          {
            case 0 : // ready
            value.flagStr = '수행준비'
            value.totalTimestamp = ''
            break;
            case 1 :
            value.flagStr = '수행 중'
            value.totalTimestamp = ''
            break;
            case 2 :
            value.flagStr  = '수행취소'
            value.graph = 'error'
            if(value.r_s_timestamp != null)
            value.totalTimestamp = timestampFormat(value.r_s_timestamp, value.r_e_timestamp)
            else
            value.totalTimestamp = timestampFormat(value.r_c_timestamp, value.r_e_timestamp)
            break;
            case 3 :
            value.flagStr  = '수행완료'
            value.graph = 'equalizer'
            value.totalTimestamp = timestampFormat(value.r_s_timestamp, value.r_e_timestamp)
            break;
          }
          value.r_c_timestamp = dateFormat(value.r_c_timestamp)
          value.r_s_timestamp = dateFormat(value.r_s_timestamp)
          value.r_e_timestamp = dateFormat(value.r_e_timestamp)
        })

        //r_id에 포함되는 DB, WL정보, WLpropValues 가져오는 부분. DB, WL, WLprop 모두 없는 경우
        if(context.state.DBfiles.length === 0 && context.state.WLfiles.length === 0 && context.state.WLpropMany.length === 0){
          context.dispatch('getDBs').then((res) => {
            context.dispatch('getWLfiles').then((res2) => {
              context.dispatch('getWLpropMany', wIds).then((res3) => {
                context.commit('setBMresults', response.data)
              })
            })
          })
          //store.state.BMresults 에 DB정보 없을 경우
        }else if(context.state.DBfiles.length === 0){
          context.dispatch('getDBs').then((res) => {
            context.dispatch('getWLpropMany', wIds).then((res2) => {
              context.commit('setBMresults', response.data)
            })
          })
          //store.state.BMresults 에 WL정보 없을 경우
        }else if(context.state.WLfiles.length === 0){
          context.dispatch('getWLfiles').then((res)=>{
            context.dispatch('getWLpropMany', wIds).then((res2)=>{
              context.commit('setBMresults', response.data)
            })
          })
          //DB, WL정보 다 있는 경우
        }else{
          context.commit('setBMresults', response.data)
        }
      }).then(loadingCheck(context))
    },





    getResultIO: (context, rId) => {
      return REQ('getResultIO', 'GET', context, {r_id : rId} )
      .then( response => {
          // context.commit('setResultIO', response.data)
          return response
        }
      ).then(loadingCheck(context))
    },




    getResultIOraw: (context, payload) => {
      // console.log(payload);
      const FileDownload = require('js-file-download')

      REQ('getResultRAW', 'GET', context, {"r_id" : payload.r_id, "host" : payload.ip} )
      .then( response => {
        // console.log(response);
          return response.data
          FileDownload(response.data, 'RAW.json')
        }
      ).then(loadingCheck(context))
    },




    getWLpropMany : (context, wIds) => {
      // console.log(wIds);
      return REQ('getWorkloadMany', 'GET', context, {w_ids : wIds})
      .then( response => {
        //hdrhistogram.percentiles로 데이터가 오는데 template에서 바인딩시킬때 머스태쉬 문법에서 .을 읽을 수 없어서 명칭 변경
          response.data.forEach(x => {
            x.propValues.hdrhistogram_percentiles = x.propValues['hdrhistogram.percentiles']
          })
          context.commit('setWLpropMany', response.data)
        }).then(loadingCheck(context))
      },




    getTabContents : (context, data) => {
      if(data.type === 'graph')             //벤치마킹 결과 graph
      {
        //#FIX ME: get Io result
        REQ('getResultY', 'GET', context, {"r_id" : data.r_id})
        .then( response => {
          // console.log(response);
            data.contents = {
              "YCSB" :  response.data,
              "DBWL" : context.state.BMresults.find(x=>x.r_id == data.r_id)
            }
            context.commit('addTab', data)
          })

        }else if(data.type === 'detail'){    //상세정보
          context.state.BMresults.forEach(bm =>  {
            if(bm.r_id == data.r_id){
              data.contents = context.state.BMresults.find(x=>x.r_id == data.r_id)
              context.commit('addTab', data)
            }
          })
        }
        else{                               //Error정보
            REQ('getResultE', 'GET', context, {"r_id" : data.r_id})
            .then( response => {
              data.contents = {
                "Error" : response.data
              }
              context.commit('addTab', data)
            }).then(loadingCheck(context))
        }
      },


      // --------------- /actions 벤치마킹 결과 page-------------------------------------------------------------
    }
    // --------------------------------/actions -------------------------------------------------------------------------------------------------

  });
