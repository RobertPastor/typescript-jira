import fs from 'fs'
import { log } from './helpers/log'

import { readJiraFields } from './helpers/jiraFields'
import { readJiraChangeLog } from './helpers/jiraHistory'
import { connect } from './helpers/azureSqlConnect'

const inputFilePath = "./inputs/jira-json-lines-12-May-2021-16h06-01-TZplus-02-00.jsonl"
const azureSqlConfigurationDataPath = "./AzureSqlConfigurationData.json"


function readJiraObjArray(jiraJsonData: any): void {

    if (Array.isArray(jiraJsonData)) {
        log("it is an array containing " + jiraJsonData.length + " elements ")
        jiraJsonData.forEach(jiraObj => {
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
                readJiraFields(jiraObj.fields)
            }
            if (jiraObj.hasOwnProperty("changelog")) {
                //readJiraChangeLog(jiraObj.changelog)
            }
        })
    }
}

function startScript(): void {

    log("-----------start script -----------")
    fs.readFile(inputFilePath, function (err, jiraJsonDataBuffer) {

        if (err) {
            log(JSON.stringify(err))
        } else {
            fs.readFile(azureSqlConfigurationDataPath, function (err, azureSqlConfigDataBuffer) {

                if (err) {
                    log(JSON.stringify(err))
                } else {
                    log(" Azure configuration data read ")
                    let azureSqlConfigData: any = JSON.parse(azureSqlConfigDataBuffer.toString())
                    connect(azureSqlConfigData)
                        .then(connection => {

                            log("======== Azure SQL connected =========")
                            let jiraJsonData = JSON.parse(jiraJsonDataBuffer.toString())
                            //log(JSON.stringify(jiraJsonData))
                            readJiraObjArray(jiraJsonData)

                            connection.close();
                            log("------- end script -------------")
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