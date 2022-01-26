const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const inlineCss = require('inline-css');

const getFile = (filePath) =>
  new Vinyl({
    path: path.resolve(filePath),
    cwd: './template/',
    base: path.dirname(filePath),
    contents: Buffer.from(String(fs.readFileSync(filePath))),
  });

exports.getHTML = (htmlFile, options = {}) => {
  const file = getFile(htmlFile);
  // eslint-disable-next-line no-param-reassign
  options.url = `file://${file.path}`;
  return inlineCss(file.contents.toString('utf8'), options);
};

exports.replaceDoubleBraces = (str, result) =>
  str.replace(/{{(.+?)}}/g, (_, g1) => result[g1] || g1);
