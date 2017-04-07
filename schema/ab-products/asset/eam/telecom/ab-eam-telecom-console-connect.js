var connection_form_changed = false;
var tcConnectController = View.createController('tcConnectController', {
    /**
     * Asset type (eq, eqport, fp, jk, pnport)
     */
    assetType: null,
    /**
     * Console filter values
     */
    locationParameters: null,
    /**
     * Assets to connect from drawing
     */
    connectAssets: null,
    /**
     * Call back method.
     */
    callbackMethod: null,
    /**
     * Maps DOM events to connection radio options.
     */
    events: {
        'click input[type=radio]': function (input) {
            if (input.currentTarget.name === 'abEamTelConsConnectForm_connectToOptions') {
                this.toggleConnectionFields();
            }
        }
    },
    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.assetType)) {
            this.assetType = View.parameters.assetType;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.locationParameters)) {
            this.locationParameters = View.parameters.locationParameters;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.connectAssets)) {
            this.connectAssets = View.parameters.connectAssets;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
            this.callbackMethod = View.parameters.callback;
        }
    },
    afterInitialDataFetch: function () {
        if ("fp" === this.assetType || "pn" === this.assetType) {
            this.resetAssetFields();
        }
        if (valueExists(this.connectAssets)) {
            this.showConnectAssetsElements();
        } else {
            this.showConnectToElement();
        }
    },
    /**
     * Displays the connect_from field labels and connect_to fields depending on the current asset connection.
     *
     */
    showConnectToElement: function () {
        var hasConnection = this.hasConnection();
        if (hasConnection) {
            this.abEamTelConsConnectForm.setFieldValue('connectToOptions', this.abEamTelConsConnectForm.record.getValue("eq.connected_to_asset"));
            this.toggleConnectionFields();
        } else {
            this.showConnectionFields(false);
        }
        this.displayAssetLabels();
        this.showAssetPortField();
        this.showMultiplexingField();
        this.showNavigationConnectionActions();
        this.abEamTelConsConnectForm.actions.get('disconnect').enable(hasConnection);
    },
    /**
     * Displays the connect_from field labels and connect_to fields depending on the assets to connect selected from the drawing.
     *
     */
    showConnectAssetsElements: function () {
        var toAssetType = this.connectAssets.assetTo.assetType;
        var toAssetId = this.connectAssets.assetTo.assetId;
        var connectToOption = toAssetType;
        if ('fp' === toAssetType) {
            connectToOption = 'jk';
        }
        this.clearConnectionFields();
        this.abEamTelConsConnectForm.setFieldValue('connectToOptions', connectToOption);
        this.toggleConnectionFields();
        this.abEamTelConsConnectForm.setFieldValue('eq.tc_' + toAssetType + '_id', toAssetId);

        this.displayAssetLabels();
        this.showAssetPortField();
        this.showMultiplexingField();
        this.showNavigationActions(false, false);
        this.abEamTelConsConnectForm.actions.get('disconnect').show(false);
    },
    /**
     * Displays connect_to fields based on connection options radio values.
     */
    toggleConnectionFields: function () {
        var value = this.abEamTelConsConnectForm.getFieldValue('connectToOptions');
        var isEq = ('eq' === value),
            isJk = ('jk' === value),
            isPn = ('pn' === value);
        this.abEamTelConsConnectForm.showField('eq.tc_eq_id', isEq);
        this.abEamTelConsConnectForm.showField('eq.tc_eqport_id', isEq);
        this.abEamTelConsConnectForm.showField('eq.tc_fp_id', isJk);
        this.abEamTelConsConnectForm.showField('eq.tc_jk_id', isJk);
        this.abEamTelConsConnectForm.showField('eq.tc_pn_id', isPn);
        this.abEamTelConsConnectForm.showField('eq.tc_pnport_id', isPn);
        this.setRequiredConnectionFields(isEq, isJk, isPn);
    },
    /**
     * Hide connection option jack if connected_from is not equipment.
     */
    showConnectionOptions: function (showAssetPort) {
        var connectToOptionsRadio = document.getElementsByName('abEamTelConsConnectForm_connectToOptions');
        var assetType = this.getAssetType();
        var showJk = 'eq' != assetType || ('eq' === assetType && showAssetPort);
        for (var i = 0; i < connectToOptionsRadio.length; i++) {
            if (connectToOptionsRadio[i].value === 'jk') {
                connectToOptionsRadio[i].parentElement.style.display = (showJk ? 'none' : '');
            }
        }
    },
    /**
     * Set required connection fields. When required, red star appears near the field label.
     * @param isEq
     * @param isJk
     * @param isPn
     */
    setRequiredConnectionFields: function (isEq, isJk, isPn) {
        setFieldRequired('eq.tc_eq_id', isEq);
        setFieldRequired('eq.tc_eqport_id', false);
        setFieldRequired('eq.tc_jk_id', isJk);
        setFieldRequired('eq.tc_pn_id', isPn);
        setFieldRequired('eq.tc_pnport_id', isPn);
    },
    /**
     * Show asset port field.
     */
    showAssetPortField: function () {
        var showAssetPort = this.showAssetPort();
        this.showConnectionOptions(showAssetPort);
        this.abEamTelConsConnectForm.showField('eq.asset_port', showAssetPort);
        var fieldEl = this.abEamTelConsConnectForm.getFieldElement('eq.asset_port');
        if (showAssetPort) {
            Ext.get(fieldEl.parentNode).removeClass('nohover');
        } else {
            Ext.get(fieldEl.parentNode).addClass('nohover');
        }
        setFieldRequired('eq.asset_port', showAssetPort);
    },
    /**
     * Show is_multiplexing field.
     */
    showMultiplexingField: function () {
        this.abEamTelConsConnectForm.showField('eq.is_multiplexing', this.isMultiplexing());
    },
    /**
     * Show asset connection port.
     * @returns {boolean} if asset port is displayed
     */
    showAssetPort: function () {
        var showAssetPort = true;
        var assetType = this.getAssetType();
        if ("eq" === assetType) {
            var restrictionPort = new Ab.view.Restriction();
            restrictionPort.addClause('eq.eq_id', this.abEamTelConsConnectForm.record.getValue('eq.asset_code'));
            showAssetPort = hasPort("eq", "eqport", restrictionPort);
        } else if ("jk" === assetType) {
            showAssetPort = false;
        }
        return showAssetPort;
    },
    /**
     * Displays connect_from fields labels based on connection options.
     */
    displayAssetLabels: function () {
        var assetType = this.getAssetType();
        $('abEamTelConsConnectForm_eq.asset_code_labelCell').innerHTML = getMessage('asset_' + assetType + '_code');
        $('abEamTelConsConnectForm_eq.asset_port_labelCell').innerHTML = ('fp' == assetType) ? getMessage('asset_jk_code') : getMessage('asset_port_code');
        $('abEamTelConsConnectForm_eq.asset_std_labelCell').innerHTML = getMessage('asset_' + assetType + '_std');
        this.abEamTelConsConnectForm.setTitle(getMessage('connectTitle') + ' - ' + getMessage('asset_' + assetType + '_label'));
    },
    /**
     *  Displays connections navigation actions if the asset has or not a connection.
     *  Searching toward the server and toward the client for existing connection.
     */
    showNavigationConnectionActions: function () {
        var assetCode = this.abEamTelConsConnectForm.record.getValue("eq.asset_code"),
            assetPort = this.abEamTelConsConnectForm.record.getValue("eq.asset_port"),
            assetType = this.abEamTelConsConnectForm.record.getValue("eq.asset_type");

        var record = getTowardTheClientConnection(assetType, assetCode, assetPort);
        var showTowardClientAction = valueExistsNotEmpty(record) && this.hasPortRecordValue();
        var showTowardServerAction = this.hasConnection();
        this.showNavigationActions(showTowardClientAction, showTowardServerAction);
    },
    /**
     * Displays connections navigation actions.
     * @param showTowardClientAction
     * @param showTowardServerAction
     */
    showNavigationActions: function (showTowardClientAction, showTowardServerAction) {
        var fieldSetId = this.abEamTelConsConnectForm.fields.get('connectToOptions').fieldSetId;
        this.abEamTelConsConnectForm.fieldsets.get(fieldSetId).actions.get('towardClient').show(showTowardClientAction);
        this.abEamTelConsConnectForm.fieldsets.get(fieldSetId).actions.get('towardServer').show(showTowardServerAction);
    },
    /**
     * Show connect_to connection fields.
     * @param show
     */
    showConnectionFields: function (show) {
        this.abEamTelConsConnectForm.showField('eq.tc_eq_id', show);
        this.abEamTelConsConnectForm.showField('eq.tc_eqport_id', show);
        this.abEamTelConsConnectForm.showField('eq.tc_fp_id', show);
        this.abEamTelConsConnectForm.showField('eq.tc_jk_id', show);
        this.abEamTelConsConnectForm.showField('eq.tc_pn_id', show);
        this.abEamTelConsConnectForm.showField('eq.tc_pnport_id', show);
        if (!show) {
            this.clearConnectionFields();
        }
    },
    /**
     * Clear connect_to connection fields.
     */
    clearConnectionFields: function () {
        this.abEamTelConsConnectForm.setFieldValue('connectToOptions', '');
        this.abEamTelConsConnectForm.setFieldValue('eq.tc_eq_id', '');
        this.abEamTelConsConnectForm.setFieldValue('eq.tc_eqport_id', '');
        this.abEamTelConsConnectForm.setFieldValue('eq.tc_fp_id', '');
        this.abEamTelConsConnectForm.setFieldValue('eq.tc_jk_id', '');
        this.abEamTelConsConnectForm.setFieldValue('eq.tc_pn_id', '');
        this.abEamTelConsConnectForm.setFieldValue('eq.tc_pnport_id', '');
    },
    /**
     * Disconnect connection.
     */
    disconnect: function () {
        var form = View.panels.get('abEamTelConsConnectForm');
        var assetType = form.record.getValue('eq.asset_type'),
            assetCode = form.record.getValue('eq.asset_code'),
            assetPort = form.record.getValue('eq.asset_port');
        var assetRecord = this.getExistingConnectionRecord(assetType, assetCode, assetPort);
        if (valueExists(assetRecord)) {
            var record = assetRecord.record,
                dataSource = assetRecord.dataSource,
                assetTable = assetType;
            if ('eq' === assetType) {
                record.setValue(assetTable + '.eq_id', assetCode);
                record.setValue(assetTable + '.tc_jk_id', '');
            } else if ('eqport' === assetType) {
                record.setValue(assetTable + '.eq_id', assetCode);
                record.setValue(assetTable + '.port_id', assetPort);
            } else if ('jk' === assetType) {
                record.setValue(assetTable + '.jk_id', assetCode);
            } else if ('fp' === assetType) {
                assetTable = 'jk';
                record.setValue(assetTable + '.fp_id', assetCode);
                record.setValue(assetTable + '.jk_id', assetPort);
            } else if ('pnport' === assetType) {
                record.setValue(assetTable + '.pn_id', assetCode);
                record.setValue(assetTable + '.port_id', assetPort);
            }
            record.setValue(assetTable + '.tc_eq_id', '');
            record.setValue(assetTable + '.tc_eqport_id', '');
            record.setValue(assetTable + '.tc_pn_id', '');
            record.setValue(assetTable + '.tc_pnport_id', '');
            try {
                dataSource.saveRecord(record);
                this.refreshConnectionForm(assetType, assetCode, assetPort);
            } catch (e) {
                Workflow.handleError(e);
            }
        }
    },
    /**
     * Saves connection.
     * @returns {boolean} true if connection is saved successfully
     */
    saveConnection: function (showConfirmMessage) {
        var form = this.abEamTelConsConnectForm;
        if (form.canSave()) {
            var connectToOptionsValue = form.getFieldValue('connectToOptions');
            if (!valueExistsNotEmpty(connectToOptionsValue)) {
                View.showMessage(getMessage('noConnectToProvided'));
                return false;
            }
            if (this.validatePorts()) {
                if (connection_form_changed && showConfirmMessage) {
                    View.confirm(getMessage("saveConnectionChanges"), function (button) {
                        if (button == 'yes') {
                            return tcConnectController.connect();
                        }
                    });
                } else {
                    return this.connect();
                }
            }
        }
        return false;
    },
    /**
     * Save asset values to database.
     * @returns {boolean}
     */
    connect: function () {
        var form = this.abEamTelConsConnectForm;
        var assetType = form.record.getValue('eq.asset_type'),
            assetCode = form.record.getValue('eq.asset_code'),
            assetPort = form.record.getValue('eq.asset_port');
        var assetRecord = this.getExistingConnectionRecord(assetType, assetCode, assetPort);
        if (valueExists(assetRecord)) {
            var record = assetRecord.record,
                dataSource = assetRecord.dataSource,
                assetTable = assetType;
            if ('eq' === assetType) {
                record.setValue(assetTable + '.eq_id', assetCode);
                record.setValue(assetTable + '.tc_jk_id', form.getFieldValue('eq.tc_jk_id'));
            } else if ('eqport' === assetType) {
                record.setValue(assetTable + '.eq_id', assetCode);
                record.setValue(assetTable + '.port_id', assetPort);
            } else if ('jk' === assetType) {
                record.setValue(assetTable + '.jk_id', assetCode);
            } else if ('fp' === assetType) {
                assetTable = 'jk';
                record.setValue(assetTable + '.fp_id', assetCode);
                record.setValue(assetTable + '.jk_id', assetPort);
            } else if ('pnport' === assetType) {
                record.setValue(assetTable + '.pn_id', assetCode);
                record.setValue(assetTable + '.port_id', assetPort);
            }
            if (this.checkExistingConnections()) {
                record.setValue(assetTable + '.tc_eq_id', form.getFieldValue('eq.tc_eq_id'));
                record.setValue(assetTable + '.tc_eqport_id', form.getFieldValue('eq.tc_eqport_id'));
                record.setValue(assetTable + '.tc_pn_id', form.getFieldValue('eq.tc_pn_id'));
                record.setValue(assetTable + '.tc_pnport_id', form.getFieldValue('eq.tc_pnport_id'));
                try {
                    dataSource.saveRecord(record);
                    this.refreshConnectionForm(assetType, assetCode, assetPort);
                    if (this.connectAssets) {
                        this.callbackMethod(this.connectAssets);
                    }
                    return true;
                } catch (e) {
                    Workflow.handleError(e);
                    return false;
                }
            }
        }
    },
    /**
     * Looks toward the client for existing connection. If found, refreshes the form with the found connection.
     */
    towardClient: function () {
        var form = View.panels.get("abEamTelConsConnectForm");
        var assetCode = form.record.getValue("eq.asset_code"),
            assetPort = form.record.getValue("eq.asset_port"),
            assetType = form.record.getValue("eq.asset_type");
        var record = getTowardTheClientConnection(assetType, assetCode, assetPort);
        if (valueExists(record)) {
            if ('fp' === assetType) {
                assetType = 'jk';
            }
            var connAssetType = record.getValue(assetType + '.conn_asset_type'),
                connAssetCode = record.getValue(assetType + '.conn_asset_code'),
                connAssetPort = record.getValue(assetType + '.conn_asset_port');

            var restriction = new Ab.view.Restriction();
            restriction.addClause('eq.asset_type', connAssetType);
            restriction.addClause('eq.asset_code', connAssetCode);
            if (valueExistsNotEmpty(connAssetPort)) {
                restriction.addClause('eq.asset_port', connAssetPort);
            }
            View.panels.get("abEamTelConsConnectForm").refresh(restriction);
            this.showConnectToElement();
        }
    },
    /**
     * Looks for toward the server connection. If found, refreshes the form with the found connection.
     */
    towardServer: function () {
        var restriction = this.getConnectToRestriction();
        View.panels.get("abEamTelConsConnectForm").refresh(restriction);
        this.showConnectToElement();
    },
    /**
     * Validates ports and displays message if no port is specified.
     * @returns {boolean} ports are valid
     */
    validatePorts: function () {
        var validPorts = true;
        var form = View.panels.get("abEamTelConsConnectForm");
        var pnCode = form.getFieldValue('eq.tc_pn_id');
        var restriction = null;
        if (valueExistsNotEmpty(pnCode)) {
            var panelPortCode = form.getFieldValue('eq.tc_pnport_id');
            if (!valueExistsNotEmpty(panelPortCode)) {
                restriction = new Ab.view.Restriction();
                restriction.addClause("pn.pn_id", pnCode, "=");
                if (hasPort("pn", "pnport", restriction)) {
                    View.showMessage(String.format(getMessage("noPanelPort"), pnCode));
                    validPorts = false;
                }
            }
        }
        var eqCode = form.getFieldValue('eq.tc_eq_id');
        if (valueExistsNotEmpty(eqCode)) {
            var eqPortCode = form.getFieldValue('eq.tc_eqport_id');
            if (!valueExistsNotEmpty(eqPortCode)) {
                restriction = new Ab.view.Restriction();
                restriction.addClause("eq.eq_id", eqCode, "=");
                if (hasPort("eq", "eqport", restriction)) {
                    View.showMessage(String.format(getMessage("noEquipmentPort"), eqCode));
                    validPorts = false;
                }
            }
        }
        return validPorts;
    },
    /**
     * Check if an asset is already connected to an asset
     * @returns {boolean}
     */
    checkExistingConnections: function () {
        var connectToFields = this.getConnectToAssetFields(true);
        var assetType = connectToFields.assetType,
            assetCode = connectToFields.assetCode,
            assetPort = connectToFields.assetPort;
        var record = getTowardTheClientConnection(assetType, assetCode, assetPort);
        if (valueExists(record)) {
            var assetTable = assetType;
            if ('fp' === assetType) {
                assetTable = 'jk';
            }
            var connAssetType = record.getValue(assetTable + '.conn_asset_type');
            var connAssetCode = record.getValue(assetTable + '.conn_asset_code');
            var connAssetPort = record.getValue(assetTable + '.conn_asset_port');
            var message = String.format(getMessage('connectionExists'), connAssetType, connAssetCode);
            if (valueExistsNotEmpty(connAssetPort)) {
                message += ' ' + connAssetPort;
            }
            View.showMessage(message);
            connection_form_changed = true;
            return false;
        }
        //TBD check connection to avoid same loop connection ?
        return true;
    },
    /**
     * Get existing connection data-source with record.
     * @param assetType
     * @param assetCode
     * @param assetPort
     * @returns {{dataSource: *, record: (*|Ab.data.Record|Ab.data.Record.)}}
     */
    getExistingConnectionRecord: function (assetType, assetCode, assetPort) {
        var restriction = new Ab.view.Restriction();
        if ('fp' === assetType) {
            assetType = 'jk';
            restriction.addClause('jk.fp_id', assetCode);
            restriction.addClause('jk.jk_id', assetPort);
        } else {
            restriction.addClause(assetType + '.' + getAssetField(assetType) + '_id', assetCode);
            if (valueExistsNotEmpty(assetPort)) {
                restriction.addClause(assetType + '.port_id', assetPort);
            }
        }
        var dataSource = View.dataSources.get("abEamTelCons_connect_" + assetType + "_ds");
        return {
            dataSource: dataSource,
            record: dataSource.getRecord(restriction)
        };
    },
    /**
     * Get connect_to restriction.
     * @param useUserInput - if true, the UI values are returned, else the fom record.
     * @returns {*} restriction
     */
    getConnectToRestriction: function (useUserInput) {
        var connectToFields = this.getConnectToAssetFields(useUserInput);

        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq.asset_type', connectToFields.assetType);
        restriction.addClause('eq.asset_code', connectToFields.assetCode);
        if (valueExistsNotEmpty(connectToFields.assetPort)) {
            restriction.addClause('eq.asset_port', connectToFields.assetPort);
        }
        return restriction;
    },
    /**
     * Get asset type. Returns record asset type form value.
     * @returns {*} asset type
     */
    getAssetType: function () {
        return this.abEamTelConsConnectForm.record.getValue('eq.asset_type');
    },
    /**
     * Get asset code. Returns record asset code form value.
     * @returns {*} asset code
     */
    getAssetCode: function () {
        return this.abEamTelConsConnectForm.record.getValue('eq.asset_code');
    },
    /**
     * Check if asset has connection.
     */
    hasConnection: function () {
        return valueExistsNotEmpty(this.abEamTelConsConnectForm.record.getValue("eq.connected_to"));
    },
    /**
     * Check if asset has connection port.
     */
    hasPortValue: function () {
        return valueExistsNotEmpty(this.abEamTelConsConnectForm.record.getValue("eq.asset_port"));
    },
    /**
     * Check if asset has connection port value.
     */
    hasPortRecordValue: function () {
        return this.showAssetPort() && this.hasPortValue();
    },
    /**
     * Check equipment is_multiplexing.
     */
    isMultiplexing: function () {
        return this.abEamTelConsConnectForm.record.getValue('eq.is_multiplexing') == 1;
    },
    /**
     * Reset asset port and connected to. Used when asset type is fp and pn
     */
    resetAssetFields: function () {
        this.abEamTelConsConnectForm.setFieldValue('eq.asset_port', '');
        this.abEamTelConsConnectForm.record.setValue('eq.asset_port', '');
        this.abEamTelConsConnectForm.setFieldValue('eq.connected_to', '');
        this.abEamTelConsConnectForm.record.setValue('eq.connected_to', '');
    },
    /**
     * Get connect to asset fields based on connectToOption asset selected.
     * @param useUserInput - if true, the UI values are returned, else the fom record.
     * @returns {{assetType: string, assetCode: *, assetPort: string}}
     */
    getConnectToAssetFields: function (useUserInput) {
        var form = View.panels.get("abEamTelConsConnectForm");
        var tc_eq_id = useUserInput ? form.getFieldValue("eq.tc_eq_id") : form.record.getValue("eq.tc_eq_id"),
            tc_eqport_id = useUserInput ? form.getFieldValue("eq.tc_eqport_id") : form.record.getValue("eq.tc_eqport_id"),
            tc_fp_id = useUserInput ? form.getFieldValue("eq.tc_fp_id") : form.record.getValue("eq.tc_fp_id"),
            tc_jk_id = useUserInput ? form.getFieldValue("eq.tc_jk_id") : form.record.getValue("eq.tc_jk_id"),
            tc_pn_id = useUserInput ? form.getFieldValue("eq.tc_pn_id") : form.record.getValue("eq.tc_pn_id"),
            tc_pnport_id = useUserInput ? form.getFieldValue("eq.tc_pnport_id") : form.record.getValue("eq.tc_pnport_id");
        var assetType = "eq",
            assetCode = tc_eq_id,
            assetPort = "";
        if (valueExistsNotEmpty(tc_pn_id) && valueExistsNotEmpty(tc_pnport_id)) {
            assetType = 'pnport';
            assetCode = tc_pn_id;
            assetPort = tc_pnport_id;
        } else if (valueExistsNotEmpty(tc_fp_id) && valueExistsNotEmpty(tc_jk_id)) {
            assetType = 'fp';
            assetCode = tc_fp_id;
            assetPort = tc_jk_id;
        } else if (valueExistsNotEmpty(tc_jk_id)) {
            assetType = 'jk';
            assetCode = tc_jk_id;
        } else if (valueExistsNotEmpty(tc_eqport_id)) {
            assetType = 'eqport';
            assetPort = tc_eqport_id;
        }
        return {
            assetType: assetType,
            assetCode: assetCode,
            assetPort: assetPort
        }
    },
    /**
     * Refresh the connection form.
     * @param assetType
     * @param assetCode
     * @param assetPort
     */
    refreshConnectionForm: function (assetType, assetCode, assetPort) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq.asset_type', assetType);
        restriction.addClause('eq.asset_code', assetCode);
        if (valueExistsNotEmpty(assetPort)) {
            restriction.addClause('eq.asset_port', assetPort);
        }
        var record = View.dataSources.get('abEamTelCons_connect_ds').getRecord(restriction);
        View.panels.get("abEamTelConsConnectForm").setRecord(record);
        if (valueExists(this.connectAssets)) {
            this.showConnectAssetsElements();
        } else {
            this.showConnectToElement();
        }
    },
    /**
     * Call back function.
     */
    callCallbackMethod: function () {
        if (valueExists(this.callbackMethod)) {
            this.callbackMethod();
        }
    }
});
/**
 * Save connection form action.
 */
