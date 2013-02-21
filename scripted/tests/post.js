/**
 * After defining all tests, run only those defined by
 * Modules.args, or if none, run all.
 */

jQuery(document).ready(function() {
    jQuery(document).one("scriptsLoaded.exhibit", function(evt) {
        if (Modules.args.length === 0) {
            for (var mod in Modules.tests) {
                Modules.loadScript(Modules.tests[mod]);
            }
        } else {
            for (var i = 0; i < Modules.args.length; i++) {
                Modules.loadScript(Modules.tests[Modules.args[i]]);
            }
        }
    });
});
