$(document).bind("registerLocales.exhibit", function() {
    $(document).trigger("beforeLocalesRegistered.exhibit");
    new Exhibit.Locale("default", Exhibit.urlPrefix + "locales/en/locale.js");
    new Exhibit.Locale("en", Exhibit.urlPrefix + "locales/en/locale.js");
    new Exhibit.Locale("de", Exhibit.urlPrefix + "locales/de/locale.js");
    new Exhibit.Locale("es", Exhibit.urlPrefix + "locales/es/locale.js");
    new Exhibit.Locale("fr", Exhibit.urlPrefix + "locales/fr/locale.js");
    new Exhibit.Locale("nl", Exhibit.urlPrefix + "locales/nl/locale.js");
    new Exhibit.Locale("no", Exhibit.urlPrefix + "locales/no/locale.js");
    new Exhibit.Locale("sv", Exhibit.urlPrefix + "locales/sv/locale.js");
    new Exhibit.Locale("pt-BR", Exhibit.urlPrefix + "locales/pt-BR/locale.js");
    $(document).trigger("localesRegistered.exhibit");
});