function saveConnection() {
    tcConnectController.saveConnection(true);
}
/**
 * Disconnect connection form action.
 */
function disconnectConnection() {
    View.confirm(getMessage("disconnectConnection"), function (button) {
        if (button == 'yes') {
            tcConnectController.disconnect();
        }
    });
}
/**
 * Called from .axvw file on navigation connection actions.
 * Looks toward the server or toward the client for existing connection.
 * If form is changes, the user is prompt to save the changed connection.
 *
 * @param type server(toward the server) / client (toward the client)
 */
function toward(type) {
    var fn = tcConnectController.towardServer;
    if (type === 'client') {
        fn = tcConnectController.towardClient;
    }
    if (connection_form_changed) {
        View.confirm(getMessage("saveConnectionChanges"), function (button) {
            if (button == 'yes') {
                if (tcConnectController.saveConnection(false)) {
                    fn.call(tcConnectController);
                }
            }
            if (button == 'no') {
                fn.call(tcConnectController);
            }
        });
    } else {
        fn.call(tcConnectController);
    }
}
/**
 * Select ports based on asset type.
 */
function selectPort() {
    var assetType = tcConnectController.getAssetType();
    if ('eq' === assetType) {
        assetType = 'eqport';
    }
    var selectValueTitle = getMessage('asset_port_code');
    if ('fp' === assetType) {
        selectValueTitle = getMessage('asset_jk_code');
    }
    var restriction = new Ab.view.Restriction();
    restriction.addClause('eq.asset_type', assetType);
    restriction.addClause('eq.asset_id', tcConnectController.getAssetCode());
    View.openDialog("ab-eam-telecom-console-connect-select-ports.axvw", restriction, false, {
        assetType: assetType,
        title: getMessage('selectValuePort') + ' ' +  selectValueTitle,
        callback: function (assetType, assetId, assetPort) {
            View.closeDialog();
            afterSelectPort(assetType, assetId, assetPort);
        }
    });
}
/**
 * Set new record to form based on selected port. the form is refreshed.
 * Set connection_form_changed set to false because it is not considered that the field is changed.
 * @param assetType
 * @param assetId
 * @param assetPort
 */
