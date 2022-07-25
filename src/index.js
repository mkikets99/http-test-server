const http = require('http');
const https = require('https');
const http2 = require('http2');
const fs = require('fs');
const path = require('path')

let viewsDir = path.join(__dirname,"views");
let configstr = fs.readFileSync(path.join(__dirname,'config.json'))
let config = {
    "http":{
        "port":4350
    },
    "https":{
        "port":4351,
        "cert":{
            "file":"certs/localhost.crt",
            "key":"certs/localhost.key"
        }
    },
    "http2":{
        "port":4352,
        "cert":{
            "file":"certs/localhost.crt",
            "key":"certs/localhost.key"
        }
    }
};
try{
config = JSON.parse(configstr);
}catch(_e){
    
}

if(!fs.existsSync(path.join(__dirname,config.https.cert.file))||!fs.existsSync(path.join(__dirname,config.https.cert.key))) config.https = undefined;
if(!fs.existsSync(path.join(__dirname,config.http2.cert.file))||!fs.existsSync(path.join(__dirname,config.http2.cert.key))) config.http2 = undefined;

/**
 * 
 * @param {http.RequestOptions|http2.Http2ServerRequest} req 
 * @param {http.ServerResponse|http2.Http2ServerResponse} res 
 */
let worker = (req,res) => {
    console.log(req.headers.host);
    res.writeHead(200,req.headers).write("200 "+req.method+" "+req.url);
    res.end();
};


if(config.http){
    var server = http.createServer(worker);
    server.listen(config.http.port,()=>{console.log("http server started")});
}
if(config.https){
    var servers = https.createServer({
        cert:fs.readFileSync(path.join(__dirname,config.https.cert.file)),
        key:fs.readFileSync(path.join(__dirname,config.https.cert.key))
    },worker);
    servers.listen(config.https.port,()=>{console.log("https server started")});
}
if(config.http2){
    var server2 = http2.createServer();
    server2.on('stream',(stream,headers)=>{
        console.log(headers.host);
        stream.respond({...headers,':status':200})
        res.end("200 "+headers[':method']+" "+headers[':path']);
    })
    server2.on('error',(error)=>{
        console.log(error.message);
    })
    server2.listen(config.http2.port,()=>{console.log("http2 server started. may not working btw.")});
}
//console.log();
