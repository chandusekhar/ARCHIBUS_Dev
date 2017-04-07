/**
 * @author Song
 */

var abRiskMsdsRptMsdsController = View.createController('abRiskMsdsRptMsdsController', {
	/**
	 * This event handler is called by the view after the view loading and
	 * initial data fetch for all panels is complete.
	 */
	afterInitialDataFetch : function() {
		this.abRiskMsdsDefMsdsTabs.addEventListener('afterTabChange', afterTabChange);
		
		this.hideTabs();
	},
	
	hideTabs: function(){
		this.abRiskMsdsDefMsdsTabs.selectTab("identification", null, false, false, false);

		//panel3 default inactive
		this.abRiskMsdsDefMsdsTabs.setAllTabsEnabled(false);
		//hidden default show form
		this.abRiskMsdsRptMsdsForm.show(false);
		//according email, those two panel should be hidden after page load.
		this.abRiskMsdsRptMsdsClassForm.show(false);
	},
	 /**
     * event handle when show button click.
     */
	abRiskMsdsDefMsdsConsole_onFilter: function(){
	   this.filterFirstChar();
       var inputRestriction = this.abRiskMsdsDefMsdsConsole.getFieldRestriction();
		var msdsDataRes = " 1=1 ";
		var msdsLocRes = "";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];

			if(clause.name.indexOf("msds_data")!=-1){
				msdsDataRes = msdsDataRes+this.getClauseStr(clause);
			} else if(clause.name.indexOf("msds_location")!=-1){
				msdsLocRes = msdsLocRes+this.getClauseStr(clause);
			}
		}
		if(inputRestriction.clauses.length>0 && msdsLocRes){
			this.abRiskMsdsDefMsdsGrid.refresh(msdsDataRes + " AND exists  (SELECT 1 from msds_location where msds_data.msds_id = msds_location.msds_id "+msdsLocRes+")");
		}else if(!msdsLocRes){
			this.abRiskMsdsDefMsdsGrid.refresh(msdsDataRes);
		} else{
			this.abRiskMsdsDefMsdsGrid.refresh("");		
		}
		
		this.hideTabs();
    },
    
	getClauseStr:function( clause){
			if(!valueExistsNotEmpty(clause.value)){
//			if (clause.value==''||clause.value==0) {
				return " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.op == "IN"){
					return " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
				}else{
					return " AND " + clause.name +" "+clause.op + " '" + string2SafeSqlString(clause.value) + "'";
				}
			}
	},
    /**
     * manual filter first character '#' String.
     */
    filterFirstChar: function(){
    	var ghs_id = this.abRiskMsdsDefMsdsConsole.getFieldValue('msds_data.ghs_id');
    	var chemical_name = this.abRiskMsdsDefMsdsConsole.getFieldValue('msds_data.chemical_name');
    	//below is handle contain e.g. "#test#test1" start with '#'.
		while(ghs_id.substring(0,Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length)==Ab.form.Form.MULTIPLE_VALUES_SEPARATOR){
			ghs_id=ghs_id.substring(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length);
		}
		while(chemical_name.substring(0,Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length)==Ab.form.Form.MULTIPLE_VALUES_SEPARATOR){
			chemical_name=chemical_name.substring(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length);
		}
		this.abRiskMsdsDefMsdsConsole.setFieldValue('msds_data.ghs_id',ghs_id);
		this.abRiskMsdsDefMsdsConsole.setFieldValue('msds_data.chemical_name',chemical_name);
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
    }
});

/**
 * Transform string into safe sql string
 */
function string2SafeSqlString(value){
	if (valueExistsNotEmpty(value)) {
		value = value.replace(/\'/g, "''");
	}
	return value
}

/**
 * event handler click one record link from top-grid panel.
 */
function selectBasicTab(){
	var tabs = abRiskMsdsRptMsdsController.abRiskMsdsDefMsdsTabs;

	tabs.setAllTabsEnabled(true);
	var selectedTabName = tabs.getSelectedTabName();
	commonRefreshPanel(selectedTabName);

	tabs.enableTab("document",true);
	tabs.enableTab("hazardClassification",true);
	tabs.enableTab("constituents",true);
	tabs.enableTab("physicalProperties",true);
	
	//according email, those two panel should be hidden after page load.
	abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsClassForm.show(false);
}
/**
 * called when click change tab
 * @param selectedTabName : selected Tab Name
 */
function afterTabChange(panel,selectedTabName){
	commonRefreshPanel(selectedTabName);
	
	//according email, those two panel should be hidden after page load.
	abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsClassForm.show(false);
}
/**
 * refresh related panel with parameter msds_id.
 * @param selectedTabName
 */
function commonRefreshPanel(selectedTabName){
	var abRiskMsdsDefMsdsGrid = abRiskMsdsRptMsdsController.abRiskMsdsDefMsdsGrid;
	var rowIndex = abRiskMsdsDefMsdsGrid.rows[abRiskMsdsDefMsdsGrid.selectedRowIndex];
	if(rowIndex){
		var msds_id = rowIndex["msds_data.msds_id"];
		var restriction = 'msds_id = '+msds_id; 
		switch (selectedTabName) {
		case 'identification':
			abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsForm.refresh(restriction);
			break;
		case 'document':
			abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsDocForm.refresh('msds_data.msds_id = '+msds_id);
			break;
		case 'hazardClassification':
			abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsClassGrid.refresh(restriction);
			abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsClassForm.refresh(restriction);
			break;
		case 'constituents':
			abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsConstGrid.refresh(restriction);
			break;
		case 'physicalProperties':
			abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsPhysicalForm.refresh(restriction);
			break;
		default:
			break;
		}
	}
}
/**
 * The showDocument command does the job.
 */
function showDocument() {

	abRiskMsdsRptMsdsController.abRiskMsdsDefMsdsTabs.selectTab("document", null, false, false, false);
	
	var form=abRiskMsdsRptMsdsController.abRiskMsdsRptMsdsDocForm;
	var keys = {"msds_id": form.getFieldValue("msds_data.msds_id")};//form.getPrimaryKey();//getDocSvcPrimaryKeyFieldValues();
	var tableName = "msds_data";
	var fieldName = "doc";
	var fileName = form.getFieldValue("msds_data.doc");
	DocumentService.show(keys, tableName, fieldName, fileName, '', true, 'showDocument', {
        callback: function(fileTransfer) {
            dwr.engine.openInDownload(fileTransfer);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}
