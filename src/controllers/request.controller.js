import pool from '../db.js'
import fs from 'fs'
import { genTicket } from './tools.controller.js'
import { getRolUser } from './user.controller.js'
import JsonWebToken from 'jsonwebtoken'
import { SECRECT_TOKEN, REQUEST_PATH } from '../config.js'
import { v4 } from 'uuid'

export const createRequest = async (req, res) => {
  try {
    const idRequest = req.headers['idrequest']
    const idSolicitud = v4()
    const ticket = genTicket()
    const fecha = new Date()
    const { tipo, productoSolicitado, descripcionSolicitud, fechaEntrega, urgencia, especificaciones, linksProducto, documento } = req.body

    if (documento) {

      fs.mkdir(REQUEST_PATH + ticket, { recursive: true }, (err) => {
        if (err) {
          throw Error(err)
        }
      })
      fs.writeFile(REQUEST_PATH + ticket + '.txt', documento, 'utf8', (err) => {
        if (err) {
          throw Error(err)
        }
      })
    }


    const [rows] = await pool.query(
      `INSERT INTO solicitud_bienes_servicios 
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

export const getAll = async (req, res) => {
  try {
    const idRequest = req.headers['idrequest']
    let [reports] = await pool.query('SELECT * FROM reporte_infraestructura')
    let [request] = await pool.query('SELECT * FROM solicitud_bienes_servicios')

    const rol = await getRolUser(idRequest)

    const token = await JsonWebToken.sign({ id: idRequest, rol: rol.rol }, SECRECT_TOKEN, {
      expiresIn: 60 * 10
    })

    reports.forEach(report => {
      report.tipo = 'report'
    })

    request.forEach(req => {
      req.tipo = 'request'
    })

    const obj = {data: [...reports, ...request], token}
    res.send(obj)
  }
  catch (error) {
    return res.status(500).json({
      message: 'Something goes wrong' + error
    })
  }
}

export const updateRequest = async (req, res) => {
  try {
    const id = req.params.idRequest
    const idRequest = req.headers['idrequest']
    const {
      tipoSolicitud,
      productoSolicitado,
      descripcionSolicitud,
      fechaEntrega,
      urgencia,
      especificaciones,
      linksProducto,
      ultimaModificacion,
      estado,
      Proveedores_idProveedor,
    } = req.body

    const [result] = await pool.query(`UPDATE solicitud_bienes_servicios SET 
      tipoSolicitud = IFNULL(?, tipoSolicitud),
      productoSolicitado = IFNULL(?, productoSolicitado),
      descripcionSolicitud = IFNULL(?, descripcionSolicitud),
      fechaEntrega = IFNULL(?, fechaEntrega),
      urgencia = IFNULL(?, urgencia),
      especificaciones = IFNULL(?, especificaciones),
      linksProducto = IFNULL(?, linksProducto),
      ultimaModificacion = IFNULL(?, ultimaModificacion),
      estado = IFNULL(?, estado),
      Proveedores_idProveedor = IFNULL(?, Proveedores_idProveedor)

      WHERE idSolicitud=?`,
    [
      tipoSolicitud,
      productoSolicitado,
      descripcionSolicitud,
      new Date(),
      urgencia,
      especificaciones,
      linksProducto,
      ultimaModificacion,
      estado,
      Proveedores_idProveedor,
      id
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const [rows] = await pool.query('SELECT * FROM solicitud_bienes_servicios WHERE idSolicitud = ?', id)

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