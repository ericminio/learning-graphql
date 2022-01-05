const http = require('http');

const request = (options)=> {
    return new Promise((resolve, reject)=>{
        let request = http.request(options, pong => {
            let body = '';
            pong.on('data', chunk => {
                body += chunk;
            });
            pong.on('end', ()=>{
                pong.body = body;
                resolve(pong);
            });
            pong.on('error', error => {
                reject(error);
            })
        })
        request.on('error', error => {
            reject(error);
        })
        let contentType = options.contentType || 'application/graphql'
        request.setHeader('content-type', contentType);
        if (options.payload) {
            request.write(options.payload);
        }
        request.end();
    })
};

module.exports = {
    request:request
};