/**
 * @author <a href="mailto:eob@csail.mit.edu">Ted Benson</a>
 * @fileOverview Settings file.
 *
 * A configuration spec stores the schema describing how an object might be
 * configured, which includes default values. It can create new configuration
 * instances.
 *
 * @constructor @class Represents the specification for a configuration.
 * @param {Object} [spec] The JSON representation of a spec.
 * @example
 *
 * USE
 * ============================================================================
 *
 * In a class file, create a config spec as a static member of the class:
 *
 *     BubbleChart.configSpec = new Exhibit.ConfigurationSpec({
 *       'size': {
 *         default: 10,
 *         description: "The radius of the item, in pixels",
 *         type: "int",
 *         dimension: 1 // optional;
 *         default:1
 *      }
 *    });
 *
 *
 * If the dimension is set,
 *
 * Then, in the constructor of that class, create a new configuration object
 * like this:
 *
 *     var BubbleChart = function(json, domNode) {
 *
 *       this._settings = BubbleChart.configSpec.createInstance(json, domNode);
 *
 *     };
 *
 * In this case, the variables `json` and `domNode` are optional configuration
 * objects passed in by the user.
 *
 * SPEC OPTIONS THAT AREN'T SELF EXPLANITORY...
 * ============================================================================
 *
 * Type
 * ----
 *
 * Valid types are: int, float, bool, expression, string (default). The
 * resulting config object is a simple JSON dictionary of key to value. The
 * value is properly parsed and constructed based on the spec (e.g., an
 * expression type will be an expression object).
 *
 * Dimension
 * ---------
 *
 * Dimension is optional and defaults to one. Valid settings for dimension are
 * integers greater than one or the * character.
 *
 *   * If 1, the value is parsed as the type provided.
 *   * If > 1, the value is parsed as an array of the type provided and an
 *     exception is thrown if not enough values are supplied. (comma separated)
 *   * If *, the value is parsed as an arbitrary comma-separated list.
 *
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
  var ret = {};
  for (key in this.spec) {
    if (this.spec.hasOwnProperty(key)) {
      var bloc = this.spec[key];
      if (typeof bloc.default != 'undefined') {
        ret[key] = this.createValue(bloc.default);
      }
    }
  }
  return ret;
};

Exhibit.ConfigurationSpec.prototype.parseSingleValue = function(val, kind) {
  if (kind == 'string') {
    return String(val);
  } else if (kind == 'int') {
    return parseInt(val);
  } else if (kind == 'float') {
    return parseFloat(val);
  } else if (kind == 'bool') {
    return Boolean(val);
  } else if (kind == 'expression') {
    return Exhibit.ExpressionParser.parse(val);
  } else {
    return null;
  }
};

Exhibit.ConfigurationSpec.prototype.createValue = function(spec, overrideValue) {
  // Pick which value to parse
  var val;
  if (typeof overrideValue != 'undefined') {
    val = overrideValue;
  } else if (typeof spec.default != 'undefined') {
    val = spec.default;
  }
  if (typeof val == 'undefined') {
    return val;
  }

  // Get the dimension and type.
  var dimension = this.getDimension(spec);
  var kind = 'string';
  if (typeof spec.type != 'undefined') {
    kind = spec.type;
  }

  // Now parse either as an array or scalar.
  if ((dimension == '*') || (dimension > 1)) {
    val = this.splitVal(val);
    if ((dimension != '*') && (val.length != dimension)) {
      // TODO: Throw exception?
    }
    for (var i = 0; i < val.length; i++) {
      val[i] = this.parseSingleValue(val[i], kind);
    }
  } else {
    val = this.parseSingleValue(val);
  }

  return val;
};

/*
 * Postcondition: Return value is either '*' or int i | i >= 1.
 */
Exhibit.ConfigurationSpec.prototype.splitValue = function(val) {
  return val.split(",");
};

/*
 * Postcondition: Return value is either '*' or int i | i >= 1.
 */
Exhibit.ConfigurationSpec.prototype.getDimension = function(spec) {
  var n = 1;
  if (typeof spec.dimension != 'undefined') {
    if (parseInt(spec.dimension) > 0) {
      n = parseInt(spec.dimension);
    } else if (spec.dimension == '*') {
      n = '*'
    } else {
      // TODO: Throw exception? Or fail silently?
    }
  }
  return n;
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

Exhibit.ConfigurationSpec.prototype.parseExpression = function(expressionStr) {
  // TODO
};
