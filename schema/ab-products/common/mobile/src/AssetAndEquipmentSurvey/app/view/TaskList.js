Ext.define('AssetAndEquipmentSurvey.view.TaskList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'taskListPanel',

    config: {
        title: LocaleManager.getLocalizedString('Equipment Items',
            'AssetAndEquipmentSurvey.view.TaskList'),

        editViewClass: 'AssetAndEquipmentSurvey.view.TaskCarousel',

        surveyId: null,

        items: [
            {
                xtype: 'titlebar',
                items: [
                    {
                        xtype: 'search',
                        name: 'searchTasks',
                        align: 'left',
                        enableBarcodeScanning: true,
                        barcodeFormat: [{fields: ['eq_id', 'eq_std']},
                            {useDelimiter: true, fields: ['bl_id', 'fl_id', 'rm_id']}]
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'sortTasks',
                        isSortField: true,
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        align: Ext.os.is.Phone ? 'left' : 'right',
                        style: 'margin-left:10px;padding-left:10px',
                        options: [
                            {
                                displayValue: LocaleManager.getLocalizedString('Equipment',
                                    'AssetAndEquipmentSurvey.view.TaskList'),
                                objectValue: "equipment"
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('Location',
                                    'AssetAndEquipmentSurvey.view.TaskList'),
                                objectValue: "location"
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'taskList',
                flex: 1
            }
        ]
    },

    initialize: function () {
        var me = this,
            searchField = me.down('search'),
            sortField = me.down('selectlistfield');

        me.callParent();

        if (Ext.os.is.Phone) {
            searchField.setWidth('44%');
            sortField.setWidth('44%');
        }
    }
});