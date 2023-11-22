import app from '../src/app.js'
import request from 'supertest'

const users = [
  {
    'idUsuario': 1,
    'Nombres': 'user1',
    'codigo': 101010101,
    'correoInstitucional': 'correo@email.com',
    'telefono': '1010101010',
    'rol': 'USER'
  },
  {
    'idUsuario': 2,
    'Nombres': 'user2',
    'codigo': 20202020,
    'correoInstitucional': 'correo@email.com',
    'telefono': '20202020',
    'rol': 'USER'
  }
]
const mockQuery = jest.fn().mockResolvedValue(users)
jest.mock('../src/db.js', () => ({
  __esModule: true,
  default: {
    query: jest.fn().mockResolvedValue([users])
  }
}))

const api = request(app)

beforeEach(async () => {
  jest.clearAllMocks()
})

describe('GET /user', () => {
  test('users are returned as json list', async () => {
    const response = await api.get('/api/user').send({body:{idRequest:1234567}})

    expect(mockQuery).not.toHaveBeenCalled()
    expect(response.statusCode).toBe(401)
  })
})