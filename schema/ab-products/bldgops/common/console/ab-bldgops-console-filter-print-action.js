/**
 * Controller for the Operation Console Print Action
 */
var opsConsolePrintActionController = View.createController('opsConsolePrintActionController', {

	/**
	 * Print to DOCX the detail for selected, individual work requests.
	 */
	onPrintDetailsDocx : function() {
		this.generateDetailsReport("ab-bldgops-console-wr-details-print.axvw", "DOCX");
	},

	/**
	 * Print to PDF the details for selected, individual work requests.
	 */
	onPrintDetailsPdf : function() {
		this.generateDetailsReport("ab-bldgops-console-wr-details-print.axvw", "PDF");
	},

	/**
	 * Print to DOCX the detail for selected, individual work requests.
	 */
	onPrintDetailsPlanDocx : function() {
		this.generateDetailsReport("ab-bldgops-console-wr-details-plan-print.axvw", "DOCX");
	},

	/**
	 * Print to DOCX the detail for selected, individual work requests.
	 */
	onPrintDetailsPlanPdf : function() {
		this.generateDetailsReport("ab-bldgops-console-wr-details-plan-print.axvw", "PDF");
	},

	/**
	 * KB3041131 - workaroud to show first field title in second level when export xls report - keep first column blank
	 */
	wrList_beforeExportReport : function(panel, fieldDefs) {
		var visibleFieldDefs = [];
		visibleFieldDefs.push({});
		for ( var i = 0; i < fieldDefs.length; i++) {
			visibleFieldDefs.push(fieldDefs[i]);
		}

		return visibleFieldDefs;
	},

	/**
	 * Set print restriction.
	 */
	setPrintRestriction : function() {
		var printableRestriction = [];
		// get current search field names and values
		var search = opsConsoleRecentSearchController.getCurrentSearch();
		if (search.searchFieldNames.length > 0) {
			// eliminate duplicates from this list.
			for ( var i = 0; i < search.searchFieldNames.length; i++) {
				var title = '';
				var value = search.searchValues[i];
				if (this.wrList.getDataSourceFieldDefById(search.searchFieldNames[i])) {
					title = this.wrList.getDataSourceFieldDefById(search.searchFieldNames[i]).title;
				} else if (search.searchFieldNames[i] == 'wrtr.tr_id') {
					title = getMessage('trId');
				}else if (search.searchFieldNames[i] == 'eq.eq_std') {
					title = getMessage('eqStd');
				}else if (search.searchFieldNames[i] == 'bigBadFilter_wrpt.status') {
					title = getMessage('wrptStatus');
					for ( var m = 0; m < value.length; m++) {
						if(value[m] == 'NR'){
							value[m] = getMessage('NR');
						}else if(value[m] == 'NI'){
							value[m] = getMessage('NI');
						}else if(value[m] == 'R'){
							value[m] = getMessage('R');
						}
					}
				}else if (search.searchFieldNames[i] == 'wrpt.part_id') {
					title = getMessage('partId');
				} else if (search.searchFieldNames[i] == 'wrcf.cf_id') {
					title = getMessage('cfId');
				} else if (search.searchFieldNames[i] == 'wr.date_requested.from') {
					title = getMessage('dateRequestedFrom');
				} else if (search.searchFieldNames[i] == 'wr.date_requested.to') {
					title = getMessage('dateRequestedTo');
				} else if (search.searchFieldNames[i] == 'wr.date_assigned.from') {
					title = getMessage('dateAssignedFrom');
				} else if (search.searchFieldNames[i] == 'wr.date_assigned.to') {
					title = getMessage('dateAssignedTo');
				} else if (search.searchFieldNames[i] == 'bigBadFilter_worktype') {
					title = getMessage('workType');
					if(value == 'OD'){
						value = getMessage('OD')
					}
				} else if (search.searchFieldNames[i] == 'bigBadFilter_wr.returned') {
					title = getMessage('returned');
					value = getMessage('yes');
				} else if (search.searchFieldNames[i] == 'bigBadFilter_wr.escalated') {
					title = getMessage('escalated');
					value = getMessage('yes');
				} else if (search.searchFieldNames[i] == 'bigBadFilter_wr.cost_est_total') {
					title = getMessage('estimatedCost') + ' ' + opsConsoleFilterRestrictionController.getSelectBoxValue('bigBadFilter_operator');
				} else if (search.searchFieldNames[i] == 'bigBadFilter_wr.status') {
					title = getMessage('status');
					var enums = View.dataSources.get('wrDetailsDS').fieldDefs.get('wr.status').enumValues;
					for ( var m = 0; m < value.length; m++) {
						if(value[m] == 'H'){
							value[m] = getMessage('onHold');
						}else{
							value[m] = enums[value[m]];
						}
					}

				} else if (search.searchFieldNames[i] == 'bigBadFilter_wr.priority') {
					title = getMessage('priority');
				} else if (search.searchFieldNames[i] == 'bigBadFilter_operator') {
					continue;
				}

				printableRestriction.push({
					'title' : title,
					'value' : value.toString()
				});
			}
		}

		this.wrList.addParameter('printableRestriction', printableRestriction);
	},

	/**
	 * Print to DOCX the detail for selected, individual work requests.
	 */
	generateDetailsReport : function(viewName, reportType) {
		// get id list of selected work requests
		var selectedWrIds = this.getSelectedWorkRequestIds();

		if (selectedWrIds.length > 0) {
			// start to call wfr for start a job of generating docx report
			var result = {};
			try {
				result = Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsExpressService-printWorkRequestDetails', selectedWrIds, viewName, reportType);
			} catch (e) {
				Workflow.handleError(e);
			}
			// open a job view
			this.showJobResult(result);
		} else {
			View.showMessage(getMessage("selectNoWorkRequests"));
		}
	},

	/**
	 * @return a list of selected work request ids.
	 */
	getSelectedWorkRequestIds : function() {
		var selectedRecords = this.wrList.getSelectedRecords();
		var selectedWrIds = [];
		if (selectedRecords.length > 0) {
			// construct id list of selected work requests
			for ( var i = 0; i < selectedRecords.length; i++) {
				var wrId = selectedRecords[i].getValue('wr.wr_id');
				selectedWrIds.push(wrId);
			}
		}
		return selectedWrIds;
	},

	/**
	 * @return a list of selected work request ids.
	 */
	showJobResult : function(result) {
		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			result.data = eval('(' + result.jsonExpression + ')');
			var jobId = result.data.jobId;
			var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
			View.openDialog(url);
		}
	}
});