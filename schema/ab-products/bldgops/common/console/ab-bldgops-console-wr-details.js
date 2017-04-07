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
     * Current status of work request.
     */	
	currentStatus: '',
	
	 /**
     * Is warning user.
     */	
	isWarnUser: false,
	
	userRoleOfTheRequet: 'requestor',
	
	/**
	 * Ab.operation.express.console.PriorityField
	 */
	priorityField : null,
	
	/**
	 * Fields that need call field after change event
	 */
	fieldsNeedCallAfterChange : null,
	

	/**
	 * supervisor complete option 'completeAllAssignments'| 'completeMyAssignments'
	 */
	supervisorCompleteOption: 'completeAllAssignments',

	
	 /**
     * After initial data fetch. Show relevant panel.
     */	
	afterViewLoad: function(){
		//KB3040758 - The Craftsperson can only view the wrcf that assigned to him or her.
		//KB3044170 - Allow craftspersons to view, read-only, the scheduling records of other craftspersons, so comments out below code add for KB3040758
		//var roleName = View.getOpenerView().controllers.get('opsExpressConsoleCtrl').roleName;
		//if(roleName == 'craftsperson'){
			//this.wrcfGrid.addParameter('permanentRestriction', 'EXISTS(SELECT 1 FROM cf WHERE cf.email=${sql.literal(user.email)} AND cf.cf_id = wrcf.cf_id)');
		//}
		
		// Initial priorityField
		this.priorityField = new Ab.operation.express.console.PriorityField('wrDetailsMore','approver');

		// Initial fieldsNeedCallAfterChange
		this.fieldsNeedCallAfterChange = new Ext.util.MixedCollection();
		this.fieldsNeedCallAfterChange.addAll({
			id : 'wr.site_id'
		}, {
			id : 'wr.bl_id'
		}, {
			id : 'wr.fl_id'
		}, {
			id : 'wr.rm_id'
		}, {
			id : 'wr.dv_id'
		}, {
			id : 'wr.dp_id'
		}, {
			id : 'wr.prob_type'
		}, {
			id : 'wr.eq_id'
		});
		
		this.wrDetails.fields.get('wr.prob_type').actions.get(0).command.commands[0].actionListener = afterSelectWorkRequestDetailsProblemtype;
	},

    /**
     * After initial data fetch. Show relevant panel.
     */	
	afterInitialDataFetch: function(){
		//hide Filter In console button by default, only show it when showing a related work request;
		if(valueExists(View.panels.get('relatedWorkRequestPanel'))){
			this.wrDetails.actions.get('filterInConsole').show(true);
		}else{
			this.wrDetails.actions.get('filterInConsole').show(false);
		}
		
		//hide related request fields by default, only show them when schema having fields wr.parent_wr_id and only show for supervisor and craftsperson
		jQuery('#wrDetailsMore_relatedRequestField_fieldCell').parent().hide();
		
		//hide submit button by default, only show this button when work request is rejected to requestor and need re-submit
		this.wrDetails.actions.get('submit').show(false);
		//set all editable field disable by default
		this.disableEditRequestParametersFeature();
		
		//get current work request status
		this.currentStatus = this.wrDetailsMore.getFieldValue('wr.status');
		
		var canAcessDirectly = this.canAcessDirectly()
		
		//show update panel by status
		this.showUpdatePanelByStatus();
	
		//set editable fields base on status
		this.setEditableFields();
		
		//set location field value
		//this.setLocationValue();
		
		//set priority label
		this.setPriorityLabel();
		
		//get step information
		opsConsoleStepHistoryController.getStepInfo();
		
		opsConsoleWrtrController.wrtrGrid.showColumn('wrtr.wr_id', false);
		opsConsoleWrtrController.wrtrGrid.update();
		
		opsConsoleWrOtherController.wrotherGrid.showColumn('wr_other.wr_id', false);
		opsConsoleWrOtherController.wrotherGrid.update();
		
		//hide fields for common panels for work request details view
		var opsConsoleWrcfController = View.controllers.get('opsConsoleWrcfController');
		opsConsoleWrcfController.hideFields([ 'wrcf.wr_id']);
		var opsConsoleWrtlController = View.controllers.get('opsConsoleWrtlController');
		opsConsoleWrtlController.hideFields([ 'wrtl.wr_id']);
		var opsConsoleWrptController = View.controllers.get('opsConsoleWrptController');
		opsConsoleWrptController.wrptGrid.showColumn('wrpt.cost_estimated', false);
		opsConsoleWrptController.wrptGrid.showColumn('wrpt.date_assigned', false);
		opsConsoleWrptController.wrptGrid.showColumn('wrpt.wr_id', false);
		opsConsoleWrptController.wrptGrid.update();
		
		//show actions only for supervisor and craftsperson
		this.disableEditForOtherRole(canAcessDirectly);
		
		//KB3042446 - hide add cf button for role - craftsperson
		opsConsoleWrcfController.updateForCf();
		
		//collapse panels
		this.collapsePanels();
		
		//change part grid title
		opsConsoleWrptController.wrptGrid.setTitle(getMessage('partGridTitle'));
		opsConsoleWrptController.wrptGrid.actions.get('addPt').setTitle(getMessage('addPtActionTitle'));
		
		//only allow Edit Request Parameter feature when application parameter EditRequestParameters = 1 and have schema field enforce_new_workflow
		if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_sla_response', 'enforce_new_workflow').value && this.checCfChangeWorkRequest() && canAcessDirectly){
			this.enableEditRequestParametersFeature();
			
		}
		
		//show 'Submit' button only when schema having field helpdesk_step_log.rejected_step and current request having pending rejected step
		if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_step_log', 'rejected_step').value && valueExists(View.getOpenerView().rejectedStep) && View.getOpenerView().rejectedStep =='R' ){
			this.wrDetails.actions.get('submit').show(true);
		}
		
		//only show related work request field when schema having field wr.parent_wr_id
		var userRoleOfTheRequet = this.userRoleOfTheRequet;
		if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','wr', 'parent_wr_id').value){
			jQuery('#wrDetailsMore_relatedRequestField_fieldCell').parent().show();
			this.loadRelatedWorkRequests();
			
			if(userRoleOfTheRequet == 'supervisor'|| userRoleOfTheRequet == 'craftsperson'){
				this.wrDetailsMore.actions.get('linkNew').show(true);
			}else{
				this.wrDetailsMore.actions.get('linkNew').show(false);
			}
		}else{
			this.wrDetailsMore.actions.get('linkNew').show(false);
		}
		
		//v22.1, add new feature Return work request - Supervisor
		if(canAcessDirectly){
			this.addSelectStatusEventForSupervisor();
		}
		
		if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','docs_assigned', 'activity_type').value){
			this.showReferenceMaterial();
		}
		
		 //KB3047546 - hide resource panels and update panel for requestor
		this.hidePanelsForRequestor();
		
		this.workRequestDetailDialog = View.getOpenerView().dialog;
		
		var closeXbuttons = jQuery(window.parent.document).find('.x-tool-close');
		jQuery(closeXbuttons[closeXbuttons.length-1]).click(function(){
			View.controllers.get('wrDetails').wrDetails_onCloseDetailsWindow();
		});
		
		//KB3048853 - Ops Workflow - make all work request parameters read-only for PM work requests
		this.disableFieldsForPmWorkRequests();
		
		// show priority fields
		this.priorityField.showPriority();
		var currentPriority = this.wrDetailsMore.getFieldValue('wr.priority');
		// show current priority radio
		SLA_setPriority('wrDetailsMore', 'wrDetailsMore', currentPriority, "priorities");
		
		//hide Filter In console button by default, only show it when showing a related work request;
		var status = this.wrDetailsMore.getFieldValue('wr.status');
		if(this.userRoleOfTheRequet == 'supervisor' && (status=='I' || status == 'A' || status == 'AA')){
			this.wrDetails.actions.get('forwardIssuedRequest').show(true);
		}
		
		//KB3044836 - show PM fields
		this.showPmFields();
		
		// set the view initialized
		this.initializedCompleted = true;
		
	},
	
	canAcessDirectly: function() {
		var wrId = this.wrDetails.getFieldValue('wr.wr_id');
		var openerView = View.getOpenerView();
		if (valueExists(openerView)) {
			var wrList = openerView.panels.get('wrList');
			if(wrList){
				var parameter = wrList.getParametersForRefresh();
				parameter.where = ' wr.wr_id = '+ wrId;
				var result = wrList.getData(parameter);
				if (valueExists(result.data.records) &&　result.data.records.length>0) {
					this.userRoleOfTheRequet = this.getUserRoleNameOfTheRequest(result.data.records[0])
					return true;
				}
			}
		}
		
		return false;
	},
	
	getUserRoleNameOfTheRequest : function(record) {
		var userRoleOfTheRequet = '';
		if(record['wr.isRequestSupervisor']=='true'){
			
			userRoleOfTheRequet = 'supervisor';
		
		}else if(record['wr.isRequestCraftsperson'] =='true'){
			
			userRoleOfTheRequet = 'craftsperson';
		
		}else if(record['wr.requestor'] == View.user.employee.id){
		
			userRoleOfTheRequet = 'requestor';
		
		}else{
		
			userRoleOfTheRequet = 'otherRole';
		}
		
		return userRoleOfTheRequet;
	},

	disableFieldsForPmWorkRequests: function() {
		var problemType = this.wrDetails.getFieldValue('wr.prob_type');
		if(problemType == 'PREVENTIVE MAINT'){
			this.enableAllEditableFields(false);
		}
	},
	
    hidePanelsForRequestor: function() {
    	var userRoleOfTheRequet = this.userRoleOfTheRequet;
		if(userRoleOfTheRequet == 'requestor' && 'Rej' == this.wrDetailsMore.getFieldValue('wr.status')) {
			View.panels.each(function(panel) {
	    		if(!(panel.id == 'wrDetails' || panel.id == 'wrDetailsMore' || panel.id == 'historyPanel')){
	    			panel.show(false);
	    		}
			});
			
			jQuery('#wrCosts').hide();
		} 
	},
	
	showReferenceMaterial: function() {
		var eqId = this.wrDetailsMore.getFieldValue("wr.eq_id");
		var probType = this.wrDetails.getFieldValue("wr.prob_type");
		var pmpId = this.wrDetailsMore.getFieldValue("wr.pmp_id");
		
		this.wrReferenceMaterial.addParameter("eqId", eqId);
		this.wrReferenceMaterial.addParameter("probType", probType);
		this.wrReferenceMaterial.addParameter("pmpId", pmpId);
		
		// don't apply any restriction
		this.wrReferenceMaterial.refresh();
		this.wrReferenceMaterial.show(true);
	},
	
	 /**
	 * Add select status event for supervisor.
	 */
	addSelectStatusEventForSupervisor: function() {
		var userRoleOfTheRequet = this.userRoleOfTheRequet;
		var detailsController = this;
		if(userRoleOfTheRequet == 'supervisor') {
			this.showStatusForSupervisor();
			if(mozillaFireFoxBrowser || navigator.userAgent.toLowerCase().indexOf("edge")!= -1 ){
				//below code work for Firefox -  support option client event 
				jQuery('#wrDetailsMore_wr\\.status').children().click(function(){
					var status = jQuery(this).val();
					var statusText = detailsController.getStatusText(status);
					detailsController.selectPriorStatusAndStep(status,statusText);
				});
			}else{
				//below code work for IE and Chrome, they not support option client event 
				jQuery('#wrDetailsMore_wr\\.status').click(function(){
					var evt=window.event;    
					if (evt && evt.offsetY<=0) { 
						var status = jQuery(this).val();
						var statusText = detailsController.getStatusText(status);
						detailsController.selectPriorStatusAndStep(status,statusText);
					}
				});
			}
		} 
	},
	
	 /**
	 * get status text.
	 */
	getStatusText: function(status) {
		var options = $('wrDetailsMore_wr.status').options;
		var text = '';
		for(var i=0;i<options.length;i++){
			if(options[i].value == status ){
				text = options[i].text;
				break;
			}
		}
		
		return text;
	},
	
	 /**
	 * Show status for supervisor.
	 */
	showStatusForSupervisor: function() {
		var currentStatus = this.wrDetailsMore.getFieldValue('wr.status');
		if(currentStatus=='A'||currentStatus=='AA'||currentStatus=='I'||currentStatus=='HA'||currentStatus=='HP'||currentStatus=='HL'||currentStatus=='Com'||currentStatus=='Rej'){
			this.wrDetailsMore.enableField('wr.status', true);
			this.wrDetailsMore.fields.get('wr.status').fieldDef.controlType = 'comboBox';
		}
		var wrId = this.wrDetails.getFieldValue('wr.wr_id');
		var isRequestStatusHavingOptionalSteps = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isRequestStatusHavingOptionalSteps', parseInt(wrId)).value;
		
		if(!isRequestStatusHavingOptionalSteps){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'R':''});
		}
		if(currentStatus == 'A'){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','AA':'','I':'','HA':'','HP':'','HL':'','Com':'','S':'','Can':'','Clo':''});
		}
		if(currentStatus == 'AA'){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','I':'','HA':'','HP':'','HL':'','Com':'','S':'','Can':'','Clo':''});
		}
		if(currentStatus == 'I'){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','S':'','Can':'','Clo':''});
		}
		if(currentStatus == 'HA'){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','S':'','Can':'','Clo':''});
		}
		if(currentStatus == 'HP'){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','S':'','Can':'','Clo':''});
		}
		if(currentStatus == 'HL'){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','S':'','Can':'','Clo':''});
		}
		if(currentStatus == 'Com'){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','S':'','Can':'','Clo':'','HA':'','HP':'','HL':''});
		}
		
		var workRequestsOnly = View.activityParameters['AbBldgOpsOnDemandWork-WorkRequestsOnly'];
		if (workRequestsOnly == '1') {
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'A':''});
		}
		
		var probType = this.wrDetails.getFieldValue("wr.prob_type");
		if('PREVENTIVE MAINT' == probType){
			this.wrDetailsMore.fields.get('wr.status').removeOptions({'R':'','Rej':'','A':''});
		}
		
		if(currentStatus == 'Rej'){
			var rejectStepLogRecords = this.rejectStepLogDS.getRecords("wr_id="+this.wrDetails.getFieldValue('wr.wr_id'));
			if(rejectStepLogRecords.length>0){
				var rejectedStep = rejectStepLogRecords[0].getValue('wr_step_waiting.rejected_step');
				if(rejectedStep){
					var rejectStatus = rejectedStep.split(';')[0];
					if(rejectStatus == 'A'){
						this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','AA':'','I':'','HA':'','HP':'','HL':'','Com':'','S':'','Can':'','Clo':''});
					}
					if(rejectStatus == 'AA'){
						this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','I':'','HA':'','HP':'','HL':'','Com':'','S':'','Can':'','Clo':''});
					}
					if(rejectStatus == 'I'){
						this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','HA':'','HP':'','HL':'','Com':'','S':'','Can':'','Clo':''});
					}
					if(rejectStatus == 'Com'){
						this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rev':'','S':'','Can':'','Clo':''});
					}
					
					return;
				}
				
			}
			
			this.wrDetailsMore.enableField('wr.status', false);
		}
		
	},
	
	 /**
	 * Select Prior status or prior step on current status.
	 */
	selectPriorStatusAndStep: function(status,statusText) {
		var openerView = View.getOpenerView();
		openerView.selectedWrIdForReturnSupervisor = this.wrDetails.getFieldValue('wr.wr_id');
		openerView.selectedPriorStatus = status;
		openerView.selectedPriorStatusText = statusText;
		openerView.selectedWrStatusForReturnSupervisor = this.currentStatus;
		if(this.checkNotOpenReturnForm(status)){
			//do not open return form if current status is issued and select status IN (Com, HA,HP,HL)
			if(status == 'Com' && this.checkCurrentUserCfAssigned()){
				this.completeOptionPanel.showInWindow({
					anchor: $('wrDetailsMore_wr.status'),
					title: getMessage('completeTitle') + ' ' + this.wrDetails.getFieldValue('wr.wr_id'),
					modal : true,
					width : 1000,
					height : 200});
				
			}
		}else{
			openerView.openDialog('ab-bldgops-console-wr-return.axvw', null, false, {
				width : 1000,
				height : 600,
				closeButton : false,
				isDialog : true,
				collapsible : false,
				title : getMessage('returenWorkRequestTitle')+" "+ this.wrDetails.getFieldValue('wr.wr_id')
			});
		}
		
	},
	
	completeOptionPanel_onCompleteYes: function() {
		var option = '';
		var radioOptions = document.getElementsByName('completeOptionRadio');
		for(var i=0; i<radioOptions.length; i++){
			if(radioOptions[i].checked == 1){
				option = radioOptions[i].value;
			}
		}
		this.supervisorCompleteOption = option;
		this.completeOptionPanel.closeWindow();
	},
	
	completeOptionPanel_onCompleteNo: function() {
		this.wrDetailsMore.setFieldValue('wr.status', this.currentStatus);
		this.completeOptionPanel.closeWindow();
	},
	
	 /**
	 * check current user cf assigned.
	 */
	checkCurrentUserCfAssigned: function() {
		this.assignmentsCheckDS.addParameter('wrId', this.wrDetails.getFieldValue('wr.wr_id'));
		if(this.assignmentsCheckDS.getRecords().length>0){
			return true;
		}else{
			return false;
		}
	},
	
	 /**
	 * Check select status is after current status.
	 */
	checkNotOpenReturnForm: function(status) {
		var notOpen = false;
		var currentStatus = View.controllers.get('wrDetails').currentStatus;
		if(status == 'HA'||status == 'HP'||status == 'HL' || (currentStatus == 'I' && status == 'Com') 
        || ((currentStatus == 'HA'||currentStatus == 'HP'||currentStatus == 'HL') && status == 'Com')){
			notOpen = true;
		}else{
			if(currentStatus == status && currentStatus != 'Rej'){
				var result = {};
				 try {
					  result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getReturnWorkflowSteps',parseInt(this.wrDetails.getFieldValue('wr.wr_id')),currentStatus);
				 } catch (e) {
					  Workflow.handleError(e);
				 }
				 
				 if(result.code == 'executed'){
					var returnWorkflowSteps = eval('('+result.jsonExpression+')');
					if(returnWorkflowSteps.length == 0){
						notOpen = true;
					}
				 }
			}
		}
        
		return notOpen;
	},
	
	 /**
	 * Check cf can change work request .
	 */
	checCfChangeWorkRequest: function() {
		var userRoleOfTheRequet = this.userRoleOfTheRequet;
		if(userRoleOfTheRequet == 'requestor') {
			//requestor could always allow edit the request parameter
			return true;

		} else if (userRoleOfTheRequet == 'craftsperson'||userRoleOfTheRequet == 'supervisor') {
			//for supervisor and craftsperson, check the value of cf.cf_change_wr 
			return Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checCfChangeWorkRequest').value;
		}else{
			//the other role are not allowed to edit request parameters
			return false;
		}

	},
	
	 /**
	 * Load related work requests.
	 */
	loadRelatedWorkRequests: function() {
		jQuery('#relatedRequestsTable').empty();
		var wrId = this.wrDetails.getFieldValue('wr.wr_id');
		
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
					restriction.addClause('wr.wr_id', relatedId);
					
					var relatedView = 'ab-bldgops-console-wr-details-related.axvw';
					var wrRecords = View.dataSources.get('wrDetailsDS').getRecords(restriction);
					if(wrRecords.length==0){
						relatedView = 'ab-bldgops-console-wr-details-archived.axvw';
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
	 * Set all editable fields disabled.
	 */
	disableEditRequestParametersFeature: function() {
		this.enableAllEditableFields(false);
    },
    
    /**
	 * Enable Edit Request Parameters feature.
	 */
    enableEditRequestParametersFeature: function() {
    	var userRoleOfTheRequet = this.userRoleOfTheRequet;
    	var status = this.wrDetailsMore.getFieldValue('wr.status');
		if(userRoleOfTheRequet == 'requestor') {
			 // call helper method setEditableForRequestor() to set editable for requestor
			this.setEditableForRequestor(status);

		} else if (userRoleOfTheRequet == 'supervisor') {
			// call helper method setEditableForSupervisor() to set editable for supervisor
			this.setEditableForSupervisor(status);

		} else if (userRoleOfTheRequet == 'craftsperson') {
			// call helper method setEditableForCraftsperson() to set editable for craftsperson
			this.setEditableForCraftsperson(status);
		}else{
			  //The other roles are not allowed edit the work request details
		}

    },
    
    /**
     * Set panel or form fields editable for requestor
     */
    setEditableForRequestor: function(status) {
    	//enable problem location field
    	this.wrDetails.enableField('wr.location', true);
    	
        //if status is before issued, enable field Description
        if(status == 'R' || status == 'A'|| status == 'AA' || status == 'Rej'){
        	this.wrDetails.enableField('wr.description', true);
        }
        
        this.wrDetails.actions.get('updateRequest').show(true);
    },
    
    /**
     * Set panel or form fields editable for supervisor
     */
    setEditableForSupervisor: function(status) {
    	//supervisor are allowed editable when status is before completed
    	 if(status=='A'|| status=='AA' || status=='I' || status=='HA'|| status=='HP'|| status=='HL'|| status=='Rej'){
    	     //enable all editable fields
    		this.enableAllEditableFields(true);
			var problemType = this.wrDetails.getFieldValue('wr.prob_type');
			if(problemType == 'PREVENTIVE MAINT'){
				this.wrDetailsMore.enableField('wr.eq_id', false);
			}
			
			this.wrDetails.actions.get('updateRequest').show(true);
    	}
    },
	
    /**
     * Set panel or form fields editable for craftsperson
     */
    setEditableForCraftsperson: function(status) {
    	// craftsperson is only allowed editable when status is issued
        if(status == 'I'|| status == 'Rej'){
            //enable all editable fields
        	this.enableAllEditableFields(true);
        	this.wrDetails.actions.get('updateRequest').show(true);
        }
    },
    
    /**
     * Set panel or form fields editable for craftsperson
     */
    enableAllEditableFields: function(enabled) {
    	this.wrDetails.enableField('wr.description', enabled);
		this.wrDetails.enableField('wr.location', enabled);
		this.wrDetails.enableField('wr.prob_type', enabled);
		this.wrDetailsMore.enableField('wr.site_id', enabled);
		this.wrDetailsMore.enableField('wr.bl_id', enabled);
		this.wrDetailsMore.enableField('wr.fl_id', enabled);
		this.wrDetailsMore.enableField('wr.rm_id', enabled);
		this.wrDetailsMore.enableField('wr.priority', enabled);
		this.wrDetailsMore.enableField('wr.dv_id', enabled);
		this.wrDetailsMore.enableField('wr.dp_id', enabled);
		this.wrDetailsMore.enableField('wr.eq_id', enabled);
		this.wrDetailsMore.enableField('wr.ac_id', enabled);
		
		if(enabled){
			jQuery(".priority_radio").removeAttr("disabled");
		}else{
			jQuery(".priority_radio").attr("disabled","disabled");
		}
		
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
     * Show the update panel according to the work request status
     */
	showUpdatePanelByStatus: function(){
		//show update panel when status IN 'I'|'HA'|'HL'|'HP'|'Com'
		var status = this.wrDetailsMore.getFieldValue('wr.status');
		if( status == 'I' || status == 'HA' || status == 'HL' || status == 'HP'||status == 'Com'){
			this.wrUpdates.show(true);
		}else{
			this.wrUpdates.show(false);
		}
	},
	
    /**
     * Set editable fields base on status
     */
	setEditableFields: function(){
		//show update panel when status IN 'I'|'HA'|'HL'|'HP'|'Com'
		var status = this.wrDetailsMore.getFieldValue('wr.status');
		if (status == 'I' || status == 'HA' || status == 'HL' || status == 'HP'|| status == 'Rej') {
			var userRoleOfTheRequet = this.userRoleOfTheRequet;
			//supervisor will follow the new feature - Return work request from supervisor
			if(userRoleOfTheRequet != 'supervisor' && userRoleOfTheRequet != 'requestor') {
				this.wrDetailsMore.enableField('wr.status', true);
				this.wrDetailsMore.fields.get('wr.status').fieldDef.controlType = 'comboBox';
				this.wrDetailsMore.fields.get('wr.status').removeOptions({'R':'','Rev':'','A':'','AA':'','S':'','Can':'','Clo':''});
				if(status != 'Rej'){
					this.wrDetailsMore.fields.get('wr.status').removeOptions({'Rej':''});
				}
			}else{
				this.wrDetailsMore.enableField('wr.status', false);
			} 
			
		} else {
			this.wrDetailsMore.enableField('wr.status', false);
		}
	},
	
    /**
     * Set location field value
     */
	setLocationValue: function(){
		this.wrDetailsMore.setFieldValue('location', this.wrDetailsMore.getFieldValue('wr.bl_id')
				+"-"+this.wrDetailsMore.getFieldValue('wr.fl_id')
				+"-"+this.wrDetailsMore.getFieldValue('wr.rm_id'));
	},
	
	/**
     * Show PM fields if the problem type is PM
     */
	showPmFields: function(){
		var problemType = this.wrDetails.getFieldValue('wr.prob_type');
		if(problemType == 'PREVENTIVE MAINT'){
			this.wrDetailsMore.showField('wr.pmp_id',true);
			this.wrDetailsMore.showField('wr.pms_id',true);
			jQuery('#wrDetailsMore_priorityRadio_labelCell').remove();
			jQuery('#wrDetailsMore_priorityRadio_fieldCell').remove();
			
		}else{
			this.wrDetailsMore.showField('wr.pmp_id',false);
			this.wrDetailsMore.showField('wr.pms_id',false)
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
     * Show 'Add' button and Delete button and some other actions only for supervisor and craftsperson
     */
	disableEditForOtherRole: function(canAcessDirectly){
		if (!canAcessDirectly || (this.userRoleOfTheRequet!='supervisor' && this.userRoleOfTheRequet!='craftsperson')) {
			View.panels.each(function(panel) {
				panel.actions.each(function(action) {
					if (action.id != 'closeDetailsWindow') {
						action.show(false);
					}
				})

				if (panel.type == 'grid') {
					var columns = panel.columns;
					for ( var i = 0; i < columns.length; i++) {
						if (columns[i].id.indexOf('delete') != -1) {
							panel.hideColumn(columns[i].id);
							panel.update();
							break;
						}
					}
					
					panel.removeActionListeners();
				}
			});

			this.wrDetailsMore.enableField('wr.status', false);
			this.wrDetailsMore.enableField('wr.ac_id', false);
			this.wrDetailsMore.enableField('wr.dv_id', false);
			this.wrDetailsMore.enableField('wr.dp_id', false);
			var updatePanel = this.wrUpdates;
			updatePanel.fields.each(function(field) {
				updatePanel.enableField(field.getId(), false);
			});
			
			jQuery(".priority_radio").attr("disabled","disabled");
		}
	},
	
    /**
     * Updat Work Request
     */
	wrDetails_onUpdateRequest: function(){
		//get work request status
		var status = this.wrDetailsMore.getFieldValue('wr.status');
		//KB3042434 - check pending request before update work request status
		var stepStatus = this.wrDetailsMore.getFieldValue('wr.step_status');
		if(this.currentStatus!=status && valueExistsNotEmpty(stepStatus) && stepStatus =='waiting'){
			View.showMessage(getMessage('pendingRequestWhenUpdate'));
			return;
		}
		
		//KB3053514 - Ops Console should not allow users to delete the Building Code of a work request
		var blId = this.wrDetailsMore.getFieldValue('wr.bl_id');
		var probType = this.wrDetails.getFieldValue('wr.prob_type');
		if(!valueExistsNotEmpty(blId) && (!valueExistsNotEmpty(probType) || 'PREVENTIVE MAINT' !== probType )){
			View.showMessage(getMessage('blRequired'));
			return;
		}
		
		//If application parameter EditRequestParameters = 1 and have schema field enforce_new_workflow, call new WFR AbBldgOpsOnDemandWork-WorkRequestService-editRequestParameters to edit the request parameters
		if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_sla_response', 'enforce_new_workflow').value && this.checCfChangeWorkRequest()){
			this.editRequestParameters();
		}else{//To keep database backwards compatibility, if schema not have the new application parameter EditRequestParameters and new schema field enforce_new_workflow, still keep the old version logic
			
			//get work request record
			var wrRecord = this.wrUpdates.getFieldValues();
			wrRecord['wr.ac_id'] = this.wrDetailsMore.getFieldValue('wr.ac_id');
			wrRecord['wr.dv_id'] = this.wrDetailsMore.getFieldValue('wr.dv_id');
			wrRecord['wr.dp_id'] = this.wrDetailsMore.getFieldValue('wr.dp_id');

			//call wfr to update work request values and invoke steps if status changed
			try {
				if((this.userRoleOfTheRequet == 'craftsperson' && status == 'Com') || (this.userRoleOfTheRequet == 'supervisor' && status == 'Com' && this.supervisorCompleteOption == 'completeMyAssignments')){
					var records = [];
					var record = {};
					record['wr.wr_id'] = wrRecord['wr.wr_id'];
					records.push(record);
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-completeCf', records);
				}else{
					var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', wrRecord, status);
				}
				
				if(this.currentStatus!=status){
					//refresh the console grid
					refreshConsole(View.getOpenerView());
				}

			    View.closeThisDialog();

			} catch (e) {
				Workflow.handleError(e);			
			}		
		}
		
    },
    
    /**
     * Submit Work Request
     */
	wrDetails_onSubmit: function(){
		//get work request record
		var wrRecord = this.wrUpdates.getFieldValues();
		wrRecord['wr.description'] = this.wrDetails.getFieldValue('wr.description');
		wrRecord['wr.location'] = this.wrDetails.getFieldValue('wr.location');

		//call wfr to update work request values and invoke steps of R status
		try {
			Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', wrRecord, "R");

			//refresh the console grid
		    refreshConsole(View.getOpenerView());
		    View.closeThisDialog();

		} catch (e) {
			Workflow.handleError(e);			
		}		
    },
    
    /**
     * Filter Work Request in console
     */
	wrDetails_onFilterInConsole: function(){
		var openerView = View.getOpenerView();
		var wrFilter = openerView.controllers.get('wrFilter');
		if (valueExists(wrFilter)) {
			// clear filter values
			wrFilter.clearEasyFilterValue();

			// clear big filter values
			wrFilter.clearBigFilter();
			
			//only set curent work request code in the filter
			wrFilter.bigBadFilter.setFieldValue('wr.wr_id',this.wrDetails.getFieldValue('wr.wr_id'));

			// refresh the result grid to the keep consistent with the filter
			wrFilter.wrFilter_onFilter();
			jQuery(window.parent.document).find('.x-tool-close').click();
		}
    },
    
    /**
     * Forward Work Request
     */
	wrDetails_onForwardIssuedRequest: function(){
		this.forwardForm.clear();
		var wrId = this.wrDetails.getFieldValue('wr.wr_id');
		var status = this.wrDetailsMore.getFieldValue('wr.status');
		if(status == 'I'){
			this.forwardForm.forwardIssuedRequest = true;
			jQuery('#forwardForm_forward_comments_labelCell').parent().show();
		}	
		
		this.forwardForm.wrIdList = [parseInt(wrId)];		
		this.forwardForm.showInWindow({
			x : 10,
			y : 100,
			modal : true,
			width : 600,
			height : 300,
			title : getMessage('forwordFormTitle') + ' ' + wrId
		});
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
    
    /**
     * Link new work request
     */
    wrDetailsMore_onLinkNew: function(){
    	var openerView = View.getOpenerView();    	
    	openerView.workRequestDetailDialogController = this;
    	openerView.linkedToRequest = this.wrDetailsMore.getRecord();
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
     * Edit Request Parameters.
     */	
    editRequestParameters: function(){
    	//get values from UI 
    	var wrRecord = this.wrUpdates.getFieldValues();
    	wrRecord['wr.description'] = this.wrDetails.getFieldValue('wr.description');
		wrRecord['wr.prob_type'] = this.wrDetails.getFieldValue('wr.prob_type');
		wrRecord['wr.location'] = this.wrDetails.getFieldValue('wr.location');
		wrRecord['wr.site_id'] = this.getSiteCodeBasedOnBlCode();
    	wrRecord['wr.bl_id'] = this.wrDetailsMore.getFieldValue('wr.bl_id');
		wrRecord['wr.fl_id'] = this.wrDetailsMore.getFieldValue('wr.fl_id');
		wrRecord['wr.rm_id'] = this.wrDetailsMore.getFieldValue('wr.rm_id');
		wrRecord['wr.priority'] = this.wrDetailsMore.getFieldValue('wr.priority');
		wrRecord['wr.dv_id'] = this.wrDetailsMore.getFieldValue('wr.dv_id');
		wrRecord['wr.dp_id'] = this.wrDetailsMore.getFieldValue('wr.dp_id');
		wrRecord['wr.eq_id'] = this.wrDetailsMore.getFieldValue('wr.eq_id');
		wrRecord['wr.pmp_id'] = this.wrDetailsMore.getFieldValue('wr.pmp_id');
		wrRecord['wr.requestor'] = this.wrDetailsMore.getFieldValue('wr.requestor');
		wrRecord['wr.activity_type'] = 'SERVICE DESK - MAINTENANCE';
		
		var isContinue = true;
		if(!this.isWarnUser && Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isRequestParameterChanged',wrRecord).value 
				&& this.isEnforceNewWorkflow(wrRecord)){
			isContinue = confirm(getMessage('warnRequestParameterChange'));
			this.isWarnUser = true;
		}
		
		if(isContinue){
			//call wfr to update update the request parameters
	    	 try {
				var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-editRequestParameters', wrRecord);
				var status = this.wrDetailsMore.getFieldValue('wr.status');
				if(this.currentStatus!=status){
					if((this.userRoleOfTheRequet == 'craftsperson' && status == 'Com')||(this.userRoleOfTheRequet == 'supervisor' && status == 'Com' && this.supervisorCompleteOption == 'completeMyAssignments')){
						var records = [];
						var record = {};
						record['wr.wr_id'] = wrRecord['wr.wr_id'];
						records.push(record);
						Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-completeCf', records);
					}else{
						Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', wrRecord, status);
					}
					
				}
				
				var latestStatus = this.wrDetailsDS.getRecord('wr.wr_id = ' + wrRecord['wr.wr_id']).getValue('wr.status');
				
				//refresh the console grid
				if(this.currentStatus!=latestStatus){
					refreshConsole(View.getOpenerView());
				}
				View.closeThisDialog();
	    	} catch (e) {
	    		Workflow.handleError(e);			
	    	}	
		}
	},
	
	 /**
     * is Enforce New Workflow.
     */	
	isEnforceNewWorkflow: function(wrRecord){
		var isEnforceNewWorkflow = false;
		 try {
			 isEnforceNewWorkflow = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isEnforceNewWorkflow',wrRecord).value;
	     } catch (e) {
	    	 Workflow.handleError(e);
	    	 throw e;
	     }	
		
		return isEnforceNewWorkflow;
	},
	
	 /**
     * Get site code base on the building code.
     */	
	getSiteCodeBasedOnBlCode: function(){
		return Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getSiteCodeBasedOnBlCode', this.wrDetailsMore.getFieldValue('wr.bl_id')).message;
	},

    /**
     * Enable fields base on status.
     */	
	wrtrForm_afterRefresh: function(){
		enableFormFieldsBaseOnWorkRequestStatus('wrtrForm','wrDetailsMore');
	},
	
    /**
     * Enable fields base on status.
     */	
	wrptForm_afterRefresh: function(){
		enableFormFieldsBaseOnWorkRequestStatus('wrptForm','wrDetailsMore');
	},
	
	
    /**
     * Enable fields base on status.
     */	
	wrcfForm_afterRefresh: function(){
		enableFormFieldsBaseOnWorkRequestStatus('wrcfForm','wrDetailsMore');
	},
	
	
    /**
     * Enable fields base on status.
     */	
	wrtlForm_afterRefresh: function(){
		enableFormFieldsBaseOnWorkRequestStatus('wrtlForm','wrDetailsMore');
	},
	
    /**
     * Enable fields base on status.
     */	
	wrotherForm_afterRefresh: function(){
		enableFormFieldsBaseOnWorkRequestStatus('wrotherForm','wrDetailsMore');
	},
	
	
	locArray:[],
	
	/**
     * Open the drawing pop up and draw redlines and save to documents.
     */	
	indicateOnDrawing: function(){
		var requestId = this.wrDetailsMore.getFieldValue("wr.wr_id");
			
		var c=View.controllers.items[0];
		var blId=this.wrDetailsMore.getFieldValue('wr.bl_id');
		var flId=this.wrDetailsMore.getFieldValue('wr.fl_id');
		var rmId=this.wrDetailsMore.getFieldValue('wr.rm_id');
		if(valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)){
			c.locArray[0]=blId;
			c.locArray[1]=flId;
			c.locArray[2]=rmId;
			c.workRequestId=this.wrDetailsMore.getFieldValue('wr.wr_id');
			c.activityLogId=this.wrDetailsMore.getFieldValue('wr.activity_log_id');
			View.openDialog('ab-bldgops-console-redlines-dialog.axvw');
		} else {
			alert(getMessage("noLocation"));
		}
	},
	
	/**
     * Refresh doc fields.
     */	
	refreshDocsPanel: function(){
		this.wrDetails.refresh();
		this.wrDetailsMore.setRecord(this.wrDetails.getRecord());
		View.closeDialog();
	},
	
	/**
	 * Re-query the sla and show priority radios after change field vale in fieldsNeedCallAfterChange.
	 */
	afterFieldValueChagne : function(fieldName) {
		if (this.initializedCompleted && this.fieldsNeedCallAfterChange.get(fieldName)) {
			// show priority fields
			this.priorityField.showPriority();
			var radios = jQuery('.priority_radio');
			for(var i = 0; i< radios.length;i++){
				if(radios[i].checked){
					this.wrDetailsMore.setFieldValue("wr.priority", radios[i].value);
					break;
				}
			}
			
		}
	}
	
});

/**
 * Over write core API to make sure re-query the sla and show the priorities again after change any field values in the form.
 */
Ab.form.Field.prototype.afterChange = function() {
	View.controllers.get('wrDetails').afterFieldValueChagne(this.getId());
}

/**
 * Action Listener after select Problem Type field.
 */
function afterSelectWorkRequestDetailsProblemtype(fieldName, selectedValue, previousValue) {
	var form = View.panels.get('wrDetails');
	View.panels.get('wrDetailsMore').setFieldValue("wr.priority", 1);
	form.setFieldValue('wr.prob_type', selectedValue);
	return false;
}