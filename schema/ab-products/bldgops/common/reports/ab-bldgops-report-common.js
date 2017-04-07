	function clearConsole(controller, consolePanel){
        consolePanel.clear();
		controller.dateStart='1900-12-15';
		controller.dateEnd='2200-12-15';
		controller.otherRes=' 1=1 ';
    }

   function setStartAndEndDateValue(controller, consolePanel, fieldName){
        var dateStart = consolePanel.getFieldValue(fieldName+".from");
        var dateEnd = consolePanel.getFieldValue(fieldName+".to");
        if (dateStart && dateEnd  && dateStart <= dateEnd) {
            controller.dateStart = dateStart;
            controller.dateEnd = dateEnd;
        }
        else if (!dateStart && !dateEnd ) {
                controller.dateStart = '1900-12-15';
                controller.dateEnd = '2200-12-15';
                
        }
        else if (!dateStart && dateEnd ) {
                    controller.dateStart = '1900-12-15';
                    controller.dateEnd = dateEnd;
                    
        }
        else if (dateStart && !dateEnd) {
                        controller.dateStart = dateStart;
                        controller.dateEnd = '2200-12-15';
       }
}

function getRestrictionStrFromConsole(console, fieldsArraysForRestriction){
    var otherRes = ' 1=1 ';
    for (var i = 0; i < fieldsArraysForRestriction.length; i++) {
        var field = fieldsArraysForRestriction[i];
        var consoleFieldValue = console.getFieldValue(field[0]);
        if (consoleFieldValue) {
            if (!isMultiSelect(consoleFieldValue)) {
                if (field[1] && field[1] == 'like') {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + " like '%" + consoleFieldValue + "%' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + " like '%" + consoleFieldValue + "%' ";
                    }
                }
                else {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + "='" + consoleFieldValue + "' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + "='" + consoleFieldValue + "' ";
                    }
                }
            }else{
				otherRes = otherRes + " AND " + getMultiSelectFieldRestriction(field, consoleFieldValue);
			}
        }
    }
    return otherRes;
}

