/*
 * Copyright (c) 2007 Mason Tang 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

DStructs = {};

DStructs.Array = function() {
    // Clean, slightly slow method of extending Array
    var x = [], a = arguments;
    for (var i = 0; i < a.length; i++) {
        if (a[i] instanceof Array) {

        } else {
            x.push(a[i]);
        }
    }
    for (var i in this) { x[i] = this[i]; }
    return x;
};
DStructs.Array.prototype = new Array();

// We need to rewrite a few Array methods to return DStructs.Array objects
DStructs.Array.prototype.slice = function(start, end) {
    if (start < 0) { start = this.length + start; }
    if (end == null) { end = this.length; }
    else if (end < 0) { end = this.length + end; }
    var a = new DStructs.Array();
    for (var i = start; i < end; i++) { a.push(this[i]); }
    return a;
};
DStructs.Array.prototype.concat = function() { 
    var arrays = arguments;
    var result = this.clone();
    for (var i = 0; i < arrays.length; i++) {
        if (arrays[i] instanceof Array) {
            result.addAll(arrays[i]);
        }
    }
    return result;
};
DStructs.Array.prototype.addAll = function(a) {
    for (var i = 0; i < a.length; i++) {
        this.push(a[i]);
    }
    return this;
};
DStructs.Array.prototype.map_i = function(f) {
    var self = this;
    return this.each(function(e, i) { self[i] = f(e, i); });
};
DStructs.Array.prototype.map = function(f) {
    var clone = new DStructs.Array();
    this.each(function(e, i) { clone.push(f(e, i)); });
    return clone;
};
DStructs.Array.prototype.filter = function(f) {
    var clone = new DStructs.Array();
    this.each(function(e, i) { if (f(e, i)) { clone.push(e); } });
    return clone;
};
DStructs.Array.prototype.filter_i = function(f) {

};
DStructs.Array.prototype.each = function(f) {
    for (var i = 0; i < this.length; i++) {
        f(this[i], i);
    }
    return this;
};
DStructs.Array.prototype.reduce = function(init, f) {
    for (var i = 0, len = this.length, result = init; i < len; i++) {
        result = f.call(this, result, this[i]);
    }
    return result;
};
DStructs.Array.prototype.zip = function() {

};
DStructs.Array.prototype.indexOf = function(obj) {
    var indices = this.indicesOf(obj);
    if (!indices.empty()) { return indices[0]; }
    return -1;
};
DStructs.Array.prototype.indicesOf = function(obj) {
    var indices = new DStructs.Array();
    this.each(function(e, i) { if (obj == e) { indices.push(i); } });
    return indices;
};
DStructs.Array.prototype.remove = function(obj) {
    var removed = 0;
    while (this.contains(obj)) {
    }
    return removed;
};
DStructs.Array.prototype.contains = function(obj) {
    return this.indexOf(obj) >= 0;
};
DStructs.Array.prototype.uniq_i = function() {
    var hash = new DStructs.Hash();
    var indices = new DStructs.Array();
    var self = this;
    this.each(function(e, i) {
        if (hash.contains(e)) { 
            indices.push(i);
        } else {
            hash.put(e, i);
        }
    });
    return this;
};
DStructs.Array.prototype.uniq = function() {
    var hash = new DStructs.Hash();
    this.each(function(e) { hash.put(e, e); });
    return hash.values();
};
DStructs.Array.prototype.empty = function() {
    return this.length == 0;
};
DStructs.Array.prototype.clear = function() {
    this.length = 0;
};
DStructs.Array.prototype.clone = function() {
    var clone = new DStructs.Array();
    this.each(function(e) { clone.push(e); });
    return clone;
};
DStructs.Array.prototype.iterator = function() {
    return new DStructs.Iterator(this);
};

DStructs.Iterator = function(items) {
    var index = 0;
    this.hasNext = function() {
        return index < items.length;
    };
    this.next = function() {
        index++;
        return items[index - 1];
    };
};


DStructs.Hash = function() {
    var dataStore = {};
    var count;
    
    this.put = function(key, value) {
        var success = !(key in dataStore);
        dataStore[key] = value;
        if (success) { count++; }
        return success;
    };
    
    this.contains = function(key) {
        return key in dataStore;
    };
    
    this.size = function() {
        return count;
    };
    
    this.each = function(f) {
        for (var key in dataStore) {
            f(dataStore[key], key);
        }
        return this;
    };
    
    this.values = function() {
        var values = new DStructs.Array();
        this.each(function(v, k) { values.push(v); });
        return values;
    };
    
    this.keys = function() {
        var keys = new DStructs.Array();
        this.each(function(v, k) { keys.push(k); });
        return keys;
    };
    
};
