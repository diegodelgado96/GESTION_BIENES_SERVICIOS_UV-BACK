import JsonWebToken, { decode }  from 'jsonwebtoken'
import { SECRECT_TOKEN } from '../config.js'

export const verifyToken = (req, res, next) => {
  try{
    const authorization = req.headers['authorization']
    const idRequest = req.headers['idrequest']

    if(!(authorization && authorization.toLowerCase().startsWith('bearer')))
    {
      res.status(401).json({
        auth: false,
        message: 'Not token'
      })
    }

    const token = authorization.substring(7)

    if (!token) {
      return res.status(401).json({
        auth: false,
        message: 'Not token provided'
      })
    }
    const decoded = JsonWebToken.verify(token, SECRECT_TOKEN)
    if(decoded.id != idRequest) {
      return res.status(401).json({auth: false, message: 'Access denied T'})
    }
    next()
  }
  catch(error) {
    return res.status(401).json({auth: false, message: 'Access denied', error})
  }
}

export const genId = () => {
  const date = new Date()
  const year = date.getFullYear() % 100
  const month = date.getMonth() + 1  < 10 ? '0'+ (date.getMonth() + 1)  :  date.getMonth() + 1  
  const day = date.getDate() < 10 ? '0'+ date.getDate() :  date.getDate() 
  const hours = date.getHours() < 10 ? '0'+ date.getHours() :  date.getHours() 
  const minutes = date.getMinutes() < 10 ? '0'+ date.getMinutes() :  date.getMinutes() 
  const seconds = date.getSeconds() < 10 ? '0'+ date.getSeconds() :  date.getSeconds() 
  return '' + year + month + day + hours + minutes + seconds
}