function isMultiSelect(consoleFieldValue){
    return (consoleFieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0);
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
    var restriction = "";
    if (field[2]) {
        restriction =  field[2] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    else {
        restriction =  field[0] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    return restriction;
}

function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")"
    
    return resultedString;
}

function getRestrictionStrOfDateRange( consolePanel, fieldName){
		var restrictionStr = "";
        var dateStart = consolePanel.getFieldValue(fieldName+".from");
        var dateEnd = consolePanel.getFieldValue(fieldName+".to");
        if (dateStart) {
			restrictionStr += " AND " + fieldName + " >= ${sql.date('"+dateStart+"')} ";
        }
        if (dateEnd) {
			restrictionStr += " AND " + fieldName + " <= ${sql.date('"+dateEnd+"')} ";
        }
		return restrictionStr;
}

/**
 * Get restriction from fieldsArrays
 * @param {Object} fieldsArrays[field1['','',''],..]
 */
function getRestrictionFromGivenValue(fieldsArrays){
	var otherRes=' 1=1 ';
	for (var i = 0; i < fieldsArrays.length; i++) {
	var field = fieldsArrays[i];
	if( field[1] && field[1]=='like'){
		if( field[2] ){
			otherRes = otherRes + " AND "+ field[0] +" like '%"+ field[2]+"%' ";
			}
		}
		else{
			if( field[2] ){
				otherRes = otherRes + " AND "+ field[0] +"='"+ field[2]+"' ";
			}
		}	
	}
	return otherRes;
}

function getRestrictionStrOfCurrentYearDateRange(fieldName){
		var curDate = new Date();
		var day = curDate.getDate();
		var month = curDate.getMonth() + 1;
		var year = curDate.getFullYear();
		var dateStart =year+ "-01-01" ;
		var dateEnd = year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;;

		var restrictionStr = "";
		restrictionStr += " AND " + fieldName + " >= ${sql.date('"+dateStart+"')} ";
		restrictionStr += " AND " + fieldName + " <= ${sql.date('"+dateEnd+"')} ";
		return restrictionStr;
}

function setCurrentYearToConsoleField(consolePanel, fieldName){
		var curDate = new Date();
		var year = curDate.getFullYear();
		var dateStart =year+ "-01-01" ;
		var dateEnd = year + "-12-31";
        consolePanel.setFieldValue(fieldName+".from", dateStart);
        consolePanel.setFieldValue(fieldName+".to", dateEnd);
		return ;
}


function showDetailsFromCalendarClick(primaryKey, detailPanel){
		var restriction = {
			'wr.wr_id': primaryKey
		};
		detailPanel.show(true);
		detailPanel.refresh(restriction);
		detailPanel.showInWindow({
			width: 600,
			height: 400
		});
    }

function onOpenWrCrossTableClick(obj, parentController, detailGrid, firstField, secondField ){
    var restriction =parentController.otherRes;

	if (obj.restriction.clauses.length > 0) {
		if(obj.restriction.clauses[1]){
			if(obj.restriction.clauses[0].value){
				restriction += " AND "+firstField+"='"+ obj.restriction.clauses[0].value + "'"; 
			}
			else{
				restriction += " AND "+ firstField+ " is null "; 
			}
			if(obj.restriction.clauses[1].value){
				restriction += " AND "+secondField+"='"+ obj.restriction.clauses[1].value + "'"; 
			}
		}
		else if (obj.restriction.clauses[0].name==firstField){
			if(obj.restriction.clauses[0].value){
				restriction += " AND "+ firstField +"='"+ obj.restriction.clauses[0].value + "'"; 
			}
			else{
				restriction += " AND "+ firstField + " is null "; 
			}
		}
		else if (obj.restriction.clauses[0].name==secondField){
			restriction += " AND " + secondField + "='"+ obj.restriction.clauses[0].value + "'"; 
		}
    }
    detailGrid.refresh(restriction);
    detailGrid.showInWindow({
        width: 800,
        height: 600
    });
}


function onAvailabilityCrossTableClick(obj, parentController, detailGrid, firstField, secondField, isShowChart){
    var restriction = parentController.otherRes;
    if (obj.restriction.clauses.length > 0) {
		if(obj.restriction.clauses[1]){
		    restriction = restriction + " AND " + firstField + " ='" +  obj.restriction.clauses[0].value + "' ";
		    restriction = restriction + " AND " + secondField + " =${sql.date('" +  obj.restriction.clauses[1].value.substring(0,10) + "')} ";
		}
		else if (obj.restriction.clauses[0].name==secondField){
			if(isShowChart){
				parentController.showChart(obj.restriction.clauses[0].value);
				return;
			}
			else{
				restriction += " AND " + secondField + "=${sql.date('"+ obj.restriction.clauses[0].value.substring(0,10) + "')} "; 
			}
		}
		else if (obj.restriction.clauses[0].name==firstField){
		    restriction = restriction + " AND " + firstField + " ='" +  obj.restriction.clauses[0].value + "' ";
		}
    }
    detailGrid.refresh(restriction);
    detailGrid.showInWindow({
        width: 800,
        height: 600
    });
}
/**
 * Select building code by site_id of console
 * @param {Object} consoleName
 * @param {Object} tableName
 * @param {Object} consoleFieldName
 * @param {Object} dialogTitle
 */
function selectBuidingCode(consoleName,tableName,consoleFieldName,dialogTitle){
    var siteCode = View.panels.get(consoleName).getFieldValue(consoleFieldName);
    var restriction = null;
    if (siteCode) {
        restriction = new Ab.view.Restriction();
        restriction.addClause("bl.site_id", siteCode + "%", "LIKE");
    }
    View.selectValue(consoleName, getMessage(dialogTitle), [""+tableName+".bl_id"], "bl", ["bl.bl_id"], ["bl.bl_id", "bl.name", "bl.site_id"], restriction);
}

/**
 * open dialog by you click column
 * @param {Object} obj decide which column you click
 * @param {Object} panel1 open panel1
 * @param {Object} panel2 open panel2
 */
function openDialogBudgetAndPlan(obj, panel1, panel2) {
    var panel = '';
    if (obj == 'Plan') {
        panel = panel1;
    }
    else 
        if (obj == 'Budget'||'Actual') {
            panel = panel2;
        }else{
			return;
		}
    panel.refresh();
    panel.show(true);
    panel.showInWindow({
        width: 600,
        height: 400
    });
}

/**
 * Show or hide button
 * @param {Object} panelObject  which contain the button
 * @param {Object} button array show or hide buttons
 * @param {Object} show boolean
 * @param {Object} hide boolean
 */
function hideOrShowActionButton(panelObject,button,show,hide){
	for (var i = 0; i < button.length; i++) {
		if (View.getOpenerView().type == 'dashboard') {
			panelObject.actions.get(button[i]).show(show);
		}
		else {
			panelObject.actions.get(button[i]).show(hide);
		}
	}
}

/**Set list default value for console after clear action
 * @param {Object} controller
 * @param {Object} keyArray  list field id array
 * @param {Object} valueArray1  list field value to id ,view is called from pnva
 * @param {Object} valueArray2  list field value to id ,view is called from dashboard
 */
function setDefaultValueForHtmlField(keyArray,valueArray){
	for(var i=0;i<keyArray.length;i++){
			$(keyArray[i]).value = valueArray[i];
	}
}
/**
 * Get restriction and refresh panel
 * @param {Object} reCallPramObject   the param that can return list value to parent controller
 * @param {Object} selectYearId  year list id
 * @param {Object} reFreshedPanel  need refresh panel
 */
function getRestrictinOfYearListAndRefreshPanel(reCallPramObject,selectYearId,reFreshedPanel){
	;
	var reFreshedPanel=View.panels.get(reFreshedPanel);
	var restriction = "0=0";
		View.controllers.items[0].yearValue=document.getElementById(selectYearId).value;
		reCallPramObject = document.getElementById(selectYearId).value;
		if(reCallPramObject != ""){
		restriction +=  " AND hwr_month.month  LIKE \'" + reCallPramObject + "%\'";
		}
		reFreshedPanel.refresh(restriction);
}
/**
 * Show chart in dialog for file='ab-ondemand-report-tabs.axvw'
 */
function showArchievedWrChart(){
    View.openDialog('ab-ondemand-report-tabs-chart.axvw');
}

/**
 * Show year select drop-down list in given html element
 */
 function  populateYearSelectLists(recs, year_select) {
        year_select.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }

        var systemDate = new Date();
        var x = systemDate.getYear();
        var currentYear = x % 100;
        currentYear += (currentYear < 38) ? 2000 : 1900;

		var optionIndexCurrentYear = -1;
        if (year_select.options) {
			for (var oNum = 0; oNum != year_select.options.length; oNum++) {
				if (year_select.options[oNum].value == currentYear) 
					optionIndexCurrentYear = oNum;
			}
		}

		year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        year_select.value = currentYear;
 }

