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
 * Add or initialize an array entry in a two-level hash, such that
 * index[x][y].push(z), given z isn't already in index[x][y].
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {String} z Value to put into an array in the subhash key.
 */
Exhibit.Database._indexPut = function(index, x, y, z) {
    var hash, array, i;

    hash = index[x];
    if (typeof hash === "undefined") {
        hash = {};
        index[x] = hash;
    }

    array = hash[y];
    if (typeof array === "undefined") {
        array = [];
        hash[y] = array;
    } else {
        for (i = 0; i < array.length; i++) {
            if (z === array[i]) {
                return;
            }
        }
    }

    array.push(z);
};

/**
 * Add or initialize an array entry in a two-level hash, such that
 * index[x][y] = list if undefined or index[x][y].concat(list) if already
 * defined. 
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {Array} list List of values to add or assign to the subhash key.
 */
Exhibit.Database._indexPutList = function(index, x, y, list) {
    var hash, array;

    hash = index[x];
    if (typeof hash === "undefined") {
        hash = {};
        index[x] = hash;
    }
    
    array = hash[y];
    if (typeof array === "undefined") {
        hash[y] = list;
    } else {
        hash[y] = hash[y].concat(list);
    }
};

/**
 * Remove the element z from the array index[x][y]; also remove
 * index[x][y] if the array becomes empty and index[x] if the hash becomes
 * empty as a result.
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {String} z Value to remove from an array in the subhash key.
 * @returns {Boolean} True if value removed, false if not.
 */
Exhibit.Database._indexRemove = function(index, x, y, z) {
    var hash, array, i, prop, empty;

    hash = index[x];
    if (typeof hash === "undefined") {
        return false;
    }

    array = hash[y];
    if (typeof array === "undefined") {
        return false;
    }

    for (i = 0; i < array.length; i++) {
        if (z === array[i]) {
            array.splice(i, 1);

            if (array.length === 0) {
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
            }

            return true;
        }
    }
};

/**
 * Removes index[x][y] and index[x] if it becomes empty.
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @returns {Array} The removed array, or null if nothing was removed.
 */
