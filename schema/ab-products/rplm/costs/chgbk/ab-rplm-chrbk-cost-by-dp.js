var costByDepartmentController = View.createController('costByDepartmentCtrl', {
	dp_id: null,
	dv_id: null,
	afterViewLoad: function(){
		this.formCostByDepartmentArea.refresh(new Ab.view.Restriction({'dp.dp_id':'-1'}));
	},
	gridCostByDepartment_onRefresh: function(){
		if(this.dp_id != null){
			this.gridCostByDepartment.addParameter('divisionId', this.dv_id);
			this.gridCostByDepartment.addParameter('departmentId', this.dp_id);
			this.gridCostByDepartment.refresh();
			this.formCostByDepartmentArea.refresh(new Ab.view.Restriction({'dp.dv_id':this.dv_id,'dp.dp_id':this.dp_id}));
			
		}
	},
	gridDepartment_onRefresh: function(){
		this.gridDepartment.refresh();
	}
});

function loadCostsByDepartment(row){
	costByDepartmentController.dp_id = row['dp.dp_id'];
	costByDepartmentController.dv_id = row['dp.dv_id'];
	costByDepartmentController.gridCostByDepartment_onRefresh();
}
