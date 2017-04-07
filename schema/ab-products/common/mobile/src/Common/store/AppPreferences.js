/**
 * Store for the Application Preferences
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 *
 */
Ext.define('Common.store.AppPreferences', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Common.model.AppPreference'],

    serverTableName: 'afm_activity_params',
    serverFieldNames: ['activity_id', 'param_id', 'param_value', 'applies_to'],
    inventoryKeyNames: ['activity_id', 'param_id'],

    config: {
        model: 'Common.model.AppPreference',
        storeId: 'appPreferencesStore',
        remoteFilter: true,
        disablePaging: true,
        enableAutoLoad: false, // Enabled after initial load in Common.Application
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('App Preferences', 'Common.store.AppPreferences'),
        restriction: [
            {
                tableName: 'afm_activity_params',
                fieldName: 'applies_to',
                operation: 'EQUALS',
                value: 'Mobile',
                relativeOperation : 'OR'
            },
            {
                tableName: 'afm_activity_params',
                fieldName: 'param_id',
                operation: 'EQUALS',
                value: 'BudgetCurrency',
                relativeOperation : 'OR'
            },
            {
                tableName: 'afm_activity_params',
                fieldName: 'param_id',
                operation: 'EQUALS',
                value: 'EditEstimationAndScheduling',
                relativeOperation : 'OR'
            },
            {
                tableName: 'afm_activity_params',
                fieldName: 'param_id',
                operation: 'EQUALS',
                value: 'EditEstAndSchedAfterStepComplete',
                relativeOperation : 'OR'
            },
            {
                tableName: 'afm_activity_params',
                fieldName: 'param_id',
                operation: 'EQUALS',
                value: 'UseWorkspaceTransactions',
                relativeOperation : 'OR'
            },
            {
                tableName: 'afm_activity_params',
                fieldName: 'param_id',
                operation: 'EQUALS',
                value: 'ConfirmationTime',
                relativeOperation: 'OR'
            }
        ],

        activityParameters: null
    },

    //initialize: function () {
    //    this.on('load', 'setParameters', this);
    //},

    /**
     * @private
     * Called internally when a Proxy has completed a load request.
     */
    onProxyLoad: function(operation) {
        var me = this,
            records = operation.getRecords(),
            resultSet = operation.getResultSet(),
            successful = operation.wasSuccessful();

        if (resultSet) {
            me.setTotalCount(resultSet.getTotal());
        }

        if (successful) {
            this.fireAction('datarefresh', [this, this.data, operation], 'doDataRefresh');
        }

        // Override - set paremeters immediately after loading.
        me.setParameters(me, records);

        me.loaded = true;
        me.loading = false;
        me.fireEvent('load', this, records, successful, operation);

        //this is a callback that would have been passed to the 'read' function and is optional
        Ext.callback(operation.getCallback(), operation.getScope() || me, [records, operation, successful]);
    },

    /**
     * Creates the activityParameters object when the store is loaded. The activityParameters provide an easy way to
     * look up a paramater value
     * @param store
     * @param records
     * @param success
     */
    setParameters: function (store, records, success) {
        var parameters = {};

        records.forEach(function (record) {
            var key = record.get('activity_id') + '-' + record.get('param_id');
            if (!parameters[key]) {
                parameters[key] = record.get('param_value');
            }
        });

        this.setActivityParameters(parameters);
    },

    /**
     * Gets the value of the activity parameter
     * @param {String} parameterId The combined activity id and parameter id. For example AbAssetManagement-EquipmentFieldsToSurvey.
     * @returns {String} Return the parameter value or null if the parameter does not exist.
     */
    getParameter: function(parameterId) {
        var me = this,
            activityParameters = me.getActivityParameters();

        if(activityParameters[parameterId]) {
            return activityParameters[parameterId];
        } else {
            return null;
        }
    }
});