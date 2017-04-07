var abRepmLeaseDetails_tabComLogsController = View.createController('abRepmLeaseDetails_tabComLogsController', {
	lsId: null,
	
	refreshView: function(lsId){
		this.lsId = lsId;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.ls_id', this.lsId, '=');
		this.abRepmLsadminCommLogGrid.refresh(restriction);
		
	},
	
	abRepmLsadminCommLogGrid_onNew: function(){
		openAddEditDialog(true, 'abRepmLsadminCommLogGrid', {}, ['ls_comm.ls_id']);
	}

});

function onOpenCommLogDoc(ctx){
	var record = ctx.row.record;
	View.showDocument({'auto_number':record['ls_comm.auto_number']},'ls_comm','doc',record['ls_comm.doc']);
}

function onEditCommLog(ctx){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls_comm.auto_number', ctx['ls_comm.auto_number'], '=');
	ctx.restriction = restriction;
	openAddEditDialog(false, ctx.grid.id, ctx, null);
}
