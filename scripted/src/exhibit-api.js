/**
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview Exhibit definition and bootstrapping.
 */

/**
 * @namespace The base namespace for Exhibit.
 */
var Exhibit = {
    /**
     * The version number for Exhibit.
     * @constant
     */
    version: "3.0.0",

    /**
     * The XML namespace for Exhibit.
     * @constant
     */
    namespace: "http://simile.mit.edu/2006/11/exhibit#",

    /***
     * Viable user-agent reported locales.
     */
    locales: [],

    /**
     * Whether Exhibit has been loaded yet.
     */
    loaded: false,

    /**
     * Indicates for listeners whether the event they're listening
     * for has fired already or not.  Not all events are currently
     * recorded here.  This is predominantly for the benefit of
     * extensions.
     */
    signals: {
        "loadExtensions.exhibit": false,
        "exhibitConfigured.exhibit": false
    },

    /**
     * Where Exhibit is served from.
     */
    urlPrefix: undefined,

    /**
     * Where to find Babel, if at all.
     */
    babelPrefix: undefined,

    /**
     * Where to submit JSON for validation.  Uses jsonlint.com by
     * default, will use Babel instead of babelPrefix is given.
     */
    validateJSON: "http://jsonlint.com/?json=",

    /**
     * Where to find out more about Exhibit.
     */
    exhibitLink: "http://www.simile-widgets.org/exhibit/",

    /**
     * Settable parameters within the query string of loading this file.
     */
    params: {
        "bundle": true,
        "autoCreate": true,
        "safe": false,
        "babel": undefined,
        "backstage": undefined,
        "locale": undefined,
        "persist": true
    },

    /**
     * @namespace Prepare for official Exhibit extensions.
     */
    Extension: {},

    _dependencies: {
        "lib/jquery-1.7.2.min.js": "jQuery",
        "lib/json2.js": "JSON",
        "lib/base64.js": "Base64",
        "lib/sprintf.js": "sprintf",
        // History fails to load correctly in Safari through this mechanism
        "lib/jquery.history.js": undefined, // "History.init",
        "lib/jquery.history.shim.js": undefined, //always load?
        // SIMILE jQuery plugins fail to load under nonconflicting
        // circumstances because jQuery hasn't been made available yet
        "lib/jquery.simile.dom.js": undefined, // "jQuery.simileDOM",
        "lib/jquery.simile.bubble.js": undefined // "jQuery.simileBubble"
    },

    /**
     * One instance of LABjs to coordinate all loading in series
     */
    loader: null,

    /**
     * How Exhibit refers to jQuery
     */
    jQuery: undefined,

    /**
     * Whether jQuery exists in the global context already
     */
    _jQueryExists: typeof jQuery !== "undefined",

    /**
     * Scripts Exhibit will load.
     */
    scripts: [
        "scripts/exhibit.js",
        "scripts/bc/bc.js",
        "scripts/bc/attributes.js",
        "scripts/registry.js",
        "scripts/util/util.js",
        "scripts/util/debug.js",
        "scripts/util/html.js",
        "scripts/util/set.js",
        "scripts/util/date-time.js",
        "scripts/util/units.js",
        "scripts/util/persistence.js",
        "scripts/util/history.js",
        "scripts/util/bookmark.js",
        "scripts/util/localization.js",
        "scripts/util/settings.js",
        "scripts/util/coders.js",
        "scripts/util/facets.js",
        "scripts/util/views.js",
        "scripts/data/database.js",
        "scripts/data/database/local.js",
        "scripts/data/database/type.js",
        "scripts/data/database/property.js",
        "scripts/data/database/range-index.js",
        "scripts/data/collection.js",
        "scripts/data/expression.js",
        "scripts/data/expression/collection.js",
        "scripts/data/expression/path.js",
        "scripts/data/expression/constant.js",
        "scripts/data/expression/operator.js",
        "scripts/data/expression/function-call.js",
        "scripts/data/expression/control-call.js",
        "scripts/data/expression/functions.js",
        "scripts/data/expression/controls.js",
        "scripts/data/expression-parser.js",
        "scripts/data/exporter.js",
        "scripts/data/exporters/json.js",
        "scripts/data/exporters/bibtex.js",
        "scripts/data/exporters/tsv.js",
        "scripts/data/exporters/rdf-xml.js",
        "scripts/data/exporters/semantic-wikitext.js",
        "scripts/data/importer.js",
        "scripts/data/importers/json.js",
        "scripts/data/importers/jsonp.js",
        "scripts/data/importers/google-spreadsheet.js",
        "scripts/data/importers/babel-based.js",
        "scripts/ui/ui.js",
        "scripts/ui/ui-context.js",
        "scripts/ui/lens-registry.js",
        "scripts/ui/lens.js",
        "scripts/ui/coordinator.js",
        "scripts/ui/formatter.js",
        "scripts/ui/format-parser.js",
        "scripts/ui/facets/facet.js",
        "scripts/ui/facets/list-facet.js",
        "scripts/ui/facets/numeric-range-facet.js",
        "scripts/ui/facets/alpha-range-facet.js",
        "scripts/ui/facets/cloud-facet.js",
        "scripts/ui/facets/text-search-facet.js",
        "scripts/ui/facets/hierarchical-facet.js",
        "scripts/ui/views/view.js",
        "scripts/ui/views/view-panel.js",
        "scripts/ui/views/ordered-view-frame.js",
        "scripts/ui/views/tile-view.js",
        "scripts/ui/views/tabular-view.js",
        "scripts/ui/views/thumbnail-view.js",
        "scripts/ui/coders/coder.js",
        "scripts/ui/coders/color-coder.js",
        "scripts/ui/coders/default-color-coder.js",
        "scripts/ui/coders/ordered-color-coder.js",
        "scripts/ui/coders/color-gradient-coder.js",
        "scripts/ui/coders/icon-coder.js",
        "scripts/ui/coders/size-coder.js",
        "scripts/ui/coders/size-gradient-coder.js",
        "scripts/ui/control-panel.js",
        "scripts/ui/widgets/collection-summary-widget.js",
        "scripts/ui/widgets/option-widget.js",
        "scripts/ui/widgets/resizable-div-widget.js",
        "scripts/ui/widgets/toolbox-widget.js",
        "scripts/ui/widgets/bookmark-widget.js",
        "scripts/ui/widgets/reset-history-widget.js",
        "scripts/ui/widgets/logo.js",
        "scripts/ui/widgets/legend-widget.js",
        "scripts/ui/widgets/legend-gradient-widget.js",
        "locales/manifest.js",
        "scripts/final.js"
    ],

    "styles": [
        "styles/graphics.css",
        "styles/exhibit.css",
        "styles/browse-panel.css",
        "styles/lens.css",
        "styles/control-panel.css",
        "styles/util/facets.css",
        "styles/util/views.css",
        "styles/views/view-panel.css",
        "styles/views/tile-view.css",
        "styles/views/tabular-view.css",
        "styles/views/thumbnail-view.css",
        "styles/widgets/collection-summary-widget.css",
        "styles/widgets/resizable-div-widget.css",
        "styles/widgets/bookmark-widget.css",
        "styles/widgets/toolbox-widget.css",
        "styles/widgets/legend-widget.css",
        "styles/widgets/option-widget.css",
        "styles/widgets/reset-history-widget.css"
    ],

    /**
     * @constant An Exhibit.Registry of static components.
     */
    registry: null
};

