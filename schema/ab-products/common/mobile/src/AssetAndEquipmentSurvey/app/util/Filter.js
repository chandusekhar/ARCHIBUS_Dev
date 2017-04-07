Ext.define('AssetAndEquipmentSurvey.util.Filter', {
    singleton: true,

    /**
     * Filter store by fields from list with values from recod.
     * @param storeId store name
     * @param fieldsList array with field names
     * @param record contains filtering values
     * @param [callbackFn] function exectuted after loading
     * @param [scope] the scope of callbackFn
     */
    filterAndLoadStore: function (storeId, fieldsList, record, callbackFn, scope) {
        var me = this,
            store = Ext.getStore(storeId),
            index, fieldName;

        if (store && record) {
            store.clearFilter();
            for (index = 0; index < fieldsList.length; index++) {
                fieldName = fieldsList[index];
                if (record.get(fieldName)) {
                    store.filter(fieldName, record.get(fieldName));
                }
            }
            store.load(callbackFn, scope || me);
        }
    },

    /**
     * Compose the filter array for fields in the list with values from the record.
     * @param fieldsList array with field names
     * @param record contains filtering values
     * @return {Array} filters array
     */
    getFilterArrayForFields: function (fieldsList, record) {
        var filterArray = [],
            index,
            fieldName,
            value,
            filter;

        if (record) {
            for (index = 0; index < fieldsList.length; index++) {
                fieldName = fieldsList[index];
                value = record.get(fieldName);
                if (!Ext.isEmpty(value)) {
                    filter = Ext.create('Common.util.Filter', {
                        property: fieldName,
                        value: value,
                        conjunction: 'AND',
                        exactMatch: true
                    });
                    filterArray.push(filter);
                }
            }
        }

        return filterArray;
    },

    filterTaskList: function (surveyId, callbackFn, scope) {
        var me = this,
            taskListStore = Ext.getStore('surveyTasksStore'),
            taskFloorsStore = Ext.getStore('taskFloorsStore');

        taskListStore.clearFilter();
        taskListStore.filter('survey_id', surveyId);
        taskListStore.loadPage(1, function () {
            taskFloorsStore.clearFilter();
            taskFloorsStore.filter('survey_id', surveyId);
            taskFloorsStore.loadPage(1, function () {
                Ext.callback(callbackFn, scope || me);
            });
        }, me);
    }
});