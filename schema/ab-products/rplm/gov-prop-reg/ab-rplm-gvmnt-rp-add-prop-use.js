var addPropUseController = View.createController('addPropUse',{
	gridPropUse_grpUseId_onClick:function(row){
		this.showDetails(row);
	},
	gridPropUse_grpTypeId_onClick:function(row){
		this.showDetails(row);
	},
	gridPropUse_onNew:function(){
		this.showDetails(null);
	},
	showDetails:function(row){
		if(row != null){
			this.formPropUse.refresh({'grp_use.grp_use_id':row.getFieldValue('grp_use.grp_use_id'),'grp_use.grp_type_id':row.getFieldValue('grp_use.grp_type_id')},false);
		}else{
			this.formPropUse.refresh({},true);
		}
	}	
})

function refreshGrid(){
	addPropUseController.gridPropUse.refresh();
	hideForm();
}

function hideForm(){
	addPropUseController.formPropUse.show(false, true);
}
