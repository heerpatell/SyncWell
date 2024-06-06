const mysql = require("mysql2/promise");

class DB {
	#pool;
	constructor(config = { isTesting: false }) {
		console.log("-- [DB] Connecting");
		this.#pool = mysql.createPool({
			host: process.env.DB_HOST,
			user: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: config?.isTesting
				? process.env.TEST_DB_NAME
				: process.env.PROD_DB_NAME,
			connectionLimit: 5,
			multipleStatements: true,
		});
		console.log("-- [DB] Connected");
	}
	async beginTransaction() {
		const conn = await this.#pool.getConnection();
		await conn.beginTransaction();
		return conn;
	}
	async commit(conn) {
		if (!conn) throw new Error("Connection does not exists.");
		await conn.commit();
	}
	async abortTransaction(conn) {
		if (!conn) throw new Error("Connection does not exists.");
		await conn.rollback();
	}
	async execute(queryString, params = [], conn = "") {
		if (!queryString || !Array.isArray(params)) {
			throw new Error("Invalid parameters for DB.execute function.");
		}
		if (conn) {
			return await conn.query(queryString, params);
		} else {
			const resp = await this.#pool.query(queryString, params);
			this.#pool.releaseConnection();
			return resp;
		}
	}
}

module.exports = DB;
