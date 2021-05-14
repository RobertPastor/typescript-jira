const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

import path from 'path';
import stackTrace from "stack-trace";

function getFileName(): string {
    let currentStackTrace = stackTrace.get();
    let err = new Error();
    let trace = stackTrace.parse(err);
    let fileName = trace[2].getFileName();
    if (String(fileName).includes('dist')) {
        fileName = String(fileName).split('dist')[1]
    }
    return fileName;
}

function getLineNumber(): number {
    let currentStackTrace = stackTrace.get();
    let err = new Error();
    let trace = stackTrace.parse(err);
    let lineNumber = trace[2].getLineNumber();
    return lineNumber;
}

export function log(message: string): void {
    let dateTime = new Date();

    //var date_options = { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Paris", hour12: false };
    //console.log ( dateTime.toLocaleTimeString("fr-FR", date_options)  + ' - ' + data);
    let strMessage = '';
    strMessage = days[dateTime.getDay()] + ', ' + months[dateTime.getMonth()] + ' ' + dateTime.getDate() + ', ' + dateTime.getFullYear();
    strMessage += ', ';
    strMessage += String('00' + dateTime.getHours()).slice(-2);
    strMessage += ':' + String('00' + dateTime.getMinutes()).slice(-2);
    strMessage += ':' + String('00' + dateTime.getSeconds()).slice(-2);

    strMessage += ' - ' + getFileName();
    strMessage += ' - [' + getLineNumber() + ']';
    strMessage += ' - ' + String(message);

    console.log(strMessage);
}
