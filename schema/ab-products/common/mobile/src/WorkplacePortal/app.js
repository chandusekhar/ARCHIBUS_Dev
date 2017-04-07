Ext.Loader.setPath({
    'Ext' : '../touch/src',
    'Common' : '../Common',
    'WorkplacePortal' : 'app',
    'Space': '../packages/Space/src',
    'Floorplan': '../packages/Floorplan/src'
});


Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings' ], function () {
    Ext.application({
        name: 'WorkplacePortal',

        autoBackgroundDataSync: true,

        /**
         * Called during the application start up. Executes in place of the SynchronizationManager.doAutoSync
         * function.
         * @param {Function} onCompleted Executes when the sync operation is completed.
         * @param {Object} scope The scope to execute the onCompleted callback function.
         */
        backgroundSyncFn: function (onCompleted, scope) {
            WorkplacePortal.util.SyncHelper.syncServiceDeskRequests('', onCompleted, scope);
        },

        requires: [
            'Ext.Img',
            'Ext.field.Search',
            'Ext.SegmentedButton',
            'Common.plugin.ListPaging',
            'Common.plugin.DataViewListPaging',
            'Common.control.prompt.Site',
            'Common.control.prompt.Building',
            'Common.control.prompt.Floor',
            'Common.control.prompt.Room',
            'Common.control.prompt.RoomStandard',
            'Common.control.prompt.Division',
            'Common.control.prompt.Department',
            'Common.control.prompt.Employee',
            'Common.control.prompt.ProblemType',
            'Common.control.field.TextPrompt',
            'Common.control.field.Text',
            'Common.control.field.Prompt',
            'Common.control.field.TextArea',
            'Common.control.field.TimePicker',
            'Common.control.field.Calendar',
            'Common.control.Select',
            'Common.control.Search',
            'Common.control.config.TimePicker',
            'Common.control.Spinner',
            'Common.control.TitlePanel',
            'Common.control.button.Picker',
            'Common.view.navigation.ViewSelector',
            'Common.util.UserProfile',
            'Space.SpaceFloorPlan',
            'Space.Space',
            'Common.util.Ui',
            'Common.util.Units',
            'WorkplacePortal.util.PlansHighlight',
            'WorkplacePortal.util.Ui',
            'WorkplacePortal.util.NavigationHelper',
            'WorkplacePortal.util.SyncHelper',
            'WorkplacePortal.util.Hoteling',
            'WorkplacePortal.util.Reservation',
            'WorkplacePortal.util.ServiceDeskRequest',
            'WorkplacePortal.util.Filter',
            'Common.device.Contact',
            'Floorplan.view.FloorPlan',
            'Common.control.field.DatePicker',
            'Common.control.field.Document',
            'Common.control.Camera'
        ],

        views: [
            'Main',
            'WorkplaceServicesList',
            'ServiceRequestList',
            'FacilityInformationList',
            'ServiceDeskRequestList',
            'ServiceDeskRequestForm',
            'ReservationList',
            'ReservationSearchForm',
            'ReservationSearchResult',
            'ReservationSearchConfirm',
            'RoomResourceList',
            'ReservationEmployeeList',
            'HotelingList',
            'HotelingSearchForm',
            'HotelingSearchConfirm',
            'FloorPlan',
            'RoomList',
            'LocateRoom',
            'LocateEmployee',
            'Space.view.SiteList',
            'Space.view.SiteListItem',
            'Space.view.BuildingList',
            'Space.view.FloorList',
            'Space.view.FloorListItem',
            'Space.view.Site',
            'Space.view.SiteMap',
            'Common.view.panel.ProgressBar',
            'Space.SpaceDownload',
            'ReservationAttendees',
            'ReservationDetailsForm',
            'WorkplacePortal.view.FilterReservations',
            'WorkplacePortal.view.ServiceDeskDocuments',
            'Floorplan.view.Redline',
            'Common.view.registration.Registration'
        ],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'WorkplacePortalSync',
            'Navigation',
            'FloorPlan',
            'Space.controller.Download',
            'WorkplacePortal.controller.Documents',
            'WorkplacePortal.controller.Redline'
        ],

        stores: [
            'Common.store.Sites', //keep 'Common.store.Sites' because it is used by site prompt fields. Can't use 'Space.store.Sites' instead because it contains the record 'Buildings Without a Site Assigned' used in navigation lists.
            'Common.store.Rooms',
            'Common.store.RoomCategories',
            'Common.store.RoomStandards',
            'Common.store.RoomTypes',
            'Common.store.Divisions',
            'Common.store.Departments',
            'Common.store.Employees',
            'Common.store.Craftspersons',
            'Common.store.PlanTypes',
            'Common.store.ProblemTypes',
            'FacilityServicesMenus',
            'MobileMenus',
            'ServiceDeskRequests',
            'Reservations',
            'ReservationRooms',
            'UserReservationRooms',
            'RoomArrangeTypes',
            'HotelingRequests',
            'WorkspaceTransactions',
            'HotelingBookings',
            'EmployeeFirstNames',
            'EmployeeLastNames',
            'RoomPrompt',
            'FloorPrompt',
            'DepartmentBuildings',
            'DepartmentFloors',
            'Space.store.Sites',
            'Space.store.Buildings',
            'Space.store.Floors',
            'Floorplan.store.SiteDrawings',
            'Space.store.BuildingFloors',
            'Space.store.SpaceRoomPrompt',
            'Space.store.EmployeesReport',
            'RoomResource',
            'ReservationEmployee',
            'RoomsInfoReport',
            'Floorplan.store.PublishDates',
            'Common.store.Apps'
        ],

        profiles: [ 'Tablet', 'Phone' ],

        launch: function () {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('WorkplacePortal.view.Main'));
        }
    });

});