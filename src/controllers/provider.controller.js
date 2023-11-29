import fs from 'fs'
import JsonWebToken from 'jsonwebtoken'
import pool from '../db.js'
import { getRolUser } from './user.controller.js'
import { CONTRACT_PATH, SECRECT_TOKEN } from '../config.js'

export const getProviders = async (req, res) => {
  try {
    const idRequest = req.headers['idrequest']

    let [proveedores] = await pool.query('SELECT * FROM proveedores')
    const rol = await getRolUser(idRequest)
    const token = await JsonWebToken.sign({ id: idRequest, rol: rol.rol }, SECRECT_TOKEN, {
      expiresIn: 60 * 10
    })

    const data = { token }
    data.proveedores = proveedores

    res.json(data)
  }
  catch (error) {
    return res.status(500).json({
      message: 'Somethng goes wrong',
      error: error
    })
  }
}


export const createProviders = async (req, res) => {
  try {
    const idRequest = req.headers['idrequest']
    const { tipoProveedor, idProveedor, digito, nombreTitular, nombreEmpresa, direccion, telefono, correo, fechaInicioContrato, fechaFinContrato, descripcionServicios, documento } = req.body
    if (documento) {
      fs.mkdir(CONTRACT_PATH, { recursive: true }, (err) => {
        if (err) {
          throw Error(err)
        }
      })

      fs.writeFile(CONTRACT_PATH + '/' + idProveedor + '.txt', documento, 'utf8', (err) => {
        if (err) {
          throw Error(err)
        }
      })
    }

    let tipoIdentificacion = ''
    if (tipoProveedor === 'EMPRESA')
      tipoIdentificacion = 'NIT'
    if (tipoProveedor === 'NATURAL')
      tipoIdentificacion = 'CC'

    const [rows] = await pool.query(
      `INSERT INTO proveedores 
			(
				idProveedor,
				tipoProveedoor,
				tipoIdentificacion,
				digito,
				nombreTitular,
				nombreEmpresa,
				direccion,
				telefono,
				correo,
				fechaInicioContrato,
				fechaFinContrato,
				descripcionServicios,
				activo
			)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        idProveedor,
        tipoProveedor,
        tipoIdentificacion,
        digito,
        nombreTitular,
        nombreEmpresa,
        direccion,
        telefono,
        correo,
        fechaInicioContrato,
        fechaFinContrato,
        descripcionServicios,
        1
      ])

    const rol = await getRolUser(idRequest)

    const token = await JsonWebToken.sign({ id: idRequest, rol: rol.rol }, SECRECT_TOKEN, {
      expiresIn: 60 * 10
    })

    res.send({
      token
    })
  }
  catch (error) {
    return res.status(500).json({
      message: 'Something goes wrong' + error
    })
  }
}

export const updateProvider = async (req, res) => {
  try {
    const id = req.params.idProvider
    const idRequest = req.headers['idrequest']
    const {
      idProveedor,
      digito,
      nombreTitular,
      nombreEmpresa,
      direccion,
      telefono,
      correo,
      fechaInicioContrato,
      fechaFinContrato,
      descripcionServicios,
      documento } = req.body

    if (documento) {
      fs.mkdir(CONTRACT_PATH, { recursive: true }, (err) => {
        if (err) {
          throw Error(err)
        }
      })

      fs.writeFile(CONTRACT_PATH + '/' + idProveedor + '.txt', documento, 'utf8', (err) => {
        if (err) {
          throw Error(err)
        }
      })
    }



    const [result] = await pool.query(`UPDATE proveedores SET 
      digito =IFNULL(?, digito),
      nombreTitular =IFNULL(?, nombreTitular),
      nombreEmpresa =IFNULL(?, nombreEmpresa),
      direccion =IFNULL(?, direccion),
      telefono =IFNULL(?, telefono),
      correo =IFNULL(?, correo),
      fechaInicioContrato =IFNULL(?, fechaInicioContrato),
      fechaFinContrato =IFNULL(?, fechaFinContrato),
      descripcionServicios =IFNULL(?, descripcionServicios)

      WHERE idProveedor=?
      
      
      `,
    [
      digito,
      nombreTitular,
      nombreEmpresa,
      direccion,
      telefono,
      correo,
      fechaInicioContrato,
      fechaFinContrato,
      descripcionServicios,
      idProveedor
    ])
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE idProveedor = ?', idProveedor)

    const rol = getRolUser(idRequest)
    const token = await JsonWebToken.sign({ id: idRequest, rol: rol.rol }, SECRECT_TOKEN, {
      expiresIn: 60 * 10
    })
    const data = rows[0]
    data.token = token

    res.json(data)
  }
  catch (error) {
    return res.status(500).json({
      message: 'Somethng goes wrong'
    })
  }
}