import cluster            from 'cluster';
import os                 from 'os';

let requestCount  = 0;
const cpus        = os.cpus();

if ( cluster.isMaster ) {
  console.log(`Master cluster ${process.pid} setting up ${cpus.length} ${cpus.length > 1 ? 'workers' : 'worker'}`);

  cpus.forEach(() => cluster.fork());

  cluster.on('online', worker => console.log('Worker ' + worker.process.pid + ' is online'));

  cluster.on('exit', ( worker, code, signal ) => console.log(`Worker ${worker.process.pid} died`, code, signal));

  cluster.on('message', ( worker, message ) => {
    if ( message.cmd === 'notifyRequest' ) requestCount++;

    console.log(`from worker #${worker.id}:`, worker.process.pid , 'to master:', process.pid, message);
    console.log('requestCount:', requestCount);
  });
}
else {
  process.on('message', message => console.log('worker', process.pid, message));
  require('./server');
}