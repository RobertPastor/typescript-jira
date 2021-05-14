import { log } from './log'

export function readJiraFields(jiraFields: any): void {

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

}