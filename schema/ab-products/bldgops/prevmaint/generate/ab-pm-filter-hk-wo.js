var FilterController = View.createController('Filter', {
    siteId: '',
    blId: '',
    flId: '',
    pmGroup: '',
    trId: '',
    afterInitialDataFetch: function(){
        this.generate_filter.setFieldValue('pmp.tr_id', '');
        var dateFrom = getCurrentDate();
        var dateTo = fixedFromDate_toToDate(dateFrom, 7);
        this.date_range_filter.setFieldValue('pms.date_next_alt_todo', dateFrom);
        this.date_range_filter.setFieldValue('pms.date_first_todo', dateTo);
    },
    generate_filter_afterRefresh: function(){
        this.generate_filter.setFieldValue('pms.site_id', this.siteId);
        this.generate_filter.setFieldValue('pms.bl_id', this.blId);
        this.generate_filter.setFieldValue('pms.fl_id', this.flId);
        this.generate_filter.setFieldValue('pms.pm_group', this.pmGroup);
        this.generate_filter.setFieldValue('pmp.tr_id', this.trId);
    },
    generate_filter_onNext: function(){
        var form_generate_filter = null;
        var form_date_range_filter = null;
        var woFilterRestriction = null;
        var restrictionVeri = new Ab.view.Restriction();
        var recordsVeri = null;
        form_generate_filter = View.panels.get('generate_filter');
        form_date_range_filter = View.panels.get('date_range_filter');
        woFilterRestriction = "";
        
        this.siteId = form_generate_filter.getFieldValue('pms.site_id');
        this.blId = form_generate_filter.getFieldValue('pms.bl_id');
        this.flId = form_generate_filter.getFieldValue('pms.fl_id');
        this.pmGroup = form_generate_filter.getFieldValue('pms.pm_group');
        this.trId = form_generate_filter.getFieldValue('pmp.tr_id');
        
        var verifyDatePms = View.dataSources.get("ds_ab-pm-filter-hk-wo_pms");
        var verifyDatePmp = View.dataSources.get("ds_ab-pm-filter-hk-wo_pmp");
        
        restrictionVeri.addClause("pms.site_id", this.siteId, "=");
        recordsVeri = verifyDatePms.getRecords(restrictionVeri);
        if (recordsVeri.length == 0 && (this.siteId != "" && this.siteId != null)) {
            View.showMessage(getMessage('error_date_filter_site'));
            return;
        }
        
        restrictionVeri.removeClause("pms.site_id");
        restrictionVeri.addClause("pms.bl_id", this.blId, "=");
        recordsVeri = verifyDatePms.getRecords(restrictionVeri);
        if (recordsVeri.length == 0 && (this.blId != "" && this.blId != null)) {
            View.showMessage(getMessage('error_date_filter_bl'));
            return;
        }
        restrictionVeri.removeClause("pms.bl_id");
        restrictionVeri.addClause("pms.fl_id", this.flId, "=");
        recordsVeri = verifyDatePms.getRecords(restrictionVeri);
        if (recordsVeri.length == 0 && (this.flId != "" && this.flId != null)) {
            View.showMessage(getMessage('error_date_filter_fl'));
            return;
        }
        restrictionVeri.removeClause("pms.fl_id");
        restrictionVeri.addClause("pms.pm_group", this.pmGroup, "=");
        recordsVeri = verifyDatePms.getRecords(restrictionVeri);
        if (recordsVeri.length == 0 && (this.pmGroup != "" && this.pmGroup != null)) {
            View.showMessage(getMessage('error_date_filter_pms'));
            return;
        }
        restrictionVeri.removeClause("pms.pm_group");
        restrictionVeri.addClause("pmp.tr_id", this.trId, "=");
        recordsVeri = verifyDatePmp.getRecords(restrictionVeri);
        if (recordsVeri.length == 0 && (this.trId != "" && this.trId != null)) {
            View.showMessage(getMessage('error_date_filter_tr'));
            return;
        }
        
        
        woFilterRestriction = getSchedDatesRestriction(this.siteId, this.blId, this.flId, this.pmGroup, this.trId, 'HK');
        
        var dataFrom = form_date_range_filter.getFieldValue('pms.date_next_alt_todo');
        var dataTo = form_date_range_filter.getFieldValue('pms.date_first_todo');
        
        if (dataFrom && dataTo) {
            if (compareLocalizedDates(this.date_range_filter.getFieldElement('pms.date_first_todo').value, this.date_range_filter.getFieldElement('pms.date_next_alt_todo').value)) {
                View.showMessage(getMessage('error_date_range'));
                return;
            }
            if (dateRangeInterval(dataFrom, dataTo) > 90) {
                View.showMessage(getMessage('error_datefrom_interval'));
                return;
            }
            if (dateRangeInterval(dataFrom, getCurrentDate()) > 0) {
                View.showMessage(getMessage('error_datefrom_early'));
                return;
            }
            if (woFilterRestriction) {
                woFilterRestriction += " AND ";
            }
            
            woFilterRestriction += "((pms.date_first_todo &gt; ${sql.date(\'" + dataFrom +"\')} "+  " AND pms.date_first_todo &lt;${sql.date(\'" + dataTo +"\')})";
            woFilterRestriction += " OR (pms.date_next_alt_todo &gt; ${sql.date(\'" + dataFrom + "\')}"+ " AND pms.date_next_alt_todo &lt;${sql.date(\'" + dataTo +"\')})";
            woFilterRestriction += " OR (pms.date_next_todo &gt; ${sql.date(\'" + dataFrom + "\')}"+ " AND pms.date_next_todo &lt;${sql.date(\'" + dataTo+"\')})";
            woFilterRestriction += " OR (EXISTS (SELECT 1 FROM pmsd WHERE pmsd.pms_id = pms.pms_id AND pmsd.date_todo &gt;  ${sql.date(\'" + dataFrom+ "\')}" + " AND pmsd.date_todo &lt;${sql.date(\'" + dataTo+"\')})))";
        }
        else {
            View.showMessage(getMessage('error_date_range'));
            return;
        }
        this.storeConsoleValue(this.siteId, this.blId, this.flId, this.pmGroup, this.trId, dataFrom, dataTo);
        View.parentTab.parentPanel.selectTab(View.parentTab.parentPanel.tabs[1].name, woFilterRestriction, false, false, true);
    },
    storeConsoleValue: function(siteId, blId, flId, pmGroup, trId, dataFrom, dataTo){
        var tabs = View.parentTab.parentPanel;
        if (tabs) {
            tabs.workOrderNumFrom = '';
            tabs.workOrderNumTo = '';
            tabs.siteId = siteId;
            tabs.blId = blId;
            tabs.flId = flId;
            tabs.pmGroup = pmGroup;
            tabs.trId = trId;
            tabs.dataFrom = dataFrom;
            tabs.dataTo = dataTo;
            tabs.primaryWorkType = "HSPM";
        }
    },

	/**
	* generate work orders for selected past due schedules.
	*/
	pastDueSchedulesGrid_next_onClick: function(row){
        var dueDate = this.pastDueSchedulesGrid.rows[this.pastDueSchedulesGrid.selectedRowIndex]["pms.date_next_todo.raw"].substr(0,10);
        var selectedPmsId = row.getRecord().getValue("pms.pms_id");

		var woFilterRestriction = "";        
		woFilterRestriction += "( (pms.date_first_todo &gt;= ${sql.date(\'" + dueDate +"\')} "+  " AND pms.date_first_todo &lt;=${sql.date(\'" + dueDate +"\')})";
		woFilterRestriction += " OR (pms.date_next_alt_todo &gt;= ${sql.date(\'" + dueDate + "\')}"+ " AND pms.date_next_alt_todo &lt;=${sql.date(\'" + dueDate +"\')})";
		woFilterRestriction += " OR (pms.date_next_todo &gt;= ${sql.date(\'" + dueDate + "\')}"+ " AND pms.date_next_todo &lt;=${sql.date(\'" + dueDate+"\')})";
		woFilterRestriction += " OR (EXISTS (SELECT 1 FROM pmsd WHERE pmsd.pms_id = pms.pms_id AND pmsd.date_todo &gt;=  ${sql.date(\'" + dueDate+ "\')}" + " AND pmsd.date_todo &lt;=${sql.date(\'" + dueDate+"\')}) ) )";

		woFilterRestriction = woFilterRestriction + " and ( pms.pms_id="+selectedPmsId;  
		for ( var i=0; i<this.pastDueSchedulesGrid.rows.length; i++ ) {
			var pmsId = this.pastDueSchedulesGrid.rows[i]["pms.pms_id"];
			var dateToDo = this.pastDueSchedulesGrid.rows[i]["pms.date_next_todo.raw"];
			
			if ( pmsId!=selectedPmsId && dateToDo==dueDate ) {
				woFilterRestriction = woFilterRestriction+ " or pms.pms_id="+pmsId;  
			}
		}
		woFilterRestriction = woFilterRestriction + ") "

		var tabs = View.parentTab.parentPanel;
        if (tabs) {
            tabs.dataFrom = dueDate;
            tabs.dataTo = dueDate;
			tabs.pmsIdRestirction = woFilterRestriction;
		}

		View.parentTab.parentPanel.selectTab(View.parentTab.parentPanel.tabs[1].name, woFilterRestriction, false, false, true);
	}
});

