
var helpdeskSearchDetailsController = View.createController('searchDetailsGrid', { 
	
	//build grid with open steps
	buildStepLogGrid: function() {		
    	var record = this.requestDetailsPanel.getRecord();		
		if (record != null) {
			var id = record.getValue('activity_log_hactivity_log.activity_log_id');
			var stepLogRestriction = new Ab.view.Restriction();
			stepLogRestriction.addClause('helpdesk_step_log.table_name','activity_log','=');
			stepLogRestriction.addClause('helpdesk_step_log.field_name','activity_log_id','=','AND');
			stepLogRestriction.addClause('helpdesk_step_log.pkey_value',id,'=','AND');
			stepLogRestriction.addClause('helpdesk_step_log.date_response',null,'IS NULL');
			
			if(this.wrOverviewPanel.rows.length > 0) {
				for(var i=0;i<this.wrOverviewPanel.rows.length;i++){
					stepLogRestriction.addClause('helpdesk_step_log.table_name','wr','=',')OR(');
					stepLogRestriction.addClause('helpdesk_step_log.field_name','wr_id','=','AND');
					stepLogRestriction.addClause('helpdesk_step_log.pkey_value',this.wrOverviewPanel.rows[i]['wrhwr.wr_id'],'=','AND');
					stepLogRestriction.addClause('helpdesk_step_log.date_response',null,'IS NULL');
				}
			}
		}
		this.stepsPanel.refresh(stepLogRestriction);
		
		// KB 3024523
		if (record != null 
				&& this.wrOverviewPanel.rows.length > 0 
				&& this.stepsPanel.rows.length > 0) {
			var enumValues = this.detailsWrDS.fieldDefs.map["wrhwr.status"].enumValues;
			for(var i=0; i < this.stepsPanel.rows.length; i++){
				var convertedStatus = enumValues[this.stepsPanel.rows[i]["helpdesk_step_log.status"]];
				this.stepsPanel.gridRows.get(i).setFieldValue("helpdesk_step_log.status", convertedStatus);
			}
		}
	},
	
	requestDetailsPanel_onForwardRequest : function() {
		
		if (this.stepsPanel.rows.length > 0) {
			var row;
			for (var i=0; i < this.stepsPanel.rows.length; i++) {
				row = this.stepsPanel.rows[i];
				if (row['helpdesk_step_log.activity_id'] == 'AbBldgOpsHelpDesk') {
					View.showMessage(getMessage("stepForward"));
					return;	
				}
			}
		}
		
		View.openDialog("ab-helpdesk-manager-search-forward-form.axvw", this.getRequestRestriction(), false,
			{width:900,height:400,closeButton: false});
	},
	
	requestDetailsPanel_onShowStepHistory : function(){	
		var id = this.requestDetailsPanel.getFieldValue('activity_log_hactivity_log.activity_log_id');
		var stepLogRestriction = new Ab.view.Restriction();
		//table name=activity_log or hactivity_log
			stepLogRestriction.addClause('helpdesk_step_log.field_name','activity_log_id','=','AND');
			stepLogRestriction.addClause('helpdesk_step_log.pkey_value',id,'=','AND');
		View.openDialog("ab-helpdesk-manager-search-step-history.axvw",stepLogRestriction,false);
	},
	
	requestDetailsPanel_afterRefresh: function(){ 
		var tabPanel = View.getView('parent').panels.get('tabs');
		var detailsTab = tabPanel.findTab('details');

		//build Work Request Overview panel if a work order/request is linked to the service request
		var wrRestriction = new Ab.view.Restriction();
		var wrId = this.requestDetailsPanel.getFieldValue('activity_log_hactivity_log.wr_id');
		var woId = this.requestDetailsPanel.getFieldValue('activity_log_hactivity_log.wo_id');
		if(wrId == "" && woId ==""){
			this.wrOverviewPanel.show(false);
		} else {
			if(valueExistsNotEmpty(wrId)){
				wrRestriction.addClause('wrhwr.wr_id',wrId,'=');	
			}
			if(valueExistsNotEmpty(woId)){
				wrRestriction.addClause('wrhwr.wo_id',woId,'=');
			}
			this.wrOverviewPanel.refresh(wrRestriction);
			this.wrOverviewPanel.show(true);
		}
		
		//build Open workflow steps panel is request is not archived
		var status = this.requestDetailsPanel.getFieldValue('activity_log_hactivity_log.status');
		if(status != 'CANCELLED' && status != 'CLOSED' && status !='REJECTED'){
			this.buildStepLogGrid();
			this.stepsPanel.show(true);
		} else {
			this.stepsPanel.show(false);
		}			
	},
	
	getRequestRestriction: function() {
		var restriction = new AFM.view.Restriction();
		var id = this.requestDetailsPanel.getFieldValue('activity_log_hactivity_log.activity_log_id');
		restriction.addClause('activity_log.activity_log_id', id,'=');
		return restriction;
	},
	
	requestDetailsPanel_onShowDocuments: function(action) {
		var id = this.requestDetailsPanel.getFieldValue('activity_log_hactivity_log.activity_log_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', id,'=');
		var records = this.activityLogDocsDS.getRecords(restriction);
		if(records.length>0){
			this.activityLogDocs.showInWindow({
				closeButton: true,
				anchor: action.el.dom,
		        width: 800,
		        height: 200
		    });
			this.activityLogDocs.refresh(restriction);
		}else{
			restriction = new Ab.view.Restriction();
			restriction.addClause('hactivity_log.activity_log_id', id,'=');
			records = this.hactivityLogDocsDS.getRecords(restriction);
			if(records.length>0){
				this.hactivityLogDocs.showInWindow({
					closeButton: true,
					anchor: action.el.dom,
			        width: 800,
			        height: 200
			    });
				this.hactivityLogDocs.refresh(restriction);
			}
		}
	},
	
	wrOverviewPanel_onShowDocuments: function(row) {
		var id = row.getRecord().getValue('wrhwr.wr_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('wr.wr_id', id,'=');
		var records = this.wrDocsDS.getRecords(restriction);
		if(records.length>0){
			this.wrDocs.showInWindow({
				closeButton: true,
				anchor: row.dom,
		        width: 800,
		        height: 200
		    });
			this.wrDocs.refresh(restriction);
		}else{
			restriction = new Ab.view.Restriction();
			restriction.addClause('hwr.wr_id', id,'=');
			records = this.hwrDocsDS.getRecords(restriction);
			if(records.length>0){
				this.hwrDocs.showInWindow({
					closeButton: true,
					anchor: row.dom,
			        width: 800,
			        height: 200
			    });
				this.hwrDocs.refresh(restriction);
			}
		}
	}
	
});

function showStep(){
	var tableName = this['helpdesk_step_log.table_name'];
	
	var restriction = new Ab.view.Restriction();
	var parameters = {width:900,closeButton: false};
	if(tableName == 'activity_log'){
		restriction.addClause('activity_log_step_waiting.step_log_id',this['helpdesk_step_log.step_log_id.key']);
		View.openDialog("ab-helpdesk-manager-search-step-form-sd.axvw",restriction,false,parameters);
	} else if(tableName == 'wr'){
		restriction.addClause('wr_step_waiting.step_log_id',this['helpdesk_step_log.step_log_id.key']);
		View.openDialog("ab-helpdesk-manager-search-step-form-odw.axvw",restriction,false,parameters);
	}
}






 