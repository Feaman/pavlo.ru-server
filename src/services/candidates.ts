import BaseService from '~/services/base'
import CandidateModel, { ICandidate, ICandidateDB } from '~/models/candidate'
import { MysqlError } from 'mysql'
import UserModel from '~/models/user'

export default class CandidatesService extends BaseService {
  static async getList (user: UserModel): Promise<CandidateModel[]> {
    return new Promise((resolve, reject) => {
      const notes: CandidateModel[] = []
      const sql = 'select * from candidates where user_id = ? order by created desc'

      this.pool.query(
        {
          sql,
          values: [user.id],
        },
        (error: any, candidatesData: ICandidate[]) => {
          if (error) {
            return reject({ message: error.message })
          }

          candidatesData.forEach(async (noteData: ICandidate) => {
            notes.push(new CandidateModel(noteData))
          })
          
          resolve(notes)
        }
      )
    })
  }

  static async create (candidateData: ICandidate, user: UserModel): Promise<CandidateModel> {
    const existentCandidate = await this.findById(String(candidateData.id), user)
    if (existentCandidate) {
      throw new Error('Candidate with such an id is already exists')
    }

    const candidate = new CandidateModel(candidateData)
    return candidate.save(user)
  }

  static async update (candidateId: string, data: any, user: UserModel): Promise<CandidateModel> {
    const candidate = await this.findById(candidateId, user)
    if (!candidate) {
      throw new Error('Candidate not found')
    }
    candidate.name = data.name
    candidate.data = data.data

    return candidate.save(user)
  }

  static async remove (candidateId: string, user: UserModel): Promise<CandidateModel> {
    const candidate = await this.findById(candidateId, user)
    if (!candidate) {
      throw new Error('Candidate not found')
    }
    return candidate.remove()
  }

  static findById (id: string, user: UserModel): Promise<CandidateModel | null> {
    return this.findByField('id', id, user)
  }

  static async findByField (fieldName: string, fieldValue: string, user: UserModel): Promise<CandidateModel | null> {
    return new Promise((resolve, reject) => {
      this.pool.query({
        sql: `select * from candidates where ${fieldName} = ? and user_id = ?`,
        values: [fieldValue, user.id],
      },
      (error: MysqlError, candidatesDBData: ICandidateDB[]) => {
        if (error) {
          return reject(error)
        }

        if (!candidatesDBData.length) {
          return resolve(null)
        }

        const candidateDBData = candidatesDBData[0]
        const candidateData: ICandidate = {
          id : candidateDBData.id,
          name : candidateDBData.name,
          data : candidateDBData.data,
          created : candidateDBData.created,
        }

        resolve(new CandidateModel(candidateData))
      })
    })
  }
}
