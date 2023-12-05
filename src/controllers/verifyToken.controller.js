import JsonWebToken from 'jsonwebtoken'
import { SECRECT_TOKEN } from '../config.js'

const getDecoded = (req, res) => {
  try {
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
    return {decoded, idRequest}
  }
  catch(error) {
    res.status(401).json({auth: false, message: 'Somethng goes wrong', error})
  }

}

export const verifyTokenAdmin = (req, res, next) => {
  try{
    const {decoded, idRequest} = getDecoded(req, res)
    if(decoded.id != idRequest || decoded.rol === 'USER') {
      res.status(401).json({auth: false, message: 'Access denied'})
    }
    next()
  }
  catch(error) {
    res.status(401).json({auth: false, message: 'Access denied', error: error.message })
  }
}

export const verifyToken = (req, res, next) => {
  try{
    const {decoded, idRequest} = getDecoded(req, res)
    if(decoded.id != idRequest) {
      return res.status(401).json({auth: false, message: 'Access denied'})
    }
    next()
  }
  catch(error) {
    return res.status(401).json({auth: false, message: 'Access denied', error})
  }
}