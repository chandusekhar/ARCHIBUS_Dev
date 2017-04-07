/*
 This file is generated and updated by Sencha Cmd. You can edit this file as
 needed for your application, but these edits will have to be merged by
 Sencha Cmd when it performs code generation tasks such as generating new
 models, controllers or views and when running "sencha app upgrade".

 Ideally changes to this file would be limited and most work would be done
 in other places (such as Controllers). If Sencha Cmd cannot merge your
 changes and its generated code, it will produce a "merge conflict" that you
 will need to resolve manually.
 */

Ext.Loader.setPath({
    'Ext': '../touch/src',
    'Common': '../Common',
    'MaterialInventory': 'app',
    'Space': '../packages/Space/src',
    'Floorplan': '../packages/Floorplan/src'
});

Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings' ], function () {
    Ext.application({
        name: 'MaterialInventory',

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
                syncController = me.getController('MaterialInventorySync');

            syncController.downloadSites(onCompleted, scope);
        },

        requires: [
            'Common.scripts.ScriptManager',
            'Common.service.drawing.Drawing',
            'Common.service.workflow.Workflow',
            'Common.store.proxy.SqliteView',
            'Common.document.DocumentManager',
            'Common.Session',
            'Common.store.proxy.SqliteView',
            'Common.util.TableDef',
            'Common.util.UserProfile',
            'Common.util.SynchronizationManager',
            'Common.util.Filter',
            'Common.util.Ui',
            'Common.util.RoomHighlight',
            'Common.util.RoomHighlightHelper',
            'Common.control.Camera',
            'Common.control.button.Toolbar',
            'Common.control.field.Barcode',
            'Common.control.field.Prompt',
            'Common.control.field.DatePicker',
            'Common.control.field.Calendar',
            'Common.control.Spinner',
            'Common.control.Select',
            'Common.control.button.Picker',
            'Common.control.prompt.Building',
            'Common.control.prompt.Floor',
            'Common.control.Search',
            'Common.plugin.ListPaging',
            'Common.plugin.DataViewListPaging',
            'Common.document.DocumentManager',
            'Ext.field.DatePicker',
            'Ext.field.Search',
            'Ext.field.Hidden',
            'Ext.SegmentedButton',
            'Ext.Img',
            'Space.Space',
            'Space.SpaceFloorPlan',
            'Space.SpaceDownload',
            'MaterialInventory.util.Ui',
            'MaterialInventory.util.Materials',
            'MaterialInventory.util.Filter',
            'MaterialInventory.util.AppMode',
            'MaterialInventory.control.BarcodePromptField',
            'MaterialInventory.control.BarcodePromptInput',
            'MaterialInventory.control.prompt.Room',
            'MaterialInventory.control.prompt.Aisle',
            'MaterialInventory.control.prompt.Cabinet',
            'MaterialInventory.control.prompt.Shelf',
            'MaterialInventory.control.prompt.Bin',
            'Common.control.config.DatePicker'
        ],

        views: [
            'Main',
            'MaterialInventory.view.space.SiteList',
            'MaterialInventory.view.space.Site',
            'MaterialInventory.view.space.SiteMap',
            'MaterialInventory.view.space.BuildingList',
            'MaterialInventory.view.space.FloorList',
            'MaterialInventory.view.space.RoomList',
            'MaterialInventory.view.space.FloorPlan',
            'MaterialInventory.view.space.AisleList',
            'MaterialInventory.view.space.CabinetList',
            'MaterialInventory.view.space.ShelfList',
            'MaterialInventory.view.space.BinList',
            'MaterialInventory.view.MaterialList',
            'MaterialInventory.view.MaterialForm',
            'MaterialInventory.view.Filter',
            'MaterialInventory.view.CalendarView',
            'MaterialInventory.view.prompt.RoomPromptList',
            'MaterialInventory.view.prompt.AislePromptList',
            'MaterialInventory.view.prompt.CabinetPromptList',
            'MaterialInventory.view.prompt.ShelfPromptList',
            'MaterialInventory.view.prompt.BinPromptList',
            'Common.view.panel.ProgressBar',
            'Floorplan.view.FloorPlan'
        ],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'MaterialInventorySync',
            'Materials',
            'Navigation'
        ],

        stores: [
            'Common.store.Apps',
            'Common.store.PlanTypes',
            'Common.store.PlanTypeGroups',
            'MaterialPlanTypes',
            'Floorplan.store.SiteDrawings',
            'MaterialInventory.store.space.MaterialSites',
            'MaterialInventory.store.space.MaterialBuildings',
            'MaterialInventory.store.space.MaterialFloors',
            'MaterialInventory.store.space.MaterialRooms',
            'MaterialInventory.store.space.MaterialAisles',
            'MaterialInventory.store.space.MaterialCabinets',
            'MaterialInventory.store.space.MaterialShelves',
            'MaterialInventory.store.space.MaterialBins',
            'MaterialInventory.store.MaterialData',
            'MaterialInventory.store.MaterialMsds',
            'MaterialInventory.store.MaterialLocations',
            'MaterialInventory.store.prompt.ContainerCategories',
            'MaterialInventory.store.prompt.ContainerTypes',
            'MaterialInventory.store.prompt.Manufacturers',
            'MaterialInventory.store.prompt.GhsIdentifiers',
            'MaterialInventory.store.prompt.Custodians',
            'MaterialInventory.store.prompt.MaterialEmployees',
            'MaterialInventory.store.prompt.CustodianEmployees',
            'MaterialInventory.store.prompt.EditUsers',
            'MaterialInventory.store.prompt.MaterialUnits',
            'MaterialInventory.store.prompt.PressureUnits',
            'MaterialInventory.store.prompt.MaterialChemicals',
            'MaterialInventory.store.prompt.MaterialConstituents',
            'MaterialInventory.store.prompt.Tier2Values',
            'MaterialInventory.store.space.BuildingsWithMaterials',
            'MaterialInventory.store.space.FloorsWithMaterials',
            'MaterialInventory.store.space.RoomsWithMaterials',
            'MaterialInventory.store.space.AislesWithMaterials',
            'MaterialInventory.store.space.CabinetsWithMaterials',
            'MaterialInventory.store.space.ShelvesWithMaterials',
            'MaterialInventory.store.space.BinsWithMaterials',
            'MaterialInventory.store.Actions',
            'Floorplan.store.PublishDates'
        ],

        launch: function () {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('MaterialInventory.view.Main'));
        }
    });
});
