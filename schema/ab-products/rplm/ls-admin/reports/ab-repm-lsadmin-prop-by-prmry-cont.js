function refreshPanel(row){
	View.panels.get('abRplmPfadminPrByContact_prDetailsRep').refresh("property.contact1 = '" + row['property.contact1']+"'");
}