function afterSelectPort(assetType, assetId, assetPort) {
    tcConnectController.refreshConnectionForm(assetType, assetId, assetPort);
    tcConnectController.abEamTelConsConnectForm.setFieldValue('eq.asset_port', assetPort, null, false);
    tcConnectController.abEamTelConsConnectForm.setFieldTooltip('eq.asset_port', assetPort);
    connection_form_changed = false;
}
/**
 * Select telecom connectTo asset and ports
 * @param assetType
 * @param assetFieldName - field name of selected asset
 * @param assetParentFieldName - asset field parent to restrict selection and set value if exists
 */
function selectTcAsset(assetType, assetFieldName, assetParentFieldName) {
    var form = View.panels.get("abEamTelConsConnectForm");
    var restriction = new Ab.view.Restriction();
    restriction.addClause('eq.asset_type', assetType);
    var assetParentFieldValue = '';
    if (valueExistsNotEmpty(assetParentFieldName)) {
        assetParentFieldValue = form.getFieldValue(assetParentFieldName);
    }
    var assetParameters = {
        assetType: assetType,
        assetFieldName: assetFieldName,
        assetParentFieldName: assetParentFieldName,
        assetParentFieldValue: assetParentFieldValue
    };
    var selectValueTitle = getMessage('asset_port_code');
    if ('jk' === assetType) { 
        selectValueTitle = getMessage('asset_jk_code');
    }
    View.openDialog("ab-eam-telecom-console-connect-select-assets.axvw", restriction, false, {
        assetParameters: assetParameters,
        title: getMessage('selectValuePort') + ' ' + selectValueTitle,
        callback: function (assetType, assetId, assetPort, assetFieldName, assetParentFieldName) {
            View.closeDialog();
            afterSelectAsset(assetType, assetId, assetPort, assetFieldName, assetParentFieldName);
        }
    });
}
/**
 * Set connectTo field values and reset the other fields.
 * @param assetType
 * @param assetId
 * @param assetPort
 * @param assetFieldName
 */
