import { Rule } from './Rule'
import './plugins'
class Validator {
  static plugin = Rule._plugin
  constructor (rules) {
    this.cache = []
    this.rules = rules
    for (let filed in rules) {
      this.add(filed, rules[filed])
    }
  }
  add (field, rules) {
    for (let rule of rules) {
      if (typeof rule !== 'object') {
        throw new Error('rule must be a type of object！')
      }
      this.cache.push(new Rule({
        rule,
        field,
        validator: rule.validator
      }))
    }
  }
  validate (source, trigger, cb) {
    if (typeof trigger === 'function') {
      cb = trigger
      trigger = ''
    }
    let triggerRules = this.cache.filter(rule => {
      return (
        !trigger ||
        (rule.trigger && rule.trigger === trigger)
      )
    })
    let temp = []
    for (let key in source) {
      for (let r of triggerRules) {
        if (r.field === key) {
          r.setValue(source[key])
          temp.push(r)
        }
      }
    }
    this.validates(temp, cb)
  }
  validates (rules, cb) {
    let errors = []
    let len = rules.length
    let index = 0
    rules.forEach(rule => {
      rule.exec((err) => {
        if (err) {
          errors.push(err)
        }
        index++
        if (index === len) {
          cb(errors.length ? this.analyseError(errors) : null)
        }
      })
    })
  }
  analyseError (errors) {
    let info = {}
    for (let err of errors) {
      if (!info[err.field]) {
        info[err.field] = err.message
      }
    }
    return info
  }
  setMsg (opt) {
    for (let k in opt) {
      Rule.messages[k] = opt[k]
    }
  }
}

export default Validator
