const { Transform } = require('stream');

class TextTransform extends Transform {
  constructor(options = {}) {
    super(options);
    this.mode = options.mode || 'uppercase'; // 'uppercase' hoặc 'replace'
  }

  _transform(chunk, encoding, callback) {
    let text = chunk.toString();

    if (this.mode === 'uppercase') {
      text = text.toUpperCase();
    } else if (this.mode === 'replace') {
      // Thay thế các ký tự đặc biệt và thêm prefix
      text = text.replace(/nodejs/gi, '🚀 NodeJS');
      text = text.replace(/stream/gi, '🌊 Stream');
      text = text.replace(/blog/gi, '📝 Blog');
    }

    this.push(text);
    callback();
  }
}

module.exports = TextTransform;