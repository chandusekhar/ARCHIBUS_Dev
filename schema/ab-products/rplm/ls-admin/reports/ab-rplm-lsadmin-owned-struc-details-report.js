var repStructureDetailsMainController = View.createController('repStructureDetailsMainController', {
	searchPattern:'',
	
	treeCtry_onSearch: function(){
		this.formSearch.setFieldValue('property.pr_id', this.searchPattern);
	},
	
	formSearch_onSave:function(){
		this.searchPattern = this.formSearch.getFieldValue('property.pr_id');
		var queryParameter = 'AND property.pr_id like \'%'+this.searchPattern+'%\'';
	
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.refresh();
	},
	
	treeCtry_onShow_all:function(){
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.refresh();
	}

});

function showDetails(event){
	var pr_id = '';
	if (event.restriction.findClause('property.pr_id') != null) {
		pr_id = event.restriction.findClause('property.pr_id').value;
	}
	var targetCrtl = View.panels.get('reportPanel').contentView.controllers.get('repOwnStructure');
	targetCrtl.ls_id = '';
	targetCrtl.bl_id = '';
	targetCrtl.pr_id = pr_id;
	targetCrtl.initializeView();
}
