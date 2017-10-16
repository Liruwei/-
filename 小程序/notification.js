const app = getApp();

const NOTIFICATION_CENTER = "__NotificationCenter";
const TARGET_NOTIFICATION = "__TargetNotification";
const NOTIFICATION_TARGETS = "__NotificationTargets";

//注册通知
function addNotification(target, key, callBack) {
  if (target != null && key != null && callBack != null) {
    var events = this[NOTIFICATION_CENTER] || {};
    var keyCallBacks = events[key] || {};
    var keys = Object.keys(keyCallBacks);
    var callBackId = keys.length;
    keyCallBacks[callBackId] = callBack;
    events[key] = keyCallBacks;
    this[NOTIFICATION_CENTER] = events;

    var targetCallBacks = target[TARGET_NOTIFICATION] || {};
    if (targetCallBacks[key] != null) {//删除旧注册
      this.removeNotification(target, key);
    }
    targetCallBacks[key] = callBackId;
    target[TARGET_NOTIFICATION] = targetCallBacks;

    var allTargets = this[NOTIFICATION_TARGETS] || new Set();
    allTargets.add(target);
    this[NOTIFICATION_TARGETS] = allTargets;
  }
}

//取消注册,一般用在onUnload方法中
function removeNotification(target, key) {
  if (target != null && key != null) {
    var targetCallBacks = target[TARGET_NOTIFICATION] || {};
    var callBackId = targetCallBacks[key];
    if (callBackId == null) return;
    delete targetCallBacks[key];
    target[TARGET_NOTIFICATION] = targetCallBacks;

    var events = this[NOTIFICATION_CENTER] || {};
    var keyCallBacks = events[key] || {};
    delete keyCallBacks[callBackId];
    events[key] = keyCallBacks;
    this[NOTIFICATION_CENTER] = events;

    if (Object.keys(targetCallBacks).length == 0) {
      var allTargets = this[NOTIFICATION_TARGETS] || new Set();
      allTargets.delete(target);
      this[NOTIFICATION_TARGETS] = allTargets;
    }
  }
}

//发送通知
function sendNotification(key, data) {
  var allTargets = Array.from(this[NOTIFICATION_TARGETS] || new Set());
  allTargets.forEach(obj => {
    if (obj != null && key != null && data != null) {
      var targetCallBacks = obj[TARGET_NOTIFICATION] || {};
      var callBackId = targetCallBacks[key];
      if (callBackId == null) return;
      var events = this[NOTIFICATION_CENTER] || {};
      var keyCallBacks = events[key] || {};
      var callBack = keyCallBacks[callBackId];
      typeof callBack == "function" && callBack(data);
    }
  })
}

/**
 * 初始化
*/
function init(target) {
  target.sendNotification = sendNotification.bind(target);
  target.removeNotification = removeNotification.bind(target);
  target.addNotification = addNotification.bind(target);
}

module.exports = {
  init: init
}