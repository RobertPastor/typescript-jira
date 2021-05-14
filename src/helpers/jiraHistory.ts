
import { log } from './log'
import { readHistoryItems, HistoryItemsArray } from './jiraHistoryItems'

export interface JiraHistory {

    id: string,
    author: any,
    created: string,
    items: HistoryItemsArray
}

function readHistory(history: any): void {

    log("--- read Jira history  --- ")
    for (const key in history) {
        //log(key + " - " + JSON.stringify(history[key]))
        if (key == "created") {
            log(history.created)
        }

        if (key == "items") {
            readHistoryItems(history[key])
        }
    }
}

export function readHistories(histories: any): void {

    log("====== read histories =============")
    if (Array.isArray(histories)) {
        histories.forEach(history => {
            log(JSON.stringify(history))
            readHistory(history)
        })
    }
}

export function readJiraChangeLog(changelog: any): void {

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