Ext.Loader.setPath({
    'Ext': '../touch/src',
    'Common': '../Common',
    'AssetAndEquipmentSurvey': 'app',
    'Floorplan': '../packages/Floorplan/src'
});


Ext.require(['Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings'], function () {
    Ext.application({
        name: 'AssetAndEquipmentSurvey',
        /**
         * @property {Boolean} autoBackgroundDataSync Enables the framework auto background data sync.
         */
        autoBackgroundDataSync: true,

        /**
         * Called during the application start up. Executes in place of the SynchronizationManager.doAutoSync
         * function.
         * @param {Function} onCompleted Executes when the sync operation is completed.
         * @param {Object} scope The scope to execute the onCompleted callback function.
         */
        backgroundSyncFn: function (onCompleted, scope) {
            var me = this,
                syncController = me.getController('AssetAndEquipmentSurveySync');

            syncController.doAutoBackgroundSync(onCompleted, scope);
        },

        requires: [
            'Ext.field.Search',
            'Ext.field.DatePicker',
            'Ext.SegmentedButton',
            'Ext.Img',
            'Common.scripts.ScriptManager',
            'Common.service.drawing.Drawing',
            'Common.service.workflow.Workflow',
            'Common.document.DocumentManager',
            'Common.store.proxy.SqliteView',
            'Common.util.TableDef',
            'Common.util.UserProfile',
            'Common.util.Filter',
            'Common.util.Ui',
            'Common.plugin.ListPaging',
            'Common.control.field.Prompt',
            'Common.control.field.Text',
            'Common.control.Select',
            'Common.control.Search',
            'Common.control.field.Barcode',
            'Common.control.field.Document',
            'Common.control.button.Toolbar',
            'Common.control.prompt.Site',
            'Common.control.prompt.Building',
            'Common.control.prompt.Floor',
            'Common.control.prompt.Room',
            'Common.control.prompt.Division',
            'Common.control.prompt.Department',
            'Common.control.prompt.Employee',
            'Common.control.Camera',
            'Common.view.navigation.ViewSelector',
            'Common.view.DocumentItem',
            'Common.view.DocumentList',
            'AssetAndEquipmentSurvey.util.RoomHighlight',
            'AssetAndEquipmentSurvey.util.Filter',
            'AssetAndEquipmentSurvey.util.Ui',
            'Common.control.field.DatePicker'
        ],

        views: [
            'Main',
            'SurveyList',
            'Task',
            'TaskList',
            'FloorPlan',
            'FloorPlanList',
            'TaskContainer',
            'RoomTaskList',
            'TaskDocuments',
            'TaskCarousel',
            'Floorplan.view.Redline',
            'SurveyTaskList',
            'Floorplan.view.FloorPlan'
        ],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'AssetAndEquipmentSurveySync',
            'Navigation',
            'FloorPlan',
            'Documents',
            'AssetAndEquipmentSurvey.controller.Redline'
        ],


        stores: [
            'Common.store.Apps',
            'Common.store.Sites',
            'Common.store.Buildings',
            'Common.store.Floors',
            'Common.store.Rooms',
            'Surveys',
            'Tasks',
            'AssetAndEquipmentSurvey.store.Employees',
            'Common.store.Divisions',
            'Common.store.Departments',
            'TaskFloors',
            'TaskRooms',
            'Common.store.EquipmentStandards',
            'Common.store.FloorPrompt',
            'Common.store.RoomPrompt',
            'Floorplan.store.PublishDates'
        ],


        launch: function () {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('AssetAndEquipmentSurvey.view.Main'));
        }
    });
});
