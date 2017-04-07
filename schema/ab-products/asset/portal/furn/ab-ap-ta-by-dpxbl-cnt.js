var ctrlAbApTaByDpxBlCnt = View.createController('abApTaByDpxBlCntCtrl', {
	afterViewLoad: function(){
		this.list_abApTaByDpxBlCnt_fnstd.buildPostFooterRows = addTotalRow;
	}
})

function showCounts(cmdCtx){
	var panel = cmdCtx.command.getParentPanel();
	var row = panel.gridRows.get(panel.selectedRowIndex);
	var record = row.record;
	var bl_id = '';
	var dp_id = '';
	var dv_id = '';
	if(record['rm.bl_id.key']){
		bl_id = record['rm.bl_id.key'];
	}
	if(record['rm.dp_id']){
		dp_id = record['rm.dp_id'];
	}
	if(record['rm.dv_id']){
		dv_id = record['rm.dv_id'];
	}
	var restriction = new Ab.view.Restriction();
	restriction.addClause('fn.bl_id', bl_id, '=');
	restriction.addClause('fn.dp_id', dp_id, '=');
	restriction.addClause('fn.dv_id', dv_id, '=');
	var target = View.panels.get('list_abApTaByDpxBlCnt_fnstd');
	target.refresh(restriction);
}
