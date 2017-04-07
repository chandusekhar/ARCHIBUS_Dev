var abExMetricCtrl = View.createController('abExMetricCtrl', {

    // whether the Performance Metric Framework license exists in the license file and is enabled
    performanceMetricsFrameworkLicense: false,

	// selected metric code
	metricId: null,
	
	afterViewLoad: function(){
        // load the Performance Metric Framework license value
        var controller = this;
        AdminService.getProgramLicense({
            callback: function(licenseDTO) {
                for (var i = 0; i < licenseDTO.licenses.length; i++) {
                    var license = licenseDTO.licenses[i];
                    if (license.id == 'AbPerformanceMetricsFramework') {
                        controller.performanceMetricsFrameworkLicense = license.enabled;
                        break;
                    }
                }
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });

		// customize form panel.
		Ab.recurring.RecurringControl.addField({
			panel: this.abExMetricMetricsDef,
			fields: new Array("afm_metric_definitions.recurring_rule")
		});
	},

    // if the Performance Metric Framework license is not enabled, display an error message
    checkPerformanceMetricsFrameworkLicense: function() {
        if (!this.performanceMetricsFrameworkLicense) {
            View.alert(getMessage('missingLicenseMessage'));
        }

        return this.performanceMetricsFrameworkLicense;
    },

    // display metric form to add a new metric
    abExMetricMetricsList_onNew: function(){
        if (this.checkPerformanceMetricsFrameworkLicense()) {
            this.abExMetricMetricsDef.refresh(null, true);
            this.abExMetricMetricsDef.show(true);
            this.abExMetricGranulatityList.show(false);
            this.abExMetricDateForm.closeWindow();
        }
    },

    // data transfer
    abExMetricMetricsList_onDataTransfer: function(){
        if (this.checkPerformanceMetricsFrameworkLicense()) {
            var command = new Ab.command.exportPanel({
                panelId: 'abExMetricMetricsList',
                outputType: 'txfr'
            });
            command.handle({});
        }
    },

    // save metric form
	abExMetricMetricsDef_onSave: function(){
		if (this.checkPerformanceMetricsFrameworkLicense() && this.abExMetricMetricsDef.canSave()) {
			// set status 
			if (this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_status_test") === "T") {
				this.abExMetricMetricsDef.setFieldValue("afm_metric_definitions.metric_status_test", "XT");
			}
			this.abExMetricMetricsDef.save();
			this.metricId = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_name");
			this.abExMetricMetricsDef.evaluateExpressions();
			// refresh view panels
			//this.abExMetricMetricsDef.refresh(new Ab.view.Restriction({"afm_metric_definitions.metric_name": this.metricId}));
			this.abExMetricGranulatityList.refresh(new Ab.view.Restriction({"afm_metric_grans.metric_name": this.metricId}));
			this.abExMetricMetricsList.refresh();
		}
	},
	
	// onTest metric handler
	abExMetricMetricsDef_onTest: function(){
		if (valueExistsNotEmpty(this.metricId)) {
			try {
				var result = Workflow.callMethod('AbCommonResources-MetricsService-testMetric', this.metricId);
				if (result.code == "executed"){ 
					View.showMessage(getMessage("msg_metric_tested"));
				}
			} catch (e) {
				Workflow.handleError(e);
			}
			this.abExMetricMetricsDef.refresh(new Ab.view.Restriction({"afm_metric_definitions.metric_name": this.metricId}));
			this.abExMetricMetricsDef.evaluateExpressions();
			this.abExMetricMetricsList.refresh();
		}
	},
	
	abExMetricMetricsDef_onActivate: function(){
		this.updateMetricStatus(this.metricId, 'A', 'D');
	},
	
	abExMetricMetricsDef_onDeactivate: function(){
		this.updateMetricStatus(this.metricId, 'D', 'A');
	},
	
	updateMetricStatus: function(metricId, status, oldStatus){
		var record = new Ab.data.Record({
			'afm_metric_definitions.metric_name': metricId,
			'afm_metric_definitions.metric_status': status
		}, false);
		
		record.setOldValue('afm_metric_definitions.metric_name', metricId);
		record.setOldValue('afm_metric_definitions.metric_status', oldStatus);
		
		try {
			this.abExMetricUpdateStatus_ds.saveRecord(record);
			if (status == 'D') {
				deactivateRatioMetric(metricId);
			}
			var restriction = new Ab.view.Restriction();
			restriction.addClause("afm_metric_definitions.metric_name", this.metricId, "=");
			this.abExMetricMetricsDef.refresh(restriction, false);
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	abExMetricMetricsDef_onCancel: function(){
		var restriction = null;
		if (valueExistsNotEmpty(this.metricId)) {
			restriction = new Ab.view.Restriction();
			restriction.addClause("afm_metric_definitions.metric_name", this.metricId, "=");
		}
		this.abExMetricMetricsDef.refresh(restriction, this.abExMetricMetricsDef.newRecord);
	},
	
	abExMetricMetricsDef_onGenerateData: function(){
		// check if start date is defined
		var collectTable = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.collect_table");
		var collectDateField = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.collect_date_field");
		var metricId = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_name");
		var firstRecordedDate = getFirstRecordedDate(collectTable, collectDateField);
		var dialogConfig = {width:400, height:200};
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_metric_grans.metric_name', metricId, '=');
		this.abExMetricDateForm.refresh(restriction, false);
		if (valueExistsNotEmpty(firstRecordedDate)) {
			this.abExMetricDateForm.setFieldValue('metric_date', firstRecordedDate);
		} else {
			this.abExMetricDateForm.clear();
		}
		this.abExMetricDateForm.showInWindow(dialogConfig);
	},
	
	abExMetricMetricsDef_onGenerateSampleData: function(){
		this.abExMetricDateForm.closeWindow();
		var recurringRule = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.recurring_rule");
		if (!valueExistsNotEmpty(recurringRule)) {
			View.showMessage(getMessage("errRecurringRuleEmpty"));
			return false;
		}
		var gransNo = this.abExMetricGranulatityList.rows.length;
		if (gransNo == 0) {
			View.showMessage(getMessage("errGranularitiesEmpty"));
			return false;
		}
		var metricId = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_name");
		try {
			var controller =  this;
			var result = Workflow.callMethod('AbCommonResources-MetricsService-getSampleDataRecordsNo', metricId);
			var recordsNo = result.value;
			var confirmMessage = getMessage("msgSampleDateRecords").replace('{0}', recordsNo);
			View.confirm(confirmMessage, function(button) { 
			    if (button == 'yes') { 
			    	controller.startSampleDateJob(metricId, recordsNo);
			    } 
			});		
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	startSampleDateJob: function(metricName, recordsNo){
		try {
			var jobId = Workflow.startJob('AbCommonResources-MetricsService-generateSampleData', metricName, "",recordsNo);
		    View.openJobProgressBar(getMessage('msgSampleData'), jobId, '', function(status) {
		    });
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	abExMetricMetricsDef_onDeleteSampleData: function(){
		this.abExMetricDateForm.closeWindow();
		var metricId = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_name");
		var message = getMessage("msgSampleDataDeleted")
		View.confirm(getMessage("confirmDeleteSample"), function(button) { 
		    if (button == 'yes') { 
				try {
					var result = Workflow.callMethod('AbCommonResources-MetricsService-deleteSampleData', metricId, "");
					if (result.code == "executed"){ 
						View.showMessage(message);
					}
				} catch (e) {
					Workflow.handleError(e);
				}
		    } 
		});
		
	},
	
	
	abExMetricMetricsDef_afterRefresh: function(){
		
		if (this.abExMetricMetricsDef.visible) {
			if (this.abExMetricMetricsDef.newRecord) {
				this.metricId = null;
			} else {
				this.metricId = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_name");
			}
			this.abExMetricMetricsDef.evaluateExpressions();
			var status  = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_status");
			var testStatus  = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_status_test");
			
			this.abExMetricMetricsDef.actions.get("delete").show(status == 'D' && !this.abExMetricMetricsDef.newRecord);
			this.abExMetricMetricsDef.actions.get("deactivate").show(!this.abExMetricMetricsDef.newRecord && status == 'A');
			this.abExMetricMetricsDef.actions.get("activate").show(!this.abExMetricMetricsDef.newRecord && status == 'D');
			this.abExMetricMetricsDef.actions.get("generateData").show(testStatus == 'T' && status == 'A');
			this.abExMetricMetricsDef.actions.get("test").show(!this.abExMetricMetricsDef.newRecord);
			this.abExMetricMetricsDef.actions.get("generateSampleData").show(!this.abExMetricMetricsDef.newRecord);
			this.abExMetricMetricsDef.actions.get("deleteSampleData").show(!this.abExMetricMetricsDef.newRecord);
		} 
	},
	
	abExMetricGranulatity_afterRefresh: function(){
		if (this.abExMetricGranulatity.newRecord) {
			this.abExMetricGranulatity.setFieldValue("afm_metric_grans.metric_code", this.metricId);
		}
		afterSelectGranularity();
	},
	
	abExMetricDateForm_onGenerate: function() {
		var metricId = this.abExMetricMetricsDef.getFieldValue("afm_metric_definitions.metric_name");
		var startDate = this.abExMetricDateForm.getFieldValue("afm_metric_grans.metric_date");
		if (!valueExistsNotEmpty(startDate)) {
			View.showMessage(getMessage("errStartDateEmpty"));
			return false;
		}else{
			var objStartDate = this.abExMetricDateForm.getDataSource().parseValue("metric_date", startDate, false);
			var currentDate = new Date();
			if (objStartDate >= new Date()) {
				View.showMessage(getMessage("errStartDateInvalid"));
				return false;
			}
		}
		var granularityId = this.abExMetricDateForm.getFieldValue("afm_metric_grans.collect_group_by");
		if (!validateGranularity(metricId, granularityId)) {
			View.showMessage(getMessage("errGranularityInvalid"));
			return false;
		}
		
		this.abExMetricDateForm.closeWindow();
		this.startJob(metricId, startDate, granularityId);
	},
	
	// start generate data WFR
	startJob: function(metricId, date, granularity) {
		if (!valueExistsNotEmpty(date)) {
			date = this.abExMetricDateForm.getDataSource().formatValue("afm_metric_definitions.metric_date", new Date(), false);
		}
		if (!valueExistsNotEmpty(granularity)) {
			granularity = ""
		}
		
		try {
			var jobId = Workflow.startJob('AbCommonResources-MetricsService-generateData', metricId, date, granularity);
		    View.openJobProgressBar(getMessage('msgHistoryJobStatus'), jobId, '', function(status) {
		    });
		} catch (e) {
			Workflow.handleError(e);
		}
	}
});

/**
 * After select granularity action listener.
 * 
 * @param fieldName field name 
 * @param newValue new value
 * @param oldValue old value
 */
function afterSelectGranularity(fieldName, newValue, oldValue){
	if (!valueExistsNotEmpty(newValue)) {
		// can be started from onBlur event
		newValue = View.panels.get("abExMetricGranulatity").getFieldValue("afm_metric_grans.collect_group_by");
	}
	if (valueExistsNotEmpty(newValue)) {
		var isFieldPresent = getFieldPresenceValue(newValue);
		if (isFieldPresent) {
			View.panels.get("abExMetricGranulatity").setFieldValue("afm_metric_grans.tables_required", "");
		}
		View.panels.get("abExMetricGranulatity").enableField("afm_metric_grans.tables_required", !isFieldPresent);
	}
}

/**
 * Get field presence value for granularity
 * @param collectGroupBy granularity code
 * @returns {Boolean}
 */
function getFieldPresenceValue(collectGroupBy){
	var isFieldPresent = true;
	if (valueExistsNotEmpty(collectGroupBy) && collectGroupBy != 'all') {
		// validate required tables
		var params = {
				tableName: 'afm_metric_gran_defs',
				fieldNames: toJSON(['afm_metric_gran_defs.collect_group_by', 'afm_metric_gran_defs.fields_present']),
				restriction: toJSON({
					'afm_metric_gran_defs.collect_group_by': collectGroupBy
				})
		};
		try {
			var result = Workflow.call('AbCommonResources-getDataRecord', params);
			if (result.code == 'executed') {
				var record = result.dataSet;
				isFieldPresent = parseInt(record.getValue('afm_metric_gran_defs.fields_present')) == 1;
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	}
	return isFieldPresent;
}

/**
 * Validate assigned granularity.
 */
function validateGranularityNOTUSED(){
	var form = View.panels.get("abExMetricGranulatity");
	var granularityCode = form.getFieldValue("afm_metric_grans.collect_group_by");
	if (valueExistsNotEmpty(granularityCode) && granularityCode != 'all') {
		var isFieldPresent = getFieldPresenceValue(granularityCode);
		var requiredTables = form.getFieldValue("afm_metric_grans.tables_required");
		if (!isFieldPresent && !valueExistsNotEmpty(requiredTables)) {
			View.showMessage(getMessage("errRequiredTablesMissing"));
			return false;
		}
	}
	return true;
}

function getFirstRecordedDate(tableName, dateField){
	var result = null;
	var dsObj = View.dataSources.get('abExMetricFirstDate');
	if (dsObj && valueExistsNotEmpty(tableName) && valueExistsNotEmpty(dateField)) {
		dsObj.addParameter('table', tableName);
		dsObj.addParameter('field', tableName +'.'+ dateField);
		var record = dsObj.getRecord();
		var result = record.getValue("afm_metric_definitions.metric_date");
		result = dsObj.formatValue("afm_metric_definitions.metric_date", result, true);
	}
	return result;
}

/**
 * Delete metric event handler.
 */
function deleteMetric(){
	var form = View.panels.get("abExMetricMetricsDef");
	var metricName = form.getFieldValue("afm_metric_definitions.metric_name");
	var hasValues = hasTrendValues(metricName);
	var confirmMessage = hasValues ?getMessage("msgConfirmDeleteWithValues"):getMessage("msgConfirmDelete").replace("{0}", metricName);
	View.confirm(confirmMessage, function(button) { 
	    if (button == 'yes') {
	    	try{
		    	form.deleteRecord();
		    	deactivateRatioMetric(metricName);
		    	View.panels.get("abExMetricMetricsList").refresh();
		    	View.panels.get("abExMetricMetricsDef").show(false, true);
		    	View.panels.get("abExMetricGranulatityList").show(false, true);
	    	} catch(e) {
	    		Workflow.handleError(e)
	    	}
	    } 
	});		
}

/**
 * Check if current metric has trend values.
 * @param metricName
 */
function hasTrendValues(metricName) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_metric_trend_values.metric_name', metricName, '=', 'AND');
	restriction.addClause('afm_metric_trend_values.collect_err_msg', 'example', '<>', ')AND(');
	restriction.addClause('afm_metric_trend_values.collect_err_msg', '', 'IS NULL', 'OR');
	var params = {
			tableName: 'afm_metric_trend_values',
			fieldNames: toJSON(['afm_metric_trend_values.metric_name','afm_metric_trend_values.collect_err_msg']),
			restriction: toJSON(restriction)
	};
	var hasValues = false;
	
	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if (result.code == 'executed') {
			hasValues = result.dataSet.records.length > 0;
		}
		return hasValues;
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Validate metric and granularity.
 * @param metricId
 * @param granularityId
 */
function validateGranularity(metricId, granularityId){
	if (valueExistsNotEmpty(metricId) && valueExistsNotEmpty(granularityId) ) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_metric_grans.metric_name', metricId, '=', 'AND');
		restriction.addClause('afm_metric_grans.collect_group_by', granularityId, '=', 'AND');
		var params = {
				tableName: 'afm_metric_grans',
				fieldNames: toJSON(['afm_metric_grans.metric_name','afm_metric_grans.collect_group_by']),
				restriction: toJSON(restriction)
		};
		var isValid = false;
		try {
			var result = Workflow.call('AbCommonResources-getDataRecord', params);
			if (result.code == 'executed') {
				isValid = result.data.records.length == 1;
			}
			return isValid;
		} catch (e) {
			Workflow.handleError(e);
		}
	}
	return true;
}

/**
 * Deactivate all ratio metrics that have metricName as numerator or denominator. 
 * @param metricName metric name
 */
function deactivateRatioMetric(metricName) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("afm_metric_definitions.metric_status", "A", "=", "AND");
	restriction.addClause("afm_metric_definitions.ratio_metric_num", metricName, "=", ")AND(");
	restriction.addClause("afm_metric_definitions.ratio_metric_denom", metricName, "=", "OR");
	var dataSource = View.dataSources.get("abExMetricUpdateStatus_ds");
	var records = dataSource.getRecords(restriction);
	for (var index = 0; index < records.length; index++) {
		var record = records[index];
		record.isNew = false;
		record.setValue("afm_metric_definitions.metric_status", "D");
		try {
			dataSource.saveRecord(record);
		} catch (e) {
			Workflow.handleError(e);
		}		
	}
}
