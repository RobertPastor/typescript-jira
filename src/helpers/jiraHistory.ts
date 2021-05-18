
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

        let tableName: string = " [dbo].DEMO_ECR_PCR_HISTORY "

        let sql: string = "INSERT INTO " + tableName
        sql += "  (CR, HISTORY_CREATED_DATE , ITEMS_FIELD, ITEMS_FROMSTRING, ITEMS_TOSTRING, UPDATE_DATE) "
        sql += " VALUES (@CR, @HISTORY_CREATED_DATE, @ITEMS_FIELD, @ITEMS_FROMSTRING, @ITEMS_TOSTRING, @UPDATE_DATE)"
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
        let date = new Date(historyItem.created)
        request.addParameter("HISTORY_CREATED_DATE", TYPES.DateTimeOffset, date);
        request.addParameter("ITEMS_FIELD", TYPES.NVarChar, historyItem.field);
        if (historyItem.fromString) {
            request.addParameter("ITEMS_FROMSTRING", TYPES.NVarChar, historyItem.fromString.substring(0, 500))
        } else {
            request.addParameter("ITEMS_FROMSTRING", TYPES.NVarChar, historyItem.fromString)
        }
        if (historyItem.toString) {
            request.addParameter("ITEMS_TOSTRING", TYPES.NVarChar, historyItem.toString.substring(0, 500))
        } else {
            request.addParameter("ITEMS_TOSTRING", TYPES.NVarChar, historyItem.toString)
        }
        date = new Date()
        request.addParameter("UPDATE_DATE", TYPES.DateTimeOffset, date)

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
        log("history items array length = " + JSON.stringify(historyItemsArray.length))
        let tableName: string = " [dbo].DEMO_ECR_PCR_HISTORY "

        let sql: string = " DELETE FROM " + tableName + " WHERE CR = '" + jiraObj.key + "'"
        log(sql)
        let requestDelete: Request = new Request(sql, function (err: Error, rowCount: number) {
            if (err) {
                log(JSON.stringify(err))
                reject(err)
            } else {
                log("delete row count => " + new String(rowCount))

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
                                    log("number of history items inserted = " + new String(historyItemsArray.length))
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
            }
        })
        connection.execSql(requestDelete)
    })
}