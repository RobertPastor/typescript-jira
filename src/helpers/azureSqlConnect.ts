

import tedious from 'tedious';
//const Connection = require('tedious').Connection;
import { log } from './log.js'


export function executeStatement(connection: any) {

    return new Promise(function (resolve, reject) {

        let statement = "SELECT * FROM INFORMATION_SCHEMA.TABLES"
        log("execute Statement")
        let request = new tedious.Request(statement, function (err: any, rowCount: number, rows: any) {

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

export function connect(configurationData: any): Promise<any> {

    log(JSON.stringify(configurationData))
    const config: any = {
        server: configurationData.server, // or "localhost"
        userName: configurationData.user,
        password: configurationData.password,
        options: {
            requestTimeout: 60000,
            encrypt: true,
            database: configurationData.database,
            port: configurationData.port,
            rowCollectionOnRequestCompletion: true,
            debug: {
                packet: true,
                data: true,
                payload: true,
                token: true,
                log: true
            }
        },

        authentication: {
            type: "default",
            options: {
                userName: configurationData.user,
                password: configurationData.password,
            }
        }
    };

    /*
    config.options.debug = {
        packet: true,
        data: true,
        payload: true,
        token: true,
        log: true
    }
    */

    return new Promise(function (resolve, reject) {

        let connection = new tedious.Connection(config);

        // Setup event handler when the connection is established. 
        connection.on('connect', function (err: any) {
            log("connect")
            if (err) {
                log('Error: ' + JSON.stringify(err))
                reject(err)
            } else {
                // If no error, then good to go...
                log("connection is OK")
                resolve(connection)
            }
        });

        connection.on('error', function (err: any) {
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
        // Initialize the connection.
        connection.connect();
    })

}

