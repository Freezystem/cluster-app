import cluster  from 'cluster';
import os       from 'os';
import colors   from './helpers/colors';

let requestCount  = 0;
const cpus        = os.cpus();
const { log }     = console;
const { 
  FgCyan, 
  FgBlue, 
  FgYellow,
  FgGreen,
  Reset 
}                 = colors;

if ( cluster.isMaster ) {
  log(`Master(${FgBlue}${process.pid}${Reset}) setting up ${FgYellow}${cpus.length}${Reset} ${cpus.length > 1 ? 'workers' : 'worker'}`);

  cpus.forEach(() => cluster.fork());

  cluster.on('fork', worker => log(`Forking worker(${FgCyan}${worker.process.pid}${Reset}) ${FgYellow}#${worker.id}${Reset}`));
  cluster.on('online', worker => log(`Worker(${FgCyan}${worker.process.pid}${Reset}) ${FgYellow}#${worker.id}${Reset} is online`));

  cluster.on('exit', ( worker, code, signal ) => {
    log(`Worker(${FgCyan}${worker.process.pid}${Reset}) ${FgYellow}#${worker.id}${Reset} exited (${signal || code})`);

    if ( !worker.exitedAfterDisconnect ) {
      cluster.fork();
    }
  });

  cluster.on('message', ( worker, message ) => {
    if ( message.cmd === 'notifyRequest' ) requestCount++;

    log(`${FgBlue}from worker(${Reset}${worker.process.pid}${FgBlue}) ${FgYellow}#${worker.id}${FgBlue} to master(${Reset}${process.pid}${FgBlue}): ${message.cmd}`);
    cluster.workers[worker.id].send({ cmd : 'notifyReceived', requestCount });
  });
}
else {
  process.on('message', message => {
    log(`${FgCyan}from master to worker(${Reset}${process.pid}${FgCyan}): ${message.cmd} ${FgGreen}#${message.requestCount}`);
  });
  require('./server');
}