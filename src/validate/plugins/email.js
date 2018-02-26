export default function email () {
  this.main['email'] = function (cb) {
    let value = this.value
    let errorMsg = this.rule.errorMsg
    if (/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
      return cb()
    }
    cb(new Error(errorMsg || this._message['email']))
  }
}
