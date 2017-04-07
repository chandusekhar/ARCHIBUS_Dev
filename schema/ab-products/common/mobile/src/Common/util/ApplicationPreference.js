/**
 * Manages access to the Application Preferences.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.ApplicationPreference', {
    singleton: true,

    /**
     * Returns the application preference for the provided parameter code.
     *
     * @param {String} parameterCode The parameter id of the parameter to retrieve.
     * @return {String} The Application Preference value.
     * @throws {Error} Throws an exception if the Application Preferences store is not found of the
     * store has not been loaded.
     */
    getApplicationPreference: function (parameterCode) {
        var preferencesStore = Ext.getStore('appPreferencesStore'),
            preferenceValue = null,
            preferencesRecord;

        // Throw an error if the Application Preferences are not available to read.
        if (!preferencesStore || !preferencesStore.isLoaded()) {
            if (parameterCode === 'StoreMobilDocsAndPlansInDeviceDb') {
                return 0;    // Default to saving documents in the file system
            } else {
                throw new Error(LocaleManager.getLocalizedString('The Application Preferences have not been loaded', 'Common.util.ApplicationPreference'));
            }
        }

        preferencesRecord = preferencesStore.findRecord('param_id', parameterCode, 0, false, false, true);

        if (preferencesRecord) {
            preferenceValue = preferencesRecord.get('param_value');
        }

        return preferenceValue;
    },

    /**
     * Maps the server side table name to the Application Preferences parameter id (param_id).
     *
     * @param {String} serverSideTable Name of the server side table to retrieve the list of visible fields for.
     */
    getVisibleFields: function (serverSideTable) {
        // Map the server side table name to the Application Preference
        var visibleFields;

        switch (serverSideTable) {
            case 'eq_audit':
                visibleFields = this.getApplicationPreference('EquipmentFieldsToSurvey');
                break;
            default:
                visibleFields = '';
        }

        return visibleFields;
    }
});