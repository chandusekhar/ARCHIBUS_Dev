var abEhsRptWorkCategCtrl = View.createController('abEhsRptWorkCategCtrl',{
	//selected tree node restriction
	nodeRestriction:null,
	
	afterViewLoad: function(){
		//Cut the showed description if it's more than 50 characters
		this.abEhsRptWorkCateg_tree.setTreeNodeConfigForLevel(0,           	
            [{fieldName: 'work_categories.work_category_id'},                   
             {fieldName: 'work_categories.description', length: 50}]);      
    },
	afterInitialDataFetch: function(){
		this.abEhsRptWorkCateg_tree.expand();
	},
	abEhsRptWorkCateg_tree_onExportDOCX: function(){
		var restriction = null;
		if(this.nodeRestriction){
			restriction = {"abEhsRptWorkCategPgrp_workDs":this.nodeRestriction};
		}
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-ehs-rpt-work-categories-pgrp.axvw", restriction, parameters);
	},
	setNodeRestriction: function(){
		var curTreeNode = this.abEhsRptWorkCateg_tree.lastNodeClicked;
	    var workCategId = curTreeNode.data["work_categories.work_category_id"];
	    this.nodeRestriction = new Ab.view.Restriction(); 
	    this.nodeRestriction.addClause("work_categories.work_category_id", workCategId, "="); 
	}
})