/**
 * @author <a href="mailto:eob@csail.mit.edu">Ted Benson</a>
 * @fileOverview Settings file.
 */

/**
 * A configuration spec stores the schema describing how an object might
 * be configured, which includes default values. It can create new
 * configuration instances.
 *
 * @constructor
 * @class Represents the specification for a configuration.
 * @param {Object} [spec] The JSON representation of a spec.
 * @example
 * var configSpec = new Exhibit.ConfigurationSpec([
 *    'size': {
 *      default: 10,
 *      description: "The radius of the item, in pixels",
 *      type: "int"
 *    }
 * });
 */
Exhibit.ConfigurationSpec = function(spec, parentSpec) {
  this.spec = spec;
  if (typeof parentSpec != 'undefined') {
    // TODO: Make the spec passed in inheirit from the parentSpec.
    // E.g. the ListFacet ConfigurationSpec might be inialized as follows:
    //  var spec = ConfigurationSpec(listFacetSpec, EnumeratedFacet.spec);
    //
  }
};

Exhibit.ConfigurationSpec.prototype.createInstance = function(jsonParams, domParams) {
  var config = this.createInstanceDefaults();
  if (typeof jsonParams != undefined) {
    this.addJsonConfigToInstance(config, jsonParams);
  }
  if (typeof domParams != undefined) {
    this.addDomConfigToInstance(config, domParams);
  }
  return config;
};

Exhibit.ConfigurationSpec.prototype.createInstanceDefaults = function() {
};

Exhibit.ConfigurationSpec.prototype.createValue = function(spec, overrideValue) {
  var theVal;
  if (typeof overrideValue != 'undefined') {
    theVal = overrideValue;
  } else if (typeof spec.default != 'undefined') {
    theVal = spec.default;
  }
  if (typeof theVal == 'undefined') {
    return undefined;
  }
  var kind = 'string';
  if (typeof spec.type != 'undefined') {
    kind = spec.type;
  }
  if (kind == 'string') {
    return String(theVal);
  } else if (kind == 'int') {
    return parseInt(theVal);
  } else if (kind == 'float') {
    return parseFloat(theVal);
  } else if (kind == 'bool') {
    return Boolean(theVal);
  }
};

Exhibit.ConfigurationSpec.prototype.addJsonConfigToInstance = function(config, json) {
  for (property in json) {
    if (json.hasOwnProperty(key)) {
      var val = json[key];
      // See if we have a spec for this..
      if (typeof this.spec[key] != 'undefined') {
        val = this.createValue(this.spec[key], val);
      }
      config[key] = val;
    }
  }
};

Exhibit.ConfigurationSpec.prototype.addDomConfigToInstance = function(config, elem) {
  for (key in this.config) {
    if (this.config.hasOwnProperty(key)) {
      var dataVariant = "data-" + key;
      var oldVariant = "ex:" + key;
      var val;
      // check if it's there.
      // if so get value.

      // TODO: should we load other data-* and ex:* things?

      if (typeof val != 'undefined') {
        val = this.createValue(this.spec[key], val);
        config[key] = val;
      }
    }
  }
};

