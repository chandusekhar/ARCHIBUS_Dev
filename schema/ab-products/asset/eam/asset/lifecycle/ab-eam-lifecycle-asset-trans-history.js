/**
 * Assets transactions history controller
 */
var abEamAssetTransHistoryCtrl = View.createController('abEamAssetTransHistoryCtrl', {
    // asset type
    assetType: null,

    //asset id
    assetId: null,
    /**
     * Set custom UI data to  transaction history panel
     */
    afterViewLoad: function () {
        this.abEamAssetTransactionHistory.afterCreateCellContent = function (row, column, cellElement) {
            // Localize asset status
            if ('asset_trans.status' === column.id) {
                var status = row.row.getFieldValue('asset_trans.status');
                if (valueExistsNotEmpty(status)) {
                    abEamAssetTransHistoryCtrl.localizeAssetStatus(row, column, cellElement, status);
                }
            }
        };
        // color changed field to red
        this.abEamAssetTransactionHistory.afterCreateDataRows = function (parentElement, columns) {
            var rows = this.gridRows;
            var previousIndexes = [];
            // because the panel is sorted be date descending, the first record is the last row
            // iterate from the last row to the first
            for (var i = rows.length - 1; i >= 0; i--) {
                var row = rows.get(i);
                var tranType = row.getFieldValue('asset_trans.trans_type'),
                    tranTypeFields = abEamAssetTransHistoryCtrl.fieldsByTransType[tranType];

                var currentIndex = i;
                var previousTransRow = null;
                if (i < rows.length - 1) {
                    previousTransRow = abEamAssetTransHistoryCtrl.getPreviousTransTypeRow(rows, tranType, currentIndex, previousIndexes);
                    if (previousTransRow) {
                        previousIndexes.push(previousTransRow.getIndex());
                    }
                }
                // check changes for each cell value
                row.cells.each(function (cell) {
                    var value = cell.row.getFieldValue(cell.column.id);
                    if (abEamAssetTransHistoryCtrl.containsElement(tranTypeFields, cell.column.id) && valueExistsNotEmpty(value)) {
                        if (valueExists(previousTransRow)) {
                            if (row.getIndex() === previousTransRow.getIndex()) {
                                cell.dom.style.color = 'Red';
                            } else {
                                var previousValue = previousTransRow.getFieldValue(cell.column.id);
                                var isLocationChanged = abEamAssetTransHistoryCtrl.isLocationChanged(row, previousTransRow, cell.column.id),
                                    isGeoLocationChanged = abEamAssetTransHistoryCtrl.isGeoLocationChanged(row, previousTransRow, cell.column.id),
                                    isOwnershipChanged = abEamAssetTransHistoryCtrl.isOwnershipChanged(row, previousTransRow, cell.column.id);
                                if (isLocationChanged || isOwnershipChanged || isGeoLocationChanged) {
                                    cell.dom.style.color = 'Red';
                                } else if (previousValue != value) {
                                    cell.dom.style.color = 'Red';
                                }
                            }
                        } else {
                            cell.dom.style.color = 'Red';
                        }
                    }
                });
            }
        };
    },
    /**
     * Set asset parameters.
     * @param assetType
     * @param assetId
     */
    setAssetParameters: function (assetType, assetId) {
        this.assetType = assetType;
        this.assetId = assetId;
        this.applyFieldsChanges();

    },
    /**
     * Apply fields changes.
     */
    applyFieldsChanges: function () {
        var fields = this.fieldsChanges[this.assetType];
        if (this.isOracleDataBase()) {
            for (var i = 0; i < fields.length; i++) {
                var fieldName = fields[i].fieldName,
                    visible = fields[i].visible,
                    modField = fields[i].modField || fieldName,
                    originalValue = fields[i].originalValue;
                this.abEamAssetTransactionHistory.addParameter('field_oracle_' + fieldName, String.format(this.sqlFieldOracle, modField, originalValue));
                this.abEamAssetTransactionHistory.showColumn('asset_trans.' + fieldName, visible);
            }
            this.abEamAssetTransactionHistory.update();
        } else {
            for (var i = 0; i < fields.length; i++) {
                var fieldName = fields[i].fieldName,
                    visible = fields[i].visible,
                    modField = fields[i].modField || fieldName,
                    originalValue = fields[i].originalValue;
                this.abEamAssetTransactionHistory.addParameter('field_generic_' + fieldName, String.format(this.sqlFieldGeneric, modField, originalValue));
                this.abEamAssetTransactionHistory.showColumn('asset_trans.' + fieldName, visible);
            }
            this.abEamAssetTransactionHistory.update();
        }
    },
    /**
     * Apply field changes
     * @param fieldsWithRestriction {id: 'id', restriction: 'restriction'}
     */
    applyFieldChangesRestriction: function (fieldsWithRestriction) {
        for (var i = 0; i < fieldsWithRestriction.length; i++) {
            var id = fieldsWithRestriction[i].id;
            var fieldChange = this.getFieldChange(id);
            if (valueExists(fieldChange)) {
                fieldChange.restriction = fieldsWithRestriction[i].restriction;
            }
        }
    },
    /**
     * Get field change by id
     * @param id
     * @returns {*} fieldChange object
     */
    getFieldChange: function (id) {
        var fields = this.fieldsChanges[this.assetType];
        var i = fields.length;
        while (i--) {
            if (fields[i].fieldName === id) {
                return fields[i];
            }
        }
        return null;
    },
    /**
     * Localize asset status based on asset type
     * @param row
     * @param column
     * @param cellElement
     */
    localizeAssetStatus: function (row, column, cellElement, status) {
        var statusDSHelper = View.dataSources.get('abAssetStatus_ds');
        var statusLayout = statusDSHelper.fieldDefs.get(this.assetType + '.status').enumValues[status];
        cellElement.childNodes[0].textContent = statusLayout;
    },
    /**
     * Check database the project used is oracle database.
     */
    isOracleDataBase: function () {
        var checkDS = View.dataSources.get('dsIsOracle');
        return parseInt(checkDS.getRecord().getValue('afm_tbls.table_name')) > 0;
    },
    /**
     * Get previous transaction type row
     * @param rows
     * @param transType
     * @param index
     * @param previousIndexes
     * @returns {*} row object
     */
    getPreviousTransTypeRow: function (rows, transType, index, previousIndexes) {
        var i = rows.length;
        while (i--) {
            var row = rows.get(i);
            var previousTranType = row.getFieldValue('asset_trans.trans_type');
            if (transType === previousTranType && i > index && !this.containsElement(previousIndexes, i)) {
                return row;
            }
        }
        // second row on top
        return rows.get(i + 2);
    },
    /**
     * Check if location is changed (bl_id, fl_id)
     * @param row
     * @param previousRow
     * @param id
     * @returns {boolean}
     */
    isLocationChanged: function (row, previousRow, id) {
        var blId = row.getFieldValue('asset_trans.bl_id'),
            flId = row.getFieldValue('asset_trans.fl_id');
        var previousBlId = previousRow.getFieldValue('asset_trans.bl_id'),
            previousFlId = previousRow.getFieldValue('asset_trans.fl_id');
        var isChanged = false;
        if ('asset_trans.rm_id' === id && blId === previousBlId && flId != previousFlId) {
            isChanged = true;
        }
        if ('asset_trans.fl_id' === id && blId != previousBlId) {
            isChanged = true;
        }
        if ('asset_trans.bl_id' === id && blId != previousBlId) {
            isChanged = true;
        }
        return isChanged;
    },
    /**
     * Check if geo location is changed (state_id, ctry__id)
     * @param row
     * @param previousRow
     * @param id
     * @returns {boolean}
     */
    isGeoLocationChanged: function (row, previousRow, id) {
        var ctryId = row.getFieldValue('asset_trans.ctry_id'),
            stateId = row.getFieldValue('asset_trans.state_id');

        var previousCtryId = previousRow.getFieldValue('asset_trans.ctry_id'),
            previousStateId = previousRow.getFieldValue('asset_trans.state_id');
        var isChanged = false;
        if ('asset_trans.city_id' === id && ctryId === previousCtryId && stateId != previousStateId) {
            isChanged = true;
        }
        if ('asset_trans.state_id' === id && ctryId != previousCtryId) {
            isChanged = true;
        }
        if ('asset_trans.ctry_id' === id && ctryId != previousCtryId) {
            isChanged = true;
        }
        return isChanged;
    },
    /**
     * Check if ownership is changed (bu_id, dv_id)
     * @param row
     * @param previousRow
     * @param id
     * @returns {boolean}
     */
    isOwnershipChanged: function (row, previousRow, id) {
        var buId = row.getFieldValue('asset_trans.bu_id'),
            dvId = row.getFieldValue('asset_trans.dv_id');
        var previousBuId = previousRow.getFieldValue('asset_trans.bu_id'),
            previousDvId = previousRow.getFieldValue('asset_trans.dv_id');
        var isChanged = false;
        if ('asset_trans.dp_id' === id && buId === previousBuId && dvId != previousDvId) {
            isChanged = true;
        }
        if ('asset_trans.dv_id' === id && buId != previousBuId) {
            isChanged = true;
        }
        if ('asset_trans.bu_id' === id && buId != previousBuId) {
            isChanged = true;
        }
        return isChanged;
    },
    /**
     * Check if list contains element.
     * @param list
     * @param obj
     * @returns {boolean}
     */
    containsElement: function (list, obj) {
        var i = list.length;
        while (i--) {
            if (list[i] === obj) {
                return true;
            }
        }
        return false;
    },
    /**
     * Mapping fields by transaction type.
     */
    fieldsByTransType: {
        'Location': ['asset_trans.bl_id', 'asset_trans.fl_id', 'asset_trans.rm_id', 'asset_trans.address1', 'asset_trans.address2',
            'asset_trans.city_id', 'asset_trans.state_id', 'asset_trans.ctry_id', 'asset_trans.lat', 'asset_trans.lon'],
        'Ownership': ['asset_trans.dv_id', 'asset_trans.dp_id', 'asset_trans.bu_id', 'asset_trans.ac_id'],
        'Value': ['asset_trans.cost_purchase', 'asset_trans.cost_dep_value', 'asset_trans.cost_replace',
            'asset_trans.value_market', 'asset_trans.value_book', 'asset_trans.value_salvage'],
        'Status': ['asset_trans.status']
    },
    /**
     * Mapping fields value and visibility.
     * Data taken from datachangelistener.properties file
     */
    fieldsChanges: {
        'eq': [
            {fieldName: 'bl_id', visible: true, originalValue: '(SELECT eq.bl_id FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'fl_id', visible: true, originalValue: '(SELECT eq.fl_id FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'rm_id', visible: true, originalValue: '(SELECT eq.rm_id FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'dv_id', visible: true, originalValue: '(SELECT eq.dv_id FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'dp_id', visible: true, originalValue: '(SELECT eq.dp_id FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'bu_id', modField: 'dv_id', visible: true, originalValue: '(SELECT eq.dv_id FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'cost_purchase', visible: true, originalValue: '(SELECT ${sql.convertToString(\'eq.cost_purchase\')} FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'cost_dep_value', visible: true, originalValue: '(SELECT ${sql.convertToString(\'eq.cost_dep_value\')} FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'cost_replace', visible: true, originalValue: '(SELECT ${sql.convertToString(\'eq.cost_replace\')} FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'status', visible: true, originalValue: '(SELECT eq.status FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'ac_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'address1', visible: false, originalValue: ' NULL'},
            {fieldName: 'address2', visible: false, originalValue: ' NULL'},
            {fieldName: 'city_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'state_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'ctry_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'lat', visible: false, originalValue: '(SELECT ${sql.convertToString(\'eq.lat\')} FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'lon', visible: false, originalValue: '(SELECT ${sql.convertToString(\'eq.lon\')} FROM eq WHERE eq.eq_id = asset_trans.asset_id)'},
            {fieldName: 'value_market', visible: false, originalValue: ' NULL'},
            {fieldName: 'value_book', visible: false, originalValue: ' NULL'},
            {fieldName: 'value_salvage', visible: false, originalValue: '(SELECT ${sql.convertToString(\'eq.value_salvage\')} FROM eq WHERE eq.eq_id = asset_trans.asset_id)'}
        ],
        'ta': [
            {fieldName: 'bl_id', visible: true, originalValue: '(SELECT ta.bl_id FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'fl_id', visible: true, originalValue: '(SELECT ta.fl_id FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'rm_id', visible: true, originalValue: '(SELECT ta.rm_id FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'dv_id', visible: true, originalValue: '(SELECT ta.dv_id FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'dp_id', visible: true, originalValue: '(SELECT ta.dp_id FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'bu_id', modField: 'dv_id', visible: true, originalValue: '(SELECT ta.dv_id FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'cost_purchase', modField: 'value_original', visible: true, originalValue: '(SELECT ${sql.convertToString(\'ta.value_original\')} FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'cost_dep_value', visible: false, originalValue: ' NULL'},
            {fieldName: 'cost_replace', modField: 'value_replace', visible: true, originalValue: '(SELECT ${sql.convertToString(\'ta.value_replace\')} FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'status', visible: true, originalValue: '(SELECT ta.status FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'ac_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'address1', visible: false, originalValue: ' NULL'},
            {fieldName: 'address2', visible: false, originalValue: ' NULL'},
            {fieldName: 'city_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'state_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'ctry_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'lat', visible: false, originalValue: '(SELECT ${sql.convertToString(\'ta.lat\')} FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'lon', visible: false, originalValue: '(SELECT ${sql.convertToString(\'ta.lon\')} FROM ta WHERE ta.ta_id = asset_trans.asset_id)'},
            {fieldName: 'value_market', visible: false, originalValue: ' NULL'},
            {fieldName: 'value_book', visible: false, originalValue: ' NULL'},
            {fieldName: 'value_salvage', visible: true, originalValue: '(SELECT ${sql.convertToString(\'ta.value_salvage\')} FROM ta WHERE ta.ta_id = asset_trans.asset_id)'}
        ],
        'bl': [
            {fieldName: 'bl_id', visible: false, originalValue: '(SELECT bl.bl_id FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'fl_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'rm_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'dv_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'dp_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'bu_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'cost_purchase', visible: false, originalValue: ' NULL'},
            {fieldName: 'cost_dep_value', visible: false, originalValue: ' NULL'},
            {fieldName: 'cost_replace', visible: false, originalValue: ' NULL'},
            {fieldName: 'status', visible: true, originalValue: '(SELECT bl.status FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'ac_id', visible: true, originalValue: '(SELECT bl.ac_id FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'address1', visible: true, originalValue: '(SELECT bl.address1 FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'address2', visible: true, originalValue: '(SELECT bl.address2 FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'city_id', visible: true, originalValue: '(SELECT bl.city_id FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'state_id', visible: true, originalValue: '(SELECT bl.state_id FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'ctry_id', visible: true, originalValue: '(SELECT bl.ctry_id FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'lat', visible: true, originalValue: '(SELECT ${sql.convertToString(\'bl.lat\')} FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'lon', visible: true, originalValue: '(SELECT ${sql.convertToString(\'bl.lon\')} FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'value_market', visible: true, originalValue: '(SELECT ${sql.convertToString(\'bl.value_market\')} FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'value_book', visible: true, originalValue: '(SELECT ${sql.convertToString(\'bl.value_book\')} FROM bl WHERE bl.bl_id = asset_trans.asset_id)'},
            {fieldName: 'value_salvage', visible: false, originalValue: ' NULL'}
        ],
        'property': [
            {fieldName: 'bl_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'fl_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'rm_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'dv_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'dp_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'bu_id', visible: false, originalValue: ' NULL'},
            {fieldName: 'cost_purchase', visible: true, originalValue: '(SELECT ${sql.convertToString(\'property.cost_purchase\')} FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'cost_dep_value', visible: false, originalValue: ' NULL'},
            {fieldName: 'cost_replace', visible: false, originalValue: ' NULL'},
            {fieldName: 'status', visible: true, originalValue: '(SELECT property.status FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'ac_id', visible: true, originalValue: '(SELECT property.ac_id FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'address1', visible: true, originalValue: '(SELECT property.address1 FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'address2', visible: true, originalValue: '(SELECT property.address2 FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'city_id', visible: true, originalValue: '(SELECT property.city_id FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'state_id', visible: true, originalValue: '(SELECT property.state_id FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'ctry_id', visible: true, originalValue: '(SELECT property.ctry_id FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'lat', visible: true, originalValue: '(SELECT ${sql.convertToString(\'property.lat\')} FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'lon', visible: true, originalValue: '(SELECT ${sql.convertToString(\'property.lon\')} FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'value_market', visible: true, originalValue: '(SELECT ${sql.convertToString(\'property.value_market\')} FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'value_book', visible: true, originalValue: '(SELECT ${sql.convertToString(\'property.value_book\')} FROM property WHERE property.pr_id = asset_trans.asset_id)'},
            {fieldName: 'value_salvage', visible: false, originalValue: ' NULL'}
        ]
    },
    /**
     * SQL GENERIC statement for field value.
     * Returns modified field value if exists on a certain date and time.
     * If value is null, return the last 1 value that is older than the transaction date
     */
    sqlFieldGeneric: "(CASE  " +
	" WHEN EXISTS(SELECT asset_trans_int.value_new FROM asset_trans ${sql.as} asset_trans_int  " + 
	"				WHERE asset_trans_int.mod_table = asset_trans.mod_table AND asset_trans_int.asset_id = asset_trans.asset_id  " +
	"					AND asset_trans_int.date_trans = asset_trans.date_trans AND asset_trans_int.time_trans = asset_trans.time_trans  " +
	"					AND asset_trans_int.value_new IS NULL  AND asset_trans_int.mod_field = '{0}') " +
	" THEN NULL  " +
	" WHEN NOT EXISTS(SELECT asset_trans_int.auto_number   " +
	"	FROM asset_trans ${sql.as} asset_trans_int   " +
	"	WHERE asset_trans_int.mod_table = asset_trans.mod_table " + 
	"		   AND asset_trans_int.asset_id = asset_trans.asset_id AND asset_trans_int.mod_field = '{0}') " +
	" THEN {1} " +
	" ELSE  " +
	"	ISNULL((SELECT asset_trans_int.value_new " + 
	"		FROM asset_trans ${sql.as} asset_trans_int   " +
	"		WHERE asset_trans_int.mod_table = asset_trans.mod_table AND asset_trans_int.asset_id = asset_trans.asset_id " + 
	"				AND asset_trans_int.date_trans = asset_trans.date_trans AND asset_trans_int.time_trans = asset_trans.time_trans AND asset_trans_int.mod_field = '{0}'), " + 
	"	(SELECT TOP 1 asset_trans_int.value_new  " +
	"		FROM asset_trans ${sql.as} asset_trans_int  " +
	"		WHERE asset_trans_int.mod_table = asset_trans.mod_table AND asset_trans_int.asset_id = asset_trans.asset_id " + 
	"				AND ${sql.timestamp('asset_trans_int.date_trans', 'asset_trans_int.time_trans')} &lt; ${sql.timestamp('asset_trans.date_trans', 'asset_trans.time_trans')} " + 
	"				AND asset_trans_int.mod_field = '{0}'  " +
	"		ORDER BY asset_trans_int.date_trans ${sql.concat}' '${sql.concat} asset_trans_int.time_trans DESC)) " +           
    " END)",
    /**
     * SQL ORACLE statement for field value.
     * Returns modified field value if exists on a certain date and time.
     * If value is null, return the last 1 value that is older than the transaction date
     */
    sqlFieldOracle: "(CASE " +
	" WHEN EXISTS(SELECT asset_trans_int.value_new FROM asset_trans ${sql.as} asset_trans_int " + 
	"				WHERE asset_trans_int.mod_table = asset_trans.mod_table AND asset_trans_int.asset_id = asset_trans.asset_id " +
	"					AND asset_trans_int.date_trans = asset_trans.date_trans AND asset_trans_int.time_trans = asset_trans.time_trans " +
	"					AND asset_trans_int.value_new IS NULL  AND asset_trans_int.mod_field = '{0}')" +
	" THEN NULL " +
	" WHEN NOT EXISTS(SELECT asset_trans_int.auto_number  " +
	"	FROM asset_trans ${sql.as} asset_trans_int  " +
	"	WHERE asset_trans_int.mod_table = asset_trans.mod_table " + 
	"		   AND asset_trans_int.asset_id = asset_trans.asset_id AND asset_trans_int.mod_field = '{0}') " +
	" THEN {1} " +
	" ELSE  " +
	"	NVL((SELECT asset_trans_int.value_new " + 
	"		FROM asset_trans ${sql.as} asset_trans_int " +  
	"		WHERE asset_trans_int.mod_table = asset_trans.mod_table AND asset_trans_int.asset_id = asset_trans.asset_id " + 
	"				AND asset_trans_int.date_trans = asset_trans.date_trans AND asset_trans_int.time_trans = asset_trans.time_trans AND asset_trans_int.mod_field = '{0}'), " + 
	"	(SELECT value_new FROM  " +
	"		(SELECT tmp_asset_trans.value_new, tmp_asset_trans.asset_id,tmp_asset_trans.mod_table,tmp_asset_trans.mod_field, " +
	"			tmp_asset_trans.date_trans, tmp_asset_trans.time_trans FROM asset_trans ${sql.as} tmp_asset_trans " +
	"		WHERE tmp_asset_trans.mod_field = '{0}'  " +
	"		ORDER BY tmp_asset_trans.date_trans DESC, tmp_asset_trans.time_trans DESC) ${sql.as} sort_asset_trans " +
	"	WHERE ROWNUM = 1 AND sort_asset_trans.mod_table = asset_trans.mod_table AND sort_asset_trans.asset_id = asset_trans.asset_id " +
	"	AND ${sql.timestamp('sort_asset_trans.date_trans', 'sort_asset_trans.time_trans')} &lt; ${sql.timestamp('asset_trans.date_trans', 'asset_trans.time_trans')})) " +           
    " END)"
});