var costMgmtLeaseInfoController = View.createController('costMgmtLeaseInfo', {
	ls_id:'',
	restriction:'',
	afterInitialDataFetch:function(){
		 restriction = new Ab.view.Restriction();
         restriction.addClause('ls.ls_id', this.ls_id, '=');
         this.reportCostMgmtLease.refresh(restriction);
	},
})