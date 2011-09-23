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
     * Settable parameters within the query string of loading this file.
     */
    params: {
        bundle: false,
        autoCreate: true,
        safe: false
    },

    _dependencies: {
        "lib/jquery.js": "$",
        "lib/json2.js": "JSON",
        "lib/amplify.store.js": "amplify", 
        "lib/base64.js": "Base64"
// History fails to load correctly in Safari through this mechanism
//        "lib/history.js": "History.init",
//        "lib/history.adapter.jquery.js": "History.Adapter",
//        "lib/history.html4.js": "History.initHtml4",
// SIMILE jQuery plugins fail to load under nonconflicting circumstances
// because jQuery hasn't been made available yet
//        "lib/jquery.simile.dom.js": "jQuery.simileDOM",
//        "lib/jquery.simile.bubble.js": "jQuery.simileBubble",
    },

    /**
     * Scripts Exhibit will load.
     */
    scripts: [
        "lib/jquery.js",
        "lib/json2.js",
        "lib/amplify.store.js",
        "lib/history.adapter.jquery.js",
        "lib/history.js",
        "lib/history.html4.js",
        "lib/base64.js",
        "lib/jquery.simile.dom.js",
        "lib/jquery.simile.bubble.js",
        "scripts/exhibit.js",
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
        "scripts/data/exporters/bookmark.js",
        "scripts/data/importer.js",
        "scripts/data/importers/json.js",
        "scripts/ui/ui.js",
        "scripts/ui/ui-context.js",
        "scripts/ui/lens-registry.js",
        "scripts/ui/lens.js",
        "scripts/ui/coordinator.js",
        "scripts/ui/formatter.js",
        "scripts/ui/format-parser.js",
        "scripts/ui/facets/facet.js",
        "scripts/ui/facets/list-facet.js",
        "scripts/ui/facets/cloud-facet.js",
        "scripts/ui/views/view.js",
        "scripts/ui/views/view-panel.js",
        "scripts/ui/views/ordered-view-frame.js",
        "scripts/ui/views/tile-view.js",
        "scripts/ui/views/tabular-view.js",
        "scripts/ui/views/thumbnail-view.js",
        "scripts/ui/coders/color-coder.js",
        "scripts/ui/coders/default-color-coder.js",
        "scripts/ui/widgets/collection-summary-widget.js",
        "scripts/ui/widgets/option-widget.js",
        "scripts/ui/widgets/resizable-div-widget.js",
        "scripts/ui/widgets/toolbox-widget.js",
        "locales/manifest.js",
        "final.js"
    ],

    "styles": [
        "styles/graphics.css",
        "styles/exhibit.css",
        "styles/browse-panel.css",
        "styles/lens.css",
        "styles/util/facets.css",
        "styles/util/views.css",
        "styles/views/view-panel.css",
        "styles/views/tile-view.css",
        "styles/views/tabular-view.css",
        "styles/views/thumbnail-view.css",
        "styles/widgets/collection-summary-widget.css",
        "styles/widgets/resizable-div-widget.css",
        "styles/widgets/toolbox-widget.css",
        "styles/widgets/legend-widget.css",
        "styles/widgets/option-widget.css"
    ]
};

