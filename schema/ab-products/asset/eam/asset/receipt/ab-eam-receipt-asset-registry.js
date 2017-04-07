var abEamAssetRegistryController = View.createController('abEamAssetRegistryController', {

    afterViewLoad: function () {
        // customize grid columns
        this.abEamAssetRegistry_list.afterCreateCellContent = function (row, column, cellElement) {
            if (column.id == 'bl.asset_type') {
                cellElement.childNodes[0].innerHTML = getMessage('asset_type_' + cellElement.childNodes[0].text);
            }
        }
    },

    afterInitialDataFetch: function () {
        this.abEamAssetRegistry_list.setTitle(getMessage("asset_registry") + ": " + getMessage("asset_type_" + View.parameters.eamReceiptParameters.assetType));
    },

    showAssetDetails: function (record, selectedRecords) {
        var assetId = record.getValue('bl.asset_id');
        var assetType = record.getValue('bl.asset_type');
        var viewName = '';
        var restriction = new Ab.view.Restriction();
        if ('bl' === assetType) {
            restriction.addClause('bl.bl_id', assetId, '=');
            viewName = 'ab-eam-def-geo-loc.axvw';
        } else if ('property' === assetType) {
            restriction.addClause('property.pr_id', assetId, '=');
            viewName = 'ab-rplm-properties-define-form.axvw';
        } else if ('eq' === assetType) {
            restriction.addClause('eq.eq_id', assetId, '=');
            viewName = 'ab-eq-edit-form.axvw';
        } else if ('ta' === assetType) {
            restriction.addClause('ta.ta_id', assetId, '=');
            viewName = 'ab-ta-edit-form.axvw';
        }
        this.onEditAsset(assetType, viewName, restriction, false, selectedRecords);
    },

    onEditAsset: function (type, viewName, restriction, newRecord, selectedRecords) {
        var controller = this,
            dialogConfig = null;
        var eamReceiptParameters = View.parameters.eamReceiptParameters;
        if ('bl' === type) {
            dialogConfig = {
                closeButton: true,
                type: type,
                hideTabs: true,
                callback: function () {
                    controller.abEamAssetRegistry_list.refresh();
                }
            };
            if (valueExists(selectedRecords)) {
                eamReceiptParameters.selectedRecords = selectedRecords;
                eamReceiptParameters.selectedRecordIndex = 0;
                _.extend(dialogConfig, {eamReceiptParameters: eamReceiptParameters});
            }
        } else {
            dialogConfig = {
                closeButton: false,
                callback: function () {
                    controller.abEamAssetRegistry_list.refresh();
                }
            };
            if (valueExists(selectedRecords)) {
                eamReceiptParameters.selectedRecords = selectedRecords;
                eamReceiptParameters.selectedRecordIndex = 0;
                _.extend(dialogConfig, {eamReceiptParameters: eamReceiptParameters});
            }
        }
        View.openDialog(viewName, restriction, newRecord, dialogConfig);
    },

    abEamAssetRegistry_list_onEdit: function () {
        var selectedRecords = this.abEamAssetRegistry_list.getSelectedRecords();
        if (selectedRecords.length == 0) {
            View.showMessage(getMessage("no_rec_selected"));
            return;
        }
        this.showAssetDetails(selectedRecords[0], selectedRecords);
    },
    
    abEamAssetRegistry_list_onDelete: function () {
    	var selectedRecords = this.abEamAssetRegistry_list.getSelectedRecords();
        if (selectedRecords.length == 0) {
            View.showMessage(getMessage("no_rec_selected"));
            return;
        }
        this.deteleSelectedAssets(selectedRecords);
    },
    
    deteleSelectedAssets: function (selectedRecords) {
        var assetType = View.parameters.eamReceiptParameters.assetType;
        var pkName = "";
        if ('bl' === assetType) {
        	pkName = 'bl.bl_id';
        } else if ('property' === assetType) {
        	pkName = 'property.pr_id';
        } else if ('eq' === assetType) {
        	pkName = 'eq.eq_id';
        } else if ('ta' === assetType) {
        	pkName = 'ta.ta_id';
        }
        var selectedAssetIds = [];
        for (var i=0; i< selectedRecords.length; i++) {
            selectedAssetIds.push(selectedRecords[i].getValue('bl.asset_id'));
        }
        var jobId =  Workflow.startJob('AbAssetEAM-AssetReceiptService-deleteMultipleAssets', assetType, pkName, selectedAssetIds);
        var message = String.format(getMessage('loadingDeleteAssets'), getMessage('asset_type_' + assetType));
        View.openJobProgressBar(message, jobId, '', function (status) {
            var assetsPanel = View.panels.get('abEamAssetRegistry_list');
            assetsPanel.refresh();
            assetsPanel.setTitle(getMessage("asset_registry") + ": " + getMessage("asset_type_" + View.parameters.eamReceiptParameters.assetType));
        });
    }
});

function onShowDetails(row) {
    View.controllers.get('abEamAssetRegistryController').showAssetDetails(row.row.getRecord());
}