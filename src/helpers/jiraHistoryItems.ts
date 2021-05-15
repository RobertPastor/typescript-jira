
import { log } from './log'

export interface HistoryItem {

    created: string,
    field: string,
    fieltype: string,
    from: any,
    fromString: string,
    to: any,
    toString: string
}

export interface HistoryItemsArray extends Array<HistoryItem> { }


//{"field":"labels","fieldtype":"jira","from":null,"fromString":null,"to":null,"toString":"V5.0"}
function readHistoryItem(created: string, historyItem: HistoryItem): HistoryItem {

    historyItem.created = created
    log("field = " + historyItem.field)
    //log("fromString = " + historyItem.fromString)
    //log("toString = " + historyItem.toString)
    return historyItem;

}

export function readHistoryItems(created: string, items: HistoryItemsArray): HistoryItemsArray {
    let historyItemsArray: HistoryItemsArray = []
    log("--------- read Jira History items ------------")
    if (Array.isArray(items)) {
        items.forEach(item => {
            log("-------- Jira History item ----------")
            //log(JSON.stringify(item))
            historyItemsArray.push(readHistoryItem(created, item))
        })
    }
    return historyItemsArray;
}