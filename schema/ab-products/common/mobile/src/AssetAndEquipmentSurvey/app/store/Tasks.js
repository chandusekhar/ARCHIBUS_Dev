Ext.define('AssetAndEquipmentSurvey.store.Tasks', {
    extend: 'Common.store.sync.PagedSyncStore',
    requires: 'AssetAndEquipmentSurvey.model.Task',

    serverTableName: 'eq_audit',
    serverFieldNames: [
        'survey_id',
        'eq_id',
        'num_serial',
        'bl_id',
        'fl_id',
        'rm_id',
        'dv_id',
        'dp_id',
        'em_id',
        'status',
        'eq_std',
        'marked_for_deletion',
        'mob_is_changed',
        'mob_locked_by',
        'transfer_status',
        'site_id',
        'survey_comments',
        'date_last_surveyed',
        'survey_photo_eq',
        'survey_redline_eq'
    ],

    inventoryKeyNames: [ 'survey_id', 'eq_id' ],

    config: {
        model: 'AssetAndEquipmentSurvey.model.Task',
        storeId: 'surveyTasksStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        dynamicModel: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        },
        documentTable: 'eq_audit',
        documentTablePrimaryKeyFields: ['survey_id', 'eq_id'],
        tableDisplayName: LocaleManager.getLocalizedString('Tasks', 'AssetAndEquipmentSurvey.store.Tasks')
    },


    /**
     * @override. Only get changed records that have an associated survey record
     * Gets from records from the store where the mob_is_changed value is equal to 1.
     * @private
     */
    getChangedOnMobileRecords: function () {
        var me = this,
            paging = me.getDisablePaging();

        return new Promise(function(resolve) {
            // filter records with Changed on Mobile? = Yes
            // Setting the remote filter so that the store retrieves all of the
            // records from the mobile database
            // This will handle the case where there are modified records that are
            // not in the current page.

            me.clearFilter();
            me.filter('mob_is_changed', 1);
            // get filtered records from records loaded into the store

            // Disable paging so we can be sure that we retrieve all of the records
            me.setDisablePaging(true);

            me.load(function (records) {
                me.clearFilter();
                // Reset the store page size
                me.setDisablePaging(paging);
                // Filter the records
                me.filterTaskRecordsBySurvey(records, function (filteredRecords) {
                    resolve(filteredRecords);
                }, me);
            }, me);
        });


    },

    /**
     * Returns an array of survey id's in the client database
     * @private
     * @param onCompleted
     * @param scope
     */
    getSurveyIds: function (onCompleted, scope) {
        var me = this,
            surveyStore = Ext.getStore('surveysStore'),
            surveyIds = [];

        surveyStore.retrieveAllStoreRecords(null, function (records) {
            Ext.each(records, function (record) {
                surveyIds.push(record.data.survey_id);
            }, me);
            Ext.callback(onCompleted, scope || me, [surveyIds]);
        }, me);
    },

    /**
     * Filters the changed on mobile records to only include records that have a corresponding
     * survey record in the client datase. This prevents errors when uploading Task records
     * that do not have a server side eq_audit record. This situation occurs when surveys
     * are deleted from the Web Central interface.
     * @param records
     * @param onCompleted
     * @param scope
     */
    filterTaskRecordsBySurvey: function (records, onCompleted, scope) {
        var me = this,
            filteredRecords = [];

        me.getSurveyIds(function (ids) {
            var surveyIds = ids;
            Ext.each(records, function (record) {
                var surveyId = record.get('survey_id');
                if (Ext.Array.contains(surveyIds, surveyId)) {
                    filteredRecords.push(record);
                }
            }, me);
            Ext.callback(onCompleted, scope || me, [filteredRecords]);
        }, me);
    }
});
