var controller = View.createController('calculateCashCost', {

    regexYear: /\d{4}/,
    fromDate: null,
    toDate: null,
    restriction_actual: null,
    restriction_sched: null,
    excludeCostCat_title: '',
    showCostCat_title: '',
    m_costCat: '',
    showOverdue: false,

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

    afterViewLoad: function () {
        this.setLabel();

        this.isMcAndVatEnabled = (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1);
        if (this.isMcAndVatEnabled) {
        	this.displayVAT.type = 'total';
            this.displayCurrency.type = 'budget';
            this.displayCurrency.code = this.view.project.budgetCurrency.code;
            this.displayCurrency.exchangeRateType = 'Budget';
        }
    },
    
    afterInitialDataFetch: function () {
    	this.setConsoleStartDate();
    },

    setLabel: function () {
        this.excludeCostCat_title = getMessage('exclude_cost_cat_of').replace('{0}', ' ');

        setButtonLabels(new Array('addCostCategory_ex', 'clearCostCategory_ex'), new Array('add', 'clear'));

        $('exclude_cost_cat_of_label').innerHTML = '&#160;' + getMessage('exclude_cost_cat_of').replace('{0}', '<br/>');

    },
    
    //From Date should be January 1 for the year that is 10 years prior to the current year
    setConsoleStartDate: function () {
    	var fromDateObject = new Date();
    	fromDateObject.setFullYear(fromDateObject.getFullYear() - 10);
    	fromDateObject.setMonth(0);
    	fromDateObject.setDate(1);
    	var fromDate = this.recurringCostGrid.getDataSource().formatValue("cost_tran_recur.date_end", fromDateObject, false);
    	View.panels.get('console').setFieldValue('fromDate', fromDate);
    },

    console_onFilter: function () {
        setVATAndMCVariables(this);
        var restriction_tab_recur = this.getConsoleRestriction();
        //verify: from date < to date
        var fromdate = new Date(this.fromDate);
        var todate = new Date(this.toDate);
        if (DateMath.before(todate, fromdate)) {
            View.showMessage(getMessage('date_mess'));
            return;
        }
        var restriction_tab_sched = this.restriction_sched.replace(/cost_tran_recur/g, "cost_tran_sched");
        var restriction_tab_actual = this.restriction_actual.replace(/cost_tran_recur/g, "cost_tran");

        //send restriction
        this.recurringCostGrid.addParameter('consoleRestriction', restriction_tab_recur);

        this.scheduledCostUpper.addParameter('consoleRestriction', restriction_tab_sched);
        this.scheduledCostLower.addParameter('consoleRestriction', restriction_tab_sched);

        this.actualCostUpper.addParameter('consoleRestriction', restriction_tab_actual);
        this.actualCostLower.addParameter('consoleRestriction', restriction_tab_actual);

        // add VAT & MC parameters to grids
        addVATAndMCGridsParameters(this);

        //refresh tabs
        this.recurringCostGrid.refresh();

        this.scheduledCostUpper.refresh();
        this.scheduledCostLower.refresh();
        this.actualCostUpper.refresh();
        this.actualCostLower.refresh();

        // set tabs titles and columns
        //setVATAndMCDisplay(this);
    },

    recurringCostGrid_afterRefresh: function () {
        setColumnTitles(this, this.recurringCostGrid, "cost_tran_recur");
    },

    scheduledCostUpper_afterRefresh: function () {
        setColumnTitles(this, this.scheduledCostUpper, "cost_tran_sched", true);
    },

    scheduledCostLower_afterRefresh: function () {
        setColumnTitles(this, this.scheduledCostLower, "cost_tran_sched");
    },

    actualCostUpper_afterRefresh: function () {
        setColumnTitles(this, this.actualCostUpper, "cost_tran", true);
    },

    actualCostLower_afterRefresh: function () {
        setColumnTitles(this, this.actualCostLower, "cost_tran");
    },

    console_onClear: function () {
        this.console.clear();
        document.getElementById('cost_cat_id_ex_check').checked = false;
        resetMcAndVatVariables(this, this.console);
    },

    getConsoleRestriction: function () {
        var restriction = "";
        var costAsocWith = "";
        var check_exculde_cat = document.getElementById("cost_cat_id_ex_check").checked;
        var cost_cat_id_storage_ex = trim($('cost_cat_id_storage_ex').value);

        var restrCostAsocWith = getRestrictionTaxCost(this.console);
        restriction += restrCostAsocWith;

        var check_exculde_cat = document.getElementById("cost_cat_id_ex_check").checked;
        var cost_cat_id_storage_ex = trim($('cost_cat_id_storage_ex').value);

        if (cost_cat_id_storage_ex != "" && check_exculde_cat) {
            var regex = /,/g;
            var cost_cat_id = cost_cat_id_storage_ex.replace(regex, "','");
            restriction += "AND cost_tran_recur.cost_cat_id NOT IN ('" + cost_cat_id + "') ";
        }

        this.fromDate = View.panels.get('console').getFieldValue('fromDate');
        this.toDate = View.panels.get('console').getFieldValue('toDate');
        //KB3049463
        //if no from date is specified , set value to an older one
        if (!valueExistsNotEmpty(this.fromDate)) {
        	this.fromDate = "1990-01-01";
        }
        //if no from date is specified , set value to today
        if (!valueExistsNotEmpty(this.toDate)) {
        	var today = new Date();
        	today = this.recurringCostGrid.getDataSource().formatValue("cost_tran_recur.date_end", today, false);
        	this.toDate = today;
        }

        this.restriction_actual = restriction + " AND (cost_tran.date_due >= ${sql.date('" + this.fromDate + "')} AND cost_tran.date_due <= ${sql.date('" + this.toDate + "')}) ";
        this.restriction_sched = restriction + " AND (cost_tran_sched.date_due >= ${sql.date('" + this.fromDate + "')} AND cost_tran_sched.date_due <= ${sql.date('" + this.toDate + "')}) ";
        restriction += " AND ((cost_tran_recur.date_start >= ${sql.date('" + this.fromDate + "')} AND cost_tran_recur.date_start <= ${sql.date('" + this.toDate + "')}) ";
        restriction += " OR (cost_tran_recur.date_end >= ${sql.date('" + this.fromDate + "')} AND cost_tran_recur.date_end <= ${sql.date('" + this.toDate + "')}) ";
        restriction += " OR (cost_tran_recur.date_start < ${sql.date('" + this.fromDate + "')} AND cost_tran_recur.date_end > ${sql.date('" + this.toDate + "')}) ) ";

        return restriction;
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
        grid.gridRows.each(function (row) {
            var value = row.getRecord().getValue(fieldName);
            // if we have this value in the list, select the row
            if (valueExists(valuesMap[value])) {
                row.select();
            }
        });
    },

    getSelectedItems: function (grid, fieldName) {
        var values = '';
        grid.gridRows.each(function (row) {
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

    addCostCategory: function (costCat, title_label) {
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

    formSelectValueMultiple_grid_onAddSelected: function () {
        // get selected cost categories from the grid
        var values = this.getSelectedItems(this.formSelectValueMultiple_grid, 'cost_cat.cost_cat_id');
        $(this.m_costCat).value = values;

        this.formSelectValueMultiple_grid.closeWindow();
    },

    clearCostCategory: function (costCat) {
        $(costCat).value = '';
    },

    updateCostCatStorage: function (newCostCatId, costCat) {
        var cost_cat_id_storage = $(costCat).value;
        if (cost_cat_id_storage == '') {
            cost_cat_id_storage += newCostCatId;
        }
        else {
            cost_cat_id_storage += ',' + newCostCatId;
        }
        $(costCat).value = cost_cat_id_storage;
    },

    getOptionIndex: function (select, value) {
        if (!select.options) return -1;
        for (var oNum = 0; oNum != select.options.length; oNum++) {
            if (select.options[oNum].value == value) return oNum;
        }
        return -1;
    }
});

function showOverdue(panelName, tableName) {
	View.controllers.get('calculateCashCost').showOverdue = !View.controllers.get('calculateCashCost').showOverdue;
	var panel = View.panels.get(panelName);
	var showOverdue = View.controllers.get('calculateCashCost').showOverdue;
	var overdueRestriction = showOverdue ? "date_due <= ${sql.currentDate} AND date_paid IS NULL" : "1=1";
	
	var titleAction = showOverdue ? getMessage("showAll") : getMessage("showOverdueOnly");
	panel.addParameter('overdue', overdueRestriction);
	var action = panel.actions.get('showOverdue').setTitle(titleAction);
    View.panels.get(panelName).refresh();
    if (showOverdue)  {
	   panel.setTitle( panel.getTitle() + " - " + getMessage("overdue")); 
    } 
}

function user_addCostCategory_ex() {
    var controller = View.controllers.get('calculateCashCost');
    controller.addCostCategory('cost_cat_id_storage_ex', controller.excludeCostCat_title);
}

function user_clearCostCategory_ex() {
    var controller = View.controllers.get('calculateCashCost');
    controller.clearCostCategory('cost_cat_id_storage_ex');
}

function changeYear(amount, fieldId) {
    var controller = View.controllers.get('calculateCashCost');
    controller.changeYear(amount, fieldId);
}


function setButtonLabels(arrButtons, arrLabels) {
    var maxLabelIndex = -1;
    var maxLabelLength = -1;
    var maxWidth = 0;
    for (var i = 0; i < arrLabels.length; i++) {
        var crtText = getMessage(arrLabels[i]);
        if (crtText.length > maxLabelLength) {
            maxLabelLength = crtText.length;
            maxLabelIndex = i;
        }
    }
    // set label for maxLabelIndex
    var objButton = document.getElementById(arrButtons[maxLabelIndex]);
    objButton.value = getMessage(arrLabels[maxLabelIndex]);
    maxWidth = objButton.clientWidth;
    for (var i = 0; i < arrButtons.length; i++) {
        var crtObj = document.getElementById(arrButtons[i]);
        crtObj.value = getMessage(arrLabels[i]);
        crtObj.style.width = maxWidth + 10;
    }
}

/**
 * Get restriction for Show Tax Costs from console
 * @param console
 * @returns restriction
 */
function getRestrictionTaxCost(console) {
    var ctry_id = getConsoleFieldValue(console, 'bl.ctry_id');
    var regn_id = getConsoleFieldValue(console, 'bl.regn_id');
    var state_id = getConsoleFieldValue(console, 'bl.state_id');
    var city_id = getConsoleFieldValue(console, 'bl.city_id');
    var site_id = getConsoleFieldValue(console, 'bl.site_id');
    var pr_id = getConsoleFieldValue(console, 'property.pr_id');
    var parcel_id = getConsoleFieldValue(console, 'parcel.parcel_id');
    var bl_id = getConsoleFieldValue(console, 'bl.bl_id');

    var blGeoRestriction = "";
    var prGeoRestriction = "";
    var restriction = "";

    if (valueExistsNotEmpty(bl_id) || valueExistsNotEmpty(ctry_id)
        || valueExistsNotEmpty(regn_id) || valueExistsNotEmpty(state_id) || valueExistsNotEmpty(city_id)
        || valueExistsNotEmpty(site_id)) {

        restriction += " AND EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=cost_tran_recur.bl_id ";
        if (valueExistsNotEmpty(ctry_id)) {
            restriction += "AND bl.ctry_id IN " + toSQLRestrString(ctry_id);
        }
        if (valueExistsNotEmpty(regn_id)) {
            restriction += "AND bl.regn_id IN " + toSQLRestrString(regn_id);
        }
        if (valueExistsNotEmpty(state_id)) {
            restriction += "AND bl.state_id IN " + toSQLRestrString(state_id);
        }
        if (valueExistsNotEmpty(city_id)) {
            restriction += "AND bl.city_id IN " + toSQLRestrString(city_id);
        }
        if (valueExistsNotEmpty(site_id)) {
            restriction += "AND bl.site_id IN " + toSQLRestrString(site_id);
        }
        if (valueExistsNotEmpty(bl_id)) {
            restriction += " AND bl.bl_id IN " + toSQLRestrString(bl_id);
        }
        restriction += ") ";
    }
    if (valueExistsNotEmpty(pr_id) || valueExistsNotEmpty(parcel_id)) {
    	if (valueExistsNotEmpty(pr_id)) {
        	restriction += " AND cost_tran_recur.pr_id IN " + toSQLRestrString(pr_id);
        }
        if (valueExistsNotEmpty(parcel_id)) {
            restriction += " AND EXISTS(SELECT 1 FROM parcel WHERE cost_tran_recur.pr_id=parcel.pr_id AND parcel.parcel_id IN " + toSQLRestrString(parcel_id);
            restriction += ") ";
        }
    }
    return restriction;
}
