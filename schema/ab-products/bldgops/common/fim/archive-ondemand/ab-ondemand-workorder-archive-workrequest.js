var abOndemandWOArcReqController = View.createController("abOndemandWOArcReqController",{
	
	requestPanel_beforeRefresh: function(){
	},
	
	requestPanel_afterRefresh: function(){
 		var wrId = this.requestPanel.getFieldValue('wr.wr_id');
 	 	var record = this.requestPanel.getRecord();
 	 	
 	 	var cfRestriction = new Ab.view.Restriction();
		cfRestriction.addClause("wrcf.wr_id", wrId, '=');
		this.cfPanel.refresh(cfRestriction);
		
		var partRestriction = new Ab.view.Restriction();
		partRestriction.addClause("wrpt.wr_id", wrId, '=');
		this.partPanel.refresh(partRestriction);
		
		var toolRestriction = new Ab.view.Restriction();
		toolRestriction.addClause("wrtl.wr_id", wrId, '=');
		this.toolPanel.refresh(toolRestriction);		
		
		var otherRestriction = new Ab.view.Restriction();
		otherRestriction.addClause("wr_other.wr_id", wrId, '=');
		this.otherPanel.refresh(otherRestriction);
  	
 	}
});
