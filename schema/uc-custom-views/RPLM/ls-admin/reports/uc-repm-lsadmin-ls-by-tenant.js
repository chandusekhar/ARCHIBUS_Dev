function refreshPanels(row){
	var tenant_name = row['ls.tn_name'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls.tn_name", tenant_name); 
	View.panels.get('abRplmPfadminLsByTnName_detailsRep').refresh(restriction);
}
