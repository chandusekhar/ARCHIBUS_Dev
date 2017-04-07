/**
 * Asset object with corresponding tabName and pkValue.
 * @type {{eq: *[], jk: *[], fp: *[], pn: *[], rm: *[]}}
 */
var assets = {
    eq: [
        {tabName: 'abEamTelConsTabs_eq', pkField: 'eq.eq_id'},
        {tabName: 'abEamTelConsTabs_eq_eqport', pkField: 'eq.eq_id'},
        {tabName: 'abEamTelConsTabs_softinv', pkField: 'softinv.eq_id'}
    ],
    jk: [{tabName: 'abEamTelConsTabs_jk', pkField: 'jk.jk_id'}],
    fp: [{tabName: 'abEamTelConsTabs_fp_jk', pkField: 'fp.fp_id'}],
    pn: [{tabName: 'abEamTelConsTabs_pn_pnport', pkField: 'pn.pn_id'}],
    rm: [{tabName: 'abEamTelConsTabs_rm_em', pkField: 'rm.rm_id'}]
};

var telConsCommonController = View.createController('telConsCommonController', {
    // console restrictions
    locationParameters: null,
    afterViewLoad: function () {
        if (this.abEamTelConsDetailsList.multipleSelectionEnabled) {
            this.abEamTelConsDetailsList.addEventListener('onMultipleSelectionChange', this.onChangeMultipleSelection);
        }
    },
    /**
     * Disable select all checkbox and set locationParameters.
     * @param panel
     */
    abEamTelConsDetailsList_afterRefresh: function (panel) {
        panel.enableSelectAll(false);
        var parentTab = View.getParentTab();
        if (valueExists(parentTab) && valueExists(parentTab.parameters)) {
            this.locationParameters = parentTab.parameters;
        }
    },
    /**
     * Set asset detail tab panel selected asset values.
     */
    queryAssetData: function () {
        var detailTabs = View.getParentTab().parentPanel;
        var drawingRestriction = detailTabs.parameters['drawingRestriction'];
        var selectedAssets = drawingRestriction.selectedAssets,
            selectedAssetType = drawingRestriction.assetType;

        var selectedTabName = detailTabs.selectedTabName;
        if (!valueExists(selectedAssetType) && ('rm' === selectedAssetType)) {
            selectedAssetType = this.getAssetTypeBySelectedTab(selectedTabName);
        }
        var detailsListPanel = View.panels.get("abEamTelConsDetailsList");
        detailsListPanel.clearAllFilterValues();

        this.setAssetDetailFilterValues("rm", detailTabs, selectedAssets);
        this.setAssetDetailFilterValues("eq", detailTabs, selectedAssets);
        this.setAssetDetailFilterValues("jk", detailTabs, selectedAssets);
        this.setAssetDetailFilterValues("fp", detailTabs, selectedAssets);
        this.setAssetDetailFilterValues("pn", detailTabs, selectedAssets);

        var assetConfig = this.getAssetConfig(selectedAssetType, selectedTabName);

        selectedTabName = assetConfig.tabName;
        var pkField = assetConfig.pkField;

        var assetTab = detailTabs.findTab(selectedTabName);

        if (assetTab.isContentLoaded || assetTab.isContentLoading) {
            var restriction = View.restriction;
            if (detailTabs.selectedTabName != selectedTabName) {
                var tab = detailTabs.selectTab(selectedTabName, null, false, false, true);
                detailsListPanel = tab.getContentFrame().View.panels.get("abEamTelConsDetailsList");
                restriction = tab.getContentFrame().View.restriction;
            }
            detailsListPanel.refresh(restriction);
        } else {
            var tab = detailTabs.selectTab(selectedTabName);
            var selectedAssetIds = selectedAssets[selectedAssetType];
            tab.callback = function () {
                if (tab.getContentFrame().View) {
                    detailsListPanel = tab.getContentFrame().View.panels.get("abEamTelConsDetailsList");
                    var restriction = tab.getContentFrame().View.restriction;
                    detailsListPanel.refresh(restriction);

                    telConsCommonController.setPanelFilterValues(detailsListPanel, selectedAssetIds, pkField);

                    detailsListPanel.refresh(restriction);
                }
            }
        }
    },
    /**
     * Set panel filter values for selected assets.
     * @param assetType
     * @param detailTabs
     * @param selectedAssets
     * @param selectedTabName
     */
    setAssetDetailFilterValues: function (assetType, detailTabs, selectedAssets) {
        var selectedAssetIds = selectedAssets[assetType];
        if (selectedAssetIds.length > 0) {
            var config = assets[assetType];
            for (var i = 0; i < config.length; i++) {
                var tabName = config[i].tabName;
                var pkField = config[i].pkField;
                var assetTab = detailTabs.findTab(tabName);
                var detailsListPanel = View.panels.get("abEamTelConsDetailsList");
                if (assetTab.getContentFrame().View) {
                    detailsListPanel = assetTab.getContentFrame().View.panels.get("abEamTelConsDetailsList");
                }
                if (assetTab.isContentLoaded || assetTab.isContentLoading) {
                    this.setPanelFilterValues(detailsListPanel, selectedAssetIds, pkField);
                }
            }
        }
    },

    /**
     * Set panel mini-console filter values.
     * @param detailsListPanel
     * @param selectedAssetIds
     * @param pkField
     */
    setPanelFilterValues: function (detailsListPanel, selectedAssetIds, pkField) {
        if (selectedAssetIds.length == 1) {
            detailsListPanel.setFilterValue(pkField, selectedAssetIds[0]);
        } else {
            var assetIds = '\"' + selectedAssetIds.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) + '\"';
            detailsListPanel.setFilterValue(pkField, '{' + assetIds.replace(/, \u200C/gi, '\",\"') + '}');
        }
    },
    /**
     * Clears drawing selection applied on panel
     */
    clearDrawingSelection: function () {
        var detailsListPanel = View.panels.get("abEamTelConsDetailsList");
        detailsListPanel.clearAllFilterValues();
        detailsListPanel.refresh(View.restriction);
    },
    /**
     * Get asset config.
     * @param assetType
     * @param selectedTab
     * @returns {tabName: tabName, pkField: pkField}
     */
    getAssetConfig: function (assetType, selectedTab) {
        var assetConfig = assets[assetType];
        if ('eq' === assetType) {
            if (assetConfig[1].tabName === selectedTab) {
                return assetConfig[1];
            } else if (assetConfig[2].tabName === selectedTab) {
                return assetConfig[2];
            } else {
                return assetConfig[0];
            }
        } else {
            return assetConfig[0];
        }
    },
    /**
     * Get default asset type when no selected asset is returned based on current selected tab.
     * This is when a room is selected on the drawing when the room highlight is not applied
     * @param selectedTabName
     * @returns {string} assetType
     */
    getAssetTypeBySelectedTab: function (selectedTabName) {
        var assetType = '';
        switch (selectedTabName) {
            case 'abEamTelConsTabs_eq_eqport':
            case 'abEamTelConsTabs_softinv':
            case 'abEamTelConsTabs_eq':
                assetType = 'eq';
                break;
            case 'abEamTelConsTabs_jk':
                assetType = 'jk';
                break;
            case 'abEamTelConsTabs_fp_jk':
                assetType = 'fp';
                break;
            case 'abEamTelConsTabs_pn_pnport':
                assetType = 'pn';
                break;
            case 'abEamTelConsTabs_rm_em':
                assetType = 'rm';
                break;
        }
        return assetType;
    },
    /**
     * Behave like single selection.
     * onClick checkbox displays child panel
     * @param row
     */
    onChangeMultipleSelection: function (row) {
        var childListPanel = View.panels.get('abEamTelConsDetailsChildList');
        var rowIsSelected = row.row.isSelected();
        if (rowIsSelected) {
            row.grid.unselectAll();
            row.row.select(true);
            var restriction = View.panels.get('abEamTelConsDetailsList').getPrimaryKeysForRow(row);
            childListPanel.refresh(restriction);
        }
        childListPanel.show(rowIsSelected);
    }
});
/**
 * Open asset form.
 * @param panelName
 * @param assetType
 * @param newRecord
 * @param isTelecomArea
 */
