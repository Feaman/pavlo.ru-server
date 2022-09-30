import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import BaseService from './services/base'
import CandidatesService from './services/candidates'
import RequestService from './services/request'
import UsersService from './services/users'
 
const PORT = 3016

const app = express()
const storage = new WeakMap()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors())
app.listen(PORT, async function () {
  console.log(`STARTED on port ${PORT}`)
})

BaseService.init()

function checkAccess(request: Request, response: Response, next: NextFunction) {
  if (storage.get(request)) {
    return next()
  }

  return response.status(401).send({ message: 'Not Authorized' })
}

app.use(async (request: Request, _response: Response, next: NextFunction) => {
  try {
    const currentUser = await RequestService.getUserFromRequest(request)

    if (!currentUser) return next()

    storage.set(
      request, 
      {
        id: currentUser.id,
        firstName: currentUser.firstName,
        secondName: currentUser.secondName,
        email: currentUser.email,
      }
    )

    next()
  } catch (error: any) {
    return next(error)
  }
})

app.get(
  '/config',
  checkAccess,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const currentUser = storage.get(request)
      const candidates = await CandidatesService.getList(currentUser )

      return response.status(200).json({ candidates, user: currentUser  })
    } catch (error: any) {
      return next(error)
    }
  },
)

app.post(
  '/login',
  async (request: Request, response: Response) => {
    try {
      const currentUser = await UsersService.login(request.body)
      const candidates = await CandidatesService.getList(currentUser)

      response.status(200).json({
        candidates,
        user: currentUser,
        token: jwt.sign({ id: currentUser.id }, RequestService.TOKEN_KEY),
      })
    } catch (error: any) {
      return response.status(400).send({statusCode: 400, message: error.message })
    }
  },
)

app.post(
  '/users',
  async (request: Request, response: Response) => {
    try {
      const user = await UsersService.create(request.body)
      const candidates = await CandidatesService.getList(user)

      response.status(200).json({
        candidates,
        user,
        token: jwt.sign({ id: user.id }, RequestService.TOKEN_KEY),
      })
    } catch (error: any) {
      return response.status(400).send({statusCode: 400, message: error.message })
    }
  },
)

app.post(
  '/candidates',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const currentUser = storage.get(request)
      const candidate = await CandidatesService.create(request.body, currentUser)
      return response.send(candidate)
    } catch (error: any) {
      return response.status(500).send({statusCode: 500, message: error.message })
    }
  },
)

app.put(
  '/candidates/:candidateId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const currentUser = storage.get(request)
      const { candidateId } = request.params
      const candidate = await CandidatesService.update(candidateId, request.body, currentUser)
      return response.send(candidate)
    } catch (error: any) {
      return response.status(500).send({statusCode: 500, message: error.message })
    }
  },
)

app.delete(
  '/candidates/:candidateId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const currentUser = storage.get(request)
      const { candidateId } = request.params
      await CandidatesService.remove(candidateId, currentUser)
      return response.send('ok')
    } catch (error: any) {
      return response.status(500).send({statusCode: 500, message: error.message })
    }
  },
)
