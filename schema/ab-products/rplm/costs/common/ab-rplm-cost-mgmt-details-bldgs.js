var costMgmtBuildingInfoController = View.createController('costMgmtBuildingInfo', {
	bl_id:'',
	afterInitialDataFetch:function(){
         this.reportCostMgmtBldgInfo.addParameter('bl_id', ' bl_id = '+ '\''+ this.bl_id+ '\'');
         this.reportCostMgmtBldgInfo.refresh();
	},
})