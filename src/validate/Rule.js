import qs from 'qs'
function noop () {}
export class Rule {
  static messages = {
    required: '%s is required',
    email: 'is a wrong email name',
    types: {
      string: '%s is not a %s',
      null: '%s is not %s',
      function: '%s is not a %s',
      instance: '%s is not an instance of %s',
      array: '%s is not an %s',
      object: '%s is not an %s',
      number: '%s is not a %s',
      boolean: '%s is not a %s',
      integer: '%s is not an %s',
      float: '%s is not a %s',
      regexp: '%s is not a valid %s',
      multiple: '%s is not one of the allowed types %s'
    }
  }
  static main = {}
  static _plugin (plugins) {
    let method = noop
    for (let plugin of plugins) {
      if (typeof plugin === 'function') {
        method = plugin
      }
      method.call(Rule)
    }
  }
  constructor (opt, field) {
    this.field = field
    for (let key in opt) {
      if (opt.hasOwnProperty(key)) {
        this[key] = opt[key]
      }
    }
    this.trigger = this.rule.trigger
    if (typeof this.validator === 'function') {
      let func = this.validator
      this.validator = function (cb) {
        func.apply(this, [this.value, cb])
      }
    }
    this._messages = Rule.messages
  }

  setValue (val) {
    this.value = val
  }

  exec (cb) {
    let callback = cb
    cb = (err) => {
      if (err instanceof Error && !err.field) {
        err.field = this.field
      }
      callback(err)
    }
    let strategyAry = []
    let err = null
    if ((typeof this.rule.validator === 'string') && !!this.rule.validator) {
      strategyAry = this.rule.validator.split('?')
      let strategy = strategyAry.shift()
      strategyAry.length ? strategyAry = strategyAry.map(item => qs.parse(item)) : void 0
      this.validator = this.plugin(strategy)
    }
    if (typeof this.rule.type === 'string' && !!this.rule.type) {
      err = this.type(this.rule.errorMsg)
      if (err) {
        return cb(err)
      }
    }
    if (this.rule.required) {
      err = this.required(this.rule.errorMsg)
      if (err) {
        return cb(err)
      }
    }
    strategyAry.push(cb)
    this.validator ? this.validator.apply(this, strategyAry) : cb()
  }
  plugin (method) {
    if (typeof Rule.main[method] === 'function') {
      return Rule.main[method]
    }
    return null
  }
  required (errorMsg) {
    if (this.value !== false && !this.value) {
      return this.error(errorMsg || this._messages.required, this.field)
    }
    return null
  }
  type (msg) {
    let id = this.rule.type
    let Type = this.rule.Type
    let invalid = false
    if (typeof Type === 'function') {
      if (!(this.value instanceof Type)) {
        return this.error(msg || this._messages.types['instance'], this.field, Type.name)
      }
    } else if (id === 'null') {
      invalid = this.value !== null
    } else if (id === 'regexp') {
      if (!(this.value instanceof RegExp)) {
        try {
          RegExp(this.value)
        } catch (e) {
          invalid = true
        }
      }
    } else if (id === 'string') {
      invalid = typeof this.value !== 'string'
    } else if (id === 'number') {
      invalid = isNaN(this.value) && typeof this.value !== 'number'
    } else if (id === 'object') {
      invalid = typeof this.value !== 'object' || Array.isArray(this.value)
    } else if (id === 'float') {
      invalid = typeof this.value !== 'number' || Number(this.value) !== parseInt(this.value)
    } else if (id === 'array') {
      invalid = !Array.isArray(this.value)
    } else if (id === 'integer') {
      invalid = typeof this.value !== 'number' || Number(this.value) !== parseInt(this.value)
    }

    if (invalid) {
      return this.error(msg || this._messages.types[id], this.field, id)
    }
    return null
  }
  error () {
    let args = Array.prototype.slice.call(arguments, 0)
    let msg = args.shift()
    for (let p of args) {
      msg = msg.replace('%s', p)
    }
    let err = new Error(msg)
    err.field = this.field
    return err
  }
}
