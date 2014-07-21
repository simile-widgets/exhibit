/******************************************************************************
 *  Timegrid Date English localization
 *****************************************************************************/

if (!("l10n" in Date)) {
    Date.l10n = {};
}
 
/** Full month names. Change this for local month names */
Date.l10n.monthNames =[ 'January','February','March','April','May','June','July','August','September','October','November','December'];

/** Month abbreviations. Change this for local month names */
Date.l10n.monthAbbreviations = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Full day names. Change this for local month names */
Date.l10n.dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/** Day abbreviations. Change this for local month names */
Date.l10n.dayAbbreviations = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/**
 * Used for parsing ambiguous dates like 1/2/2000 - default to preferring
 * 'American' format meaning Jan 2. Set to false to prefer 'European' format 
 * meaning Feb 1.
 */
Date.l10n.preferAmericanFormat = true;

/** Used to specify which day the week starts on, 0 meaning Sunday, etc. */
Date.l10n.firstDayOfWeek = 0;
