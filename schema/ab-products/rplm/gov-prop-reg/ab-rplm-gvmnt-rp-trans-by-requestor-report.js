var transByRequestorController = View.createController('transByRequestor',{
	consoleSearchTransByRequestor_onSearch:function(){
		var criteria = this.consoleSearchTransByRequestor.getFieldValue('grp_trans.user_name_requestor');
		if(criteria.length > 0){
			this.gridReportTransByRequestor.addParameter('criteria', criteria);
			this.gridReportTransByRequestor.refresh();	
		}else{
			View.showMessage(getMessage('error_no_search_criteria'));
		}
	},
	doRefresh: function(){
		var criteria = this.consoleSearchTransByRequestor.getFieldValue('grp_trans.user_name_requestor');
		this.gridReportTransByRequestor.addParameter('criteria', criteria);
		this.gridReportTransByRequestor.refresh();
	},
	gridReportTransByRequestor_afterRefresh: function(){
		var criteria = this.consoleSearchTransByRequestor.getFieldValue('grp_trans.user_name_requestor');
		if (criteria.length > 0) {
			this.gridReportTransByRequestor.setTitle(getMessage('title_detail_panel')+' '+ criteria);
		}	
	},
	gridReportTransByRequestor_details_onClick:function(row){
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
