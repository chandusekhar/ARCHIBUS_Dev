var TabController = View.createController('generate_sched', {
    restriction: null,
    primarykeyStr: null,
    data_range_start: null,
    data_range_end: null,
    afterInitialDataFetch: function(){
        restriction = new Ab.view.Restriction();
        //Set filter in Select PM Schedule panel to Interval Type of "Manual"
        restriction.addClause("pms.interval_type", "a", "=");
        this.pms_select.refresh(restriction);
        View.panels.get("pmsd_select").actions.get("addNew").forceDisable(true);
        View.panels.get("pmsd_select").actions.get("delete").forceDisable(true);
    },
    
    pmsd_select_onAddNew: function(){
        if (this.pubinterval_type == "a") {
            this.pmsd_detail.refresh(this.restrictionID, true);
            //this.pmsd_detail.setFieldValue("pmsd.pms_id", pubpms_id);
        }
        else {
            var con = confirm(getMessage("confirmMessage") + "('" + this.pubinterval_type_desc + "')");
            if (con == true) {
                this.pmsd_detail.refresh(this.restrictionID, true);
                //this.pmsd_detail.setFieldValue("pmsd.pms_id", pubpms_id);
            }
            else {
                return;
            }
        }
    },
    pmsd_detail_onSave: function(){
        this.pmsd_select.refresh(this.restrictionID);
        this.pmsd_detail.refresh(this.restrictionID);
    },
    pmsd_select_onEdit: function(row, action){
        var restriction = View.dataSources.get('ds_ab-pm-def-sched-dates_pmsd').processOutboundRecord(row.getRecord()).toRestriction();
        if (this.pubinterval_type == "a") {
            this.pmsd_detail.refresh(restriction);
        }
        else {
            var con = confirm(getMessage("confirmMessage") + "('" + this.pubinterval_type_desc + "')");
            if (con == true) {
                this.pmsd_detail.refresh(restriction);
            }
            else {
                return;
            }
        }
    },
    
    pmsd_select_onDelete: function(){
		
        if (this.pubinterval_type == "a") {
            deleteSelectedRows("pmsd_select");
            this.pmsd_select.refresh(this.restrictionID);
        }
        else {
            var con = confirm(getMessage("confirmMessage") + "('" + this.pubinterval_type_desc + "')");
            if (con == true) {
                deleteSelectedRows("pmsd_select");
                this.pmsd_select.refresh(this.restrictionID);
            }
            else {
                return;
            }
        }
		this.pmsd_detail.show(false);
    },
    pms_select_onGenerate: function(){
        var dateFrom = getCurrentDate();
        var dateTo = fixedFromDate_toToDate(dateFrom, 14);
        primarykeyStr = View.panels.get("pms_select").getPrimaryKeysForSelectedRows();
        if (this.pms_select.getSelectedGridRows().length <= 0) {
            View.showMessage(getMessage("selectSch"));
        }
        else {
            var dateRange = View.panels.get("date_range");
            dateRange.show(true);
            dateRange.showInWindow({
                width: 550,
                height: 200
            });
            dateRange.setFieldValue('dateS', dateFrom);
            dateRange.setFieldValue('dateE', dateTo);
        }
    },
    date_range_onSubmit: function(){
        var dateRange = View.panels.get("date_range");
        var dateStart = dateRange.getFieldValue("dateS");
        var dateEnd = dateRange.getFieldValue("dateE");
        if (dateStart && dateEnd) {
            if (dateRangeInterval(dateStart, dateEnd) < 0) {
                View.showMessage(getMessage('error_date_range'));
                return;
            }
            if (dateRangeInterval(dateStart, dateEnd) > 90) {
                View.showMessage(getMessage('error_datefrom_interval'));
                return;
            }
            if (dateRangeInterval(dateStart, getCurrentDate()) > 0) {
                View.showMessage(getMessage('error_datefrom_early'));
                return;
            }
        }
        else {
            View.showMessage(getMessage('error_date_range'));
            return;
        }
        var pmsidRestriction = " pms.pms_id IN (";
		if(primarykeyStr.length>0){
			pmsidRestriction =  pmsidRestriction+ primarykeyStr[0]['pms.pms_id'];
			for (var j = 1; j < primarykeyStr.length; j++) {
			   pmsidRestriction = pmsidRestriction+","	;
			   pmsidRestriction = pmsidRestriction+primarykeyStr[j]['pms.pms_id'] ;
			}
		}
		pmsidRestriction = pmsidRestriction+ ") ";
        var result = {};
		//This method serve as a WFR to call a long running job generating schedule dates for specified date range and PM Schedules, file='PreventiveMaintenanceCommonHandler.java'
        try {
            result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-PmScheduleGenerator',  dateStart, dateEnd, pmsidRestriction,true);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        dateRange.closeWindow();
        this.pmsd_select.clear();
        this.pmsd_detail.show(false);
    },
    
    pms_select_onShowall: function(){
        restriction.removeClause("pms.interval_type");
        View.panels.get("pms_select").refresh(restriction);
    }
    
});

function toShow(){
    var pmsPanel = View.panels.get("pms_select");
    var selectedRowIndex = pmsPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        View.controllers.items[0]['pubinterval_type'] = pmsPanel.rows[selectedRowIndex]['pms.interval_type.raw'];
        View.controllers.items[0]['pubinterval_type_desc'] = pmsPanel.rows[selectedRowIndex]['pms.interval_type'];
        // if (pubinterval_type == "Manual") {
        View.controllers.items[0]['pubpms_id'] = pmsPanel.rows[selectedRowIndex]['pms.pms_id'];
        View.controllers.items[0]['restrictionID'] = new Ab.view.Restriction();
        View.controllers.items[0]['restrictionID'].addClause("pmsd.pms_id", View.controllers.items[0]['pubpms_id'], "=");
        View.panels.get("pmsd_select").refresh(View.controllers.items[0]['restrictionID']);
    }
    
}

function deleteSelectedRows(panelId){
    var rows = View.panels.get(panelId).getPrimaryKeysForSelectedRows();
    var row, record;
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        record = new Ab.data.Record({
            'pmsd.pms_id': rows[i]["pmsd.pms_id"],
            'pmsd.date_todo': rows[i]["pmsd.date_todo"]
        }, false);
        View.dataSources.get('ds_ab-pm-def-sched-dates_pmsd').deleteRecord(record);
    }
}
