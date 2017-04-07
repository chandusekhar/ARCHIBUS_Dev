var projMngRptBidVarController = View.createController('projMngRptBidVar', {
	project_id : '',
	work_pkg_id : '',
	
	projMngRptBidVarTable_afterRefresh: function(){
		this.project_id = this.projMngRptBidVarTable.restriction.findClause('work_pkgs.project_id').value;
		this.work_pkg_id = this.projMngRptBidVarTable.restriction.findClause('work_pkgs.work_pkg_id').value;
	}
});

function projMngRptBidVarTable_onClickEvent(obj) {
	if (obj.restriction.clauses.length <= 0) return;
	
	var controller = View.controllers.get('projMngRptBidVar');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkg_bids.vn_id', obj.restriction.clauses[0].value);
	restriction.addClause('work_pkg_bids.project_id', controller.project_id);
	restriction.addClause('work_pkg_bids.work_pkg_id', controller.work_pkg_id);
	View.openDialog('ab-proj-mng-rpt-bid-var-dt.axvw', obj.restriction);
}

	