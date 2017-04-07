Ext.Loader.setPath({
    'Common': '../Common',
    'Maintenance': 'app',
    'Floorplan': '../packages/Floorplan/src',
    //KB#3052029 Add Parts Storage Location map to the mobile application
    'Map': '../packages/Map/src'
});

Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings' ], function () {
    Ext.application({
        name: 'Maintenance',

        autoBackgroundDataSync: true,

        /**
         * Called during the application start up. Executes in place of the SynchronizationManager.doAutoSync
         * function.
         * @param {Function} onCompleted Executes when the sync operation is completed.
         * @param {Object} scope The scope to execute the onCompleted callback function.
         */
        backgroundSyncFn: function (onCompleted, scope) {
            var syncController = this.getApplication().getController('Maintenance.controller.WorkRequestSync');

            syncController.onStartSyncBackgroundData(onCompleted, scope);
        },

        requires: [
            'Maintenance.util.Constants',
            'Ext.field.DatePicker',
            'Common.control.field.DatePicker', // TODO use this class instead of Ext.field.DatePicker in all views
            'Ext.field.Spinner',
            'Common.control.field.TimePicker',
            'Common.control.Select',
            'Common.control.field.Number',
            'Common.control.Search',
            'Ext.field.Hidden',
            'Common.util.UserProfile',
            'Common.util.TableDef',
            'Common.control.FormHeader',
            'Common.control.button.Toolbar',
            'Common.control.field.TextPrompt',
            'Ext.Img',
            'Common.control.Spinner',
            'Common.plugin.ListPaging',
            'Common.control.field.Text',
            'Common.control.field.TextArea',
            // 21.3
            'Common.plugin.DataViewListPaging',
            'Maintenance.util.ApplicationParameters',
            'Maintenance.util.WorkRequestListUtil',
            'Maintenance.util.Constants',
            'Maintenance.util.NavigationUtil',
            'Maintenance.util.WorkRequestAction',
            'Maintenance.util.Ui',
            'Maintenance.util.WorkRequestCosts',
            'Maintenance.util.WorkRequestFilter',
            'Maintenance.util.FormUtil',
            'Common.control.field.Barcode',
            'Maintenance.util.StorageLocationMapUtil',
            'Map.component.SimpleMarker',
            'Map.component.ThematicMarker'
        ],

        views: [
            'WorkRequestCostEdit',
            'WorkRequestCostList',
            'WorkRequestPartEdit',
            'WorkRequestPartList',
            'WorkRequestCraftspersonEdit',
            'WorkRequestCraftspersonList',
            'WorkRequestList',
            'WorkRequestDocuments',
            'FloorPlan',
            'SiteMap',
            // 21.3
            'Maintenance.view.manager.WorkRequestManagerList',
            'Maintenance.view.manager.WorkRequestFilter',
            'Maintenance.view.manager.RequestDetails',
            'Maintenance.view.manager.ApproveForm',
            'Maintenance.view.manager.UpdateForm',
            'Maintenance.view.manager.ScheduleForm',
            'Maintenance.view.manager.ScheduleEstimateFormTrades',
            'Maintenance.view.manager.ScheduleFormCraftspersons',
            'Maintenance.view.manager.ScheduleFormTools',
            'Maintenance.view.manager.EstimateForm',
            'Maintenance.view.manager.EstimateFormParts',
            'Maintenance.view.manager.EstimateFormCosts',
            'Maintenance.view.manager.ApproveFormMultiple',
            'Maintenance.view.manager.ScheduleFormMultiple',
            'Maintenance.view.manager.WorkRequestSelection',
            'Maintenance.view.manager.EstimateFormMultiple',
            'Maintenance.view.manager.UpdateFormMultiple',
            'Floorplan.view.Redline',
            'Maintenance.view.manager.ForwardForm',
            'Maintenance.view.manager.ForwardFormMultiple',
            'Maintenance.view.manager.WRCraftspersonList',
            //KB#3050980 Add Maintenance workRequest references view
            'Maintenance.view.WorkRequestReferencesLists',
            'Maintenance.view.manager.AddPurchasedPartsToInventory',
            //KB#3052029 add Parts Storage Location map to the mobile application
            'Maintenance.view.manager.AddPartMap',
            //KB#3050226 add verify functionality to mobile maintenance module.
            'Maintenance.view.manager.VerifyForm',
            'Maintenance.view.manager.VerifyFormMultiple'
        ],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'WorkRequestNavigation',
            'WorkRequestDocuments',
            'WorkRequestSync',
            'WorkRequestForms',
            'FloorPlan',
            'SiteMap',
            // 21.3
            'Maintenance.controller.manager.WorkRequestListController',
            // 'Maintenance.controller.manager.WorkRequestActions', this class is loaded through WorkRequestActionsMultiple
            'Maintenance.controller.manager.WorkRequestActionsMultiple',
            'Maintenance.controller.Redline',
            'Maintenance.controller.manager.PartMap'
        ],

        stores: [
            'Common.store.Apps',
            'WorkRequests',
            'Buildings',
            'Common.store.Floors',
            'Common.store.FloorPrompt',
            'Common.store.Rooms',
            'Common.store.RoomPrompt',
            'Common.store.Causes',
            'Common.store.AppPreferences',
            'Common.store.Equipments',
            'Common.store.ProblemTypes',
            'WorkRequestCosts',
            'OtherResources',
            'WorkRequestParts',
            'Parts',
            'WorkRequestCraftspersons',
            'ProblemDescriptions',
            'Common.store.Sites',
            'Common.store.Employees',
            'Maintenance.store.manager.Craftspersons', // 21.3; 'Common.store.Craftspersons' for 21.2
            'Common.store.Buildings',
            'PmProcedures',
            'ProblemResolutions',
            'Common.store.RepairTypes',
            'Common.store.PlanTypes',
            'Floorplan.store.SiteDrawings',
            // 21.3
            'Maintenance.store.manager.DropDownButtons',
            'Maintenance.store.manager.CraftspersonWorkTeams',
            'Maintenance.store.manager.WorkTeams',
            'Common.store.Divisions',
            'Common.store.Departments',
            'Maintenance.store.manager.WorkRequestPrompt',
            'Common.store.EquipmentStandards',
            'Maintenance.store.manager.WorkRequestActions',
            'Maintenance.store.manager.Tools',
            'Maintenance.store.manager.WorkRequestTools',
            'Maintenance.store.manager.Trades',
            'Maintenance.store.manager.WorkRequestTrades',
            'Maintenance.store.manager.SupervisorEmployee',
            //KB#3050980 Add maintenance work request reference documents store
            'Maintenance.store.manager.WorkRequestReferences',
            //23.1
            'Maintenance.store.manager.StorageLocations',
            'Maintenance.store.manager.PartStorageLocations',
            'Floorplan.store.PublishDates',
            'Maintenance.store.Accounts',
            'Maintenance.store.manager.CraftspersonInPlannerWorkTeam',
            'Maintenance.store.manager.StorageLocationBuilding'
        ],

        profiles: [ 'Tablet', 'Phone' ]

    });

});