function openDialog(panelid,type){
    if (type == "bl") {
        View.selectValue(panelid, getMessage('blCode'), ['pms.bl_id','pms.site_id'], 'bl', ['bl.bl_id','bl.site_id'], ['bl.site_id','bl.bl_id'], null, null, null, null, null, 800, 500, null, null, null);
    }
    else 
        if (type == "fl") {
            View.selectValue(panelid, getMessage('flCode'), ['pms.fl_id','pms.bl_id'], 'fl', ['fl.fl_id','fl.bl_id'], ['fl.bl_id','fl.fl_id'], null, null, null, null, null, 800, 500, null, null, null);
        }
        else 
            if (type == "site") {
                View.selectValue(panelid, getMessage('siteCode'), ['pms.site_id'], 'pms', ['pms.site_id'], ['pms.site_id'], null, null, null, null, null, 800, 500, null, null, null);
            }
            else 
                if (type == "group") {
                    View.selectValue(panelid, getMessage('groupCode'), ['pms.pm_group'], 'pms', ['pms.pm_group'], ['pms.pm_group'], null, null, null, null, null, 800, 500, null, null, null);
                }
                else 
                    if (type == "tr") {
                        View.selectValue(panelid, getMessage('trCode'), ['pmp.tr_id'], 'pmp', ['pmp.tr_id'], ['pmp.tr_id'], null, null, null, null, null, 800, 500, null, null, null);
                    }
}

