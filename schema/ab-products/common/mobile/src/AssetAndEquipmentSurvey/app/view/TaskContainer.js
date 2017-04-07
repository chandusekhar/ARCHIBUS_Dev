Ext.define('AssetAndEquipmentSurvey.view.TaskContainer', {
    extend: 'Ext.Container',

    xtype: 'taskContainer',

    config: {
        title: LocaleManager.getLocalizedString('Equipment Items', 'AssetAndEquipmentSurvey.view.TaskContainer'),

        editViewClass: 'AssetAndEquipmentSurvey.view.Task',

        layout: 'vbox',

        surveyId: null,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                action: 'syncSurveyItems',
                align: 'right',
                iconCls: 'refresh',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                text: Ext.os.is.Phone ? LocaleManager.getLocalizedString('Complete', 'AssetAndEquipmentSurvey.view.TaskContainer') :
                    LocaleManager.getLocalizedString('Complete Survey', 'AssetAndEquipmentSurvey.view.TaskContainer'),
                action: 'completeEquipmentSurvey',
                displayOn: 'all',
                align: 'right',
                ui: 'action',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'add',
                action: 'addSurveyTask',
                displayOn: 'all',
                align: 'right',
                hidden: true
            }
        ],

        items: [
            {
                xtype: 'taskListPanel',
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
                        width: Ext.os.is.Phone ? '90%' : '50%',
                        defaults: {
                            width: '50%',
                            labelWidth: '100%'
                        },
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('List', 'AssetAndEquipmentSurvey.view.TaskContainer'),
                                itemId: 'taskList'

                            },
                            {
                                text: LocaleManager.getLocalizedString('Floor Plan', 'AssetAndEquipmentSurvey.view.TaskContainer'),
                                itemId: 'floorPlan'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    applyRecord: function (record) {
        if (record) {
            this.setSurveyId(record.get('survey_id'));
        }

        return record;
    }

});