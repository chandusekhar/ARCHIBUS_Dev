/**
 * Controller of the work request detail.
 */	
View.createController('wrDetails', {
	/**
	 * Maps DOM events to event listeners.
	 */
	events : {

		/**
		 * Event handler for Indicate on Drawing.
		 * 
		 * @param event
		 */
		"click #indicateOnDrawing" : 'indicateOnDrawing'

	},


    /**
     * After initial data fetch. Show relevant panel.
     */	
	afterInitialDataFetch: function(){
		
		//set location field value
		this.setLocationValue();
		
		//set priority label
		this.setPriorityLabel();
		
		//KB3044836 - show PM fields
		this.showPmFields();
		
		//get step information
		this.getStepInfo();
		
		//collapse panels
		this.collapsePanels();
		
		this.loadRelatedWorkRequests();
		
		this.showReferenceMaterial();
		
		this.workRequestDetailDialog = View.getOpenerView().dialog;
		
		var closeXbuttons = jQuery(window.parent.document).find('.x-tool-close');
		jQuery(closeXbuttons[closeXbuttons.length-1]).click(function(){
			View.controllers.get('wrDetails').wrDetails_onCloseDetailsWindow();
		});
	},
	
	/**
     * Get step information
     */
	getStepInfo: function(){
		try {
			//call wfr to get all steps of the selected work request
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', 'hwr','wr_id',this.wrDetails.getFieldValue('hwr.wr_id'));
			var steps = eval('('+result.jsonExpression+')');
			
			//if no steps, hide history panel 
            if (steps.length == 0) {
                this.historyPanel.show(false);
            }
            else {
            	//if exists steps, show history panel and refresh the history panel 
            	this.historyPanel.show(true);
            	
            	//prepare restrition for history panel
                var restriction = new Ab.view.Restriction();
                if (steps.length == 1) {
                    restriction.addClause('hhelpdesk_step_log.step_log_id', steps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause('hhelpdesk_step_log.step_log_id', steps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, step; step = steps[i]; i++) {
                        restriction.addClause('hhelpdesk_step_log.step_log_id', step.step_log_id, "=", "OR");
                    }
                }
                
                //refresh the history panel
                this.historyPanel.refresh(restriction);
	         }
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	
    /**
     * Set history field
     */
	historyPanel_afterRefresh: function(){
		var rows = this.historyPanel.rows;
	    
	    var datetime = "";
	    for (var i = 0; i < rows.length; i++) {
	        var row = rows[i];
	        var user = "";
	        if (row['hhelpdesk_step_log.user_name']) 
	            user = row['hhelpdesk_step_log.user_name'];
	        if (row['helpdesk_step_log.em_id']) 
	            user = row['hhelpdesk_step_log.em_id'];
	        if (row['hhelpdesk_step_log.vn_id']) 
	            user = row['hhelpdesk_step_log.vn_id'];
	        row['hhelpdesk_step_log.vn_id'] = user;
	        
	        if (row["hhelpdesk_step_log.date_response"] == "" && row["hhelpdesk_step_log.time_response"] == "") {
	            datetime = getMessage("pending");
	        }
	        else {
	            datetime = row["hhelpdesk_step_log.date_response"] + " " + row["hhelpdesk_step_log.time_response"];
	        }
	        row['hhelpdesk_step_log.date_response'] = datetime;
	    }
	    this.historyPanel.reloadGrid();
    },
	
	showReferenceMaterial: function() {
		var eqId = this.wrDetailsMore.getFieldValue("hwr.eq_id");
		var probType = this.wrDetails.getFieldValue("hwr.prob_type");
		var pmpId = this.wrDetailsMore.getFieldValue("hwr.pmp_id");
		
		this.wrReferenceMaterial.addParameter("eqId", eqId);
		this.wrReferenceMaterial.addParameter("probType", probType);
		this.wrReferenceMaterial.addParameter("pmpId", pmpId);
		
		// don't apply any restriction
		this.wrReferenceMaterial.refresh();
		this.wrReferenceMaterial.show(true);
	},
	
	 /**
	 * Load related work requests.
	 */
	loadRelatedWorkRequests: function() {
		jQuery('#relatedRequestsTable').empty();
		var wrId = this.wrDetails.getFieldValue('hwr.wr_id');
		
		var result = {};
		 try {
			  result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getRelatedWorkRequests',parseInt(wrId));
		 } catch (e) {
			  Workflow.handleError(e);
		 }
		 
		 var controller = this;
		 
		 if(result.code == 'executed'){
			var relatedRequests = eval('('+result.jsonExpression+')');
			if(relatedRequests.length > 0){
				for(var i=0;i<relatedRequests.length;i++){
					this.writeRelatedReqeustHtml(relatedRequests[i]);
				}
				
				jQuery('.relatedRequestLink').click(function(){
					var openerView = View.getOpenerView();
					var relatedId = jQuery(this).text();
					var restriction = new Ab.view.Restriction();
					restriction.addClause('hwr.wr_id', relatedId);
					
					var relatedView = 'b-bldgops-console-wr-details-archived.axvw';
					var wrRecords = View.dataSources.get('wrDetailsDS').getRecords(restriction);
					if(wrRecords.length==0){
						relatedView = 'ab-bldgops-console-wr-details-related.axvw';
					}
					
					//ab-bldgops-console-wr-details-related.axvw
					openerView.openDialog(relatedView, restriction, false, {
						width : 1000,
						height : 600,
						closeButton : false,
						isDialog : true,
						collapsible : false,
						title : getMessage('workRequestDetailsTitle')
					});
				})
			}
		 }
		
    },
    
	 /**
	 * Write related work request html field.
	 */
    writeRelatedReqeustHtml: function(wrId) {
    	jQuery('<tr><td><span class="relatedRequestLink">'+wrId+'</span></td></tr>').appendTo(jQuery('#relatedRequestsTable'));
    },
    
	 /**
		 * Check if exists my approved requests.
		 */
	setPriorityLabel: function() {
		var priorityLabel = '';
		try {
			priorityLabel = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getPriorityLable', parseInt(this.wrDetailsMore.getFieldValue('wr.wr_id'))).message;
		} 
		catch (e) {
		}
		
		this.wrDetailsMore.setFieldValue('priorityLabel', priorityLabel);
    },
	
    /**
     * Set location field value
     */
	setLocationValue: function(){
		this.wrDetailsMore.setFieldValue('location', this.wrDetailsMore.getFieldValue('hwr.bl_id')
				+"-"+this.wrDetailsMore.getFieldValue('hwr.fl_id')
				+"-"+this.wrDetailsMore.getFieldValue('hwr.rm_id'));
	},
	
	/**
     * Show PM fields if the problem type is PM
     */
	showPmFields: function(){
		var problemType = this.wrDetails.getFieldValue('hwr.prob_type');
		if(problemType == 'PREVENTIVE MAINT'){
			this.wrDetailsMore.showField('hwr.pmp_id',true);
			this.wrDetailsMore.showField('hwr.pms_id',true)
		}else{
			this.wrDetailsMore.showField('hwr.pmp_id',false);
			this.wrDetailsMore.showField('hwr.pms_id',false)
		}
	},
	
    /**
     * Collapse given panels to make sure the UI looking good
     */
	collapsePanels: function(){
		var panelArray = ['wrDetailsMore','historyPanel','wrtrGrid','wrptGrid','wrcfGrid','wrttGrid','wrtlGrid','wrotherGrid'];
		for(var i=0; i< panelArray.length; i++){
			var panel = panelArray[i];
			View.panels.get(panel).setCollapsed(true);
		}
	},
	
    
    /**
     * KB3047586 - Close Work request details dialog when sub dialog pop up
     * 
     */
	wrDetails_onCloseDetailsWindow: function(){
		var openerView = View.getOpenerView();
		openerView.dialog = this.workRequestDetailDialog;
		openerView.closeDialog();
    },
    
	
	locArray:[],
	
	/**
     * Open the drawing pop up and draw redlines and save to documents.
     */	
	indicateOnDrawing: function(){
		var requestId = this.wrDetailsMore.getFieldValue("hwr.wr_id");
			
		var c=View.controllers.items[0];
		var blId=this.wrDetailsMore.getFieldValue('hwr.bl_id');
		var flId=this.wrDetailsMore.getFieldValue('hwr.fl_id');
		var rmId=this.wrDetailsMore.getFieldValue('hwr.rm_id');
		if(valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)){
			c.locArray[0]=blId;
			c.locArray[1]=flId;
			c.locArray[2]=rmId;
			c.workRequestId=this.wrDetailsMore.getFieldValue('hwr.wr_id');
			c.activityLogId=this.wrDetailsMore.getFieldValue('hwr.activity_log_id');
			View.openDialog('ab-bldgops-console-redlines-dialog.axvw');
		} else {
			alert(getMessage("noLocation"));
		}
	}
	
});
