var abEamAssetReconcileSelectController = View.createController('abEamAssetReconcileSelectController', {

    abEamReconcile_conn_select_onContinue: function () {
        var connSelectPanel = View.panels.get('abEamReconcile_conn_select'),
            conn = connSelectPanel.getFieldValue('afm_connector.connector_id'),
            destinationTbl = connSelectPanel.getFieldValue('afm_connector.destination_tbl'),
            dateLog = connSelectPanel.getFieldValue('afm_connector.date_log'),
            dateLogIso = connSelectPanel.record.getValue('afm_connector.date_log_iso');
        
        if (!valueExistsNotEmpty(conn)) {
            View.showMessage(getMessage("noConnSelected"));
            return;
        }
        if (!valueExistsNotEmpty(dateLogIso)) {
            View.showMessage(getMessage("noDateSelected"));
            return;
        }
        var reconcileTabs = View.getOpenerView().panels.get('abEamReconcileTabs');
        this.enableAssetsTabs(reconcileTabs, dateLog);
        var sourceSystemId = this.getSourceSystemId(conn);
        var parameters = {
            connector: conn,
            sourceSystemId: sourceSystemId,
            dateLog: dateLogIso,
            sourceTable: destinationTbl
        };
        reconcileTabs.parameters = parameters;
        reconcileTabs.selectTab('abEamReconcileTabs_asset_added');
    },

    /**
     * enabled reconcile tabs and sets title
     * @param reconcileTabs
     * @param dateLog
     */
    enableAssetsTabs: function (reconcileTabs, dateLog) {
        reconcileTabs.enableTab('abEamReconcileTabs_asset_added');
        reconcileTabs.enableTab('abEamReconcileTabs_asset_deleted');
        reconcileTabs.enableTab('abEamReconcileTabs_asset_updated');

        reconcileTabs.setTabTitle('abEamReconcileTabs_asset_added', String.format(getMessage('assetsAddedTitle'), dateLog));
        reconcileTabs.setTabTitle('abEamReconcileTabs_asset_deleted', String.format(getMessage('assetsDeletedTitle'), dateLog));
        reconcileTabs.setTabTitle('abEamReconcileTabs_asset_updated', String.format(getMessage('assetsUpdatedTitle'), dateLog));
    },
    
    getSourceSystemId: function (connectorId) {
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('afm_conn_flds.connector_id', connectorId);
    	var record = View.dataSources.get('connectorFields_ds').getRecord(restriction);
    	return record.getValue('afm_conn_flds.parameter');
    }
});

/**
 * On click date_log row
 * @param context
 */
function onSelectDateRow(context){
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var panel = View.panels.get("abEamReconcile_conn_select");
	var record = selectedRow.getRecord();
	panel.setFieldValue("afm_connector.connector_id", record.getValue('afm_conn_log.connector_id'));
	panel.setFieldValue("afm_connector.date_log", localizeDateLog(record.getValue('afm_conn_log.date_log')));
	panel.setFieldValue("afm_connector.destination_tbl", record.getValue('afm_connector.destination_tbl'));
	panel.record.setValue("afm_connector.date_log_iso", record.getValue('afm_conn_log.date_log_iso'));
	parentPanel.closeWindow();
}

/**
 * Localize data log value
 * @param dateValue
 * @returns {*|string} localized date value
 */
function localizeDateLog(dateValue) {
    var dataSource = View.dataSources.get('connectorLog_ds');
    var parsedValue = dataSource.parseValue('afm_conn_log.date_log', dateValue, false);
    var localizedDateLog =  dataSource.formatValue('afm_conn_log.date_log', parsedValue, true);
    return localizedDateLog;
}

/**
 * onchange listener for date field
 * @param el
 */
function validateDate(el) {
    var value = formatDate(el.value);
    el.value = localizeDateLog(value);
    var panel = View.panels.get("abEamReconcile_conn_select");
    panel.record.setValue("afm_connector.date_log_iso", value);
}

/**
 * format date value to YYYY-MM-DD
 * @param value
 * @returns {*}
 */
function formatDate(value) {
    var temp_date_array = [];
    if (isBeingISODateFormat(value)) {
        var temArray = value.split("-");
        temp_date_array['year'] = temArray[0];
        temp_date_array['month'] = temArray[1];
        temp_date_array['day'] = temArray[2];
    } else {
        temp_date_array = gettingYearMonthDayFromDate(value);
    }
    var sd = new Date();
    sd.format(strDateShortPattern);
    var formattedDate = FormattingDate(temp_date_array["day"], temp_date_array["month"], temp_date_array["year"], 'YYYY-MM-DD');
    return formattedDate;
}