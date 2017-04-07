Ext.Loader.setPath({
    'Common': '../Common',
    'Solutions': 'app',
    'Questionnaire': '../packages/Questionnaire/src',
    'Space': '../packages/Space/src',
    'Floorplan': '../packages/Floorplan/src',
    'Map': '../packages/Map/src'
});

Ext.require(['Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings'], function () {

    Ext.application({
        name: 'Solutions',

        requires: 'Common.document.DocumentManager',

        /**
         * @property {Boolean} autoBackgroundDataSync Enables the framework auto background data sync.
         */
        autoBackgroundDataSync: true,

        views: [
            'Demo',
            'DemoList',
            'CameraButton',
            'CameraDocument',
            'CameraForm',
            'CustomValidation',
            'DownloadValidatingTable',
            'LocateAsset',
            'NavigationView',
            'NavigationListView',
            'Marker',
            'PanZoom',
            'PhotoPanel',
            'Placement',
            'ProgressBar',
            'PromptCommon',
            'PromptConfigure',
            'PromptHierarchical',
            'PromptFriendlyValues',
            'Solutions.view.PromptBarcode',
            'Redline',
            'SyncTransactionTable',
            'TextPrompt',
            'SourceOverlay',
            'Validation',
            'ViewSelector',
            'ViewSelectorPanel',
            'Barcode',
            'SearchBarcode',
            'PhoneEmailField',
            'Solutions.view.Questionnaire',
            'Floorplan.view.FloorPlan',
            'Calendar',
            'CalendarView',
            'DocumentDownload',
            'FileDownload',
            'Location',
            'Icons',
            'Select',
            'Signature',
            'PartialSync',
            'Marker',
            'Solutions.view.EsriMap',
            'Solutions.view.EsriBasemaps',
            'Solutions.view.ShowBuildingMap',
            'Solutions.view.ShowAllBuildingsMap',
            'Solutions.view.ShowBuildingsByUseAndOccupancyMap',
            'Solutions.view.ShowCurrentLocationMap',
            'Solutions.view.LocateAssetMap',
            'Solutions.view.MarkerActionMap',
            'Solutions.view.MarkerClickEventMap'
        ],

        controllers: [
            'Documents',
            'Navigation',
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'Questionnaire.controller.Questionnaire'
        ],

        stores: [
            'Demos',
            'Common.store.Apps',
            //stores for Prompt Control
            'Common.store.Employees',
            'Common.store.Buildings',
            'Common.store.Floors',
            'Common.store.FloorPrompt',
            'Common.store.Rooms',
            'Common.store.RoomPrompt',

            //store for ViewSelector example
            'Documents',

            //store for DownloadValidatingTable example
            'Common.store.EquipmentStandards',

            //store for SyncTransactionTable example
            'Space.store.SpaceSurveys',

            'Questionnaire.store.Questions',
            'Questionnaire.store.Questionnaires',
            'Solutions.store.Marker',

            // Store for Partial Sync example
            'BuildingCodes',

            // Store for map examples
            'Solutions.store.SolutionsBuildings',
            'Floorplan.store.PublishDates'

        ],

        profiles: ['Tablet', 'Phone']

    });
});

