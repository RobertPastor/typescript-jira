import fs from 'fs'
import { log } from './helpers/log'

const filePath = "./inputs/jira-json-lines-12-May-2021-16h06-01-TZplus-02-00.jsonl"

function readItems(items: any): void {
    log("--------- read items ------------")
    if (Array.isArray(items)) {
        items.forEach(item => {
            log("-------- item ----------")
            log(JSON.stringify(item))
        })
    }
}

function readHistory(history: any): void {

    log("--- read history  --- ")
    for (const key in history) {
        log(key + " - " + JSON.stringify(history[key]))
        if (key == "items") {
            readItems(history[key])
        }
    }
}

function readHistories(histories: any): void {

    log("====== read histories =============")
    if (Array.isArray(histories)) {
        histories.forEach(history => {
            log(JSON.stringify(history))
            readHistory(history)
        })
    }
}

function readChangeLog(changelog: any): void {

    log("----------- read change log ---------------")
    //log(JSON.stringify(changelog))
    for (const key in changelog) {
        log("==========history===")
        log(key + " - " + JSON.stringify(changelog[key]))
        if (key == "histories") {
            readHistories(changelog.histories)
        }
    }
}

function readJiraObjArray(jiraJsonData: any): void {

    if (Array.isArray(jiraJsonData)) {
        log("it is an array containing " + jiraJsonData.length + " elements ")
        jiraJsonData.forEach(jiraObj => {
            log("=============")
            for (const key in jiraObj) {
                log(`${key}: ${jiraObj[key]}`)
            }

            //log(JSON.stringify(jiraObj))
            if (jiraObj.hasOwnProperty("key")) {
                log("=======key========")
                log(JSON.stringify(jiraObj.key))

                //log(JSON.stringify(jiraObj)) 
            }
            if (jiraObj.hasOwnProperty("fields")) {
                log("=======fields========")
                //log(JSON.stringify(jiraObj.fields))
                log(JSON.stringify(jiraObj.fields.issuetype.name))

                for (const key in jiraObj.fields.issuetype) {
                    log(`${key}: ${jiraObj.fields.issuetype[key]}`)
                }
            }
            if (jiraObj.hasOwnProperty("changelog")) {
                readChangeLog(jiraObj.changelog)
            }
        })
    }
}

function startScript(): void {

    log("starting")
    fs.readFile(filePath, function (err, jiraJsonDataBuffer) {

        if (err) {
            log(JSON.stringify(err))
        } else {
            let jiraJsonData = JSON.parse(jiraJsonDataBuffer.toString());
            //log(JSON.stringify(jiraJsonData))
            readJiraObjArray(jiraJsonData)
            log("------- end script -------------")
        }
    })
}
startScript()