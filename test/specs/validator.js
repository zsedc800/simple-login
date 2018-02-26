import { assert } from 'chai'
import Validator from '../../src/validate'
let asyncValidator = new Validator({
  name: [
    {
      type: 'string',
      required: true,
      validator (value, cb) {
        if (value === 'test12') {
          return cb(new Error('test name error'))
        }
        cb()
      }
    },
    {
      validator (value, cb) {
        setTimeout(() => {
          if (value === 'zsedc800') {
            return cb(new Error('value must not be zsedc800'))
          }
          cb()
        }, 1000)
      },
      trigger: 'blur'
    },
    {
      validator: 'range?min=5&max=10',
      errorMsg: '长度必须为5至10个字符'
    }
  ],
  phone: [{
    type: 'string', required: true
  }, {
    validator (value, cb) {
      setTimeout(() => {
        if (/^1[34578]\d{9}$/.test(value)) {
          return cb()
        }
        cb(new Error('手机号格式错误'))
      }, 1000)
    }
  }],
  email: [{
    type: 'string',
    required: true
  }, {
    validator: 'email',
    errorMsg: '邮箱名称有误'
  }]
})

describe('validator', function () {
  it('should throw type error', function (done) {
    asyncValidator.validate({ name: 232 }, err => {
      assert.exists(err.name)
      console.log(err.name)
      done()
    })
  })
  it('should throw required error', function (done) {
    asyncValidator.validate({ name: '' }, err => {
      assert.exists(err.name)
      console.log(err.name)
      done()
    })
  })
  it('should throw a custom validator error', function (done) {
    asyncValidator.validate({ name: 'test12' }, err => {
      assert.exists(err.name)
      console.log(err.name)
      done()
    })
  })
  it('custom errorMsg should exist', function (done) {
    asyncValidator.validate({ name: 'zp' }, err => {
      assert.equal(err.name, '长度必须为5至10个字符')
      console.log(err.name)
      done()
    })
  })
  it('should pass when test one field', function (done) {
    asyncValidator.validate({ name: 'zsedc1080'}, err => {
      assert.notExists(err)
      done()
    })
  })
  it('should exec only trigger right', function (done) {
    asyncValidator.validate({ name: 'zsedc800' },'blur',  err => {
      assert.exists(err.name)
      console.log(err.name)
      done()
    })
  })
  it('should pass when test muti field', function (done) {
    asyncValidator.validate({
      name: 'joe.zhou',
      phone: '13999999999',
      email: 'zsedc800@qq.com'
    }, err => {
      assert.notExists(err)
      done()
    })
  })
})

it('should throw err when test muti field', function (done) {
  asyncValidator.validate({
    name: 'joe.zhou_zsedc800',
    phone: '12321233322',
    email: '@@edede'
  }, err => {
    assert.exists(err)
    console.log(err)
    done()
  })
})