var controller = View.createController('calculateCashCost', {

	regexYear: /\d{4}/,
	fromYear: null,
	toYear: null,
	excludeCostCat_title:'',
	showCostCat_title:'',
	m_costCat:'',
	
	// Activity parameter EnableVatAndMultiCurrency
	isMcAndVatEnabled: false,

	// VAT selection
	displayVAT: {
		type: '',
		isHidden: false
	},
	
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: ''
	},
		
    afterViewLoad: function() {
        this.inherit();
		this.setLabel();
		
        var recs = View.dataSources.get("dsYearsCost").getRecords();
        var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
        var default_cost_cat_id = View.dataSources.get("dsGet_exp_cost_cat_id").getRecords();
        var expenseController = View.controllers.get('calculateCashCost');
        this.populateYearSelectLists(recs, fromyear_select, false);
        this.populateYearSelectLists(recs, toyear_select, true);
        for(var i = 0; i < default_cost_cat_id.length; i++){
			expenseController.updateCostCatStorage(default_cost_cat_id[i].values['cost_cat.cost_cat_id'], 'cost_cat_id_storage_sh');
        }
        
        this.isMcAndVatEnabled = (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1);
        if (this.isMcAndVatEnabled) {
        	this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        }
	},
	
	setLabel: function(){
    	this.excludeCostCat_title = getMessage('exclude_cost_cat_of').replace('{0}', ' ');
    	this.showCostCat_title = getMessage('show_cost_cat_of').replace('{0}', ' ');
		
		setButtonLabels(new Array('addCostCategory_ex','clearCostCategory_ex'), new Array('add','clear'));
		setButtonLabels(new Array('addCostCategory_sh','clearCostCategory_sh'), new Array('add','clear'));

		$('exclude_cost_cat_of_label').innerHTML = '&#160;' + getMessage('exclude_cost_cat_of').replace('{0}', '<br/>');
		$('show_cost_cat_of_label').innerHTML = '&#160;' + getMessage('show_cost_cat_of').replace('{0}', '<br/>');
		
		// wrap the label
		this.console.getFieldLabelElement('show_cost_associated_with').style.whiteSpace = 'normal';
	},
	
	console_onFilter : function() {
		setVATAndMCVariables(this);
		
		var restr = this.getConsoleRestriction();
		var restriction = restr + this.getDateRestriction("recurr");
		if(this.fromYear>this.toYear){
        	View.showMessage(getMessage('year_mess'));
       		return;
        }
		var restriction_tab1 = (restr + this.getDateRestriction("sched")).replace(/cost_tran_recur/g,"cost_tran_sched");
		var restriction_tab2 = (restr + this.getDateRestriction("actual")).replace(/cost_tran_recur/g,"cost_tran");
    	var tabPanel = View.getView('parent').panels.get('tabsCosts');

		//send restriction
		this.recurringCostGrid.addParameter('consoleRestriction',restriction);
		this.scheduledCostUpper.addParameter('consoleRestriction',restriction_tab1);
		this.scheduledCostLower.addParameter('consoleRestriction',restriction_tab1);
		this.actualCostUpper.addParameter('consoleRestriction',restriction_tab2);
		this.actualCostLower.addParameter('consoleRestriction',restriction_tab2);
		
		// add VAT & MC parameters to grids
		addVATAndMCGridsParameters(this);
    	
    	//refresh tabs
		this.recurringCostGrid.refresh();
   		this.scheduledCostUpper.refresh();
    	this.scheduledCostLower.refresh();
   		this.actualCostUpper.refresh();
    	this.actualCostLower.refresh();
    	
    	// set tabs titles and columns
    	setVATAndMCDisplay(this);
	},
	
	recurringCostGrid_afterRefresh: function(){
		setColumnTitles(this, this.recurringCostGrid, "cost_tran_recur");
	},
	
	scheduledCostUpper_afterRefresh: function(){
		setColumnTitles(this, this.scheduledCostUpper, "cost_tran_sched", true);
	},
	
	scheduledCostLower_afterRefresh: function(){
		setColumnTitles(this, this.scheduledCostLower, "cost_tran_sched");
	},
	
	actualCostUpper_afterRefresh: function(){
		setColumnTitles(this, this.actualCostUpper, "cost_tran", true);
	},
	
	actualCostLower_afterRefresh: function(){
		setColumnTitles(this, this.actualCostLower, "cost_tran");
	},
    
	console_onClear : function() {
		this.console.clear();
		document.getElementById('leases').checked = true;
		document.getElementById('cost_cat_id_ex_check').checked = false;
		document.getElementById('cost_cat_id_sh_check').checked = true;
		enableGeo();
		var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
		var optionIndexCurrentYear = this.getOptionIndex(fromyear_select, this.getSystemYear())
        fromyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		fromyear_select.value = this.getSystemYear();
        optionIndexCurrentYear = this.getOptionIndex(toyear_select, this.getSystemYear())
        toyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        toyear_select.value = this.getSystemYear();
        resetMcAndVatVariables(this, this.console);
	},

	getConsoleRestriction: function() { 
		var restriction = "";
		var projectionTypeRadioValue = "";
		var costAsocWith= "";
		var analyzeBy = {
			"pr": " cost_tran_recur.pr_id",
			"bl": " cost_tran_recur.bl_id",
			"ac": " cost_tran_recur.ac_id",
			"lsBl": " cost_tran_recur.ls_id",
			"lsProp": " cost_tran_recur.ls_id",
			"lsAll": " cost_tran_recur.ls_id"
		};
		
		var radioAnalyzeCost = document.getElementsByName("costBy");
		
        for(var i=0;i<radioAnalyzeCost.length;i++)
		{                
	        if(radioAnalyzeCost[i].checked)
    	    	{ 
	        		projectionTypeRadioValue = radioAnalyzeCost[i].value;
 	        		costAsocWith = analyzeBy[radioAnalyzeCost[i].value];
	        		restriction = " AND "+ costAsocWith+" IS NOT NULL ";
        		}
		}
        
        var restrCostAsocWith = getRestrictionCostAsocWith(this.console, costAsocWith, projectionTypeRadioValue);
    	restriction += restrCostAsocWith;
    	
		var check_show_cat = document.getElementById("cost_cat_id_sh_check").checked;
		var check_exculde_cat = document.getElementById("cost_cat_id_ex_check").checked;
		var cost_cat_id_storage_ex = trim($('cost_cat_id_storage_ex').value);
		var cost_cat_id_storage_sh = trim($('cost_cat_id_storage_sh').value);

		if (cost_cat_id_storage_ex != "" && check_exculde_cat) {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage_ex.replace(regex, "','");
			restriction += "AND cost_tran_recur.cost_cat_id NOT IN ('" + cost_cat_id + "') ";
		}
		if (cost_cat_id_storage_sh != "" && check_show_cat) {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage_sh.replace(regex, "','");
			restriction += "AND cost_tran_recur.cost_cat_id IN ('" + cost_cat_id + "') ";
		}
		
		return restriction;	
	},

	getDateRestriction: function(costsTab) {
		this.fromYear = $('console_cost.year').value;
        this.toYear = $('console_cost.toyear').value;
		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';
		
		var restriction = "";
		switch(costsTab) {
			case "sched":
			case "actual":
				restriction += " AND ((CASE WHEN cost_tran_recur.date_paid IS NOT NULL THEN cost_tran_recur.date_paid ELSE cost_tran_recur.date_due END) >=${sql.date('"+dateStart+"')} AND (CASE WHEN cost_tran_recur.date_paid IS NOT NULL THEN cost_tran_recur.date_paid ELSE cost_tran_recur.date_due END) <=${sql.date('"+dateEnd+"')}) ";
				break;
			default: 
				restriction += " AND ((cost_tran_recur.date_start >=${sql.date('"+dateStart+"')} AND cost_tran_recur.date_start <=${sql.date('"+dateEnd+"')}) ";
				restriction += " OR (cost_tran_recur.date_end >=${sql.date('"+dateStart+"')} AND cost_tran_recur.date_end <=${sql.date('"+dateEnd+"')}) ";
				restriction += " OR (cost_tran_recur.date_start <${sql.date('"+dateStart+"')} AND cost_tran_recur.date_end >${sql.date('"+dateEnd+"')}) ) ";
		}

		return restriction;	
	},
	
	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},

    /**
     * Sets multiple selected items in the grid from specified list of names.
     * @param {grid} Grid panel with multiple selection enabled.
     * @param {fieldName} Name of the field used in the list. 
     * @param {values} Comma-separated list of values.
     */
    setSelectedItems: function (grid, fieldName, values) {
        // prepare the values map for fast indexing
        var valuesMap = {};
        var valuesArray = values.split(',');
        for (var i = 0; i < valuesArray.length; i++) {
            var value = valuesArray[i];
            valuesMap[value] = value;
        }
        // select rows
        grid.gridRows.each(function(row) {
            var value = row.getRecord().getValue(fieldName);
            // if we have this value in the list, select the row
            if (valueExists(valuesMap[value])) {
                row.select();
            }
        });        
    },
	
	getSelectedItems: function(grid, fieldName) {
        var values = '';
        grid.gridRows.each(function(row) {
            if (row.isSelected()) {
                var value = row.getRecord().getValue(fieldName);
                if (values != '') {
                    values += ',';
                }
                values += value;
            }
        });        
        return values;
    },

    addCostCategory: function(costCat,title_label) {
        // select cost categories in the grid
		this.formSelectValueMultiple_grid.refresh();
		var values = $(costCat).value;
		this.m_costCat = costCat;
        this.setSelectedItems(this.formSelectValueMultiple_grid, 'cost_cat.cost_cat_id', values);
        this.formSelectValueMultiple_grid.setTitle(title_label);

        this.formSelectValueMultiple_grid.showInWindow({
            width: 600,
            height: 400
        });
    },
	
    formSelectValueMultiple_grid_onAddSelected: function() {
        // get selected cost categories from the grid
        var values = this.getSelectedItems(this.formSelectValueMultiple_grid, 'cost_cat.cost_cat_id');
        $(this.m_costCat).value = values;
        
        this.formSelectValueMultiple_grid.closeWindow();
    },

	clearCostCategory: function(costCat) {
		$(costCat).value = '';
	},

	updateCostCatStorage: function(newCostCatId, costCat) {
		var cost_cat_id_storage = $(costCat).value;
		if (cost_cat_id_storage == '') {
			cost_cat_id_storage += newCostCatId;
		}
		else {
			cost_cat_id_storage += ',' + newCostCatId;
		}
		$(costCat).value = cost_cat_id_storage;
	},

    populateYearSelectLists: function(recs, year_select, is_to_year) {
    	year_select.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }
        var optionIndexCurrentYear = null;
        if (is_to_year) {
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear();
        }
        else {
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear();
        }
        
    },
    
    getOptionIndex: function(select, value) {
		if(!select.options) return -1;
		for(var oNum = 0; oNum != select.options.length; oNum++) {
			if(select.options[oNum].value == value) return oNum;
		}
		return -1;
	}
});