function getDashMainController(mainName){
	
	var dashBoardMainController = null;
	
	if(valueExists(View.controllers.get(mainName))){
		dashBoardMainController = View.controllers.get(mainName);
	}else if(valueExists(View.getOpenerView()) && valueExists(View.getOpenerView().controllers.get(mainName))){
		dashBoardMainController = View.getOpenerView().controllers.get(mainName);
	}else if(valueExists(View.getOpenerView()) && valueExists(View.getOpenerView().getOpenerView()) && valueExists(View.getOpenerView().getOpenerView().controllers.get(mainName))){
		dashBoardMainController = View.getOpenerView().getOpenerView().controllers.get(mainName);
	}
	
	return dashBoardMainController;
}

function onCostCrossTableClick(obj, otherRes){
	var res= " wrhwr.status IN ('Com','Clo')  ";

    var restriction = obj.restriction;
	if(obj.restriction && obj.restriction.clauses){
		for(var i=0; i<obj.restriction.clauses.length;i++){
			var clause = obj.restriction.clauses[i];
			if(clause.name=="wrhwr.month"){
				res += " AND ${sql.yearMonthOf('wrhwr.date_completed')}='" + clause.value + "' ";
			}
			else if(clause.name=="wrhwr.sitebl"){
				if(!clause.value){
					res += " AND wrhwr.site_id is null AND wrhwr.bl_id is null ";
				}
				else{
					res += " AND RTRIM(wrhwr.site_id)${sql.concat}'-'${sql.concat}RTRIM(wrhwr.bl_id) ='" + clause.value + "' ";				
				}				
			}
			else if(clause.name=="wrhwr.dvdp"){
				if(!clause.value){
					res += " AND wrhwr.dv_id is null AND wrhwr.dp_id is null ";
				}
				else{
					res += " AND RTRIM(wrhwr.dv_id)${sql.concat}'-'${sql.concat}RTRIM(wrhwr.dp_id) ='" + clause.value + "' ";
				}				
			}
			else if(clause.name=="wrhwr.eq_std"){
				 if(clause.value){
					res += " AND wr.eq_std='" + clause.value + "' ";	
				 }
				 else{
					res+= " AND wr.eq_std is null ";				
				 }
			}
			else if(clause.value){
				res+= " AND " +clause.name+"='"+ clause.value+"' ";
			}
			else {
				res+= " AND " +clause.name+" is null ";				
			}
		}
	}
	if(otherRes){
		res +=  " AND "+otherRes;
	}
    View.openDialog("ab-ondemand-report-cost-details.axvw", res.replace(/wrhwr./g, "wr."));
}

