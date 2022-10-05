import BaseModel from './base'

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

export default class CandidateModel extends BaseModel {
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
    super()
    this.id = data.id
    this.name = data.name
    this.data = data.data
    this.created = data.created
  }
}
