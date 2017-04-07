/**
 * @author Song
 */

var abMsdsRptPrintController = View.createController('abMsdsRptPrintController', {
	printableRestriction: [],
	separatorRegExp: null,
	/**
	 * This event handler is called by the view after the view loading 
	 */
	afterInitialDataFetch : function() {					
			var controller = this;
			controller.abRiskMsdsDefMsdsGrid.actions.get('print').show(false);
			this.abRiskMsdsDefMsdsGrid.addEventListener('onMultipleSelectionChange', function(row, grid){				
				if(controller.abRiskMsdsDefMsdsGrid.getSelectedRecords() != ''){
					controller.abRiskMsdsDefMsdsGrid.actions.get('print').show(true);
				} else {
					controller.abRiskMsdsDefMsdsGrid.actions.get('print').show(false);
				}
			});
	},
	/**
	 * Event handler to hide the print action button when the grid refreshes (e.g., due to user clicking a sort button
	 * in the mini-console).  The refresh clears users' selections from the grid, and the action should not be available
	 * without at least one user selection.
	 */
	abRiskMsdsDefMsdsGrid_afterRefresh: function(){
		var controller = this;
		controller.abRiskMsdsDefMsdsGrid.actions.get('print').show(false);
	},
    /**
     * private method
     * change array to String[key=value]
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+string2SafeSqlString(array[i])+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    },
	/**
	 * when show button click
	 */
	abRiskMsdsDefMsdsConsole_onShow: function(){
		var restriction = " 1=1 ";
		
		var MULTIPLE_VALUE_SEPARATOR = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
		var specialChars = /[\^\'\"\\]/;
		if(specialChars.test(MULTIPLE_VALUE_SEPARATOR)) {
			MULTIPLE_VALUE_SEPARATOR = "\\" + MULTIPLE_VALUE_SEPARATOR;
		}
		this.separatorRegExp = new RegExp(MULTIPLE_VALUE_SEPARATOR, "g");
		
        var inputRestriction = this.abRiskMsdsDefMsdsConsole.getFieldRestriction();
        this.printableRestriction = this.obtainPrintableRestriction(inputRestriction);
		var restPart = "";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];
			if(clause.name=='provider_id' || clause.name=='msds_chemical.tier2'  || clause.name=='msds_haz_classification.hazard_system_id' 
				|| clause.name=='msds_haz_classification.hazard_category_id' || clause.name=='msds_haz_classification.hazard_class_id'){
				continue;
			}
			if(!valueExistsNotEmpty(clause.value)){
				restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.op == "IN"){
					restPart = restPart + " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
				}else{
					restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + string2SafeSqlString(clause.value) + "'";
				}
			}
		}

		var proId=string2SafeSqlString(this.abRiskMsdsDefMsdsConsole.getFieldValue('provider_id'));
		if(proId){
			restPart=restPart+" and (msds_data.distributor_id='"+proId+"' or  msds_data.manufacturer_id='"+proId+"' or  msds_data.preparer_id='"+proId+"')";
		}
		var tie2=string2SafeSqlString(this.abRiskMsdsDefMsdsConsole.getFieldValue('msds_chemical.tier2'));
		if(tie2){
			restPart=restPart+" and exists (select 1 from msds_constituent left outer join msds_chemical on msds_chemical.chemical_id=msds_constituent.chemical_id where msds_constituent.msds_id=msds_data.msds_id and msds_chemical.tier2='"+tie2+"')";
		}
		var i=0;
		var clasSys=string2SafeSqlString(this.abRiskMsdsDefMsdsConsole.getFieldValue('msds_haz_classification.hazard_system_id'));
		if(clasSys){
			restPart=restPart+" and (1=0";
			var clasSysParts=clasSys.split("^");
			for(i=0;i<clasSysParts.length;i++){
				restPart=restPart+" or exists (select 1 from msds_haz_classification where msds_haz_classification.msds_id=msds_data.msds_id and msds_haz_classification.hazard_system_id='"+clasSysParts[i]+"')";
			}
			restPart=restPart+")";
		}
		var clasClas=string2SafeSqlString(this.abRiskMsdsDefMsdsConsole.getFieldValue('msds_haz_classification.hazard_class_id'));
		if(clasClas){
			restPart=restPart+" and (1=0";
			var clasClasParts=clasClas.split("^");
			for(i=0;i<clasClasParts.length;i++){
				restPart=restPart+" or exists (select 1 from msds_haz_classification where msds_haz_classification.msds_id=msds_data.msds_id and msds_haz_classification.hazard_class_id='"+clasClasParts[i]+"')";
			}
			restPart=restPart+")";			
		}
		var clasCat=string2SafeSqlString(this.abRiskMsdsDefMsdsConsole.getFieldValue('msds_haz_classification.hazard_category_id'));
		if(clasCat){
			restPart=restPart+" and (1=0";
			var clasCatParts=clasCat.split("^");
			for(i=0;i<clasCatParts.length;i++){
				restPart=restPart+" or exists (select 1 from msds_haz_classification where msds_haz_classification.msds_id=msds_data.msds_id and msds_haz_classification.hazard_category_id='"+clasCatParts[i]+"')";
			}
			restPart=restPart+")";			
		}		
		if(restPart){
			restriction = restriction+restPart
		}
		this.abRiskMsdsDefMsdsGrid.refresh(restriction);
	},
	
	obtainPrintableRestriction: function(restriction){
		var console = this.abRiskMsdsDefMsdsConsole;
		var printableRestriction = [];
		for (var i = 0; i < restriction.clauses.length; i++) {
			var clause = restriction.clauses[i];
			printableRestriction.push({'title': getTitleOfConsoleField(console, clause.name), 'value': console.getFieldValue(clause.name).replace(this.separatorRegExp, ", ")});
		}
		return printableRestriction;
	},

    abRiskMsdsDefMsdsGrid_onPrint: function(){
		var result = {};
		// open print work orders paginated report--not consolidated,file='PreventiveMaintenanceCommonHandler.java'
		try {
			result = Workflow.callMethod('AbRiskMSDS-MsdsCommon-printMsdsDocuments', this.abRiskMsdsDefMsdsGrid.getSelectedRecords(), this.printableRestriction);
		} catch (e) {
			Workflow.handleError(e);
		}
		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			result.data = eval('(' + result.jsonExpression + ')');
			var jobId = result.data.jobId;
			var url = 'ab-msds-rpt-print-report.axvw?jobId=' + jobId;
			View.openDialog(url);
		}
    }
});

function getTitleOfConsoleField(console, fieldName){
	var title = "";
	
	console.fields.each(function(field){
		if(field.fieldDef.id == fieldName)
			title = field.fieldDef.title;
	});
	
	return title;
}


/**
 * Transform string into safe sql string
 */
function string2SafeSqlString(value){
	if (valueExistsNotEmpty(value)) {
		value = value.replace(/\'/g, "''");
	}
	return value
}
