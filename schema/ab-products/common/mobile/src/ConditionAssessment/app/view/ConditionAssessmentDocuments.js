Ext.define('ConditionAssessment.view.ConditionAssessmentDocuments', {
    extend: 'Common.view.DocumentList',

    xtype: 'conditionAssessmentDocumentsList',

    config: {
        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all',
                appName: 'ConditionAssessment'
            }
        ],
        enableImageRedline: true,
        store: 'conditionAssessmentsStore',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        }
    },


    /**
     * Used in parent class Common.view.DocumentList.
     * @param record
     * @returns Array with document fields information
     */
    getDocuments: function (record) {
        return record.getDocumentFieldsAndData();
    }
});