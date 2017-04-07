var abEhsRptEmTrainingPPEMedMonCtrl = View.createController('abEhsRptEmTrainingPPEMedMonCtrl',{
	emId:null,
	
	userRestricted: false,
	
	afterViewLoad: function(){
		/*
		 * restrict data to the user's employee ?
		 * Yes if from "EHS - Employee Review" process and "Employee Training, PPE Types and Medical Monitoring" task
		 */
		if(View.taskInfo.processId == "EHS - Employee Review" && View.taskInfo.taskId == 'Employee Training, PPE Types and Medical Monitoring'){
			// employee
			this.userRestricted = true;
		} else if(View.taskInfo.processId == "EHS - Review" && View.taskInfo.taskId == 'Employee Training, PPE Types and Medical Monitoring'){
			// manager
			this.userRestricted = false;
		} else {
			// default
			this.userRestricted = false;
		}
	},
	
	afterInitialDataFetch: function(){
		this.initConsole();
		
		// For Employee Review, the data is restricted to current user's employee, so display his data
		if(this.userRestricted){
			this.onFilter();
		}
	},
	
	clearForm: function(){
		this.abEhsRptEmTrainingPPEMedMon_console.clear();
		this.initConsole();
	},
	
	initConsole: function(){
		// For Employee Review, restrict the data to current user's employee
		if(this.userRestricted){
			this.abEhsRptEmTrainingPPEMedMon_console.setFieldValue("em.em_id", View.user.employee.id);
		}
	},
	
	/**
	 * Shows the report tabs according to the user restriction
	 */
	onFilter: function(){
		this.emId = this.abEhsRptEmTrainingPPEMedMon_console.getFieldValue("em.em_id");
		if(!validateFilter("abEhsRptEmTrainingPPEMedMon_console") || !validateEmId(this.emId)){
			return;
		}
    	
    	var filterRestriction = new Ab.view.Restriction();
    	filterRestriction.addClause("ehs_training_results.em_id",this.emId,"=");
		this.abEhsRptEmTrainingPPEMedMon_trainingPanel.refresh(filterRestriction);
		
		filterRestriction = new Ab.view.Restriction();
    	filterRestriction.addClause("ehs_em_ppe_types.em_id",this.emId,"=");
		this.abEhsRptEmTrainingPPEMedMon_ppePanel.refresh(filterRestriction);
		
		filterRestriction = new Ab.view.Restriction();
    	filterRestriction.addClause("ehs_medical_mon_results.em_id",this.emId,"=");
		this.abEhsRptEmTrainingPPEMedMon_medMonPanel.refresh(filterRestriction);
	},
	
	/**
	 * Export grids from all tabs
	 */
	abEhsRptEmTrainingPPEMedMon_console_onExportDOCX: function(){
		this.emId = this.abEhsRptEmTrainingPPEMedMon_console.getFieldValue("em.em_id");
		if(!validateFilter("abEhsRptEmTrainingPPEMedMon_console") || !validateEmId(this.emId)){
			return;
		}
		
    	var emRestriction = new Ab.view.Restriction();
    	emRestriction.addClause("em.em_id",this.emId, "=");
		var restriction = {"abEhsRptEmTraningPPEMedMonPgrp_emDs": emRestriction};
		
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-ehs-rpt-em-training-ppe-types-medical-monitoring-pgrp.axvw", restriction, parameters);
	}
});
