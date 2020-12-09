import axios from 'axios'

const request = opts => {
  return new Promise(resolve => axios({
    ...opts, url: 'http://' + 'autotest2.geekplus.cc' + ':8080' + opts.url
    // ...opts, url: 'http://192.168.1.122:8080' + opts.url
    // ...opts, url: 'http://172.16.3.61:8080' + opts.url
    // ...opts, url: 'http://172.16.30.151:8080' + opts.url
    // ...opts, url: 'http://172.18.1.42:8080' + opts.url
  }).then(data => {
    resolve(data.data)
  }))
}

const GET = (url, params) => request({ method: 'GET', url, params })
const POST = (url, data) => request({ method: 'POST', url, data })

export const getCells = () => GET('/map/cells')
export const getRobots = () => GET('/robot/all')
export const addRobot = cellCode => POST('/robot/add', { cellCode })
export const removeRobot = robotId => GET(`/robot/remove/${robotId}`)
export const addTask = (robotId, cellCode) => POST(`/task/add`, { robotId, cellCode })
export const setObstacles = (cellCode, status) => POST('/map/obstacle/modify', { cellCode, status })
export const getMode = () => GET('/system/mode/get')
export const setMode = mode => GET(`/system/mode/set/${mode}`)
