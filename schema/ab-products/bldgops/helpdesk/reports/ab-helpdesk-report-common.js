/**
* ABHDRPTC is the abbreivation for ab-helpdesk-report-common
*/
function ABHDRPTC_setRestriction(fieldName,panelId){

	var restriction = "0=0";
	var year = document.getElementById("selectYear").value;
	if(year != ""){
		restriction +=  " AND " + fieldName + " LIKE \'" + year + "%\'";
	}
	//alert(restriction);
	var panel = View.panels.get(panelId);
	panel.refresh(restriction);
}

function ABHDRPTC_clearConsole(panelId){
	document.getElementById("selectYear").value = '';
	var panel = View.panels.get(panelId);
	panel.refresh("0=0");
}
