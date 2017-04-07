
/**
 * Select Value control subclasses the MiniConsole control.
 * All text columns in the Select Values control are displayed as links.
 */
AFM.grid.SelectValue = AFM.grid.MiniConsole.extend({
    
    // custom event handler called when the user selects the row
    selectValueListener: null,
    
    /**
     * Constructor.
     */
	constructor: function(controlId, configObject) {
	    this.selectValueListener = configObject.getConfigParameterIfExists('selectValueListener');
	    this.isDistinct = true;
	    this.isCollapsed = false;

		configObject.setConfigParameter('groupIndex', 0);
		configObject.setConfigParameter('cssClassName', null);
		configObject.setConfigParameter('showOnLoad', true);
		configObject.setConfigParameter('selectionEnabled', true);
		configObject.setConfigParameter('multipleSelectionEnabled', false);
		configObject.setConfigParameter('useParentRestriction', false);
		this.inherit(controlId, configObject);

		// miniconsole constructor no longer calls WFR directly, use initialDataFetch to complete construction of header, columns, etc. after receiving them from WFR
    },
	
	/**
	 * Overrides Grid.beforeBuild() to change column type to 'link'.
	 */
	beforeBuild: function() {
	    this.inherit();

		if (this.selectValueListener != null) {
    		for (var c = 0; c < this.columns.length; c++) {
    			var column = this.columns[c];
    			if (column.type == 'text' || column.type == 'number') {
        			column.type = 'link';
        			column.defaultActionHandler = this.selectValueListener;
    			}
    		}	    
		}				
	}
});

/**
 * Creates and loads the Select Value control.
 */
function user_form_onload() {
    if (opener == null) {
        return;
    }
    
    var parameters = opener.AFM.view.View.selectValueParameters;

    // set Select Value view title
    var panelTitle = getPanelTitle('select-value-panel');
    if(parameters.title != ""){
     	panelTitle = panelTitle + ' - ' + parameters.title;
    }
    setPanelTitle('select-value-panel', panelTitle);

    // convert filter values from target form field names to visible field names
    var convertedFilterValues = new Object();
    if (parameters.applyFilter) {
        for (var i = 0; i < parameters.selectFieldNames.length && i < parameters.targetFieldNames.length; i++) {
            var targetFieldName = parameters.targetFieldNames[i];
            var selectedFieldName = parameters.selectFieldNames[i];

            var filterValue = parameters.filterValues[targetFieldName];
            convertedFilterValues[selectedFieldName] = filterValue;
        }
    }

	var configObject = new AFM.view.ConfigObject();
	configObject['viewDef'] = new AFM.view.ViewDef(null, 0, parameters.selectTableName, toJSON(parameters.visibleFieldNames));
	configObject['sortColumnID'] = parameters.visibleFieldNames[0],
	configObject['indexColumnID'] = parameters.showIndex ? parameters.visibleFieldNames[0] : '',
	configObject['restriction'] = parameters.restriction;
	configObject['filterValues'] = convertedFilterValues;
	configObject['selectValueListener'] = afterSelectValue;
	configObject['refreshWorkflowRuleId'] = parameters.workflowRuleId;

    // construct the grid
    var grid = new AFM.grid.SelectValue('select_value_grid', configObject);

    // get data records
	grid.initialDataFetch();
	
	// if we get 0 or 1 record(s), drop the last part of the primary key and re-query
    if (grid.rows.length <= 1) {
        if (grid.primaryKeyIds.length > 0) {
            var lastPrimaryKeyId = grid.primaryKeyIds[grid.primaryKeyIds.length - 1];
            grid.setFilterValue(lastPrimaryKeyId, '');
            grid.refresh();
        }
    }
    
    // collapse the mini-console if there are less than 30 records
    if (grid.rows.length < 30) {
        grid.isCollapsed = true;
	    grid.showIndexAndFilter();
    }
}

/**
 * Called when the user selects a value in the mini-console.
 */
function afterSelectValue(e, row) {
    var parameters = opener.AFM.view.View.selectValueParameters;

    // for all selected values
    for (var i = 0; i < parameters.selectFieldNames.length && i < parameters.targetFieldNames.length; i++) {
        var targetFieldName = parameters.targetFieldNames[i];
        var selectedFieldName = parameters.selectFieldNames[i];

        // get selected value
        var selectedValue = row[selectedFieldName];
        if (typeof(selectedValue) == 'undefined') {
            selectedValue = row[selectedFieldName + ".key"];
        }

        // save selected value into opener form field (if it exists)
        var input = opener.$(targetFieldName, false);
        if (input != null) {
            var previousValue = input.value;
        }

        var canSave = true;
        // optionally call custom action listener
        var fn = parameters.actionListener;
        if (fn != null && fn != '' && typeof(fn) != 'undefined') {
            if (!fn.call) {
                fn = opener[fn];
            }
            if (fn.call) {
                var result = fn.call(opener, targetFieldName, selectedValue, previousValue);
                if (typeof(result) == 'boolean') {
                    canSave = result;
                }
            }
        }
        
        // save selected value into opener form field (if the custom action listener does not prevent it)
        if (canSave && input != null && selectedValue != null && typeof(selectedValue) != 'undefined') {
	    if(input.value != selectedValue)
			opener.afm_form_values_changed = true;
            input.value = selectedValue;
            
        }
    }

    opener.AFM.view.View.closeDialog();
}