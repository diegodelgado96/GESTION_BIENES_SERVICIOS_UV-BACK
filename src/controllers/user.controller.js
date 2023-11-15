import { pool } from "../db.js"

export const getUsers =  async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows)
  } 
  catch(error) {
    return res.status(500).json({
      message: 'Somethng goes wrong'
    })
  }
}

export const getUser =  async (req, res) => {
  try {
    const id = req.params.id
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE idUsuario = ?', id);
    if(rows.length == 0)
    {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    res.json(rows[0])
  } 
  catch(error) {
    return res.status(500).json({
      message: 'Somethng goes wrong',
      error: error
    })
  }
}

export const createUser = async (req, res) => {
  try {
    const {idUsuario, Nombres, codigo, correo, telefono, rol} = req.body
    const [rows] = await pool.query('INSERT INTO usuarios VALUES (?,?,?,?,?,?)', [idUsuario, Nombres, codigo, correo, telefono, rol]);
    res.send({
      id: rows.insertId,
      idUsuario,
      Nombres,
      codigo,
      correo,
      telefono,
      rol,
    })
  } 
  catch(error) {
    return res.status(500).json({
      message: 'Somethng goes wrong'
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id
    const { Nombres, codigo, correoInstitucional, telefono, rol} = req.body
    const [result] = await pool.query('UPDATE usuarios SET Nombres=IFNULL(?, Nombres), codigo=IFNULL(?, codigo), correoInstitucional=IFNULL(?, correoInstitucional), telefono=IFNULL(?, telefono), rol=IFNULL(?, rol) WHERE idUsuario=?', 
      [Nombres, codigo, correoInstitucional, telefono, rol, id]);
    if(result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE idUsuario = ?', id);
    res.json(rows[0])
  } 
  catch(error) {
    return res.status(500).json({
      message: 'Somethng goes wrong'
    })
  }
}


export const deleteUser = async(req, res) => {
  try {
    const id = req.params.id
    const [rows] = await pool.query('DELETE FROM usuarios WHERE idUsuario = ?', id);
    if(rows.affectedRows <= 0)
    {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    res.sendStatus(204)
  } 
  catch(error) {
    return res.status(500).json({
      message: 'Somethng goes wrong'
    })
  }
}