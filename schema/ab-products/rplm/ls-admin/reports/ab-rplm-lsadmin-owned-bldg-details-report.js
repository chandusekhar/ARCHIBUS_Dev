var repBldgDetailsMainController = View.createController('repBldgDetailsMainController', {
	searchPattern:'',
	
	treeCtry_onSearch: function(){
		this.formSearch.setFieldValue('bl.bl_id', this.searchPattern);
	},
	
	formSearch_onSave:function(){
		this.searchPattern = this.formSearch.getFieldValue('bl.bl_id');
		var queryParameter = 'AND bl.bl_id like \'%'+this.searchPattern+'%\'';
	
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.refresh();
	},
	
	treeCtry_onShow_all:function(){
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.refresh();
	}

});

function showDetails(event){
	var bl_id = '';
	if (event.restriction.findClause('bl.bl_id') != null) {
		bl_id = event.restriction.findClause('bl.bl_id').value;
	}
	var targetCrtl = View.panels.get('reportPanel').contentView.controllers.get('repOwnBuilding');
	targetCrtl.ls_id = '';
	targetCrtl.bl_id = bl_id;
	targetCrtl.pr_id = '';
	targetCrtl.initializeView();
}

