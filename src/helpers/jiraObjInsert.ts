
import { log } from './log'
import { Connection } from 'tedious'

import { insertJiraFields } from './jiraFields'
import { insertJiraChangeLog } from './jiraHistory'

export function insertJiraObj(jiraObj: any, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

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
            insertJiraFields(jiraObj, jiraObj.fields, connection)
                .then(_ => {
                    log("insert jira fields OK")
                    if (jiraObj.hasOwnProperty("changelog")) {
                        insertJiraChangeLog(jiraObj, connection)
                            .then(_ => {
                                log("insert Jira ChangeLog OK -> " + jiraObj.key)
                                resolve(true)
                            })
                            .catch((err: any) => {
                                log(JSON.stringify(err))
                                reject(err)
                            })
                    } else {
                        log("jira obj is missing changelog property !!!")
                        resolve(false)
                    }
                })
                .catch((err: any) => {
                    log(JSON.stringify(err))
                    reject(err)
                })
        }
    })
}