function afterSelectAsset(assetType, assetId, assetPort, assetFieldName, assetParentFieldName) {
    var selectedValue = assetId;
    if ('eqport' === assetType || 'pnport' === assetType) {
        selectedValue = assetPort;
    }
    var form = View.panels.get("abEamTelConsConnectForm");
    form.setFieldValue(assetFieldName, selectedValue);
    if (valueExistsNotEmpty(assetPort)) {
        if ('jk' === assetType) {
            form.setFieldValue('eq.tc_fp_id', assetPort);
        } else {
            form.setFieldValue(assetParentFieldName, assetId);
        }
    }
    resetFields(assetFieldName, selectedValue);
}
/**
 * Reset fields based on connection assetType. Called from axvw.
 * For tc_eq_id, checks the equipment port required field.
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function resetFields(fieldName, selectedValue, previousValue) {
    var form = View.panels.get("abEamTelConsConnectForm");
    if ("eq.tc_jk_id" === fieldName) {
        form.setFieldValue("eq.tc_pn_id", "");
        form.setFieldValue("eq.tc_pnport_id", "");
        form.setFieldValue("eq.tc_eq_id", "");
        form.setFieldValue("eq.tc_eqport_id", "");
    }
    if ("eq.tc_fp_id" === fieldName) {
        form.setFieldValue("eq.tc_pn_id", "");
        form.setFieldValue("eq.tc_pnport_id", "");
        form.setFieldValue("eq.tc_eq_id", "");
        form.setFieldValue("eq.tc_eqport_id", "");
        form.setFieldValue("eq.tc_jk_id", "");
    }
    if ("eq.tc_pn_id" === fieldName) {
        form.setFieldValue("eq.tc_fp_id", "");
        form.setFieldValue("eq.tc_jk_id", "");
        form.setFieldValue("eq.tc_pnport_id", "");
        form.setFieldValue("eq.tc_eq_id", "");
        form.setFieldValue("eq.tc_eqport_id", "");
    }
    if ("eq.tc_pnport_id" === fieldName) {
        form.setFieldValue("eq.tc_fp_id", "");
        form.setFieldValue("eq.tc_jk_id", "");
        form.setFieldValue("eq.tc_eq_id", "");
        form.setFieldValue("eq.tc_eqport_id", "");
    }
    if ("eq.tc_eq_id" === fieldName) {
        form.setFieldValue("eq.tc_fp_id", "");
        form.setFieldValue("eq.tc_jk_id", "");
        form.setFieldValue("eq.tc_pn_id", "");
        form.setFieldValue("eq.tc_pnport_id", "");
        form.setFieldValue("eq.tc_eqport_id", "");
        this.setEquipmentPortFieldRequirement(selectedValue);
    }
    if ("eq.tc_eqport_id" === fieldName) {
        form.setFieldValue("eq.tc_fp_id", "");
        form.setFieldValue("eq.tc_jk_id", "");
        form.setFieldValue("eq.tc_pn_id", "");
        form.setFieldValue("eq.tc_pnport_id", "");
    }
    connection_form_changed = true;
}
/**
 * Set equipment port field required or not.
 * @param value - selected value
 */
