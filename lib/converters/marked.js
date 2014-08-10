var marked = require('marked');

module.exports = function (settings) {

    if (settings) {

        marked.setOptions(settings);
    }

    return function (content, cb) {

        return cb(null, marked(content));
    }
};
