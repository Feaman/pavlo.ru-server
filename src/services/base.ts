import { Pool } from "mysql"

export default class BaseService {
  static pool: Pool

  static init (): void {
    const mysql = require("mysql")
    this.pool = mysql.createPool({
      socketPath: "/var/lib/mysql/mysql.sock",
      user: "interview_user",
      password: "interview_user",
      database: "interview",
    })
  }
}
