import cluster  from 'cluster';
import os       from 'os';
import colors   from './helpers/colors';

let requestCount    = 0;
const cpus          = os.cpus();
const { log, warn } = console;
const { 
  FgCyan, 
  FgBlue, 
  FgYellow,
  Reset 
}                   = colors;

if ( cluster.isMaster ) {
  log(`Master cluster ${FgBlue}${process.pid}${Reset} setting up ${FgYellow}${cpus.length}${Reset} ${cpus.length > 1 ? 'workers' : 'worker'}`);

  cpus.forEach(() => cluster.fork());

  cluster.on('online', worker => log(`Worker ${FgCyan}${worker.process.pid}${Reset} is online`));

  cluster.on('exit', ( worker, code, signal ) => warn(`Worker ${worker.process.pid} died`, code, signal));

  cluster.on('message', ( worker, message ) => {
    if ( message.cmd === 'notifyRequest' ) requestCount++;

    log(`${FgBlue}from worker(${worker.process.pid}) #${worker.id} to master(${process.pid}): ${message.cmd}`);
    cluster.workers[worker.id].send({ cmd : 'notifyReceived', requestCount });
  });
}
else {
  process.on('message', message => log(`${FgCyan}from master to worker(${process.pid}): ${message.cmd}`));
  require('./server');
}