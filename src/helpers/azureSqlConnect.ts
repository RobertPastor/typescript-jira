

import { Connection, ConnectionConfig, DebugOptions } from 'tedious';
//const Connection = require('tedious').Connection;
import { log } from './log.js'


/*
export function executeStatement(connection: any) {

    return new Promise(function (resolve, reject) {

        let statement = "SELECT * FROM INFORMATION_SCHEMA.TABLES"
        log("execute Statement")
        let request = new Request(statement, function (err: any, rowCount: number, rows: any) {

            if (err) {
                log(err)
                reject(err)
            } else {
                log("row count = " + new String(rowCount))
                rows.forEach(function (row: any) {
                    log(JSON.stringify(row))
                });
                resolve(true)
            }
        })
        connection.execSql(request);

    })
}
*/

export function connect(configurationData: any): Promise<Connection> {

    log(JSON.stringify(configurationData))

    let debug: DebugOptions = {
        packet: false,
        data: false,
        payload: false,
        token: false
    }

    const config: ConnectionConfig = {
        server: configurationData.server, // or "localhost"

        options: {
            requestTimeout: 60000,
            encrypt: true,
            database: configurationData.database,
            port: configurationData.port,
            rowCollectionOnRequestCompletion: true,
            debug: debug
        },
        authentication: {
            type: "default",
            options: {
                userName: configurationData.user,
                password: configurationData.password,
            }
        }
    }

    return new Promise(function (resolve, reject) {

        const connection: Connection = new Connection(config);

        // Setup event handler when the connection is established. 
        connection.on('connect', function (err: Error) {
            log("-----> connect")
            if (err) {
                log('Error: ' + JSON.stringify(err))
                reject(err)
            } else {
                // If no error, then good to go...
                log("connection is OK")
                resolve(connection)
            }
        });

        connection.on('error', function (err: Error) {
            log("=========> error ")
            log(JSON.stringify(err))
            reject(err)
        })

        connection.on('errorMessage', function (msg: any) {
            log(JSON.stringify(msg))
        });

        connection.on('debug', function (text: string) {
            log(text)
        });
        connection.on('end', function () {
            log("end")
        })
        // Initialize the connection.
        connection.connect();
    })

}

