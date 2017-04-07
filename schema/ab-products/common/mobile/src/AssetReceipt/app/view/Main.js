Ext.define('AssetReceipt.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'assetReceiptMain',

    requires: 'AssetReceipt.control.SearchScanField',

    config: {
        useTitleForBackButtonText: false,

        navigationBar: {
            hideSaveButtons: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'AssetReceipt.view.Main'),
                cls: 'x-button-back',
                action: 'backToAppLauncher',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'openDownloadDataView',
                iconCls: 'download',
                displayOn: 'all',
                cls: 'ab-icon-action'
            }
        ],

        items: [
            {
                xtype: 'optionsPanel'
            }
        ]
    },

    initialize: function () {

        // Add additional toolbar buttons to the main view.
        var navBar = this.getNavigationBar();

        navBar.add({
            xtype: 'button',
            action: 'goToHomePage',
            align: 'left',
            iconCls: 'home',
            hidden: true
        });

        this.callParent(arguments);
    }
});
