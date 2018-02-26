export default function () {
  this.main['range'] = function (opt, cb) {
    let { min, max, len } = opt
    let errorMsg = this.rule.errorMsg
    let value = this.value
    let num = typeof value === 'number'
    let str = typeof value === 'string'
    let arr = Array.isArray(value)
    let func = typeof value === 'function'
    let key = null
    len = Number(len)

    if (num || str || func) {
      key = typeof value
    } else if (arr) {
      key = 'array'
    }
    if (!key) {
      return cb(new Error('value don not have length property'))
    }
    if (!isNaN(len) && len !== value.length) {
      return cb(new Error(errorMsg || "value length don't match rule length"))
    } else if (min && !max && value.length < min) {
      return cb(new Error(errorMsg || 'value length must >= rule min'))
    } else if (max && !min && value.length > max) {
      return cb(new Error(errorMsg || 'value length must <= rule max'))
    } else if (min && max && (value.length > max || value.length < min)) {
      return cb(new Error(errorMsg || 'value length not in the range'))
    }
    cb()
  }
}
