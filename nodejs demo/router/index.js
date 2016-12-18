var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var server = http.createServer();
var htmlUrl = __dirname + '/html';

server.listen(8081,'localhost',function(){
	console.log('开启监听');
});


server.on('error',function(err){
	console.log(err);
});

server.on('request',function(req,res){
	var urlList = url.parse( req.url );
	switch( urlList.pathname ){
		case '/':
			getHtml( htmlUrl+'/1.html',req,res );
			break;
			
		case '/1':
			getHtml( htmlUrl+'/1.html',req,res );
			break;
			
		case '/2':
			getHtml( htmlUrl+'/2.html',req,res );
			break;
			
		case '/a':
			getHtml( htmlUrl+'/a/3.html',req,res );
			break;
			
		case '/check':
			/*if(req.method == 'POST'){
				var str = '';
				req.on('data',function(chunk){
					str += chunk;
				});
				req.on('end',function(){
					console.log(str);
                    console.log( querystring.parse( str ) );
				})
			};*/
			if(req.method == 'GET'){
				console.log( urlList.query );
				console.log( querystring.parse(urlList.query) )
			};
			break;
			
		default :
			getHtml( htmlUrl+urlList.pathname,req,res );
	}
});

function getHtml(path,req,res){
	fs.readFile(path,function(err,data){
		if(err){
			res.writeHead(404,{
				'content-type' : 'text/html;charset=utf-8'
			});
			res.end('<h1>没有找到页面，去死吧<h1>');
		}else{
			res.writeHead(200,{
				'content-type' : 'text/html;charset=utf-8'
			});
			res.end(data);
		}
	});
}