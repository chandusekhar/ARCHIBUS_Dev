/**
 * Controller for old msds data review functionality
 * @author QIANG
 */
var oldMSDSReviewController = View.createController('oldMSDSReviewController', {
	
	/**
	 *Register the event 'afterTabChange' when the status of data fetch is complete.
	 */
	afterInitialDataFetch : function() {
		this.abRiskMsdsDefMsdsOldTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
		this.hideTabs();
	},
	
	hideTabs: function(){
		this.abRiskMsdsDefMsdsOldTabs.selectTab("oldIdentification", null, false, false, false);

		//panel3 default inactive
		this.abRiskMsdsDefMsdsOldTabs.setAllTabsEnabled(false);
		//hidden default show form
		this.abRiskMsdsOldRptMsdsForm.show(false);
		//according email, those two panel should be hidden after page load.
		this.abRiskMsdsOldRptMsdsClassForm.show(false);
	},
	
	abRiskMsdsDefOldMsdsConsole_onFilter: function(){
		this.filterFirstChar();
		var inputRestriction = this.abRiskMsdsDefOldMsdsConsole.getFieldRestriction();
		var msdsDataRes = " 1=1 ";
		var msdsLocRes = "";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];
			if(clause.name.indexOf("msds_h_data")!=-1){
				msdsDataRes = msdsDataRes+this.getClauseStr(clause);
			} else if(clause.name.indexOf("msds_location")!=-1){
				msdsLocRes = msdsLocRes+this.getClauseStr(clause);
			}
		}
		if(inputRestriction.clauses.length>0 && msdsLocRes){
			this.abRiskMsdsDefOldMsdsGrid.refresh(msdsDataRes + " AND exists  (SELECT 1 from msds_location where msds_h_data.msds_id = msds_location.msds_id "+msdsLocRes+")");
		}else if(!msdsLocRes){
			this.abRiskMsdsDefOldMsdsGrid.refresh(msdsDataRes);
		} else{
			this.abRiskMsdsDefOldMsdsGrid.refresh("");		
		}
		this.hideTabs();
	},
	
	/**
     * manual filter first character '#' String.
     */
    filterFirstChar: function(){
    	var ghs_id = this.abRiskMsdsDefOldMsdsConsole.getFieldValue('msds_h_data.ghs_id');
    	var chemical_name = this.abRiskMsdsDefOldMsdsConsole.getFieldValue('msds_h_data.chemical_name');
    	
		while(ghs_id.substring(0,Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length)==Ab.form.Form.MULTIPLE_VALUES_SEPARATOR){
			ghs_id=ghs_id.substring(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length);
		}
		while(chemical_name.substring(0,Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length)==Ab.form.Form.MULTIPLE_VALUES_SEPARATOR){
			chemical_name=chemical_name.substring(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length);
		}
		this.abRiskMsdsDefOldMsdsConsole.setFieldValue('msds_h_data.ghs_id',ghs_id);
		this.abRiskMsdsDefOldMsdsConsole.setFieldValue('msds_h_data.chemical_name',chemical_name);
    },
    
    
    selectBasicTab: function(){
    	var tabs = this.abRiskMsdsDefMsdsOldTabs;

    	tabs.setAllTabsEnabled(true);
    	var selectedTabName = tabs.getSelectedTabName();
    	this.refreshTabsPanel(selectedTabName);

    	tabs.enableTab("oldDocument",true);
    	tabs.enableTab("oldHazardClassification",true);
    	tabs.enableTab("oldConstituents",true);
    	tabs.enableTab("oldPhysicalProperties",true);
    	
    	//according email, those two panel should be hidden after page load.
    	this.abRiskMsdsOldRptMsdsClassForm.show(false);
    },
    
    refreshTabsPanel: function(selectedTabName){
    	var grid = this.abRiskMsdsDefOldMsdsGrid;
    	var rowIndex = grid.rows[grid.selectedRowIndex];
    	if(rowIndex){
    		var msds_id = rowIndex["msds_h_data.msds_id"];
    		var restriction = 'msds_id = '+msds_id; 
    		switch (selectedTabName) {
    		case 'oldIdentification':
    			this.abRiskMsdsOldRptMsdsForm.refresh(restriction);
    			break;
    		case 'oldDocument':
    			this.abRiskMsdsOldRptMsdsDocForm.refresh('msds_h_data.msds_id = '+msds_id);
    			break;
    		case 'oldHazardClassification':
    			this.abRiskMsdsOldRptMsdsClassGrid.refresh(restriction);
    			this.abRiskMsdsOldRptMsdsClassForm.refresh(restriction);
    			break;
    		case 'oldConstituents':
    			this.abRiskMsdsOldRptMsdsConstGrid.refresh(restriction);
    			break;
    		case 'oldPhysicalProperties':
    			this.abRiskMsdsOldRptMsdsPhysicalForm.refresh(restriction);
    			break;
    		default:
    			break;
    		}
    	}
    },
    
    showDocument: function() {
    	this.abRiskMsdsDefMsdsOldTabs.selectTab("oldDocument", null, false, false, false);
    	
    	var form = this.abRiskMsdsOldRptMsdsDocForm;
    	var keys = {"msds_id": form.getFieldValue("msds_data.msds_id")};
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
    },
    
    afterTabChange: function(panel,selectedTabName) {
    	this.refreshTabsPanel(selectedTabName);
    	
    	//according email, those two panel should be hidden after page load.
    	this.abRiskMsdsOldRptMsdsClassForm.show(false);
    }
});