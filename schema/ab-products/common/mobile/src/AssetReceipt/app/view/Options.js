Ext.define('AssetReceipt.view.Options', {
    extend: 'Ext.Container',

    xtype: 'optionsPanel',

    config: {
        layout: 'vbox',

        title: LocaleManager.getLocalizedString('Asset Inventory', 'AssetReceipt.view.Options'),

        items: [
            {
                xtype: 'titlepanel',
                docked: 'top'
            },
            {
                xtype: 'container',
                style: Ext.os.is.Phone ? 'padding:0.5em 1em 0 1em' : 'padding:2em 4em 0 4em',
                items: [
                    {
                        xtype: 'component',
                        itemId: 'downloadMessage',
                        html: Ext.String.format(LocaleManager.getLocalizedString('{0}To use this App, tap {1} to download background data{2}', 'AssetReceipt.view.Options'), '<div class="empty-text">', '<span class="ab-download-icon"></span>', '</div>')
                    },
                    {
                        xtype: 'component',
                        html: LocaleManager.getLocalizedString('Search for Existing Asset:', 'AssetReceipt.view.Options'),
                        cls: 'text-label'
                    },
                    {
                        xtype: 'searchScanField',
                        name: 'searchScanField',
                        enableBarcodeScanning: true,
                        barcodeFormat: [{fields: ['eq_id']}],
                        style: 'margin: 0 0 1.5em;'
                    },
                    {
                        xtype: 'button',
                        action: 'addNewAsset',
                        text: LocaleManager.getLocalizedString('Add an Asset', 'AssetReceipt.view.Options'),
                        ui: 'action',
                        style: 'margin: 0 0 1.5em;'
                    },
                    {
                        xtype: 'button',
                        action: 'addManyAssets',
                        text: LocaleManager.getLocalizedString('Add Multiple Assets', 'AssetReceipt.view.Options'),
                        ui: 'action',
                        style: 'margin: 0 0 1.5em;'
                    },
                    {
                        xtype: 'button',
                        action: 'showInventory',
                        text: LocaleManager.getLocalizedString('Review New Assets', 'AssetReceipt.view.Options'),
                        ui: 'non-action'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent();
        this.showHideButtons();
    },

    showHideButtons: function () {
        var floorsStore = Ext.getStore('assetReceiptFloors'),
            employeesStore = Ext.getStore('assetReceiptEmployees'),
            divisionsStore = Ext.getStore('assetReceiptDivisions'),
            existsValidatingData = (floorsStore.getTotalCount() !== null && floorsStore.getTotalCount() !== 0 ) ||
                (employeesStore.getTotalCount() !== null && employeesStore.getTotalCount() !== 0) ||
                (divisionsStore.getTotalCount() !== null && divisionsStore.getTotalCount() !== 0),
            downloadMessage = this.down('component[itemId=downloadMessage]'),
            searchField = this.down('searchScanField'),
            addNewAssetBtn = this.down('button[action=addNewAsset]'),
            addManyAssetsBtn = this.down('button[action=addManyAssets]'),
            showInventoryBtn = this.down('button[action=showInventory]');

        if (downloadMessage) {
            downloadMessage.setHidden(existsValidatingData);
        }

        if (searchField) {
            searchField.setDisabled(!existsValidatingData);
        }

        if (addNewAssetBtn) {
            addNewAssetBtn.setDisabled(!existsValidatingData);
        }

        if (addManyAssetsBtn) {
            addManyAssetsBtn.setDisabled(!existsValidatingData);
        }

        if (showInventoryBtn) {
            showInventoryBtn.setDisabled(!existsValidatingData);
        }
    }
})
;