function setEquipmentPortFieldRequirement(value) {
    var requiredAssetEqPort = false;
    if (valueExistsNotEmpty(value)) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("eq.eq_id", value, "=");
        requiredAssetEqPort = hasPort("eq", "eqport", restriction);
    }
    setFieldRequired('eq.tc_eqport_id', requiredAssetEqPort);
}
/**
 * Set field as required. When required, red star is added near the label field.
 * @param fieldName
 * @param required
 */
function setFieldRequired(fieldName, required) {
    var form = View.panels.get("abEamTelConsConnectForm");
    var fieldDef = form.fields.get(fieldName).fieldDef;
    if (fieldDef.required && required) {
        return;
    }
    fieldDef.required = required;
    if (required) {
        Ext.DomHelper.append('abEamTelConsConnectForm_' + fieldName + '_labelCell',
            '<span id="' + fieldName + '.required_star" class="required" name="' + fieldName + '.required_star">*</span>',
            true);
    } else if ($(fieldName + ".required_star")) {
        $(fieldName + ".required_star").remove();
    }
}
/**
 * Get asset field by asset type;
 * @param assetType
 * @returns {*} asset field
 */
function getAssetField(assetType) {
    var assetField = assetType;
    if ('pnport' === assetType) {
        assetField = 'pn';
    } else if ('eqport' === assetType) {
        assetField = 'eq';
    }
    return assetField;
}
/**
 * Call back function.
 */
function callbackHandler() {
    tcConnectController.callCallbackMethod();
}
/**
 * Calls WRF rule to get toward the client connection record.
 * @param assetType
 * @param assetCode
 * @param assetPort
 * @returns {*} dataRecord
 */
function getTowardTheClientConnection(assetType, assetCode, assetPort) {
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-getTowardTheClientConnection', assetType, assetCode, assetPort);
        if (result.code == 'executed') {
            return result.dataSet;
        }
    } catch (e) {
        Workflow.handleError(e);
        return null;
    }
}
/**
 * Check if asset has port.
 * @param sourceTableName
 * @param destinationTableName
 * @param restriction
 * @returns {boolean} true is asset has port.
 */
function hasPort(sourceTableName, destinationTableName, restriction) {
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