import React, { Component } from 'react'
import { Validator } from '../src/index'
class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      form: {
        phone: '',
        password: ''
      },
      errorInfo: {}
    }
  }
  _inputPhone = (e) => {
    let value = e.target.value
    this.setState({
      form: Object.assign(this.state.form, { phone: value })
    }, () => {
      this.asyncValidator.validate({ phone: value }, 'change', (err) => {
        this.setState({
          errorInfo: Object.assign(this.state.errorInfo, { phone: err ? err.phone : '' })
        })
      })
    })
  }
  _inputPwd = (e) => {
    this.setState({
      form: Object.assign(this.state.form, { password: e.target.value })
    })
  }
  _blurPwd = () => {
    let value = this.state.form.password
    this.asyncValidator.validate({ password: value }, 'blur', err => {
      this.setState({
        errorInfo: Object.assign(this.state.errorInfo, { password: err ? err.password : '' })
      })
    })
  }
  componentDidMount () {
    this.asyncValidator = new Validator({
      phone: [{
        type: 'string',
        trigger: 'change'
      }, {
        validator (value, cb) {
          if (value.length < 11) {
            return cb(new Error('长度不足'))
          }
          cb()
        },
        trigger: 'change'
      }],
      password: [{
        type: 'string',
        required: true,
        trigger: 'blur'
      }]
    })
  }
  componentWillUnmount () {
    this.asyncValidator = null
  }
  render () {
    let { form, errorInfo } = this.state
    return (
      <form action="#">
        <p>
          <input onChange={this._inputPhone} value={form.phone} type="text" />
          { errorInfo.phone && <span style={{ color: 'red' }}>&nbsp;{errorInfo.phone}</span> }
        </p>
        <p>
          <input onChange={this._inputPwd} onBlur={this._blurPwd} value={form.password} type="password"/>
          { errorInfo.password && <span style={{ color: 'red' }}>&nbsp;{errorInfo.password}</span> }
        </p>
        <input type="submit" value="登录"/>
      </form>
    )
  }
}

export default App
