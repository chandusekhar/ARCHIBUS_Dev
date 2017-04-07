var serviceRequestStepController = View.createController('serviceRequestStep', {

//showField(fieldName,false) for approval fields

	afterInitialDataFetch:function(){
		checkFormFieldsForStep("stepForm","activity_log");
	},
	afterRefresh:function(){
		checkFormFieldsForStep("stepForm","activity_log");
	},
	stepForm_onAccept: function(){
		var record = ABHDC_getDataRecord2(this.stepForm);
		var comments = this.stepForm.getFieldValue("activity_log_step_waiting.comments");
	    var activity_log_id = this.stepForm.getFieldValue("activity_log.activity_log_id");
	    
	    var result = {};
	    try {
			result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-acceptRequest', record,comments);
			updateResponseUserName();
      	}catch(e) {
    		if (e.code=='ruleFailed'){
      		  View.showMessage(e.message);
      		}else{
    		  Workflow.handleError(e);
    		}
    		return;
		}
		if (result.code == 'executed') {
			View.getOpenerView().refresh();
	        View.closeThisDialog();			
	   	}else{
	       	 Workflow.handleError(result);
	    } 
	},
	stepForm_onDecline: function(){
		var record = ABHDC_getDataRecord2(this.stepForm);	    
		var comments = this.stepForm.getFieldValue("activity_log_step_waiting.comments");
	    var activity_log_id = this.stepForm.getFieldValue("activity_log.activity_log_id");
	    
	    var result = {}; 		
	    try {
			result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-declineRequest', record,comments);
			updateResponseUserName();
      	}catch(e) {
    		if (e.code=='ruleFailed'){
      		  View.showMessage(e.message);
      		}else{
    		  Workflow.handleError(e);
    		}
    		return;
		}
		if (result.code == 'executed') {
			View.getOpenerView().refresh();
	        View.closeThisDialog();			
	   	}else{
	       	 Workflow.handleError(result);
	    }   
	},
	stepForm_onApprove: function(){
		var record = ABHDC_getDataRecord2(this.stepForm);	    
		var comments = this.stepForm.getFieldValue("activity_log_step_waiting.comments");
	    var activity_log_id = this.stepForm.getFieldValue("activity_log.activity_log_id");
		
		var result = {};
	    try {
			result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record,comments);
			updateResponseUserName();
      	}catch(e) {
    		if (e.code=='ruleFailed'){
      		  View.showMessage(e.message);
      		}else{
    		  Workflow.handleError(e);
    		}
    		return;
		}
		if (result.code == 'executed') {
			View.getOpenerView().refresh();
	        View.closeThisDialog();			
	   	}else{
	       	Workflow.handleError(result);
	    }  
	},
	stepForm_onReject: function(){
		var stepType = this.stepForm.getFieldValue("activity_log_step_waiting.step_type");
		var record = ABHDC_getDataRecord2(this.stepForm); 
		var comments = this.stepForm.getFieldValue("activity_log_step_waiting.comments");
	    var activity_log_id = this.stepForm.getFieldValue("activity_log.activity_log_id");
		
		var result = {};
		if(stepType == 'approval'){
		    try {
				result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record,comments);
				updateResponseUserName();
	      	}catch(e){
	    		if (e.code=='ruleFailed'){
      		  		View.showMessage(e.message);
      			}else{
    		  		Workflow.handleError(e);
    			}
    			return;
			}
			if (result.code == 'executed') {
				var tabPanel = View.getOpenerView().getView('parent').panels.get('tabs');
				View.closeThisDialog();
				tabPanel.selectTab('search');
		   	}else{
		       	Workflow.handleError(result);
		    } 
		} else if(stepType == 'dispatch'){
			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-rejectDispatchRequest', 'activity_log','activity_log_id',activity_log_id,record,comments);
				updateResponseUserName();
	      	}catch(e) {
	    		if (e.code=='ruleFailed'){
      		  		View.showMessage(e.message);
      			}else{
    		  		Workflow.handleError(e);
    			}
    			return;
			}
			if (result.code == 'executed') {
				var tabPanel = View.getOpenerView().getView('parent').panels.get('tabs');
				View.closeThisDialog();
				tabPanel.selectTab('search')
		   	}else{
		       	Workflow.handleError(result);
		    } 
		}
	},
	stepForm_onDispatch: function(){
		this.stepForm.clearValidationResult();

		if(this.stepForm.getFieldValue("activity_log.supervisor") == "" 
			&& this.stepForm.getFieldValue("activity_log.work_team_id") == ""){
			this.stepForm.addInvalidField("activity_log.supervisor",getMessage("supervisorOrWorkteam"));
			this.stepForm.displayValidationResult();
			return;
		}
	
         
		var comments = this.stepForm.getFieldValue("activity_log_step_waiting.comments");
    	var id = this.stepForm.getFieldValue("activity_log.activity_log_id");
    	var record = ABHDC_getDataRecord2(this.stepForm);
		
		var result = {}; 
      	try {
			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-dispatchRequest', 'activity_log','activity_log_id',id,record,comments);
			updateResponseUserName();
      	}catch(e){
    		if (e.code=='ruleFailed'){
      		  View.showMessage(e.message);
      		}else{
    		  Workflow.handleError(e);
    		}
    		return;
		}
		if (result.code == 'executed') {
			View.getOpenerView().refresh();
	        View.closeThisDialog();			
	   	}else{
	       	Workflow.handleError(result);
	    }  
	},
	stepForm_onForward: function(){
		this.stepForm.clearValidationResult();

		if(this.stepForm.getFieldValue("activity_log.approved_by") == ""){
			this.stepForm.addInvalidField("activity_log.approved_by",getMessage("forwardToMissing"));
			this.stepForm.displayValidationResult();
			return;
		}
		
		// we use the approved_by as temporary field
		var forwardTo = this.stepForm.getFieldValue("activity_log.approved_by");
		this.stepForm.setFieldValue("activity_log.approved_by","")
		
		var comments = this.stepForm.getFieldValue("activity_log_step_waiting.comments");
    	var id = this.stepForm.getFieldValue("activity_log.activity_log_id");
    	var stepLogId = this.stepForm.getFieldValue("activity_log_step_waiting.step_log_id");
		
		var result = {};
      	try {
			result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-forwardStep', 'AbBldgOpsHelpDesk',id,stepLogId,comments,forwardTo);	
      	}catch(e){
    		if (e.code=='ruleFailed'){
      		  View.showMessage(e.message);
      		}else{
    		  Workflow.handleError(e);
    		}
    		return;
		}
		if (result.code == 'executed') {
			View.getOpenerView().refresh();
	        View.closeThisDialog();			
	   	}else{
	       	Workflow.handleError(result);
	    }  
	},
	stepForm_onConfirm: function(){
		var stepType = this.stepForm.getFieldValue("activity_log_step_waiting.step_type");
		var record = ABHDC_getDataRecord2(this.stepForm); 
		
		var result = {};
		if(stepType == 'survey'){
			try {
				result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-saveSatisfaction', record);	
				updateResponseUserName();
	      	}catch(e){
	    		if (e.code=='ruleFailed'){
      		  		View.showMessage(e.message);
      			}else{
    		  		Workflow.handleError(e);
    			}
    			return;
			}
			if (result.code == 'executed') {
				View.getOpenerView().refresh();
	        	View.closeThisDialog();			
	   		}else{
	       		Workflow.handleError(result);
	    	}  
		} else if(stepType == 'verification'){
			try {
				result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-verifyRequest', record);
				updateResponseUserName();
	      	}catch(e){
	    		if (e.code=='ruleFailed'){
      		  		View.showMessage(e.message);
      			}else{
    		  		Workflow.handleError(e);
    			}
    			return;
			}
			if (result.code == 'executed') {
				View.getOpenerView().refresh();
	        	View.closeThisDialog();			
	   		}else{
	       		Workflow.handleError(result);
	    	}  
		}

	},
	stepForm_onReturn: function(){
		var record = ABHDC_getDataRecord2(this.stepForm); 
		
		var result = {};
		try{
			result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-returnRequestIncomplete', record);	
      	}catch(e){
    		if (e.code=='ruleFailed'){
      		  View.showMessage(e.message);
      		}else{
    		  Workflow.handleError(e);
    		}
    		return;
		}
		if (result.code == 'executed') {
			View.getOpenerView().refresh();
	        View.closeThisDialog();			
	   	}else{
	       	Workflow.handleError(result);
	    } 
	}
});

function onChangeSupervisor(fieldName,selectedValue,previousValue){
	var form = View.panels.get("stepForm");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue);
	}
	if(form.getFieldValue("activity_log.supervisor") != ""){
		form.setFieldValue("activity_log.work_team_id","");
	}
}

function onChangeWorkTeamId(fieldName, selectedValue, previousValue){
	var form = View.panels.get("stepForm");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue)	
	}
	if(form.getFieldValue('activity_log.work_team_id') != ''){
		form.setFieldValue('activity_log.supervisor','');	
	}
}

function updateResponseUserName(){
	var form = View.panels.get("stepForm");
	var stepLogId = form.getFieldValue('activity_log_step_waiting.step_log_id');
	var ds = View.dataSources.get('stepLogDS');
	var record = ds.getRecord('helpdesk_step_log.step_log_id='+stepLogId);
	if(record){
		record.setValue('helpdesk_step_log.user_name',View.user.name);
		record.setValue('helpdesk_step_log.em_id',View.user.employee.id);
		ds.saveRecord(record);
	}
}