var express = require('express');
var app = express();
var server = require('http').Server(app);
const path = require('path');
const fs = require('fs');

server.listen(8080);

app.use(express.static('public'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'public/index.html'));
});

console.log("hi")

tibbles = []

for(let i=0; i<34; i++){
  let title = './tibbles/tibble' + (-82.5+5*i) + '.csv'
  // let title="./tibble/tibble-12.5.csv";
  fs.readFile(title, 'Utf8', (err, data) => {
    if(err){
      console.error(err);
    }else{
      tibbles.push(data.split("\n"));
    }
  });
}



app.use('/static', express.static('node_modules'));

var io = require('socket.io')(server,{});
io.sockets.on('connection', function(socket){
  console.log("Connected succesfully to the socket ...");
  
  socket.on('timeQuery', function (data) {
    let anomalies = []
    for(let i=0; i<34; i++){
      anomalies.push(tibbles[i][data.date+1].split(",")[1]);
    }
    console.log("hello")
    socket.emit('timeResponse', {"anomalies": anomalies})
  });
});

