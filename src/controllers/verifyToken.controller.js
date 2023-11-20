import JsonWebToken  from "jsonwebtoken"
import { SECRECT_TOKEN } from "../config.js";

export const verifyToken = (req, res, next) => {
  try{
    const authorization = req.headers['x-access-token']
    const idRequest = req.body['idRequest']

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
      return res.status(404).json({auth: false, message: 'Access denied', error})
    }
    next()
  }
  catch(error) {
    return res.status(404).json({auth: false, message: 'Access denied'})
  }
}