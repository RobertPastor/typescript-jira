import fs from 'fs'
import { log } from './helpers/log'
import { Connection } from 'tedious'

import { insertJiraFields } from './helpers/jiraFields'
import { insertJiraChangeLog } from './helpers/jiraHistory'
import { connect } from './helpers/azureSqlConnect'


const inputFilePath = "./inputs/jira-json-lines-12-May-2021-16h06-01-TZplus-02-00.jsonl"
const azureSqlConfigurationDataPath = "./AzureSqlConfigurationData.json"

function insertJiraObj(jiraObj: any, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

        log("======jira obj key value =======")
        for (const key in jiraObj) {
            //log("key = " + key + " - " + JSON.stringify(jiraObj[key]))
        }

        //log(JSON.stringify(jiraObj))
        if (jiraObj.hasOwnProperty("key")) {
            log("=======key========")
            log(JSON.stringify(jiraObj.key))
            //log(JSON.stringify(jiraObj)) 
        }
        if (jiraObj.hasOwnProperty("fields")) {
            insertJiraFields(jiraObj, jiraObj.fields, connection)
                .then(_ => {
                    log("insert jira fields OK")
                    if (jiraObj.hasOwnProperty("changelog")) {
                        insertJiraChangeLog(jiraObj, connection)
                            .then(_ => {
                                log("insert Jira ChangeLog OK")
                                resolve(true)
                            })
                            .catch((err: any) => {
                                log(JSON.stringify(err))
                                reject(err)
                            })
                    } else {
                        resolve(true)
                    }
                })
                .catch((err: any) => {
                    log(JSON.stringify(err))
                    reject(err)
                })
        }

    })
}


function insertJiraObjArray(jiraJsonData: any, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

        if (Array.isArray(jiraJsonData)) {

            log("it is an array containing " + jiraJsonData.length + " elements ")

            let index = 0
            let jiraObj = undefined
            function next(jiraObj: any) {

                insertJiraObj(jiraObj, connection)
                    .then(_ => {
                        log("one insertion done")
                        index = index + 1
                        if (index < jiraJsonData.length) {
                            jiraObj = jiraJsonData[index]
                            next(jiraObj)
                        } else {
                            log("all insertions done")
                            resolve(true)
                        }
                    })
                    .catch(err => {
                        reject(err)
                    })
            }
            jiraObj = jiraJsonData[index]
            next(jiraObj)

        } else {
            reject(false)
        }
    })

}

function startScript(): void {

    log("----------- start script -----------")
    fs.readFile(inputFilePath, function (err, jiraJsonDataBuffer) {

        if (err) {
            log(JSON.stringify(err))
        } else {
            fs.readFile(azureSqlConfigurationDataPath, function (err, azureSqlConfigDataBuffer) {

                if (err) {
                    log(JSON.stringify(err))
                } else {
                    log("--- Azure configuration data read ---")
                    let azureSqlConfigData: any = JSON.parse(azureSqlConfigDataBuffer.toString())
                    connect(azureSqlConfigData)
                        .then(connection => {

                            log("======== Azure SQL connected =========")
                            let jiraJsonData = JSON.parse(jiraJsonDataBuffer.toString())
                            //log(JSON.stringify(jiraJsonData))
                            insertJiraObjArray(jiraJsonData, connection)
                                .then(_ => {
                                    connection.close();
                                    log("------- end script -------------")
                                })
                                .catch(err => {
                                    log(JSON.stringify(err))
                                })

                        })
                        .catch(err => {
                            log("======= error ========")
                            log(JSON.stringify(err))
                        })
                }
            })
        }
    })
}
startScript()