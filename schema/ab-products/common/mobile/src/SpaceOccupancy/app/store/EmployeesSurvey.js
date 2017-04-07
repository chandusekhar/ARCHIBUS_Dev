Ext.define('SpaceOccupancy.store.EmployeesSurvey', {
    extend: 'Common.store.sync.PagedSyncStore',
    requires: ['SpaceOccupancy.model.EmployeeSurvey'],

    serverTableName: 'em_sync',

    serverFieldNames: [
        'survey_id',
        'em_id',
        'email',
        'bl_id',
        'fl_id',
        'rm_id',
        'phone',
        'name_last',
        'name_first',
        'em_number',
        'dv_id',
        'dp_id',
        'em_std',
        'em_photo',
        'mob_locked_by',
        'mob_is_changed'
    ],
    inventoryKeyNames: ['survey_id', 'em_id'],

    config: {
        model: 'SpaceOccupancy.model.EmployeeSurvey',
        storeId: 'employeesSyncStore',
        autoSync: true,
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Employees', 'SpaceOccupancy.store.EmployeesSurvey'),
        sorters: [
            {
                property: 'em_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        documentTable: 'em',
        documentTablePrimaryKeyFields: ['em_id']
    },

    /**
     * Override the syncStore method so that the restriction can be set for the survey_id
     * @returns {*|Object}
     */
    syncStore: function() {
      var me = this;

        me.setRestriction({
            tableName: 'em_sync',
                fieldName: 'survey_id',
                operation: 'EQUALS',
                value: SurveyState.getSurveyState().surveyId
        });

        return me.callParent();
    }


});