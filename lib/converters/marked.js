var marked = require('marked');

module.exports = function(settings) {

    return function(content, cb) {

        if(settings) {

            marked.setOptions(settings);
        }

        return cb(null, marked(content));
    }
};
