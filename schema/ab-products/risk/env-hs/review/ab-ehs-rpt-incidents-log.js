var abEhsIncidentsLogCtrl =  View.createController('abEhsIncidentsLogCtrl', {
	
	consoleRestriction: null,
	
	oshaRestriction: "",
	
	oshaExportType: "OSHA_300",
	
	afterViewLoad: function(){
		// register custom event
		this.abEhsIncidentsLogReport.afterCreateCellContent = createCustomCell;
	},
	
	abEhsIncidentsLogFilter_onFilter: function(){
		// read console restriction
		var restriction = new Ab.view.Restriction();
		var restrictionSql = "";
		
		// check dates field
		var dateIncidentFrom = this.abEhsIncidentsLogFilter.getFieldValue('vf_date_incident_from');
		var dateIncidentTo = this.abEhsIncidentsLogFilter.getFieldValue('vf_date_incident_to');
		var dataSource = this.abEhsIncidentsLogFilter.getDataSource();
		
		if (valueExistsNotEmpty(dateIncidentFrom) && valueExistsNotEmpty(dateIncidentTo)) {
			var dateFrom = dataSource.parseValue('ehs_incidents.date_incident', dateIncidentFrom, false);
			var dateTo = dataSource.parseValue('ehs_incidents.date_incident', dateIncidentTo, false);
			if(dateFrom.getTime() >= dateTo.getTime()){
				View.showMessage(getMessage('err_incident_for_dates'));
				return false;
			}
		}
		if (valueExistsNotEmpty(dateIncidentFrom)) {
			restriction.addClause('ehs_incidents.date_incident', dateIncidentFrom, '>=',  ')AND(');
			restrictionSql += (valueExistsNotEmpty(restrictionSql) ? " AND " : "") + "ehs_incidents.date_incident >= '" + dateIncidentFrom + "'";
		}
		
		if (valueExistsNotEmpty(dateIncidentTo)) {
			restriction.addClause('ehs_incidents.date_incident', dateIncidentTo, '<=',  ')AND(');
			restrictionSql += (valueExistsNotEmpty(restrictionSql) ? " AND " : "") + "ehs_incidents.date_incident <= '" + dateIncidentTo + "'";
		}
		
		var fieldIds = ['ehs_incidents.incident_id', 'ehs_incidents.safety_officer', 'ehs_incidents.em_id_affected', 'ehs_incidents.incident_type', 'ehs_incidents.site_id', 'ehs_incidents.cause_category_id', 'ehs_incidents.pr_id', 'ehs_incidents.injury_category_id', 'ehs_incidents.bl_id', 'ehs_incidents.fl_id'];
		for ( var i = 0; i < fieldIds.length ; i++) {
			var fieldId = fieldIds[i];
			var fieldValue =  this.getFieldValue(this.abEhsIncidentsLogFilter, fieldId);
			if (valueExistsNotEmpty(fieldValue)) {
				var fieldValueSql = "";
				if(typeof(fieldValue) === 'object' && fieldValue instanceof Array){
					fieldValueSql = "('" + fieldValue.join("','") + "')";
				} else {
					fieldValueSql = "'" + fieldValue + "'";
				}
				var op = (typeof(fieldValue) === 'object' && fieldValue instanceof Array) ? 'IN' : '=';
				var relOp = ')AND(';
				restriction.addClause(fieldId, fieldValue, op, relOp);
				restrictionSql += (valueExistsNotEmpty(restrictionSql) ? " AND " : "") + fieldId + op + fieldValueSql;
			}
		}
		
		if(document.getElementById("onlyEmployeesCheckbox").checked){
			restriction.addClause('ehs_incidents.em_id_affected', "", "IS NOT NULL");
		}
		
		this.consoleRestriction = restriction;
		this.abEhsIncidentsLogReport.refresh(this.consoleRestriction);
	},
	
	// get console field value
	getFieldValue: function(form, fieldId){
		var value = null;
		if (form.hasFieldMultipleValues(fieldId)) {
			value = form.getFieldMultipleValues(fieldId);
		}else{
			value = form.getFieldValue(fieldId);
		}
		return value;
	},
	
	abEhsIncidentsLogReport_onDOCX: function() {
/*
		var primaryKeys = [];
		
		this.abEhsIncidentsLogReport.gridRows.each(function(row) {
			primaryKeys.push(row.getFieldValue('ehs_incidents.incident_id'));
		});
		
		var incidentRestriction = new Ab.view.Restriction();
		incidentRestriction.addClause('ehs_incidents.incident_id', primaryKeys, 'IN');
*/		
		var restriction = {'abEhsIncidentDetailsDialogPgrp_incidentDs': this.consoleRestriction};
		
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog('ab-ehs-incident-details-dialog-pgrp.axvw', restriction, parameters);
	},
	
	openSelectYear: function(){
		var selectNode = $('select_year');
		var currentDateObj = new Date();
		var currentDate = this.abEhsIncidentsLogFilter_ds.formatValue("ehs_incidents.date_incident", currentDateObj, false);
		var currentYear = currentDate.substring(0,4);
		
		var yearRecords = this.abEhsIncidentsLogYears_ds.getRecords();
		
		selectNode.options.length = 0;
		var alreadySelected = false;
    	for (var i = 0; i < yearRecords.length; i++) {
			var year = yearRecords[i].getValue("afm_cal_dates.vf_year");
			
				var optionNode = document.createElement('option');
				optionNode.value = year;
				if(year < currentYear && !alreadySelected){
					optionNode.selected = true;
					alreadySelected = true;
				}
				optionNode.appendChild(document.createTextNode(year));
				selectNode.appendChild(optionNode);
    	}
    	
    	this.abEhsIncidentsLogYears_panel.refresh(null,true,true);
    	
    	this.abEhsIncidentsLogYears_panel.showInWindow({
    		width: 500,
    		height: 300
    	});
	}
});

