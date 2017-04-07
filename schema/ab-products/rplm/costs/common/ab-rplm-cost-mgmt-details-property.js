var costMgmtPropertyInfoController = View.createController('costMgmtPropertyInfo', {
	pr_id:'',
	afterInitialDataFetch:function(){
         this.reportCostMgmtPropertyInfo.addParameter('pr_id', ' pr_id = '+ '\''+ this.pr_id+ '\'');
         this.reportCostMgmtPropertyInfo.refresh();
	},
})