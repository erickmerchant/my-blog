var _ = require('lodash');

module.exports = function () {

    return function (pages, next) {

        _.each(pages, function (val, key) {

            if (key - 1 > -1) {

                pages[key].page.previous = pages[key - 1].page;
            }

            if (key + 1 < pages.length) {

                pages[key].page.next = pages[key + 1].page;
            }
        });

        next(pages);
    };
};
