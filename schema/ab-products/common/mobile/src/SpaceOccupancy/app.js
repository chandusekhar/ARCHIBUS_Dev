Ext.Loader.setPath({
    'Common': '../Common',
    'SpaceOccupancy': 'app',
    'Space': '../packages/Space/src',
    'Floorplan': '../packages/Floorplan/src'
});


Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application', 'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings' ], function () {
    Ext.application({
        name: 'SpaceOccupancy',

        requires: [
            'Common.util.TableDef',
            'Common.util.Units',
            'Ext.SegmentedButton',
            'Ext.Img',
            'Ext.Toolbar',
            'Ext.field.Search',
            'Common.plugin.ListPaging',
            'Common.util.Ui',
            'Space.Space',
            'Space.SpaceDownload',
            'Space.SpaceFloorPlan',
            'Space.SpaceSurvey',
            'Common.plugin.DataViewListPaging',
            'SpaceOccupancy.util.SurveyState',
            'SpaceOccupancy.util.RoomHighlight',
            'Ext.field.Hidden',
            'Ext.MessageBox',
            'Common.control.field.Text',
            'Common.control.button.Picker',
            'Common.control.prompt.Division',
            'Common.control.prompt.Department',
            'Common.control.prompt.Employee',
            'Common.control.prompt.EmployeeStandard',
            'Common.control.prompt.RoomCategory',
            'Common.control.prompt.RoomType',
            'Common.control.prompt.RoomStandard',
            'Common.view.DocumentItem',
            'SpaceOccupancy.view.TransactionList',
            'SpaceOccupancy.util.Ui',
            'SpaceOccupancy.util.Filters',
            'SpaceOccupancy.util.NavigationHelper',
            'Common.control.field.DatePicker',
            'Common.control.Search'
        ],

        stores: [
            'Common.store.Apps',
            'Common.store.Employees',
            'EmployeesSurvey',
            'Common.store.Divisions',
            'Common.store.Departments',
            'Rooms',
            'Common.store.RoomCategories',
            'Common.store.RoomTypes',
            'Common.store.RoomUses',
            'Common.store.RoomStandards',
            'Common.store.EmployeeStandards',
            'Space.store.Sites',
            'Space.store.Buildings',
            'Space.store.Floors',
            'Common.store.PlanTypes',
            'Common.store.PlanTypeGroups',
            'SpaceOccupancyPlanTypes',
            'Floorplan.store.SiteDrawings',
            'Space.store.SpaceSurveys',
            'OccupancyRoomSurveys',
            'RoomPcts',
            'EmployeeListStore',
            'DepartmentListStore',
            'CategoryListStore',
            'Space.store.BuildingFloors',
            'Space.store.RoomsReport',
            'Space.store.EmployeesReport',
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
            'Common.view.panel.ProgressBar',
            'RoomList',
            'RoomForm',
            'ListItem',
            'EmployeeList',
            'DepartmentList',
            'CategoryList',
            'RoomCarousel',
            'RoomSurvey',
            'Space.view.StartSurvey',
            'TransactionForm',
            'TransactionEdit',
            'TransactionCarousel',
            'EmployeeCarousel',
            'EmployeeEdit',
            'TransactionsReport',
            'Floorplan.view.Redline',
            'DocumentList',
            'Space.view.RoomSurveyPromptList',
            'SpaceOccupancy.view.EmployeePromptList'
        ],

        launch: function () {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('Space.view.Main'));
        }
    });
});

