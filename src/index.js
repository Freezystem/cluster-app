import cluster  from 'cluster';
import http     from 'http';
import os       from 'os';

const cpus = os.cpus();

if ( cluster.isMaster ) {
  console.log(`App running on ${cpus.length} ${cpus.length > 1 ? 'cpus' : 'cpu'}`);
  console.log(`Master ${process.pid} is running`);

  cpus.forEach(() => cluster.fork());

  cluster.on('exit', ( worker, code, signal ) => {
    console.log(`worker ${worker.process.pid} died`, code, signal);
  });
} 
else {
  http.createServer(( req, res ) => {
    res.writeHead(200);
    res.end(`hello world from ${process.pid}`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}