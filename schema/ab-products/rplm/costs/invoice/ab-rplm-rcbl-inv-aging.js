var abRplmRcblInvAgingController = View.createController('abRplmRcblInvAgingController', {
    //Restriction of console panel  type String
    consoleRes: "",
        
    //normal console fields which can be used for get restriction by common method getRestrictionStrFromConsole
    normalConsoleField: new Array( ['invoice.ls_id'], ['invoice.invoice_id'], ['ls.ac_id'], ['ls.tn_name'], ['invoice.contact_id_send_to'], ['contact.company']),
    
    //console value of first grouping field
    firstGrouping: "",
    
    //console value of second grouping field
    secondGrouping: "",
    
    //the selected group field by selecting the firstGrouping and secondGrouping
    selectedGroupField: null,
    
    // MC & VAT
    isMcAndVatEnabled: false,
    
    defaultInvoiceRetrictionParam: 'invoice_id = -1',
    
    //group field definition Map according the option of the console panel
    groupFieldMap: {
            '10': "invoice.contact_id_send_to",
            '11': "invoice.contact_id_send_to",
            '12': "RTRIM(invoice.contact_id_send_to)${sql.concat}'-'${sql.concat}RTRIM(invoice.invoice_id)",
            '13': "RTRIM(invoice.contact_id_send_to)${sql.concat}'-'${sql.concat}RTRIM(invoice.ac_id)",
            '14': "RTRIM(invoice.contact_id_send_to)${sql.concat}'-'${sql.concat}RTRIM(invoice.ls_id)",
            '15': "RTRIM(invoice.contact_id_send_to)${sql.concat}'-'${sql.concat}RTRIM(invoice.tn_name)",				
			
            '20': "invoice.invoice_id",
            '21': "RTRIM(invoice.invoice_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.contact_id_send_to)",
            '22': "invoice.invoice_id",
            '23': "RTRIM(invoice.invoice_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.ac_id)",
            '24': "RTRIM(invoice.invoice_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.ls_id)",
            '25': "RTRIM(invoice.invoice_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.tn_name)",

            '30': "invoice.ac_id",
            '31': "RTRIM(invoice.ac_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.contact_id_send_to)",
            '32': "RTRIM(invoice.ac_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.invoice_id)",
            '33': "invoice.ac_id",
            '34': "RTRIM(invoice.ac_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.ls_id)",
            '35': "RTRIM(invoice.ac_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.tn_name)",		

            '40': "invoice.ls_id",
            '41': "RTRIM(invoice.ls_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.contact_id_send_to)",
            '42': "RTRIM(invoice.ls_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.invoice_id)",
            '43': "RTRIM(invoice.ls_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.ac_id)",
            '44': "invoice.ls_id",
            '45': "RTRIM(invoice.ls_id)${sql.concat}'-'${sql.concat}RTRIM(invoice.tn_name)",				
			
            '50': "invoice.tn_name",
            '51': "RTRIM(invoice.tn_name)${sql.concat}'-'${sql.concat}RTRIM(invoice.contact_id_send_to)",
            '52': "RTRIM(invoice.tn_name)${sql.concat}'-'${sql.concat}RTRIM(invoice.invoice_id)",
            '53': "RTRIM(invoice.tn_name)${sql.concat}'-'${sql.concat}RTRIM(invoice.ac_id)",
            '54': "RTRIM(invoice.tn_name)${sql.concat}'-'${sql.concat}RTRIM(invoice.ls_id)",
            '55': "invoice.tn_name"
    },
    
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: ''
	},

	afterViewLoad: function(){
		// MC & VAT 
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        	
        	this.abRplmRcblInvAging_costs.addEventListener("afterGetData", formatTotalsForCurrency);
		} else {
			this.isMcAndVatEnabled = false;
		}
		
		//hide tabs
		this.invAgingTabs.showTab('invAgingTab_1', false);
		this.invAgingTabs.showTab('invAgingTab_2', false);
	},
	
	/**
	 * Removes currency code column from cross table. 
	 */
	abRplmRcblInvAging_afterGetData: function(panel, dataSet){
        for (var c = 0; c < panel.calculatedFields.length; c++) {
        	if(panel.calculatedFields[c].fullName == "invoice.currency_code"){
        		panel.calculatedFields.remove(panel.calculatedFields[c]);
        		break;
        	}
        }
	},
	
	/**
     * Color in grey the 0 values and bold the totals.
     */
	abRplmRcblInvAging_afterRefresh: function() {
		var records = this.abRplmRcblInvAging.dataSet.records;
		var columnValues = ['invoice.invnotdef', 'invoice.inv1month', 'invoice.inv2month', 'invoice.inv3month', 'invoice.inv4month', 'invoice.inv5month', 'invoice.invtotal'];
		//calculatedFields
		
		for(var i=0; i<records.length; i++){
			for(var j=0; j<columnValues.length; j++){
				var columnName = columnValues[j];
				var recordValue = records[i].values[columnName];
				var cell = this.abRplmRcblInvAging.getCellElement(i, 0, j);
				
				if(recordValue == 0){
					cell.style.color = "#A2A2A2";
				}
				
				//bold values from column Total
				if(j == 6){
					cell.style.fontWeight = "bold";
				}
			}
		}
		
		//bold values for row Total
		for(var i=0; i<columnValues.length; i++){
			var totalRowCell = document.getElementById(columnValues[i] + ';abRplmRcblInvAging_totals');
			totalRowCell.style.fontWeight = "bold";
		}
    },
	
	setDisplayCurrency: function(){

		var panel =  this.abRplmRcblInvAging_console;
		
		if(valueExists(panel.displayCurrency)){
			this.displayCurrency = panel.displayCurrency;
		}
	},
	
	
	/**
     * On click event handler for 'Show' action.
     */
    abRplmRcblInvAging_console_onShow: function(){
        
    	// set the currency
    	this.setDisplayCurrency();
    	
    	//get group option from console
		this.firstGrouping = $('firstGrouping').value;
		this.secondGrouping = $('secondGrouping').value;
		this.selectedGroupField = this.firstGrouping.toString() + this.secondGrouping.toString();
		this.groupBy = this.groupFieldMap[this.selectedGroupField];
		this.abRplmRcblInvAging.addParameter('groupfield', this.groupBy);
		this.consoleRes = getRestrictionStrFromConsole(this.abRplmRcblInvAging_console, this.normalConsoleField);
		this.consoleRes = this.consoleRes.replace(/ls.tn_name/g, "invoice.tn_name");
		this.consoleRes = this.consoleRes.replace(/ls.ac_id/g, "invoice.ac_id");
		this.consoleRes = this.consoleRes.replace(/contact.company/g, "invoice.company");
		
		this.abRplmRcblInvAging.addParameter('consoleRes', this.consoleRes);
        this.abRplmRcblInvAging.addParameter('exchangeRate', getExchangeRateParameter());
		this.abRplmRcblInvAging.addParameter('currencyCode', this.displayCurrency.code);
       
        this.abRplmRcblInvAging.refresh();
     
        // select first tab and disable the other tab
        this.invAgingTabs.showTab('invAgingTab_1', true);
		this.invAgingTabs.showTab('invAgingTab_2', true);
		this.invAgingTabs.selectTab('invAgingTab_1');
		this.invAgingTabs.enableTab('invAgingTab_2', false);
    },
    /**
     * On click event handler for 'Clear' action.
     */
   abRplmRcblInvAging_console_onClear: function(){
		this.abRplmRcblInvAging_console.clear();
		setDefaultValueForHtmlField(['firstGrouping', 'secondGrouping'], ['1', '0']);
    },
    /**
     * Show details in second tab.
     * @param ob {Object} click object.
     */
    showDetails: function(ob){
        var gridName = 'abRplmRcblInvAging_invoices';
        var grid = View.panels.get(gridName);
		
		//add to fix KB3028988
		var restriction = this.createSecondTabRestriction(ob);
		restriction = restriction.replace(/invoice.tn_name/g, "ls.tn_name");
		restriction = restriction.replace(/invoice.ac_id/g, "ls.ac_id");
		restriction = restriction.replace(/invoice.company/g, "contact.company");
        grid.refresh(restriction);
        
        //display the Costs panel without records
		this.initCostsPanel();
		
		this.setInvoicePanelTitle(ob);
		
        this.invAgingTabs.enableTab('invAgingTab_2', true);
		this.invAgingTabs.selectTab('invAgingTab_2');
    },
    /**
     * Create restriction for second tab grids.
     */
    createSecondTabRestriction: function(clickObject){
        var restriction = this.consoleRes;
        if (clickObject.restriction.clauses) {
            for (var i = 0; i < clickObject.restriction.clauses.length; i++) {
				var clause = clickObject.restriction.clauses[i];
                if (clause.name.indexOf('groupfield')!=-1) {
                    restriction += " AND " + this.groupBy;
                }				
				if(clause.op == 'IS NULL'){
					restriction += " IS NULL ";
				}else{
					restriction += " = '" + clause.value + "'";
				}
            }
        }
        return restriction;
    },
    
    /**
     * Sets the custom title for the Invoices panel.
     * @param clickObject command context object for click in the crossTable.
     */
    setInvoicePanelTitle: function(clickObject){
    	if (clickObject.restriction.clauses) {
    		var clause = clickObject.restriction.clauses[0];
    		if(clause){
    			var title = getMessage("invoicesPanelTitle") + " " + clause.value; 
    			this.abRplmRcblInvAging_invoices.setTitle(title);
    		}
    	}
    },
    
    loadCostsDetails: function(row){
    	var gridName = 'abRplmRcblInvAging_costs';
        var grid = View.panels.get(gridName);
        
        var invoiceId = row['invoice.invoice_id'];
        grid.addParameter('invoice_id', 'invoice_id = ' + invoiceId);
        grid.refresh();
    	
    	var title = getMessage("costsPanelTitle").replace("{0}", invoiceId);
    	grid.setTitle(title);
    },

    initCostsPanel: function(){
    	this.abRplmRcblInvAging_costs.addParameter('invoice_id', this.defaultInvoiceRetrictionParam);
    	this.abRplmRcblInvAging_costs.refresh();
    	this.abRplmRcblInvAging_costs.setTitle(getMessage("defaultCostsPanelTitle"));
    	this.showTotalCostsRow(false);
    },
    
    /**
     * Handle click on Refresh button.
     */
    refreshCostsPanel: function(){
    	var grid = this.abRplmRcblInvAging_costs;
    	var invoiceId = grid.parameters['invoice_id'].replace('invoice_id = ','');
    	grid.refresh();
    	
    	if(invoiceId && invoiceId != '-1'){
    		var title = getMessage("costsPanelTitle").replace("{0}", invoiceId);
        	grid.setTitle(title);
        	this.showTotalCostsRow(true);
    	}else{
    		this.showTotalCostsRow(false);
    	}
    },
    
    abRplmRcblInvAging_costs_afterRefresh: function(){
    	var totalRow = document.getElementById('abRplmRcblInvAging_costs_totals');
		if(totalRow){
			totalRow.cells[2].innerHTML = getMessage("total_costs_for_invoice");
		}
	},
	
	showTotalCostsRow: function(show){
		var totalRow = document.getElementById('abRplmRcblInvAging_costs_totals');
		if (totalRow) {
			totalRow.hidden = !show;
		}
	}
});

