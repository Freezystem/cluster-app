import cluster  from 'cluster';
import express  from 'express';
import os       from 'os';

const cpus = os.cpus();
const app  = express();

if ( cluster.isMaster ) {
  console.log(`Master cluster ${process.pid} setting up ${cpus.length} ${cpus.length > 1 ? 'workers' : 'worker'}`);

  cpus.forEach(() => cluster.fork());

  cluster.on('online', worker => console.log('Worker ' + worker.process.pid + ' is online'));

  cluster.on('exit', ( worker, code, signal ) => {
    console.log(`Worker ${worker.process.pid} died`, code, signal);
    cluster.fork();
  });
}
else {
  app.listen(8000);
  app.get('/', ( req, res ) => {
    res.end(`Hello World from worker ${process.pid}`);
  });
}

export default app;