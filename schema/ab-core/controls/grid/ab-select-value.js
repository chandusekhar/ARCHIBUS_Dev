
/**
 * Select Value control subclasses the MiniConsole control.
 * All text columns in the Select Values control are displayed as links.
 */
Ab.grid.SelectValue = Ab.grid.MiniConsole.extend({
    
    // custom event handler called when the user selects the row
    selectValueListener: null,

    // configuration parameters
    fieldNames: null,
    selectFieldNames: null,
    visibleFieldNames: null,

	// KB 3031386 Allow configuration of visible field titles. Configuration may affectively contain ONE of either visibleFieldNames OR visibleFields
	visibleFields: null,

    actionListener: null,
    
    // 'grid' or 'multiple'
    selectValueType: null,
    
    // the parent form panel
    form: null,
    
    // allows app developers to reference custom Add New dialogs from the Select Vaue command.  Specified as a filename (ie. ab-sp-common-add-building.axvw)
    addNewDialog: null,

	// add NULL & NOT NULL values at the begining of the grid rows
	showNullFilters: false,
	
	showAddNewButton: null,

    /**
     * Constructor.
     * @param {dialog} Ext.BasicDialog 
     */
	constructor: function(dialog) {
        this.window = dialog;

        var parameters = Ab.view.View.selectValueParameters;
	    this.form = View.getControl('', parameters.formId); 
        this.fieldNames = parameters.fieldNames;

		// Configuration may affectively contain ONE of either visibleFieldNames OR visibleFields. visibleFields has priority
		if (valueExists(parameters.visibleFields)) {
			this.visibleFields = parameters.visibleFields;

			// copy fieldNames over to legacy collection
			this.visibleFieldNames = new Array();
			for (var i = 0, visibleField; visibleField = parameters.visibleFields[i]; i++) {
				this.visibleFieldNames.push(visibleField.fieldName);
			}
			parameters.visibleFieldNames = this.visibleFieldNames;
		}
		else {
	        this.visibleFieldNames = parameters.visibleFieldNames;
		}

		this.selectFieldNames = parameters.selectFieldNames;
        this.selectValueType = parameters.selectValueType;
        this.actionListener = parameters.actionListener;
		this.showNullFilters = parameters.showNullFilters;

        if (valueExists(parameters.addNewDialog)) {
        	this.addNewDialog = parameters.addNewDialog;
        }
        
        var ctx = this.createEvaluationContext();
        this.showAddNewButton = Ab.view.View.evaluateBoolean(parameters.showAddNewButton, ctx, (this.addNewDialog != null));

        // set Select Value view title
        var defaultTitle = this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_DEFAULT_TITLE);//'Select Value';
        var title = defaultTitle + ' - ' + parameters.title;
        dialog.setTitle(title);

        // convert filter values from target form field names to visible field names
        var convertedFilterValues = this.getConvertedFilterValues(parameters);
       
        // merge visible fields and select fields - get all fields from the server
        var allFieldNames = parameters.visibleFieldNames.concat(parameters.selectFieldNames);
        parameters.restriction = this.evaluateRestrictionBindings(parameters.restriction); 
           
        var configObject = new Ab.view.ConfigObject();
        configObject.setConfigParameter('buttonsPosition', 'footer');
        configObject.setConfigParameter('viewDef', new Ab.view.ViewDef(null, 0, parameters.selectTableName, toJSON(allFieldNames)));
        configObject.setConfigParameter('sortColumnID', parameters.visibleFieldNames[0]);
        configObject.setConfigParameter('indexColumnID', parameters.showIndex ? parameters.visibleFieldNames[0] : '');
        configObject.setConfigParameter('restriction', parameters.restriction);
        configObject.setConfigParameter('refreshWorkflowRuleId', parameters.workflowRuleId);
        configObject.setConfigParameter('groupIndex', 0);
        configObject.setConfigParameter('cssClassName', null);
        configObject.setConfigParameter('showOnLoad', true);
        configObject.setConfigParameter('selectionEnabled', true);
        configObject.setConfigParameter('useParentRestriction', false);
        configObject.setConfigParameter('recordLimit', parameters.recordLimit);
        configObject.setConfigParameter('applyVpaRestrictions', parameters.applyVpaRestrictions);
			
        if (valueExists(parameters.sortValues)){
       	 	configObject.setConfigParameter('sortValues', parameters.sortValues);
        }
		// KB 3029973
        else if (valueExists(parameters.sortFields)){
       	 	configObject.setConfigParameter('sortFields', parameters.sortFields);
        }
        
        if (this.selectValueType === 'multiple') {
            configObject.setConfigParameter('multipleSelectionEnabled', true);
            configObject.setConfigParameter('filterValues', convertedFilterValues);
        } else {
            configObject.setConfigParameter('multipleSelectionEnabled', false);
            configObject.setConfigParameter('filterValues', convertedFilterValues);
        }
        
        // construct the grid
        this.selectValueListener = this.afterSelectValue.createDelegate(this);
        this.isDistinct = true;

        this.inherit(dialog.body.id, configObject);
        this.isCollapsed = false;

        //XXX: 3025656
        if (valueExists(parameters.sortValues)) {
        	var sortColumns = [];
        	var tempSortValues = Ext.util.JSON.decode(parameters.sortValues);
        	//XXX: there is no way to set up ascending in select value command
        	for (var i=0; i<tempSortValues.length; i++) {
        		sortColumns.push({'fieldName':tempSortValues[i].fieldName,'ascending':true});
        	}
        	//XXX: defined in ab-reportgrid.js
        	this.sortColumns = sortColumns;
        	this.sortColumnOrder = true;        	
        }
		// KB 3029973
		else if (valueExists(parameters.sortFields)) {
			var sortColumns = [];
        	for (var i=0; i < parameters.sortFields.length; i++) {
        		sortColumns.push({'fieldName':parameters.sortFields[i].fieldName, 'ascending':parameters.sortFields[i].sortAscending});
        	}
        	this.sortColumns = sortColumns;
        	this.sortColumnOrder = true;        	
		}

        if (this.addNewDialog != null) {
            this.addAction({
            	id:'addNew', 
            	text:this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_ADD_NEW),
            	tooltip: this.getLocalizedString(Ab.grid.SelectValue.z_TOOLTIP_ADD_NEW),
				enabled: this.showAddNewButton.toString(),
            	listener: this.onAddNew.createDelegate(this)});          	
    	}
       
        if (this.selectValueType === 'multiple') {
        	 this.selectionAcrossPagesEnabled = true;
        	 if(!this.actionbar){
        		  new Ab.view.Actionbar(dialog.body.id, this);
        	 }

            this.addAction({
            	id:'saveSelected', 
            	text:this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_SAVE_SELECTED),
            	tooltip: this.getLocalizedString(Ab.grid.SelectValue.z_TOOLTIP_SAVE_SELECTED),
				enabled: '${this.getSelectedGridRows().length > 0}',
            	listener: this.onSaveSelected.createDelegate(this)});
            this.addAction({
            	id:'clear', 
            	text:this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_CLEAR), 
            	tooltip: this.getLocalizedString(Ab.grid.SelectValue.z_TOOLTIP_CLEAR),
				enabled: '${this.getSelectedGridRows().length > 0}',
            	listener: this.onClear.createDelegate(this)});
            this.addEventListener('onMultipleSelectionChange', 
            		this.onMultipleSelectionChange.createDelegate(this));
        }

        this.displaySelectValueRecords(convertedFilterValues);
        
        if(this.selectValueType === 'multiple'){
        	this.displayInitialSelection();
        }
        
		// allow saveSelected and clear actions to be enabled & disabled by OnSelectionChanged
		this.actions.each(function(action) {
            action.forceDisable(false);
        });

		// initial opening of selectValue should not show filter and index is showIndex == false (the default)
		this.showIndexAndFilter();
		
        this.setDivBodyHeight( this.determineDivBodyHeight());
        this.resizeColumnWidths();

        if (this.useScroller()) {
            this.updateScroller();
        }

        var grid = this;
        this.window.on('resize', function(window, width, height) {
            grid.updateHeight();
        });
    },
    
    /**
	 * Adds grid column definitions from data set returned from the server.
	 * @param data
	 */
	addColumnsFromData: function(data) {
        for (var visibleFieldIndex = 0; visibleFieldIndex < this.visibleFieldNames.length; visibleFieldIndex++) {
            var fieldName = this.visibleFieldNames[visibleFieldIndex];
            for (var columnIndex = 0; columnIndex < data.columns.length; columnIndex++) {
                if (data.columns[columnIndex].id === fieldName) {
                    this.addColumn(data.columns[columnIndex]);
                    break;
                }
            }
        }
    },

	/**
     * Gets Converted Filter Values.
     */
    getConvertedFilterValues: function(parameters){
    	 var convertedFilterValues = {};
         if (parameters.applyFilter && valueExists(parameters.filterValues)) {
			 // do not use lookup field values as filter values, since the user did not enter those
			 var fieldNames = [];
			 var selectFieldNames = [];
			 for (var i = 0; i < parameters.selectFieldNames.length && i < parameters.fieldNames.length; i++) {
				 if (parameters.fieldNames[i].indexOf('_lookupFor_') < 0) {
					 fieldNames.push(parameters.fieldNames[i]);
					 selectFieldNames.push(parameters.selectFieldNames[i]);
				 }
			 }

             for (var i = 0; i < selectFieldNames.length && i < fieldNames.length; i++) {
                 var fieldName = fieldNames[i];
                 var selectedFieldName = selectFieldNames[i];
     
                 var filterValue = parameters.filterValues[fieldName];
                 // KB 3027339: use the exact value (not a LIKE clause) for parent fields
 				 // KB 3031943: check all fieldNames 'cause they aren't necessarily in order (SK: they ought to be - fix in the app if they are not)
                 // KB 3042384: for single field filter, use LIKE
                 if (i <= fieldNames.length - 1 && valueExistsNotEmpty(filterValue) && (fieldNames.length > 1 || filterValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0)) {
                 	filterValue = '\"' + filterValue + '\"';
                 }
 				 // KB 3031797 multi-value parent field must become OR-ed multi-value WHERE clause on server ('"A#B"' -> '{"A","B"}')
 				 if (valueExistsNotEmpty(filterValue) && filterValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0)
 				 {
 					// NB:  if Ab.form.Form.MULTIPLE_VALUES_SEPARATOR changes, must change the following regex-es
 					if (filterValue.indexOf('\"') >= 0) {
 						filterValue = filterValue.replace(/, \u200C/gi, '\",\"');
 						filterValue = '{' + filterValue + '}';
 					}
 					else {
 						filterValue = filterValue.replace(/, \u200C/gi, ',');
 						filterValue = '{' + filterValue + '}';
 					}
 				 }

                 convertedFilterValues[selectedFieldName] = filterValue;
             }
         }
         
         return convertedFilterValues;
    },

    /**
     * Returns true if the grid should use its own scroller.
     */
    useScroller: function() {
        return true;
    },

    /**
     * Calculate div body height
     */
    calculateDivBodyHeight: function() {
        var divBodyHeight = this.inherit();

        if (!this.hasNoRecords && !View.useScroller()) {
            divBodyHeight -= this.scrollbarFactor;
        }

        return divBodyHeight;
    },

    /**
     * Evaluate Binding Expressions from select value restriction.
     */
    evaluateRestrictionBindings:function (strRestriction) {
        if (valueExistsNotEmpty(strRestriction) && typeof(strRestriction) == 'string' && strRestriction.indexOf('{') != -1) {
            var ctx = this.createEvaluationContext();
            if (!valueExistsNotEmpty(ctx['record']) && this.form) {
                ctx['record'] = this.form.getRecord().values;
            }
            // escape sql expressions, they will be parsed on server side.
            var _bindReplacement = "~1R~";
            var bindingCursor = '';
            var _sqlSubstr = '{sql';
            if (strRestriction.indexOf(_sqlSubstr) != -1) {
                bindingCursor = strRestriction.substring(strRestriction.indexOf(_sqlSubstr) - 1, strRestriction.indexOf(_sqlSubstr));
                strRestriction = strRestriction.split(bindingCursor + _sqlSubstr).join(_bindReplacement);
            }

            strRestriction = Ab.view.View.evaluateString(strRestriction, ctx);

            if (strRestriction.indexOf(_bindReplacement) != -1) {
                strRestriction = strRestriction.split(_bindReplacement).join(bindingCursor + _sqlSubstr);
            }
        }
        return strRestriction;
    },
    
    /**
     * Retrieves and displays the initial Select Value records.
     */
    displaySelectValueRecords: function(convertedFilterValues) {
        // get data records
        this.initialDataFetch();
        
     
        
        // we need to requery only if there is a single result row AND
		// all filter values exactly match the row values
		// i.e. the filter values specify one and only one existing record
        var requery = false;
        if (this.rows.length == 1 || 
			(this.showNullFilters == true && this.rows.length <= 3)) {
      
        	   if (this.form && this.selectValueType === 'multiple') {
               	if(valueExistsNotEmpty(this.form.getFieldValue(trim(this.fieldNames[this.fieldNames.length - 1])))){
               		//add rows to selectionModel
               		 for (var r = 0, row; row = this.rows[r]; r++) {
               			 this.selectionModel.add(row);
               		 }
               	}
               }
          
        	
			requery = true;
			if (this.selectValueType != 'multiple') {
				for (var name in convertedFilterValues) {
					var filterValue = convertedFilterValues[name];
					var recordValue = this.rows[0][name];
					if (filterValue !== recordValue &&
						(this.showNullFilters == false || (filterValue !== 'NULL' && filterValue !== 'NOT NULL'))) {
						requery = false;
						break;
					}
				}
			}
			// KB 3032410 if (this.selectValueType == 'multiple') 
			// requery only if there is a single result row AND all of the selectField values are selected
			else {
				for (var i=0, selectFieldName; selectFieldName = this.selectFieldNames[i]; i++) {
					var filterValue = convertedFilterValues[selectFieldName];
					if (filterValue == null) {
						requery = false;
						break;
					}
				}
			}
		}
			
        // filter values specify one and only one existing record - remove the filter and re-query
		if (requery) {
			if (this.primaryKeyIds.length > 0) {
				// we are selecting a PK value - remove the last PK field from the filter
				var lastPrimaryKeyId = this.primaryKeyIds[this.primaryKeyIds.length - 1];
				this.setFilterValue(lastPrimaryKeyId, '');
			} else {
				// we are selecting a non-PK value - remove all filter values
				this.clearAllFilterValues();
			}
			this.refresh();
		}
        // collapse the mini-console if there are less than 30 records
        this.showIndexAndFilter();

        this.updateHeight();
    },
    
    /**
     * Filter out grid columns that are not visible fields.
     */
    onInitialDataFetch: function(result) {
    	var columns = result.data.columns;
    	var visibleColumns = [];
    	for (var c = 0; c < columns.length; c++) {
    		var column = columns[c];
    		var isVisible = false;
    		
    		for (var f = 0; f < this.visibleFieldNames.length; f++) {
    			if (column.id == trim(this.visibleFieldNames[f])) {
    				isVisible = true;
    				break;
    			}
    		}
    		
    		if (isVisible) {
    			visibleColumns.push(column);

				// KB 3031386 Allow configuration of visible field titles. 
				for (var v = 0, visFld; valueExists(this.visibleFields) && (visFld = this.visibleFields[v]); v++) {				
					if (column.id == trim(visFld.fieldName) && valueExists(visFld.title)) {
						column.name = visFld.title;
						break;
					}
				}
    		}
    	}
    	result.data.columns = visibleColumns;

    	this.inherit(result);
    },

	/**
	 *	Add two rows that allow the selection of 'IS NULL' or 'IS NOT NULL' restriction
	 */
	addNullFilterRows: function() {
		var nullFilterRow = {};
		nullFilterRow[this.visibleFieldNames[0]] ='NULL';
		nullFilterRow[this.visibleFieldNames[0].key] ='NULL';

		var notNullFilterRow = {};
		notNullFilterRow[this.visibleFieldNames[0]] ='NOT NULL';
		notNullFilterRow[this.visibleFieldNames[0].key] ='NOT NULL';
			
		var rowIndex = 0;
		this.rows.splice(rowIndex++, 0, nullFilterRow);
		this.rows.splice(rowIndex++, 0, notNullFilterRow);
		for (var i = rowIndex; i < this.rows.length; i++) {
			this.rows[i].index = this.rows[i].index + 1;
		}
		
		this.updateHeader();
		this.reloadGrid();
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
	},
	
	/**
	 * Displays the initial selection:
	 * <ul>
	 * <li>If the field is empty, no rows are selected.
	 * <li>If the field has a single value, no rows are selected.
	 * <li>If the field has multiple values, rows that match the values are checked.
 	 */
	displayInitialSelection: function() {
        if (this.form) {
        	// use the last field in the fieldNames list to set the initial selection
        	var childFieldName = trim(this.fieldNames[this.fieldNames.length - 1]);
        	var selectFieldName = trim(this.selectFieldNames[this.fieldNames.length - 1]);
        	var checkable = true;
            var allFieldValues = [];
        	for (var i = 0; i < this.fieldNames.length - 1; i++) {
                var parentFieldName = this.fieldNames[i];
                if(checkable){
                	checkable = this.form.hasFieldMultipleValues(parentFieldName);
                }
                if (this.form.hasFieldMultipleValues(parentFieldName)) {
                    var parentFieldValues = this.form.getFieldMultipleValues(parentFieldName);
                   
                    allFieldValues.push(parentFieldValues);
                } else {
                    var parentFieldValues = [];
                    parentFieldValues.push(this.form.getFieldValue(parentFieldName));
                    allFieldValues.push(parentFieldValues);
                }
        	}
        	var childFieldValues = [];
        	if (this.form.hasFieldMultipleValues(childFieldName)) {
        		childFieldValues = this.form.getFieldMultipleValues(childFieldName);
                allFieldValues.push(childFieldValues);
        	} else if (this.selectValueType === 'multiple' && this.form.getFieldValue(childFieldName)) {
				var childFieldValues = [];
				childFieldValues.push(this.form.getFieldValue(childFieldName));
                allFieldValues.push(childFieldValues);
			}
      
            this.selectMatchingRows(allFieldValues,childFieldValues, checkable);
           
		}
		
        // enable/disable the action buttons
		this.onMultipleSelectionChange();
	},
	
	/**
	 * Finds a row that matches specified field values and selects it.
	 * @param allFieldValues An array of arrays of multiple field values for all select fields.
	 * @param childFieldValues child field previously selected values as Array.
	 */
	selectMatchingRows: function(allFieldValues, childFieldValues, checkable) {
		var selected = 0;
		var parentFieldNames = this.selectFieldNames.slice(0, -1);
		var childFieldName = this.selectFieldNames[this.fieldNames.length - 1];
		
		   for (var r = 0, row; row = this.rows[r]; r++) {
			// check if the row matches at least one value per each parent field
			var allParentValuesMatch = true;
			for (var i = 0; i < parentFieldNames.length; i++) {
                // check if the row matches any of the field values for this parent field
                var parentValuesMatch= false;
                var parentValues = allFieldValues[i];
                if (parentValues) {
                    var rowValue = row.row.getFieldValue(parentFieldNames[i]);
                    for (var valueIndex = 0; valueIndex < parentValues.length; valueIndex++) {
                        if (parentValues[valueIndex] === rowValue) {
                            parentValuesMatch = true;
                            break;
                        }
                    }
                    if (!parentValuesMatch) {
                        allParentValuesMatch = false;
                    }
                }
			}

			// check if the row matches any of the child field values
			var childValueMatches = false;
            var childValues = allFieldValues[allFieldValues.length - 1];
            if (childValues) {
                var rowValue = row.row.getFieldValue(childFieldName);
                for (var valueIndex = 0; valueIndex < childValues.length; valueIndex++) {
                    if (childValues[valueIndex] === rowValue) {
                        childValueMatches = true;
                        break;
                    }
                }
            }
			
			if (allParentValuesMatch && childValueMatches) {
				this.updateSelectionModel(row, true, true);
				selected++;
			}
		   }
        //update actionbar selected indicator
    	if(this.actionbar){
    		if(this.rows.length === 0){
    			this.actionbar.updateSelected(0);
    		}else if(selected !== 0){
    			this.actionbar.updateSelected(selected);
    		}else{
    			if(checkable){
    				this.actionbar.updateSelected(childFieldValues.length);
    			}else{
    				this.actionbar.updateSelected(0);
    			}	
    		}
    	}
	},
		
	/**
	 * Called when the user selects or unselects a row. 
	 * Disables the Save Selected button if no rows are selected.  
	 */
	onMultipleSelectionChange: function() {
		var selectedRows = this.getAllSelectedRows();
		this.enableAction('saveSelected', selectedRows.length > 0);
		this.enableAction('clear', selectedRows.length > 0);
	},
	
	/**
	 * Called when the user clicks on the Add New button.
	 */
	onAddNew: function() {
		var parameters = Ab.view.View.selectValueParameters;
		var title = parameters.title;					
       	View.openDialog(this.addNewDialog, null, false, {
            x: 100,
            y: 100,
            width: 550,
            height: 400,
            title: this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_ADD_NEW) + ' ' + title,
            useAddNewSelectVDialog: true,
            closeButton: false
        });
	},
			
	/**
	 * Called when the user clicks on the Save Selected button.
	 */
	onSaveSelected: function() {
		var rows = this.getAllSelectedRows();
		this.saveSelected(rows);
	},
	
	/**
	 * Called when the user clicks on the Clear button.
	 */
	onClear: function() {
		var rows = [];
		this.saveSelected(rows);
	},
	
	/**
	 * Called when the user clicks on a row.
	 */
	afterSelectValue: function(row) {
		var rows = [];
		rows.push(row);
		this.saveSelected(rows);
	},
		
	/**
	 * After resorting or indexing ensure that previous multi-selections are checked
	 *
	 */
	afterRefresh: function() {
        this.inherit();
   
		if (this.showNullFilters) {
			this.addNullFilterRows();
		}
	},
	
	/**
	 * Saves values for selected row(s) into form fields.
	 * @param {rows} Array of Ab.grid.Row objects. If the user selected one row, the array contains a single row.
	 */
	saveSelected: function(rows) {
	    // for all selected values
	    for (var i = 0; i < this.selectFieldNames.length && i < this.fieldNames.length; i++) {
	        var fieldName = trim(this.fieldNames[i]);
	        var selectFieldName = trim(this.selectFieldNames[i]);
	        // get selected value for this field
	        var selectedValue = '';
	        var selectedValueRaw = '';
	        var selectedValueRows = [];
	        var maxValueLengthReached = false;	        
	   
            // guard for duplicate values
	        var setOfSelectedValues = {};
            
	        // there may be multiple selected values in the grid
        	for (var r = 0; r < rows.length; r++) {
        		var value = (valueExists(rows[r][selectFieldName + ".key"])) ? rows[r][selectFieldName + ".key"] : rows[r][selectFieldName];
        		var rawValue = (valueExists(rows[r][selectFieldName + ".raw"])) ? rows[r][selectFieldName + ".raw"] : '';        		
        		var row = rows[r];
        		// make sure the final value is not too long for Sybase SQL Anywhere
        		if (selectedValueRaw.length + value.length > Ab.grid.SelectValue.MAX_VALUE_LENGTH) {
        			maxValueLengthReached = true;
        			break;
        		}   		
        	
        		// prevent saving duplicate values
        		if (!valueExists(setOfSelectedValues[value])) {
        			setOfSelectedValues[value] = value;
        			
    				// add values to the list
	        		selectedValue += value;
	    	        selectedValueRaw += rawValue;
	
	    	        // add multiple value separator
	    	        selectedValue += Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
	    			selectedValueRaw += Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
	    			selectedValueRows.push(row);
    			}
        	}
        	// discard the trailing multiple value separator
            var separatorLength = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length;
        	if (selectedValue.lastIndexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) == selectedValue.length - separatorLength) {
        		selectedValue = selectedValue.slice(0, selectedValue.length - separatorLength);
        	}
        	if (selectedValueRaw.lastIndexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) == selectedValueRaw.length - separatorLength) {
        		selectedValueRaw = selectedValueRaw.slice(0, selectedValueRaw.length - separatorLength);
        	}     	        	
        	// save the selected value to the form field
        	var saveSelectedValue = this.saveSelectedValue.createDelegate(this, [fieldName, selectedValue, selectedValueRaw, selectedValueRows]);
        	if (maxValueLengthReached) {
    			var message = 
    				this.getLocalizedString(Ab.grid.SelectValue.z_MESSAGE_MAX_VALUE_LENGTH_1) 
    				+ ' ' 
    				+ r 
    				+ ' ' 
    				+ this.getLocalizedString(Ab.grid.SelectValue.z_MESSAGE_MAX_VALUE_LENGTH_2); 
    			View.alert(message, function() {
    				saveSelectedValue();
    			});
        	} else {
        		saveSelectedValue();
        	}
	    }

	    View.closeDialog();
	},
	
	/**
	* override Component.determineHeight(el)
	* Determines the content element height to match the layout region height.
	* @param {Object} el
	*/
	determineHeight: function(el) {
		var height = 0;
		var id = this.getParentElementId();
		
		if (!valueExists(el)) {
			el = this.parentEl;
		}
		
		// get parent region panel height
		var parentRegionHeight = Ext.get(el).parent().getHeight();
		
		// adjust for title bar height
		var titleBarHeight = this.getTitlebarHeight();
		height = parentRegionHeight - titleBarHeight - 2;
		
		return height;
	},
	
	/**
	 * Saves specified value to the form field.
	 */
	saveSelectedValue: function(fieldName, selectedValue, selectedValueRaw, selectedValueRows) {
        // save selected value into opener form field (if it exists)
    	var input = null;
    	var previousValue = null;
        if (this.form) {
	        input = this.form.getFieldElement(fieldName);
	        if (input) {
	            previousValue = input.value;
	        }
        }
		
        var canSave = true;
        // optionally call custom action listener
        var fn = this.actionListener;
        if (fn != null && fn != '' && typeof(fn) != 'undefined') {
            if (!fn.call) {
                fn = window[fn];
            }
            if (fn.call) {
                var result = fn.call(window, fieldName, selectedValue, previousValue, selectedValueRaw, selectedValueRows);
                if (typeof(result) == 'boolean') {
                    canSave = result;
                }
            }
        }

        // save selected value into opener form field (if the custom action listener does not prevent it)
        if (canSave && input && valueExists(selectedValue)) {
        	this.form.setFieldValue(fieldName, selectedValue, null, false)
         
            // set the value tooltip
            this.form.setFieldTooltip(fieldName, selectedValue);

            afm_form_values_changed = true;
        }
	}
},
{
	// Sybase SQL Anywhere does not support more than 126 characters in the LIKE pattern.
	// Reserve 2 characters for leading and trailing %.
	MAX_VALUE_LENGTH: 124,
	
	// @begin_translatable
	z_TITLE_DEFAULT_TITLE: 'Select Value',
	z_TITLE_SAVE_SELECTED: 'Save Selected',
	z_TITLE_CLEAR: 'Clear',
    z_TOOLTIP_SAVE_SELECTED: 'Save selected values into the field',
    z_TOOLTIP_CLEAR: 'Clear all values from the field',
    z_MESSAGE_MAX_VALUE_LENGTH_1: 'You have selected too many values. Only the first',
    z_MESSAGE_MAX_VALUE_LENGTH_2: 'values will be used. <br/>To include all records in the search do not select any values for this field.',
	z_MESSAGE_DATE_FORMAT_ERROR: 'Date format error',
	z_MESSAGE_DATE_FORMAT_ERROR_DETAILS: 'Selected date is not in expected format:',
	z_MESSAGE_DIFFERENT_PARENT_VALUES: 'Can not save.  Parent values must be the same for all selected records.',
	z_TITLE_ADD_NEW: 'Add New',
    z_TOOLTIP_ADD_NEW: 'Add new select values'	
	// @end_translatable

});

