import BaseService from '~/services/base'
import Validator from 'validatorjs'
import { MysqlError, OkPacket } from 'mysql'
import UserModel from './user'

export interface ICandidate {
  id: number,
  name: string,
  data: string,
  created: string,
}

export interface ICandidateDB {
  id: number,
  name: string,
  data: string,
  created: string,
}

export default class CandidateModel {
  id: number
  name: string
  data: string
  created: string

  static rules = {
    id: 'numeric',
    name: 'required|string',
    data: 'required|string',
  }

  constructor (data: ICandidate) {
    this.id = data.id
    this.name = data.name
    this.data = data.data
    this.created = data.created
  }

  validate (): boolean {
    const validation = new Validator(this, CandidateModel.rules)
    return !!validation.passes()
  }

  save (user: UserModel): Promise<CandidateModel> {
    return new Promise((resolve, reject) => {
      if (!this.validate()) {
        return reject(new Error('Candidate validation failed'))
      }

      if (!this.id) {
        const data = {
          name: this.name,
          data: this.data,
          user_id: user.id,
        }
        BaseService.pool.query('insert into candidates set ?', data, (error: MysqlError | null, result: OkPacket) => {
          if (error) {
            return reject(error)
          }

          this.id = result.insertId
          resolve(this)
        })
      } else {
        const queryParams = [this.name, this.data, this.id]
        BaseService.pool.query(
          'update candidates set name = ?, data = ? where id = ?',
          queryParams,
          (error: MysqlError | null) => {
            if (error) {
              return reject(error)
            }
            resolve(this)
          }
        )
      }
    })
  }

  remove (): Promise<CandidateModel> {
    return new Promise((resolve, reject) => {
      BaseService.pool.query(
        'delete from candidates where id = ?',
        [this.id],
        (error: MysqlError | null) => {
          if (error) {
            return reject(error)
          }
          resolve(this)
        }
      )
    })
  }
}