/**
 * Customize grid cell to display checkboxes.
 * @param row
 * @param column
 * @param cellElement
 */
function createCustomCell(row, column, cellElement) {
	if (column.id == 'ehs_incidents.vf_is_death' || column.id == 'ehs_incidents.vf_is_away_from_work' || column.id == 'ehs_incidents.vf_is_on_restriction' || column.id == 'ehs_incidents.vf_is_other' ) {
		var content = "";
		
	    var value = row[column.id];
	    if (typeof value == 'undefined') {
	        value = row[column.fullName];
	    }
	    
	    content = "<input type='checkbox'";
        if (value == 1) {
            content = content + " checked='true'";
        }
        content = content + "disabled='true' />";
		
        cellElement.innerHTML = content;
        cellElement.style.textAlign = 'center';
	}
}

function exportOsha(cmdCtx) {
	abEhsIncidentsLogCtrl.oshaExportType = cmdCtx.id;
	abEhsIncidentsLogCtrl.openSelectYear();
}

function setOshaRestrictionAndExport(cmdCtx){
	var controller = abEhsIncidentsLogCtrl;
	var form = controller.abEhsIncidentsLogYears_panel;
	var selectNode = $('select_year');
	var selectedYear = selectNode.options[selectNode.selectedIndex].value;
		
	controller.oshaRestriction = "${sql.yearOf('ehs_incidents.date_incident')} = '" + selectedYear + "'";
	
	// country
	var ctrySource = "(CASE WHEN ehs_incidents.bl_id IS NOT NULL THEN (SELECT ctry_id FROM bl WHERE bl.bl_id = ehs_incidents.bl_id)"
					+ " WHEN ehs_incidents.pr_id IS NOT NULL THEN (SELECT ctry_id FROM property WHERE property.pr_id = ehs_incidents.pr_id)"
					+ " ELSE (SELECT ctry_id FROM site WHERE site.site_id = ehs_incidents.site_id)"
					+ "END)";
	var ctryId = form.getFieldValue("bl.ctry_id");
	if(valueExistsNotEmpty(ctryId)){
		controller.oshaRestriction += " AND " + ctrySource + " IN ('" + form.getFieldMultipleValues("bl.ctry_id").join("','") + "')";
	}
	
	// site
	var siteId = form.getFieldValue("ehs_incidents.site_id");
	if(valueExistsNotEmpty(siteId)){
		controller.oshaRestriction += " AND " + "ehs_incidents.site_id" + " IN ('" + form.getFieldMultipleValues("ehs_incidents.site_id").join("','") + "')";
	}
	
	// building
	var siteId = form.getFieldValue("ehs_incidents.bl_id");
	if(valueExistsNotEmpty(siteId)){
		controller.oshaRestriction += " AND " + "ehs_incidents.bl_id" + " IN ('" + form.getFieldMultipleValues("ehs_incidents.bl_id").join("','") + "')";
	}
	
	//OSHA reports display only employee records(KB3038996)
	controller.oshaRestriction += " AND " + "ehs_incidents.em_id_affected IS NOT NULL";
	
	form.closeWindow();
	
	if(abEhsIncidentsLogCtrl.oshaExportType == "OSHA_300"){
		exportOsha300();
	} else {
		exportOsha300A();
	}
}

/**
 * Export OSHA 300 report
 */
