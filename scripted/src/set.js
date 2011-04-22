Exhibit = {};

/**
 * A basic set (in the mathematical sense) data structure
 *
 * @constructor
 * @param {Array or Exhibit.Set} [a] an initial collection
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
 * Adds the given object to this set, assuming there it does not already exist
 *
 * @param {Object} o the object to add
 * @return {Boolean} true if the object was added, false if not
 */
Exhibit.Set.prototype.add = function(o) {
    if (!this._hash.hasOwnProperty(o)) {
        this._hash[o] = true;
        this._count++;
        return true;
    }
    return false;
};

/**
 * Adds each element in the given set to this set
 *
 * @param {Exhibit.Set} set the set of elements to add
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
 * Removes the given element from this set
 *
 * @param {Object} o the object to remove
 * @return {Boolean} true if the object was successfully removed,
 *   false otherwise
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
 * given set
 *
 * @param {Exhibit.Set} set the set of elements to remove
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
 * modifies this set to the intersection of the two sets
 *
 * @param {Exhibit.Set} set the set to intersect
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
 * Returns whether or not the given element exists in this set
 *
 * @param {Exhibit.Set} o the object to test for
 * @return {Boolean} true if the object is present, false otherwise
 */
Exhibit.Set.prototype.contains = function(o) {
    return this._hash.hasOwnProperty(o);
};

/**
 * Returns the number of elements in this set
 *
 * @return {Number} the number of elements in this set
 */
Exhibit.Set.prototype.size = function() {
    return this._count;
};

/**
 * Returns the elements of this set as an array
 *
 * @return {Array} a new array containing the elements of this set
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
 * given function on each element until the function returns true
 *
 * @param {Function} f a function of form f(element)
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
