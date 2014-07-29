/*!
 * site.js
*/
(function(){

    "use strict";

    function update(){

        Prism.highlightAll();

        Geomicons.render();
    };

    $(document).on('page:load', update);

    update();

})();
