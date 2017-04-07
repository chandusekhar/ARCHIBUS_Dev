var controller = View.createController('departmentTreeCtrl',{
	afterViewLoad:function(){
		this.departmentTree.setNullValueTitle("dv.dv_id", "Unassigned Division");
		this.departmentTree.setNullValueTitle("dv.dv_name", "Unassigned Division Name");
		this.departmentTree.setNullValueTitle("dp.dp_id", "Unassigned Department");
		this.departmentTree.setNullValueTitle("dp.dp_name", "Unassigned Department Name");
	}
});