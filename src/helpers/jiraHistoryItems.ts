
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
function readItem(historyItem: HistoryItem): void {

    log(historyItem.field)
}

export function readItems(items: HistoryItemsArray): void {
    log("--------- read items ------------")
    if (Array.isArray(items)) {
        items.forEach(item => {
            log("-------- item ----------")
            log(JSON.stringify(item))
            readItem(item)
        })
    }
}