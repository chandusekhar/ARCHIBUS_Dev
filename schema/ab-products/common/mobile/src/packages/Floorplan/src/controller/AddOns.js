/*
 * Main controller for mobile add-on components:
 * 
 * Marker
 * Cluster
 */
Ext.define('Floorplan.controller.AddOns', {
    extend: 'Ext.app.Controller',

    /**
     * add-on config, varies based on the add-on type.
     */
    config: {},

    /**
     * map of registered add-ons.
     */
    registeredAddOns: {},

    /**
     * reference to drawingController
     */
    drawingController: null,

    /**
     * construct and initialize the drawing controller.
     */
    constructor: function (config, drawingController) {
        this.config = config;
        this.drawingController = drawingController;
        this.registeredAddOns = {};
    },

    setAddOns: function (addOnsConfig) {
        var key;
        for (key in addOnsConfig) {
            if (addOnsConfig.hasOwnProperty(key)) {
                this.config.addOnsConfig[key] = addOnsConfig[key];
                this.registerAddOn(key);
            }
        }
    },

    registerAddOn: function (addOnId) {
        var AddOn = this.getAddOnConstructorById(addOnId),
            addOnConfig = (this.config.addOnsConfig ? this.config.addOnsConfig[addOnId] : null),
            registeredAddOn;

        if (typeof (AddOn) !== 'undefined' && AddOn !== null && typeof (addOnConfig) !== 'undefined' && addOnConfig !== null) {
            registeredAddOn = new AddOn(this.propagateConfig(addOnId, addOnConfig));

            //set drawing controller if setDrawingController() is defined in add on class.
            if (typeof registeredAddOn.setDrawingController === 'function') {
                registeredAddOn.setDrawingController(this.drawingController);
            }

            this.registeredAddOns[addOnId] = registeredAddOn;
        }
    },


    /**
     * adds drawing control's root config to the addOnConfig
     */
    propagateConfig: function (addOnId, addOnConfig) {
        var key;
        if (addOnId === 'DatasourceSelector') {
            return this.config;
        } else {
            for (key in this.config) {
                if (this.config.hasOwnProperty(key) && (typeof key !== 'function') && (key !== 'addOnsConfig') && !(typeof (addOnConfig[key]) !== 'undefined' && addOnConfig[key] != null)) {
                    addOnConfig[key] = this.config[key];
                }
            }
            return addOnConfig;
        }
    },

    getAddOn: function (addOnId) {
        return this.registeredAddOns[addOnId];
    },

    removeAddOn: function (addOnId) {
        delete this.registeredAddOns[addOnId];
    },

    getAddOnConstructorById: function (addOnId) {
        var addOnConstructor = null;

        switch (addOnId) {
            case 'Cluster':
                addOnConstructor = ClusterControl;
                break;

            case 'Marker':
                addOnConstructor = Floorplan.controller.Marker;
                break;
        }

        return addOnConstructor;
    }
});