var chgbkWizardController = View.createController('chgbkWizardCtrl',{

	regexYear: /\d{4}/,
	fromYear: null,
	toYear: null,
	restriction: null,
	excludeCostCat_title:'',
	showCostCat_title:'',
	m_costCat:'',
	
	afterViewLoad:function(){
		this.setLabel();	
		var recs = View.dataSources.get("dsYearsChgbk").getRecords();
        var fromyear_select = $('console_ls.year');
        var toyear_select = $('console_ls.toyear');
        this.populateYearSelectLists(recs, fromyear_select, false);
        this.populateYearSelectLists(recs, toyear_select, true);
		this.tabsChargeBack.addEventListener('afterTabChange', afterTabChange);
	},
	afterInitialDataFetch: function(){
		var restriction = new Ab.view.Restriction();
		var restriction3 = new Ab.view.Restriction();
		restriction.addClause('cost_tran.cost_tran_id', '', 'IS NULL');
		restriction3.addClause('cost_tran_sched.cost_tran_sched_id', '', 'IS NULL');
		View.controllers.get('chgbkCostToChgbkCtrl').gridCostToChgbk.refresh(restriction);
		View.controllers.get('chgbkCostToApproveCtrl').gridCostToApprove.refresh(restriction3);
		View.controllers.get('chgbkCostExceptionCtrl').gridExceptions.refresh(restriction);
		View.controllers.get('chgbkCostApprovedCtrl').gridCostApproved.refresh(restriction);
	},
	setLabel: function(){
    	this.excludeCostCat_title = getMessage('exclude_cost_cat_of_0')+' '+getMessage('exclude_cost_cat_of_1');
    	this.showCostCat_title = getMessage('show_cost_cat_of_0')+' '+getMessage('show_cost_cat_of_1');
		
		setButtonLabels(new Array('excludeAddCostCategory','excludeClearCostCategory'), new Array('add','clear'));
		setButtonLabels(new Array('showAddCostCategory','showClearCostCategory'), new Array('add','clear'));

	   	$('projectionTypeLs_label').innerHTML = getMessage('projectionType_ls');
    	$('projectionTypeBl_label').innerHTML = getMessage('projectionType_bl');
    	$('projectionTypeAc_label').innerHTML = getMessage('projectionType_ac');
    	$('projectionTypeProperty_label').innerHTML = getMessage('projectionType_pr');
    	$('projectionTypeDp_label').innerHTML = getMessage('projectionType_dp');
		$('exclude_cost_cat_of_label').innerHTML = '&#160;'+getMessage('exclude_cost_cat_of_0')+'<br/>'+getMessage('exclude_cost_cat_of_1');
		$('show_cost_cat_of_label').innerHTML = '&#160;'+getMessage('show_cost_cat_of_0')+'<br/>'+getMessage('show_cost_cat_of_1');
		$('show_cost_associated_with_label').innerHTML = getMessage('show_cost_associated_with_0')+'<br/>'+getMessage('show_cost_associated_with_1');
	},
	consoleRestriction_onFilter:function(){
		this.restriction = this.getConsoleRestriction(true);
		this.restriction += " AND NOT EXISTS(SELECT ls_id FROM ls WHERE ls_id = cost_tran.ls_id AND ls.use_as_template = 1)";
		if(this.fromYear>this.toYear){
        	View.showMessage(getMessage('year_mess'));
       		return;
        }
		View.openProgressBar(getMessage('searchMessage'));
        var restrictionForApprove = replaceAll(this.getConsoleRestriction(false), 'cost_tran.', 'cost_tran_sched.');
		//refresh with restriction
		View.controllers.get('chgbkCostToChgbkCtrl').gridCostToChgbk.refresh(this.restriction);
		View.controllers.get('chgbkCostToApproveCtrl').gridCostToApprove.refresh(restrictionForApprove);
		View.controllers.get('chgbkCostExceptionCtrl').gridExceptions.refresh(this.restriction);
		View.controllers.get('chgbkCostApprovedCtrl').gridCostApproved.refresh(this.restriction);
		View.closeProgressBar();
	},
	consoleRestriction_onClear:function(){
		this.consoleRestriction.clear();
		document.getElementById('projectionTypeLease').checked = true;
		document.getElementById('cost_cat_id_ex_check').checked = false;
		document.getElementById('cost_cat_id_sh_check').checked = false;
		enableGeo();
		if(this.tabsChargeBack.getSelectedTabName()=='tabsChargeBack_2'){
			this.consoleRestriction.enableField('bl.bl_id', false);
		}
		var fromyear_select = $('console_ls.year');
        var toyear_select = $('console_ls.toyear');
		var optionIndexCurrentYear = this.getOptionIndex(fromyear_select, this.getSystemYear())
        fromyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		fromyear_select.value = this.getSystemYear();
        optionIndexCurrentYear = this.getOptionIndex(toyear_select, this.getSystemYear())
        toyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        toyear_select.value = this.getSystemYear();
	},

	getConsoleRestriction: function(isBuilding) { 
		var restriction = "";
		var costAsocWith= "";
        var record = this.consoleRestriction.getRecord();
        var radioCalculateBy = document.getElementsByName("radioCrit1");
        var ctry_id = trim(record.getValue('bl.ctry_id'));
        var regn_id = trim(record.getValue('bl.regn_id'));
        var state_id = trim(record.getValue('bl.state_id'));
        var city_id = trim(record.getValue('bl.city_id'));
        var site_id = trim(record.getValue('bl.site_id'));
        var pr_id = trim(record.getValue('property.pr_id'));
        var bl_id = "";
        if(isBuilding) {
        	bl_id = trim(record.getValue('bl.bl_id'))
        }
        var blGeoRestriction="";
        var prGeoRestriction="";
        var bl_ls_JOIN="";
        var pr_ls_JOIN="";
        var is_bl=false;
		var is_pr=false;
		var is_bl_pr=false;
        
        for(var i=0;i<radioCalculateBy.length;i++)
		{                
	        if(radioCalculateBy[i].checked)
    	    	{ 
        		restriction ="cost_tran."+ radioCalculateBy[i].value+" IS NOT NULL ";
        		costAsocWith = "cost_tran."+radioCalculateBy[i].value;
        		}
		}
		
    	if ( ((pr_id != "") || (bl_id != "") || (ctry_id != "") || (regn_id != "") || (state_id != "") || (city_id != "") || (site_id != "")) || costAsocWith != 'cost_tran.ac_id' ) {

			switch (costAsocWith)
				{
					case 'cost_tran.ls_id': 
    						if (bl_id != "") {
								blGeoRestriction += " AND bl.bl_id = '" + bl_id + "' ";
									if(pr_id == ""){
										bl_ls_JOIN=" (SELECT ls.ls_id FROM ls,bl WHERE bl.bl_id=ls.bl_id ";
										is_bl = true;
								}
    						}  
    						if (pr_id != "") {
								prGeoRestriction += " AND property.pr_id = '" + pr_id + "' ";
									if(bl_id == ""){
										pr_ls_JOIN=" (SELECT ls.ls_id FROM ls,property WHERE property.pr_id=ls.pr_id ";
										is_pr = true;
									}
								}
							if( (bl_id != "" && pr_id != "") || (bl_id == "" && pr_id == "") ){
								bl_ls_JOIN=" (SELECT ls.ls_id FROM ls,bl WHERE bl.bl_id=ls.bl_id ";
								pr_ls_JOIN=" UNION SELECT ls.ls_id FROM ls,property WHERE property.pr_id=ls.pr_id ";
								is_bl_pr = true;
							}
							if (ctry_id && trim(ctry_id) != "") {
								if(is_bl || is_bl_pr){blGeoRestriction += " AND bl.ctry_id = '" + ctry_id +"' ";}
								if(is_pr || is_bl_pr){prGeoRestriction += " AND property.ctry_id = '" + ctry_id +"' ";}
    						}
    						if (regn_id && trim(regn_id) != "") {
								if(is_bl || is_bl_pr){blGeoRestriction += " AND bl.regn_id = '" + regn_id +"' ";}
								if(pr_id != ""){prGeoRestriction += " AND property.regn_id = '" + regn_id +"' ";}
    						}
    						if (state_id && trim(state_id) != "") {
								if(is_bl || is_bl_pr){blGeoRestriction += " AND bl.state_id = '" + state_id +"' ";}
								if(is_pr || is_bl_pr){prGeoRestriction += " AND property.state_id = '" + state_id +"' ";}
    						}
    						if (city_id && trim(city_id) != "") {
								if(is_bl || is_bl_pr){blGeoRestriction += " AND bl.city_id = '" + city_id +"' ";}
								if(is_pr || is_bl_pr){prGeoRestriction += " AND property.city_id = '" + city_id +"' ";}
    						}
    						if (site_id && trim(site_id) != "") {
								if(is_bl || is_bl_pr){blGeoRestriction += " AND bl.site_id = '" + site_id +"' ";}
								if(is_pr || is_bl_pr){prGeoRestriction += " AND property.site_id = '" + site_id +"' ";}
    						}

    	   					restriction += " AND cost_tran.ls_id IN "+ bl_ls_JOIN + blGeoRestriction + pr_ls_JOIN + prGeoRestriction;
    	   					restriction += ") ";
							break;
					case 'cost_tran.bl_id': 
							restriction += " AND EXISTS(SELECT * FROM bl WHERE bl.bl_id=cost_tran.bl_id ";
							if (ctry_id && trim(ctry_id) != "") {
    							restriction += "AND bl.ctry_id = '" + ctry_id + "' ";
    						}
    						if (regn_id && trim(regn_id) != "") {
    							restriction += "AND bl.regn_id = '" + regn_id + "' ";
    						}
    						if (state_id && trim(state_id) != "") {
    						restriction += "AND bl.state_id = '" + state_id + "' ";
    						}
    						if (city_id && trim(city_id) != "") {
    						restriction += "AND bl.city_id = '" + city_id + "' ";
    						}
    						if (site_id && trim(site_id) != "") {
    						restriction += "AND bl.site_id = '" + site_id + "' ";
    						}
    	   					if (bl_id != "") {
								restriction += " AND bl.bl_id = '" + bl_id + "' ";
							}
							if (pr_id != "") {
								restriction += " AND bl.pr_id = '" + pr_id + "' ";
							}
							restriction += ") ";
							break;
					case 'cost_tran.pr_id': 
							restriction += " AND EXISTS(SELECT * FROM property WHERE property.pr_id=cost_tran.pr_id ";
							if (ctry_id && trim(ctry_id) != "") {
    							restriction += "AND property.ctry_id = '" + ctry_id + "' ";
    						}
    						if (regn_id && trim(regn_id) != "") {
    							restriction += "AND property.regn_id = '" + regn_id + "' ";
    						}
    						if (state_id && trim(state_id) != "") {
    						restriction += "AND property.state_id = '" + state_id + "' ";
    						}
    						if (city_id && trim(city_id) != "") {
    						restriction += "AND property.city_id = '" + city_id + "' ";
    						}
    						if (site_id && trim(site_id) != "") {
    						restriction += "AND property.site_id = '" + site_id + "' ";
    						}
					    	if (pr_id != "") {
							restriction += " AND property.pr_id = '" + pr_id + "' ";
							}
							restriction += ") ";
							break;
					case 'cost_tran.dp_id': 
							restriction += " AND EXISTS(SELECT * FROM dp WHERE dp.dp_id=cost_tran.dp_id AND dp.dv_id=cost_tran.dv_id) ";
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
			restriction += "AND cost_tran.cost_cat_id NOT IN ('" + cost_cat_id + "') ";
		}
		if (cost_cat_id_storage_sh != "" && check_show_cat) {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage_sh.replace(regex, "','");
			restriction += "AND cost_tran.cost_cat_id IN ('" + cost_cat_id + "') ";
		}
		this.fromYear = $('console_ls.year').value;
        this.toYear = $('console_ls.toyear').value;

		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';
		restriction += " AND ((cost_tran.date_trans_created &gt;=${sql.date('"+dateStart+"')} AND cost_tran.date_trans_created &lt;=${sql.date('"+dateEnd+"')}) ";
		restriction += " OR (cost_tran.date_paid &gt;=${sql.date('"+dateStart+"')} AND cost_tran.date_paid &lt;=${sql.date('"+dateEnd+"')}) ";
		restriction += " OR (cost_tran.date_trans_created &lt;${sql.date('"+dateStart+"')} AND cost_tran.date_paid &gt;${sql.date('"+dateEnd+"')}) ) ";
		return restriction;	
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
	getSystemYear: function() { 
		var systemDate = new Date();
		var year = systemDate.getYear();
		systemYear = year % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},
	getOptionIndex: function(select, value) {
		if(!select.options) return -1;
		for(var oNum = 0; oNum != select.options.length; oNum++) {
			if(select.options[oNum].value == value) return oNum;
		}
		return -1;
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

	clearCostCategory: function(costCateg) {
		costCateg.value = '';
	},
	
	updateCostCatStorage: function(newCostCatId , costCateg) {
		var cost_cat_id_storage = costCateg.value;
		if (cost_cat_id_storage == '') {
			cost_cat_id_storage += newCostCatId;
		}
		else {
			cost_cat_id_storage += ',' + newCostCatId;
		}
		costCateg.value = cost_cat_id_storage;
	}
});

function user_addCostCategory_ex() {
	var controller = View.controllers.get('chgbkWizardCtrl');
	controller.addCostCategory($('cost_cat_id_storage_ex'),controller.excludeCostCat_title);
}

function user_addCostCategory_sh() {
	var controller = View.controllers.get('chgbkWizardCtrl');
	controller.addCostCategory($('cost_cat_id_storage_sh'),controller.showCostCat_title);
}

function user_clearCostCategory_ex() {
	var controller = View.controllers.get('chgbkWizardCtrl');
	controller.clearCostCategory($('cost_cat_id_storage_ex'));
}

function user_clearCostCategory_sh() {
	var controller = View.controllers.get('chgbkWizardCtrl');
	controller.clearCostCategory($('cost_cat_id_storage_sh'));
}
function disableGeo(){
	this.chgbkWizardController.consoleRestriction.setFieldValue('bl.ctry_id', '');
	this.chgbkWizardController.consoleRestriction.setFieldValue('bl.regn_id', '');
	this.chgbkWizardController.consoleRestriction.setFieldValue('bl.city_id', '');
	this.chgbkWizardController.consoleRestriction.setFieldValue('bl.state_id', '');
	this.chgbkWizardController.consoleRestriction.setFieldValue('bl.site_id', '');
	this.chgbkWizardController.consoleRestriction.setFieldValue('bl.bl_id', '');
	this.chgbkWizardController.consoleRestriction.setFieldValue('property.pr_id', '');
    this.chgbkWizardController.consoleRestriction.enableField('bl.ctry_id', false);
    this.chgbkWizardController.consoleRestriction.enableField('bl.regn_id', false);
    this.chgbkWizardController.consoleRestriction.enableField('bl.city_id', false);
    this.chgbkWizardController.consoleRestriction.enableField('bl.site_id', false);
    this.chgbkWizardController.consoleRestriction.enableField('bl.state_id', false);
    this.chgbkWizardController.consoleRestriction.enableField('bl.bl_id', false);
    this.chgbkWizardController.consoleRestriction.enableField('property.pr_id', false);
}
function enableGeo(){
    var radioProperty = document.getElementById("projectionTypeProperty");
    this.chgbkWizardController.consoleRestriction.enableField('bl.ctry_id', true);
    this.chgbkWizardController.consoleRestriction.enableField('bl.regn_id', true);
    this.chgbkWizardController.consoleRestriction.enableField('bl.city_id', true);
    this.chgbkWizardController.consoleRestriction.enableField('bl.site_id', true);
    this.chgbkWizardController.consoleRestriction.enableField('bl.state_id', true);
    this.chgbkWizardController.consoleRestriction.enableField('property.pr_id', true);
    if(radioProperty.checked){
    	this.chgbkWizardController.consoleRestriction.enableField('bl.bl_id', false);
    }else{
    	this.chgbkWizardController.consoleRestriction.enableField('bl.bl_id', true);
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
function afterTabChange(tabPanel, selectedTabName){
		if(selectedTabName=='tabsChargeBack_2'){
			chgbkWizardController.consoleRestriction.enableField('bl.bl_id', false);
		}else{
			chgbkWizardController.consoleRestriction.enableField('bl.bl_id', true);
		}
}

function replaceAll(pExpressionL, pFindL, pReplacementL, pStartL, pCountL, pCasesenL)
	{
		/*
			INPUT:
				pExpressionL		:Required, Type : string, string expression containig the substring to replace;
				pFindL			:Required, Type : string, substring being searched for;
				pReplacementL	:Required, Type : string, replacement substring;
				pStartL			:Optional, Type : integer, from where start to search (default value 0);
				pCountL			:Optional, Type : integer, number of replacement to perform (default value -1)
				pCasesenL		:Optional, Type : string, if work in Case sensitivity mode ('true' / 'false' (default is 'true'))
									when Case sensitivity is set to false, result is convetered to lower case
			OUTPUT:
				pExpressionL is zero-length --> zero length string
				pExpressionL is null --> an error
				pFindL is zero-length --> copy of pExpressionL
				pReplacementL is zero-length --> copy of pExpressionL with all occurences of pFindL removed
				pStart > pExpressionL length --> zero-length string
				pCount is 0 --> copy of pExpressionL
		*/
		var vResultL;
		var vCounterL
		var vOriginalTextL;
		((pStartL == undefined)||(pStartL < 0))?pStartL=0:'';
		(pCountL == undefined)?pCountL=-1:'';
		(pCasesenL == undefined)?pCasesenL='true':'';
		if(pCasesenL=='false'){
			pExpressionL = pExpressionL.toLowerCase();
			pFindL = pFindL.toLowerCase();
			pReplacementL = pReplacementL.toLowerCase();
		}   
		((pStartL > 0)&&(pStartL > pExpressionL.length))?vOriginalTextL='':vOriginalTextL=pExpressionL.substr(pStartL);
		vCounterL = 0;
		(pCountL == -1)?pCountL=pExpressionL.length:'';
		for(;(vOriginalTextL.indexOf(pFindL) != -1)&&(vCounterL < pCountL)&&(pFindL.length > 0);){
			vOriginalTextL = vOriginalTextL.replace(pFindL, pReplacementL);
			vCounterL = vCounterL + 1;
		}
		((pStartL > 0)&&(pStartL <= pExpressionL.length))?vOriginalTextL = pExpressionL.substr(0, pStartL)+vOriginalTextL:'';
		return (vOriginalTextL);
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
		crtObj.style.width = (maxWidth+10) + "px";
	}
}
	