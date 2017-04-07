var estimationController = View.createController('estimationDetailsGrid', {
	
	afterInitialDataFetch:function(){
		this.refreshPanels();
	},
	afterRefresh:function(){
		this.refreshPanels();
	},
		
	refreshPanels: function() {   
		var wrId = this.wrEstCostReport.getFieldValue("wr.wr_id");
		
		var trRestriction = new Ab.view.Restriction();
		trRestriction.addClause('wrtr.wr_id',wrId,'=');
		this.estTradesReport.refresh(trRestriction);
		
		var ttRestriction = new Ab.view.Restriction();
		ttRestriction.addClause('wrtt.wr_id',wrId,'=');
		this.estTooltypesReport.refresh(ttRestriction);
		
		var ptRestriction = new Ab.view.Restriction();
		ptRestriction.addClause('wrpt.wr_id',wrId,'=');
		this.estPartsReport.refresh(ptRestriction);
		
		var otherRestriction = new Ab.view.Restriction();
		otherRestriction.addClause('wr_other.wr_id',wrId,'=');
		this.estOtherCostsReport.refresh(otherRestriction);
	}
});