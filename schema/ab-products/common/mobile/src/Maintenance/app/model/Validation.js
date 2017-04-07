/**
 * The Maintenance.model.Validation class registers the custom validation function used in the Work Request application.
 *
 * @author Jeff Martin
 * @since 21.1
 * @singleton
 */
Ext.define('Maintenance.model.Validation', {
    requires: ['Ext.data.Validations'],
    singleton: true,

    constructor: function () {
        this.initialize();
    },

    initialize: function () {

        Ext.apply(Ext.data.Validations, {
            craftspersonHours: function (/*config, fieldValues*/) {

                // do not restrict anymore, to allow the Start work button on the CF Edit form
                return true;
            }

        });

        Ext.apply(Ext.data.Validations, {
            craftspersonDates: function (config, fieldValues) {
                return Maintenance.model.Validation.datesValidation(config, fieldValues);
            }
        });

        Ext.apply(Ext.data.Validations, {
            toolDates: function (config, fieldValues) {
                return Maintenance.model.Validation.datesValidation(config, fieldValues);
            }
        });

        Ext.apply(Ext.data.Validations, {
            buildingRequired: function (config, fieldValues) {
                var blId = fieldValues[0],
                    probType = fieldValues[1];

                if (Ext.isEmpty(blId) && (Ext.isEmpty(probType) || (!Ext.isEmpty(probType) && probType !== 'PREVENTIVE MAINT'))) {
                    return false;
                } else {
                    return true;
                }
            }
        });
    },

    datesValidation: function (config, fieldValues) {
        var dateStart,
            dateEnd;
        // This calculation is dependent on the fieldValues being in the
        // correct order. This should be changed to something more robust.

        // DateStart - 0
        // TimeStart - 1
        // DateEnd - 2
        // TimeEnd - 3

        // Date Start and Time Start are empty
        if (fieldValues[0] === null && fieldValues[3] === null) {
            return true;
        }

        // Date Start is populated and Date End is empty
        if (fieldValues[0] !== null && fieldValues[2] === null) {
            return true;
        }

        dateStart = Maintenance.model.Validation.combineDates(fieldValues[0], fieldValues[1]);
        dateEnd = Maintenance.model.Validation.combineDates(fieldValues[2], fieldValues[3]);

        return dateStart <= dateEnd;
    },

    combineDates: function (date, time) {
        var returnValue;

        if (date === null || time === null) {
            returnValue = date;
        } else {
            returnValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
        }

        return returnValue;
    }

});