function exportOsha300() {
	try {
		var arrFieldNames = ['ehs_incidents.incident_id','ehs_incidents.vf_affected_person','ehs_incidents.vf_job_title',
		                     'ehs_incidents.vf_date_incident','ehs_incidents.vf_location','ehs_incidents.vf_injury',
		                     'ehs_incidents.vf_is_death','ehs_incidents.vf_is_away_from_work','ehs_incidents.vf_is_on_restriction','ehs_incidents.vf_is_other',
		                     'ehs_incidents.vf_lost_work_days_osha','ehs_incidents.vf_job_restriction_osha',
		                     'ehs_incidents.vf_dummy','ehs_incidents.vf_dummy',
		                     'ehs_incidents.vf_injury_category_id',
		                     'ehs_incidents.vf_year'];
		
		var arrPdfFieldNames = ['form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]',
		                        'form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]',
		                        'form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]',
		                        'form1[0].oshaForm[0].employeeTable[0]','form1[0].oshaForm[0].employeeTable[0]',
		                        'form1[0].oshaForm[0].PageNumber','form1[0].oshaForm[0].TotalPages',
		                        'form1[0].oshaForm[0].employeeTable[0]',
		                        'form1[0].oshaForm[0].Year'];
		
		var arrPdfControlTypes = ['Table[Cell1]','Table[Cell2]','Table[Cell3]',
		                          'Table[Cell4]','Table[Cell5]','Table[Cell6]',
		                          'Table[Cell7[CheckBox[yes][showTotals]]]','Table[Cell8[CheckBox[yes][showTotals]]]','Table[Cell9[CheckBox[yes][showTotals]]]','Table[Cell10[CheckBox[yes][showTotals]]]',
		                          'Table[Cell11[showTotals]]','Table[Cell12[showTotals]]',
		                          'TextField[PageNumber]','TextField[TotalPages]',
		                          'Table[Cell13[CheckBox[injury|skin_disorder|respiratory_condition|poisoning|hearing_loss|other_illnesses][showTotals]]]',
		                          'TextField'];
		
		var arguments = {};
		arguments.viewName = "ab-ehs-rpt-incidents-log.axvw";
		arguments.dataSourceId = "abEhsIncidentsLogReport_ds";
		arguments.restrictions = abEhsIncidentsLogCtrl.oshaRestriction;
		arguments.pdfTemplate = "ehs_osha_300.pdf";
		arguments.fieldNames = arrFieldNames.join(';');
		arguments.pdfFieldNames = arrPdfFieldNames.join(';');
		arguments.pdfControlTypes = arrPdfControlTypes.join(';');
		arguments.recordLimit = "13";
		
		var pdfCommand = new Ab.command.openLiveCycleDialog (arguments);
		pdfCommand.handle();
		
	} catch (e){
		Workflow.handleError(e);
	}
}

/**
 * Export OSHA 300A report
 */
function exportOsha300A() {
	try {
		var arrFieldNames = ['ehs_incidents.vf_is_death','ehs_incidents.vf_is_away_from_work','ehs_incidents.vf_is_on_restriction','ehs_incidents.vf_is_other',
		                     'ehs_incidents.lost_work_days','ehs_incidents.vf_job_restriction',
		                     'ehs_incidents.vf_injury','ehs_incidents.vf_skin_disorder','ehs_incidents.vf_respiratory_condition',
		                     'ehs_incidents.vf_poisoning','ehs_incidents.vf_hearing_loss','ehs_incidents.vf_other_illnesses',
		                     'ehs_incidents.vf_year'
		                     ];
		
		var arrPdfFieldNames = ['form1[0].oshaForm[0].summaryForm[0].vf_is_death','form1[0].oshaForm[0].summaryForm[0].vf_is_away_from_work','form1[0].oshaForm[0].summaryForm[0].vf_is_on_restriction','form1[0].oshaForm[0].summaryForm[0].vf_is_other',
		                        'form1[0].oshaForm[0].summaryForm[0].lost_work_days','form1[0].oshaForm[0].summaryForm[0].vf_job_restriction',
		                        'form1[0].oshaForm[0].summaryForm[0].vf_injury','form1[0].oshaForm[0].summaryForm[0].vf_skin_disorder','form1[0].oshaForm[0].summaryForm[0].vf_respiratory_condition',
			                    'form1[0].oshaForm[0].summaryForm[0].vf_poisoning','form1[0].oshaForm[0].summaryForm[0].vf_hearing_loss','form1[0].oshaForm[0].summaryForm[0].vf_other_illnesses',
			                    'form1[0].oshaForm[0].Year'
		                        ];
		
		var arrPdfControlTypes = ['TextField','TextField','TextField','TextField',
		                          'TextField','TextField',
		                          'TextField','TextField','TextField',
		                          'TextField','TextField','TextField',
		                          'TextField'
		                          ];
		
		var arguments = {};
		arguments.viewName = "ab-ehs-rpt-incidents-log.axvw";
		arguments.dataSourceId = "abEhsIncidentsLogReport_summary_ds";
		arguments.restrictions = abEhsIncidentsLogCtrl.oshaRestriction;
		arguments.pdfTemplate = "ehs_osha_300a.pdf";
		arguments.fieldNames = arrFieldNames.join(';');
		arguments.pdfFieldNames = arrPdfFieldNames.join(';');
		arguments.pdfControlTypes = arrPdfControlTypes.join(';');
		
		var pdfCommand = new Ab.command.openLiveCycleDialog (arguments);
		pdfCommand.handle();
		
	} catch (e){
		Workflow.handleError(e);
	}
}
