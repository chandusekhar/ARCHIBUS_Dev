var scheduleController = View.createController('scheduleDetailsGrid', {
	
	afterInitialDataFetch:function(){
		this.refreshPanels();
	},
	afterRefresh:function(){
		this.refreshPanels();
	},
		
	refreshPanels: function() {   
		var wrId = this.wrScheduleReport.getFieldValue("wr.wr_id");
		
		var cfRestriction = new Ab.view.Restriction();
		cfRestriction.addClause('wrcf.wr_id',wrId,'=');
		this.craftspersonsReport.refresh(cfRestriction);
		
		var tlRestriction = new Ab.view.Restriction();
		tlRestriction.addClause('wrtl.wr_id',wrId,'=');
		this.toolsReport.refresh(tlRestriction);
	}
});