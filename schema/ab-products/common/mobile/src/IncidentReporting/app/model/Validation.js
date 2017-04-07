/**
 * The IncidentReporting.model.Validation class registers the custom validation function used in the Incident Reporting application.
 */
Ext.define('IncidentReporting.model.Validation', {

    requires: 'Ext.data.Validations',

    singleton: true,

    constructor: function () {
        this.initialize();
    },

    initialize: function () {
        Ext.apply(Ext.data.Validations, {
            personNameInserted: function (config, fieldValues) {
                var emId = fieldValues[0],
                    contactId = fieldValues[1],
                    nonEmName = fieldValues[2];

                if (!emId && !contactId && !nonEmName) {
                    return false;
                }

                return !((emId && contactId) || (emId && nonEmName) || (contactId && nonEmName));
            }

        });

        Ext.apply(Ext.data.Validations, {
            witnessTypeMatch: function (config, fieldValues) {
                var witnessType = fieldValues[0],
                    emId = fieldValues[1],
                    contactId = fieldValues[2],
                    nonEmName = fieldValues[3];

                if (!emId && !contactId && !nonEmName) {
                    return false;
                }

                if ((emId && contactId) || (emId && nonEmName) || (contactId && nonEmName)) {
                    return false;
                }

                if (witnessType === "Employee") {
                    // if Employee Type selected, the employee name should be entered and
                    //the non employee name and contact should be empty
                    return( emId && !nonEmName && !contactId );
                } else {
                    // if Non-Employee Type selected, the employee name should be empty
                    //and one of the non employee name and contact should be entered
                    return(!emId && (nonEmName || contactId));
                }
            }

        });

        Ext.apply(Ext.data.Validations, {
            dateInFuture: function (config, fieldValues) {
                var fieldDate = fieldValues[0];

                return !(fieldDate && fieldDate > new Date());
            }

        });
    }
});