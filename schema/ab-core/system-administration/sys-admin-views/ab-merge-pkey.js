/**
 * Controller for the Merge Primary Key View.
 */
var mergePrimaryKeyCtrl = View.createController('mergePrimaryKey', {

	tableName : null,
	length : null,
	reportTask : null,
	reportTaskRunner : null,
	jobId: null,

	/*
	 * This function is called after the view is loaded and all panels are constructed,
	 * but before initial data fetch.
	 */
	afterViewLoad : function() {
		//this.consoleTableNamePanel.setFieldValue('');
		this.consoleTableNamePanel.addEventListener("onAutoCompleteSelect", this.onAutoCompleteSelect.createDelegate(this));
	},

	fromPKNamePanel_enterFromValue_onClick : function(row) {
		var childController = this;
		View.openDialog('ab-merge-pkey-select-value.axvw', {}, true, {
			width : 800,
			height : 600,
			closeButton : false,
			isDialog : true,
			afterInitialDataFetch : function(dialogView) {
				var dialogController = dialogView.controllers
						.get('inputPrimaryKey');
				dialogController.setInputParameters(
						mergePrimaryKeyCtrl.tableName,
						row.record['afm_flds.field_name'], 
						childController,
						'from', 
						mergePrimaryKeyCtrl.length, 
						row.record['afm_flds.ml_heading'],
						row.record.index)
			}
		});
	},

	toPKNamePanel_enterToValue_onClick : function(row) {
		var childController = this;
		View.openDialog('ab-merge-pkey-select-value.axvw', {}, true, {
			width : 800,
			height : 600,
			closeButton : false,
			isDialog : true,
			afterInitialDataFetch : function(dialogView) {
				var dialogController = dialogView.controllers
						.get('inputPrimaryKey');
				dialogController.setInputParameters(
						mergePrimaryKeyCtrl.tableName,
						row.record['afm_flds.field_name'], 
						childController,
						'to', 
						mergePrimaryKeyCtrl.length,
						row.record['afm_flds.ml_heading'],
						row.record.index)
			}
		});
	},

	fromPKNamePanel_clearFromValue_onClick : function(row) {
		this.fromPKNamePanel.gridRows.items[row.record.index].setFieldValue('afm_flds.value', "");
	},
	toPKNamePanel_clearToValue_onClick : function(row) {
		this.toPKNamePanel.gridRows.items[row.record.index].setFieldValue('afm_flds.value', "");
	},

	// start auto-refresh background task using Ext.util.TaskRunner
	startReportTask : function(controller) {
		this.reportTask = {
			run : function() {
				var status = Workflow.getJobStatus(controller.jobId);
				//if FAILED
				if (status.jobStatusCode == 8) {
					View.closeProgressBar();
					controller.reportTaskRunner.stop(controller.reportTask);
					var failedMessage = getMessage('warning_multiple_pk');
					View.showMessage(failedMessage);
				}
			},
			interval : 10
		}
		this.reportTaskRunner = new Ext.util.TaskRunner();
		this.reportTaskRunner.start(this.reportTask);
	},

	consoleTableNamePanel_onMerge : function() {
		
		var tblname = "";

		if (valueExistsNotEmpty(this.consoleTableNamePanel
				.getFieldValue('afm_tbls.table_name'))) {
			tblname = this.consoleTableNamePanel
					.getFieldValue('afm_tbls.table_name');
		} else {
			var message = getMessage('table_not_found');
			View.showMessage(message);
			return;
		}
		if (tblname != this.tableName){
			var message = getMessage('use_select');
			View.showMessage(message);
			return;			
		}
		var gridLen = this.fromPKNamePanel.gridRows.items.length;
		if (gridLen > 0) {
			
			//set up records
			var fromRecord = new Ab.data.Record();
			var toRecord = new Ab.data.Record();

			fromRecord.isNew = false;
			toRecord.isNew = false;

			for (i = 0; i < this.fromPKNamePanel.gridRows.items.length; i++) {
				var fromFieldValue = this.fromPKNamePanel.gridRows.items[i]
						.getFieldValue('afm_flds.value');
				var fromFieldName = this.tableName
						+ "."
						+ this.fromPKNamePanel.gridRows.items[i]
								.getFieldValue('afm_flds.field_name');

				var toFieldValue = this.toPKNamePanel.gridRows.items[i]
						.getFieldValue('afm_flds.value');
				var toFieldName = this.tableName
						+ "."
						+ this.toPKNamePanel.gridRows.items[i]
								.getFieldValue('afm_flds.field_name');

				if (!fromFieldValue || !toFieldValue) {
					var message = getMessage('not_all_values_filled_in');
					View.showMessage(message);
					return;
				} else{
					fromRecord.setValue(fromFieldName, fromFieldValue);
					toRecord.setValue(toFieldName, toFieldValue);
				}
			}
		} else {
			var message = getMessage('info_select_tbl_name');
			View.showMessage(message);
			return;
		}

		try {
			this.jobId = Workflow.startJob(
					'AbCommonResources-cascadeMerge-mergePrimaryKeys',
					fromRecord, toRecord);
			var controller = this;
	        this.startReportTask(controller);
			View.openJobProgressBar(getMessage('info_progress_merge_message'),
					this.jobId, '', function(status) {
					controller.reportTaskRunner.stop(controller.reportTask);
					View.showMessage(getMessage('info_merge_success'));
					});
			
			
		} catch (e) {
			var message = getMessage('warning_multiple_pk');
			View.showMessage(message);
			// Workflow.handleError(e);
		}
	},
	
	onAutoCompleteSelect : function(form, fieldName, selectedValue) {
		afterSelectTable(fieldName, selectedValue);
	}
});

function afterSelectTable(fieldName, selectedValue) {
	mergePrimaryKeyCtrl.tableName = selectedValue;
	var restriction = "AND afm_flds.table_name = '" + selectedValue + "'";
	mergePrimaryKeyCtrl.fromPKNamePanel.addParameter('table_name', restriction);
	mergePrimaryKeyCtrl.toPKNamePanel.addParameter('table_name', restriction);
	mergePrimaryKeyCtrl.fromPKNamePanel.refresh();
	mergePrimaryKeyCtrl.toPKNamePanel.refresh();
	mergePrimaryKeyCtrl.length = mergePrimaryKeyCtrl.fromPKNamePanel.rows.length;
	return;
}
