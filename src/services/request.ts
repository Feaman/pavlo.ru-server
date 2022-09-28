import { Request } from "express"
import UserModel from "~/models/user"
import jwt from 'jsonwebtoken'
import UsersService from "./users"
import { token } from "../token"

export default class RequestService {
  static TOKEN_KEY = token

  static async getUserFromRequest (request: Request): Promise<UserModel | null> {
    if (request.headers.authorization){
      const payload = <{ [key: string]: any }>(
      jwt.verify(request.headers.authorization.split(' ')[1], this.TOKEN_KEY)
    )
      return await UsersService.findById(payload.id)
    }

    return null
  }
}