/*! LAB.js (LABjs :: Loading And Blocking JavaScript)
    v2.0.3 (c) Kyle Simpson
    MIT License
*/
if (typeof $LAB === "undefined") {
(function(o){var K=o.$LAB,y="UseLocalXHR",z="AlwaysPreserveOrder",u="AllowDuplicates",A="CacheBust",B="BasePath",C=/^[^?#]*\//.exec(location.href)[0],D=/^\w+\:\/\/\/?[^\/]+/.exec(C)[0],i=document.head||document.getElementsByTagName("head"),L=(o.opera&&Object.prototype.toString.call(o.opera)=="[object Opera]")||("MozAppearance"in document.documentElement.style),q=document.createElement("script"),E=typeof q.preload=="boolean",r=E||(q.readyState&&q.readyState=="uninitialized"),F=!r&&q.async===true,M=!r&&!F&&!L;function G(a){return Object.prototype.toString.call(a)=="[object Function]"}function H(a){return Object.prototype.toString.call(a)=="[object Array]"}function N(a,c){var b=/^\w+\:\/\//;if(/^\/\/\/?/.test(a)){a=location.protocol+a}else if(!b.test(a)&&a.charAt(0)!="/"){a=(c||"")+a}return b.test(a)?a:((a.charAt(0)=="/"?D:C)+a)}function s(a,c){for(var b in a){if(a.hasOwnProperty(b)){c[b]=a[b]}}return c}function O(a){var c=false;for(var b=0;b<a.scripts.length;b++){if(a.scripts[b].ready&&a.scripts[b].exec_trigger){c=true;a.scripts[b].exec_trigger();a.scripts[b].exec_trigger=null}}return c}function t(a,c,b,d){a.onload=a.onreadystatechange=function(){if((a.readyState&&a.readyState!="complete"&&a.readyState!="loaded")||c[b])return;a.onload=a.onreadystatechange=null;d()}}function I(a){a.ready=a.finished=true;for(var c=0;c<a.finished_listeners.length;c++){a.finished_listeners[c]()}a.ready_listeners=[];a.finished_listeners=[]}function P(d,f,e,g,h){setTimeout(function(){var a,c=f.real_src,b;if("item"in i){if(!i[0]){setTimeout(arguments.callee,25);return}i=i[0]}a=document.createElement("script");if(f.type)a.type=f.type;if(f.charset)a.charset=f.charset;if(h){if(r){e.elem=a;if(E){a.preload=true;a.onpreload=g}else{a.onreadystatechange=function(){if(a.readyState=="loaded")g()}}a.src=c}else if(h&&c.indexOf(D)==0&&d[y]){b=new XMLHttpRequest();b.onreadystatechange=function(){if(b.readyState==4){b.onreadystatechange=function(){};e.text=b.responseText+"\n//@ sourceURL="+c;g()}};b.open("GET",c);b.send()}else{a.type="text/cache-script";t(a,e,"ready",function(){i.removeChild(a);g()});a.src=c;i.insertBefore(a,i.firstChild)}}else if(F){a.async=false;t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}else{t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}},0)}function J(){var l={},Q=r||M,n=[],p={},m;l[y]=true;l[z]=false;l[u]=false;l[A]=false;l[B]="";function R(a,c,b){var d;function f(){if(d!=null){d=null;I(b)}}if(p[c.src].finished)return;if(!a[u])p[c.src].finished=true;d=b.elem||document.createElement("script");if(c.type)d.type=c.type;if(c.charset)d.charset=c.charset;t(d,b,"finished",f);if(b.elem){b.elem=null}else if(b.text){d.onload=d.onreadystatechange=null;d.text=b.text}else{d.src=c.real_src}i.insertBefore(d,i.firstChild);if(b.text){f()}}function S(c,b,d,f){var e,g,h=function(){b.ready_cb(b,function(){R(c,b,e)})},j=function(){b.finished_cb(b,d)};b.src=N(b.src,c[B]);b.real_src=b.src+(c[A]?((/\?.*$/.test(b.src)?"&_":"?_")+~~(Math.random()*1E9)+"="):"");if(!p[b.src])p[b.src]={items:[],finished:false};g=p[b.src].items;if(c[u]||g.length==0){e=g[g.length]={ready:false,finished:false,ready_listeners:[h],finished_listeners:[j]};P(c,b,e,((f)?function(){e.ready=true;for(var a=0;a<e.ready_listeners.length;a++){e.ready_listeners[a]()}e.ready_listeners=[]}:function(){I(e)}),f)}else{e=g[0];if(e.finished){j()}else{e.finished_listeners.push(j)}}}function v(){var e,g=s(l,{}),h=[],j=0,w=false,k;function T(a,c){a.ready=true;a.exec_trigger=c;x()}function U(a,c){a.ready=a.finished=true;a.exec_trigger=null;for(var b=0;b<c.scripts.length;b++){if(!c.scripts[b].finished)return}c.finished=true;x()}function x(){while(j<h.length){if(G(h[j])){try{h[j++]()}catch(err){}continue}else if(!h[j].finished){if(O(h[j]))continue;break}j++}if(j==h.length){w=false;k=false}}function V(){if(!k||!k.scripts){h.push(k={scripts:[],finished:true})}}e={script:function(){for(var f=0;f<arguments.length;f++){(function(a,c){var b;if(!H(a)){c=[a]}for(var d=0;d<c.length;d++){V();a=c[d];if(G(a))a=a();if(!a)continue;if(H(a)){b=[].slice.call(a);b.unshift(d,1);[].splice.apply(c,b);d--;continue}if(typeof a=="string")a={src:a};a=s(a,{ready:false,ready_cb:T,finished:false,finished_cb:U});k.finished=false;k.scripts.push(a);S(g,a,k,(Q&&w));w=true;if(g[z])e.wait()}})(arguments[f],arguments[f])}return e},wait:function(){if(arguments.length>0){for(var a=0;a<arguments.length;a++){h.push(arguments[a])}k=h[h.length-1]}else k=false;x();return e}};return{script:e.script,wait:e.wait,setOptions:function(a){s(a,g);return e}}}m={setGlobalDefaults:function(a){s(a,l);return m},setOptions:function(){return v().setOptions.apply(null,arguments)},script:function(){return v().script.apply(null,arguments)},wait:function(){return v().wait.apply(null,arguments)},queueScript:function(){n[n.length]={type:"script",args:[].slice.call(arguments)};return m},queueWait:function(){n[n.length]={type:"wait",args:[].slice.call(arguments)};return m},runQueue:function(){var a=m,c=n.length,b=c,d;for(;--b>=0;){d=n.shift();a=a[d.type].apply(null,d.args)}return a},noConflict:function(){o.$LAB=K;return m},sandbox:function(){return J()}};return m}o.$LAB=J();(function(a,c,b){if(document.readyState==null&&document[a]){document.readyState="loading";document[a](c,b=function(){document.removeEventListener(c,b,false);document.readyState="complete"},false)}})("addEventListener","DOMContentLoaded")})(this);
}

/**
 * @static
 * @param {String} url
 * @param {Object} to
 * @param {Object} types
 * @returns {Object}
 */
Exhibit.parseURLParameters = function(url, to, types) {
    var q, param, parsed, params, decode, i, eq, name, old, replacement, type, data;
    to = to || {};
    types = types || {};

    if (typeof url === "undefined") {
        url = document.location.href;
    }

    q = url.indexOf("?");
    if (q < 0) {
        return to;
    }

    url = (url+"#").slice(q+1, url.indexOf("#")); // remove URL fragment
    params = url.split("&");
    parsed = {};
    decode = window.decodeURIComponent || unescape;
    for (i = 0; i < params.length; i++) {
        param = params[i];
        eq = param.indexOf("=");
        name = decode(param.slice(0, eq));
        old = parsed[name];
        replacement = decode(param.slice(eq+1));
 
        if (typeof old === "undefined") {
            old = [];
        } else if (!(old instanceof Array)) {
            old = [old];
        }
        parsed[name] = old.concat(replacement);
    }

    for (i in parsed) {
        if (parsed.hasOwnProperty(i)) {
            type = types[i] || String;
            data = parsed[i];
            if (!(data instanceof Array)) {
                data = [data];
            }
            if (type === Boolean && data[0] === "false") {
                to[i] = false;
            } else {
                to[i] = type.apply(this, data);
            }
        }
    }

    return to;
};

/**
 * Locate the script tag that called for a component and return its src.
 *
 * @param {Document} doc
 * @param {String} frag
 * @returns {String}
 */
Exhibit.findScript = function(doc, frag) {
    var script, scripts, i, url;
    scripts = doc.getElementsByTagName("script");
    for (i = 0; i < scripts.length; i++) {
        script = scripts[i];
        url = script.getAttribute("src");
        if (url !== null) {
            if (url.indexOf(frag) >= 0) {
                return url;
            }
        }
    }
    return null;
};

/**
 * Append into urls each string in suffixes after prefixing it with urlPrefix.
 * @static
 * @param {Array} urls
 * @param {String} urlPrefix
 * @param {Array} suffixes
 */
Exhibit.prefixURLs = function(urls, urlPrefix, suffixes) {
    var i;
    for (i = 0; i < suffixes.length; i++) {
        urls.push(urlPrefix + suffixes[i]);
    }
};

/**
 * @static
 * @param {Document} doc
 * @param {String} url
 */
Exhibit.includeCssFile = function(doc, url) {
    var link;
    if (doc.body === null) {
        try {
            doc.write('<link rel="stylesheet" href="' + url + '" type="text/css"/>');
            return;
        } catch (e) {
                // fall through
        }
    }
        
    link = doc.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", url);
    doc.getElementsByTagName("head")[0].appendChild(link);
};

/**
 * @static
 * @param {Document} doc
 * @param {String} urlPrefix Path prefix to add to the list of filenames; use
 *     null or an empty string if no prefix is needed.
 * @param {Array} filenames
 */
Exhibit.includeCssFiles = function(doc, urlPrefix, filenames) {
    var i;
    for (i = 0; i < filenames.length; i++) {
        if (urlPrefix !== null && urlPrefix !== "") {
            Exhibit.includeCssFile(doc, urlPrefix + filenames[i]);
        } else {
            Exhibit.includeCssFile(doc, filenames[i]);
        }
    }
};

/**
 * @static
 * @param {String} urlPrefix Path prefix to add to the list of filenames; use
 *     null or an empty string if no prefix is needed.
 * @param {Array} filenames
 * @param {Boolean} [serial]
 */
Exhibit.includeJavascriptFiles = function(urlPrefix, filenames, serial) {
    var i;
    for (i = 0; i < filenames.length; i++) {
        Exhibit.includeJavascriptFile(urlPrefix, filenames[i], serial);
    }
};

/**
 * @static
 * @param {String} urlPrefix Path prefix to add to the list of filenames; use
 *     null or an empty string if no prefix is needed.
 * @param {String} filename The remainder of the script URL following the
 *     urlPrefix; a script to add to Exhibit's ordered loading.
 * @param {Boolean} [serial] Whether to wait for a script to load before
 *      loading the next in line.  True by default.
 */
Exhibit.includeJavascriptFile = function(urlPrefix, filename, serial) {
    if (typeof serial === "undefined" || serial === null) {
        serial = true;
    }

    if (urlPrefix !== null && urlPrefix !== "") {
        filename = urlPrefix + filename;
    }

    if (serial) {
        Exhibit.loader = Exhibit.loader.script(filename).wait();
    } else {
        Exhibit.loader = Exhibit.loader.script(filename);
    }
};

/**
 * @static
 * @param {Function} fn A Javascript function to insert into Exhibit's
 *     ordered file loading process.
 */
Exhibit.wait = function(fn) {
    Exhibit.loader = Exhibit.loader.wait(fn);
};

/**
 * @static
 * @returns {String}
 */
Exhibit.generateDelayID = function() {
    return "delay" + Math.round(Math.random()*100000);
};

/**
 * Load all scripts associated with Exhibit.
 * 
 * @static
 */
Exhibit.load = function() {
    var i, j, k, o, dep, url, paramTypes, scr, docHead, style, linkElmts, link;

    paramTypes = {
        "bundle": Boolean,
        "js": Array,
        "postLoad": Boolean,
        "css": Array,
        "autoCreate": Boolean,
        "safe": Boolean,
        "babel": String,
        "backstage": String,
        "locale": String,
        "persist": Boolean
    };

    if (typeof Exhibit_urlPrefix === "string") {
        Exhibit.urlPrefix = Exhibit_urlPrefix;
        if (Object.prototype.hasOwnProperty.call(
            window,
            "Exhibit_parameters"
        )) {
            Exhibit.parseURLParameters(Exhibit_parameters,
                                       Exhibit.params,
                                       paramTypes);
        }
    } else {
        url = Exhibit.findScript(document, "/exhibit-api.js");
        Exhibit.urlPrefix = url.substr(0, url.indexOf("exhibit-api.js"));
        Exhibit.parseURLParameters(url, Exhibit.params, paramTypes);
    }

    if (typeof Exhibit.params.babel !== "undefined") {
        Exhibit.babelPrefix = Exhibit.params.babel;
    }

    // Using the <link> version takes precedence; this is a holdover from
    // the Babel-based importer where only Babel's translator URL mattered,
    // but here the root of Babel is more important.
    // <link rel="exhibit/babel-translator" src="..." />
    //   or
    // <link rel="exhibit-babel" src="..." />
    // will do it.
    linkElmts = document.getElementsByTagName("link");
    for (i = 0; i < linkElmts.length; i++) {
        link = linkElmts[i];
        if (link.rel.search(/\b(exhibit\/babel-translator|exhibit-babel)\b/) > 0) {
            Exhibit.babelPrefix = link.href.replace(/\/translator\/$/, "");
        }
    }

    if (Exhibit.params.bundle) {
        Exhibit.scripts = ["exhibit-scripted-bundle.js"];
        Exhibit.styles = ["styles/exhibit-scripted-bundle.css"];
    }
    
    if (typeof Exhibit.params.backstage !== "undefined") {
        // If using Backstage, force non-auto creation and force Backstage
        // to load after Exhibit.  If the Backstage install also includes
        // Babel, the Backstage scripts should set Exhibit.babelPrefix.
        Exhibit.params.autoCreate = false;
        Exhibit.scripts = Exhibit.scripts.concat(Exhibit.params.backstage);
    }

    if (typeof Exhibit.params.js === "object") {
        if (Exhibit.params.postLoad) {
            Exhibit.scripts = Exhibit.scripts.concat(Exhibit.params.js);
        } else {
            Exhibit.scripts = Exhibit.params.js.concat(Exhibit.scripts);
        }
    };

    // load styles first
    docHead = document.getElementsByTagName("head")[0];
    for (i = 0; i < Exhibit.styles.length; i++) {
        style = document.createElement("link");
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("type", "text/css");
        style.setAttribute("href", Exhibit.urlPrefix + Exhibit.styles[i]);
        docHead.appendChild(style);
    }

    $LAB.setGlobalDefaults({
        UseLocalXHR: false,
        AllowDuplicates: false
    });
    Exhibit.loader = $LAB.setOptions({"AlwaysPreserveOrder": true});

    for (i in Exhibit._dependencies) {
        if (typeof Exhibit._dependencies[i] === "undefined") {
            Exhibit.includeJavascriptFile(Exhibit.urlPrefix, i);
        } else if (Exhibit._dependencies.hasOwnProperty(i)) {
            dep = Exhibit._dependencies[i].split(".");
            if (dep.length === 1) {
                if (!Object.prototype.hasOwnProperty.call(window, dep[0])) {
                    Exhibit.includeJavascriptFile(Exhibit.urlPrefix, i);
                }
            } else {
                for (j = 0; j < dep.length; j++) {
                    o = window;
                    for (k = 0; k < j; k++) {
                        o = o[dep[k]];
                    }
                    if (!o.hasOwnProperty(dep[j])) {
                        if (j === dep.length - 1) {
                            Exhibit.includeJavascriptFile(Exhibit.urlPrefix, i);
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    scr = Exhibit.scripts;
    for (i = 0; i < scr.length; i++) {
        if (scr[i].indexOf("/") === 0 ||
            (scr[i].indexOf(":") > 0 && scr[i].indexOf("//") > 0)) {
            Exhibit.includeJavascriptFile(null, scr[i]);
        } else {
            Exhibit.includeJavascriptFile(Exhibit.urlPrefix, scr[i]);
        }
    }
};

Exhibit.load();
