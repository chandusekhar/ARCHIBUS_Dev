/**
 * @author Song
 */

var abRiskMsdsDefMsdsController = View.createController('abRiskMsdsDefMsdsController', {
	/**
	 * determine if addNew button pressed.
	 */
	addNewActive: false,
	/**
	 * This event handler is called by the view after the view loading and
	 * initial data fetch for all panels is complete.
	 */
	afterInitialDataFetch : function() {
		this.abRiskMsdsDefMsdsTabs.addEventListener('afterTabChange', afterTabChange);
		this.abRiskMsdsDefMsdsTabs.selectTab("identification", null, false, false, false);

		this.panelForReprot();
		//panel3 default inactive
		this.abRiskMsdsDefMsdsTabs.setAllTabsEnabled(false);
		//hidden default show form
		this.abRiskMsdsDefMsdsForm.show(false);
		//according email, those two panel should be hidden after page load.
		this.abRiskMsdsDefMsdsClassForm.show(false);
		this.abRiskMsdsDefMsdsConstForm.show(false);
	},
	/**
	 * handle when delete button click
	 */
	afterDelete: function(){
		this.abRiskMsdsDefMsdsForm.show(false);
		//panel3 default inactive
		this.abRiskMsdsDefMsdsTabs.setAllTabsEnabled(false);
	},
	/**
	 * private method
	 * change all the fields to readOnly and remove all the button.
	 */
	panelForReprot: function(){
	  if(!this.abRiskMsdsDefMsdsGrid.actions.get("addNew")){
		  setPanelsReadOnly(this);
	  }
	},
	/**
	 * when add new button click, select form tab.
	 */
	abRiskMsdsDefMsdsGrid_onAddNew: function(){
		var tabs = this.abRiskMsdsDefMsdsTabs;
		tabs.setAllTabsEnabled(true);
		var tab = tabs.selectTab("identification", null, false, false, false);

		tabs.enableTab("document",false);
		tabs.enableTab("hazardClassification",false);
		tabs.enableTab("constituents",false);
		tabs.enableTab("physicalProperties",false);
		this.addNewActive = true;
		
		var form=this.abRiskMsdsDefMsdsForm;
		form.newRecord=true;
		form.clear();
		form.show(true);
		
		var grid = this.abRiskMsdsDefMsdsGrid;
		//unselected All
    	grid.selectRow(grid.rows.length+1);
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

			if(clause.name.indexOf("msds_data")!=-1 && clause.name != "msds_data.date_replaced"){
				msdsDataRes = msdsDataRes+this.getClauseStr(clause);
			} else if(clause.name.indexOf("msds_location")!=-1){
				msdsLocRes = msdsLocRes+this.getClauseStr(clause);
			}
		}
		
		var dsObj = this.abRiskMsdsDefMsdsConsole.getDataSource();
		var dateReplaced = dsObj.formatValue("msds_data.date_replaced", this.abRiskMsdsDefMsdsConsole.getFieldValue("date_replaced"), false);
		var dateArchived = dsObj.formatValue("msds_data.date_replaced", this.abRiskMsdsDefMsdsConsole.getFieldValue("date_archived"), false);
		if (valueExistsNotEmpty(dateReplaced)) {
			msdsDataRes = msdsDataRes + " AND (msds_data.date_replaced <= '" + dateReplaced + "' OR msds_data.date_replaced IS NULL) ";
		}
		if (valueExistsNotEmpty(dateArchived)) {
			msdsDataRes = msdsDataRes + " AND EXISTS(SELECT msds_h_data.msds_id FROM msds_h_data WHERE msds_h_data.msds_id = msds_data.msds_id " +
					"AND msds_h_data.date_archived = (SELECT MAX(h_int.date_archived) FROM msds_h_data ${sql.as} h_int WHERE h_int.msds_id = msds_h_data.msds_id)  " +
					"AND msds_h_data.date_archived <= '" + dateArchived + "' )";
		}
			
		if(inputRestriction.clauses.length>0 && msdsLocRes){
			this.abRiskMsdsDefMsdsGrid.refresh(msdsDataRes + " AND exists  (SELECT 1 from msds_location where msds_data.msds_id = msds_location.msds_id "+msdsLocRes+")");
		}else if(!msdsLocRes){
			this.abRiskMsdsDefMsdsGrid.refresh(msdsDataRes);
		} else{
			this.abRiskMsdsDefMsdsGrid.refresh("");		
		}
		
    },
    
  abRiskMsdsDefMsdsForm_beforeSave: function(){
  	this.checkDateValues('msds_data.date_supersedes', 'msds_data.date_issued', 'error_date_issued_before_date_superseded', '>=');
  	this.checkDateValues('msds_data.date_issued', 'msds_data.date_replaced', 'error_date_replaced_before_date_issued', '>');
	},

  checkDateValues: function(minField, maxField, message, operation){
			var minValue = this.abRiskMsdsDefMsdsForm.getFieldValue(minField);
			var maxValue = this.abRiskMsdsDefMsdsForm.getFieldValue(maxField);
			var warningMsg = getMessage(message);

			if(operation == '>'){
				if(minValue && maxValue && minValue > maxValue){				
					this.abRiskMsdsDefMsdsForm.fields.get(maxField).setInvalid(warningMsg);				
				}	
			} else if (operation == '>='){
				if(minValue && maxValue && minValue >= maxValue){				
					this.abRiskMsdsDefMsdsForm.fields.get(maxField).setInvalid(warningMsg);				
				}	
			}							
	},	 

	getClauseStr:function( clause){
			if(!valueExistsNotEmpty(clause.value)){
//			if (clause.value==''||clause.value==0) {
				return " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.op == "IN"){
					return " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
				}else{
					return " AND " + clause.name +" "+clause.op + " '" + convert2SafeSqlString(clause.value) + "'";
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
     *  first basic tab save button click.
     */
    basicTabSave: function(){
//    	this.addNewActive = false;

    	var tabs = this.abRiskMsdsDefMsdsTabs;
    	tabs.enableTab("document",true);
    	tabs.enableTab("hazardClassification",true);
		tabs.enableTab("constituents",true);
		tabs.enableTab("physicalProperties",true);
    	var msds_id = this.abRiskMsdsDefMsdsForm.getFieldValue('msds_data.msds_id');
    	this.abRiskMsdsDefMsdsDocForm.setFieldValue('msds_data.msds_id',msds_id);
    	this.abRiskMsdsDefMsdsForm.setFieldValue('msds_data.msds_id',msds_id);
    	this.selectNewAddedRecord(msds_id);
    	abRiskMsdsDefMsdsController.addNewActive = false;
    },
    docTabSave: function(){
    	var msds_id = this.abRiskMsdsDefMsdsDocForm.getFieldValue('msds_data.msds_id');
    	this.selectNewAddedRecord(msds_id);
    },
    propTabSave: function(){
    	var msds_id = this.abRiskMsdsDefMsdsForm.getFieldValue('msds_data.msds_id');
    	this.selectNewAddedRecord(msds_id);
    },
    /**
     * search current saved record in grid and select it.
     */
    selectNewAddedRecord: function(msds_id){
    	var grid = this.abRiskMsdsDefMsdsGrid;
        for (var j = 0; j < grid.rows.length; j++) {
            var row = grid.rows[j];
            if(msds_id == row['msds_data.msds_id']){
            	grid.selectRow(row.index);
            	break;
            }
        }
    },
    /**
     * private method
     * change array to String[key=value]
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+convert2SafeSqlString(array[i])+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    },
    
    abRiskMsdsDefMsdsForm_onSelectManufacturer: function(){
    	var controller = this;
    	View.openDialog('ab-msds-select-add-company.axvw', null, false, {
    		callback: function(record) {
    			var value = record.getValue('company.company');
    			controller.abRiskMsdsDefMsdsForm.setFieldValue('msds_data.manufacturer_id', value);
    		}
    	});
    },
    
    abRiskMsdsDefMsdsForm_onSelectDistributor: function(){
    	var controller = this;
    	View.openDialog('ab-msds-select-add-company.axvw', null, false, {
    		callback: function(record) {
    			var value = record.getValue('company.company');
    			controller.abRiskMsdsDefMsdsForm.setFieldValue('msds_data.distributor_id', value);
    		}
    	});
    },
    
    abRiskMsdsDefMsdsForm_onSelectPreparer: function(){
    	var controller = this;
    	View.openDialog('ab-msds-select-add-company.axvw', null, false, {
    		callback: function(record) {
    			var value = record.getValue('company.company');
    			controller.abRiskMsdsDefMsdsForm.setFieldValue('msds_data.preparer_id', value);
    		}
    	});
    }       
});
/**
 * event handler click one record link from top-grid panel.
 */
function selectBasicTab(){

	abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsTabs.setAllTabsEnabled(true);
	var selectedTabName = abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsTabs.getSelectedTabName();
	commonRefreshPanel(selectedTabName);
	abRiskMsdsDefMsdsController.panelForReprot();
	
	//visible/active in the form only if pct_operator is 'R' for 'range' as in a range spanning from pct_high to pct_low
	abRiskMsdsDefPropController.fieldsControl();
	

	var tabs = abRiskMsdsDefPropController.abRiskMsdsDefMsdsTabs;
	tabs.enableTab("document",true);
	tabs.enableTab("hazardClassification",true);
	tabs.enableTab("constituents",true);
	tabs.enableTab("physicalProperties",true);
	
	abRiskMsdsDefMsdsController.addNewActive = false;

	//according email, those two panel should be hidden after page load.
	abRiskMsdsDefPropController.abRiskMsdsDefMsdsClassForm.show(false);
	abRiskMsdsDefPropController.abRiskMsdsDefMsdsConstForm.show(false);	
}
/**
 * called when click change tab
 * @param selectedTabName : selected Tab Name
 */
function afterTabChange(panel,selectedTabName){
	commonRefreshPanel(selectedTabName);
	abRiskMsdsDefMsdsController.panelForReprot();
	
	//visible/active in the form only if pct_operator is 'R' for 'range' as in a range spanning from pct_high to pct_low
	abRiskMsdsDefPropController.fieldsControl();
	if(abRiskMsdsDefMsdsController.addNewActive){
		var form=abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsForm;
		form.newRecord=true;
		form.clear();
		form.show(true);
	}else{
		//according email, those two panel should be hidden after page load.
		abRiskMsdsDefPropController.abRiskMsdsDefMsdsClassForm.show(false);
		abRiskMsdsDefPropController.abRiskMsdsDefMsdsConstForm.show(false);	
	}
}
/**
 * refresh related panel with parameter msds_id.
 * @param selectedTabName
 */
function commonRefreshPanel(selectedTabName){
	var abRiskMsdsDefMsdsGrid = abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsGrid;
	var rowIndex = abRiskMsdsDefMsdsGrid.rows[abRiskMsdsDefMsdsGrid.selectedRowIndex];
	if(rowIndex){
		var msds_id = rowIndex["msds_data.msds_id"];
		var restriction = 'msds_id = '+msds_id; 
		switch (selectedTabName) {
		case 'identification':
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsForm.newRecord=false;
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsForm.refresh(restriction);
			break;
		case 'document':
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsDocForm.refresh('msds_data.msds_id = '+msds_id);
//			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsDocForm.actions.get('save').show(true);
			break;
		case 'hazardClassification':
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsClassGrid.refresh(restriction);
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsClassForm.refresh(restriction);
			defClassController.abRiskMsdsDefMsdsClassGridOnAddNew(abRiskMsdsDefMsdsGrid.selectedRowIndex);
			break;
		case 'constituents':
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsConstGrid.refresh(restriction);
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsConstForm.refresh(restriction);
			abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstGridOnAddNew(abRiskMsdsDefMsdsGrid.selectedRowIndex);
			break;
		case 'physicalProperties':
			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsPhysicalForm.refresh(restriction);
//			abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsPhysicalForm.actions.get('save').show(true);
			break;
		default:
			break;
		}
	}else{//is add new
		abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsClassGrid.show(false);
		abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsConstGrid.show(false);
		abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstGridOnAddNew();
		defClassController.abRiskMsdsDefMsdsClassGridOnAddNew();
	}
}
/**
 * The showDocument command does the job.
 */
function showDocument() {

	abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsTabs.selectTab("document", null, false, false, false);
	
	var form=abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsDocForm;
	var keys = form.getDocSvcPrimaryKeyFieldValues();
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
