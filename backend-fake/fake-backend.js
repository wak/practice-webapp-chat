var http = require('http');
var server = http.createServer();

var request_count = 0;

server.on('request', function(request, response) {
  request_count += 1;
  console.log("#" + request_count + " " + request.url);
  switch(request.url) {
  case '/publish':
    publish_message(request, response);
    break;
  case '/read':
    get_messages(request, response);
    break;
  default:
    response.statusCode = 404;
    response.end();
    break;
  }
});

var database = [{timestamp: new Date(), message: "backend started."}];
function get_messages(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(database));
  response.end();
}

function publish_message(request, response) {
  if (request.method != 'POST') {
    response.statusCode = 404;
    response.write(JSON.stringify({status: 'ERROR'}));
    response.end();
    return;
  }
  var data = '';
  request
    .on('data', function(chunk) { data += chunk; })
    .on('end', function() {
      console.log('publish: ' + data);

      response.setHeader('Content-Type', 'application/json');
      try {
        var obj = JSON.parse(data);
        database.unshift({
          timestamp: new Date(),
          message: obj.message
        });
        response.write(JSON.stringify({status: 'OK'}));
        response.end();
      } catch (e) {
        console.log(e);
        response.statusCode = 400;
        response.write(JSON.stringify({status: 'ERROR'}));
        response.end();
      }
    });
}

server.listen(3001);
