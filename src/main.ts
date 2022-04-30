import * as https from "https";
import * as querystring from "querystring";
import md5 = require("md5");
import {appid, pss} from "./private";

export const translate = (word: string) => {
    const salt = Math.random()
    const sign = md5(appid + word + salt +pss)
    let from,to;
    if(/[a-zA-z]/.test(word)){
        from = 'en';
        to = 'zh'
    } else {
        from = 'zh';
        to = 'en'
    }
    const param = querystring.stringify({
        q: word,
        from,
        to,
        appid,
        salt,
        sign
    })

    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: `/api/trans/vip/translate?${param}`,
        method: 'GET'
    };

    const request = https.request(options, (response) => {
        // console.log('statusCode:', response.statusCode);
        // console.log('headers:', response.headers);
        const chunks:Buffer[] = []
        response.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
        });
        response.on('end', () => {
            const string = Buffer.concat(chunks).toString()
            type BaiduResult = {
                error_code?: string,
                error_msg?: string,
                from: string,
                to: string,
                trans_result:{ src: string, dst: string }[]
            }
            const result: BaiduResult = JSON.parse(string)
            if(result.error_code) {
                console.log('翻译失败');
                process.exit(2)
            } else {
                console.log(result.trans_result[0].dst);
                process.exit(0)
            }

        })
    });

    request.on('error', (e) => {
        console.error(e);
    });
    request.end();
}