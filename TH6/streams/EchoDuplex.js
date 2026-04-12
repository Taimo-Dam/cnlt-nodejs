const { Duplex } = require('stream');

class EchoDuplex extends Duplex {
  constructor(options = {}) {
    super(options);
    this.buffer = [];
  }

  // _read: phần Readable - đẩy dữ liệu ra
  _read(size) {
    if (this.buffer.length > 0) {
      const data = this.buffer.shift();
      this.push(`[ECHO] ${data}`);
    } else {
      this.push(null); // kết thúc stream
    }
  }

  // _write: phần Writable - nhận dữ liệu vào
  _write(chunk, encoding, callback) {
    const text = chunk.toString().trim();
    console.log(`[EchoDuplex] Nhận: ${text}`);
    this.buffer.push(text);
    callback();
  }
}

module.exports = EchoDuplex;