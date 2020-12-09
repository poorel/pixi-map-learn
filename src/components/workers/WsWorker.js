import WebWorker from './WebWorker';

export default class WsWorker extends WebWorker {

  inited = false;

  constructor(url, fn) {
    super();

    this.ws = this.createWorker(url => {
        let lastWorkerMsg = null;
        let wsStatus = 0; // 0 idle, 1 creating, 2 open, 3 closed
        let timestamp = 0;

        const createSocket = url => {
            if (wsStatus !== 0 && wsStatus !== 3) return;
            
            wsStatus = 1;

            let socket = new WebSocket(url);

            socket.onopen = e => {
                console.log('>>>>>> socket open');
                wsStatus = 2;
                timestamp = Date.now();
                // postMessage({ msg: 'SocketConnected' });

                if (lastWorkerMsg) {
                    postMessage(lastWorkerMsg);
                }
            }

            socket.onmessage = e => {
                postMessage({
                    delta: Date.now() - timestamp,
                    data: JSON.parse(e.data)
                });
                timestamp = Date.now();
            }
            socket.onclose = e => {
                wsStatus = 3;
                console.log('>>>>>> socket closed');
                destorySocket(ws);
                ws = createSocket(url);
            }

            return socket;
        }

        const destorySocket = ws => {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onclose = null;
        }

        let ws = createSocket(url);

        onmessage = e => {
            lastWorkerMsg = e;
        }
    }, url);


    this.ws.onmessage = e => fn(e.data);
  }
}