View.createController('abEamTcSelectPortsController', {
    /**
     * Selected asset type
     */
    assetType: null,
    multipleTrace: false,
    assetId: null,
    actionTitle: null,
    callbackMethod: null,
    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.assetType)) {
            this.assetType = View.parameters.assetType;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.multipleTrace)) {
            this.multipleTrace = View.parameters.multipleTrace || false;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.assetId)) {
            this.assetId = View.parameters.assetId || false;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.actionTitle)) {
            this.actionTitle = View.parameters.actionTitle || false;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
            this.callbackMethod = View.parameters.callback;
        }
        if (!this.multipleTrace) {
            this.assetPortPanel.addEventListener('onMultipleSelectionChange', this.onChangeMultipleSelection);
        }
        var columns = this.assetPortPanel.columns;
        for (var i = 0; i < columns.length; i++) {
            if ('eq.asset_id' === columns[i].id) {
                columns[i].name = getMessage(this.assetType + '_label');
            }
            if ('eq.asset_port' === columns[i].id && 'fp' === this.assetType) {
                columns[i].name = getMessage('jk_port_label');
            }
        }
        this.assetPortPanel.addParameter('eqDsLabel', getMessage('eq_ds_label'));
        this.assetPortPanel.addParameter('eqportDsLabel', getMessage('eqport_ds_label'));
        this.assetPortPanel.addParameter('pnDsLabel', getMessage('pn_ds_label'));
        this.assetPortPanel.addParameter('jkDsLabel', getMessage('jk_ds_label'));
        this.assetPortPanel.addParameter('openDsLabel', getMessage('open_ds_label'));
    },

    afterInitialDataFetch: function () {
        if (valueExists(this.actionTitle)) {
            this.assetPortPanel.actions.get('assetAction').setTitle(this.actionTitle);
        }
        if (!this.multipleTrace) {
            this.assetPortPanel.enableSelectAll(false);
        }
    },

    callCallbackMethod: function (selectedRecords) {
        if (valueExists(this.callbackMethod)) {
            var returnType = this.assetType;
            if ("eq" === this.assetType) {
                returnType = "eqport";
            } else if ("pn" === this.assetType) {
                returnType = "pnport";
            }
            this.callbackMethod(returnType, this.assetId, selectedRecords);
        }
    },

    // behave like single selection
    onChangeMultipleSelection: function (row) {
        var rowIsSelected = row.row.isSelected();
        if (rowIsSelected) {
            row.grid.unselectAll();
            row.row.select(true);
        }
    }
});

function callbackHandler() {
    var controller = View.controllers.get("abEamTcSelectPortsController");
    var listPortPanel = View.panels.get("assetPortPanel");
    var selectedRecords = listPortPanel.getSelectedRecords();
    if (selectedRecords.length == 0) {
        View.showMessage(getMessage('noAssetSelected'));
        return;
    }
    controller.callCallbackMethod(selectedRecords);
}