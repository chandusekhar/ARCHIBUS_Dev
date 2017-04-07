Ext.Loader.setPath({
    'Common': '../Common',
    'AssetReceipt': 'app'
});

Ext.require(['Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings'], function () {

    Ext.application({
        name: 'AssetReceipt',

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
                syncController = me.getController('AssetReceiptSync');

            syncController.downloadInitialBackgroundData(onCompleted, scope);
        },

        requires: [
            'Common.store.proxy.SqliteView',
            'Common.service.workflow.Workflow',
            'Common.view.panel.ProgressBar',
            'Common.control.button.Toolbar',
            'Common.control.button.Picker',
            'Common.control.field.Barcode',
            'Common.control.field.TextArea',
            'Common.control.field.Number',
            'Common.control.Select',
            'Common.control.TitlePanel',
            'Common.control.prompt.Site',
            'Common.control.prompt.Building',
            'Common.control.prompt.Floor',
            'Common.control.prompt.Room',
            'Common.control.prompt.EquipmentStandard',
            'Common.control.DataView',
            'Common.plugin.DataViewListPaging',
            'Common.util.Ui',
            'Ext.field.Search',
            'AssetReceipt.util.AssetReceiptData',
            'AssetReceipt.util.Filter',
            'AssetReceipt.control.ArrowTextField',
            'AssetReceipt.control.SearchScanField',
            'AssetReceipt.control.NextBarcodeField',
            'AssetReceipt.control.NextBarcodeFieldInput',
            'AssetReceipt.control.EquipmentStandardPrompt'
        ],

        views: [
            'Main',
            'Options',
            'BackgroundDataFilter',
            'EditEquipment',
            'InventoryList',
            'EquipmentList',
            'EquipmentListItem',
            'CommonData',
            'EquipmentStandardPromptList',
            'EquipmentStandardPromptListItem',
            'EditEquipmentStandard'
        ],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'AssetReceiptSync',
            'Navigation'
        ],

        stores: [
            'Common.store.Apps',
            'Common.store.Sites',
            'Common.store.Buildings',
            'AssetReceiptFloors',
            'AssetReceiptRooms',
            'AssetReceiptEmployees',
            'AssetReceiptDivisions',
            'AssetReceiptDepartments',
            'AssetReceiptEquipment',
            'AssetReceiptFloorPrompt',
            'AssetReceiptRoomPrompt',
            'EquipmentStandardsSync'
        ],

        launch: function () {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('AssetReceipt.view.Main'));
        }
    });
});
