function refreshPanels(row){
	var landlord_name = row['ls.ld_name'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls.ld_name", landlord_name); 
	View.panels.get('abRplmPfadminLsByLnName_detailsRep').refresh(restriction);
}
