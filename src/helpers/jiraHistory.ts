
import { log } from './log'
import { readHistoryItems, HistoryItemsArray } from './jiraHistoryItems'
import { Connection } from 'tedious'

export interface JiraHistory {

    id: string,
    author: any,
    created: string,
    items: HistoryItemsArray
}

function readHistory(history: JiraHistory): void {

    log("--- read Jira history  --- ")
    for (const key in history) {
        //log(key + " - " + JSON.stringify(history[key]))
        if (key == "created") {
            log("history created -> " + history.created)
        }
        if (key == "items") {
            readHistoryItems(history[key])
        }
    }
}

export function insertHistories(histories: any): void {

    log("====== read histories =============")
    if (Array.isArray(histories)) {
        histories.forEach(history => {
            log("history -> " + JSON.stringify(history))
            readHistory(history)
        })
    }
}

export function insertJiraChangeLog(jiraObj: any, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

        log("----------- insert JIRA change log ---------------")
        log(JSON.stringify(jiraObj.changelog))
        for (const key in jiraObj.changelog) {
            log("========== history ======")
            //log(key + " - " + JSON.stringify(changelog[key]))
            if (key == "histories") {
                insertHistories(jiraObj.changelog.histories)
            }
        }

    })
}