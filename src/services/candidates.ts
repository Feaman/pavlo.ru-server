import BaseService from '~/services/base'
import CandidateModel, { ICandidate, ICandidateDB } from '~/models/candidate'
import { MysqlError } from 'mysql'

export default class CandidatesService extends BaseService {
  static async getList (): Promise<CandidateModel[]> {
    return new Promise((resolve, reject) => {
      const notes: CandidateModel[] = []

      this.pool.query(
        'select * from candidates order by created desc', 
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

  static async create (candidateData: ICandidate): Promise<CandidateModel> {
    const existentCandidate = await this.findById(String(candidateData.id))
    if (existentCandidate) {
      throw new Error('Candidate with such an id is already exists')
    }

    const candidate = new CandidateModel(candidateData)
    return candidate.save()
  }

  static async update (candidateId: string, data: any): Promise<CandidateModel> {
    const candidate = await this.findById(candidateId)
    if (!candidate) {
      throw new Error('Candidate not found')
    }
    candidate.name = data.name
    candidate.data = data.data

    return candidate.save()
  }

  static async remove (candidateId: string): Promise<CandidateModel> {
    const candidate = await this.findById(candidateId)
    if (!candidate) {
      throw new Error('Candidate not found')
    }
    return candidate.remove()
  }

  static findById (id: string): Promise<CandidateModel | null> {
    return this.findByField('id', id)
  }

  static async findByField (fieldName: string, fieldValue: string): Promise<CandidateModel | null> {
    return new Promise((resolve, reject) => {
      this.pool.query({
        sql: `select * from candidates where ${fieldName} = ?`,
        values: [fieldValue],
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
