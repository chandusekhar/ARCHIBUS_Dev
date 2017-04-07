/**
 * The MaterialInventory.model.Validation class registers the custom validation function used in the Materials Inventory application.
 */
Ext.define('MaterialInventory.model.Validation', {

    requires: ['Ext.data.Validations'],

    singleton: true,

    constructor: function () {
        this.initialize();
    },

    initialize: function () {
        Ext.apply(Ext.data.Validations, {
            invalidDates: function (config, fieldValues) {
                var startDate = fieldValues[0],
                    endDate = fieldValues[1];

                if (Ext.isEmpty(startDate) || Ext.isEmpty(endDate)) {
                    return true;
                }

                return startDate <= endDate;
            }
        });
    }
});