/**
 * @author Guo
 */
var abGbRptCertPaybackController = View.createController('abGbRptCertPaybackController', {

    // ----------------------- event handlers -------------------------
    
    afterViewLoad: function(){
        // insert the group block rows
        this.abGbRptCertPaybackCreditGrid.afterCreateDataRows = function(parentElement, columns){
            insertGroupByRows();
        }
    },
    
    abGbRptCertPaybackCreditGrid_afterRefresh: function(){
        //remove the sorting to aviod error after insert group block rows
        if (this.abGbRptCertPaybackCreditGrid.headerRows.length > 0) {
            this.abGbRptCertPaybackCreditGrid.removeSorting();
            replaceType(this.abGbRptCertPaybackCreditGrid);
        }
    },
    
    
    /**
     * This event handler is called when user click "DOC" button in title bar of Top-Right panel
     */
    abGbRptCertPaybackPeriodForm_onDoc: function(){
        // Open the paginated report view 'ab-gb-rpt-cert-payback-paginate.axvw'
		var ds = this.abGbRptCertPaybackCreditGridDS;
		var creditTypeEnumValues = ds.fieldDefs.items[ds.fieldDefs.indexOfKey('gb_cert_credits.credit_type')].enumValues;
		var dsParameters = {'credit':creditTypeEnumValues['C'],'prerequisite':creditTypeEnumValues['P'],'printRestriction':true};
		// Create the restriction
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gb_cert_proj.bl_id', this.abGbRptCertPaybackPeriodForm.getFieldValue('gb_cert_proj.bl_id'), '=');
		restriction.addClause('gb_cert_proj.project_name', this.abGbRptCertPaybackPeriodForm.getFieldValue('gb_cert_proj.project_name'), '=');		
		restriction.addClause('gb_cert_proj.cert_std', this.abGbRptCertPaybackPeriodForm.getFieldValue('gb_cert_proj.cert_std'), '=');	
		//paired dataSourceId with Restriction objects
		var passedRestrictions = {'abGbRptCertPaybackPeriodPaginateFormDS': restriction};				
        View.openPaginatedReportDialog("ab-gb-rpt-cert-payback-paginate.axvw", passedRestrictions, dsParameters);
        
    },
    
    /**
     * This event handler is called when Top-Right Projects Payback Period details form is refreshed
     */
    abGbRptCertPaybackPeriodForm_afterRefresh: function(){
        // Construct a restriction from fields value of Certification Rating Project details form include 'gb_cert_proj.project_name',
        // 'gb_cert_proj.bl_id', then show and refresh Middle-Right Certification Credits grid by this restriction.
        
        var project = this.abGbRptCertPaybackPeriodForm.getFieldValue('gb_cert_proj.project_name');
        var blId = this.abGbRptCertPaybackPeriodForm.getFieldValue('gb_cert_proj.bl_id');
		var certStd = this.abGbRptCertPaybackPeriodForm.getFieldValue('gb_cert_proj.cert_std');
        this.abGbRptCertPaybackCreditGrid.addParameter('project_name', project);
        this.abGbRptCertPaybackCreditGrid.addParameter('bl_id', blId);
		this.abGbRptCertPaybackCreditGrid.addParameter('cert_std', certStd);
        this.abGbRptCertPaybackCreditTotalDS.addParameter('project_name', project);
        this.abGbRptCertPaybackCreditTotalDS.addParameter('bl_id', blId);
		this.abGbRptCertPaybackCreditTotalDS.addParameter('cert_std', certStd);
        this.abGbRptCertPaybackCreditGrid.refresh();
    }
});

/**
 * insert group block rows
 */
function insertGroupByRows(){
    //get all group block and the total info
    var ds = View.dataSources.get('abGbRptCertPaybackCreditTotalDS');
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
    var grid = View.panels.get('abGbRptCertPaybackCreditGrid');
    var dataRows = Ext.query('tr', grid.tableBodyElement);
    var newRow = null;
    for (var i = 0; i < dataRows.length; i++) {
        var row = dataRows[i];
        if (i == dataRows.length - 1) {
            newRow = document.createElement('tr');
            grid.tableBodyElement.appendChild(newRow);
        }
        else {
            if (row.childNodes[0].innerHTML == group.getValue('gb_cert_cat.cert_cat') &&
            dataRows[i + 1].childNodes[0].innerHTML != group.getValue('gb_cert_cat.cert_cat')) {
                newRow = grid.tableBodyElement.insertRow(i + 1);
                break;
            }
        }
    }
    if (newRow) {
        insertCell(newRow, group.getValue('gb_cert_cat.cat_name'), 2, "left");
        insertCell(newRow, getMessage('total') + ":", 1);
		if (group.getValue('gb_cert_cat.total_paybackPeriod') == '') {
            insertCell(newRow, '', 1, "left");
        }
        else {
        	//kb:3031019,change the Totals  show  decimal separator according to  local environment
        	var ds = View.dataSources.get('abGbRptCertPaybackCreditTotalDS');
        	var x =ds.formatValue('gb_cert_cat.total_paybackPeriod', parseFloat(group.getValue('gb_cert_cat.total_paybackPeriod')).toFixed(2), true); 
            insertCell(newRow, x, 1, "left");
        }
        insertCell(newRow, insertGroupingSeparator(group.getValue('gb_cert_cat.total_capital_cost')), 1, "left");
        insertCell(newRow, insertGroupingSeparator(group.getValue('gb_cert_cat.total_annual_savings')), 1, "left");
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
        row.cells.get(1).dom.innerHTML = rs[n];
        n++;
    });
}