function openElementForm(panelName, assetType, newRecord, isTelecomArea) {
    var listPanel = View.panels.get(panelName);
    var restriction = new Ab.view.Restriction();
    if (!newRecord) {
        var selectedRecord = listPanel.rows[listPanel.selectedRowIndex].row.getRecord();
        var primaryKeyIds = listPanel.primaryKeyIds;
        for (var i = 0; i < primaryKeyIds.length; i++) {
            restriction.addClause(primaryKeyIds[i], selectedRecord.getValue(primaryKeyIds[i]));
        }
    }
    var viewName = "ab-eam-telecom-console-form-" + assetType + ".axvw";
    //special view for telecom area equipment
    if (valueExists(isTelecomArea)) {
        viewName = "ab-eam-telecom-console-form-eq-telecom-area.axvw";
    }
    if ("abEamTelConsDetailsChildList" === panelName) {
        if (newRecord) {
            restriction = View.panels.get('abEamTelConsDetailsChildList').restriction;
        }
        if ("jk" === assetType) {
            viewName = "ab-eam-telecom-console-form-fp-" + assetType + ".axvw";
        }
    }
    View.getOpenerView().getOpenerView().openDialog(viewName, restriction, newRecord, {
        assetType: assetType,
        locationParameters: telConsCommonController.locationParameters,
        width: 800,
        height: 400,
        callback: function () {
            listPanel.refresh();
        }
    });
}
/**
 * Connect element to other element.
 * @param panelName
 * @param assetType
 */
