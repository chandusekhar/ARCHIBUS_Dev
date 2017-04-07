Ext.define('ConditionAssessment.controller.Redline', {
    extend: 'Floorplan.controller.Redline',

    config: {
        refs: {
            mainView: 'mainview'
        },

        redlineHighlightParameters: [
            {
                view_file: "ab-con-assessment-itemxrm.axvw",
                hs_ds: "abCondAssessmentItemxRmHighlight",
                label_ds: 'abCondAssessmentItemxRmLabel',
                label_clr: 'gray',
                label_ht: '0.90'
            }
        ],

        redlineStoreId: 'conditionAssessmentsStore',

        documentField: 'doc4'
    }
});