Exhibit.Database._indexRemoveList = function(index, x, y) {
    var hash, array, prop, empty;

    hash = index[x];
    if (typeof hash === "undefined") {
        return null;
    }

    array = hash[y];
    if (typeof array === "undefined") {
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
    
    return array;
};

/**
 *
 *
 * @public
 * @constructor
 * @class
 */
Exhibit.Database._LocalImpl = function() {
};

/**
 *
 *
 * @returns {Exhibit.Database}
 */
Exhibit.Database._LocalImpl.prototype.createDatabase = function() {
};

/**
 *
 *
 * @param {Object} o
 * @param {String} baseURI
 */
Exhibit.Database._LocalImpl.prototype.loadData = function(o, baseURI) {
};

/**
 *
 * 
 * @param {Object} typeEntries
 * @param {String} baseURI
 */
Exhibit.Database._LocalImpl.prototype.loadTypes = function(typeEntries, baseURI) {
};

/**
 *
 *
 * @param {Object} propertyEntries
 * @param {String} baseURI
 */
Exhibit.Database._LocalImpl.prototype.loadProperties = function(propertyEntries, baseURI) {
};

/**
 *
 * 
 * @param {Object} itemEntries
 * @param {String} baseURI
 */
Exhibit.Database._LocalImpl.prototype.loadItems = function(itemEntries, baseURI) {
};

/**
 *
 *
 * @param {String} typeID
 * @returns {Exhibit.Database._Type}
 */
Exhibit.Database._LocalImpl.prototype.getType = function(typeID) {
};

/**
 *
 *
 * @param {String} propertyID
 * @returns {Exhibit.Database._Property}
 */
Exhibit.Database._LocalImpl.prototype.getProperty = function(propertyID) {
};

/**
 *
 *
 * @returns {Array}
 */
Exhibit.Database._LocalImpl.prototype.getAllProperties = function() {
};

/**
 *
 *
 * @returns {Exhibit.Set}
 */
Exhibit.Database._LocalImpl.prototype.getAllItems = function() {
};

/**
 *
 *
 * @returns {Number}
 */
Exhibit.Database._LocalImpl.prototype.getAllItemsCount = function() {
};

/**
 *
 *
 * @param {String} itemID
 * @returns {Boolean}
 */
Exhibit.Database._LocalImpl.prototype.containsItem = function(itemID) {
};

/**
 * 
 *
 * @param {Object} idToQualifiedName
 * @param {Object} prefixToBase
 * @returns {Object}
 */
Exhibit.Database._LocalImpl.prototype.getNamespaces = function(idToQualifiedName, prefixToBase) {
};

/**
 *
 * 
 * @param {String} s
 * @param {String} p
 * @param {Exhibit.Set} set
 * @param {Exhibit.Set} filter
 * @returns {Exhibit.Set}
 */
Exhibit.Database._LocalImpl.prototype.getObjects = function(s, p, set, filter) {
};

/**
 *
 *
 * @param {String} s
 * @param {String} p
 * @param {Exhibit.Set} filter
 * @returns {Number}
 */
Exhibit.Database._LocalImpl.prototype.countDistinctObjects = function(s, p, filter) {
};

/**
 *
 *
 * @param {Exhibit.Set} subjects
 * @param {String} p
 * @param {Exhibit.Set} set
 * @param {Exhibit.Set} filter
 * @returns {Exhibit.Set}
 */
Exhibit.Database._LocalImpl.prototype.getObjectsUnion = function(subjects, p, set, filter) {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.countDistinctObjectsUnion = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getSubjects = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.countDistinctSubjects = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getSubjectsUnion = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.countDistinctSubjectsUnion = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getObject = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getSubject = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getForwardProperties = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getBackwardProperties = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getSubjectsInRange = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getTypeIDs = function() {
};


/**
 *
 */
Exhibit.Database._LocalImpl.prototype.addStatement = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.removeStatement = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.removeObjects = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.removeSubjects = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.removeAllStatements = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.getItem = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.addItem = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.editItem = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype.removeItem = function() {
};


/**
 *
 */
Exhibit.Database._LocalImpl.prototype._loadLinks = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._loadItem = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._ensureTypeExists = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._ensurePropertyExists = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._indexFillSet = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._indexCountDistinct = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._get = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._getUnion = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._countDistinctUnion = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._countDistinct = function() {
};

/**
 *
 */
Exhibit.Database._LocalImpl.prototype._getProperties = function() {
};



/**
 *
 *
 * @public
 * @constructor
 * @class
 * @param {String} id
 */
Exhibit.Database._Type = function(id) {
    this._id = id;
    this._custom = {};
};

/**
 *
 *
 * @returns {String} 
 */
Exhibit.Database._Type.prototype.getID = function() {
    return this._id;
};

/**
 *
 *
 * @returns {String} 
 */
Exhibit.Database._Type.prototype.getURI = function() {
    return this._custom["uri"];
};

/**
 *
 *
 * @returns {String} 
 */
Exhibit.Database._Type.prototype.getLabel = function() {
    return this._custom["label"];
};

/**
 *
 *
 * @returns {String} 
 */
Exhibit.Database._Type.prototype.getOrigin = function() {
    return this._custom["origin"];
};

/**
 *
 *
 * @param {String} p
 * @returns {String} 
 */
Exhibit.Database._Type.prototype.getProperty = function(p) {
    return this._custom[p];
};


/**
 * Represents a property within a triple store.
 *
 * @public
 * @constructor
 * @class
 * @param {String} id
 * @param {Exhibit.Database} database
 */
Exhibit.Database._Property = function(id, database) {
    this._id = id;
    this._database = database;
    this._rangeIndex = null;
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getID = function() {
    return this._id;
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getURI = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getValueType = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getLabel = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getPluralLabel = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getReverseLabel = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getReversePluralLabel = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getGroupingLabel = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getGroupingPluralLabel = function() {
};

/**
 *
 *
 * @returns {String}
 */
Exhibit.Database._Property.prototype.getOrigin = function() {
};

/**
 *
 *
 * @returns {Exhibit.Database._RangeIndex}
 */
Exhibit.Database._Property.prototype.getRangeIndex = function() {
};

/**
 *
 *
 * @private
 */
Exhibit.Database._Property.prototype._onNewData = function() {
    this._rangeIndex = null;
};

/**
 *
 *
 * @private
 */
Exhibit.Database._Property.prototype._buildRangeIndex = function() {
};


/**
 *
 *
 * @public
 * @constructor
 * @class
 * @param {} items
 * @param {Function} getter
 */
Exhibit.Database._RangeIndex = function(items, getter) {
};

/**
 *
 *
 * @returns {Number}
 */
Exhibit.Database._RangeIndex.prototype.getCount = function() {
};

/**
 *
 *
 * @returns {Number}
 */
Exhibit.Database._RangeIndex.prototype.getMin = function() {
};

/**
 *
 *
 * @returns {Number}
 */
Exhibit.Database._RangeIndex.prototype.getMax = function() {
};

/**
 *
 *
 * @param {Function} visitor
 * @param {Number} min
 * @param {Number} max
 * @param {Boolea} inclusive
 */
Exhibit.Database._RangeIndex.prototype.getRange = function(visitor, min, max, inclusive) {
};

/**
 *
 * 
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} inclusive
 * @param {Exhibit.Set} set
 * @param {Exhibit.Set} filter
 */
Exhibit.Database._RangeIndex.prototype.getSubjectsInRange = function(min, max, inclusive, set, filter) {
};

/**
 * Count the number of elements in this range between the specified open
 * or closed range of values.
 * 
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} inclusive
 * @returns {Number}
 */
Exhibit.Database._RangeIndex.prototype.countRange = function(min, max, inclusive) {
};

/**
 * Find and return the closest preceding numeric index for a given value
 * if it falls inside this range.
 *
 * @private
 * @param {Number} v
 * @returns {Number}
 */
Exhibit.Database._RangeIndex.prototype._indexOf = function(v) {
};
