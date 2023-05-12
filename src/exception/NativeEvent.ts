import Log from '../middlewares/Log';
// TODO
class NativeEvent {
  public cluster(_cluster): void {
    // Define event listeners
    const listeners = [
      { event: 'listening', message: 'Connected' },
      { event: 'online', message: 'has responded after it was forked' },
      { event: 'disconnect', message: 'Disconnected' },
      { event: 'exit', message: 'is Dead with Code' }
    ];

    // Add event listeners to _cluster
    listeners.forEach(({ event, message }) =>
      _cluster.on(event, worker => Log.info(`Server :: Cluster with ProcessID '${worker.process.pid}' ${message}!`))
    );

    // Ensuring a new cluster will start if an old one dies
    _cluster.on('exit', (worker, code, signal) => _cluster.fork());
  }

  public process(): void {
    // Define process's event listeners
    const listeners = [
      { event: 'uncaughtException', logLevel: 'error' },
      { event: 'warning', logLevel: 'warn' }
    ];

    // Add listeners to process
    listeners.forEach(({ event, logLevel }) =>
      process.on(event, err => Log[logLevel](err.stack))
    );
  }
}

export default new NativeEvent;