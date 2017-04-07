/**
* ABHDRPTC is the abbreivation for ab-helpdesk-report-common
*/
function ABODRPTC_setRestriction(fieldName,panelId){

	var restriction = "0=0";
	var year = document.getElementById("selectYear").value;
	if(year != ""){
		restriction +=  " AND " + fieldName + " LIKE \'" + year + "%\'";
	}
	//alert(restriction);
	var panel = View.panels.get(panelId);
	panel.refresh(restriction);
}

function ABODRPTC_clearConsole(panelId){
	document.getElementById("selectYear").value = '';
	var panel = View.panels.get(panelId);
	panel.refresh("0=0");
}

function onCrossTableClick(obj){
    var year = document.getElementById("selectYear").value;
    var restriction = obj.restriction;
	if(year != ""){
		restriction.addClause("hwr_month.month", year+'%', "LIKE",null ,false);
	}
    View.openDialog("ab-ondemand-report-requests.axvw", restriction);
}

function onArchievedWrCrossTableClick(obj,parentRes){
	if(parentRes){
		res =  parentRes;
	}
	else{
		res = " 1=1 ";
	}

    var restriction = obj.restriction;
	if(obj.restriction && obj.restriction.clauses){
		for(var i=0; i<obj.restriction.clauses.length;i++){
			var clause = obj.restriction.clauses[i];
			if(clause.name=="hwr.month"){
				res += " AND ${sql.yearMonthOf('hwr.date_completed')}='" + clause.value + "' ";
			}
			else if(clause.name=="hwr.dvdp"){
				if(!clause.value){
					res += " AND hwr.dv_id is null AND hwr.dp_id is null ";
				}
				else{
					res += " AND RTRIM(hwr.dv_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.dp_id) ='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="hwr.sitebl"){
				if(!clause.value){
					res += " AND hwr.site_id is null AND hwr.bl_id is null ";
				}
				else{
					res += " AND RTRIM(hwr.site_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.bl_id) ='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="eq.eq_std"){
				if(!clause.value){
					res += " AND eq.eq_std is null ";
				}
				else{
					res += " AND eq.eq_std='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="hwr.prob_type"){
				if(!clause.value){
					res += " AND hwr.prob_type is null ";
				}
				else{
					res += " AND hwr.prob_type='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="hwr.repair_type"){
				if(!clause.value){
					res += " AND hwr.repair_type is null ";
				}
				else{
					res += " AND hwr.repair_type='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="hwr.ac_id"){
				if(!clause.value){
					res += " AND hwr.ac_id is null ";
				}
				else{
					res += " AND hwr.ac_id='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="hwr.cause_type"){
				if(!clause.value){
					res += " AND hwr.cause_type is null ";
				}
				else{
					res += " AND hwr.cause_type='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="hwr.tr_id"){
				if(!clause.value){
					res += " AND hwr.tr_id is null ";
				}
				else{
					res += " AND hwr.tr_id='" + clause.value + "' ";				
				}
			}
			else if(clause.name=="hwr.work_team_id"){
				if(!clause.value){
					res += " AND hwr.work_team_id is null ";
				}
				else{
					res += " AND hwr.work_team_id='" + clause.value + "' ";				
				}
			}
		}
	}
    View.openDialog("ab-ondemand-report-requests-details.axvw", res);
}

function onCostCrossTableClick(obj){
    var year = document.getElementById("selectYear").value;
    var restriction = obj.restriction;
	if(year != ""){
		restriction.addClause("hwr_month.month", year+'%', "LIKE",null ,true);
	}
    View.openDialog("ab-ondemand-report-requests-cost.axvw", restriction);
}

function onCfCrossTableClick(obj){
    var restriction = obj.restriction;
	View.openDialog("ab-ondemand-report-wrcf-workload-report.axvw", restriction);
}

function onTrCrossTableClick(obj){
    var restriction = obj.restriction;
	View.openDialog("ab-ondemand-report-wrtr-workload-report.axvw", restriction);
}