function connect(panelName, assetType) {
    var listPanel = View.panels.get(panelName);
    var selectedRecord = listPanel.rows[listPanel.selectedRowIndex].row.getRecord();

    var primaryKeyIds = listPanel.primaryKeyIds;
    var restriction = new Ab.view.Restriction();
    for (var i = 0; i < primaryKeyIds.length; i++) {
        restriction.addClause(primaryKeyIds[i], selectedRecord.getValue(primaryKeyIds[i]));
    }
    if ('pn' === assetType && !hasConnectionPort("pn", "pnport", restriction)) {
        View.getOpenerView().getOpenerView().showMessage(getMessage('noPortDefinedToConnect'));
        return;
    }
    if ('fp' === assetType && !hasConnectionPort("fp", "jk", restriction)) {
        View.getOpenerView().getOpenerView().showMessage(getMessage('noJackDefinedToConnect'));
        return;
    }
    var restrictionAsset = createConnectRestriction(assetType, selectedRecord);
    View.getOpenerView().getOpenerView().openDialog("ab-eam-telecom-console-connect.axvw", restrictionAsset, false, {
        assetType: assetType,
        locationParameters: telConsCommonController.locationParameters,
        width: 780,
        height: 500,
        callback: function () {
            listPanel.refresh();
            View.closeThisDialog();
        }
    });
}
/**
 * Create connect restriction.
 * @param assetType
 * @param selectedRecord
 * @returns {*}
 */
