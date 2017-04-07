var abEamReceiptParamCtrl = View.createController('abEamReceiptParamCtrl', {
    /**
     * createMode: single/multiple
     */
    createMode: null,
    assetType: null,
    activeCommonPanelData: null,
    // asset pk fields size
    assetLength: {},
    maxZeroSequence: 5,

    loadParameters: function (type) {
        this.createMode = type;
        var actionTitle = getMessage("tilePanelGenerateAssets");
        if ("single" === type) {
            actionTitle = getMessage("tilePanelNext");
            this.abEamReceiptParameters.setFieldValue('no_assets', 1);
            this.abEamReceiptParameters.enableField('no_assets', false);
        }

        this.abEamReceiptParameters.actions.get('create').setTitle(actionTitle);
        this.abEamReceiptParameters.show();

        this.assetLength = {
            property: this.abEamReceiptCommonData_property_ds.fieldDefs.get('property.pr_id').size,
            bl: this.abEamReceiptCommonData_bl_ds.fieldDefs.get('bl.bl_id').size,
            eq: this.abEamReceiptCommonData_eq_ds.fieldDefs.get('eq.eq_id').size,
            ta: this.abEamReceiptCommonData_ta_ds.fieldDefs.get('ta.ta_id').size
        }
        View.setTitle(getMessage("add_asset_" + type + "_title"));
    },

    onChangeAssetType: function (assetType) {
        this.assetType = assetType;
        this.resetParameters();
        calculateLastId();
        if ("multiple" === this.createMode) {
            if (valueExists(this.activeCommonPanelData)) {
                this.activeCommonPanelData.show(false);
            }
            this.activeCommonPanelData = View.panels.get('abEamReceiptCommonData_' + this.assetType + '_form');
            this.activeCommonPanelData.show(true);
        }
    },

    abEamReceiptParameters_onCreate: function () {
        if (valueExists(this.assetType)) {
            var prefix = this.abEamReceiptParameters.getFieldValue('prefix').toUpperCase(),
                nextId = this.abEamReceiptParameters.getFieldValue('next_id').toUpperCase();
            var parameters = {
                createMode: this.createMode,
                assetType: this.assetType,
                prefix: prefix,
                nextId: nextId,
                actionTitle: getMessage('saveAction_title_' + this.createMode)
            };
            if ("multiple" === this.createMode) {
                var noAssets = this.abEamReceiptParameters.getFieldValue('no_assets');

                if (!valueExistsNotEmpty(noAssets)) {
                    View.showMessage(getMessage("invalidNoAssets"));
                    return;
                }
                if (!valueExistsNotEmpty(nextId)) {
                    View.showMessage(getMessage("noNextId"));
                    return;
                }
                // nextId needs to contain the prefix if exists
                if (valueExistsNotEmpty(prefix) && valueExistsNotEmpty(nextId)) {
                    if (nextId.indexOf(prefix) != 0) {
                        View.showMessage(getMessage("noPrefixInNextId"));
                        return;
                    }
                }
                var maxAssetLength = this.assetLength[this.assetType];
                if (nextId.length > maxAssetLength) {
                    View.showMessage(String.format(getMessage('maxChar'), maxAssetLength));
                    return;
                }
                var commonDataRecord = this.activeCommonPanelData.getRecord();
                try {
                    var jobName = "AbAssetEAM-AssetReceiptService-createMultipleAssets";
                    var jobId = Workflow.startJob(jobName, this.assetType, commonDataRecord, Number(noAssets), prefix, nextId);
                    var message = String.format(getMessage('loadingCreateAssets'), getMessage('asset_type_' + this.assetType));
                    View.openJobProgressBar(message, jobId, '', function (status) {
                        if (valueExists(status.dataSet) && valueExists(status.dataSet.records)) {
                            var restriction = "bl.asset_id IN " + createSQLRestriction(status.dataSet.records);
                            restriction += " AND bl.asset_type ='" + parameters.assetType + "'";
                            View.parameters.callback("ab-eam-receipt-asset-registry.axvw", restriction, false, parameters);
                        }
                    });
                } catch (e) {
                    Workflow.handleError(e);
                    return false;
                }
            } else {
                // nextId needs to contain the prefix if exists
                if (valueExistsNotEmpty(prefix) && valueExistsNotEmpty(nextId)) {
                    if (nextId.indexOf(prefix) != 0) {
                        View.showMessage(getMessage("noPrefixInNextId"));
                        return;
                    }
                }
                var maxAssetLength = this.assetLength[this.assetType];
                if (nextId.length > maxAssetLength) {
                    View.showMessage(String.format(getMessage('maxChar'), maxAssetLength));
                    return;
                }
                if (!assetExists(this.assetType, nextId)) {
                    var viewName = '';
                    if ('bl' === this.assetType) {
                        viewName = 'ab-eam-def-geo-loc.axvw';
                    } else if ('property' === this.assetType) {
                        viewName = 'ab-rplm-properties-define-form.axvw';
                    } else if ('eq' === this.assetType) {
                        viewName = 'ab-eq-edit-form.axvw';
                    } else if ('ta' === this.assetType) {
                        viewName = 'ab-ta-edit-form.axvw';
                    }

                    View.parameters.callback(viewName, null, true, parameters);
                } else {
                    View.showMessage(String.format(getMessage("assetExists"), getMessage("asset_type_" + this.assetType), nextId));
                }
            }
        } else {
            View.showMessage(getMessage("noAssetTypeSelected"));
        }
    },

    resetParameters: function () {
        this.abEamReceiptParameters.setFieldValue("prefix", "");
        this.abEamReceiptParameters.setFieldValue("next_id", "");
        this.abEamReceiptParameters.setFieldValue("last_id", "");
    },

    applySequenceNextId: function () {
        var prefix = this.abEamReceiptParameters.getFieldValue("prefix"),
            lastId = this.abEamReceiptParameters.getFieldValue("last_id");
        if (valueExistsNotEmpty(prefix) && !valueExistsNotEmpty(lastId)) {
            this.abEamReceiptParameters.setFieldValue("next_id", this.getNextId(prefix));
        } else if (valueExistsNotEmpty(lastId)) {
            this.abEamReceiptParameters.setFieldValue("next_id", this.getNextId(lastId, true));
        } else {
            this.abEamReceiptParameters.setFieldValue("next_id", this.getNextId(''));
        }
    },
    // if last id ends with numbers increment those to create the start id, else add '000001' to create the start id.
    getNextId: function (lastId, existsLastId) {
        var regex = /[^0-9]*([0-9]+)$/g,
            matchResult,
            match,
            prefix,
            nextId,
            nextNumber;
        if (existsLastId && lastId.match(regex)) {
            match = regex.exec(lastId);
            matchResult = match[1];
            nextNumber = (parseInt(matchResult) + 1).toString();
            prefix = lastId.substr(0, lastId.length - matchResult.length);
            if (Ext.isEmpty(prefix)) {
                prefix = lastId.substr(0, lastId.length - matchResult.length);
            }
            //add leading zeros
            while (matchResult.length > nextNumber.length) {
                nextNumber = '0' + nextNumber;
            }
            nextId = prefix + nextNumber;
        } else {
            var assetLength = this.assetLength[this.assetType];
            if (lastId.length < assetLength) {
                var zero = '';
                var noZeros = assetLength - (lastId.length + 1);
                if (noZeros > this.maxZeroSequence) {
                    noZeros = this.maxZeroSequence;
                }
                for (var i = 0; i < noZeros; i++) {
                    zero += '0';
                }
                nextId = lastId + zero + '1';
            }
        }
        return nextId;
    }
});
/**
 * get last id and sets the next id based on prefix
 */
