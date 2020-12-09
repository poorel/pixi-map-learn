export default class WebWorker {
  ws;

  constructor(url, fn) {
  }

  createWorker(f, arg) {
    let blob = new Blob([`(${f.toString()})('${arg}')`]);
    let url = window.URL.createObjectURL(blob);
    let worker = new Worker(url);
    return worker;
  }

  destroy() {
    this.ws.terminate();
    this.ws = null;
  }
}