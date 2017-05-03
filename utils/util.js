var app = getApp()
import { changeRefreshState } from '../actions'
const Store = app.Store
const dispatch = Store.dispatch

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTimeB(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function calTimeStamp(date, time) {
  var stringTime = date + ' ' + time+':00';
  var timestamp = Date.parse(stringTime.replace(/-/g,'/'));
  timestamp = timestamp / 1000;
  return timestamp;
}

function isEmpty(strings) {
  if (typeof (strings) == "undefined" || strings == null || !strings) {
    return true;
  }
  var regu = "^[ ]+$";
  var re = new RegExp(regu);
  if (re.test(strings)) {
    return true;
  }
  if (strings.replace(/(^s*)|(s*$)/g, "").length == 0) {
    return true;
  }
  return false;
}

function isPhone(num) {

  var reg = /^0?1[3|4|5|8][0-9]\d{8}$/;
  if (reg.test(num)) {
    return true;
  } else {
    return false;
  };

}


function randomNum(under, over) {
  switch (arguments.length) {
    case 1: return parseInt(Math.random() * under + 1);
    case 2: return parseInt(Math.random() * (over - under + 1) + under);
    default: return 0;
  }
}

function dispatchRefreshParam(states) {
  dispatch(changeRefreshState(states))
}

function timeWithZero(time) {
  if (time < 10) {
    return "0" + time
  }
  else {
    return time
  }
}




function timePlusHours(date, time, hours) {
  var stringTime = date + ' ' + time + ':00';
  var timestamp = Date.parse(stringTime.replace(/-/g,'/'));
  var resultTimeStamp = timestamp + (hours * 3600 * 1000);
  var resultDate = new Date()
  resultDate.setTime(resultTimeStamp)
  var year = resultDate.getFullYear()
  var month = this.timeWithZero(resultDate.getMonth() + 1)
  var day = this.timeWithZero(resultDate.getDate())
  var hour = this.timeWithZero(resultDate.getHours())
  var minute = this.timeWithZero(resultDate.getMinutes())

  return {
    "days": year + '-' + month + '-' + day,
    "hours": hour + ':' + minute
  }
}

module.exports = {
  formatTime: formatTime,
  formatTimeB: formatTimeB,
  timeWithZero: timeWithZero,
  calTimeStamp: calTimeStamp,
  isEmpty: isEmpty,
  isPhone: isPhone,
  randomNum: randomNum,
  dispatchRefreshParam: dispatchRefreshParam,
  timePlusHours:timePlusHours,
}