function appendToRestriction(res, workType, table, fldId){
	var fullFld = table + "." + fldId;
    var workTypeRes = fullFld + " IS NOT NULL";
    
    if (workType != '' && workType != null) {
        workTypeRes = fullFld + " ='" + workType + "'";
    }
    return res + " AND " + workTypeRes;
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
 * Returns the exchange rate dataSource parameter
 * "1.0"
 * or
 * i.e. "${sql.exchangeRateFromFieldForDate('cost.payment_currency', 'USD', 'Payment', 'cost.payment_date')}"
 * @returns {String}
 */
function getExchangeRateParameter(){
	
	var tableName = "invoice";

	var	exchangeRate = "${sql.exchangeRateFromFieldForDate(" +
					   "'" + tableName + ".currency_invoice'," +
					   " '" + abRplmRcblInvAgingController.displayCurrency.code + "'," +
					   " '" + abRplmRcblInvAgingController.displayCurrency.exchangeRateType + "'," +
					   " '" + tableName + "." + 'date_expected_rec' + "')}";
	
	return exchangeRate;
}

/**
 * Format total for currency
 * @param reportGrid
 * @param data
 */
function formatTotalsForCurrency(reportGrid, data){
	// if there no records - exit
	if(data.records.length == 0){
		return;
	}
	
	var dataSource = reportGrid.getDataSource();
	var mainTableName = dataSource.mainTableName;
	var record = data.records[0];
	var totals = data.totals;
	dataSource.fieldDefs.each(function(fieldDef){
		if(fieldDef.showTotals){
			var id = valueExists(fieldDef.fullName) ? fieldDef.fullName : fieldDef.id;
			var name = id;
			if (name.indexOf('.') != -1) {
				name = name.substring(name.indexOf('.') + 1);
			}
			var totalsName = mainTableName + '.sum_' + name;
			if(valueExists( data.totals[totalsName])){
				var neutralValue =  data.totals[totalsName].n;
				var localizedValue = dataSource.formatValue(id, neutralValue, true, true, record);
				 data.totals[totalsName].l = localizedValue;
			}
		}
	});
}