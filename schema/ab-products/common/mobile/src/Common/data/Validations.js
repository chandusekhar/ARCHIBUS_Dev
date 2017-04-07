/**
 * Defines additional validation functions.
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.data.Validations', {
    requires : 'Ext.data.Validations',
    singleton : true,

    constructor : function() {
        this.initialize();
    },

    initialize: function() {

        Ext.apply(Ext.data.Validations, {
            maxvalue : function(config, fieldValues) {
                var maxValue = config.maxValue;
                if (Ext.isNumber(fieldValues)) {
                    return fieldValues <= maxValue;
                } else {
                    return true;
                }
            }
        });

        Ext.apply(Ext.data.Validations, {
            minvalue : function(config, fieldValues) {
                var minValue = config.minValue;
                if (Ext.isNumber(fieldValues)) {
                    return fieldValues >= minValue;
                } else {
                    return true;
                }
            }
        });
    }

});