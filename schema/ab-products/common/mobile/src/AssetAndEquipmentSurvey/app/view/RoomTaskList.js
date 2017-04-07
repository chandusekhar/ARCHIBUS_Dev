Ext.define('AssetAndEquipmentSurvey.view.RoomTaskList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'roomTaskListPanel',

    config: {
        editViewClass: 'AssetAndEquipmentSurvey.view.Task',
        roomCodes: null,

        title: LocaleManager.getLocalizedString('Tasks for Room', 'AssetAndEquipmentSurvey.view.RoomTaskList'),
        items: [
            {
                xtype: 'taskList',
                flex: 1
            }
        ]
    }
});