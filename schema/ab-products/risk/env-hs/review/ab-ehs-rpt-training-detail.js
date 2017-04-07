var abEhsRptTrainingDetailCtrl = View.createController('abEhsRptTrainingDetailCtrl',{
	trainingId:null,
	
	afterViewLoad: function(){
    	this.abEhsRptTrainingDetail_categ_tree.setTreeNodeConfigForLevel(0,           	
            [{fieldName: 'ehs_training_cat.training_category_id'},                   
             {fieldName: 'ehs_training_cat.description', length: 50}]);      
    },
	
	abEhsRptTrainingDetail_showReports: function(node){
		this.trainingId = node.restriction.clauses[0].value;
	    var trainingRestriction = new Ab.view.Restriction();
	    if(this.trainingId){
	    	trainingRestriction.addClause("ehs_training.training_id",this.trainingId,"=");
	    }
	    this.abEhsRptTrainingDetail_form.refresh(trainingRestriction);
	    
	    trainingRestriction = new Ab.view.Restriction();
	    if(this.trainingId){
	    	trainingRestriction.addClause("ehs_training_results.training_id",this.trainingId,"=");
	    }
	    this.abEhsRptTrainingDetail_grid.refresh(trainingRestriction);
	},
	abEhsRptTrainingDetail_form_onExportDOCX: function(){
		var trainingRestriction = new Ab.view.Restriction();
    	if(this.trainingId){
    		trainingRestriction.addClause("ehs_training.training_id",this.trainingId, "=");
    	}
		var restriction = {"abEhsRptTrainingDetailPgrp_trainingDs": trainingRestriction};
		
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-ehs-rpt-training-detail-pgrp.axvw", restriction, parameters);
	}
});