var abEqMaintenanceHistoryController = View.createController('abEqMaintenanceHistoryController', {
    dateStart: '',
    dateEnd: '',
    showRestriction: null,
    equipId: "",
    totalRecord: null,
	consoleParam:'',
	fieldArray : new Array(['hwr.site_id'], ['hwr.bl_id'],['hwr.dv_id'], ['hwr.dp_id'], ['eq.eq_std']),
	
    afterInitialDataFetch: function(){
        var curDate = getCurrentDate();
        this.abEqMaintenanceHistory_filterPanel.setFieldValue("hwr.date_completed.to", curDate);
        this.abEqMaintenanceHistory_filterPanel_onSearch();
    },

    abEqMaintenanceHistory_filterPanel_onClear: function(){
	 	this.abEqMaintenanceHistory_filterPanel.clear();
		var curDate = getCurrentDate();
        this.abEqMaintenanceHistory_filterPanel.setFieldValue("hwr.date_completed.to", curDate);
	 },
    
	abEqMaintenanceHistory_filterPanel_onSearch: function(){
		this.abEqMaintenanceHistory_eqGrid.show(true);
		this.consoleParam=' AND 1=1 ';
        var console = this.abEqMaintenanceHistory_filterPanel;
        this.showRestriction = new Ab.view.Restriction();
        var filterHwrDs = View.dataSources.get('abEqMaintHistFilterHwrDs');
        var groupHwrEqDs = View.dataSources.get('abEqMaintHistGroupHwrDs');
		
        // hwr.date_completed value range
        var dateTodoFrom = console.getFieldValue('hwr.date_completed.from');
        //parse date 
        dateTodoFrom = filterHwrDs.parseValue('hwr.date_completed.from', dateTodoFrom, true);
        this.dateStart = dateTodoFrom;
        if (dateTodoFrom != '') {
            this.showRestriction.addClause('hwr.date_completed', dateTodoFrom, '&gt;=');
        }
        var dateTodoTo = console.getFieldValue('hwr.date_completed.to');
        dateTodoTo = filterHwrDs.parseValue('hwr.date_completed.to', dateTodoTo, true);
        this.dateEnd = dateTodoTo;
        if (dateTodoTo != '') {
            this.showRestriction.addClause('hwr.date_completed', dateTodoTo, '&lt;=');
        }
        var parameters = {
            recordLimit: 0
        };
        var recs = groupHwrEqDs.getRecords(this.showRestriction, parameters);
        var equipId = "";
        var subQueryWhere = "";
        if (recs != null) {
            for (var i = 0; i < recs.length; i++) {
                equipId = recs[i].getValue("hwr.eq_id");
                subQueryWhere += " OR eq.eq_id='" + equipId + "'";
            }
        }
		
		this.abEqMaintenanceHistory_eqGrid.addParameter('eqIDSets', subQueryWhere);
        // apply restriction to the grid   
		this.consoleParam = " AND "+ getRestrictionStrFromConsole(console, this.fieldArray).replace(/hwr./g, "eq.");
		this.abEqMaintenanceHistory_eqGrid.addParameter('consoleParam', this.consoleParam);
        this.abEqMaintenanceHistory_eqGrid.refresh();
        
        var consoleDateParam = "";
        for (var i = 0; i < this.showRestriction.clauses.length; i++) {
            var clause = this.showRestriction.clauses[i];
            consoleDateParam += String.format(" AND {0} {1} '{2}'", clause.name, clause.op, clause.value);
        }
        
        this.abEqMaintenanceHistory_analysis.addParameter('consoleParam', this.consoleParam);
        this.abEqMaintenanceHistory_analysis.addParameter('consoleDateParam', consoleDateParam);
    },
    
    abEqMaintenanceHistory_eqGrid_afterRefresh: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause("hwr.wr_id", "-1", "=");
        this.abEqMaintenanceHistory_historyReport.refresh(restriction);
        this.abEqMaintenanceHistory_historyReport.show(false);
        
        restriction = new Ab.view.Restriction();
        restriction.addClause("eq.eq_id", "-1", "=");
        this.abEqMaintenanceHistory_analysis.refresh(restriction);
        this.abEqMaintenanceHistory_analysis.show(false);
        
        var showChartAction = this.abEqMaintenanceHistory_eqGrid.actions.get('showChart');
		var showLineAction = this.abEqMaintenanceHistory_eqGrid.actions.get('showLine');
        if (this.abEqMaintenanceHistory_eqGrid.rows.length == 0) {
            showChartAction.show(false);
			showLineAction.show(false);
        }
        else {
            showChartAction.show(true);
			showLineAction.show(true);
        }
    },
    
    abEqMaintenanceHistory_analysis_afterRefresh: function(){
    	// format currency calculated fields
    	var costTotalValue = this.abEqMaintenanceHistory_analysis.getFieldValue('eq.vf_cost_total');
    	if(!valueExistsNotEmpty(costTotalValue)){
    		costTotalValue = 0.00;
    	}
    	var localizedCostTotal = this.abEqMaintHistAnalysisDs.formatValue('eq.cost_replace', costTotalValue, true);
    	
    	var costPrevMaintValue = this.abEqMaintenanceHistory_analysis.getFieldValue('eq.vf_cost_prev_maint');
    	if(!valueExistsNotEmpty(costPrevMaintValue)){
    		costPrevMaintValue = 0.00;
    	}
    	var localizedCostPrevMaint = this.abEqMaintHistAnalysisDs.formatValue('eq.cost_replace', costPrevMaintValue, true);
    	
    	var costOnDemandValue = this.abEqMaintenanceHistory_analysis.getFieldValue('eq.vf_cost_on_demand');
    	if(!valueExistsNotEmpty(costOnDemandValue)){
    		costOnDemandValue = 0.00;
    	}
    	var localizedCostOnDemand = this.abEqMaintHistAnalysisDs.formatValue('eq.cost_replace', costOnDemandValue, true);
    	
    	var fieldDefs = this.abEqMaintenanceHistory_analysis.fieldDefs;
    	for (var i=0; i<fieldDefs.length; i++) {
    		if (fieldDefs[i].fullName == "eq.vf_cost_total") {
    			fieldDefs[i].value = localizedCostTotal;
    		}
    		if (fieldDefs[i].fullName == "eq.vf_cost_prev_maint") {
    			fieldDefs[i].value = localizedCostPrevMaint;
    		}
    		if (fieldDefs[i].fullName == "eq.vf_cost_on_demand") {
    			fieldDefs[i].value = localizedCostOnDemand;
    		}
    	}
    },
    
    abEqMaintenanceHistory_historyReport_afterRefresh: function(){
         if (this.abEqMaintenanceHistory_historyReport.rows.length == 0) {
             return;
         }
         
        this.addStatisticInfo();
    },
    
    addStatisticInfo: function(){
        var hwrReport = this.abEqMaintenanceHistory_historyReport;
        var totalRecord = this.totalRecord;
        
        var totalRow = new Object();
        totalRow['hwr.date_requested'] = getMessage('totalForEq') + this.equipId;
        totalRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.sum_cost_total']);
        totalRow['hwr.act_labor_hours'] = totalRecord.localizedValues['hwr.sum_act_labor_hours'];
        totalRow['hwr.down_time'] = totalRecord.localizedValues['hwr.sum_down_time'];
        totalRow['isStatisticRow'] = true;
        
        var countRow = new Object();
        countRow['hwr.date_requested'] = getMessage('countForEq') + this.equipId;
        countRow['hwr.cost_total'] = totalRecord.localizedValues['hwr.count_cost_total'];
        countRow['isStatisticRow'] = true;
        
        var avgRow = new Object();
        avgRow['hwr.date_requested'] = getMessage('avgForEq') + this.equipId;
        avgRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.avg_cost_total']);
        avgRow['isStatisticRow'] = true;
        
        var minRow = new Object();
        minRow['hwr.date_requested'] = getMessage('minForEq') + this.equipId;
        minRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.min_cost_total']);
        minRow['isStatisticRow'] = true;
        
        var maxRow = new Object();
        maxRow['hwr.date_requested'] = getMessage('maxForEq') + this.equipId;
        maxRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.max_cost_total']);
        maxRow['isStatisticRow'] = true;
        
        hwrReport.addRow(totalRow);
        hwrReport.addRow(countRow);
        hwrReport.addRow(avgRow);
        hwrReport.addRow(minRow);
        hwrReport.addRow(maxRow);
        
        hwrReport.build();
        this.setStatisticRowStyle();
    },
    
    setStatisticRowStyle: function(){
        var rows = this.abEqMaintenanceHistory_historyReport.rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['isStatisticRow']) {
                Ext.get(rows[i].row.dom).setStyle('color', '#4040f0');
                Ext.get(rows[i].row.dom).setStyle('font-weight', 'bold');
            }
        }
    }
    
})

