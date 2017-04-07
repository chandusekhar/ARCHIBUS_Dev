var abEamTcSelectConnectAssetsController = View.createController('abEamTcSelectConnectAssetsController', {
    assetType: null,
    assetParameters: null,
    callbackMethod: null,
    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.assetType)) {
            this.assetType = View.parameters.assetType;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.assetParameters)) {
            this.assetParameters = View.parameters.assetParameters;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
            this.callbackMethod = View.parameters.callback;
        }
        var showAssetPort = ("eq" != this.assetParameters.assetType);
        var showIsMultiplexing = ("eq" === this.assetParameters.assetType);
        var showAssetStd = ("eq" === this.assetParameters.assetType || "jk" === this.assetParameters.assetType);
        this.assetPortPanel.showColumn('eq.asset_port', showAssetPort);
        this.assetPortPanel.showColumn('eq.asset_std', showAssetStd);
        this.assetPortPanel.showColumn('eq.is_multiplexing', showIsMultiplexing);
        
        var columns = this.assetPortPanel.columns;
        for (var i = 0; i < columns.length; i++) {
            if ('eq.asset_id' === columns[i].id) {
                columns[i].name = getMessage(this.assetParameters.assetType + '_label');
            }
            if ('eq.asset_port' === columns[i].id && 'jk' === this.assetParameters.assetType) {
                columns[i].name = getMessage('jk_port_label');
            }
            if ('eq.asset_std' === columns[i].id) {
                columns[i].name = getMessage(this.assetParameters.assetType + '_std_label');
            }
        } 
        this.assetPortPanel.addParameter('eqDsLabel', getMessage('eq_ds_label'));
        this.assetPortPanel.addParameter('eqportDsLabel', getMessage('eqport_ds_label'));
        this.assetPortPanel.addParameter('pnDsLabel', getMessage('pn_ds_label'));
        this.assetPortPanel.addParameter('jkDsLabel', getMessage('jk_ds_label'));
        this.assetPortPanel.addParameter('openDsLabel', getMessage('open_ds_label'));
        this.assetPortPanel.addParameter('hasPortsDsLabel', getMessage('hasports_ds_label'));
    },

    afterInitialDataFetch: function () {
        this.assetPortPanel.clearAllFilterValues();
        if (valueExistsNotEmpty(this.assetParameters.assetParentFieldName)) {
            if (valueExistsNotEmpty(this.assetParameters.assetParentFieldValue)) {
                if ('jk' === this.assetParameters.assetType) {
                    this.assetPortPanel.setFilterValue('eq.asset_port', this.assetParameters.assetParentFieldValue);
                } else {
                    this.assetPortPanel.setFilterValue('eq.asset_id', this.assetParameters.assetParentFieldValue);
                }
            }
        }
        this.assetPortPanel.refresh(View.restriction);
    },

    onSelectAsset: function (row) {
        var controller = View.controllers.get('abEamTcSelectConnectAssetsController');
        var record = row.row.getRecord();
        var assetType = record.getValue('eq.asset_type'),
            assetId = record.getValue('eq.asset_id'),
            assetPort = record.getValue('eq.asset_port');
        if (valueExists(controller.callbackMethod)) {
            controller.callbackMethod(assetType, assetId, assetPort, controller.assetParameters.assetFieldName, controller.assetParameters.assetParentFieldName);
        }
    }
});
