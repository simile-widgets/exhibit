/**
 * @fileOverview Helps bind and trigger events between views.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Coordinator = function(uiContext, div) {
    this._uiContext = uiContext;
    this._listeners = [];
    
    /**
     * Returns the programmatic identifier used for this view.
     * @public
     * @returns {String}
     */
    this.getID = function() {
        return _id;
    };

    /**
     * @private
     */
    _setIdentifier = function() {
        if (typeof div !== "undefined") {
            _id = Exhibit.jQuery(div).attr("id");
        }
        if (typeof _id === "undefined" || _id === null) {
            _id = self.getUIContext().getCollection().getID()
                + "-"
                + self.getUIContext().getMain().getRegistry().generateIdentifier(Exhibit.Coordinator.getRegistryKey());
        }
    };

    _setIdentifier();
    /**
     * Enter this view into the registry, making it easier to locate.
     */
    uiContext.getMain().getRegistry().register(
        Exhibit.Coordinator.getRegistryKey(),
        this.getID(),
        this
    );
    this._registered = true;
};

Exhibit.Coordinator._registryKey = "coordinator";
/**
 * @public
 * @static
 * @returns {String}
 */
Exhibit.Coordinator.getRegistryKey = function() {
    return Exhibit.Coordinator._registryKey;
};

Exhibit.Coordinator.registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(Exhibit.Coordinator.getRegistryKey())) {
        reg.createRegistry(Exhibit.Coordinator.getRegistryKey());
    }
};

Exhibit.jQuery(document).one(
    "registerComponents.exhibit",
    Exhibit.Coordinator.registerComponent
);

/**
 * @static
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.Coordinator.create = function(configuration, uiContext) {
    return new Exhibit.Coordinator(uiContext);
};

/**
 * @static
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.Coordinator.createFromDOM = function(div, uiContext) {
    return new Exhibit.Coordinator(Exhibit.UIContext.createFromDOM(div, uiContext, false), div);
};

/**
 *
 */
Exhibit.Coordinator.prototype.dispose = function() {
    this._uiContext.dispose();
    this._uiContext = null;
};

/**
 * @param {Function} callback
 * @returns {Exhibit.Coordinator._Listener}
 */
Exhibit.Coordinator.prototype.addListener = function(callback) {
    var listener = new Exhibit.Coordinator._Listener(this, callback);
    this._listeners.push(listener);
    
    return listener;
};

/**
 * @param {Exhibit.Coordinator._Listener} listener
 */
Exhibit.Coordinator.prototype._removeListener = function(listener) {
    var i;
    for (i = 0; i < this._listeners.length; i++) {
        if (this._listeners[i] === listener) {
            this._listeners.splice(i, 1);
            return;
        }
    }
};

/**
 * @param {Exhibit.Coordinator._Listener} listener
 * @param {Object} o
 */
Exhibit.Coordinator.prototype._fire = function(listener, o) {
    var i, listener2;
    for (i = 0; i < this._listeners.length; i++) {
        listener2 = this._listeners[i];
        if (listener2 !== listener) {
            listener2._callback(o);
        }
    }
};

/**
 * @constructor
 * @class
 * @param {Exhibit.Coordinator} coordinator
 * @param {Function} callback
 */
Exhibit.Coordinator._Listener = function(coordinator, callback) {
    this._coordinator = coordinator;
    this._callback = callback;
};

/**
 */
Exhibit.Coordinator._Listener.prototype.dispose = function() {
    this._coordinator._removeListener(this);
};

/**
 * @param {Object} o
 */
Exhibit.Coordinator._Listener.prototype.fire = function(o) {
    this._coordinator._fire(this, o);
};