function createConnectRestriction(assetType, selectedRecord) {
    var asset_id = selectedRecord.getValue(assetType + "." + getAssetField(assetType) + "_id");
    var port_id = selectedRecord.getValue(assetType + ".port_id");
    if ('jk' == assetType) {
        var fpId = selectedRecord.getValue("jk.fp_id");
        if (valueExistsNotEmpty(fpId)) {
            assetType = 'fp';
            asset_id = selectedRecord.getValue("jk.fp_id");
            port_id = selectedRecord.getValue("jk.jk_id");
        }
    }
    var restrictionView = new Ab.view.Restriction();
    restrictionView.addClause('eq.asset_type', ('pn' === assetType) ? "pnport" : assetType);
    restrictionView.addClause('eq.asset_code', asset_id);
    if (valueExistsNotEmpty(port_id)) {
        restrictionView.addClause('eq.asset_port', port_id);
    }
    return restrictionView;
}
function getAssetField(assetType) {
    if ('pnport' === assetType) {
        assetType = 'pn';
    } else if ('eqport' === assetType) {
        assetType = 'eq';
    }
    return assetType;
}
/**
 * Create selected element trace report.
 * @param panelName
 * @param assetType
 */
function listConnections(panelName, assetType) {
    var listPanel = View.panels.get(panelName);
    var selectedRecord = listPanel.rows[listPanel.selectedRowIndex].row.getRecord();
    var assetId = selectedRecord.getValue(assetType + "." + getAssetField(assetType) + "_id");

    var primaryKeyIds = listPanel.primaryKeyIds;
    var restriction = new Ab.view.Restriction();
    for (var i = 0; i < primaryKeyIds.length; i++) {
        restriction.addClause(primaryKeyIds[i], selectedRecord.getValue(primaryKeyIds[i]));
    }
    if ("eq" === assetType && hasConnectionPort("eq", "eqport", restriction)
        || ("pn" === assetType)
        || ("fp" === assetType)) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('eq.asset_type', assetType);
        restriction.addClause('eq.asset_id', assetId);
        View.getOpenerView().getOpenerView().openDialog("ab-eam-telecom-console-select-ports.axvw", restriction, false, {
            assetType: assetType,
            assetId: assetId,
            actionTitle: getMessage("listConnectionsAction"),
            multipleTrace: true,
            width: 600,
            height: 400,
            callback: function (assetType, assetId, selectedRecords) {
                View.getOpenerView().getOpenerView().closeDialog();
                listAssetConnections(assetType, assetId, selectedRecords, true);
            }
        });
    } else {
        var selectedRecords = new Array();
        if ("eqport" === assetType || "pnport" === assetType) {
            selectedRecords = [selectedRecord];
        }
        listAssetConnections(assetType, assetId, selectedRecords, false);
    }
}
/**
 * Opens view with list of asset connections.
 * @param assetType
 * @param assetId
 * @param selectedRecords
 * @returns {boolean}
 */
function listAssetConnections(assetType, assetId, selectedRecords, selectPorts) {
    var assetPorts = prepareAssetPorts(assetType, selectedRecords);
    if (selectPorts) {
        assetPorts = prepareAssetPortsSelection(selectedRecords);
    }
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-listAssetConnections', assetType, assetId, assetPorts);
        if (result.code == 'executed') {
            var connections = result.data;
            View.getOpenerView().getOpenerView().openDialog("ab-eam-telecom-console-list-connections.axvw", null, false, {
                width: 900,
                height: 600,
                connections: connections
            });
        }
    } catch (e) {
        Workflow.handleError(e);
    }
}

/**
 * Prepare asset detail ports before calling the WRF rules for asset actions.
 * @param assetType
 * @param selectedRecords
 * @returns {Array}
 */
function prepareAssetPorts(assetType, selectedRecords) {
    var assetPorts = [],
        portFieldName = 'port_id';
    if ('fp' === assetType) {
        assetType = 'jk';
        portFieldName = 'jk_id';
    }
    for (var i = 0; i < selectedRecords.length; i++) {
        var record = selectedRecords[i];
        var assetPort = record.getValue(assetType + '.' + portFieldName);
        assetPorts.push(assetPort);
    }
    return assetPorts;
}
/**
 * Prepare asset ports before calling the WRF rules for asset actions.
 * @param selectedRecords
 * @returns {Array}
 */
