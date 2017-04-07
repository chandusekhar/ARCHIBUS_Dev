Ext.define('ConditionAssessment.view.AssessmentProjectContainer', {
    extend: 'Ext.Container',

    xtype: 'projectContainer',

    config: {
        title: LocaleManager.getLocalizedString('Assessment Items',
            'ConditionAssessment.view.AssessmentProjectContainer'),

        editViewClass: 'ConditionAssessment.view.ConditionAssessment',

        layout: 'vbox',

        projectId: null,

        items: [
            {
                xtype: 'conditionAssessmentListPanel',
                flex: 1
            },
            {
                xtype: 'floorPlanList',
                flex: 1,
                hidden: true
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('List',
                                    'ConditionAssessment.view.AssessmentProjectContainer'),
                                itemId: 'assessmentList',
                                width: '135px'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Floor Plan',
                                    'ConditionAssessment.view.AssessmentProjectContainer'),
                                itemId: 'floorPlan',
                                width: '135px'
                            }
                        ]
                    }
                ]
            }
        ]
    }

});