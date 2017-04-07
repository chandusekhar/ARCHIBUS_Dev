var abCbDefProbtypeCtrl = View.createController('abCbDefProbtypeCtrl',{
	afterInitialDataFetch: function(){
		this.abCbDefProbtype_treePanel.expand();
	},
	
	abCbDefProbtype_form_beforeSave: function(){
		this.abCbDefProbtype_form.setFieldValue("probtype.hierarchy_ids", this.abCbDefProbtype_form.getFieldValue("probtype.prob_type") + '|');
	},
	
	abCbDefProbtype_form_onAddNewChild: function(){
		var parentId = this.abCbDefProbtype_form.getFieldValue("probtype.prob_type");
		
		this.abCbDefProbtype_form.refresh(null, true);
		
		this.abCbDefProbtype_form.setFieldValue("probtype.prob_type", parentId + "|");
	},
	
	refreshTree: function(){
		this.abCbDefProbtype_treePanel.refresh();
		this.abCbDefProbtype_treePanel.expand();
	}
})
