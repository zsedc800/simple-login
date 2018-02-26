import { Rule } from '../Rule'
import range from './range'
import email from './email'
Rule._plugin([
  range,
  email
])
