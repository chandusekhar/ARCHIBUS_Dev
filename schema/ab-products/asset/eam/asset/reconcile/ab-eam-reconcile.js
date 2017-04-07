var abEamAssetReconcileController = View.createController('abEamAssetReconcileController', {
    connectorParameters: null,

    afterViewLoad: function () {
        this.connectorParameters = View.getOpenerView().panels.get('abEamReconcileTabs').parameters;
        // customize grid columns
        this.assetTransList.afterCreateCellContent = function (row, column, cellElement) {
            abEamAssetReconcileController.customizeAssetRegistryFields(row, column, cellElement);
        };
    },

    afterInitialDataFetch: function () {
        this.loadAssetPanel();
    },

    loadAssetPanel: function () {
        this.assetTransList.refresh(View.parentTab.restriction);
        this.assetTransList.setTitle(View.parentTab.title);
    },

    /**
     * customize fields for assets panel
     */
    customizeAssetRegistryFields: function (row, column, cellElement) {
        if ("eq.status" === column.id) {
            var status = row.row.getFieldValue('eq.status');
            var assetType = row.row.getFieldValue('eq.source_table');
            var localizedValue = this.getLocalizedAssetStatus(assetType, status);
            cellElement.innerHTML = localizedValue;
        }
    },

    /**
     * edit asset
     * @param row
     */
    onEditRow: function (row) {
        var record = row.row.getRecord(),
            assetId = record.getValue('eq.asset_id'),
            assetType = record.getValue('eq.source_table');
        var viewName = '';
        var restriction = new Ab.view.Restriction();
        if ('eq' === assetType) {
            restriction.addClause('eq.eq_id', assetId, '=');
            viewName = 'ab-eq-edit-form.axvw';
        }
        View.controllers.get('abEamAssetReconcileController').onAddEditAsset(assetType, viewName, restriction, false);
    },

    /**
     *
     * after edit asset refresh the asset panel list
     */
    onAddEditAsset: function (type, viewName, restriction, newRecord) {
        var controller = this;
        var dialogConfig = {
            width: 1024,
            height: 800,
            closeButton: true,
            callback: function () {
                controller.assetTransList.refresh(controller.assetTransList.restriction);
            }
        };
        View.openDialog(viewName, restriction, newRecord, dialogConfig);
    },

    /**
     * show asset activities panel
     * @param row
     */
    onShowDetails: function (row) {
        var record = row.row.getRecord();
        var gridPanel = row.grid;
        var assetType = record.getValue('eq.source_table');
        View.controllers.get('abEamAssetReconcileController').onShowAssetDetails(assetType, gridPanel, record);
    },

    onShowAssetDetails: function (type, gridPanel, record) {
        var assetId = record.getValue('eq.asset_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.asset_type', type, '=');
        restriction.addClause('bl.asset_id', assetId, '=');
        this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_current', restriction);

        var historyRestr = new Ab.view.Restriction();
        historyRestr.addClause('asset_trans.asset_type', type, '=');
        historyRestr.addClause('asset_trans.asset_id', assetId, '=');
        this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_history', historyRestr);
        this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history', true);

        var selectedTabName = this.abEamAssetActivitiesTabs.getSelectedTabName();
        this.abEamAssetActivitiesTabs.refreshTab(selectedTabName);

        if (Ext.get(this.abEamAssetActivitiesTabs.getWrapperElementId()).dom.style.display === "none") {
            this.abEamAssetActivitiesTabs.show(true);
        }
    },

    /**
     * open dialog with selected connector log
     */
    showConnectorLog: function () {
        var connector = this.connectorParameters.connector;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("afm_conn_log.connector_id", connector);
        View.openDialog("afm-connector-view-log.axvw", restriction, false)
    },

    /**
     * returns localized status value for asset.
     * @param type  asset type
     * @param value status value
     * @return string
     */
    getLocalizedAssetStatus: function (type, value) {
        var localizedValue = '';
        if (valueExistsNotEmpty(value)) {
            var assetStatusDs = this.abAssetStatus_ds;
            if (type == 'bl') {
                localizedValue = assetStatusDs.fieldDefs.get('bl.status').enumValues[value];
            } else if (type == 'property') {
                localizedValue = assetStatusDs.fieldDefs.get('property.status').enumValues[value];
            } else if (type == 'eq') {
                localizedValue = assetStatusDs.fieldDefs.get('eq.status').enumValues[value];
            } else if (type == 'ta') {
                localizedValue = assetStatusDs.fieldDefs.get('ta.status').enumValues[value];
            }
        }
        return localizedValue;
    }
});