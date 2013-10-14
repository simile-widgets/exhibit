/*==================================================
 *  Exhibit.HtmlTableImporter
 *==================================================
 */

Exhibit.Importer.HtmlTable = {
    _importer: null
};

Exhibit.ProxyGetter = function(link, database, parser, cont) {
    var url = typeof link == "string" ? link : link.href;
    if (typeof link != "string") {
        var xpath = link.getAttribute('ex:xpath'); 
    }
    var babelURL = "http://service.simile-widgets.org/babel/html-extractor?" +
    "url=" + encodeURIComponent(url);
    if (xpath) babelURL += "xpath=" + xpath;
    var fConvert = function(string) {
        //babel returns desired elements inside BODY tags
        var div = document.createElement("div");
        div.innerHTML = string;
        var e = div.firstChild;

        var string=string.slice(string.search(/<BODY>/)+6, string.search(/<\/BODY>/));
        return parser(string, link);
    }
    return Exhibit.JSONPImporter.load(babelURL, database, cont, fConvert);
};

Exhibit.Importer.HtmlTable.parse = function(url, table, callback, link) {
    var $=Exhibit.jQuery //since we'll use it a lot

    , jq=$(table)

    , readAttributes = function( node, attributes ) {
        var result = {}, attr, value, i;
        for( i = 0; attr = attributes[i]; i++ ) {
            value = Exhibit.getAttribute( node, attr );
            if( value ) {
                result[attr] = value;
            }
        }
        return result;
    }

    // FIXME: it's probably a better idea to ask database.js for these lists:
    , typeSpecs = [ "uri", "label", "pluralLabel" ]
    , propertySpecs = [ "uri", "label", "reverseLabel",
                        "pluralLabel", "reversePluralLabel",
                        "groupingLabel", "reverseGroupingLabel",
                        "valueType"]
    , columnSpecs = ["arity", "hrefProperty", "srcProperty" ]
    , separator = Exhibit.getAttribute(link, "separator") || ';'
    , types={}
    , properties={}
    , type = Exhibit.getAttribute(link,'itemType')

    /*heuristic for identifying property names
      The first one to succeed wins.

      First look for ex:columns identifier in link
      Then look for <col> tags with ex:property attributes
      Then look in first <tr> for either <th> or <td> tags
      First check ex:property attribute to get property name
      If none, use text content of each tr/th

      If after all this a particular col has no property, don't parse it

    */
    , columnSettings=[] //rules for parsing each col
    , columns = Exhibit.getAttribute(link, "columns")
    , headerRow = Exhibit.getAttribute(link,"headerRow")
    , hasProps = function() {
        return Exhibit.getAttribute(this,"property");
    }
    , i;

    if (type) {
        types[type] =  readAttributes( link, typeSpecs );
    }
    
    if (columns) {
        propertyNames = columns.split(',');
    } else {
        if (jq.find("col").filter(hasProps).length > 0) {
            columns = jq.find("col");
        }
        else {
            //assume top row is property names
            headerRow=true;
            columns = jq.find("tr").eq(0).children().filter("td,th");
        }
        propertyNames = columns.map(function(i) {
                var property = Exhibit.getAttribute(this, "property") ||
                $(this).text(); // never null/undefined but maybe ""
                var propSettings=readAttributes(this, propertySpecs);
                if (property) {
                    properties[property]=propSettings;
                }
                columnSettings[i]=readAttributes(this,columnSpecs);
                return property;
            }).get();
    }

    //now parse the rows
    var rows=jq.find("tr");
    if (headerRow) {
        rows=rows.slice(1);
    }
    rows=rows.filter(":has(td)");
    var parseRow = function() {
        var item={};
        var fields=$("td",this);
        fields.each(function(i) {
                var prop=propertyNames[i]
                    , val;
                if (prop) {//parse this property
                    var attrs=columnSettings[i] || {};
                    if (attrs.hrefProperty || attrs.srcProperty) {
                        //user is extracting links
                        //so can template own html with links from data
                        //so clean up the contents to just text
                        val=$(this).text();
                    } 
                    else {
                        //keep inner html if not separately parsing links
                        val=$(this).html();
                    }
                    val = val.trim();
                    if (val.length > 0) {
                        if (attrs.arity != "single") {
                            val=val.split(separator);
                            for (i=0; i < val.length; i++) {
                                val[i] = val[i].trim();
                            }
                        }
                        item[prop] = val;
                    }
                    if (attrs.hrefProperty) {
                        val = $("[href]",this).attr("href");
                        if (val) {
                            item[attrs.hrefProperty] = val;
                        }
                    }
                    if (attrs.srcProperty) {
                        val = $("[src]",this).attr("src");
                        if (val) {
                            item[attrs.srcProperty]= val;
                        }
                    }
                    //only set type of got some nonempty field above
                    if (type) {
                        item.type=type;
                    }
                }
            });
        return item;
    }
    var items=rows.map(parseRow).get();
                    
    callback( {types:types, properties: properties, items:items}) ;
};


Exhibit.Importer.HtmlTable._register = function() {
    Exhibit.Importer.HtmlTable._importer = new Exhibit.Importer(
                                                                "text/html",
                                                                "get",
                                                                Exhibit.Importer.HtmlTable.parse
                                                                );
};

Exhibit.jQuery(document).one("registerImporters.exhibit",
                             Exhibit.Importer.HtmlTable._register);
