var abEhsRptPersTrainingCtrl = View.createController('abEhsRptPersTrainingCtrl',{
	afterViewLoad: function(){
    	this.abEhsRptPersTraining_categ_tree.setTreeNodeConfigForLevel(0,           	
            [{fieldName: 'ehs_training_cat.training_category_id'},                   
             {fieldName: 'ehs_training_cat.description', length: 50}]);      
    },

	abEhsRptPersTraining_showGrid: function(node){
		var trainingId = node.restriction.clauses[0].value;
	    var trainingRestriction = new Ab.view.Restriction();
	    if(trainingId){
	    	trainingRestriction.addClause("ehs_training_results.training_id",trainingId,"=");
	    }
	    this.abEhsRptPersTraining_training_grid.refresh(trainingRestriction);
	}
});