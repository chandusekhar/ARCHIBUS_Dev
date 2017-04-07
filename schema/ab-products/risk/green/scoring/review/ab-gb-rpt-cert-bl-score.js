/**
 * @author Guo
 */
var abGbRptCertBlScoreController = View.createController('abGbRptCertBlScoreController', {
	
    // ----------------------- event handlers -------------------------
    
    afterViewLoad: function(){
        // insert the group block rows
        this.abGbRptCertBlScoreCreditGrid.afterCreateDataRows = function(parentElement, columns){
            insertGroupByRows();
        }
    },
    
    abGbRptCertBlScoreCreditGrid_afterRefresh: function(){
        //remove the sorting to aviod error after insert group block rows
        if (this.abGbRptCertBlScoreCreditGrid.headerRows.length > 0) {
            this.abGbRptCertBlScoreCreditGrid.removeSorting();
            replaceType(this.abGbRptCertBlScoreCreditGrid);
        }
    },
	
	 abGbRptCertBlScoreCreditForm_afterRefresh: function(){
        //change the align to left for min_points and max_points
		this.abGbRptCertBlScoreCreditForm.getFieldElement('gb_cert_credits.min_points').style.textAlign = 'left';
		this.abGbRptCertBlScoreCreditForm.getFieldElement('gb_cert_credits.max_points').style.textAlign = 'left';
    },
    
    /**
     * This event handler is called when user click 'DOC' button in title bar of Top-Right panel
     */
    abGbRptCertBlScoreProjForm_onDoc: function(){
        // Open the paginated report view 'ab-gb-rpt-cert-bl-score-paginate.axvw'
		var ds = this.abGbRptCertBlScoreCreditGridDS;
		var creditTypeEnumValues = ds.fieldDefs.items[ds.fieldDefs.indexOfKey('gb_cert_credits.credit_type')].enumValues;
		var dsParameters = {'credit':creditTypeEnumValues['C'],'prerequisite':creditTypeEnumValues['P'],'printRestriction':true };
		// Create the restriction
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gb_cert_proj.bl_id', this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.bl_id'), '=');
		restriction.addClause('gb_cert_proj.project_name', this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.project_name'), '=');		
		restriction.addClause('gb_cert_proj.cert_std', this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.cert_std'), '=');	
		//paired dataSourceId with Restriction objects
		var passedRestrictions = {'abGbRptCertBlScorePaginateProjFormDS': restriction};		
		View.openPaginatedReportDialog("ab-gb-rpt-cert-bl-score-paginate.axvw", passedRestrictions, dsParameters);
        
    },
	
	/**
     * This event handler is called when user click 'Update Totals' button in title bar of project grid panel
     */
    abGbRptCertBlScoreProjGrid_onUpdateProjTotalScore: function(){
        //Call  scoring project wfr
        try {
            var result = Workflow.callMethod("AbRiskGreenBuilding-ScoringService-calculateProjectScores");
        	View.showMessage(getMessage("msgUpdateTotalsComplete"));
            // refresh all visible panels
            View.panels.each(function(panel){
            	if (panel.visible && (panel.type == 'grid' || panel.type == 'form' || panel.type == 'columnReport')) {
            		var selectedRowIndex = -1;
            		if (panel.type == 'grid') {
            			selectedRowIndex = panel.selectedRowIndex;
            		}
            		panel.refresh(panel.restriction);
            		if (selectedRowIndex != -1 && panel.type == 'grid') {
            			panel.selectRow(selectedRowIndex);
            		}
            	}
            });
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * This event handler is called when Top-Right Certification Rating Project details form is refreshed
     */
    abGbRptCertBlScoreProjForm_afterRefresh: function(){
    
        //change the align to left for totCapitalCost and totAnnualSaving
        this.abGbRptCertBlScoreProjForm.getFieldElement('gb_cert_proj.tot_capital_cost').style.textAlign = 'left';
        this.abGbRptCertBlScoreProjForm.getFieldElement('gb_cert_proj.tot_annual_savings').style.textAlign = 'left';
        
        // When scoringtype is pnt_tot, show scores with no decimals
        var scoringType = this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_std.scoring_type');
        if (scoringType == 'pnt_tot') {
         	  var selfscoreString = this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.totSelfScore');
         	  var i = selfscoreString.indexOf("(");  // find first ( character
         	  if (i >= 0) {
         		selfscoreString = insertGroupingSeparator(''+parseInt(this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.tot_self_score')),true) + " " + selfscoreString.substr(i);  // concat localized score with rest of original string
         	  }
         	  
         	  var finalscoreString = this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.totFinalScore');
         	  i = finalscoreString.indexOf("(");  // find first ( character
         	  if (i >= 0) {
         		finalscoreString = insertGroupingSeparator(''+parseInt(this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.tot_final_score')),true) + " " + finalscoreString.substr(i);  // concat localized score with rest of original string
         	  }
         	  
            this.abGbRptCertBlScoreProjForm.getFieldElement('gb_cert_proj.totSelfScore').innerHTML = selfscoreString;
            this.abGbRptCertBlScoreProjForm.getFieldElement('gb_cert_proj.totFinalScore').innerHTML = finalscoreString;
         }

        // Construct a restriction from fields value of Certification Rating Project details form include 'gb_cert_proj.project_name',
        // 'gb_cert_proj.bl_id', then show and refresh Middle-Right Certification Credits grid by this restriction.        
        var project = this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.project_name');
        var blId = this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.bl_id');
        var certStd = this.abGbRptCertBlScoreProjForm.getFieldValue('gb_cert_proj.cert_std');

        this.abGbRptCertBlScoreCreditGrid.addParameter('project_name', project);
        this.abGbRptCertBlScoreCreditGrid.addParameter('bl_id', blId);
        this.abGbRptCertBlScoreCreditGrid.addParameter('cert_std', certStd);
        this.abGbRptCertBlScoreCreditTotalDS.addParameter('project_name', project);
        this.abGbRptCertBlScoreCreditTotalDS.addParameter('bl_id', blId);
        this.abGbRptCertBlScoreCreditTotalDS.addParameter('cert_std', certStd);
        this.abGbRptCertBlScoreCreditForm.addParameter('project_name', project);
        this.abGbRptCertBlScoreCreditForm.addParameter('bl_id', blId);
        this.abGbRptCertBlScoreCreditForm.addParameter('cert_std', certStd);
        this.abGbRptCertBlScoreCreditGrid.refresh();
        this.abGbRptCertBlScoreCreditForm.show(false);
    }
});


/**
 * insert group block rows
 */
function insertGroupByRows(){
    //get all group block and the total info
    var ds = View.dataSources.get('abGbRptCertBlScoreCreditTotalDS');
    var groupList = ds.getRecords();
    //insert single block row
    for (var i = 0; i < groupList.length; i++) {
        insertGroupByRow(groupList[i]);
    }
}

/**
 * insert group block single row
 */
function insertGroupByRow(group){
    var grid = View.panels.get('abGbRptCertBlScoreCreditGrid');
    var dataRows = Ext.query('tr', grid.tableBodyElement);
    var newRow = null;
    for (var i = 0; i < dataRows.length; i++) {
        var row = dataRows[i];
        if (i == dataRows.length - 1) {
            newRow = document.createElement('tr');
            grid.tableBodyElement.appendChild(newRow);
        }
        else {
            if (row.childNodes[0].firstChild.innerHTML == group.getValue('gb_cert_cat.cert_cat') &&
            dataRows[i + 1].childNodes[0].firstChild.innerHTML != group.getValue('gb_cert_cat.cert_cat')) {
                newRow = grid.tableBodyElement.insertRow(i + 1);
                break;
            }
        }
    }
    if (newRow) {
		var selfScore = group.getValue('gb_cert_cat.total_self_score');
		var finalScore = group.getValue('gb_cert_cat.total_final_score');
        insertCell(newRow, group.getValue('gb_cert_cat.cat_name'), 2);
        insertCell(newRow, getMessage('total') + ":", 1, "right");

   	//kb:3031019,change the Totals  show  decimal separator according to  local environment
   	var ds = View.dataSources.get('abGbRptCertBlScoreCreditTotalDS');

		if(selfScore!=""){
			if(group.getValue('gb_cert_std.scoring_type') == 'pnt_tot'){
   	    //kb:3031019,change the Totals  show  decimal separator according to  local environment
   	    var val = ds.formatValue('gb_cert_cat.total_self_score', parseFloat(selfScore).toFixed(0), true); 
				insertCell(newRow, val, 1);
			}else{
   	    //kb:3031019,change the Totals  show  decimal separator according to  local environment
   	    var val = ds.formatValue('gb_cert_cat.total_self_score', parseFloat(selfScore).toFixed(2), true); 
				insertCell(newRow, val, 1);
			}
		}else{
			insertCell(newRow, "", 1);
		}
		if(finalScore!=""){
			if(group.getValue('gb_cert_std.scoring_type') == 'pnt_tot'){
   	    //kb:3031019,change the Totals  show  decimal separator according to  local environment
   	    var val = ds.formatValue('gb_cert_cat.total_final_score', parseFloat(finalScore).toFixed(0), true); 
				insertCell(newRow, val, 1);
			}else{
   	    //kb:3031019,change the Totals  show  decimal separator according to  local environment
   	    var val = ds.formatValue('gb_cert_cat.total_final_score', parseFloat(finalScore).toFixed(2), true); 
				insertCell(newRow, val, 1);
			}
		}else{
			insertCell(newRow, "", 1);
		}
        
        insertCell(newRow, insertGroupingSeparator(group.getValue('gb_cert_cat.total_capital_cost')), 1);
        insertCell(newRow, insertGroupingSeparator(group.getValue('gb_cert_cat.total_annual_savings')), 1);
    }
}

/**
 * insert single cell for block row
 */
function insertCell(row, text, colspan, align){
    var cellElement = document.createElement('td');
    cellElement.innerHTML = text
    cellElement.colSpan = colspan;
    cellElement.className = 'totals';
    cellElement.style.fontSize = "13px";
    cellElement.style.fontWeight = "bold";
	cellElement.style.textAlign = 'left';
    if (valueExists(align)) {
        cellElement.style.textAlign = align;
    }
    row.appendChild(cellElement);
}

/**
 * Replace The field creditType
 */
function replaceType(grid){
    var rows = grid.rows;
    var rs = new Array();
    for (var i = 0; i <= rows.length - 1; i++) {
        var cred = rows[i];
        var credType = cred['gb_cert_credits.creditType'];
        var type = cred['gb_cert_credits.credit_type'];
        var t = credType.substring(1);
        credType = type + t;
        rs[i] = credType;
    }
    var n = 0;
    grid.gridRows.each(function(row){
        // get the current record and update its value
        var record = row.updatedRecord;
        if (!valueExists(record)) {
            record = row.getRecord();
        }
        record.setValue('gb_cert_credits.creditType', credType);
        // store the updated record in the Ab.grid.Row object for pending Save
        row.updatedRecord = record;
        // update visible text
        row.cells.get(1).dom.firstChild.innerHTML = rs[n];
        n++;
    });
}
