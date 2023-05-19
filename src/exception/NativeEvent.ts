import { Cluster } from 'cluster';
import Log from '../middlewares/Log';
// TODO
class NativeEvent {
  public cluster(_cluster: Cluster): void {
    // Define event listeners
    const listeners = [
      { event: 'listening', message: 'Connected' },
      { event: 'online', message: 'has responded after it was forked' },
      { event: 'disconnect', message: 'Disconnected' },
      { event: 'exit', message: 'is Dead with Code' }
    ];

    // Add event listeners to _cluster
    listeners.forEach(({ event, message }) =>
      _cluster.on(event, (worker: any) => Log.info(`Server :: Cluster with ProcessID '${worker.process.pid}' ${message}!`))
    );

    // Ensuring a new cluster will start if an old one dies
    _cluster.on('exit', (worker: any, code: any, signal: any) => _cluster.fork())
  }

  public process(): void {
    // Define process's event listeners
    const listeners = [
      { event: 'uncaughtException', logLevel: 'error' },
      { event: 'warning', logLevel: 'warn' }
    ];

    // Add listeners to process
    listeners.forEach(({ event, logLevel }) =>
      process.on(event, err => Log.error(err.stack))
    );
  }
}

export default new NativeEvent;