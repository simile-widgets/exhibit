/**
 * @fileOverview French localization for Exhibit.
 * @author Christophe Le Bot
 */

(function() {
    var javascriptFiles, urlPrefix, i;

    javascriptFiles = [
        "exhibit-l10n.js",
        "data/database-l10n.js",
        "ui/ui-context-l10n.js",
        "ui/lens-l10n.js",
        "ui/formatter-l10n.js",
        "ui/widgets/collection-summary-widget-l10n.js",
        "ui/views/view-panel-l10n.js",
        "ui/views/ordered-view-frame-l10n.js",
        "ui/views/tile-view-l10n.js",
        "ui/views/thumbnail-view-l10n.js",
        "ui/views/tabular-view-l10n.js",
        "util/coders-l10n.js",
        "util/facets-l10n.js",
        "util/views-l10n.js"
    ];

    urlPrefix = Exhibit.urlPrefix + "locales/fr/";
    if (Exhibit.params.bundle) {
        $LAB.script(urlPrefix + "exhibit-fr-bundle.js");
    } else {
        for (i = 0; i < javascriptFiles.length; i++) {
            $LAB.queueScript(urlPrefix + "scripts/" + javascriptFiles[i]);
        }
    } 
    $LAB.queueWait(function() {
        $(document).trigger("localeLoaded.exhibit");
    });
    $LAB.runQueue();
}());
