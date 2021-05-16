
import { log } from './log'
import { readHistoryItems, HistoryItemsArray, HistoryItem } from './jiraHistoryItems'
import { Connection, TYPES, Request } from 'tedious'

export interface JiraHistory {

    id: string,
    author: any,
    created: string,
    items: HistoryItemsArray
}

function readHistory(history: JiraHistory): HistoryItemsArray {

    let historyItemsArray: HistoryItemsArray = []
    log("--- read Jira history  --- ")
    for (const key in history) {
        //log(key + " - " + JSON.stringify(history[key]))
        if (key == "created") {
            log("history created -> " + history.created)
        }
        if (key == "items") {
            historyItemsArray = historyItemsArray.concat(readHistoryItems(history.created, history[key]))
        }
    }
    return historyItemsArray
}

export function insertHistories(histories: any): HistoryItemsArray {

    let historyItemsArray: HistoryItemsArray = []
    log("====== read histories =============")
    if (Array.isArray(histories)) {
        histories.forEach(history => {
            //log("history -> " + JSON.stringify(history))
            historyItemsArray = historyItemsArray.concat(readHistory(history))
        })
    }
    return historyItemsArray
}

function insertHistoryItem(jiraObj: any, historyItem: HistoryItem, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

        let sql: string = "INSERT INTO [dbo].DEMO_ECR_PCR_HISTORY (CR, HISTORY_CREATED , ITEMS_FIELD, ITEMS_FROMSTRING, ITEMS_TOSTRING) "
        sql += " VALUES (@CR, @HISTORY_CREATED, @ITEMS_FIELD, @ITEMS_FROMSTRING, @ITEMS_TOSTRING)"
        let request = new Request(sql, function (err: any, rowCount: number) {
            if (err) {
                log(JSON.stringify(err))
                reject(err)
            } else {
                log('Insert complete.');
                resolve(true)
            }
        })

        request.addParameter("CR", TYPES.NVarChar, jiraObj.key);
        request.addParameter("HISTORY_CREATED", TYPES.NVarChar, historyItem.created);
        request.addParameter("ITEMS_FIELD", TYPES.NVarChar, historyItem.field);
        request.addParameter("ITEMS_FROMSTRING", TYPES.NVarChar, historyItem.fromString)
        request.addParameter("ITEMS_TOSTRING", TYPES.NVarChar, historyItem.toString)

        request.on('row', function (columns) {
            columns.forEach(function (column) {
                console.log(column.value);
            });
        })
        connection.execSql(request);
    })
}

export function insertJiraChangeLog(jiraObj: any, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

        let historyItemsArray: HistoryItemsArray = []
        log("----------- insert JIRA change log ---------------")
        log(JSON.stringify(jiraObj.changelog))
        for (const key in jiraObj.changelog) {
            log("========== history ======")
            //log(key + " - " + JSON.stringify(changelog[key]))
            if (key == "histories") {
                historyItemsArray = historyItemsArray.concat(insertHistories(jiraObj.changelog.histories))
            }
        }
        //log(JSON.stringify(historyItemsArray))

        if (historyItemsArray.length > 0) {

            let historyItem: HistoryItem
            let index: number = 0
            function next(historyItem: HistoryItem) {
                insertHistoryItem(jiraObj, historyItem, connection)
                    .then(_ => {
                        log("---> one history item inserted OK")
                        index = index + 1
                        if (index < historyItemsArray.length) {
                            historyItem = historyItemsArray[index]
                            next(historyItem)
                        } else {
                            log("---> all history items correctly inserted -> OK")
                            resolve(true)
                        }
                    })
                    .catch(err => {
                        log(JSON.stringify(err))
                        reject(err)
                    })

            }
            historyItem = historyItemsArray[index]
            next(historyItem)
        } else {
            resolve(true)
        }

    })
}