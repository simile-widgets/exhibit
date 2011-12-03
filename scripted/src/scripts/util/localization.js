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
    Exhibit.Localization.registerLocale(this._locale, this);
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
    _registry: null,
    _lastResortLocale: "en",
    _currentLocale: undefined
};

/**
 * @static
 */
Exhibit.Localization._registerComponent = function(evt, reg) {
    var i, locale, clientLocales, segments;
    Exhibit.Localization._registry = reg;
    Exhibit.locales.push(Exhibit.Localization._lastResortLocale);

    clientLocales = (typeof navigator.language === "string" ?
                     navigator.language :
                     (typeof navigator.browserLanguage === "string" ?
                      navigator.browserLanguage :
                      Exhibit.Localization._lastResortLocale)).split(";");

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

    if (typeof Exhibit.params.locale === "string") {
        if (Exhibit.params.locale !== Exhibit.Localization._lastResortLocale) {
            segments = Exhibit.params.locale.split("-");
            if (segments.length > 1 &&
                segments[0] !== Exhibit.Localization._lastResortLocale) {
                Exhibit.locales.push(segments[0]);
            }
            Exhibit.locales.push(Exhibit.params.locale);
        }
    }

    if (!reg.hasRegistry(Exhibit.Localization._registryKey)) {
        reg.createRegistry(Exhibit.Localization._registryKey);
        $(document).trigger("registerLocales.exhibit");
    }
};

/**
 * @static
 * @param {String} locale
 * @returns {Boolean}
 */
Exhibit.Localization.registerLocale = function(locale, l10n) {
    if (!Exhibit.Localization._registry.isRegistered(
        Exhibit.Localization._registryKey,
        locale
    )) {
        Exhibit.Localization._registry.register(
            Exhibit.Localization._registryKey,
            locale,
            l10n
        );
        $(document).trigger("localeRegistered.exhibit");
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
    return Exhibit.Localization._registry.isRegistered(
        Exhibit.Localization._registryKey,
        locale
    );
};

/**
 * @param {String} locale
 * @returns {Exhibit.Locale}
 */
Exhibit.Localization.getLocale = function(locale) {
    return Exhibit.Localization._registry.get(
        Exhibit.Localization._registryKey,
        locale
    );
};

/**
 * @param {Array} locales
 */
Exhibit.Localization.setLocale = function(locales) {
    var i, locale;

    for (i = locales.length - 1; i >= 0; i--) {
        locale = locales[i];
        if (Exhibit.Localization.hasLocale(locale)) {
            Exhibit.Localization._currentLocale = locale;
            $(document).trigger(
                "localeSet.exhibit",
                [Exhibit.Localization.getLocale(locale).getURL()]
            );
            break;
        }
    }
};

$(document).one(
    "registerLocalization.exhibit",
    Exhibit.Localization._registerComponent
);

$(document).bind(
    "localesRegistered.exhibit",
    function() {
        Exhibit.Localization.setLocale(Exhibit.locales);
    }
);
