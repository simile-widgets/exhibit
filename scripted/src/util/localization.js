/**
 * @fileOverview Localization handlers
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {String} locale
 * @param {String} url
 */
Exhibit.Locale = function(locale, url) {
    this._locale = locale;
    this._url = url;
};

/**
 * @returns {String}
 */
Exhibit.Locale.prototype.getURL = function() {
    return this._url;
};

/**
 * @namespace
 */
Exhibit.Localization = {
    _registryKey: "l10n",
    _lastResortLocale: "en",
    _currentLocale: undefined
};

/**
 * @static
 */
Exhibit.Localization._registerComponent = function() {
    var i, locale, clientLocales, segments;
    clientLocales = (navigator.hasOwnProperty("language") ?
                     navigator.language :
                     navigator.browserLanguage).split(";");
    for (i = 0; i < clientLocales.length; i++) {
        locale = clientLocales[i];
        if (locale !== Exhibit.Localization._lastResortLocale) {
            segments = locale.split("-");
            if (segments.length > 1 &&
                segments[0] !== Exhibit.Localization._lastResortLocale) {
                Exhibit.locales.push(segments[0]);
            }
            Exhibit.locales.push(locale);
        }
    }

    if (!Exhibit.Registry.hasRegistry(Exhibit.Localization._registryKey)) {
        Exhibit.Registry.createRegistry(Exhibit.Localization._registryKey);
        $(document).trigger('registerLocales.exhibit');
    }
};

/**
 * @static
 * @param {String} locale
 * @returns {Boolean}
 */
Exhibit.Localization.registerLocale = function(locale, l10n) {
    if (!Exhibit.Registry.isRegistered(Exhibit.Localization._registryKey,
                                       locale)) {
        Exhibit.Registry.register(Exhibit.Localization._registryKey,
                                  locale,
                                  l10n);
        return true;
    } else {
        return false;
    }
};

/**
 * @param {String} locale
 * @returns {Boolean}
 */
Exhibit.Localization.hasLocale = function(locale) {
    return Exhibit.Registry.isRegistered(Exhibit.Localization._registryKey,
                                         locale);
};

/**
 * @param {String} locale
 * @returns {Exhibit.Locale}
 */
Exhibit.Localization.getLocale = function(locale) {
    return Exhibit.Registry.get(Exhibit.Localization._registryKey, locale);
};

/**
 * @param {Array} locales
 */
Exhibit.Localization.setLocale = function(locales) {
    var i, locale, isSet = false;

    if (locales.length > 0 &&
        typeof Exhibit.Localization._currentLocale !== "undefined" &&
        locales[0] === Exhibit.Localization._currentLocale) {
        return;
    }

    for (i = 0; i < locales.length; i++) {
        locale = locales[i];
        if (Exhibit.Localization.hasLocale(locale)) {
            Exhibit.Localization._currentLocale = locale;
            $(document).trigger('localeSet.exhibit', [Exhibit.Registry.get(Exhibit.Localization._registryKey, locale).getURL()]);
            isSet = true;
            break;
        }
    }

    if (!isSet && Exhibit.Localization._currentLocale !== Exhibit.Localization._lastResortLocale) {
        Exhibit.Localization._currentLocale = Exhibit.Localization._lastResortLocale;
        $(document).trigger('localeSet.exhibit', [Exhibit.Registry.get(Exhibit.Localization._registryKey, locale).getURL()]);
    }
};

$(document).one('registerComponents.exhibit',
                Exhibit.Localization._registerComponent);

$(document).bind('localeRegistered.exhibit', function() {
    Exhibit.Localization.setLocale(Exhibit.locales);
});
