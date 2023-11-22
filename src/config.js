import { config } from 'dotenv'

config()

export const PORT = process.env.PORT  
export const DB_HOST = process.env.DB_HOST
export const DB_USER = process.env.DB_USER
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_PORT = process.env.DB_PORT
export const DB_DATABASE = process.env.DB_DATABASE
export const SECRECT_TOKEN = process.env.SECRECT_TOKEN
export const GENSALT = process.env.GENSALT
export const CLIENT = process.env.CLIENT