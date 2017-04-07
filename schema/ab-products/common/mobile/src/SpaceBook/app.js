Ext.Loader.setPath({
    'Ext': '../touch/src',
    'SpaceBook': 'app',
    'Common': '../Common',
    'Space': '../packages/Space/src',
    'Floorplan': '../packages/Floorplan/src'
});

Ext.require(['Common.scripts.ApplicationLoader', 'Common.Application', 'Common.lang.ComponentLocalizer',
    'Common.lang.LocalizedStrings'], function () {
    Ext.application({
        name: 'SpaceBook',

        /**
         * @property {Boolean} autoBackgroundDataSync Enables the
         *           framework auto background data sync.
         */
        autoBackgroundDataSync: true,

        /**
         * Called during the application start up. Executes in place of
         * the SynchronizationManager.doAutoSync function.
         *
         * @param {Function} onCompleted Executed when the sync operation is completed.
         * @param {Object} scope The scope to execute the onCompleted callback function.
         */
        backgroundSyncFn: function (onCompleted, scope) {
            SpaceBook.util.Ui.applyUserGroupsOnStartUp(onCompleted, scope);
        },

        requires: [
            'Common.util.TableDef',
            'Common.util.Units',
            'Common.util.Ui',
            'Common.util.UserProfile',
            'Common.util.RoomHighlight',
            'Common.plugin.ListPaging',
            'Common.plugin.DataViewListPaging',
            'Common.document.DocumentManager',
            'Common.control.field.Text',
            'Common.control.field.TextArea',
            'Common.control.button.Picker',
            'Common.control.Search',
            'Common.view.DocumentItem',
            'Ext.SegmentedButton',
            'Ext.Img',
            'Ext.Toolbar',
            'Ext.field.Search',
            'Space.Space',
            'Space.SpaceDownload',
            'Space.SpaceFloorPlan',
            'Space.SpaceSurvey',
            'SpaceBook.util.Ui',
            'SpaceBook.util.SurveyState'
        ],

        stores: [
            'Common.store.Apps',
            'Common.store.Rooms',
            'Common.store.Employees',
            'Common.store.Divisions',
            'Common.store.Departments',
            'Common.store.RoomCategories',
            'Common.store.RoomTypes',
            'Common.store.RoomUses',
            'Common.store.RoomStandards',
            'Common.store.PlanTypes',
            'Common.store.PlanTypeGroups',
            'SpaceBook.store.SpaceBookPlanTypes',
            'Space.store.Sites',
            'Space.store.Buildings',
            'Space.store.Floors',
            'Floorplan.store.SiteDrawings',
            'Space.store.SpaceSurveys',
            'Space.store.RoomSurveys',
            'Space.store.BuildingFloors',
            'Space.store.UserGroups',
            'Space.store.SurveyActions',
            'Space.store.DownloadActions',
            'Floorplan.store.PublishDates'
        ],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'Navigation',
            'FloorPlan',
            'Survey',
            'Download',
            'Documents',
            'Redline'
        ],

        views: [
            'Space.view.Main',
            'Space.view.SiteList',
            'Space.view.BuildingList',
            'Space.view.FloorList',
            'Space.view.FloorPlan',
            'Space.view.Site',
            'Space.view.SiteListItem',
            'Space.view.SiteMap',
            'Space.view.FloorListItem',
            'Space.view.StartSurvey',
            'Space.view.RoomList',
            'Common.view.panel.ProgressBar',
            'Common.view.navigation.ViewSelector',
            'RoomSurvey',
            'DocumentList',
            'Floorplan.view.Redline',
            'Space.view.RoomSurveyPromptList'
        ],

        launch: function () {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('Space.view.Main'));
        }

    });
});
