import fs from 'fs'
import { log } from './helpers/log'
import { Connection } from 'tedious'

import { insertJiraFields } from './helpers/jiraFields'
import { insertJiraChangeLog } from './helpers/jiraHistory'
import { connect } from './helpers/azureSqlConnect'

import { readBigJson } from './helpers/readBigJson'
import { insertJiraObj } from './helpers/jiraObjInsert'


function insertJiraObjArray(jiraJsonData: any, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

        if (Array.isArray(jiraJsonData)) {

            log("it is an array containing " + jiraJsonData.length + " elements ")

            let index = 0
            let jiraObj = undefined
            function next(jiraObj: any) {

                insertJiraObj(jiraObj, connection)
                    .then(_ => {
                        log("one Jira Obj insertion done")
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

function startScriptOld(): void {

    let inputFilePath: string = "../inputs/jira-json-lines-12-May-2021-16h06-01-TZplus-02-00.jsonl"
    inputFilePath = "../inputs/jira-json-lines-25-March-2021-14h19-45-TZplus-01-00.jsonl"
    inputFilePath = "../inputs/jira-json-lines-18-May-2021-21h17-27-TZplus-02-00.jsonl"
    const azureSqlConfigurationDataPath: string = "../inputs/AzureSqlConfigurationData.json"

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

function startScript() {

    let inputFilePath: string = "./inputs/jira-json-lines-12-May-2021-16h06-01-TZplus-02-00.jsonl"
    inputFilePath = "./inputs/jira-json-lines-25-March-2021-14h19-45-TZplus-01-00.jsonl"
    inputFilePath = "./inputs/jira-json-lines-18-May-2021-21h17-27-TZplus-02-00.jsonl"
    const azureSqlConfigurationDataPath: string = "./inputs/AzureSqlConfigurationData.json"


    fs.readFile(azureSqlConfigurationDataPath, function (err, azureSqlConfigDataBuffer) {

        if (err) {
            log(JSON.stringify(err))
        } else {
            log("--- Azure configuration data read ---")
            let azureSqlConfigData: any = JSON.parse(azureSqlConfigDataBuffer.toString())
            connect(azureSqlConfigData)
                .then(connection => {

                    log("======== Azure SQL connected =========")
                    readBigJson(inputFilePath, connection)
                        .then(_ => {

                            connection.close();
                            log("------- end script -------------")
                        })
                        .catch(err => {
                            log("======= error ========")
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
startScript()
//readBigJson(inputFilePath)