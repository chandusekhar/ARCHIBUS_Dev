var abEamTcSelectConnectPortsController = View.createController('abEamTcSelectConnectPortsController', {
    assetType: null,
    callbackMethod: null,
    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.assetType)) {
            this.assetType = View.parameters.assetType;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
            this.callbackMethod = View.parameters.callback;
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

    onSelectPort: function (row) {
        var record = row.row.getRecord();
        var assetType = record.getValue('eq.asset_type');
        var assetId = record.getValue('eq.asset_id');
        var assetPort = record.getValue('eq.asset_port');
        if (valueExists(abEamTcSelectConnectPortsController.callbackMethod)) {
            abEamTcSelectConnectPortsController.callbackMethod(assetType, assetId, assetPort);
        }
    }
});
