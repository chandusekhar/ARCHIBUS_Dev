/**
 * The SpaceOccupancy.model.Validation class registers the custom validation function used in the Space and Occupancy Survey application.
 */
Ext.define('SpaceOccupancy.model.Validation', {

    requires: ['Ext.data.Validations'],

    singleton: true,

    constructor: function () {
        this.initialize();
    },

    initialize: function () {
        Ext.apply(Ext.data.Validations, {
            isNumericValue: function (config, fieldValue) {
                return Ext.isNumeric(fieldValue);
            },
            isBigEnoughPctSpace: function (config, fieldValue) {
                return fieldValue >= 0;
            },
            isSmallEnoughPctSpace: function (config, fieldValue) {
                return fieldValue <= 100;
            },
            isDateEndValid: function (config, fieldValues) {
                var dateStart = fieldValues[0],
                    dateEnd = fieldValues[1];

                if (!Ext.isEmpty(dateStart) && !Ext.isEmpty(dateEnd) && dateEnd <= dateStart) {
                    return false;
                } else {
                    return true;
                }
            }
        });
    }
});