function prepareAssetPortsSelection(selectedRecords) {
    var assetPorts = [];
    for (var i = 0; i < selectedRecords.length; i++) {
        var record = selectedRecords[i];
        var assetPort = record.getValue('eq.asset_port');
        assetPorts.push(assetPort);
    }
    return assetPorts;
}
/**
 * Check if asset has ports.
 * @param sourceTableName
 * @param destinationTableName
 * @param restriction
 * @returns {boolean} hasConnectionPort
 */
function hasConnectionPort(sourceTableName, destinationTableName, restriction) {
    var params = {
        tableName: destinationTableName,
        isDistinct: 'true',
        fieldNames: toJSON([destinationTableName + '.' + sourceTableName + '_id']),
        restriction: toJSON(restriction)
    };
    try {
        var result = Workflow.call('AbCommonResources-getDataRecords', params);
        if (result.code == 'executed') {
            return (result.dataSet.records.length > 0);
        }
    } catch (e) {
        Workflow.handleError(e);
        return false;
    }
    return false;
}
/**
 * Create jacks for faceplates.
 * A dialog window is displayed with the results.
 */
function createJacksForFaceplates() {
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-createJacksForFaceplates');
        if (result.code == 'executed') {
            var createdJacks = result.data;
            var openerView = View.getOpenerView().getOpenerView();
            if (createdJacks.length == 0) {
                openerView.showMessage(getMessage("noJkForFpCreated"));
            } else {
                openerView.openDialog("ab-eam-telecom-console-create-ports-result.axvw", null, false, {
                    width: 400,
                    height: 400,
                    createdData: createdJacks,
                    titleReport: getMessage('createJkForFpTitle'),
                    instructionsReport: getMessage('createJkForFpInstructions'),
                    typeLabel: getMessage('typeLabel'),
                    noCreatedLabel: getMessage('noCreatedLabel')
                });
            }
        }
    } catch (e) {
        Workflow.handleError(e);
    }
}
/**
 * Create ports for panels.
 * A dialog window is displayed with the results.
 */
function createPortsForPanels() {
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-createPortsForPanels');
        if (result.code == 'executed') {
            var createdPorts = result.data;
            var openerView = View.getOpenerView().getOpenerView();
            if (createdPorts.length == 0) {
                openerView.showMessage(getMessage("noPnPortForPnCreated"));
            } else {
                openerView.openDialog("ab-eam-telecom-console-create-ports-result.axvw", null, false, {
                    width: 400,
                    height: 400,
                    createdData: createdPorts,
                    titleReport: getMessage('createPnPortForPnTitle'),
                    instructionsReport: getMessage('createPnPortForPnInstructions'),
                    typeLabel: getMessage('typeLabel'),
                    noCreatedLabel: getMessage('noCreatedLabel')
                });
            }
        }
    } catch (e) {
        Workflow.handleError(e);
    }
}
/**
 * Create ports for equipment.
 * A dialog window is displayed with the results.
 */
function createPortsForEquipment() {
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-createPortsForEquipment');
        if (result.code == 'executed') {
            var createdPorts = result.data;
            var openerView = View.getOpenerView().getOpenerView();
            if (createdPorts.length == 0) {
                openerView.showMessage(getMessage("noEqPortForEqCreated"));
            } else {
                openerView.openDialog("ab-eam-telecom-console-create-ports-result.axvw", null, false, {
                    width: 400,
                    height: 400,
                    createdData: createdPorts,
                    titleReport: getMessage('createEqPortForEqTitle'),
                    instructionsReport: getMessage('createEqPortForEqInstructions'),
                    typeLabel: getMessage('typeLabel'),
                    noCreatedLabel: getMessage('noCreatedLabel')
                });
            }
        }
    } catch (e) {
        Workflow.handleError(e);
    }
}