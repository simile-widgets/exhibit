/**
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview Pertaining to the Exhibit.Set datatype.
 */

Exhibit = {};

/**
 * A basic set (in the mathematical sense) data structure.  Only numerical
 * or string values can be used.  Any other data type would be considered
 * equivalent to a generic object and cannot be added.
 *
 * @constructor
 * @param {Array|Exhibit.Set} [a] An initial collection.
 * @example
 * var set = new Exhibit.Set(['a']);
 */
Exhibit.Set = function(a) {
    this._hash = {};
    this._count = 0;
    var i;

    if (a instanceof Array) {
        for (i = 0; i < a.length; i++) {
            this.add(a[i]);
        }
    } else if (a instanceof Exhibit.Set) {
        this.addSet(a);
    }
};

/**
 * Adds the given single String or Number object to this set, assuming it
 * does not already exist.  Other types will be rejected.
 *
 * @param {String|Number} o The object to add.
 * @returns {Boolean} True if the object was added, false if not.
 */
Exhibit.Set.prototype.add = function(o) {
    if ((typeof o === "number" || typeof o === "string")
        && !this._hash.hasOwnProperty(o)) {
        this._hash[o] = true;
        this._count++;
        return true;
    }
    return false;
};

/**
 * Adds each element in the given set to this set.
 *
 * @param {Exhibit.Set} set The set of elements to add.
 */
Exhibit.Set.prototype.addSet = function(set) {
    var o;
    for (o in set._hash) {
        if (set._hash.hasOwnProperty(o)) {
            this.add(o);
        }
    }
};

/**
 * Removes the given single element from this set.
 *
 * @param {String|Number} o The object to remove.
 * @returns {Boolean} True if the object was successfully removed,
 *   false otherwise.
 */
Exhibit.Set.prototype.remove = function(o) {
    if (this._hash.hasOwnProperty(o)) {
        delete this._hash[o];
        this._count--;
        return true;
    }
    return false;
};

/**
 * Removes the elements in this set that correspond to the elements in the
 * given set.
 *
 * @param {Exhibit.Set} set The set of elements to remove.
 */
Exhibit.Set.prototype.removeSet = function(set) {
    var o;
    for (o in set._hash) {
        if (set._hash.hasOwnProperty(o)) {
            this.remove(o);
        }
    }
};

/**
 * Removes all elements in this set that are not present in the given set, i.e.
 * modifies this set to the intersection of the two sets.
 *
 * @param {Exhibit.Set} set The set to intersect.
 */
Exhibit.Set.prototype.retainSet = function(set) {
    var o;
    for (o in this._hash) {
        if (this._hash.hasOwnProperty(o)) {
            if (!set.contains(o)) {
                delete this._hash[o];
                this._count--;
            }
        }
    }
};

/**
 * Returns whether or not the given element exists in this set.
 *
 * @param {String|Number} o The object to test for.
 * @returns {Boolean} True if the object is present, false otherwise.
 */
Exhibit.Set.prototype.contains = function(o) {
    return this._hash.hasOwnProperty(o);
};

/**
 * Returns the number of elements in this set.
 *
 * @returns {Number} The number of elements in this set.
 */
Exhibit.Set.prototype.size = function() {
    return this._count;
};

/**
 * Returns the elements of this set as an array.
 *
 * @returns {Array} A new array containing the elements of this set.
 */
Exhibit.Set.prototype.toArray = function() {
    var o, a = [];
    for (o in this._hash) {
        if (this._hash.hasOwnProperty(o)) {
            a.push(o);
        }
    }
    return a;
};

/**
 * Iterates through the elements of this set, order unspecified, executing the
 * given function on each element until the function returns true.
 *
 * @param {Function} f A function of form f(element).
 */
Exhibit.Set.prototype.visit = function(f) {
    var o;
    for (o in this._hash) {
        if (this._hash.hasOwnProperty(o)) {
            if (f(o) === true) {
                break;
            }
        }
    }
};