/*! LAB.js (LABjs :: Loading And Blocking JavaScript)
    v2.0.3 (c) Kyle Simpson
    MIT License
*/
(function(o){var K=o.$LAB,y="UseLocalXHR",z="AlwaysPreserveOrder",u="AllowDuplicates",A="CacheBust",B="BasePath",C=/^[^?#]*\//.exec(location.href)[0],D=/^\w+\:\/\/\/?[^\/]+/.exec(C)[0],i=document.head||document.getElementsByTagName("head"),L=(o.opera&&Object.prototype.toString.call(o.opera)=="[object Opera]")||("MozAppearance"in document.documentElement.style),q=document.createElement("script"),E=typeof q.preload=="boolean",r=E||(q.readyState&&q.readyState=="uninitialized"),F=!r&&q.async===true,M=!r&&!F&&!L;function G(a){return Object.prototype.toString.call(a)=="[object Function]"}function H(a){return Object.prototype.toString.call(a)=="[object Array]"}function N(a,c){var b=/^\w+\:\/\//;if(/^\/\/\/?/.test(a)){a=location.protocol+a}else if(!b.test(a)&&a.charAt(0)!="/"){a=(c||"")+a}return b.test(a)?a:((a.charAt(0)=="/"?D:C)+a)}function s(a,c){for(var b in a){if(a.hasOwnProperty(b)){c[b]=a[b]}}return c}function O(a){var c=false;for(var b=0;b<a.scripts.length;b++){if(a.scripts[b].ready&&a.scripts[b].exec_trigger){c=true;a.scripts[b].exec_trigger();a.scripts[b].exec_trigger=null}}return c}function t(a,c,b,d){a.onload=a.onreadystatechange=function(){if((a.readyState&&a.readyState!="complete"&&a.readyState!="loaded")||c[b])return;a.onload=a.onreadystatechange=null;d()}}function I(a){a.ready=a.finished=true;for(var c=0;c<a.finished_listeners.length;c++){a.finished_listeners[c]()}a.ready_listeners=[];a.finished_listeners=[]}function P(d,f,e,g,h){setTimeout(function(){var a,c=f.real_src,b;if("item"in i){if(!i[0]){setTimeout(arguments.callee,25);return}i=i[0]}a=document.createElement("script");if(f.type)a.type=f.type;if(f.charset)a.charset=f.charset;if(h){if(r){e.elem=a;if(E){a.preload=true;a.onpreload=g}else{a.onreadystatechange=function(){if(a.readyState=="loaded")g()}}a.src=c}else if(h&&c.indexOf(D)==0&&d[y]){b=new XMLHttpRequest();b.onreadystatechange=function(){if(b.readyState==4){b.onreadystatechange=function(){};e.text=b.responseText+"\n//@ sourceURL="+c;g()}};b.open("GET",c);b.send()}else{a.type="text/cache-script";t(a,e,"ready",function(){i.removeChild(a);g()});a.src=c;i.insertBefore(a,i.firstChild)}}else if(F){a.async=false;t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}else{t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}},0)}function J(){var l={},Q=r||M,n=[],p={},m;l[y]=true;l[z]=false;l[u]=false;l[A]=false;l[B]="";function R(a,c,b){var d;function f(){if(d!=null){d=null;I(b)}}if(p[c.src].finished)return;if(!a[u])p[c.src].finished=true;d=b.elem||document.createElement("script");if(c.type)d.type=c.type;if(c.charset)d.charset=c.charset;t(d,b,"finished",f);if(b.elem){b.elem=null}else if(b.text){d.onload=d.onreadystatechange=null;d.text=b.text}else{d.src=c.real_src}i.insertBefore(d,i.firstChild);if(b.text){f()}}function S(c,b,d,f){var e,g,h=function(){b.ready_cb(b,function(){R(c,b,e)})},j=function(){b.finished_cb(b,d)};b.src=N(b.src,c[B]);b.real_src=b.src+(c[A]?((/\?.*$/.test(b.src)?"&_":"?_")+~~(Math.random()*1E9)+"="):"");if(!p[b.src])p[b.src]={items:[],finished:false};g=p[b.src].items;if(c[u]||g.length==0){e=g[g.length]={ready:false,finished:false,ready_listeners:[h],finished_listeners:[j]};P(c,b,e,((f)?function(){e.ready=true;for(var a=0;a<e.ready_listeners.length;a++){e.ready_listeners[a]()}e.ready_listeners=[]}:function(){I(e)}),f)}else{e=g[0];if(e.finished){j()}else{e.finished_listeners.push(j)}}}function v(){var e,g=s(l,{}),h=[],j=0,w=false,k;function T(a,c){a.ready=true;a.exec_trigger=c;x()}function U(a,c){a.ready=a.finished=true;a.exec_trigger=null;for(var b=0;b<c.scripts.length;b++){if(!c.scripts[b].finished)return}c.finished=true;x()}function x(){while(j<h.length){if(G(h[j])){try{h[j++]()}catch(err){}continue}else if(!h[j].finished){if(O(h[j]))continue;break}j++}if(j==h.length){w=false;k=false}}function V(){if(!k||!k.scripts){h.push(k={scripts:[],finished:true})}}e={script:function(){for(var f=0;f<arguments.length;f++){(function(a,c){var b;if(!H(a)){c=[a]}for(var d=0;d<c.length;d++){V();a=c[d];if(G(a))a=a();if(!a)continue;if(H(a)){b=[].slice.call(a);b.unshift(d,1);[].splice.apply(c,b);d--;continue}if(typeof a=="string")a={src:a};a=s(a,{ready:false,ready_cb:T,finished:false,finished_cb:U});k.finished=false;k.scripts.push(a);S(g,a,k,(Q&&w));w=true;if(g[z])e.wait()}})(arguments[f],arguments[f])}return e},wait:function(){if(arguments.length>0){for(var a=0;a<arguments.length;a++){h.push(arguments[a])}k=h[h.length-1]}else k=false;x();return e}};return{script:e.script,wait:e.wait,setOptions:function(a){s(a,g);return e}}}m={setGlobalDefaults:function(a){s(a,l);return m},setOptions:function(){return v().setOptions.apply(null,arguments)},script:function(){return v().script.apply(null,arguments)},wait:function(){return v().wait.apply(null,arguments)},queueScript:function(){n[n.length]={type:"script",args:[].slice.call(arguments)};return m},queueWait:function(){n[n.length]={type:"wait",args:[].slice.call(arguments)};return m},runQueue:function(){var a=m,c=n.length,b=c,d;for(;--b>=0;){d=n.shift();a=a[d.type].apply(null,d.args)}return a},noConflict:function(){o.$LAB=K;return m},sandbox:function(){return J()}};return m}o.$LAB=J();(function(a,c,b){if(document.readyState==null&&document[a]){document.readyState="loading";document[a](c,b=function(){document.removeEventListener(c,b,false);document.readyState="complete"},false)}})("addEventListener","DOMContentLoaded")})(this);

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
 * Load all scripts associated with Exhibit.
 * 
 * @static
 * @param {Function} post [optional] A function to run after all scripts are
 *                                   loaded of the form function(lab), taking
 *                                   the $LAB LABjs object as an argument.
 */
Exhibit.load = function() {
    var i, j, k, o, dep, scripts, script, url, paramTypes, scr, docHead, style;

    paramTypes = {
        "bundle": Boolean,
        "js": Array,
        "postLoad": Boolean,
        "css": Array,
        "autoCreate": Boolean,
        "safe": Boolean
    };
    if (typeof Exhibit_urlPrefix === "string") {
        Exhibit.urlPrefix = Exhibit_urlPrefix;
        if (window.hasOwnProperty("Exhibit_parameters")) {
            Exhibit.parseURLParameters(Exhibit_parameters,
                                       Exhibit.params,
                                       paramTypes);
        }
    } else {
        scripts = document.getElementsByTagName("script");
        for (i = 0; i < scripts.length; i++) {
            script = scripts[i];
            if (script.hasAttribute("src")) {
                url = script.getAttribute("src");
                if (url.indexOf("/exhibit-api.js") >= 0) {
                    Exhibit.urlPrefix = url.substr(0, url.indexOf("exhibit-api.js"));
                    Exhibit.parseURLParameters(url, Exhibit.params, paramTypes);
                }
            }
        }
    }

    if (Exhibit.params.autoCreate) {
        Exhibit.scripts.push("scripts/create.js");
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
        AlwaysPreserveOrder: true,
        UseLocalXHR: false,
        AllowDuplicates: false
    });

    scr = Exhibit.scripts;
    for (i = 0; i < scr.length; i++) {
        if (!Exhibit._dependencies.hasOwnProperty(scr[i])) {
            if (scr[i].indexOf("/") === 0 ||
                (scr[i].indexOf(":") > 0 && scr[i].indexOf("//") > 0)) {
                    $LAB.script(scr[i]);
                } else {
                    $LAB.script(Exhibit.urlPrefix + scr[i]);
                }
        } else if (Exhibit._dependencies.hasOwnProperty(scr[i])) {
            dep = Exhibit._dependencies[scr[i]].split(".");
            if (dep.length === 1) {
                if (!window.hasOwnProperty(dep[0])) {
                    $LAB.script(Exhibit.urlPrefix + scr[i]);
                }
            } else {
                for (j = 0; j < dep.length; j++) {
                    o = window;
                    for (k = 0; k < j; k++) {
                        o = o[dep[k]];
                    }
                    if (!o.hasOwnProperty(dep[j])) {
                        if (j === dep.length - 1) {
                            $LAB.script(Exhibit.urlPrefix + scr[i]);
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }
};

Exhibit.load();