function onSelectEquipment(){
	View.panels.get('abEqMaintenanceHistory_historyReport').show(true);
    //1 get data when click any text in eqGrid
    var grid = View.panels.get('abEqMaintenanceHistory_eqGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var equipId = selectedRow["eq.eq_id"];

    var analysisPanelTitle = getMessage("analysisPanelTitle") + " " + equipId;
    setPanelTitle('abEqMaintenanceHistory_analysis', analysisPanelTitle);
    
    var historyPanelTitle = getMessage("historyPanelTitle") + " " + equipId;
    setPanelTitle('abEqMaintenanceHistory_historyReport', historyPanelTitle);
  
    var controller = View.controllers.get('abEqMaintenanceHistoryController');
    controller.equipId = equipId;
    var searchRestric = controller.showRestriction;
    
    //2 refresh the eq report
    var restriction = new Ab.view.Restriction();
    restriction.addClause("eq.eq_id", equipId, "=");
    var eqReport = View.panels.get('abEqMaintenanceHistory_analysis');
    eqReport.refresh(restriction);
    
    //3 refresh the hwr report
    restriction = new Ab.view.Restriction();
    restriction.addClause("hwr.eq_id", equipId, "=");
    for (var i = 0; i < searchRestric.clauses.length; i++) {
        var clause = searchRestric.clauses[i];
        restriction.addClause(clause.name, clause.value, clause.op, false);
    }
    controller.totalRecord = View.dataSources.get('abEqMaintHistStatHwrDs').getRecord(restriction);
    
    var hwrReport = View.panels.get('abEqMaintenanceHistory_historyReport');
    hwrReport.refresh(restriction);
}

function showChart(){
    
    View.openDialog('ab-pm-rpt-eq-maint-hist-cht.axvw');
}

function showLine(){

    View.openDialog('ab-pm-rpt-eq-maint-hist-chline.axvw');
}

function getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}

function getRestrictionStrFromConsole(console, fieldsArraysForRestriction){
    var otherRes = ' 1=1 ';
    for (var i = 0; i < fieldsArraysForRestriction.length; i++) {
        var field = fieldsArraysForRestriction[i];
        var consoleFieldValue = console.getFieldValue(field[0]);
        if (consoleFieldValue) {
            if (!isMultiSelect(consoleFieldValue)) {
                if (field[1] && field[1] == 'like') {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + " like '%" + consoleFieldValue + "%' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + " like '%" + consoleFieldValue + "%' ";
                    }
                }
                else {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + "='" + consoleFieldValue + "' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + "='" + consoleFieldValue + "' ";
                    }
                }
            }else{
				otherRes = otherRes + " AND " + getMultiSelectFieldRestriction(field, consoleFieldValue);
			}
        }
    }
    return otherRes;
}

function isMultiSelect(consoleFieldValue){
    return (consoleFieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0);
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
    var restriction = "";
    if (field[2]) {
        restriction =  field[2] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    else {
        restriction =  field[0] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    return restriction;
}

function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")"
    
    return resultedString;
}