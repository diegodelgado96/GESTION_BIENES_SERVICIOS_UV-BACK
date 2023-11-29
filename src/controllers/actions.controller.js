import pool from '../db.js'
import { getRolUser } from './user.controller.js'
import JsonWebToken from 'jsonwebtoken'
import { SECRECT_TOKEN } from '../config.js'

export const getActions = async (req, res) => {
  try {
    const idProvider = req.params.idProvider
    const idRequest = req.headers['idrequest']

    let [actionsReport] = await pool.query( 
      `SELECT a.*, ticket, edificio, ubicacion FROM acciones as a JOIN reporte_infraestructura 
      ON  Reporte_Infraestructura_idReporte = idReporte 
      WHERE Proveedores_idProveedor = ?;`, 
      [idProvider]) 
      
    let [actionsSol] = await pool.query( 
      `SELECT a.*, tipoSolicitud, productoSolicitado, ticket FROM acciones as a
      JOIN solicitud_bienes_servicios ON  Solicitud_Bienes_Servicios_idSolicitud = idSolicitud
      WHERE Proveedores_idProveedor = ?;`, 
      [idProvider]) 

    const { rol } = await getRolUser(idRequest)
    const token = await JsonWebToken.sign({ id: idRequest, rol: rol }, SECRECT_TOKEN, {
      expiresIn: 60 * 10
    })

    res.json({
      token,
      actions: {
        actionsReport,
        actionsSol
      }
    })
  }
  catch (error) {
    return res.status(500).json({
      message: 'Somethng goes wrong',
      error: error.message 
    })
  }
}

export const updateAction = async (req, res) => {
  try {
    const id = req.params.idAction
    const idRequest = req.headers['idrequest']
    const {
      accion,
      estado,
      fechaAprobacion,
      descripcionAccion
    } = req.body


    const [result] = await pool.query(`UPDATE acciones SET 
      accion =IFNULL(?, accion),
      estado =IFNULL(?, estado),
      fechaAprobacion =IFNULL(?, fechaAprobacion),
      descripcionAccion =IFNULL(?, descripcionAccion)
      WHERE idAccion=?`,
    [
      accion,
      estado,
      fechaAprobacion,
      descripcionAccion,
      id
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const [rows] = await pool.query('SELECT * FROM acciones WHERE idAccion = ?', id)

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
      message: 'Somethng goes wrong',error
    })
  }
}

export const newAction = async (req, res) => {
  try {
    const idRequest = req.headers['idrequest']
    const idAccion = v4()
    const fecha = new Date()
    const { estado, accion, descripcionAccion } = req.body

    const [rows] = await pool.query(
      `INSERT INTO acciones 
        ( 
          idSolicitud, 
          tipoSolicitud, 
          productoSolicitado, 
          descripcionSolicitud, 
          fechaEntrega, 
          urgencia, 
          especificaciones, 
          linksProducto, 
          fechaCreacion,
          ultimaModificacion,
          Usuarios_idUsuario,
          ticket
        ) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        idSolicitud,
        tipo,
        productoSolicitado,
        descripcionSolicitud,
        fechaEntrega,
        urgencia,
        especificaciones,
        linksProducto,
        fecha,
        fecha,
        idRequest,
        ticket
      ])

    const rol = await getRolUser(idRequest)

    const token = await JsonWebToken.sign({ id: idRequest, rol: rol.rol }, SECRECT_TOKEN, {
      expiresIn: 60 * 10
    })

    res.send({
      ticket,
      token
    })
  }
  catch (error) {
    return res.status(500).json({
      message: 'Something goes wrong' + error
    })
  }
}
