import qs from 'qs'
function getError (url, opts, xhr) {
  let msg = ''
  if (xhr.response) {
    msg = `${xhr.status} ${xhr.response.error || xhr.response}`
  } else if (xhr.responseText) {
    msg = `${xhr.status} ${xhr.responseText}`
  } else {
    msg = `failed to ${opts.method} ${url} ${xhr.status}`
  }

  const err = new Error(msg)
  err.status = xhr.status
  err.url = url
  err.method = opts.method

  return err
}

function getBody (xhr) {
  let text = xhr.responseText || xhr.response
  if (!text) {
    return text
  }
  try {
    return JSON.parse(text)
  } catch (e) {
    return text
  }
}

function createXMLHttp () {
  var XmlHttp
  if (window.ActiveXObject) {
    var arr = ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.5.0', 'MSXML2.XMLHttp.4.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp', 'Microsoft.XMLHttp']
    for (var i = 0; i < arr.length; i++) {
      try {
        XmlHttp = new window.ActiveXObject(arr[i])
        return XmlHttp
      } catch (error) { }
    }
  } else {
    try {
      XmlHttp = new XMLHttpRequest()
      return XmlHttp
    } catch (otherError) { }
  }
}

function get (url, opts) {
  return new Promise((resolve, reject) => {
    opts.method = 'get'
    let xhr = createXMLHttp()
    if (opts.params) {
      url += '?' + qs.stringify(opts.params)
    }

    const headers = opts.headers || {}
    for (let key in headers) {
      if (headers.hasOwnProperty(key) && !!headers[key]) {
        xhr.setRequestHeader(key, headers[key])
      }
    }

    xhr.onerror = function (e) {
      reject(e)
    }
    xhr.onload = function () {
      if (xhr.status < 200 || xhr.status > 300) {
        return opts.onError(getError(url, opts, xhr))
      }
      resolve(getBody(xhr))
    }
    xhr.open('GET', url, true)
    xhr.send(null)
  })
}

function post (url, opts) {
  return new Promise((resolve, reject) => {
    opts.method = 'post'
    let xhr = createXMLHttp()
    xhr.setRequestHeader('content-Type', 'application/x-www-form-urlencoded')
    const headers = opts.headers || {}
    for (let key in headers) {
      if (headers.hasOwnProperty(key) && !!headers[key]) {
        xhr.setRequestHeader(key, headers[key])
      }
    }
    let params = opts.params
    params = qs.stringify(params)
    if (typeof opts.transform === 'function') {
      params = opts.transform(params)
    }

    if (xhr.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true
    }

    xhr.onerror = function (e) {
      reject(e)
    }

    xhr.onload = function () {
      if (xhr.status < 200 || xhr.status > 300) {
        return opts.onError(getError(url, opts, xhr))
      }
      resolve(getBody(xhr))
    }

    xhr.open('POST', url, true)
    xhr.send(params)
  })
}

export {
  createXMLHttp,
  get,
  post
}