function user_addCostCategory_ex() {
	var controller = View.controllers.get('calculateCashCost');
	controller.addCostCategory('cost_cat_id_storage_ex',controller.excludeCostCat_title);
}

function user_addCostCategory_sh() {
	var controller = View.controllers.get('calculateCashCost');
	controller.addCostCategory('cost_cat_id_storage_sh',controller.showCostCat_title);
}

function user_clearCostCategory_ex() {
	var controller = View.controllers.get('calculateCashCost');
	controller.clearCostCategory('cost_cat_id_storage_ex');
}

function user_clearCostCategory_sh() {
	var controller = View.controllers.get('calculateCashCost');
	controller.clearCostCategory('cost_cat_id_storage_sh');
}

function changeYear(amount, fieldId) {
	var controller = View.controllers.get('calculateCashCost');
	controller.changeYear(amount, fieldId);
}
function disableGeo(){
	this.controller.console.setFieldValue('bl.ctry_id', '');
	this.controller.console.setFieldValue('bl.regn_id', '');
	this.controller.console.setFieldValue('bl.city_id', '');
	this.controller.console.setFieldValue('bl.state_id', '');
	this.controller.console.setFieldValue('bl.site_id', '');
	this.controller.console.setFieldValue('bl.bl_id', '');
	this.controller.console.setFieldValue('property.pr_id', '');
    this.controller.console.enableField('bl.ctry_id', false);
    this.controller.console.enableField('bl.regn_id', false);
    this.controller.console.enableField('bl.city_id', false);
    this.controller.console.enableField('bl.site_id', false);
    this.controller.console.enableField('bl.state_id', false);
    this.controller.console.enableField('bl.bl_id', false);
    this.controller.console.enableField('property.pr_id', false);
}
function enableGeo(){
    var radioProperty = document.getElementById("properties");
    this.controller.console.enableField('bl.ctry_id', true);
    this.controller.console.enableField('bl.regn_id', true);
    this.controller.console.enableField('bl.city_id', true);
    this.controller.console.enableField('bl.site_id', true);
    this.controller.console.enableField('bl.state_id', true);
    this.controller.console.enableField('property.pr_id', true);
    if(radioProperty.checked){
    	this.controller.console.enableField('bl.bl_id', false);
    	this.controller.console.setFieldValue('bl.bl_id', '');
    }else{
    	this.controller.console.enableField('bl.bl_id', true);
    }
}
function check_exclude(){
	if(document.getElementById("cost_cat_id_ex_check").checked){
		document.getElementById("cost_cat_id_sh_check").checked = false;
	}
}
function check_show(){
	if(document.getElementById("cost_cat_id_sh_check").checked){
		document.getElementById("cost_cat_id_ex_check").checked = false;
	}
}	

function setButtonLabels(arrButtons, arrLabels){
	var maxLabelIndex = -1;
	var maxLabelLength = -1;
	var maxWidth = 0;
	for(var i=0; i < arrLabels.length; i++){
		var crtText = getMessage(arrLabels[i]);
		if(crtText.length > maxLabelLength){
			maxLabelLength = crtText.length;
			maxLabelIndex = i;
		}
	}
	// set label for maxLabelIndex
	var objButton = document.getElementById(arrButtons[maxLabelIndex]);
	objButton.value = getMessage(arrLabels[maxLabelIndex]);
	maxWidth = objButton.clientWidth;
	for(var i =0;i < arrButtons.length; i++){
		var crtObj = document.getElementById(arrButtons[i]);
		crtObj.value = getMessage(arrLabels[i]);
		crtObj.style.width = maxWidth+10;
	}
}
