import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import AuthorsService from './services/authors'
import BaseService from './services/base'
import BooksService from './services/books'
import RequestService from './services/request'
import UsersService from './services/users'
import VersesService from './services/verses'
 
const PORT = 3017

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
  '/user',
  checkAccess,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = storage.get(request)
      return response.status(200).json(user)
    } catch (error) {
      return next(error as Error)
    }
  },
)

app.post(
  '/login',
  async (request: Request, response: Response) => {
    try {
      const currentUser = await UsersService.login(request.body)

      response.status(200).json({
        user: currentUser,
        token: jwt.sign({ id: currentUser.id }, RequestService.TOKEN_KEY),
      })
    } catch (error: any) {
      return response.status(400).send({ statusCode: 400, message: error.message })
    }
  },
)

app.get(
  '/verses',
  async (request: Request, response: Response) => {
    try {
      const verses = await VersesService.getList()
      return response.send(verses)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.post(
  '/verses',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const verse = await VersesService.create(request.body)
      return response.send(verse)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.put(
  '/verses/:verseId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const { verseId } = request.params
      const verse = await VersesService.update(verseId, request.body)
      return response.send(verse)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.delete(
  '/verses/:verseId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const { verseId } = request.params
      await VersesService.remove(verseId)
      return response.send('ok')
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.get(
  '/books',
  async (_request: Request, response: Response) => {
    try {
      const books = await BooksService.getList()
      return response.send(books)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.post(
  '/books',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const book = await BooksService.create(request.body)
      return response.send(book)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.put(
  '/books/:bookId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const { bookId } = request.params
      const book = await BooksService.update(bookId, request.body)
      return response.send(book)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.delete(
  '/books/:bookId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const { bookId } = request.params
      await BooksService.remove(bookId)
      return response.send('ok')
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.get(
  '/authors',
  checkAccess,
  async (_request: Request, response: Response) => {
    try {
      const authors = await AuthorsService.getList()
      return response.send(authors)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.post(
  '/authors',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const author = await AuthorsService.create(request.body)
      return response.send(author)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.put(
  '/authors/:authorId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const { authorId } = request.params
      const author = await AuthorsService.update(authorId, request.body)
      return response.send(author)
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)

app.delete(
  '/authors/:authorId',
  checkAccess,
  async (request: Request, response: Response) => {
    try {
      const { authorId } = request.params
      await AuthorsService.remove(authorId)
      return response.send('ok')
    } catch (error: any) {
      return response.status(500).send({ statusCode: 500, message: error.message })
    }
  },
)
