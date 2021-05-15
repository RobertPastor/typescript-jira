
import { log } from './log'

export interface HistoryItem {

    field: string,
    fieltype: string,
    from: any,
    fromString: string,
    to: any,
    toString: string
}

export interface HistoryItemsArray extends Array<HistoryItem> { }


//{"field":"labels","fieldtype":"jira","from":null,"fromString":null,"to":null,"toString":"V5.0"}
function readHistoryItem(historyItem: HistoryItem): void {

    log("field = " + historyItem.field)
    log("from = " + historyItem.fromString)
    log("to = " + historyItem.toString)

}

export function readHistoryItems(items: HistoryItemsArray): void {
    log("--------- read Jira History items ------------")
    if (Array.isArray(items)) {
        items.forEach(item => {
            log("-------- Jira History item ----------")
            //log(JSON.stringify(item))
            readHistoryItem(item)
        })
    }
}