import bcrypt from 'bcrypt'
import  JsonWebToken from 'jsonwebtoken'
import { pool } from "../db.js"
import { GENSALT, SECRECT_TOKEN } from '../config.js'

export const signup = async (req, res) => {
  try {
    const { idUsuario, Nombres, codigo, correo, telefono, rol, password } = req.body
    const passwordE = await  bcrypt.genSalt(parseInt(GENSALT));
    const passEncrypt = await bcrypt.hash(password, passwordE)
    const connection = await pool.getConnection();

    connection.beginTransaction()

    // Primera instrucción INSERT para la tabla 'usuarios'
    const [rows1] = await connection.query(
      'INSERT INTO usuarios VALUES (?,?,?,?,?,?)',
      [idUsuario, Nombres, codigo, correo, telefono, rol]
    );

    // Segunda instrucción INSERT para la tabla 'login'
    const [rows2] = await connection.query(
      'INSERT INTO login VALUES (?,?,?)',
      [123455678, passEncrypt, idUsuario]
    );
    await connection.commit();

    const token = await JsonWebToken.sign({id: idUsuario}, SECRECT_TOKEN, {
      expiresIn: 60*10
    })

    res.send({
      id: rows1.insertId,
      idUsuario,
      Nombres,
      codigo,
      correo,
      telefono,
      rol,
      token,
    });
  }
  catch (error) {
    return res.status(500).json({
      message: 'Somethng goes wrong' + error
    })
  }
}

export const signin = async (req, res) => {
  try {
    const {email, password} = req.body;
    const [user] = await pool.query('SELECT * FROM si_tesis.usuarios JOIN si_tesis.login ON Usuarios_idUsuario = idUsuario WHERE correoInstitucional = ?', email);
    if(user[0] == undefined) {
      return res.status(404).json({message: "the email or password is incorrect"})
    }

    const equal = await bcrypt.compare(password, user[0].password)

    if(!equal) {
      return res.status(404).json({message: "the email or password is incorrect"})
    }

    const userWithoutPassword = { ...user[0] };
    delete userWithoutPassword.password;

    const token = await JsonWebToken.sign({id: user[0].idUsuario}, SECRECT_TOKEN, {
      expiresIn: 60*10
    })

    userWithoutPassword.token = token

    res.json(userWithoutPassword)
  }
  catch (error) {
    return res.status(500).json({
      message: 'Somethng goes wrong' + error
    })
  }
}