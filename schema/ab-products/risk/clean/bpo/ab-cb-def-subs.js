var abCbDefSubsCtrl = View.createController('abCbDefSubsCtrl',{
	afterInitialDataFetch: function(){
		this.abCbDefSubs_treePanel.expand();
	},
	
	abCbDefSubs_form_beforeSave: function(){
		this.abCbDefSubs_form.setFieldValue("probtype.hierarchy_ids", this.abCbDefSubs_form.getFieldValue("probtype.prob_type") + '|');
	},
	
	abCbDefSubs_form_onAddNewChild: function(){
		var parentId = this.abCbDefSubs_form.getFieldValue("probtype.prob_type");
		
		this.abCbDefSubs_form.refresh(null, true);
		
		this.abCbDefSubs_form.setFieldValue("probtype.prob_type", parentId + "|");
	},
	
	refreshTree: function(){
		this.abCbDefSubs_treePanel.refresh();
		this.abCbDefSubs_treePanel.expand();
	}
})
