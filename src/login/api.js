import * as Request from './ajax'
import { JSEncrypt } from 'jsencrypt'
import md5 from 'md5'
// 账号验证接口
let checkAccountUrl = '/passport/login/checkAccount'
// 登录token获取
let loginTokenUrl = '/passport/token/login'
// 登录
let loginUrl = '/passport/v3/security/popupLogin'
// 请求发送手机验证码
let smsSendUrl = '/passport/v1/sms/send'
// 手机验证码识别
let smsVerifyUrl = '/passport/v1/sms/verifyBind'

function encryption (password, token) {
  let content = md5(password) + (token || '')
  let publickey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCVhaR3Or7suUlwHUl2Ly36uVmboZ3+HhovogDjLgRE9CbaUokS2eqGaVFfbxAUxFThNDuXq/fBD+SdUgppmcZrIw4HMMP4AtE2qJJQH/KxPWmbXH7Lv+9CisNtPYOlvWJ/GHRqf9x3TBKjjeJ2CjuVxlPBDX63+Ecil2JR9klVawIDAQAB'
  let encrypt = new JSEncrypt()
  encrypt.setPublicKey(publickey)
  encrypt.getPublicKey()
  return encrypt.encrypt(content)
}

export default {
  checkAccount (params) {
    return Request.post(checkAccountUrl, { params })
  },
  getLoginToken () {
    return Request.get(loginTokenUrl)
  },
  login (params) {
    return this.getLoginToken().then(res => {
      if (res.data.ret === 0) {
        return res.data.token
      } else {
        throw new Error('failed msg: ', res.msg)
      }
    }).then(token => {
      params.password = encryption(params.password, token)
      return Request.post(loginUrl, { params })
    })
  },
  smsHandle (url, params) {
    return this.getLoginToken().then(res => {
      if (res.data.ret === 0) {
        return res.data.token
      } else {
        throw new Error('failed msg: ', res.msg)
      }
    }).then(token => {
      params.nonce = token
      return Request.post(url, { params })
    })
  },
  smsSend (params) {
    return this.smsHandle(smsSendUrl, params)
  },
  smsVerify (params) {
    return this.smsHandle(smsVerifyUrl, params)
  }
}
