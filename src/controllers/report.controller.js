import pool from '../db.js'
import fs from 'fs'
import JsonWebToken from 'jsonwebtoken'
import { DOCUMENT_PATH, REPOR_PATH, REQUEST_PATH } from '../config.js'
import { genTicket } from './tools.controller.js'
import { getRolUser } from './user.controller.js'
import { v4 } from 'uuid'
import { SECRECT_TOKEN } from '../config.js'


export const createReport = async (req, res) => {
  try {
    const idReporte = v4()
    const ticket = genTicket()
    const fecha = new Date()
    const { edificio, ubicacion, descripcionLugar, tipoDanio, descripcionDanio, documentos, tipoReporte, idUsuario } = req.body
    fs.mkdir(DOCUMENT_PATH + ticket, { recursive: true }, (err) => {
      if (err) {
        throw Error(err)
      }
    })

    documentos.forEach(element => {
      fs.writeFile(DOCUMENT_PATH + ticket + '/' + element.nombre + '.txt', element.base64, 'utf8', (err) => {
        if (err) {
          throw Error(err)
        }
      })
    })

    const [rows] = await pool.query(
      `INSERT INTO reporte_infraestructura 
      (idReporte, edificio, ubicacion, descripcionLugar, tipoDanio, descripcionDanio, ticket, tipoReporte, fechaCreacion, ultimaModificacion, Usuarios_idUsuario) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [idReporte, edificio, ubicacion, descripcionLugar, tipoDanio, descripcionDanio, ticket, tipoReporte, fecha, fecha, idUsuario])

    const rol = await getRolUser(idUsuario)

    const token = await JsonWebToken.sign({ id: idUsuario, rol: rol.rol }, SECRECT_TOKEN, {
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

export const getReport = async (req, res) => {
  try {
    const ticket = req.params.ticket
    const idRequest = req.headers['idrequest']

    const { rol } = await getRolUser(idRequest)

    let [rows] = []
    let [proveedores] = []
    let tipo = ''

    if (rol === 'ADMIN') {
      [rows] = await pool.query('SELECT * FROM reporte_infraestructura WHERE ticket = ?', ticket)
      if (rows.length === 0) {
        [rows] = await pool.query('SELECT * FROM solicitud_bienes_servicios WHERE ticket = ?', ticket)
        tipo = 'Solicitud'
      }
      else {
        tipo = 'Reporte'
      }

      [proveedores] = await pool.query('SELECT * FROM proveedores')
    }
    else {
      [rows] = await pool.query(
        'SELECT * FROM reporte_infraestructura WHERE ticket = ? AND Usuarios_idUsuario = ?',
        [ticket, idRequest])

      if (rows.length === 0) {
        [rows] = await pool.query(
          'SELECT * FROM solicitud_bienes_servicios WHERE ticket = ? AND Usuarios_idUsuario = ?',
          [ticket, idRequest])
        tipo = 'Solicitud'
      }
      else {
        tipo = 'Reporte'
      }
    }

    if (rows.length == 0) {
      return res.status(404).json({
        message: 'Ticket not found'
      })
    }
    const [user] = await pool.query('SELECT * FROM usuarios WHERE idUsuario = ?', rows[0].Usuarios_idUsuario)
    const data = rows[0]
    data.tipo = tipo
    data.allProveedores = proveedores
    data.usuario = user[0]

    if (data.Proveedores_idProveedor) {
      const [proveedor] = await pool.query('SELECT * FROM proveedores WHERE idProveedor = ?', data.Proveedores_idProveedor)
      data.proveedor = proveedor[0]
    }

    let idQuery = tipo === 'Reporte' ? data.idReporte : data.idSolicitud 
    const [acciones] = await pool.query(
      'SELECT * FROM acciones WHERE Reporte_Infraestructura_idReporte = ? OR Solicitud_Bienes_Servicios_idSolicitud = ? ORDER BY fechaCreacion ASC',
      [idQuery, idQuery]
    )

    data.acciones = acciones

    const url = tipo === 'Reporte' ? DOCUMENT_PATH + ticket : REQUEST_PATH + ticket

    const images = []
    let documento = ''

    try {
      const archivos = await fs.promises.readdir(url)

      for (const archivo of archivos) {
        const contenido = await fs.promises.readFile(url + '/' + archivo, 'utf8')
        images.push({ nombre: archivo, contenido })
      }


      documento = await fs.promises.readFile(REPOR_PATH + ticket + '.txt', 'utf8')
    } catch (error) {
      documento = ''
    }

    data.documento = documento

    data.images = images

    const token = await JsonWebToken.sign({ id: idRequest, rol: rol }, SECRECT_TOKEN, {
      expiresIn: 60 * 10
    })

    data.token = token
    data.rol = rol

    res.json(data)
  }
  catch (error) {
    return res.status(500).json({
      message: 'Somethng goes wrong',
      error: error
    })
  }
}

export const updateReport = async (req, res) => {
  try {
    const id = req.params.idReport
    const idRequest = req.headers['idrequest']
    const {
      edificio,
      ubicacion,
      descripcionLugar,
      tipoDanio,
      descripcionDanio,
      ticket,
      estado,
      tipoReporte,
      fechaCreacion,
      etapa,
      ultimaModificacion,
      Proveedores_idProveedor,
      Usuarios_idUsuario } = req.body

    const [result] = await pool.query(`UPDATE reporte_infraestructura SET 
      edificio=IFNULL(?, edificio),
      ubicacion=IFNULL(?, ubicacion),
      descripcionLugar=IFNULL(?, descripcionLugar),
      tipoDanio=IFNULL(?, tipoDanio),
      descripcionDanio=IFNULL(?, descripcionDanio),
      ticket=IFNULL(?, ticket),
      estado=IFNULL(?, estado),
      tipoReporte=IFNULL(?, tipoReporte),
      fechaCreacion=IFNULL(?, fechaCreacion),
      etapa=IFNULL(?, etapa),
      ultimaModificacion=IFNULL(?, ultimaModificacion),
      Proveedores_idProveedor=IFNULL(?, Proveedores_idProveedor),
      Usuarios_idUsuario=IFNULL(?, Usuarios_idUsuario)

      WHERE idReporte=?`,
    [
      edificio,
      ubicacion,
      descripcionLugar,
      tipoDanio,
      descripcionDanio,
      ticket,
      estado,
      tipoReporte,
      fechaCreacion,
      etapa,
      new Date(),
      Proveedores_idProveedor,
      Usuarios_idUsuario,
      id
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const [rows] = await pool.query('SELECT * FROM reporte_infraestructura WHERE idReporte = ?', id)

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

export const addDoc = (req, res) => {
  try {
    const ticket = req.params.ticket
    const { doc } = req.body

    fs.mkdir(REPOR_PATH, { recursive: true }, (err) => {
      if (err) {
        throw Error(err)
      }
    })

    fs.writeFile(REPOR_PATH + ticket + '.txt', doc, 'utf8', (err) => {
      if (err) {
        throw Error(err)
      }
    })

    res.json({ doc })
  }
  catch (error) {
    return res.status(500).json({
      message: 'Somethng goes wrong'
    })
  }
}











