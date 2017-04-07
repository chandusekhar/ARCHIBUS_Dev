var workrequestDetailsController = View.createController('workrequestDetailsGrid', {	
 
	/**
	 * Construct restriction for open steps panel and refresh it.
	 */
	wrDetailsPanel_afterRefresh: function(){ 
    	var record = this.wrDetailsPanel.getRecord();		
		if (record != null) {
			var stepLogRestriction = new Ab.view.Restriction();
			record.getValue('wrhwr.wr_id')
			stepLogRestriction.addClause('helpdesk_step_log.table_name','wr','=');
			stepLogRestriction.addClause('helpdesk_step_log.field_name','wr_id','=','AND');
			stepLogRestriction.addClause('helpdesk_step_log.pkey_value',record.getValue('wrhwr.wr_id'),'=','AND');
			stepLogRestriction.addClause('helpdesk_step_log.date_response',null,'IS NULL');			
			this.stepsPanel.refresh(stepLogRestriction);
			this.stepsPanel.show(true);
			
			// set translated string to column 'status' of open steps grid
			if (record != null && this.stepsPanel.rows.length > 0) {
				var enumValues = this.detailsWrDS.fieldDefs.map["wrhwr.status"].enumValues;
				for(var i=0; i < this.stepsPanel.rows.length; i++){
					var convertedStatus = enumValues[this.stepsPanel.rows[i]["helpdesk_step_log.status"]];
					this.stepsPanel.gridRows.get(i).setFieldValue("helpdesk_step_log.status", convertedStatus);
				}
			}
		}
		
		this.loadRelatedWorkRequests();
	},

	/**
	 * Opens popup with estimation for current request<br />
	 * Called by 'Show Estimation' button
	 */
	wrDetailsPanel_onShowEstimation: function(){ 
		View.openDialog("ab-helpdesk-manager-search-estimation.axvw", this.getWorkRequestRestriction(), false);
	},

	/**
	 * Opens popup with schedule for current request<br />
	 * Called by 'Show Schedule' button
	 */
	wrDetailsPanel_onShowSchedule: function(){ 
		View.openDialog("ab-helpdesk-manager-search-scheduling.axvw", this.getWorkRequestRestriction(), false);
	},
	
	wrDetailsPanel_onShowStepHistory:function(){
		var record = this.wrDetailsPanel.getRecord();	
		var stepLogRestriction = new Ab.view.Restriction();
			//table name = wr or hwr
			stepLogRestriction.addClause('helpdesk_step_log.field_name','wr_id','=','AND');
			stepLogRestriction.addClause('helpdesk_step_log.pkey_value',record.getValue('wrhwr.wr_id'),'=','AND');
		View.openDialog("ab-helpdesk-manager-search-step-history.axvw",stepLogRestriction,false);
	},
	
	getWorkRequestRestriction: function() {
		var restriction = new AFM.view.Restriction();
		var record = this.wrDetailsPanel.getRecord();
		restriction.addClause('wr.wr_id', record.getValue('wrhwr.wr_id'),'=');
		return restriction;
	},

	wrDetailsPanel_onShowDocuments: function() {
		var restriction = this.getWorkRequestRestriction(); 
		var records = this.wrDocsDS.getRecords(restriction);
		if(records.length>0){
			this.wrDocs.showInWindow({
				closeButton: true,
		        width: 800,
		        height: 200
		    });
			this.wrDocs.refresh(restriction);
		}else{
			var id = this.wrDetailsPanel.getFieldValue("wrhwr.wr_id");
			restriction = new Ab.view.Restriction();
			restriction.addClause('hwr.wr_id', id,'=');
			records = this.hwrDocsDS.getRecords(restriction);
			if(records.length>0){
				this.hwrDocs.showInWindow({
					closeButton: true,
			        width: 800,
			        height: 200
			    });
				this.hwrDocs.refresh(restriction);
			}
		}
	},

	stepsPanel_showOpenStep_onClick: function(row) {
		var restriction = new Ab.view.Restriction();
		var parameters = {width:900,closeButton: false};
		restriction.addClause('wr_step_waiting.step_log_id',row.getRecord().getValue("helpdesk_step_log.step_log_id") ) ;
		View.openDialog("ab-bldgops-express-manager-search-step-form-odw.axvw",restriction,false,parameters);
	},
	
	relatedRequestsPanel_showRelatedRequest_onClick: function(row) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('wr.wr_id', row.getRecord().getValue("wrhwr.wr_id"));
		
		var relatedView = 'ab-bldgops-console-wr-details-related.axvw';
		var wrRecords = View.dataSources.get('wrDocsDS').getRecords(restriction);
		if(wrRecords.length==0){
			relatedView = 'ab-bldgops-console-wr-details-archived.axvw';
		}
		
		View.openDialog(relatedView, restriction, false, {
			width : 1000,
			height : 600,
			closeButton : false,
			isDialog : true,
			collapsible : false,
			title : getMessage('workRequestDetailsTitle')
		});
	},

	wrDetailsPanel_onForwardRequest : function() {
		if (this.stepsPanel.rows.length > 0) {
			View.showMessage(getMessage("stepForward"));
			return;	
		}

		var restriction = new Ab.view.Restriction();
		var activityLogId = this.wrDetailsPanel.getRecord().getValue('wrhwr.activity_log_id');
		restriction.addClause('activity_log.activity_log_id', activityLogId,'=');
		View.openDialog("ab-bldgops-express-manage-search-forward-form.axvw", restriction, false,
			{width:900,height:400,closeButton: false});
	},
	
	relatedRequestsPanel_onLinkNew: function(){
    	var openerView = View.getOpenerView();
    	openerView.searchAndManageViewController = this;
    	openerView.linkedToRequest = this.wrDetailsPanel.getRecord();
    	openerView.linkedToTable = "wrhwr"
    	openerView.openDialog('ab-bldgops-console-wr-create.axvw', null, true, {
			width : 1000,
			height : 600,
			closeButton : false,
			isDialog : true,
			collapsible : false,
			title : getMessage('reportRelatedRequestTitle')
		});
    },
    
    /**
	 * Load related work requests.
	 */
	loadRelatedWorkRequests: function() { 
		var wrId = this.wrDetailsPanel.getFieldValue('wrhwr.wr_id');
		var parentId = this.wrDetailsPanel.getFieldValue('wrhwr.parent_wr_id');
		if (parentId != '') {
			// show children and parent work request
			this.relatedRequestsPanel.refresh("wrhwr.parent_wr_id = " + wrId + " OR wrhwr.wr_id = "+parentId); 
		} else {
			// show children 
			this.relatedRequestsPanel.refresh("wrhwr.parent_wr_id = " + wrId); 
		}
		
		this.relatedRequestsPanel.show(true);
    }
    
});