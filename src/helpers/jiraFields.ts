import { Connection, Request, TYPES } from 'tedious'
import { log } from './log'

export function insertJiraFields(jiraObj: any, jiraFields: any, connection: Connection): Promise<Boolean> {

    log("======= Jira fields ========")
    //log(JSON.stringify(jiraObj.fields))
    log("issue type = " + JSON.stringify(jiraFields.issuetype.name))

    log("======== Jira Issue Type =====")
    for (const key in jiraFields.issuetype) {
        log("key = " + key + " - " + JSON.stringify(jiraFields.issuetype[key]))
    }
    log("======== Jira Fields ======")
    for (const key in jiraFields) {
        log("key = " + key + " - " + JSON.stringify(jiraFields[key]))
    }

    log("======== Jira Fields created =========")
    if (jiraFields.hasOwnProperty("created")) {
        log("created ===> " + jiraFields.created)
    }
    log("======== Jira Fields Project =========")
    if (jiraFields.hasOwnProperty("project")) {
        log("project key ===> " + jiraFields.project.key)
        log("project name ===> " + jiraFields.project.name)
    }
    log("======== Jira Fields Priority =========")
    if (jiraFields.hasOwnProperty("priority")) {
        log("priority ===> " + jiraFields.priority.name)
    }

    return new Promise(function (resolve, reject) {

        let tableName: string = "[dbo].DEMO_ECR_PCR_MAIN "
        let sql: string = " DELETE FROM " + tableName + " WHERE CR = '" + jiraObj.key + "'"
        log(sql)
        let requestDelete: Request = new Request(sql, function (err: Error, rowCount: number) {
            if (err) {
                log(JSON.stringify(err))
                reject(err)
            } else {
                log("row count = " + new String(rowCount))

                sql = "INSERT INTO "
                sql += tableName + "  (CR, PROJECT, ISSUETYPE, CREATION_DATE, PRIORITY, SECURITY, UPDATE_DATE) "
                sql += " VALUES (@CR, @PROJECT, @ISSUETYPE, @CREATION_DATE, @PRIORITY, @SECURITY, @UPDATE_DATE)"
                let request: Request = new Request(sql, function (err: Error, rowCount: number) {
                    if (err) {
                        log(JSON.stringify(err))
                        reject(err)
                    } else {
                        log('Insert Jira Fields complete for -> ' + jiraObj.key);
                        resolve(true)
                    }
                })

                request.addParameter("CR", TYPES.NVarChar, jiraObj.key);
                request.addParameter("PROJECT", TYPES.NVarChar, jiraFields.project.name);
                request.addParameter("ISSUETYPE", TYPES.NVarChar, jiraFields.issuetype.name);
                let date = new Date(jiraFields.created)
                request.addParameter("CREATION_DATE", TYPES.DateTimeOffset, date)
                if (jiraFields.priority) {
                    request.addParameter("PRIORITY", TYPES.NVarChar, jiraFields.priority.name)
                } else {
                    request.addParameter("PRIORITY", TYPES.NVarChar, null)
                }
                if (jiraFields.security) {
                    request.addParameter("SECURITY", TYPES.NVarChar, jiraFields.security.name)
                } else {
                    request.addParameter("SECURITY", TYPES.NVarChar, null)
                }
                date = new Date()
                request.addParameter("UPDATE_DATE", TYPES.DateTimeOffset, date)


                request.on('row', function (columns) {
                    columns.forEach(function (column) {
                        console.log(column.value);
                    });
                })
                connection.execSql(request);
            }
        })
        connection.execSql(requestDelete)
    })
}