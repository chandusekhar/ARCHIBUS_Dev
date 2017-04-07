function refreshPanel(row){
	View.panels.get('abRplmPfadminBlByContact_blDetailsRep').refresh("bl.contact_name = '" + row['bl.contact_name']+"'");
}
