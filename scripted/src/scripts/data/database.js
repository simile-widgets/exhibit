/**
 * @fileOverview Database interface and local implementation, with helper
 *               classes.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace Database layer of Exhibit.
 */
Exhibit.Database = {
    defaultIgnoredProperties: [ "uri", "modified" ]
};

/**
 * Instantiate an Exhibit database object.
 *
 * @static
 * @returns {Object}
 */
Exhibit.Database.create = function(type) {
    if (typeof Exhibit.Database[type] !== "undefined") {
        return new Exhibit.Database[type]();
    } else {
        // warn?
        return new Exhibit.Database._LocalImpl();
    }
};

/**
 * Add or initialize a subhash entry in a two-level hash, such that
 * index[x][y][z] = true, given z isn't already in index[x][y].
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {String} z Value to put into the subhash.
 */
Exhibit.Database._indexPut = function(index, x, y, z) {
    var hash, subhash, i;

    hash = index[x];
    if (typeof hash === "undefined") {
        hash = {};
        index[x] = hash;
    }

    subhash = hash[y];
    if (typeof subhash === "undefined") {
        subhash = [];
        hash[y] = subhash;
    }

    subhash[z] = true;
};

/**
 * Add or initialize an subhash entry in a two-level hash, such that
 * index[x][y] = list if undefined or index[x][y].concat(list) if already
 * defined. 
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {Array} list List of values to add to the subhash key.
 */
Exhibit.Database._indexPutList = function(index, x, y, list) {
    var hash, subhash, i;

    hash = index[x];
    if (typeof hash === "undefined") {
        hash = {};
        index[x] = hash;
    }
    
    subhash = hash[y];
    if (typeof subhash === "undefined") {
        hash[y] = {};
        subhash = hash[y];
    }

    for (i=0; i<list.length; i++) {
        subhash[list[i]] = true;
    }
};

/**
 * Remove the element z from the subhash index[x][y]; also remove
 * index[x][y] if the subhash becomes empty and index[x] if the hash becomes
 * empty as a result.
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {String} z Value to remove from an subhash in the subhash key.
 * @returns {Boolean} True if value removed, false if not.
 */
Exhibit.Database._indexRemove = function(index, x, y, z) {
    var hash, subhash,
    isEmpty = function(x) {
        var p;
        for (p in x) {
            if (x.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    };

    hash = index[x];
    if (typeof hash === "undefined") {
        return false;
    }

    subhash = hash[y];
    if (typeof subhash === "undefined") {
        return false;
    }

    delete subhash[z];

    if (isEmpty(subhash)) {
        delete hash[y];
        if (isEmpty(hash)) {
            delete index[x];
        }
    }
    return true;
};

/**
 * Removes index[x][y] and index[x] if it becomes empty.
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @returns {Object} The removed object, or null if nothing was removed.
 */
Exhibit.Database._indexRemoveList = function(index, x, y) {
    var hash, res, prop, empty;

    hash = index[x];
    if (typeof hash === "undefined") {
        return null;
    }

    res = hash[y];
    if (typeof res === "undefined") {
        return null;
    }

    delete hash[y];

    empty = true;
    for (prop in hash) {
        if (hash.hasOwnProperty(prop)) {
            empty = false;
            break;
        }
    }
    if (empty) {
        delete index[x];
    }
    
    return res;
};