/**
 * append work type restriction to res according the given work type and table name
 * @param {string} res  the given restriction
 * @param {string} workType  the given work type
 * @param {string} table  the given table name
 */
function appendWorkTypeRestriction(res, workType, table){
    var workTypeRes = "wr.prob_type IS NOT NULL";
    
    if (workType == 'OD') {
        workTypeRes = "wr.prob_type !='PREVENTIVE MAINT'";
    }
    
    if (workType == 'PM') {
        workTypeRes = "wr.prob_type ='PREVENTIVE MAINT'";
    }
    return res + " AND " + workTypeRes.replace(/wr/g, table);
}


function getLastDayOfMonth(year, month){
		var d = new Date(year, month,1);
		return (new Date(d.getTime()-24*60*60*1000).getDate());
}

////KB3032267 - hide 'Create Service Request' button if no AbBldgOpsHelpDesk license
function hideCreateServiceRequestButtonIfNoLicense(panel){
	
	panel.actions.get('createServiceRequest').show(false);
	
	//get all license
	AdminService.getProgramLicense({
		callback: function(license) {
			var licenseIds = [];
			var licenses = license.licenses;
			
			//check AbBldgOpsHelpDesk license
			for(i in licenses){
				licenseIds.push(licenses[i].id);
				if(licenses[i].enabled && licenses[i].id == 'AbBldgOpsHelpDesk'){
					//show action if contain AbBldgOpsHelpDesk license
					panel.actions.get('createServiceRequest').show(true);
					break;
				}
			}
		},				
		errorHandler: function(m, e) {
			View.showException(e);
		}
	});
}

function changeWrToWrhwrInClickObject(obj) {
	if (obj.restriction && obj.restriction.clauses) {
		for ( var i = 0; i < obj.restriction.clauses.length; i++) {
			var clause = obj.restriction.clauses[i];
			if(clause.name.indexOf('wr.')==0){
				clause.name = clause.name.replace('wr.','wrhwr.');
			}
		}
	}
}
