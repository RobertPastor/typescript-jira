
import fs from 'fs'
import es from 'event-stream'
import { Connection } from 'tedious'
import { insertJiraObj } from './jiraObjInsert'
import { log } from './log'

export function readBigJson(inputFilePath: string, connection: Connection): Promise<boolean> {

    return new Promise(function (resolve, reject) {

        console.log(" read big Json lines ")
        //let lines: any = [];
        let count: number = 0

        let s = fs.createReadStream(inputFilePath)
            .pipe(es.split())
            .pipe(es.mapSync(function (line: string) {
                //pause the readstream
                console.log(line)
                if ((line == '[') || (line == ",") || (line == ']')) {
                    s.resume()
                } else {
                    s.pause();

                    //lines.push(line);
                    let jiraObj = JSON.parse(line)
                    insertJiraObj(jiraObj, connection)
                        .then(_ => {

                            count = count + 1
                            s.resume();
                        })
                        .catch(err => {
                            log(err)
                            reject(err)
                        })
                }

            })
                .on('error', function (err: Error) {
                    console.log('Error:', err);
                    reject(err)
                })
                .on('end', function () {
                    console.log('Finish reading.');
                    console.log(count);
                    resolve(true)
                })
            );

    })
}

