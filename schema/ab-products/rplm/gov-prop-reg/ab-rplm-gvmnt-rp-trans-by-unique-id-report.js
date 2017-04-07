var transByUniqueIdController = View.createController('transByUniqueId',{
	consoleSearchTransByUniqId_onSearch:function(){
		var criteria = this.consoleSearchTransByUniqId.getFieldValue('grp_trans.unique_identifier');
		if(criteria.length > 0){
			this.gridReportTransByUniqId.addParameter('criteria', criteria);
			this.gridReportTransByUniqId.refresh();
		}else{
			View.showMessage(getMessage('error_no_search_criteria'));
		}
	},
	doRefresh:function(){
		var criteria = this.consoleSearchTransByUniqId.getFieldValue('grp_trans.unique_identifier');
		this.gridReportTransByUniqId.addParameter('criteria', criteria);
		this.gridReportTransByUniqId.refresh();
	},
	gridReportTransByUniqId_afterRefresh: function(){
		var criteria = this.consoleSearchTransByUniqId.getFieldValue('grp_trans.unique_identifier');
		if (criteria.length > 0) {
			this.gridReportTransByUniqId.setTitle(getMessage('title_detail_panel')+' '+ criteria);
		}
	},
	gridReportTransByUniqId_details_onClick:function(row){
		var selected = row.getFieldValue('grp_trans.grp_trans_id');
		var selectedProperty = row.getFieldValue('grp_trans.unique_identifier');
		View.openDialog('ab-rplm-gvmnt-rp-trans-details.axvw', {}, true, { 
		    width: 800, 
		    height: 600, 
		    closeButton: true,
			selectedTrans:selected,
			selectedProperty:selectedProperty
		});
	}
})
