const EventEmitter = require('events');

class AppEmitter extends EventEmitter {
  constructor() {
    super();
    this.eventLog = [];
    this.visitCount = 0;

    // on() - lắng nghe event 'pageVisit' nhiều lần
    this.on('pageVisit', (data) => {
      this.visitCount++;
      const log = `[${new Date().toISOString()}] pageVisit: ${data.page} - IP: ${data.ip} (Lần ${this.visitCount})`;
      this.eventLog.push(log);
      console.log(log);
    });

    // on() - lắng nghe event 'postCreated'
    this.on('postCreated', (data) => {
      const log = `[${new Date().toISOString()}] postCreated: "${data.title}" bởi ${data.author}`;
      this.eventLog.push(log);
      console.log(log);
    });

    // once() - chỉ chạy 1 lần khi server khởi động
    this.once('serverStart', (data) => {
      const log = `[${new Date().toISOString()}] SERVER STARTED tại port ${data.port}`;
      this.eventLog.push(log);
      console.log(log);
    });
  }

  getLog() {
    return this.eventLog;
  }

  getVisitCount() {
    return this.visitCount;
  }
}

module.exports = new AppEmitter();