var controller = View.createController('calculateCashCost', {

	regexYear: /\d{4}/,
	fromYear: null,
	toYear: null,
	restriction_actual: null,
	restriction_sched: null,
	excludeCostCat_title:'',
	showCostCat_title:'',
	m_costCat:'',
	
    afterViewLoad: function() {
		this.setLabel();

        var recs = View.dataSources.get("dsYearsCost").getRecords();
        var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
        this.populateYearSelectLists(recs, fromyear_select, false);
        this.populateYearSelectLists(recs, toyear_select, true);
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
		
		var restriction_tab_recur = this.getConsoleRestriction();
		
		if(this.fromYear>this.toYear){
        	View.showMessage(getMessage('year_mess'));
       		return;
        }
		var restriction_tab_sched = this.restriction_sched.replace(/cost_tran_recur/g,"cost_tran_sched");
		var restriction_tab_actual = this.restriction_actual.replace(/cost_tran_recur/g,"cost_tran");
	
		//send restriction
		View.controllers.get('recurringCostCtrl').recurringCostGrid.addParameter('consoleRestriction',restriction_tab_recur);
		View.controllers.get('scheduledCostCtrl').scheduledCostUpper.addParameter('consoleRestriction',restriction_tab_sched);
		View.controllers.get('scheduledCostCtrl').scheduledCostLower.addParameter('consoleRestriction',restriction_tab_sched);
		View.controllers.get('actualCostCtrl').actualCostUpper.addParameter('consoleRestriction',restriction_tab_actual);
		View.controllers.get('actualCostCtrl').actualCostLower.addParameter('consoleRestriction',restriction_tab_actual);
    	
    	//refresh tabs
    	View.controllers.get('recurringCostCtrl').recurringCostGrid.refresh();
    	View.controllers.get('scheduledCostCtrl').scheduledCostUpper.refresh();
    	View.controllers.get('scheduledCostCtrl').scheduledCostLower.refresh();
    	View.controllers.get('actualCostCtrl').actualCostUpper.refresh();
    	View.controllers.get('actualCostCtrl').actualCostLower.refresh();
	},
    
	console_onClear : function() {
		this.console.clear();
		document.getElementById('leases').checked = true;
		document.getElementById('cost_cat_id_ex_check').checked = false;
		document.getElementById('cost_cat_id_sh_check').checked = false;
		enableGeo();
		var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
		var optionIndexCurrentYear = this.getOptionIndex(fromyear_select, this.getSystemYear())
        fromyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		fromyear_select.value = this.getSystemYear();
        optionIndexCurrentYear = this.getOptionIndex(toyear_select, this.getSystemYear())
        toyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        toyear_select.value = this.getSystemYear();
	},

	getConsoleRestriction: function() { 
		var restriction = "";
		var costAsocWith= "";
		// KB 3024690 Ioan
		var analyzeBy = {
			"pr": " cost_tran_recur.pr_id",
			"bl": " cost_tran_recur.bl_id",
			"ac": " cost_tran_recur.ac_id",
			"ls": " cost_tran_recur.ls_id"
		};
        //var analyzeBy = new Array(" cost_tran_recur.ls_id"," cost_tran_recur.ac_id"," cost_tran_recur.bl_id"," cost_tran_recur.pr_id");
        var radioAnalyzeCost = document.getElementsByName("costBy");
        var ctry_id = getConsoleFieldValue(this.console, 'bl.ctry_id');
        var regn_id = getConsoleFieldValue(this.console, 'bl.regn_id');
        var state_id = getConsoleFieldValue(this.console, 'bl.state_id');
        var city_id = getConsoleFieldValue(this.console, 'bl.city_id');
        var site_id = getConsoleFieldValue(this.console, 'bl.site_id');
        var pr_id = getConsoleFieldValue(this.console, 'property.pr_id');
        var bl_id = getConsoleFieldValue(this.console, 'bl.bl_id');
        var blGeoRestriction="";
        var prGeoRestriction="";
        var bl_ls_JOIN="";
        var pr_ls_JOIN="";
        
        for(var i=0;i<radioAnalyzeCost.length;i++)
		{                
	        if(radioAnalyzeCost[i].checked)
    	    	{ 
					// KB 3024690 Ioan
	        		costAsocWith = analyzeBy[radioAnalyzeCost[i].value];
	        		restriction = " AND "+ costAsocWith+" IS NOT NULL ";
        		}
		}
		
    	if (valueExistsNotEmpty(pr_id) || valueExistsNotEmpty(bl_id) || valueExistsNotEmpty(ctry_id)
        			|| valueExistsNotEmpty(regn_id) || valueExistsNotEmpty(state_id) || valueExistsNotEmpty(city_id)
        			|| valueExistsNotEmpty(site_id) || costAsocWith != ' cost_tran_recur.ac_id') {

			switch (costAsocWith)
				{
					case ' cost_tran_recur.ls_id': 
							bl_ls_JOIN=" (SELECT ls.ls_id FROM ls,bl WHERE bl.bl_id=ls.bl_id ";
							pr_ls_JOIN=" UNION SELECT ls.ls_id FROM ls,property WHERE property.pr_id=ls.pr_id ";
    						if (valueExistsNotEmpty(bl_id)) {
								blGeoRestriction = " AND bl.bl_id in " + toSQLRestrString(bl_id);
    						}  
    						if (valueExistsNotEmpty(pr_id)) {
								prGeoRestriction += " AND property.pr_id in " + toSQLRestrString(pr_id);
								blGeoRestriction += " AND bl.pr_id in " + toSQLRestrString(pr_id);
								}
							if (valueExistsNotEmpty(ctry_id)) {
								blGeoRestriction += " AND bl.ctry_id in " + toSQLRestrString(ctry_id);
								prGeoRestriction += " AND property.ctry_id in " + toSQLRestrString(ctry_id);
    						}
    						if (valueExistsNotEmpty(regn_id)) {
								blGeoRestriction += " AND bl.regn_id in " + toSQLRestrString(regn_id);
								prGeoRestriction += " AND property.regn_id in " + toSQLRestrString(regn_id);
    						}
    						if (valueExistsNotEmpty(state_id)) {
								blGeoRestriction += " AND bl.state_id in " + toSQLRestrString(state_id);
								prGeoRestriction += " AND property.state_id in " + toSQLRestrString(state_id);
    						}
    						if (valueExistsNotEmpty(city_id)) {
								blGeoRestriction += " AND bl.city_id in " + toSQLRestrString(city_id);
								prGeoRestriction += " AND property.city_id in " + toSQLRestrString(city_id);
    						}
    						if (valueExistsNotEmpty(site_id)) {
								blGeoRestriction += " AND bl.site_id in " + toSQLRestrString(site_id);
								prGeoRestriction += " AND property.site_id in " + toSQLRestrString(site_id);
    						}

    	   					restriction += " AND cost_tran_recur.ls_id IN "+ bl_ls_JOIN + blGeoRestriction + pr_ls_JOIN + prGeoRestriction;
    	   					restriction += ") ";
							break;
					case ' cost_tran_recur.bl_id': 
							restriction += " AND EXISTS(SELECT * FROM bl WHERE bl.bl_id=cost_tran_recur.bl_id ";
							if (valueExistsNotEmpty(ctry_id)) {
    							restriction += "AND bl.ctry_id in " + toSQLRestrString(ctry_id);
    						}
    						if (valueExistsNotEmpty(regn_id)) {
    							restriction += "AND bl.regn_id in " + toSQLRestrString(regn_id);
    						}
    						if (valueExistsNotEmpty(state_id)) {
    						restriction += "AND bl.state_id in " + toSQLRestrString(state_id);
    						}
    						if (valueExistsNotEmpty(city_id)) {
    						restriction += "AND bl.city_id in " + toSQLRestrString(city_id);
    						}
    						if (valueExistsNotEmpty(site_id)) {
    						restriction += "AND bl.site_id in " + toSQLRestrString(site_id);
    						}
    	   					if (valueExistsNotEmpty(bl_id)) {
								restriction += " AND bl.bl_id in " + toSQLRestrString(bl_id);
							}
							if (valueExistsNotEmpty(pr_id)) {
							restriction += " AND bl.pr_id in " + toSQLRestrString(pr_id);
							}
							restriction += ") ";
							break;
					case ' cost_tran_recur.pr_id': 
							restriction += " AND EXISTS(SELECT * FROM property WHERE property.pr_id=cost_tran_recur.pr_id ";
							if (valueExistsNotEmpty(ctry_id)) {
    							restriction += "AND property.ctry_id in " + toSQLRestrString(ctry_id);
    						}
    						if (valueExistsNotEmpty(regn_id)) {
    							restriction += "AND property.regn_id in " + toSQLRestrString(regn_id);
    						}
    						if (valueExistsNotEmpty(state_id)) {
    						restriction += "AND property.state_id in " + toSQLRestrString(state_id);
    						}
    						if (valueExistsNotEmpty(city_id)) {
    						restriction += "AND property.city_id in " + toSQLRestrString(city_id);
    						}
    						if (valueExistsNotEmpty(site_id)) {
    						restriction += "AND property.site_id in " + toSQLRestrString(site_id);
    						}
					    	if (valueExistsNotEmpty(pr_id)) {
							restriction += " AND property.pr_id in " + toSQLRestrString(pr_id);
							}
							restriction += ") ";
							break;
				}

    	}
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
		this.fromYear = $('console_cost.year').value;
        this.toYear = $('console_cost.toyear').value;

		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';
		this.restriction_actual = restriction + " AND (${sql.yearOf('cost_tran.date_due')} &gt;= '"+ this.fromYear +"' AND ${sql.yearOf('cost_tran.date_due')} &lt;= '"+this.toYear+"') "; 
		this.restriction_sched = restriction + " AND (${sql.yearOf('cost_tran_sched.date_due')} &gt;= "+ this.fromYear +" AND ${sql.yearOf('cost_tran_sched.date_due')} &lt;= '"+this.toYear+"') ";
		restriction += " AND ((cost_tran_recur.date_start &gt;=${sql.date('"+dateStart+"')} AND cost_tran_recur.date_start &lt;=${sql.date('"+dateEnd+"')}) ";
		restriction += " OR (cost_tran_recur.date_end &gt;=${sql.date('"+dateStart+"')} AND cost_tran_recur.date_end &lt;=${sql.date('"+dateEnd+"')}) ";
		restriction += " OR (cost_tran_recur.date_start &lt;${sql.date('"+dateStart+"')} AND cost_tran_recur.date_end &gt;${sql.date('"+dateEnd+"')}) ) ";
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
