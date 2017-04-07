var costMgmtAccountInfoController = View.createController('costMgmtAccountInfo', {
	ac_id:'00100-H',
	afterInitialDataFetch:function(){
         this.reportCostMgmtAccountInfo.addParameter('ac_id', ' ac_id = '+ '\''+ this.ac_id+ '\'');
         this.reportCostMgmtAccountInfo.refresh();
	},
})