function calculateLastId() {
    var controller = View.controllers.get('abEamReceiptParamCtrl');
    var assetType = controller.assetType,
        prefix = controller.abEamReceiptParameters.getFieldValue('prefix');
    if (valueExists(assetType)) {
        var lastId = getLastId(assetType, prefix);
        controller.abEamReceiptParameters.setFieldValue('last_id', lastId);
        controller.applySequenceNextId();
    } else {
        View.showMessage(getMessage("noAssetTypeSelected"));
    }
}

/**
 * get a list of prefixes for asset
 * prefix list by searching for one of the following characters "-", "_", "|", "\", "/", "."
 * @returns {boolean}
 */
function selectPrefixes() {
    var controller = View.controllers.get('abEamReceiptParamCtrl');
    var assetType = controller.assetType;
    if (valueExists(assetType)) {
    	var title = getMessage("select_value") + ' - ' + String.format(getMessage("prefix"), getMessage("asset_type_" + assetType));
        View.openDialog("ab-eam-receipt-prefixes.axvw", null, false, {
            width: 800,
            height: 600,
            assetType: assetType,
            title: title,
            callback: function (prefix) {
                View.panels.get("abEamReceiptParameters").setFieldValue("prefix", prefix);
                View.closeDialog();
                calculateLastId();
            }
        });
    } else {
        View.showMessage(getMessage("noAssetTypeSelected"));
    }
}

/**
 * creates sql restriction from created records
 * @param records
 * @returns {string}
 */
function createSQLRestriction(records) {
    var controller = View.controllers.get('abEamReceiptParamCtrl');
    var pkFieldName = controller.assetType + "." + controller.assetType + "_id";
    if ("property" === controller.assetType) {
        pkFieldName = controller.assetType + "." + "pr_id";
    }

    var resultedString = "('" + records[0].getValue(pkFieldName) + "'";
    for (var i = 1; i < records.length; i++) {
        resultedString += " ,'" + records[i].getValue(pkFieldName) + "'";
    }
    resultedString += ")";
    return resultedString;
}
