/**
 * Controller implementation.
 */
var abMetricScorecardCtrl = View.createController('abMetricScorecardCtrl', {

    /**
     * When this view is a dialog within the Home Page Editor, initialize to the restricting scorecard_code.
     */
	afterInitialDataFetch: function(){
		this.abExMetricScorecard_list.afterCreateCellContent = custAfterCreateCellContent;
		
		var scorecardCode = getUrlParameterValue('scorecard');
		if (scorecardCode.length > 0) {
			this.initializeFromUrlParameters(scorecardCode);
		}
	},

    /**
     * When this view is a dialog within the Home Page Editor, Save must
     * trigger the callback with the selected scorecard_code and close the dialog.
     */
    abExMetricScorecardDef_form_onSave: function() {
        if (View.parameters.callback && this.abExMetricScorecardDef_form.canSave()) {
            var fieldValues = this.abExMetricScorecardDef_form.getFieldValues();
            var selectedScorecardCode = fieldValues['afm_metric_scard_defs.scorecard_code'];
            View.parameters.callback(selectedScorecardCode);
            View.closeThisDialog();
        }
	},

    /**
     * When this view is a dialog within the Home Page Editor, Cancel must close the dialog.
     */
	abExMetricScorecardDef_form_onCancel: function() {
        if (View.parameters.callback) {
            View.closeThisDialog();
        }
	},

	/**
	 * When this view is a dialog within the Home Page Editor, initialize it to the
     * scorecard_code selection for abExMetricScorecardDef_list, abExMetricScorecardDef_form, and abExMetricScorecard_list.
	 * @param scorecard The restricting afm_metric_scard_defs.scorecard_code
	 */
	initializeFromUrlParameters: function(scorecard) {
		var rowCount = this.abExMetricScorecardDef_list.rows.length;
		for (var i = 0; i < rowCount;  i++) {
			var row = this.abExMetricScorecardDef_list.rows[i];
			if (scorecard === row['afm_metric_scard_defs.scorecard_code']) {
				this.abExMetricScorecardDef_list.selectRow(i);
				var panelRestriction = new Ab.view.Restriction({'afm_metric_scard_defs.scorecard_code':scorecard});
				this.abExMetricScorecardDef_form.refresh(panelRestriction, false);
				this.abExMetricScorecardDef_form.show(true);
				this.abExMetricScorecard_list.refresh(panelRestriction, false);
				this.abExMetricScorecard_list.show(true);
				break;
			}
		}
	}
});

/**
 * Delete grid row record
 * @param ctx command context
 */
function deleteGridRecord(ctx){
	var gridRow = ctx.row;
	var objGrid = gridRow.panel;
	var metricName = gridRow.getFieldValue('afm_metric_scards.metric_name');
	var scorecardCode = gridRow.getFieldValue('afm_metric_scards.scorecard_code');
	var confirmMessage = getMessage('confirmDeleteGridRow').replace('{0}', "'" + metricName + "'").replace('{1}', "'" + scorecardCode + "'");
	View.confirm(confirmMessage, function(button){
		if (button == 'yes') {
			// delete selected record
			try {
				var record = gridRow.getRecord();
				if (deleteRecord(record, objGrid.getDataSource())) {
					objGrid.refresh(objGrid.restriction);
				}
			} catch (e) {
				Workflow.handleError(e)
			}
		}
	});
}

/**
 * Custom afterCreateCellContent handler. 
 * 
 * @param row
 * @param column
 * @param cellElement
 */
function custAfterCreateCellContent(row, column, cellElement) {
	// set button label based on current record value
	if (column.id == 'displayOnScorecard') {
		var buttonTitle = row['afm_metric_scards.is_displayed.raw'] == 1? getMessage('titleHide'):getMessage('titleDisplay');
		cellElement.children[0].value = buttonTitle;
	}
	return true;
}

/**
 * Update grid row value;
 * @param ctx command context
 */
function updateGridRecord(ctx){
	var gridRow = ctx.row;
	var objGrid = gridRow.panel;
	var record = gridRow.getRecord();
	var isDisplayedOnScorecard = record.getValue('afm_metric_scards.is_displayed');
	isDisplayedOnScorecard = isDisplayedOnScorecard == 1?0:1;
	record.setValue('afm_metric_scards.is_displayed', isDisplayedOnScorecard);
	if (updateRecord(record, objGrid.getDataSource())) {
		objGrid.refresh(objGrid.restriction);
	}
}

/**
 * Delete selected grid rows.
 * 
 * @param ctx command context
 */
function deleteSelectedRows(ctx){
	var objGrid = View.panels.get(ctx.command.parentPanelId);
	var selectedRecords = objGrid.getSelectedRecords();
	if (selectedRecords.length > 0) {
		var scorecardCode = View.panels.get('abExMetricScorecardDef_form').getFieldValue('afm_metric_scard_defs.scorecard_code');
		var confirmMessage = getMessage('confirmDeleteSelectedRows').replace('{0}', "'" + scorecardCode + "'");
		View.confirm(confirmMessage, function(button){
			if (button == 'yes') {
				var isDeleted = false;
				for (var i =0 ; i < selectedRecords.length; i++ ) {
					if(deleteRecord(selectedRecords[i], objGrid.getDataSource())){
						isDeleted = true;
					}else{
						isDeleted = false;
						break;
					}
					if (isDeleted) {
						objGrid.refresh(objGrid.restriction);
					}
				}
			}
		});	
	}
}

/**
 * Update selected grid rows.
 * @param ctx command context
 */
function updateSelectedRows(ctx){
	var objGrid = View.panels.get(ctx.command.parentPanelId);
	var selectedRecords = objGrid.getSelectedRecords();
	if (selectedRecords.length > 0) {
		var isUpdated = false;
		for(var i=0; i < selectedRecords.length; i++){
			var record = selectedRecords[i];
			var isDisplayedOnScorecard = record.getValue('afm_metric_scards.is_displayed');
			isDisplayedOnScorecard = isDisplayedOnScorecard == 1?0:1;
			record.setValue('afm_metric_scards.is_displayed', isDisplayedOnScorecard);
			if (updateRecord(record, objGrid.getDataSource())) {
				isUpdated = true;
			}else{
				isUpdated = false;
				break;
			}
		}
		if (isUpdated) {
			objGrid.refresh(objGrid.restriction);
		}
	}
}

/**
 * Update record into database
 * 
 * @param record record object
 * @param dataSource datasource object
 */
function updateRecord(record, dataSource){
	try {
		dataSource.saveRecord(record);
		return true;
	} catch (e) {
		Workflow.handleError(e)
		return false;
	}
}

/**
 * Delete record into database
 * 
 * @param record record object
 * @param dataSource datasource object
 */
function deleteRecord(record, dataSource){
	try {
		dataSource.deleteRecord(record);
		return true;
	} catch (e) {
		Workflow.handleError(e)
		return false;
	}
}
