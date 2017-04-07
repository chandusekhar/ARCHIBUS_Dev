var cfTimeUseByWorkTypeController = View.createController('cfTimeUseByWorkTypeController', {
	restriction: "",
    afterInitialDataFetch: function(){
        var dateCompletedTo = getCurrentDate();
        this.cf_wt_filter_console.setFieldValue("date_completed_to", dateCompletedTo);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("hwr.date_completed", dateCompletedTo, "&lt;=");
        this.cf_wt_cf_grid.refresh(restriction);
    },
    
    cf_wt_cf_grid_afterRefresh: function(){
        if (this.cf_wt_cf_grid.rows.length > 0) {
            this.showReport(this.cf_wt_cf_grid.rows[0]['cf.cf_id']);
        }
        else {
            var title = getMessage('reportTitle');
            setPanelTitle('cf_wt_report', title);
            this.cf_wt_report.clear();
        }
    },
    
    cf_wt_cf_grid_onSelectCfId: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_wt_cf_grid_onSelectCfName: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_wt_cf_grid_onSelectCfTradId: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_wt_cf_grid_onSelectCfInHouse: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    //----------------Logic function start--------------------
    
    showWorkRequestsOfCraftperson: function(row, action){
        var record = row.getRecord();
        var cfId = record.getValue('cf.cf_id');
        this.showReport(cfId);
    },
	
	/**
	 * Add Craftsperson field to right grid
	 */
    cf_wt_report_afterRefresh: function(){
		
        var totalWorkTypeRecords = this.getTotalWorkTypeRecords(this.restriction);
        var totalCfRecord = View.dataSources.get('ds_ab-pm-rpt-cf-wt_hwrcf_hwr_group_cf').getRecord(this.restriction);
        
        var oldRows = this.cf_wt_report.rows;
        if (oldRows.length == 0) {
            return;
        }
        
        var newRows = [];
        var preWorkType = oldRows[0]['hwrcf.work_type'];
        var preWorkTypeRaw = oldRows[0]['hwrcf.work_type.raw'];
        for (var i = 0; i < oldRows.length; i++) {
            if (oldRows[i]['hwrcf.work_type.raw'] == preWorkTypeRaw) {
                newRows.push(oldRows[i]);
            }
            else {
                newRows = this.addStatisticWorkTypeRow(newRows, preWorkType, preWorkTypeRaw, totalWorkTypeRecords);
                newRows.push(oldRows[i]);
                preWorkType = oldRows[i]['hwrcf.work_type'];
                preWorkTypeRaw = oldRows[i]['hwrcf.work_type.raw'];
            }
            if (i == oldRows.length - 1) {
                newRows = this.addStatisticWorkTypeRow(newRows, preWorkType, preWorkTypeRaw, totalWorkTypeRecords);
            }
        }
        newRows = this.addStatisticCfRow(newRows, totalCfRecord);
        this.cf_wt_report.rows = newRows;
        this.cf_wt_report.build();
        this.setStatisticRowStyle();
	},
	
	/**
	 * Show Craftsperson Time Usage By	Craftsperson
	 * @param {Object} cfId
	 */
    showReport: function(cfId){
        var dateCompletedFrom = this.cf_wt_filter_console.getFieldValue('date_completed_from');
        var dateCompletedTo = this.cf_wt_filter_console.getFieldValue('date_completed_to');
        
        if (dateCompletedFrom && dateCompletedTo) {
            if (compareLocalizedDates(this.cf_wt_filter_console.getFieldElement('date_completed_to').value, this.cf_wt_filter_console.getFieldElement('date_completed_from').value)) {
                View.showMessage(getMessage('errorDateRange'));
                return;
            }
        }
        
        this.restriction = new Ab.view.Restriction();
        this.restriction.addClause("hwrcf.cf_id", cfId, "=");
        if (dateCompletedFrom) {
            this.restriction.addClause("hwr.date_completed", dateCompletedFrom, "&gt;=");
        }
        if (dateCompletedTo) {
            this.restriction.addClause("hwr.date_completed", dateCompletedTo, "&lt;=");
        }
        
        var title = getMessage('reportTitle') + " " + cfId;
        setPanelTitle('cf_wt_report', title);
        
        this.cf_wt_report.refresh(this.restriction);
    },
    
    addStatisticWorkTypeRow: function(newRows, preWorkType, preWorkTypeRaw, totalWorkTypeRecords){
        var totalRow = new Object();
        totalRow['isStatisticRow'] = true;
        totalRow['hwrcf.wr_id'] = getMessage('totalByWorkType');
        totalRow['hwrcf.work_type'] = preWorkType;
        for (var i = 0; i < totalWorkTypeRecords.length; i++) {
            var record = totalWorkTypeRecords[i];
            if (record['hwrcf.work_type'] == preWorkTypeRaw) {
                totalRow['hwrcf.hours_total'] = record['hwrcf.total_hours_total_wt'];
                totalRow['hwrcf.hours_est'] = record['hwrcf.total_hours_est_wt'];
                totalRow['hwrcf.hours_diff'] = record['hwrcf.total_hours_diff_wt'];
                newRows.push(totalRow);
                
                var averageRow = new Object();
                averageRow['isStatisticRow'] = true;
                averageRow['hwrcf.wr_id'] = getMessage('avgByWorkType');
                averageRow['hwrcf.work_type'] = preWorkType;
                averageRow['hwrcf.hours_diff'] = record['hwrcf.avg_hours_diff_wt'];
                newRows.push(averageRow);
            }
        }
        
        return newRows;
    },
    
    addStatisticCfRow: function(newRows, totalCfRecord){
        var totalRow = new Object();
        totalRow['isStatisticRow'] = true;
        totalRow['hwrcf.wr_id'] = getMessage('totalByCf');
        
        totalRow['hwrcf.hours_total'] = totalCfRecord.localizedValues['hwrcf.total_hours_total'];
        totalRow['hwrcf.hours_est'] = totalCfRecord.localizedValues['hwrcf.total_hours_est'];
        totalRow['hwrcf.hours_diff'] = totalCfRecord.localizedValues['hwrcf.total_hours_diff'];
        newRows.push(totalRow);
        
        var averageRow = new Object();
        averageRow['isStatisticRow'] = true;
        averageRow['hwrcf.wr_id'] = getMessage('avgByCf');
        
        averageRow['hwrcf.hours_diff'] = totalCfRecord.localizedValues['hwrcf.avg_hours_diff'];
        newRows.push(averageRow);
        return newRows;
    },
    
    setStatisticRowStyle: function(){
        var rows = this.cf_wt_report.rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['isStatisticRow']) {
                Ext.get(rows[i].row.dom).setStyle('color', '#4040f0');
                Ext.get(rows[i].row.dom).setStyle('font-weight', 'bold');
            }
        }
    },
    
    getTotalWorkTypeRecords: function(restriction){
        var ds = View.dataSources.get('ds_ab-pm-rpt-cf-wt_hwrcf_hwr_group');
        var parameters = ds.getParameters();
        parameters.restriction = toJSON(restriction);
        //kb:3024805
		var result = {};
        try {
			result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        var records = [];
        for (var i = 0; i < result.data.records.length; i++) {
            records.push(ds.processInboundRecord(result.data.records[i]));
        }
        return records;
    }
});

function setReportPanelTitle(){
    var title = getMessage('reportTitle');
    setPanelTitle('cf_wt_report', title);
}
