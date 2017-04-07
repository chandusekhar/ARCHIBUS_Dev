function onEqSelected(row) {
	var panel = View.getControl('', 'locateAsset_cadPanel');
	panel.clear();
	
	//var restriction = new Ab.view.Restriction();
	//restriction.addClause('eq.eq_id', row['eq.eq_id'], "=");
	//panel.setHighlightRestriction(restriction);
	
	//show all labels
	panel.setHighlightRestriction(null);
	
	//single asset found and zoom in
	panel.assetTypes="eq";
	panel.currentLabelsDS='locateEq_labelEqDs';
	panel.findAsset(row, null, true);
}

function onJkSelected(row) {
	var panel = View.getControl('', 'locateAsset_cadPanel');
	panel.clear();
	//only show located jk's label
	var restriction = new Ab.view.Restriction();
	restriction.addClause('jk.jk_id', row['jk.jk_id'], "=");
	panel.setHighlightRestriction(restriction);
	
	//single asset found and zoom in
	panel.assetTypes="jk";
	panel.currentLabelsDS='locateJk_labelJkDs';
	panel.findAsset(row, null, true);
}