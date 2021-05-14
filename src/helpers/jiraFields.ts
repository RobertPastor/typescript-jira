import { Connection, Request, TYPES } from 'tedious'
import { log } from './log'

export function insertJiraFields(jiraFields: any, connection: Connection): Promise<Boolean> {

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
    if (jiraFields.hasOwnProperty("project")) {
        log("project key ===> " + jiraFields.project.key)
        log("project name ===> " + jiraFields.project.name)
    }

    if (jiraFields.hasOwnProperty("priority")) {
        log("priority ===> " + jiraFields.priority.name)
    }

    return new Promise(function (resolve, reject) {

        const sql: string = "INSERT INTO [dbo].DEMO_ECR_PCR_MAIN (CR, PROJECT, ISSUETYPE) VALUES (@CR, @PROJECT, @ISSUETYPE)"
        let request = new Request(sql, function (err, rowCount) {

            if (err) {
                console.log(err);
                reject(err)
            } else {
                console.log('Insert complete.');
                resolve(true)
            }

        })

        request.addParameter("CR", TYPES.NVarChar, "CR");
        request.addParameter("PROJECT", TYPES.NVarChar, jiraFields.project.name);
        request.addParameter("ISSUETYPE", TYPES.NVarChar, jiraFields.issuetype.name);

        request.on('row', function (columns) {
            columns.forEach(function (column) {
                console.log(column.value);
            });
        })
        connection.execSql(request);
    })
}