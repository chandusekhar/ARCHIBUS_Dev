//@lei
var abHelpdeskWorkrequestDocsControllert = View.createController("abHelpdeskWorkrequestDocsControllert", {
	/*firstLoad: 0,
	
	documentsPanel_afterRefresh: function(){
		var wrDoc1 = this.documentsPanel.getFieldValue("wr.doc1");
		var wrDoc2 = this.documentsPanel.getFieldValue("wr.doc2");
		var wrDoc3 = this.documentsPanel.getFieldValue("wr.doc3");
		var wrDoc4 = this.documentsPanel.getFieldValue("wr.doc4");
		
		// it will refresh when first access this view.
		if (this.firstLoad < 2) {
			this.firstLoad++;
			return;
		} else { 
			// Not use the panel refresh to avoid dead loop
			View.parentTab.loadView();
		}
	}*/
});


function returnToWo(){
    var panel = View.panels.get('documentsPanel');
    var woId = panel.getFieldValue('wr.wo_id');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('wo.wo_id', woId, '=');
    View.parentTab.parentPanel.selectTab('details', restriction, false, true);
    
}
