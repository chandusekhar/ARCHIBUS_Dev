/**
 * Report Grid concrete grid class works within the namespace 'grid' and extends the class: Ab.grid.Grid
 *
 * Contains functions that can be specialized by derived classes (e.g., Ab.grid.MiniConsole)
 */




Ab.grid.ReportGrid = Ab.grid.Grid.extend({
    
    // ----------------------- configuration parameters --------------------------------------------

    // name of the default WFR used to render the data
    refreshWorkflowRuleId: '',
    
	// view definition to be displayed
	viewDef: null,
	
	// if this flag set to true, the WFR returns records with distinct PK values
	isDistinct: false,

	// array of primary key ID attributes, i.e. ['rm.bl_id', 'rm.fl_id', 'rm.rm_id']
    primaryKeyIds: [],
    
    // array of field definitions for grid columns
    fieldDefs: [],
    
    // whether to display the total count of records
    showCounts: false,
    
    // whether to override the data source's "apply VPA restriction" property - used for Select Value
    applyVpaRestrictions: true,
    
    // ----------------------- control state that can be saved/restored ----------------------------
    
    // ----------------------- control state that is retained for lifetime of the control instance -

	// header row is member variable for restore of HTML on rebuild
	headerRows: [],

	// <table> element that is the parent of <thead><tbody><tfoot>, retained for lifetime of grid
	tableElement: null,
	// <thead> element that is the parent of all header rows, retained for lifetime of grid
	tableHeadElement: null,
	// <tbody> element that is the parent of all data rows, retained for lifetime of grid
	tableBodyElement: null,
	// <tfoot> element that is the parent of all footer rows, retained for lifetime of grid
	tableFootElement: null,

    
    // whether the selection indicator is enabled
    selectionEnabled: true,
    
    // 0-based index of the selected row (-1 = no row selected)
    selectedRowIndex: -1,
    
    // whether the multiple selection checkboxes should be enabled
    multipleSelectionEnabled: false,
    
	// whether to display sort indicators in columns
	sortEnabled: true,
	
	// column on which table is sorted only after user clicks header cell
	sortColumnID: '',

	// sort order for column on which table is sorted, exists before columns (& thus sortDirections array) exist
	sortColumnOrder: 1,

	// array of {sort column ID - sort order pairs} from panel configuration for initial data fetch sorting, 
	// exists before columns (& sortDirections) exist, constant over grid lifetime, sortColumnID takes precedence if it exists
	sortColumns: [],

	// collection of sortDirections ; sortColumnDirection.length == columns.length ; 0 'natural', 1 ascending, -1 descending, or '' non-sortable (e.g., button column)
	sortDirections: [],

	// action listener on sortable column header
	sortListener: null,
	// flag to workaround removeSortListener bug
	sortListening: true,

	// type of report export output ['' i.e., standard; 'PDF'; 'EXCEL' ]
	exportType: '',
	
	// optional name of the XSL-FO file
	exportFile: '',
	
	 //export reporting case with tab & its useFrame=false
    exportReportViewName: null,


	// URL of export to be fetched from server
	exportURL: '',

	// data source holds more records than are shown in table ( > RecordLimit)
	hasMoreRecords: false,
	
	hasNoRecords: false,

	recordLimit: -1,
	
	recordSet: null,
	
	// Ext.util.MixedCollection of Ab.grid.Row objects
	gridRows: null,

	// icon for sortable columns, ascending, location of graphics files completed in constructor	
	imageSortAscending: 'ab-sort-asc.png',

	// icon for sortable columns, descending, location of graphics files completed in constructor	
	imageSortDescending: 'ab-sort-desc.png',

	// icon for sortable columns, natural, location of graphics files completed in constructor	
	imageSortNatural: 'ab-sort-natl.png',

	// iinitial sort direction
	initialSortDirection: 0, // 'natural'

	userDefinedFooterHtml: null,
	
	//select value case: default sort orders like [{'fieldName':'dp.dp_id','sortOrder':1}] 
	sortValues: null,
	
	// Ab.data.Record containing total count of records and totals for numeric fields
	totals: null,
	
	// Ab.data.Record containing total count of records and average values for numeric fields
	average: null,
	
	// Ab.data.Record containing total count of records and minimum values for numeric fields
	minimum: null,
	
	// Ab.data.Record containing total count of records and maximum values for numeric fields
	maximum: null,
	
	/*
	 * Control's statistic attributes
	 * formulas: Values ['avg', 'min', 'max', 'sum'].
	 * fields: Array with field id's
	  * currencyCode: currency code for statistic rows
	 * exchangeRateType: exchange rate type
	 * currencyFields: Array with currency field id's
	 * formulaFields: array with fields that have custom formula
	 * formulaValues: array with custom formula values
	 */
	statisticAttributes: null,
	
	// name of the default WFR used to get the statistic data
	statisticWorkflowRuleId: '',
	
	scrollbarFactor: 20,
	
	//new selection model object to hold selections across pages
	selectionModel: null,
	selectionModelStore: null,
	//compatible over existing applications
	selectionAcrossPagesEnabled: false,
	
	
	/**
	 * Constructor creates 'empty' grid; sets internal data structures (columns,rows, DOM element arrays & listeners) & then calls WFR
	 *
	 * @param id
	 * @param configObject - map with keys of (at least) [viewDef, groupIndex] and possibly [cssClassName, showOnLoad, 
	 *											selectionEnabled, multipleSelectionEnabled, useParentRestriction, refreshWorkflowRuleId, sortAscending]
	 */
	constructor: function(id, configObject) {
        // call Ab.grid.Grid constructor
        this.inherit(id, configObject); 

        this.showCounts = configObject.getConfigParameter('showCounts', false);
        
        this.fieldDefs = configObject.getConfigParameter('fieldDefs', []);
        
        // set up the primary key array based on field definitions
        this.primaryKeyIds = [];
        for (var i = 0; i < this.fieldDefs.length; i++) {
            var fieldDef = this.fieldDefs[i];
            if (fieldDef.primaryKey) {
                this.primaryKeyIds.push(fieldDef.fullName);
            }
        }        
        
        var ctx = this.createEvaluationContext();
               
        var sidecarColumns = this.getSidecar().get('columns');       	        
        if(sidecarColumns && sidecarColumns.length > 0){
        	// restore selected fields from sidecar when the view loads
        	if(sidecarColumns[0].id == 'multipleSelectionColumn'){
        		sidecarColumns.shift();
        	}
        	this.columns = sidecarColumns;
        }else{
        	
        	// if there is only one clickable column, make all columns clickable as well
        	this.defaultCommands = this.getDefaultCommands(this.fieldDefs);
        	
        	// create grid columns based on field definitions
        	for (var i = 0; i < this.fieldDefs.length; i++) {
        		var fieldDef = this.fieldDefs[i];
        		
        		var column;
        		var defaultActionHandler = null;
        		// view's onclick attribute
        		if (fieldDef.defaultActionHandler) {
        			defaultActionHandler = fieldDef.defaultActionHandler;
        		}else if (fieldDef.isDocument){
        			defaultActionHandler = this.showDocumentLinkCommand.createDelegate(this);
        		}
        		
        		if (valueExistsNotEmpty(fieldDef.controlType) || this.defaultCommands) {
        			if (fieldDef.controlType == 'button') {
        				column = new Ab.grid.Column(fieldDef.id, '', 'button', defaultActionHandler, null, null, null, fieldDef.title, fieldDef.commands);
        			} 
        			else if (fieldDef.controlType == 'image') {
        				column = new Ab.grid.Column(fieldDef.id, fieldDef.title, 'image', defaultActionHandler, null, null, null, fieldDef.title, fieldDef.commands, fieldDef.imageName);
        			} 
        			else if ((fieldDef.controlType == 'link') || (this.getEventListener('onClickItem')) || this.defaultCommands) {
        				var columnType = 'link';
        				if (fieldDef.type === 'java.lang.Double' || fieldDef.type === 'java.lang.Integer') {
        					columnType = 'number_link';
        				}
        				var fieldDefCommands = (this.defaultCommands) ? this.defaultCommands : fieldDef.commands;
        				column = new Ab.grid.Column(fieldDef.id, fieldDef.title, columnType, defaultActionHandler, null, null, null, fieldDef.title, fieldDefCommands);
        			} 
        			else {
        				column = new Ab.grid.Column(fieldDef.id, fieldDef.title, fieldDef.controlType);
        			}
        		} else if (fieldDef.isDate) {
        			column = new Ab.grid.Column(fieldDef.id, fieldDef.title, 'date');
        		} else if (fieldDef.isTime) {
        			column = new Ab.grid.Column(fieldDef.id, fieldDef.title, 'time');
        		} else {
        			var columnType = 'text';
        			if (fieldDef.type === 'java.lang.Double' || fieldDef.type === 'java.lang.Integer') {
        				columnType = 'number';
        			}
        			column = new Ab.grid.Column(fieldDef.id, fieldDef.title, columnType);
        		}
        		column.fullName = fieldDef.fullName;
        		column.tooltip = fieldDef.tooltip;
        		column.enabled = fieldDef.enabled;
        		column.width = fieldDef.width;
        		column.hidden = Ab.view.View.evaluateBoolean(fieldDef.hidden, ctx, false);
        		column.javaType = fieldDef.type;
        		column.legendKey = fieldDef.legendKey;
        		column.format = fieldDef.format;
        		this.addColumn(column);
        	}
    	}  
              
        this.sortValues = configObject.getConfigParameterIfExists('sortValues');
        
        // ReportGrid always uses the ViewDef
		var viewDef = configObject.getConfigParameterIfExists('viewDef');
        if (typeof viewDef == 'string') {
			var groupIndex = configObject.getConfigParameter('groupIndex');
			var dataSourceId = configObject.getConfigParameter('dataSourceId');
            this.viewDef = new Ab.view.ViewDef(viewDef, groupIndex, null, null, dataSourceId);
        } else {
		    this.viewDef = viewDef;
        } 

		// get webApp context path from view and initialize value for sort graphics
		this.imageSortAscending = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-sort-asc.png';
		this.imageSortDescending = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-sort-desc.png';
		this.imageSortNatural = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-sort-natl.png';

		// set up column sorting
		var sortCols = configObject.getConfigParameterIfExists('sortColumns');
		if (valueExists(sortCols) && sortCols.length > 0) {
			this.sortColumns = sortCols;
			this.sortColumnOrder = sortCols[0].ascending == true ? 1 : -1;
		}
		this.sortListener = this.onClickSort;
    	//this.initializeSortDirections();

		this.applyVpaRestrictions = configObject.getConfigParameter('applyVpaRestrictions', true);
		this.sortEnabled = configObject.getConfigParameter('sortEnabled', true);
		this.selectionEnabled = configObject.getConfigParameter('selectionEnabled', true);
		this.multipleSelectionEnabled = configObject.getConfigParameterIfExists('multipleSelectionEnabled', false);
		this.refreshWorkflowRuleId = configObject.getConfigParameterNotEmpty('refreshWorkflowRuleId', Ab.grid.ReportGrid.WORKFLOW_RULE_REFRESH);
		this.recordLimit = configObject.getConfigParameter('recordLimit', -1);
		this.gridRows = new Ext.util.MixedCollection();

        this.addEventListenerFromConfig('onMultipleSelectionChange', configObject);

        this.addEventListenerFromConfig('afterGetData', configObject);
		if (!this.getEventListener('afterGetData')) {
			this.addEventListener('afterGetData', this.afterGetData);
		}
		
		if (!this.getEventListener('beforeExportReport')) {
			this.addEventListener('beforeExportReport', this.beforeExportReport);
		}
		
		// initialize statistic attributes
		this.statisticAttributes = {
				formulas: [],
				fields: [],
				currencyCode: '',
				exchangeRateType: '',
				currencyFields: [],
				formulaFields: [],
				formulaValues: []
		};
		
        // initialize grid columns        
        if (this.multipleSelectionEnabled && this.columns.length > 0) {
            this.addColumnFirst(new Ab.grid.Column(Ab.grid.ReportGrid.COLUMN_NAME_MULTIPLE_SELECTION, '', 'checkbox', 
                this.onChangeMultipleSelection.createDelegate(this)));
        }
        this.initializeColumns();
        this.selectionModelStore = {};
        this.initializeSelectionModel();
	},
	
	/**
	 * Supports the case that same grid control display different data like VDW.
	 * App should call this function by passing different stored key.
	 */
	initializeSelectionModel: function(selectionModelKey){
		if(valueExistsNotEmpty(selectionModelKey)){
			if(!(selectionModelKey in this.selectionModelStore)){
				this.selectionModelStore[selectionModelKey] = new Ab.grid.SelectionModel();
			}
			 this.selectionModel = this.selectionModelStore[selectionModelKey];
		}else{
			 this.selectionModel = new Ab.grid.SelectionModel();
		}
	},
	
	/**
	 * Get default commands.  If there is only one clickable column, make all columns clickable as well
	 */
	getDefaultCommands: function(fieldDefs) {
		var defaultCommands = null;

		var found = false;
		for (var i = 0; i < fieldDefs.length; i++) {
			var fieldDef = fieldDefs[i];
			if (valueExistsNotEmpty(fieldDef.controlType) && found) {
				return null;
			}
			if (valueExistsNotEmpty(fieldDef.controlType)){
				found = true;
				if(fieldDef.controlType == 'link'){
					defaultCommands = fieldDef.commands;
				}
			}
		}

		return defaultCommands; 
    },
    	
	/**
	 * Calls the refresh workflow rule to get grid data.
	 */
	getData: function(parameters) {
		var result = null;

		// if the WFR ID is in the activity-rule-method format, use method call
		var useMethodCall = this.refreshWorkflowRuleId.split('-').length == 3;
		if (useMethodCall) {
			result = Workflow.callMethod(this.refreshWorkflowRuleId, parameters);
		} else {
			result = Workflow.call(this.refreshWorkflowRuleId, parameters);
		}
		
		//get statistic data using custom wfr
		var statisticResult = this.getStatisticData(parameters);
		if (valueExists(statisticResult)) {
			// put statistic results to main result object
			if (valueExists(statisticResult.data.totals)) {
				result.data["totals"] = statisticResult.data.totals;
			}
			if (valueExists(statisticResult.data.maximum)) {
				result.data["maximum"] = statisticResult.data.maximum;
			}
			if (valueExists(statisticResult.data.minimum)) {
				result.data["minimum"] = statisticResult.data.minimum;
			}
			if (valueExists(statisticResult.data.average)) {
				result.data["average"] = statisticResult.data.average;
			}
		}
		
		if (useMethodCall) {
			this.handleDataSet(result);
		} else {
			this.formatDataRecords(result);
		}
		
		return result;
	},
		
	/**
	 * Get statistic data using custom WFR.
	 */
	getStatisticData: function(parameters) {
		var result = null;
		// set some parameters for WFR 
		var ds =  this.getDataSource();
		
		if (this.isShowMax() || this.isShowMin() || this.isShowAverage() || (this.isShowSum() && ds && ds.type == 'grouping') || this.isCustomTotal()) {

			if (ds && ds.type != 'grouping') {
				// totals are calculated with refresh WFR
				parameters.showTotals = false;
			} else if (ds && ds.type == 'grouping') {
				parameters.showTotals = this.isShowSum();
			}
			
			if(this.isCustomTotal()){
				parameters.showTotals = this.isShowSum();
			}
			
			parameters.statisticFields = toJSON(this.statisticAttributes.fields);
			parameters.showMax = this.isShowMax();
			parameters.showMin = this.isShowMin();
			parameters.showAvg = this.isShowAverage();
			// add additional parameters
			parameters.currencyCode = this.statisticAttributes.currencyCode;
			parameters.exchangeRateType = this.statisticAttributes.exchangeRateType;
			parameters.currencyFields = toJSON(this.statisticAttributes.currencyFields);
			parameters.formulaFields = toJSON(this.statisticAttributes.formulaFields);
			parameters.formulaValues = toJSON(this.statisticAttributes.formulaValues);
			
			result = Workflow.call(this.statisticWorkflowRuleId, parameters);
		}

		return result;
	},
	
	/**
	 * Converts the DataSet returned from a newer WFR to the older data format used by ViewHandlers. 
	 */
	handleDataSet: function(result) {
		if (valueExists(result.dataSet)) {
	        var records = [];
	        for (var i = 0; i < result.dataSet.records.length; i++) {
	            var record = this.recordToRow(result.dataSet.records[i]);
	            records.push(record);
	        }
			result.data.records = records;
			result.data.hasMoreRecords = result.dataSet.hasMoreRecords;
		}
	},
	
	/**
	 * Handles report data records. Applies field currency symbol.
	 */
	formatDataRecords: function(result) {
		var ds = this.getDataSource();
		if (valueExists(ds) && valueExists(result.data.records)) {
	        for (var i = 0; i < result.data.records.length; i++) {
	            var formattedValues = ds.formatCurrencyValues(result.data.records[i]);
	            Ext.apply(result.data.records[i], formattedValues);
	        }
	        
	        var totalsCurrency = '';
	        if (valueExists(this.statisticAttributes.currencyCode)) {
	        	totalsCurrency = this.statisticAttributes.currencyCode;
	        }
	        if (valueExists(result.data.totals)) {
	        	result.data.totals["totalsCurrency"] = totalsCurrency;
	            var formattedValues = ds.formatCurrencyValues(result.data.totals);
	            Ext.apply(result.data.totals, formattedValues);
	        }

	        if (valueExists(result.data.maximum)) {
	        	result.data.maximum["totalsCurrency"] = totalsCurrency;
	            var formattedValues = ds.formatCurrencyValues(result.data.maximum);
	            Ext.apply(result.data.maximum, formattedValues);
	        }

	        if (valueExists(result.data.minimum)) {
	        	result.data.minimum["totalsCurrency"] = totalsCurrency;
	            var formattedValues = ds.formatCurrencyValues(result.data.minimum);
	            Ext.apply(result.data.minimum, formattedValues);
	        }

	        if (valueExists(result.data.average)) {
	        	result.data.average["totalsCurrency"] = totalsCurrency;
	            var formattedValues = ds.formatCurrencyValues(result.data.average);
	            Ext.apply(result.data.average, formattedValues);
	        }
		}
	},
	
	/**
	 * Adjunct function to constructor - separated so that constructor can be inherited
	 * call WFR to get column data and load into grid via onGetDataRecords
	 */
	initialDataFetch: function() {
        if (this.showOnLoad) {
			try {
				View.log('Before initial data fetch: grid = [' + this.id + ']');

				var result = this.getData(this.getParametersForRefresh());
				
				// handle totals record
				if (valueExists(result.data.totals)) {
					this.totals = new Ab.data.Record();
					this.totals.fromJSON(result.data.totals);
				}

				// handle maximum record
				if (valueExists(result.data.maximum)) {
					this.maximum = new Ab.data.Record();
					this.maximum.fromJSON(result.data.maximum);
				}

				// handle minimum record
				if (valueExists(result.data.minimum)) {
					this.minimum = new Ab.data.Record();
					this.minimum.fromJSON(result.data.minimum);
				}

				// handle average record
				if (valueExists(result.data.average)) {
					this.average = new Ab.data.Record();
					this.average.fromJSON(result.data.average);
				}
				
				// call afterGetData for post-processing (e.g., localization of data from messages)
                var listener = this.getEventListener('afterGetData');
                if (listener) {
                    listener(this, result.data);
                }
                             
				this.onInitialDataFetch(result);			
				var data = result.data;
				   
				if (this.columns.length == 0 && valueExists(data.columns)) {
					if (this.multipleSelectionEnabled) {
						this.addColumn(new Ab.grid.Column(Ab.grid.ReportGrid.COLUMN_NAME_MULTIPLE_SELECTION, '', 'checkbox', 
							this.onChangeMultipleSelection.createDelegate(this)));
					}
					this.addColumnsFromData(data);
					this.initializeColumns();
				}

				if (data.records) {
					this.addRows(data.records);
					this.hasMoreRecords = data.hasMoreRecords;
					this.hasNoRecords = (data.records.length < 1);
				} else {
					this.hasNoRecords = true;
				}
				
				this.beforeBuild();
				this.build();
				this.afterBuild();

                this.visible = true;
                // show|hide the panel instructions
                if (this.getInstructionsEl()) {
                    this.showElement(this.getInstructionsEl(), true);
                }

				this.afterRefresh();

				View.log('After initial data fetch: grid = [' + this.id + ']');
				
			} catch (e) {
				this.handleError(e);
			}
		}
		else { // even if the panel is not shown, enable | disable titlebar actions
			var grid = this;
/*
			// enable | disable action buttons
			this.actions.each(function(action) {
				var ctx = grid.createEvaluationContext();
				var enabled = Ab.view.View.evaluateBoolean(action.enabled, ctx);
				action.forceDisable(!enabled);
			});
*/
		    // KB 3024172 make grid consistent with form, when showOnLoad=false don't show titlebar
/**/
		    this.show(this.showOnLoad);
/**/
		}
	},
    
    /**
     * Override to handle WFR results in subclasses.
     */
    onInitialDataFetch: function(result) {},
    
    /**
     * Adds grid column definitions from data set returned from the server.
     * @param data
     */
    addColumnsFromData: function(data) {
        this.addColumns(data.columns);
    },
    
    // ---------------------- grid modification API -----------------------------------------------

    /**
     * Adds new grid row based on specified data record.
     * Does not update the grid UI - call update() after adding/removing rows.
     * 
     * @param {record} Ab.data.Record
     * @param {index} 0-based index of the row to insert before. Optional, if not specified, the row is added at the end.
     */
    addGridRow: function(record, index) {
        if (record.constructor === Ab.data.Record) {
            record = this.recordToRow(record);
        }
        
        if (valueExists(index)) {
            this.rows.splice(index, 0, record);
            for (var i = index + 1; i < this.rows.length; i++) {
                this.rows[i].index = this.rows[i].index + 1;
            }
        } else {
            this.rows.push(record);
        }
    },
    
    /**
     * Removes specified grid row.
     * Does not update the grid UI - call update() after adding/removing rows.
     * 
     * @param {index} 0-based row index.
     * @return removed row object.
     */
    removeGridRow: function(index) {
        var removed = this.rows.splice(index, 1);
        for (var i = index + 1; i < this.rows.length; i++) {
            this.rows[i].index = this.rows[i].index + 1;
        }
        return removed[0];        
    },
    
    /**
     * Moves specified grid row to another index.
     * Does not update the grid UI - call update() after adding/removing rows.
     * 
     * @param {currentIndex} Index of the grid row to move.
     * @param {newIndex}     New index of the grid row.
     */
    moveGridRow: function(currentIndex, newIndex) {
        var record = this.removeGridRow(currentIndex);
        this.addGridRow(record, newIndex);
    },
    
    /**
     * Removes all grid rows.
     */
    clearGridRows: function() {
        this.rows = [];  
    },
    
    /**
     * Returns the array of Ab.grid.Column elements for all columns.
     */
    getColumns: function() {
    	return this.columns;
    },
                
    /**
     * Returns the column index by ID, or -1 if the column is not found.
     */
    findColumnIndex: function(columnId) {
    	var index = -1;
    	for (var i = 0; i < this.columns.length; i++) {
    		if (this.columns[i].id === columnId) {
    			index = i;
    			break;
    		}
    	}
    	
    	return index;
    },
    
    /**
     * Shows or hides a column specified by ID.
     * @param {columnId} Column ID.
     * @param {show} Optional, true to show the column (default), false to hide it.
     */
    showColumn: function(columnId, show) {
    	if (!valueExists(show)) {
    		show = true;
    	}

		if (typeof columnId === 'number') {
			this.columns[columnId].hidden = !show;
		} else {
			for (var i = 0; i < this.columns.length; i++) {
				if (this.columns[i].id === columnId) {
					this.columns[i].hidden = !show;
					break;
				}
			}
		}
    },
    
    /**
     * Hides a column specified by ID.
     * @param {columnId} Column ID.
     */
    hideColumn: function(columnId) {
    	this.showColumn(columnId, false);
    },

	/**
	 * Hides all columns.
	 */
	hideAllColumns: function() {
		for (var i = 0; i < this.columns.length; i++) {
			this.columns[i].hidden = true;
		}
	},
    
    /**
     * Sets the new display order for specified column. 
     * @param {columnId} Column ID.
     * @param {newIndex} New column index.
     */
    setColumnDisplayOrder: function(columnId, newIndex) {
    	var currentIndex = this.findColumnIndex(columnId);
    	if (currentIndex >= 0) {
    		var thisColumn = this.columns[currentIndex];
    		
    		// remove the column from its position
    		this.columns.splice(currentIndex, 1);
    		
    		// insert it into the new position
    		this.columns.splice(newIndex, 0, thisColumn);
    	}
    },
    
    /**
     * Sort columns by title.
     * @param {beginIndex} The first column index in the sort range.  
     * @param {endIndex} The last column index after the sort range.  
     */
    sortColumns: function(beginIndex, endIndex) {
    	var sortArray = this.columns.slice(beginIndex, endIndex);
    	
    	sortArray.sort(function (columnA, columnB) {
    		return columnA.name.localeCompare(columnB.name);
    	});

    	for (var i = beginIndex; i < endIndex; i++) {
    	    this.columns[i] = sortArray[i - beginIndex];
        }
    },
    
    /**
     * Updates the grid UI after adding/removing rows.
     */
    update: function() {
        this.updateHeader();
        this.reloadGrid();
        this.afterRefresh();
    },
    
    /**
     * Updates the grid header rows after showing/hiding/sorting columns.
     */
    updateHeader: function() {
		if (this.tableHeadElement) {
			rows = this.tableHeadElement.getElementsByTagName('tr');
		    for (var i=0, row; row = rows[0]; ) {
		        this.tableHeadElement.removeChild(row);
			}
	    	this.buildHeader(this.tableHeadElement);
        }
    },

	// ----------------------- common control API methods ------------------------------------------

    /**
     * Refreshes the control UI state.
     * Apply the restriction, if any, re-display the new data, and start from page 1
     * @param {newRecord} Ignored.
     * @param {clearRestriction} If specified and true, the current restriction is removed.
     */
    refresh: function(restriction, newRecord, clearRestriction) {
        this.beforeRefresh(restriction, newRecord);

        this.firstRecords = [];
        if (valueExists(clearRestriction) && clearRestriction == true) {
            this.restriction = null;
        }
        this.doRefresh();

        this.afterRefresh(false);
    },	
	
    /**
     * Performs refresh.
     */
    doRefresh: function() {
        // clear the selection
        this.selectedRowIndex = -1;
        
        // get and display data rows
        try {
    		var result = this.getData(this.getParametersForRefresh());

			// call afterGetData for post-processing (e.g., localization of data from messages)
            var listener = this.getEventListener('afterGetData');
            if (listener) {
                listener(this, result.data);
            }

			this.reloadGrid(result.data);
			this.exportURL = result.data.exportURL;
		} catch (e) {
		    this.handleError(e);
		}
	},
    


	/**
	* KB 3019816
	* For Yalta6 we need to provide a translatable string for hard coded strings such as 'Trade' in the following datasource query:
	* <sql dialect="generic">
	* SELECT res_type, res_id FROM 
	* ( SELECT 'Trade' AS res_type, pmp_id, pmps_id, tr_id AS res_id, hours_req AS hours_or_qty_req FROM pmpstr ) 
	* UNION ALL  
	* ( SELECT 'Part' AS res_type, pmp_id, pmps_id, part_id AS res_id, qty_required AS hours_or_qty_req FROM pmpspt ) 
	* ...
	* </sql>
	*
	* Replace record values with message values if message name starts with column name & message ends with record val
	*
	* <message name="res_type_trade" translatable="true">Trade</message>
	*
	* standard for message name is column name (separated by '_' rather than '.') + '_' + camelCased value 
	*  (e.g., for pmps.res_type -> pmps_res_type_toolType when value is Tool Type)
	*/
    afterGetData: function(reportGrid, data) {
		// message key is tbl_col_val, save tbl_col_ prefix before testing messages or iteraing over records
		var messageKeyPrefixes = reportGrid.getMsgKeyPrefixesFromColumns();

		// test messages
		if (!reportGrid.hasMessagesForColumns(messageKeyPrefixes)) {
			return;
		}

		// iterate over records and replace value where needed
		for (var r = 0, record; record = data.records[r]; r++) {
            for (var c = 0, column; column = reportGrid.columns[c]; c++) {
			    var value = record[column.id];
				if (column.hidden || !value || (typeof value != 'string') || value.length == 0) {
					continue;
				}

				// value may be multiple words and/or upCased -> camelCase the value
				var valParts = value.split(' ');
				var messageKey = valParts[0].toLowerCase();
				for (var ii = 1, part; part = valParts[ii]; ii++) {
					part = part.toUpperCase().substr(0,1) + part.toLowerCase().substr(1);
					messageKey += part;
				}
				messageKey = messageKeyPrefixes[c] + messageKey;

				// efficiency advantage over getMessage & test
				if (valueExists(View.messages[messageKey])) {
					record[column.id] = View.messages[messageKey];
				}
			}
		}
	},

	/**
	* support for afterGetData
	* return array of table_column_  column names
	*/
	getMsgKeyPrefixesFromColumns: function() {
		var messageKeyPrefixes = new Array(this.columns.length);
        for (var i = 0, column; column = this.columns[i]; i++) {
			if (column.hidden) {
				continue;
			}
			// get column name (separated by '_' rather than '.') & save as prefix for camelCased value as key to getMessage()
			var columnId = valueExists(column.fullName) ? column.fullName : column.id;
			var columnNames = columnId.split('.');
			messageKeyPrefixes[i] = columnNames[0] + '_' + columnNames[1] + '_';
		}
		return messageKeyPrefixes;
	},


	/**
	* support for afterGetData
	* test whether any message starts with a column name before going thru all the records
	*/
	hasMessagesForColumns: function(messageKeyPrefixes) {
		// test whether any view message starts with a column name 
		var hasMsgForColumn = false;
		for (msg in View.messages) {
			if (hasMsgForColumn) {
				break;
			}
			for (var m=0,colName; colName = messageKeyPrefixes[m]; m++) {
				if (msg.indexOf(colName) == 0) {
					hasMsgForColumn = true;
					break;
				}
			}
		}
		return hasMsgForColumn;
	},

    afterRefresh: function(updateHeight) {
        // after rebuilding the rows, auto-wire row-level event handlers to view controllers
        var panel = this;
        View.controllers.each(function (controller) {
            controller.autoWireGridRows(panel);
        });
        
        // clear the Check All checkbox
        var checkAllEl = Ext.get(this.id + '_checkAll');
        if (valueExists(checkAllEl)) {
            checkAllEl.dom.checked = false;
        }
        
		if (this.actionbar && !this.selectionAcrossPagesEnabled) {
			this.actionbar.updateSelected(0);
		}
        
        this.inherit();

		if (!valueExists(updateHeight)) {
			updateHeight = true;
		}
		if (updateHeight) {
			this.updateHeight();
		}
    },
    
    /**
     * Removes the grid table content. 
	 * Retains the thead tbody and tfoot elements for refresh / showPanel
     */
    clear: function() {       
		if (null == this.parentElement) {
			return false;
		}
		this.removeRowsFromTable();
    },
	
	/**
	 * rebuild the table, reusing the header bar
	 * 
	 */
	reloadGrid: function(resultData) {
		if (this.actionbar && !this.selectionAcrossPagesEnabled) {
				this.actionbar.updateSelected(0);
		}
        // data object containing essential members returned by WFR as stored in the grid
        var data = this.getReloadDataFromGrid(resultData);

		if (this.tableHeadElement == null) {
            this.beforeBuild();
            this.build();
            this.afterBuild();
		}

		this.rows = new Array();
		// assign new records to rows data member
		this.addRows(data.records);
		// clear children of <thead>, <tbody> & <tfoot>
		this.removeRowsFromTable();
		// recreate/reattach grid header rows
		this.rebuildHeader(this.tableHeadElement, data);
		// create grid data rows
		this.createDataRows(this.tableBodyElement, this.columns);
		// create grid footer rows
		this.buildFooterRows(this.tableFootElement, data);
		
		this.displayHeaderRows();
					
		// hide the panel if there are no records
        if (!this.showIfNoData && data.records.length == 0) {
            this.show(false, true);
        }
		else {
			this.show(true);
		}

		// Component.show() also calls updateHeight()
		// this.updateHeight();
    },
    
	/**
	 * on refresh re-add the previously constructed header row(s) to the table
	 */
	rebuildHeader: function(parentElement, data) {
		// add pre-header rows, any custom rows
		this.buildPreHeaderRows(parentElement);
		// reload old header row(s) if no mods were added. HOW TO DETECT USER MOD ?? in miniConsole compare grid.indexEntries w/ data.index
		for (var i=0; i < this.headerRows.length; i++) {
			parentElement.appendChild(this.headerRows[i]);
		}
	},

	/**
	 * Return a data object similar to that returned by the WFR, but just containing the data necessary for reloadGrid()
	 *
	 * The function reloadGrid() should be called with the data object returned rom the WFR
	 * When customizing the grid or using hard-coded data reloadGrid() must be called with a client-code-constructed data object
	 * 
	 */
	getReloadDataFromGrid: function(resultData) {
        // create data object using info saved from last WFR run
        var data = {};        
        if (valueExists(resultData) && valueExists(resultData.records)) {
            data.records = resultData.records;
            data.hasMoreRecords = resultData.hasMoreRecords;
        } 
		else {
            data.records = this.rows;
			data.hasMoreRecords = this.hasMoreRecords;
        }
        
        data.hasNoRecords = (data.records.length < 1);

		// handle totals record
		if (valueExists(resultData) && valueExists(resultData.totals)) {
			this.totals = new Ab.data.Record();
			this.totals.fromJSON(resultData.totals);
		}

		// handle maximum record
		if (valueExists(resultData) && valueExists(resultData.maximum)) {
			this.maximum = new Ab.data.Record();
			this.maximum.fromJSON(resultData.maximum);
		}
		
		// handle minimum record
		if (valueExists(resultData) && valueExists(resultData.minimum)) {
			this.minimum = new Ab.data.Record();
			this.minimum.fromJSON(resultData.minimum);
		}
		
		// handle average record
		if (valueExists(resultData) && valueExists(resultData.average)) {
			this.average = new Ab.data.Record();
			this.average.fromJSON(resultData.average);
		}
        
        return data;
	},

    // ----------------------- implementation methods ----------------------------------------------

	/**
	 * Add control-specific functionality to grid columns. 
	 */
	initializeColumns: function() {
		this.initializeSortDirections();
	},

	/**
	 * Returns standardized parameters for grid's WFR
	 */
	getParameters: function(sortValue) {
		var parameters = {
			controlId:  this.id,
			viewName:   this.viewDef.viewName,
			groupIndex: this.viewDef.tableGroupIndex,
			tableName:  this.viewDef.tableName,
			fieldNames: this.viewDef.getFields(),
			isDistinct: this.isDistinct,
			sortValues: sortValue,
			showData:   true, 
			exportType: this.exportType,
			exportFile: this.exportFile,
			exportReportViewName: valueExists(this.exportReportViewName)? this.exportReportViewName : this.viewDef.viewName,
			exportTitle: this.title,
            version:     Ab.view.View.version
		};
		if (this.applyVpaRestrictions === false) {
			parameters.applyVpaRestrictions = this.applyVpaRestrictions;
		}
        if (this.restriction != null) {
            parameters.restriction = toJSON(this.restriction);
        }
		if (this.viewDef.dataSourceId != null) {
			parameters.dataSourceId = this.viewDef.dataSourceId;
		}
		if ((parameters.viewName == '' && parameters.tableName == '' && parameters.fieldNames == '' ) && 
			 this.columns.length > 0) {
			parameters.tableName = this.columns[0].id.split('.', 1)[0];
			parameters.fieldNames = this.getFieldNamesParameterFromColumns();
		}
		if (this.recordLimit >= 0) {
			parameters.recordLimit = this.recordLimit;
		}
		if (!parameters.groupIndex) {
			parameters.groupIndex = '0';
		}

		parameters.showTotals = (this.isShowTotals() || this.isShowCounts());
		parameters.showCounts = this.isShowCounts();

        Ext.apply(parameters, this.parameters);

        return parameters;
	},


	/**
	 * Return the WFR parameters for refresh of the grid
	 * Derived classes override this to specialize refresh()
	 * 
	 */
	getParametersForRefresh: function() {
		return this.getParameters( this.getCurrentSortValues() );
	},

	/**
	 * Returns true if the grid should display totals for one or more fields.
	 */
	isShowTotals: function() {
		var result = false;
		
		// totals are not supported for grouping data sources
		var ds = this.getDataSource();
		if (ds && ds.type != 'grouping') {
		    for (var i = 0; i < this.fieldDefs.length; i++) {
		        var fieldDef = this.fieldDefs[i];
		        if (fieldDef.showTotals) {
		        	result = true;
		        	break;
		        }
		    }
		}
		
		return result;
	},
		
	/**
	 * Returns true if the grid should display the total record count.
	 */
	isShowCounts: function() {
		return this.showCounts;
	},
		
	/**
	 * Return the sort values needed by the workflow rule using the current sorting direction
	 *
     */
	getCurrentSortValues: function() {
		var sortElems = [];
		if (this.sortEnabled) {
			if (valueExistsNotEmpty(this.sortColumnID)) {
				if (this.hasFilterConfiguration(this.sortColumnID)) {
					var customFields = this.getFilterConfigurationFields(this.sortColumnID);
					for (var i=0; i<customFields.length; i++) {
						sortElems.push({'fieldName': customFields[i], 'sortOrder': this.sortColumnOrder});				
					}
				} else {
					sortElems.push({'fieldName': this.sortColumnID, 'sortOrder': this.sortColumnOrder});					
				}
			} else if (this.sortColumns && this.sortColumns.length > 0 && typeof this.sortColumns[0] != 'function') {
				for (var i=0, sc; sc = this.sortColumns[i]; i++) {
					sortElems.push({'fieldName': sc.fieldName, 'sortOrder': (sc.ascending == true) ? 1 : -1});
				}
			} else if(valueExistsNotEmpty(this.sortValues)) {
				//XXX: select value case
				return this.sortValues;
			}
		}
		return toJSON(sortElems);
	},

	/**
	 * Return a JSONArray of fieldNames suitable for the WFR parameter 
	 * as an alternative to defining the dataSource through the view
     */
	getFieldNamesParameterFromColumns: function() {
		var fieldNameArray = new Array();
		for (var i=0, col; col = this.columns[i]; i++) {
			fieldNameArray.push(col.id);
		}
		return toJSON(fieldNameArray);
	},

    /**
	 * Set the style class and/or attributes of the parent DIV and grid TABLE.
	 */
	updateHeight: function() {
		this.inherit();
		
		if (this.scroller && this.scroller.el.length > 0 && this.selectValueType == null) {
			this.setScrollerToPosition(0);
		}

		var headerTable = Ext.get(this.headerTableElement);
		if (headerTable) {
			headerTable.addClass(this.cssClassName);
			if (this.format === 'table') {
			    headerTable.addClass('panelReportAutoWidth');
			}
		}
		
		// body
		var table = Ext.get(this.tableElement);
		if (table) {
			table.addClass(this.cssClassName);
			//table.addClass('panelReport100Width');
			if (this.format === 'table') {
			    table.addClass('panelReportAutoWidth');			    
			}		
		}	

		// footer
		var footerTable = Ext.get(this.footerTableElement);
		if (footerTable) {
			footerTable.addClass(this.cssClassName);	
			if (this.format === 'table') {
			    footerTable.addClass('panelReportAutoWidth');
			}
		}

        // KB 3039173: height can be NaN in IE8
        var height = this.determineDivBodyHeight();
        if (height === 'auto' || !isNaN(height)) {
            this.setDivBodyHeight(height);
        }

		this.resizeColumnWidths();

        // if the panel is not displayed in a dialog (dialogs have their own scrollers)
        if (this.useScroller() && (height === 'auto' || height > Ab.grid.ReportGrid.MIN_SCROLLING_HEIGHT)) {
            this.updateScroller();
        } else {
            // even if there are multiple panels in the same region, and the grid should not have full scroller,
            // do display the horizontal scroller
            this.updateScroller({
                verticalScrolling: false,
                // but do not display horizontal scroller if the grid has no records
                horizontalScrolling: this.hasScrollingHeight()
            });
        }
        
        if (this.scroller && this.scroller.el.length > 0 && this.selectValueType == null) {
    		this.setScrollerToPosition(this.divHeadElement.scrollLeft);        	
        }
	},

    /**
     * Returns true if the grid should use its own scroller, i.e. in these cases:
     * - if the grid is the only panel in the layout region;
     * - if the grid is the last panel in the layout region;
     * - if the grid is the last panel in the tab;
     * - if the grid is hidden and will be displayed in a dialog.
     */
    useScroller: function() {
        return valueExists(this.window) ||
            (this.ownsLayoutRegion() && this.hasScrollingHeight()) ||
            (this.lastInLayoutRegion() && this.hasScrollingHeight()) ||
            this.lastInTab() ||
            this.singleVisiblePanel() ||
            this.hidden;
    },

    /**
     * Creates the scroller instance and attaches it to this panel.
     */
    createScroller: function(scrollableEl, scrollerOptions) {
        this.inherit(scrollableEl, scrollerOptions);

        var grid = this;
        this.scroller.setOnHorizontalScroll(function(x) {
            grid.divHeadElement.scrollLeft = x;
            grid.divFootElement.scrollLeft = x;
        });
    },

    /**
     * Returns true if the grid has sufficient body height to display the scroller.
     */
    hasScrollingHeight: function() {
        var hasScrollingHeight = false;

        if (this.divBodyElement) {
            var bodyHeight = Ext.get(this.divBodyElement).getHeight();
            hasScrollingHeight = (bodyHeight > Ab.grid.ReportGrid.MIN_SCROLLING_HEIGHT);
        }

        return hasScrollingHeight;
    },

    /**
	 * Set Div body height
	 * @param height
	 */
	setDivBodyHeight: function(height) {
		if (this.divBodyElement) {
            if (height != 'auto' && height < this.scrollbarFactor) {
                height = 'auto';
            }
			this.divBodyElement.style.height =  (height == 'auto') ? height : height + 'px';

            // The jssb-content DIV nested inside the body DIV is absolutely positioned.
            // This means it does not inherit the child table content height.
            // Set the height explicitly to make sure the table is visible in views
            // where multiple grids are stacked inside the same layout region.
            if (height === 'auto') {
                var tableHeight = Ext.get(this.tableElement).getHeight();
                this.divBodyElement.style.height = (tableHeight + 16) + 'px';
            }
		}
	},
		
	/**
	 * Determine div's body height based on rought width
	 */
	determineDivBodyHeight: function(){
		var divBodyHeight = 0;		
		var headerTable = Ext.get(this.headerTableElement);													
		if(headerTable){

			// reset
			this.divHeadElement.style.width =  'auto';
			this.headerTableElement.style.width =  'auto';
			this.divHeadElement.style.overflow =  'hidden';		
			//this.divHeadElement.style.overflowX = 'auto';
			this.divFootElement.style.width =  'auto';
			this.footerTableElement.style.width =  'auto';
			this.divFootElement.style.overflow =  'hidden';		
											
			// get div body WIDTH to match scrollable el's width
			var initialScrollableElWidth = this.getScrollableEl().dom.scrollWidth;
			var newDivHeadWidth = initialScrollableElWidth;
			var newHeaderTableWidth = initialScrollableElWidth;
			var newFooterTableWidth = initialScrollableElWidth;
			var newDivBodyWidth = initialScrollableElWidth;
			var newTableWidth = initialScrollableElWidth;		

			// get initial shrunken widths
			var initialShrunkTableHeadElementWidth = this.headerTableElement.scrollWidth;
			var initialShrunkTableElementWidth = this.tableElement.scrollWidth;	
			var initialShrunkTableFootElementWidth = this.footerTableElement.scrollWidth;
			var stretchedWidth = initialScrollableElWidth;
			var newScrollableElWidth = stretchedWidth;

			// determine if there is enough room to add a vertical scrollbar in the data--and have contents fit without a horizontal scrollbar?
			var potentialDataVertScrollableFactor = 0;
			if((Math.max(initialShrunkTableElementWidth, initialShrunkTableHeadElementWidth, initialShrunkTableFootElementWidth)  + this.scrollbarFactor) < initialScrollableElWidth){

				// if so, just factor in this potential scrollbar width;  
				// doesn't really matter at this point if width is not exact, but need for calculating height
				potentialDataVertScrollableFactor = this.scrollbarFactor;
				newDivHeadWidth = initialScrollableElWidth;
				newHeaderTableWidth = initialScrollableElWidth;
				newDivBodyWidth = initialScrollableElWidth ;
				newTableWidth = initialScrollableElWidth - potentialDataVertScrollableFactor;					
			}

			// set the rough row widths
			this.divHeadElement.style.width = newDivHeadWidth + 'px';
			this.headerTableElement.style.width = (newHeaderTableWidth)+ 'px';
			if(!this.hasNoRecords  && (navigator.appVersion.toLowerCase().indexOf("MSIE 8") == -1)){				
				this.divBodyElement.style.width = (newDivBodyWidth > 0) ? (newDivBodyWidth ) + 'px' : 'auto';
				this.tableElement.style.width = (newTableWidth > 0) ? (newTableWidth) + 'px' : 'auto';	
			}
			this.footerTableElement.style.width = (newFooterTableWidth) + 'px';
						
			// now calculate the height		
			divBodyHeight = this.calculateDivBodyHeight();					
		}
							
		return divBodyHeight;	
	},

	/**
	 * Calculate div body height
	 */
	calculateDivBodyHeight: function(){
		var divBodyHeight = 'auto';
		var availableHeight = this.determineAvailableHeight();
		
		if(!this.hasNoRecords && availableHeight > 0){
			// now calculate height								
			divBodyHeight = availableHeight;
			divBodyHeight -= this.divHeadElement.scrollHeight;				//divHeadHeight
			divBodyHeight -= this.divFootElement.scrollHeight;				//divFootHeight
			divBodyHeight -= this.getScrollableEl().getPadding('tb');	//scrollElPaddingTop and bottom			
			divBodyHeight -= 2;
			if(this.actionbar){    // action bar height
				divBodyHeight -= (Ext.get(this.id + '_actionbar').getHeight() + Ext.get(this.id + '_actionbar').getPadding('tb'));   // actionbar
			}		
			var instructions = Ext.get(this.id + '_instructions'); 		// instructions
			if(instructions){
				divBodyHeight -= instructions.getHeight();  
			}
			
			if(divBodyHeight < 0){
				divBodyHeight = 'auto';
			}

            /*
             * Layout regions that only contain a single grid panel do not display scrollbars,
             * so there is no need to adjust the grid height.
             *
			if(this.ownsLayoutRegion() && Ext.get(this.id + '_layoutWrapper')){
				var containerEl = Ext.get(this.id + '_layoutWrapper').dom.parentElement;
				if(containerEl.parentElement.scrollWidth > containerEl.parentElement.clientWidth){
					divBodyHeight -= this.scrollbarFactor;
					containerEl.style.height = containerEl.parentElement.clientHeight + 'px';
				}
			}
            */
		}

		return divBodyHeight;
	},

	/**
	 * Find the index of first data row
	 */	
	getFirstRowIndex: function(){
		var rows = this.getDataRows();
		this.columnWidthRowIndex = (rows.length > 0) ? rows[0].rowIndex: -1	
		return this.columnWidthRowIndex;
	},

	/**
	 * Get custom widths
	 * return array of custom widths
	 */	
	getCustomWidths: function(dataColumns, headerColumns){
		var customWidths = new Array();
		var scrollableElWidth = this.getScrollableEl().getWidth();
		for(var i=0; i<dataColumns.length; i++){
			var dataColumn = dataColumns[i];
			var width = dataColumn.width;
			
			// Handling percentages
			if(width.match(/%/)){
				width = Number(width.replace('%', ''));
				width = Math.round((this.tableElement.scrollWidth) * .01 * width);
			} 	
			customWidths.push(Number(width));
		}
		return customWidths;
	},

	/**
	 * Clear header, body, and footer widths
	 */		
	clearGridWidths: function(headerColumns, dataColumns, footerColumns){
		// reset
		this.divHeadElement.style.width = 'auto';
		this.headerTableElement.style.width = 'auto';
		this.divBodyElement.style.width = 'auto';
		this.tableElement.style.width = 'auto';	
		this.divFootElement.style.width = 'auto';
		this.footerTableElement.style.width = 'auto';	
		this.nestedBodyDiv.style.width = 'auto';
						
		for(var i=0; i<headerColumns.length; i++){
			if(i==0 && this.multipleSelectionEnabled){
				dataColumns[i].style.width = '22px';
				headerColumns[i].style.width = '22px';
			}else{
				dataColumns[i].style.width = 'auto';
				headerColumns[i].style.width = 'auto';
			}
			
		}
		for(var j=0; j<footerColumns.length; j++){
			if(footerColumns[j]){
				if(j==0 && this.multipleSelectionEnabled){
					footerColumns[j].style.width = '22px';
				}else{
					footerColumns[j].style.width = 'auto';
				}
				if(footerColumns[j].id && Ext.get(footerColumns[j].id)){
					Ext.get(footerColumns[j].id).removeClass('lastFooterCell');		
				}
			}	
		}	
	},

	/**
	 * Resize column widths
	 */	
	resizeColumnWidths: function() {
		if(this.tableBodyElement && this.tableHeadElement){
			var ieOffset = (Ext.isIE) ? 1 : 0;

			var firstRowIndex = this.getFirstRowIndex();
			if(firstRowIndex >= 0 && this.tableBodyElement.rows[firstRowIndex]){
					var headerColumns = this.getHeaderColumns();
					var headerTable = Ext.get(this.headerTableElement);			
					var table = Ext.get(this.tableElement);	
					var dataColumns = this.tableBodyElement.rows[firstRowIndex].cells;
					
					if(headerColumns.length != dataColumns.length){
						return;
					}
					
					// the totals row isn't necessarily on the first row
					var footerRow = this.getFooterRowWithMostColumns();
					var footerColumns = (footerRow) ? footerRow.cells : [];
		
					// get custom widths
					var customColumnWidths = this.getCustomWidths(dataColumns, headerColumns);
								
					// clear
					this.clearGridWidths(headerColumns, dataColumns, footerColumns);
																		
					// get starting widths, paddings, and margins
					var headerColumnOffsets = new Array();
					var dataColumnOffsets = new Array();
					var footerColumnOffsets = new Array();
					var headerOriColumnWidths = new Array();
					var dataOriColumnWidths = new Array();																				
					var footerOriColumnWidths = new Array();
					var lastFooterOriRightOffset = 0;
					for(var i=0; i<headerColumns.length; i++){

						var headerColumn= Ext.get(headerColumns[i]);						
						if(Ext.isIE && headerColumn && headerColumn.dom.style.display == 'none'){
							headerOriColumnWidths.push(0);
							headerColumnOffsets.push(0);
							dataOriColumnWidths.push(0);
							dataColumnOffsets.push(0);
							footerColumnOffsets.push(0);
							footerOriColumnWidths.push(0);
							
						}else{
							headerOriColumnWidths.push(headerColumn.getWidth());
							var headerOffset = headerColumn.getPadding('lr') + headerColumn.getBorderWidth('lr') + ieOffset;
							headerColumnOffsets.push(headerOffset);
							
							var dataColumn= Ext.get(this.tableElement.rows[firstRowIndex].cells[i]);
							dataOriColumnWidths.push(dataColumn.getWidth());
							var dataOffset = dataColumn.getPadding('lr') + dataColumn.getBorderWidth('lr') + ieOffset;
							dataColumnOffsets.push(dataOffset);
							
							var footerColumn= Ext.get(footerColumns[i]);
							if(footerColumn){
								var footerOffset = footerColumn.getPadding('lr') + footerColumn.getBorderWidth('lr') + ieOffset;
								footerColumnOffsets.push(footerOffset);
								footerOriColumnWidths.push(footerColumn.getWidth());
								if(i == footerColumns.length-1){
									lastFooterOriRightOffset = footerColumn.getPadding('r');
								}
							}
						}						
					}

					// get max column width between header table and body table, whether calculated or custom widths	
					var cellWidths = new Array();
					var rowWidth = 0;
					for(var i=0; i<dataColumns.length; i++){
						var customWidth = customColumnWidths[i];
						var footerWidth = (footerColumns.length == dataColumns.length) ? footerOriColumnWidths[i] : 0;
	
						var max = Math.max(headerOriColumnWidths[i], dataOriColumnWidths[i], headerColumns[i].width, footerWidth);
						if((customWidth > 0) && customWidth > max){
							cellWidths[i] = customWidth;
						}else{
							cellWidths[i] = max;
						}
						rowWidth += cellWidths[i];						
					}

                // assign column widths to standard position(scenario0)
					for(var k=(this.multipleSelectionEnabled)? 1:0; k<headerColumns.length; k++){
						/*					
						var newHeaderColumnWidth = (cellWidths[k] - headerColumnOffsets[k] );
						var newDataColumnWidth =  (cellWidths[k] - dataColumnOffsets[k] ) ;
						var newFooterColumnWidth =  (cellWidths[k] - footerColumnOffsets[k] ) ;
						*/

						// minimum cell width is 0						
						var newHeaderColumnWidth = ((cellWidths[k] - headerColumnOffsets[k]) <= 0) ? 0 : (cellWidths[k] - headerColumnOffsets[k] );
						var newDataColumnWidth =  ((cellWidths[k] - dataColumnOffsets[k] ) <= 0) ? 0 : (cellWidths[k] - dataColumnOffsets[k] ) ;
						var newFooterColumnWidth =  ((cellWidths[k] - footerColumnOffsets[k] ) <= 0) ? 0 : (cellWidths[k] - footerColumnOffsets[k] ) ;	
					
						headerColumns[k].style.width =  (newHeaderColumnWidth) + 'px';
						dataColumns[k].style.width = (newDataColumnWidth) + 'px';
						if(footerColumns.length == headerColumns.length){						
							footerColumns[k].style.width = (newFooterColumnWidth) + 'px';	
						} 
					}		
					
					// assign row widths to the header and body, just assume there is a vertical scrollbar for body
					//this.headerTableElement.style.width = Number(rowWidth ) + 'px';

					this.tableElement.style.width = Number(rowWidth) + 'px';
					var lastColumnIndex = headerColumns.length -1;
					var lastHeaderColumn = headerColumns[lastColumnIndex];
					this.headerTableElement.style.width = Number(rowWidth+this.scrollbarFactor ) + 'px';
					this.footerTableElement.style.width = Number(rowWidth+this.scrollbarFactor ) + 'px';
					lastHeaderColumn.style.width = (newHeaderColumnWidth+this.scrollbarFactor) + 'px';
					if(footerColumns.length > 0){
						var lastFooterColumn = footerColumns[footerColumns.length-1];
						lastFooterColumn.style.width = (footerColumns.length == 1) ? Number(rowWidth+this.scrollbarFactor):(newFooterColumnWidth+this.scrollbarFactor) + 'px';
						if(this.divBodyElement.scrollHeight > this.divBodyElement.clientHeight){							
							lastFooterColumn.style.width = (footerColumns.length == 1) ? Number(rowWidth + lastFooterOriRightOffset):(newFooterColumnWidth + lastFooterOriRightOffset) + 'px';	
							Ext.get(lastFooterColumn.id).addClass('lastFooterCell');
						}	
					}
															
					// determine if there is a difference from standard position					
					var scrollableEl = this.getScrollableEl();
					var headerTableElement = this.headerTableElement;
					var tableElement = this.tableElement;
					var max = Math.max(headerTableElement.scrollWidth, tableElement.scrollWidth);
					var lastDataColumn = dataColumns[lastColumnIndex];
					var scrollableVsMaxDifference = scrollableEl.dom.scrollWidth - max;

					// scenario1: when the grid is stretched from standard position
					if(scrollableVsMaxDifference > 0){
						// for <table> elements, can just add the scrollable difference
						this.headerTableElement.style.width = Number(rowWidth + this.scrollbarFactor + scrollableVsMaxDifference ) + 'px';
						this.tableElement.style.width = Number(rowWidth + scrollableVsMaxDifference) + 'px';
						this.footerTableElement.style.width = Number(rowWidth + this.scrollbarFactor + scrollableVsMaxDifference) + 'px';	
						
						// for <th> and <td> elements, evenly spread this difference through columns
						var columnOffset = scrollableVsMaxDifference / headerColumns.length;													
						for(var k=(this.multipleSelectionEnabled)? 1 : 0; k<headerColumns.length; k++){
							var newHeaderColumnWidth = (cellWidths[k] - headerColumnOffsets[k] );
							var newDataColumnWidth =  (cellWidths[k] - dataColumnOffsets[k] ) ;
							var newFooterColumnWidth =  (cellWidths[k] - footerColumnOffsets[k] ) ;
							headerColumns[k].style.width =  (newHeaderColumnWidth+columnOffset) + 'px';
							dataColumns[k].style.width = (newDataColumnWidth+columnOffset) + 'px';
							if(footerColumns.length == headerColumns.length){						
								footerColumns[k].style.width = (newFooterColumnWidth+columnOffset) + 'px';
							}	
						}
						
						// account for scrollbars, but add only to last column
						lastHeaderColumn.style.width = (newHeaderColumnWidth+this.scrollbarFactor + columnOffset) + 'px';
						
						if(footerColumns.length == headerColumns.length){
							if(this.divBodyElement.scrollHeight > this.divBodyElement.clientHeight){
								lastFooterColumn.style.width = (newFooterColumnWidth + lastFooterOriRightOffset + columnOffset) + 'px';
							}else{
								lastFooterColumn.style.width = (newFooterColumnWidth + this.scrollbarFactor + columnOffset) + 'px';
							}
						}
												
						if(this.divBodyElement.scrollHeight > this.divBodyElement.clientHeight){
							lastDataColumn.style.width = (newDataColumnWidth + columnOffset) + 'px';
												
							// selectV issue
							var headerDifference = this.divHeadElement.scrollWidth - this.headerTableElement.scrollWidth;
							if(headerDifference > 0){
								this.headerTableElement.style.width = Number(rowWidth + this.scrollbarFactor + scrollableVsMaxDifference + headerDifference) + 'px';
								this.tableElement.style.width = Number(rowWidth + scrollableVsMaxDifference + headerDifference) + 'px';
							}														
							var footerDifference = this.divFootElement.scrollWidth - this.footerTableElement.scrollWidth;
							if(footerDifference > 0){
								this.footerTableElement.style.width = Number(rowWidth + this.scrollbarFactor + scrollableVsMaxDifference + footerDifference) + 'px';
							}		
						}else{
                            if (this.scroller) {
                                this.tableElement.style.width = Number(rowWidth + scrollableVsMaxDifference) + 'px';
                                lastDataColumn.style.width = (newDataColumnWidth + columnOffset) + 'px';
                            } else {
                                this.tableElement.style.width = Number(rowWidth + scrollableVsMaxDifference + this.scrollbarFactor - 1) + 'px';
                                lastDataColumn.style.width = (newDataColumnWidth + columnOffset + this.scrollbarFactor) + 'px';
                            }
						}							
					
					// scenario2: when the grid is shrunk from standard position and there are scrollbars												
					} else if(scrollableVsMaxDifference < 0){

						// synchronize scroll position
						this.scrollHeaderAndFooter();
						var divBodyHeight = this.calculateDivBodyHeight();
						//this.setDivBodyHeight(this.calculateDivBodyHeight());

						// re-adjust height									
						this.setDivBodyHeight(divBodyHeight);
						if(this.ownsLayoutRegion() && Ext.get(this.id + '_layoutWrapper')){
							var containerEl = Ext.get(this.id + '_layoutWrapper').dom.parentElement;
							if(containerEl.parentElement.scrollWidth > containerEl.parentElement.clientWidth){				
								//this.setDivBodyHeight(divBodyHeight-this.scrollbarFactor);
								this.headerTableElement.style.width = Number(rowWidth+this.scrollbarFactor) + 'px';
								if(containerEl.parentElement){
									if((containerEl.parentElement.scrollHeight > containerEl.parentElement.clientHeight)){
										containerEl.style.height = containerEl.parentElement.clientHeight + 'px';
									}
								}
							}
						} else {
							this.setDivBodyHeight(divBodyHeight);
						}
						
						// for grids where there's no vertical scrollbar and the header is too wide
						//if((this.divBodyElement.scrollHeight - this.divBodyElement.clientHeight <= 0)){
						if((this.divBodyElement.scrollHeight - this.divBodyElement.clientHeight < 0)){
							lastHeaderColumn.style.width = (newHeaderColumnWidth) + 'px';
							this.headerTableElement.style.width = Number(rowWidth) + 'px';
						}else if(this.divBodyElement.scrollHeight - this.divBodyElement.clientHeight == 0){	
							if(this.divBodyElement.scrollWidth - this.divBodyElement.clientWidth > 0){
								//lastHeaderColumn.style.width = (newHeaderColumnWidth + this.scrollbarFactor) + 'px';
								this.headerTableElement.style.width = Number(rowWidth + this.scrollbarFactor) + 'px';
								this.tableElement.style.width = Number(rowWidth + this.scrollbarFactor) + 'px';
								lastDataColumn.style.width = (newDataColumnWidth + this.scrollbarFactor) + 'px';
							} else {								
								if (this.scroller && this.scroller.el.length > 0) {
									if (this.scroller.el[0].scrollHeight - this.tableElement.scrollHeight < 2) {

										//alert('b2');
										lastHeaderColumn.style.width = (newHeaderColumnWidth + this.scrollbarFactor) + 'px';
										this.headerTableElement.style.width = Number(rowWidth  + this.scrollbarFactor ) + 'px';
										lastDataColumn.style.width = (newDataColumnWidth + 2) + 'px';
										this.tableElement.style.width = Number(rowWidth + 2) + 'px';											

									} else {
										lastHeaderColumn.style.width = (newHeaderColumnWidth + this.scrollbarFactor) + 'px';
										this.headerTableElement.style.width = Number(rowWidth + this.scrollbarFactor) + 'px';
										lastDataColumn.style.width = (newDataColumnWidth + this.scrollbarFactor) + 'px';
										this.tableElement.style.width = Number(rowWidth + this.scrollbarFactor) + 'px';
									}
								} else {
									lastHeaderColumn.style.width = (newHeaderColumnWidth + this.scrollbarFactor) + 'px';
									this.headerTableElement.style.width = Number(rowWidth + this.scrollbarFactor) + 'px';
								}
							}
						} else {
							if (this.scroller && this.scroller.el[0].scrollHeight - this.tableElement.scrollHeight < 2) {								
							} else {								
								lastHeaderColumn.style.width = (newHeaderColumnWidth  + this.scrollbarFactor) + 'px';
								this.headerTableElement.style.width = Number(rowWidth  + this.scrollbarFactor) + 'px';
								lastDataColumn.style.width = (newDataColumnWidth + 2) + 'px';
								this.tableElement.style.width = Number(rowWidth + 2) + 'px';									
							}
						}																			
					}					
				}	else if(this.tableFootElement && this.tableHeadElement && this.hasNoRecords){
				
					// match footer if no body rows				
					this.headerTableElement.style.width = (Ext.get(this.divFootElement).getWidth()) + 'px';
					this.divHeadElement.style.width = (Ext.get(this.divFootElement).getWidth()) + 'px';
					this.footerTableElement.style.width = (Ext.get(this.divFootElement).getWidth()) + 'px';
				}					
				
				// if panel title bar is can be scrolled further than div body, set nested div width larger				
                // GM: KB 3038497 - by changing this.nestedBodyDiv.style.width property, horizontal scrollbar become disabled.
                // KB 3041475
				if(this.divBodyElement && this.nestedBodyDiv.style.width != ''){
                    var panelTitleEl = Ext.get(this.parentElement.id + '_head');
                    if (panelTitleEl) {
                        var panelTitle = panelTitleEl.dom;
                        if(panelTitle.scrollWidth > this.nestedBodyDiv.scrollWidth && this.nestedBodyDiv.offsetWidth != panelTitle.scrollWidth){
                            this.nestedHeaderDiv.style.width = panelTitle.scrollWidth + 'px';
                            this.nestedBodyDiv.style.width = (this.divBodyElement.scrollHeight - this.divBodyElement.clientHeight > 0) ? (panelTitle.scrollWidth - this.scrollbarFactor) + 'px' :  +  (panelTitle.scrollWidth) + 'px';
                            this.nestedFooterDiv.style.width = panelTitle.scrollWidth + 'px';
                        }
                    }
				}
			}
	},	

	getHeaderColumns: function(){
		var tableHeadElements = this.tableHeadElement.getElementsByTagName('th');
		var headerColumns = [];
		for(var i=0; i<this.columns.length; i++){
			for (var j=0, headElem; headElem = tableHeadElements[j]; j++) {
				if (headElem.id == 'sortHeader_' + i) {
					headerColumns.push(headElem);
				}
			}
		}
		return headerColumns;
	},
	
	getFooterRowWithMostColumns: function(){
		var footerRowWithMostColumns = null;
		var footerRows = this.footerTableElement.rows;
		var columns = [];
		for (var rowIndex =0; rowIndex < footerRows.length; rowIndex++){
			var cells = footerRows[rowIndex].cells;
			if(cells.length > columns.length){
				columns = cells;
				footerRowWithMostColumns = footerRows[rowIndex];
			}
		}
		return footerRowWithMostColumns;
	},

    /**
     * Returns true if the layout region can scroll the component content.
     * Override in components that either scroll their own content (e.g. grid) or scale it (e.g. drawing, map).
     */
    isScrollInLayout: function() {
        return !this.useScroller();
    },

	/**
     * Returns true if the control scrolls its own content. Override for controls that implement auto-scroll.
     */
    isAutoScroll: function() {
        // disable default component scrolling - the grid scrolls its body only
        return false;
    },

    /**
     * Returns the Ext element that can be scrolled. By default this is the panel body element.
     */
    getScrollableEl: function() {
        return Ext.get(this.divBodyElement);
    },

	// ----------------------- export report selection --------------------------------------------------
    
    /**
	 * Called by Ab.command.exportPanel in ab-command.js to have a report.
	 * 
     * @param {reportProperties} Map {outputType: this.outputType, printRestriction: this.printRestriction, orientation: this.orientation}
	 */
	callReportJob: function(reportProperties){
		var outputType = reportProperties.outputType, printRestriction = reportProperties.printRestriction, 
			orientation = reportProperties.orientation, handler = reportProperties.handler, recordLimit = reportProperties.recordLimit,
			pageSize = reportProperties.pageSize;
		
		var jobId = null;
		
		var reportTitle = this.title;
		if(reportTitle == ''){
			reportTitle = Ab.view.View.title;
		}
		var parameters = this.getParametersForRefresh();
		
		if(valueExists(handler)){
			parameters.handler = handler;
		}
		
		if(valueExists(recordLimit)){
			parameters.recordLimit = recordLimit;
		}else{
			if(valueExists(parameters.recordLimit)){
				//don't pass panel's recordLimit
				delete parameters.recordLimit;
			}
		}
		
		if(valueExists(printRestriction)){
			parameters.printRestriction = printRestriction;
		}
		
		if(outputType === 'docx' || outputType === 'pdf'){
			if(valueExistsNotEmpty(orientation)){
				parameters.orientation = orientation;
			}
			
			if(valueExistsNotEmpty(pageSize)){
				parameters.pageSize = pageSize;
			}
			
			parameters.outputType = outputType;
			
			jobId = this.callDOCXReportJob(reportTitle, this.restriction, parameters);
		}else if(outputType === 'xls'){
			jobId = this.callXLSReportJob(reportTitle, this.restriction, parameters);
		}
		
		return jobId;
	},
	/**
	 * Calls Docx report job and return job id. It's could be called by applicayions.
	 * title: report title.
	 * restriction: parsed restriction.
	 * parameters: Map parameters.
	 */
	callDOCXReportJob: function(title, restriction, parameters){
		var viewName = this.viewDef.viewName + '.axvw'; 
		return Workflow.startJob(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, viewName, this.dataSourceId, title, this.getVisibleFieldDefs(), toJSON(restriction), parameters);
	},
	/**
	 * Calls Xls report job and return job id. It's could be called by applicayions.
	 * title: report title.
	 * restriction: parsed restriction.
	 * parameters: Map parameters.
	 */
	callXLSReportJob: function(title, restriction, parameters){
		var viewName = this.viewDef.viewName + '.axvw'; 
		return Workflow.startJob(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, viewName, this.dataSourceId, title, this.getVisibleFieldDefs(), toJSON(restriction), parameters);
	},
	
	/**
	 * Gets visible field definitions as array.
	 */
	getVisibleFieldDefs: function(){
		var ctx = this.createEvaluationContext();
    	var fieldDefs = this.fieldDefs;  
    	if(fieldDefs && fieldDefs.length == 0){
    		this.getDataSource().fieldDefs.each(function (fieldDef) {
        		fieldDefs.push(fieldDef);
        	});
    	}
    
    	var visibleFieldDefs = [];
		for (var i = 0, column; column = this.columns[i]; i++) {
		     if(column.hidden){
			continue;
		     }	 
		     var field = this.getFieldDefById(fieldDefs, column.fullName, i);
		     if(valueExists(field)){
		    	 if(field.controlType === '' || field.controlType === 'color' || field.controlType === 'link' || field.controlType === 'recurring'){
		    		//XXX: evaluate field.title
			    	field.title = Ab.view.View.evaluateString(field.title, ctx, false);
			    	//XXX: column.hidden has already been evaluated and the column is shown
			    	field.hidden = "false";
			    	visibleFieldDefs.push(field);
		    	 }
		     }
		}	
		var listener = this.getEventListener('beforeExportReport');
        if (listener) {
        	visibleFieldDefs = listener(this, visibleFieldDefs);
        }
        
		return visibleFieldDefs;
    },
    
    /**
     * application could overwrite.
     */
    beforeExportReport: function(panel, visibleFieldDefs){
    	return visibleFieldDefs;
    },
   
   
    /**
     * Gets field def by its id and avoid possible duplicated field def.
     */
    getFieldDefById: function(fieldDefs, fullName, index){
    	if(index < fieldDefs.length){
	    	var field = fieldDefs[index];
	    	if(valueExists(field) && (fullName == field.fullName)){
	    		return field;
	    	}
    	}
    	//use case: manually add columns in js
    	for (var i = 0, field; field = fieldDefs[i]; i++) {
    		if(fullName === field.fullName){
    			return field;
    		}
    	}
    	
    	return null;
    },

	/**
	 * Get fieldDef from datasrouce by id.
	 */
	getDataSourceFieldDefById: function(id) {
		var ds = this.getDataSource();
		return (ds && ds.hasOwnProperty('fieldDefs')) ? ds.fieldDefs.get(id) : null;		
	},
	
	// ----------------------- multiple selection --------------------------------------------------

    /**
     * This method is called when the user selects or unselects any row.
     * @param {row} The row object.
     */
    onChangeMultipleSelection: function(row) {
    	this.updateSelectionModel(row, row.row.isSelected(), true);
    	
    	// if single checked box is unchecked, uncheck the select all checkbox
    	if(!row.row.isSelected()){
    		var checkAllEl = Ext.get(this.id + '_checkAll');
    		if (valueExists(checkAllEl)) {
    			checkAllEl.dom.checked = false;
    		}
    	}

    	if (this.actionbar) {
    		if(this.selectionAcrossPagesEnabled){
    			 this.actionbar.updateSelected(this.getAllSelectedRows().length);
    		}else{
    			 this.actionbar.updateSelected(this.getSelectedRows().length);
    		}
           
    	}
    	
    	var listener = this.getEventListener('onMultipleSelectionChange');
    	if (listener) {
    		listener(row);
    	}
    },

    /**
     * Enables or disables the Select All/Unselect All checkbox.
     * By default the checkbox is enabled if multipleSelectionEnabled = true.
     */
    enableSelectAll: function(enabled) {
        if (this.multipleSelectionEnabled) {
            var checkAllEl = Ext.get(this.id + '_checkAll');
            if (checkAllEl) {
                checkAllEl.setDisplayed(enabled);
            }
        }
    },

	//----------------------------------------sort---

	
	/**
	 * Helper function to unify testing of column as type that allows sorting
	 */
	columnTypeIsSortable: function(columnType) {
		var ret = false;
 		if (columnType == 'text' || columnType == 'number' || columnType == 'date' || columnType == 'time' || columnType == 'link' || columnType == 'number_link') {
			ret = true;
		}
		return ret;
	},

	/**
	 * Initialize the array of sortDirections to 'natural' for all columns that are sortable,
	 * unless it is specified as the sortColumn in the constructor 
	 * and to '' (i.e., unsortable) if the column is not of the proper type
	 *
	 */
	initializeSortDirections: function() {
		this.sortDirections = [];
		for (var i=0, col; col = this.columns[i]; i++) {
			this.sortDirections[i] = '';
			for (var j=0, sortCol; sortCol = this.sortColumns[j]; j++) {
				if (col.id == sortCol.fieldName) {
					this.sortDirections[i] = sortCol.ascending ? 1 : -1; 
					continue;
				}
			}
			if (this.columnTypeIsSortable(col.type) && this.sortDirections[i] == '') {
				this.sortDirections[i] = this.initialSortDirection;
			}
		}
	},

	/**
	 * Return the sort direction that comes after the input arg
	 */
	incrementSortDirection: function(input) {
		return (input == 1) ? -1 : input + 1;
	},
	
	/**
	 * bump the internal sort direction flag & the UI header indicator.
	 * reset the listener on the link for the new, next action.
	 *
	 */
	incrementHdrSortDirections: function(sortColIndex) {		
		var oldSortLink;
		var headerCells = this.headerRows[0].getElementsByTagName("th");
		// iterate over header cells. test, set sortDirections[], set image
		for (var i=0, headerCell; headerCell = headerCells[i]; i++) {
			//var headerCell = headerCells[i];
			// get column number from header cell id
			var colNumber = headerCell.id.substring(11);
			var imgLinks = headerCell.getElementsByTagName('img');
			var oldSortLink;
			if (imgLinks != null && imgLinks.length > 0) {
				oldSortLink = imgLinks[0];
			}				
			
			// if col not sortable || dir == 0 && index != sortColumnIndex -> null op
			if (colNumber == '' || (colNumber != sortColIndex && this.sortDirections[colNumber] == this.initialSortDirection)) {
				continue;
			}
			// else if index == sortColumnIndex -> increment val in sortDirections[], reset image 
			else if (colNumber == sortColIndex && oldSortLink != null) {
				var nextSortDir = this.incrementSortDirection(this.sortDirections[colNumber]);
				this.sortDirections[colNumber] = nextSortDir;
				var sortLink = this.getSortImage(nextSortDir);
				sortLink.id = 'sortLink_' + colNumber;
				headerCell.replaceChild(sortLink, oldSortLink);
 			}
			// else if col's dir != 0 && index != sortColumnIndex, reset to 0 in sortDirections[], reset image
			else if (oldSortLink != null) {
				this.sortDirections[colNumber] = this.initialSortDirection;
				var sortLink = this.getSortImage(this.initialSortDirection);
				sortLink.id = 'sortLink_' + colNumber;
				headerCell.replaceChild(sortLink, oldSortLink);
			}
		}
	},


	/**
	 * Return an img element using the glyph appropriate to current sortDirection
	 *
	 */
	getSortImage: function(dir) {
		var sortImage;
		switch (dir) {
			case 1:		// ascending
		    	sortImage = this.createImage(this.imageSortAscending, '', 4)
				break
			case -1:	// descending
   				sortImage = this.createImage(this.imageSortDescending, '', 4)
				break
			default:// 'natural'
				sortImage = this.createImage(this.imageSortNatural, '', 4)
		}
		return sortImage;
	},




	/**
	 * set the sort listener to use the header cell as 'this' 
	 * and add the miniConsole itself as the second arg to the listener function
	 *
	 */
	activateSortListener: function(sortHeaderCell, columnIndex) {
		if (this.sortListener != null && typeof this.sortListener == "function") {
		    var delegate = this.sortListener.createDelegate(this, [columnIndex]);
			Ext.fly(sortHeaderCell).addListener("click", delegate);
		}
	},

	/**
	 * Remove any click listener on the given DOM element
	 */
	removeSortListener: function(sortHeaderCell) {
		if (this.sortListener != null && typeof this.sortListener == "function") {
		    Ext.fly(sortHeaderCell).removeListener("click", this.sortListener);
		}
	},

	setScrollerToPosition: function(x) {
		if (this.scroller && this.scroller.el.length > 0) {
			// for IE8, #3044689
			try {
				this.scroller.el[0].scrollLeft = x;				
			} catch (e) {				
			}
			this.scroller.update();
		}
	},

	addOffsetToHeaderAndFooter: function(x) {
		if (this.scroller) {
			this.divHeadElement.scrollLeft = this.divHeadElement.scrollLeft + x;
			this.divFooterElement.scrollLeft = this.divFooterElement.scrollLeft + x;
		}
	},
	
	/**
	 * on click of index link send index parameters and refill the miniConsole through callback
	 *
	 */
	onClickSort: function(columnIndex) {
		if (!this.sortListening) {
			return;
		}
		
		// integer index into columns[] specifying which column to sort on
        var c = this.columns[columnIndex];
		this.sortColumnID = valueExists(c.fullName) ? c.fullName : c.id;

		var parameters = this.getParameters(this.getNextSortValues(columnIndex));
		try {

			if (this.scroller && this.scroller.el.length > 0) {
	            this.setScrollerToPosition(0);
	            this.divHeadElement.scrollLeft = this.scroller.el[0].scrollLeft;				
			}
            
			var result = this.getData(parameters);

			// call afterGetData for post-processing (e.g., localization of data from messages)
            var listener = this.getEventListener('afterGetData');
            if (listener) {
                listener(this, result.data);
            }
            
			this.reloadOnSort(result.data);
		} catch (e) {
			this.handleError(e);
		}
		this.incrementHdrSortDirections(columnIndex);
		
		this.setScrollerToPosition(0);
		this.updateHeight();			

		if (this.filterEnabled && this.filterRow && this.getFilterValues().length > 2 && columnIndex === this.columns.length -1) {
			this.setScrollerToPosition(0);
		} else {
			// anchor to sorted column's header
			window.location.hash = '#sortHeader_' + columnIndex;		
			
			this.setScrollerToPosition(this.divHeadElement.scrollLeft);							
		}

		/*
		if (this.filterEnabled && this.filterRow && this.getFilterValues().length > 2) {
			this.setScrollerToPosition(0);
		} else {
			
			var headerCells = this.headerRows[0].getElementsByTagName("th");
			for (var i=0, headerCell; headerCell = headerCells[i]; i++) {
				var imgLinks = headerCell.getElementsByTagName('img');
				if (imgLinks.length > 0 && imgLinks[0].id === ('sortLink_' + columnIndex)) {
					imgLinks[0].tabIndex = 1;
					imgLinks[0].focus();
					imgLinks[0].blur();
				}
			}

			this.setScrollerToPosition(Ext.get(this.divHeadElement).dom.scrollLeft);				
		}	
		*/		
	},

	/**
	 * Return the sort values for the WFR first incrementing the sorting column's direction
	 */
	getNextSortValues: function(sortColIndex) {
		var sortElems = new Array();
		this.sortColumnOrder = this.incrementSortDirection(this.sortDirections[sortColIndex]); 
		if (this.sortEnabled) {
			if (this.hasFilterConfiguration(this.sortColumnID)) {
				var customFields = this.getFilterConfigurationFields(this.sortColumnID);
				for (var i=0; i<customFields.length; i++) {
					sortElems.push({'fieldName': customFields[i], 'sortOrder': this.sortColumnOrder});				
				}
			} else {
				sortElems.push({'fieldName': this.sortColumnID, 'sortOrder': this.sortColumnOrder});
			}
		}
		return toJSON(sortElems);
	},

	// private
	getFilterConfigurationFields: function(columnId) {
		return this.filterConfiguration.columns[columnId].fields;
	},
	
	// ----------------------- HTML DOM building ---------------------------------------------------
	/**
	 * perform setup ops needed before building control in DOM
	 *
	 * called as part of initial WFR callback, onGetDataRecords()
	 */
	beforeBuild: function() {
		this.inherit();
	},


	/**
	 * Creates HTML DOM treee containing grid <table> element and its children.
	 */
	build: function() {
        this.clear();
        
        // KB 3023647: if the previous TABLE element exists, remove it, otherwise we will get 
        // multiple TABLE elements with the same ID
        var tableElementId = 'grid_' + this.parentElement.id;
        this.removeHtmlTable(tableElementId);
        this.removeHtmlTable(tableElementId + '_divHead');
        this.removeHtmlTable(tableElementId + '_divBody');
        this.removeHtmlTable(tableElementId + '_divFooter');
                        
		// header table
		var headerTable = document.createElement('table');
		headerTable.id = tableElementId + '_header';

		// create grid header rows, add all header rows to a THEAD element in the table
		var tHead = document.createElement('thead');
		this.tableHeadElement = tHead;
		this.headerTableElement = headerTable;
		headerTable.appendChild(tHead);
		var div = document.createElement('div');
		div.id = tableElementId + '_divHead';
		div.appendChild(headerTable);
		this.divHeadElement = div;
		
		// nested DIV required for scrolling
        this.nestedHeaderDiv = document.createElement('div');
        this.nestedHeaderDiv.appendChild(headerTable);
        div.appendChild(this.nestedHeaderDiv);
		this.parentElement.appendChild(div);

		// body table
		var table = document.createElement('table');
		table.id = tableElementId + '_body';
		this.tableElement = table;
		var div = document.createElement('div');
		div.id = tableElementId + '_divBody';

        // nested DIV required for scroller
        this.nestedBodyDiv = document.createElement('div');
        this.nestedBodyDiv.appendChild(table);
        div.appendChild(this.nestedBodyDiv);

        div.className = 'panelReport';
		div.style.overflow = 'auto';
		this.divBodyElement = div;
		this.parentElement.appendChild(div);
		//this.parentElement.appendChild(table);
		var tBody = document.createElement('tbody');
		this.tableBodyElement = tBody;
		table.appendChild(tBody);

		// footer table
		var footerTable = document.createElement('table');
		footerTable.id = tableElementId + '_footer';
		this.footerTableElement = footerTable;
		var div = document.createElement('div');
		div.id = tableElementId + '_divFooter';
		div.appendChild(footerTable);
		div.style.overflow = 'hidden';
		div.className = 'footerDiv'
		this.divFootElement = div;
		
		// nested DIV required for scrolling
        this.nestedFooterDiv = document.createElement('div');
        this.nestedFooterDiv.appendChild(footerTable);
        div.appendChild(this.nestedFooterDiv);
		this.parentElement.appendChild(div);
		var tFoot = document.createElement('tfoot');
		this.tableFootElement = tFoot;
		footerTable.appendChild(tFoot);
	
		this.headerRows = new Array();
		this.buildHeader(tHead);

		var columns = this.columns2.length > 0 ? this.columns2 : this.columns;
	
		// create grid data rows
		this.createDataRows(this.tableBodyElement, columns);
				
		// create grid footer rows, add all footer rows to a TFOOT element in the table
		this.buildFooterRows(tFoot);

		var scrollableEl = this.getScrollableEl();
		Ext.get(this.divHeadElement).on('scroll',this.scrollBodyAndFooter, this);	
		Ext.get(this.divBodyElement).on('scroll',this.scrollHeaderAndFooter, this);
		
		this.displayHeaderRows();

		// afterRefresh() calls updateHeight()
		this.updateHeight();
	},

	/**
	 * Remove HTML table if exists
	 * @param tableElementId String
	 */	
	removeHtmlTable: function(tableElementId){
		var tableEl = Ext.get(tableElementId);
        if (tableEl) {
        	tableEl.remove();
        }
	},

	/**
	 *  Scroll rest of grid according to the same position as the body
	 */	
	scrollHeaderAndFooter: function(){
		var src = this.divBodyElement;						
		this.divHeadElement.scrollLeft = src.scrollLeft;
		this.divFootElement.scrollLeft = src.scrollLeft;		
		this.scrollPanelTitle(src);
	},	

	/**
	 *  Scroll rest of grid according to same position as the header
	 */	
	scrollBodyAndFooter: function(){				
		var src = this.divHeadElement;
		this.divBodyElement.scrollLeft = src.scrollLeft;
		this.divFootElement.scrollLeft = src.scrollLeft;		
		this.scrollPanelTitle(src);
	},	
	
	/**
	 *  Scroll the panel title based on source (header or body);
	 */	
	scrollPanelTitle: function(source){
        var panelTitleEl = Ext.get(this.parentElement.id + '_head');
        if (panelTitleEl) {
            var panelTitle = panelTitleEl.dom;
            panelTitle.style.overflow = 'hidden';
            panelTitle.scrollLeft = source.scrollLeft;
        }
	},	

	/**
	 *  Do not display column headers if there are no data rows, since they are useless without data.
	 */
	displayHeaderRows: function() {
		for(var i=0; i<this.headerRows.length; i++){
			this.headerRows[i].style.display = (this.rows.length == 0) ? 'none' : '';
		}
	},
		
	/**
	 * Add the header rows to the table
	 *
	 */
	buildHeader: function(parentElement) {
		this.buildPreHeaderRows(parentElement);

		// create grid header row
		var columns = this.columns;
		this.createHeaderRow(parentElement, columns, 0);
		// create subsequent grid header rows
		if (this.columns2.length > 0) {
		    columns = this.columns2;
		    this.createHeaderRow(parentElement, columns, 1);
		}

		var listener = this.getEventListener('afterBuildHeader');
        if (listener) {
            listener(this, parentElement);
        }
	},
	
	/**
	 * Add row(s) before the table's column titles row
	 * override this method to add a row BEFORE the column titles
	 * rebuildHeader() assumes that this is dynamic data not cached in headerRows[]
	 */
	buildPreHeaderRows: function(parentElement) {
	},


	/**
	 *	Return table's tbody element.
	 *  tbody element is the container for the grid's data rows
	 */
	getTableBodyElement: function() {
		return this.tableBodyElement;
	},
	/**
	 *	Return table's thead element.
	 *  thead element is the container for the grid's column header rows, and any additional 'special' rows
	 */
	getTableHeadElement: function() {
		return this.tableHeadElement;
	},
	/**
	 *	Return table's tfoot element.
	 *  tfoot element is the container for the grid's footer rows, if they exist, but tfoot always exists after build
	 */
	getTableFootElement: function() {
		return this.tableFootElement;
	},

	

	/**
	 * Remove all rows contained in grid's tbody
	 *
	 * Deprecated, but retained for backward compatibility
	 *
	 */
	removeRowsFromTBody: function() {
		this.removeRowsFromTable();
	},
	/**
	 * Remove all rows contained in grid's three structural elements <thead>, <tbody>, and <tfoot>
	 * Clears the table, but retains its structure. Table remains with no content other than these containing elements
	 *
	 */
	removeRowsFromTable: function() {
		this.removeActionListeners();
		
		if (this.tableBodyElement) {
			jQuery(this.tableBodyElement).empty();
		}

		if (this.tableHeadElement) {
			jQuery(this.tableHeadElement).empty();
        }

		if (this.tableFootElement) {
			jQuery(this.tableFootElement).empty();
        }

        // GM: KB 3039081 - destroy scroller object and recreate them, when grid.clear() is called.
        this.clearScroller();
	},

	/**
	 * Return a valid, displayable column title
	 */
	getDisplayableTitle: function(title) {
		if (valueExistsNotEmpty(title)){
			title = title.replace(/&amp;/g, '&');
			title = title.replace(/&gt;/g, '>');
			title = title.replace(/&lt;/g, '<');
			title = title.replace(/&apos;/g, '\'');
			title = title.replace(/&quot;/g, '\"');
		}
		return title;
	},		

	/**
	 * Creates grid header row and adds it to the grid.
	 */
	createHeaderRow: function(parentElement, columns, level) {
		//var tHead = this.tableHeadElement;
		var headerRow = document.createElement('tr');
		headerRow.id = 'headerRow_' + level;
		if (this.cssHeaderClassName != '') {
			headerRow.className = this.cssHeaderClassName;
		}

		for (var c = 0, column; column = columns[c]; c++) {
		    if (column.hidden === true) continue;
		    
			var headerCell = document.createElement('th');
			headerCell.colSpan = column.colSpan;
			headerCell.id = 'sortHeader_' + c;
            if (column.width != null) {
                headerCell.style.width = column.width;
            }
			var title = this.getDisplayableTitle(column.name);
			headerCell.innerHTML = '<div>' + Ext.util.Format.ellipsis(title, 80) + '</div>';
			
            if (c == 0 && this.multipleSelectionEnabled) {
                var handler = this.onChangeMultipleSelection.createDelegate(this);
                headerCell.innerHTML = '<input id="' + this.id + '_checkAll" type="checkbox"/>';
            }
			
			this.decorateHeaderCell(level, c, column, headerCell);
			
            if (c > 0 || !this.multipleSelectionEnabled) {
			    // justify titles to match content (numbers are right justified if no sort and it's the last column or there's no filter, text left justified)
            	headerCell.className = ((column.type == 'number' || column.type == 'number_link') && !this.sortEnabled && (c < this.columns.length -1 || !this.filterEnabled)) ? 'headerTitleNumberNoSort' : 'headerTitleText';
            }
			
			headerRow.appendChild(headerCell);

		}

		// somehow parentElement gets lost in IE, reset
		if (parentElement == null) {
			parentElement = this.tableHeadElement;
		}

		parentElement.appendChild(headerRow);
		this.headerRows[level] = headerRow;
        
		// add select all/unselect all event handler
        var checkAllEl = Ext.get(this.id + '_checkAll');
        if (valueExists(checkAllEl)) {
            var panel = this;
            checkAllEl.on('click', function(event, el) {
                panel.selectAll(el.checked);
            });
        }
	},

	/**
	 * Creates additional elements within a header cell 
	 * In the case of the sortable grid this is the sort buttons
	 */
	decorateHeaderCell: function(level, c, column, headerCell) {
		if (this.sortEnabled && level == 0 && this.columnIsSortable(column)) {
			var sortLink = this.getSortImage(this.sortDirections[c]);
			sortLink.id = 'sortLink_' + c;
			// onClick function
			this.activateSortListener(headerCell, c);
    		headerCell.appendChild(sortLink);
		}
	},
	
	// private
	columnIsSortable: function(column) {
		//return (this.columnTypeIsSortable(column.type) && this.getDataSourceFieldDefById(column.fullName)) || this.hasFilterConfiguration(column.id);
		return (this.columnTypeIsSortable(column.type)) || this.hasFilterConfiguration(column.id);
	},

	// private
	hasFilterConfiguration: function(columnId) {
		return !this.getDataSourceFieldDefById(columnId) && this.filterConfiguration && this.filterConfiguration['columns'] && this.filterConfiguration.columns[columnId];
	},
	
	/**
	 * Eliminate sort image links for sort direction
	 * When constructing a grid with data that cannot be retrieved from the WFR
	 * (e.g., hard-coded data or other data that doesn't exist in the database)
	 * Sorting will not work & should be removed from the grid.
	 *
	 */
	removeSorting: function() {
		var headerCells = this.headerRows[0].getElementsByTagName("th");
		this.sortListening = false;

		// iterate over header cells. test, set sortDirections[], set image
		for (var i=0, headerCell; headerCell = headerCells[i]; i++) {
			var imgLinks = headerCell.getElementsByTagName('img');
			if (imgLinks.length > 0 && imgLinks[0].id.substr(0,8) == 'sortLink') {
					headerCell.removeChild(imgLinks[0]);
			}
		}
	},


	/**
	 * Restore sort image links for sort direction
	 *
	 */
	restoreSorting: function() {
		var headerCells = this.headerRows[0].getElementsByTagName("th");
		this.sortListening = true;

		// iterate over header cells. test, set sortDirections[], set image
		for (var i=0, headerCell; headerCell = headerCells[i]; i++) {
			// if img link exists no-op
			var imgLinks = headerCell.getElementsByTagName('img');
			if (imgLinks.length > 0 && imgLinks[0].id.substr(0,8) == 'sortLink') {
				continue;
			}
			// use old sort directions, create link add to DOM
			if (typeof this.sortDirections[i] == 'number') {
				var sortLink = this.getSortImage(this.sortDirections[i]);
				sortLink.id = 'sortLink_' + i;
				headerCell.appendChild(sortLink);
			}
		}
	},

	/**
	 * Creates all data rows and adds them to the grid.
	 * sorting, if needed, is performed on the server within the workflow rule's getData()
	 */
	createDataRows: function(parentElement, columns) {
	    this.gridRows = new Ext.util.MixedCollection();
	    var multiline = this.hasMultiline(columns);
        
		var rows = this.rows;
		var listener = this.getEventListener('onClickItem');
		
		// create row & cell elements
		for (var r = 0, record; record = rows[r]; r++) {

            var rowElement = document.createElement('tr');  
            rowElement.className = (r % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
            rowElement.onmouseover = function(){
            	this.className = this.className + ' hovered';
          	}
            rowElement.onmouseout = function(){
            	this.className = this.className.replace(' hovered', '');
          	}
          	rowElement.className += (multiline) ? ' multiline' : ' singleline';   
		    var row = new Ab.grid.Row(this, record, rowElement);
		    this.gridRows.add(row);
		    
		    record.index = r;	
		    record.row = row;
		        						
            for (var c = 0, column; column = columns[c]; c++) {
                if (column.hidden === true) continue;
            
                var cellElement = document.createElement('td');
                if(listener && this.columnTypeIsSortable(column.type) && column.type != 'image' && column.enabled == "true"){
                	column.type = 'link';
                	if (column.javaType === 'java.lang.Double' || column.javaType === 'java.lang.Integer') {
	                    column.type = 'number_link';
	                }
                }
				cellElement.className = column.type;
				if (column.width != null) {
					if(!column.width.match(/%/) || (column.width.match(/%/) && r == 0)){
						cellElement.width = column.width;
					}
                }

                if (column.onCreateCell != null) {
                    column.onCreateCell(record, column, cellElement);
                } 
				else {
                    this.createCellContent(record, column, cellElement);
                }
                                  
                rowElement.appendChild(cellElement); 
                
                var cell = new Ab.grid.Cell(row, column, cellElement);
                row.cells.add(column.id, cell);               			
			}
			parentElement.appendChild(rowElement);
		}
		
		// 3044685 add an empty row with single empty cell to enable scrollbar if no records
		if (this.rows.length == 0) {
			var rowElement = document.createElement('tr'); 
			var cellElement = document.createElement('td');
			rowElement.appendChild(cellElement); 
			parentElement.appendChild(rowElement);		
		}
		
		this.addRowLevelActions(listener, columns);		
        
		this.afterCreateDataRows(parentElement, columns);
	},

	/**
	 * Add row level actions
	 */
	addRowLevelActions: function(listener, columns){
		// add row-level actions
        var panel = this;
        var multipleSelectListener = this.getEventListener('onMultipleSelectionChange');
		this.gridRows.each(function(row) {
            for (var c = 0, column; column = columns[c]; c++) {
                if (column.hidden === true) continue;
                
                var record = row.record;
                var id = panel.generateId(record, column);
                var contentElement = Ext.get(id);
       
                if (contentElement || listener) {
                	if( !(listener && multipleSelectListener && c == 0) ) {
                		panel.createCellActions(record, column, id); 	
                	}               	              		
                }
            }
		});
	},
		  
	/**
	 * Removes action listeners for all rows.
	 */
	removeActionListeners: function() {
		this.gridRows.each(function(row) {
			row.removeActionListeners();
		});
	},
	
	/**
	 * Stub for user-customization
	 */
	afterCreateDataRows: function(parentElement, columns) {
	},


	/**
	 *	While creating data rows add extra columns to match any columns added to header for controls
	 */
	addExtraRowCells: function(rowElement) {
	},


	/**
	 * Creates row-level actions for specified cell.
	 */
	createCellActions: function(row, column, id) {
        // create command chain to execute            
        var command = new Ab.command.commandChain(this.id, this.getPrimaryKeysForRow(row));
        var listener = this.getEventListener('onClickItem');
        
        if (this.selectionEnabled) {
            // add selection command first
            var selectionCommand = new Ab.grid.SelectionCommand(this, row);
            command.addCommand(selectionCommand);
        }

        if (typeof(column.commands) != 'undefined' && column.commands.length > 0) {
            // add other commands specified in the column
            command.addCommands(column.commands);
        }       
        
        if (listener && column.type != 'image') {
        	if (typeof(listener.commands) != 'undefined' && listener.commands.length > 0) {
                // add other commands specified in the column
                var listenerCommands = listener.commands;
                for (var i = 0; i < listener.commands.length; i++) {
            	    var listenerCommand = listener.commands[i];
            	    delete listenerCommand['applySelectionRestriction'];
            	    var temp = {};
            	    for (var property in listenerCommand) {
            		    if (property != "applySelectionRestriction") {
            			    temp[property] = listenerCommand[property];
                        }
            	    }
            	    listener.commands[i] = temp;
                }
                command.addCommands(listener.commands);
        	} else {
                command.addCommand(new Ab.grid.OnClickCommand(row, listener));
            }
      	} 
      	
        var actionConfig = {
            useExtButton: false, // use link|button DOM element generated by the grid already
            id: id, // the id of the generated DOM element
            originalId: column.id,
            text: (column.type == 'button') ? column.text: null,
            tooltip: column.tooltip,
            enabled: (listener) ? "true": column.enabled,
            hidden: column.hidden,
            command: command
        };
            
        row.row.addAction(actionConfig);
	},


	/**
	 * Add row(s) after the table's data rows
	 * Adds a 'More records on server' message when server-side results exceeds recordLimit
	 * Override buildPreFooterRows or buildPostFooterRows method to add row(s) after the data, for example, to show aggregate function results
	 * 
	 */
	buildFooterRows: function(parentElement, data) {
		this.buildPreFooterRows(parentElement);

		if (data) { // rebuild
			this.hasMoreRecords = data.hasMoreRecords;
			this.hasNoRecords = (!valueExists(data.hasNoRecords)) ? (data.records.length<1) : data.hasNoRecords;

			if (valueExists(data.totals)) {
				this.totals = new Ab.data.Record();
				this.totals.fromJSON(data.totals);
			}
			
			if (valueExists(data.maximum)) {
				this.maximum = new Ab.data.Record();
				this.maximum.fromJSON(data.maximum);
			}

			if (valueExists(data.minimum)) {
				this.minimum = new Ab.data.Record();
				this.minimum.fromJSON(data.minimum);
			}
			
			if (valueExists(data.average)) {
				this.average = new Ab.data.Record();
				this.average.fromJSON(data.average);
			}
		}

		if (this.hasMoreRecords && !(this.hasPaging)) {
			this.buildMoreRecordsFooterRow(parentElement, this.getLocalizedString(Ab.grid.ReportGrid.z_NOT_ALL_RECORDS_CAN_BE_SHOWN))
		}

		if (this.hasNoRecords) {
			this.buildMoreRecordsFooterRow(parentElement, this.getLocalizedString(Ab.grid.ReportGrid.z_NO_RECORDS_TO_DISPLAY))
		}else{

			if (this.hasPaging && (this.rows.length > 0) && (this.rows.length < this.allCount)) {
				this.buildMoreRecordsFooterRow(parentElement, '')
			}
			
			// display statistic rows here
			for (var i = 0; i < this.statisticAttributes.formulas.length ; i++ ) {
				var formula = this.statisticAttributes.formulas[i];
				this.buildStatisticFooterRow(parentElement, formula);
			}
			
			if (this.isShowTotals() && !this.isShowSum() && this.statisticAttributes.formulas.length == 0) {
				// use old function - this will not display totals row title
				this.buildTotalsFooterRow(parentElement);
			}else if (this.isShowTotals() && !this.isShowSum() && this.statisticAttributes.formulas.length > 0) {
				// use new function that will add totals row title
				this.buildStatisticFooterRow(parentElement, 'sum');
			}
			
			if (this.isShowCounts()) {
				this.buildCountsFooterRow(parentElement);
			}
		}
				
		this.buildPostFooterRows(parentElement);
	},
			
	/*
	 * Add rows to the footer before the potential 'more records' message row
	 *
	 */
	buildPreFooterRows: function(parentElement) {
	},
	
	/*
	 * Add rows to the footer after the potential 'more records' message row
	 *
	 */
	buildPostFooterRows: function(parentElement) {
	},
	

	/**
	 * Override the function for both building & rebuilding a row following the daat rows
	 * In this case only one row is created showing the count of the rooms (actually, of the rows) & the sum of the areas
	 */
	buildMoreRecordsFooterRow: function(parentElement, message) {
		//create footer row
		var rowElement = document.createElement('tr');
			
		//create message cell in footer row
		var cellElement = document.createElement('td');
		var msg = this.userDefinedFooterHtml != null ? this.userDefinedFooterHtml : message;
		cellElement.className = 'message';
		cellElement.colSpan = this.getNumberOfColumns();
		cellElement.innerHTML = msg;
		if (this.hasPaging){
			this.createPagingLinks(cellElement);
		}
		if(message == this.getLocalizedString(Ab.grid.ReportGrid.z_NOT_ALL_RECORDS_CAN_BE_SHOWN)){
			var detailsMsg = this.getLocalizedString(Ab.grid.ReportGrid.z_NOT_ALL_RECORDS_CAN_BE_SHOWN2);
			detailsMsg = detailsMsg.replace('{0}', this.rows.length);
			cellElement.setAttribute('ext:qtip', detailsMsg);
		}
	
        rowElement.appendChild(cellElement);
		parentElement.appendChild(rowElement);
	},
	
	buildCountsFooterRow: function(parentElement) {
		var rowElement = document.createElement('tr');
		rowElement.id = this.id + '_count';
		
		var mainTableName = this.getDataSource().mainTableName;
		
		var countValue = this.getRecordCountValue();
		var cellElement = document.createElement('td');
		cellElement.className = 'count';
		cellElement.colSpan = this.getNumberOfColumns();
		cellElement.innerHTML = View.getLocalizedString(Ab.grid.ReportGrid.z_COUNT_OF_RECORDS) + ' ' + countValue;
	
        rowElement.appendChild(cellElement);
		parentElement.appendChild(rowElement);
	},

	
	getRecordCountValue: function(){
		var countValue = null;
		var mainTableName = this.getDataSource().mainTableName;
		if (valueExists(this.totals)) {
			countValue = this.totals.getLocalizedValue(mainTableName + '.count_of_records');
		} else if (valueExists(this.maximum)) {
			countValue = this.maximum.getLocalizedValue(mainTableName + '.count_of_records');
		} else if (valueExists(this.minimum)) {
			countValue = this.minimum.getLocalizedValue(mainTableName + '.count_of_records');
		} else if (valueExists(this.average)) {
			countValue = this.average.getLocalizedValue(mainTableName + '.count_of_records');
		}
		return countValue;
	},
	
	buildTotalsFooterRow: function(parentElement) {
		var rowElement = document.createElement('tr');
		rowElement.id = this.id + '_totals';
		
		var mainTableName = this.getDataSource().mainTableName;
		
		for (var c = 0; c < this.columns.length; c++) {
			var column = this.columns[c];
			if (column.hidden) {
				continue;
			}

			var cellElement = document.createElement('td');
			cellElement.className = 'totals';

			var id = valueExists(column.fullName) ? column.fullName : column.id;
			var name = id;
			if (name.indexOf('.') != -1) {
				name = name.substring(name.indexOf('.') + 1);
			}
			var totalValue = this.totals.getLocalizedValue(mainTableName + '.sum_' + name);
			if (valueExists(totalValue)) {
				cellElement.innerHTML = totalValue;
			}

			rowElement.appendChild(cellElement);		
		}
		parentElement.appendChild(rowElement);
	},
	
	/**
	 * Build statistic footer row
	 */
	buildStatisticFooterRow: function(parentElement, formula) {
		var title  = this.getStatisticTitleByType(formula);
		var fieldSufix = this.getFieldSufix(formula);
		var fieldPrefix = '.' + formula + '_';
		var dataRecord = this.getStatisticRecord(formula);
		
		var rowElement = document.createElement('tr');
		rowElement.id = this.id + fieldSufix;
		
		var mainTableName = this.getDataSource().mainTableName;
		var skipColumn =  false;
		for (var c = 0; c < this.columns.length; c++) {
			var column = this.columns[c];
			if (column.hidden || skipColumn) {
				// we must reset skipColumn if is true
				if (skipColumn){ 
					skipColumn =  false;
				}
				continue;
			}
			
			var cellElement = document.createElement('td');
			cellElement.className = 'totals';

			var id = valueExists(column.fullName) ? column.fullName : column.id;
			var name = id;

			if (name.indexOf('.') != -1) {
				name = name.substring(name.indexOf('.') + 1);
			}
			
			var statisticValue = dataRecord.getLocalizedValue(mainTableName + fieldPrefix + name);
			if (valueExists(statisticValue)) {
				cellElement.innerHTML = statisticValue;
				// don't add title after value
				title = null;
			}
			
			if (valueExists(title)) {
				// add row title
				cellElement.className = 'count';
				cellElement.innerHTML = View.getLocalizedString(title);
				// set colspan
				var colspan = this.getColspanForStatisticTitle(c, column.id);
				cellElement.colSpan = colspan;
				skipColumn = (colspan == 2);
				// set title null - was added
				title =  null;
			}
			rowElement.appendChild(cellElement);
		}
		parentElement.appendChild(rowElement);
	},
	
	/**
	 * Calculate colspan for statistic row title.
	 * If first column is multiple selection column and next column is not a statistic column set colspan 2
	 * If first column is not multiple selection and is not statistic set colspan = 1
	 */
	getColspanForStatisticTitle: function(index, currentId) {
		var result = 1;
		if (currentId == 'multipleSelectionColumn') {
			// check if we can set colspan 2
			// get next visible column
			var nextColumnId =  null;
			for (var i = index+1; i < this.columns.length; i++) {
				var nextColumn = this.columns[i];
				if (nextColumn.hidden) {
					continue;
				}else{
					nextColumnId = nextColumn.id;
					break;
				}
			} 
			if (valueExists(nextColumnId)) {
				// get fieldDefs for next column to check if showTotals = false
				var fieldDef = null;
				for (var i = 0; i < this.fieldDefs.length ; i++) {
					fieldDef = this.fieldDefs[i];
					if (fieldDef.id ==  nextColumnId) {
						break;
					}
				}
				if (this.statisticAttributes.fields.indexOf(nextColumnId) == -1 && !fieldDef.showTotals) {
					result = 2;
				}
			}
		}
		return result;
	},
	
	getStatisticTitleByType: function(type) {
		var result = null;
		if (type == 'avg') {
			result = Ab.grid.ReportGrid.z_TITLE_AVERAGE;
		} else if (type == 'min') {
			result = Ab.grid.ReportGrid.z_TITLE_MINIMUM;
		} else if (type == 'max') {
			result = Ab.grid.ReportGrid.z_TITLE_MAXIMUM;
		} else if (type == 'sum') {
			result = Ab.grid.ReportGrid.z_TITLE_TOTALS;
		}
		return result;
	},
	
	getStatisticRecord: function(type) {
		var result = null;
		if (type == 'avg') {
			result = this.average;
		} else if (type == 'min') {
			result = this.minimum;
		} else if (type == 'max') {
			result = this.maximum;
		} else if (type == 'sum') {
			result = this.totals;
		}
		return result;
	},
	
	getFieldSufix: function (type) {
		var result = null;
		if (type == 'avg') {
			result = '_average';
		} else if (type == 'min') {
			result = '_minimum';
		} else if (type == 'max') {
			result = '_maximum';
		} else if (type == 'sum') {
			result = '_totals';
		}
		return result;
	},

	/**
	 * set set the footer text to something other than localised 'has more records...'
	 */
    setFooter: function(htmlText) {
		this.userDefinedFooterHtml = htmlText;
	},

    // ----------------------- client API ----------------------------------------------------------
	
	/**
	 * Returns DOM element for specified cell.
	 * @param {rowIndex} 0-based row index.
	 * @param {columnIndex} 0-based column index.
	 */
	getCellElement: function(rowIndex, columnIndex) {
	    var rowElement = this.getDataRows()[rowIndex];
	    var cellElement = rowElement.childNodes[columnIndex];
	    return cellElement;
	},
    
    /**
     * Formats and returns all primary key values for specified row.
     
     * @param {row} Row data object.
     * @return      JSON object with primary key values. 
     */
    getPrimaryKeysForRow: function(row) {
        var keys = new Object();
        for (var i = 0; i < this.primaryKeyIds.length; i++) {
            var id = this.primaryKeyIds[i];
            keys[id] = row[id + ".key"];
        }
        return keys;
    },
    
    /**
     * Formats and returns the XML record containing all primary key values for specified row.
     
     * @param {row} Row data object.
     * @return      <record> XML element. 
     */
    getPrimaryKeyRecordForRow: function(row) {
        var keys = '';
        for (var i = 0; i < this.primaryKeyIds.length; i++) {
            var id = this.primaryKeyIds[i];
            keys = keys + id  + '=\'' + row[id + ".key"] + '\' ';
        }
        return '<record ' + keys + '><keys ' + keys + '/></record>';
    },
    
    /**
     * Formats and returns all primary key values for selected rows.
     
     * @param {row} Row data object.
     * @return      JSON array with primary key values. 
     */
    getPrimaryKeysForSelectedRows: function() {
        var selectedRows = new Array();
        
        var dataRows = this.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            
            var selectionCheckbox = dataRow.firstChild.firstChild;
            if (selectionCheckbox.checked) {
                
                var rowKeys = this.getPrimaryKeysForRow(this.rows[r]);
                selectedRows.push(rowKeys);
            }
        }
        
        return selectedRows;
    },
    
    
   	/**
	 * rebuild the table, reusing the index, header & filter bars
	 * after sort link event
	 */
	reloadOnSort: function(data) {
        this.beforeRefresh();

		this.rows = [];
		this.addRows(data.records);
		this.removeRowsFromTBody();

		this.rebuildHeader(this.tableHeadElement, data);

		// create grid data rows
		this.createDataRows(this.tableBodyElement, this.columns);

		this.buildFooterRows(this.tableFootElement, data);
		
        this.afterRefresh();
	},

    
    /**
     * Returns all selected records as Array across all pages.
     */
    getAllSelectedRecords: function(){
    	return this.selectionModel.getRecords();
    },
    
    /**
     * Returns all selected rows as Array across all pages.
     */
    getAllSelectedRows: function(){
    	return this.selectionModel.getRows();
    },
    
    /**
     * Returns primay key vales as Array from selected rows across all pages.
     */
    getPrimaryKeysForAllSelectedRows: function (){
    	var result = [];
    	var rows = this.getAllSelectedRows();
    	var r, row, rowKeys;
    	for (r = 0; r < rows.length; r++) {
            row = rows[r];
            rowKeys = this.getPrimaryKeysForRow(row);
            result.push(rowKeys);
    	}
    	return result;
    },
 
    
    /**
     * Clears all selected rows across all pages.
     */
    clearAllSelected: function(){
    	this.setAllRowsSelected(false);
    	this.selectionModel.clear(); 
    	this.selectionModelStore = {};
    	if (this.actionbar) {
			this.actionbar.updateSelected(0);
		}
    },
        
    /**
     * Updates selectionModel object.
     * @param row object.
     * @param selected boolean.
     * @param updateCheckbox boolean (default false).
     */
    updateSelectionModel: function(row, selected, updateCheckbox){
    	this.selectionModel.update(row, selected, updateCheckbox);
    },
    
    /**
     * Formats and returns all record values for selected rows.
     * it works with checkboxs on current page.
     * 
     * @param {row} Row data object.
     * @return      JSON array with record values. 
     */
    getSelectedRows: function() {
        var selectedRows = new Array();
        
        var dataRows = this.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            
            var selectionCheckbox = dataRow.firstChild.firstChild;
            if (selectionCheckbox.checked) {
                selectedRows.push(this.rows[r]);
            }
        }
        
        return selectedRows;
    },
    
    /**
     * Returns records for selected rows.
     *  it works with checkboxs on current page.
     * @return      Array of Ab.grid.Row objects. 
     */
    getSelectedGridRows: function() {
        var rows = [];
        this.gridRows.each(function (row) {
            if (row.isSelected()) {
                rows.push(row);
            }
        });
        return rows;
    },
    
    /**
     * Returns records for selected rows.
     *  it works with checkboxs on current page.
     * @return      Array of Ab.data.Record objects. 
     */
    getSelectedRecords: function() {
        var records = [];
        this.gridRows.each(function (row) {
            if (row.isSelected()) {
                records.push(row.getRecord());
            }
        });
        return records;
    },
    
    /**
     * Returns an array of values in selected rows for a specified field
     * Mainly used to get single-part PK values for selected rows
     *  it works with checkboxs on current page.
     * param				name of field
     * @return      Array of value(s) for specified field 
     */
    getFieldValuesForSelectedRows: function(fieldName) {
    	var values = [];
    	this.gridRows.each(function (row) {
    		if (row.isSelected()) {
    			values.push(row.getRecord().getValue(fieldName));
    		}
    	});
    	return values;    
    },
        
	/**
     * Sets all rows containing a checkbox as first column to checked==true
	 * Returns all record values for selected rows.
	 * it works with checkboxs on current page.
     * 
     * @param {selected} Boolean switch to control turning selection on or off. Default is ON
     * @return      JSON array with record values. 
     */
    setAllRowsSelected: function(selected) {
		// get switch value, default == true
		var setSelectedTrue = ((typeof selected == 'undefined') || selected == true) ? true : false;
        var selectedRows = new Array();
        
        var dataRows = this.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            
            var selectionCheckbox = dataRow.firstChild.firstChild;
            if (typeof selectionCheckbox.checked != 'undefined') 
			{
				if (selectionCheckbox.checked != setSelectedTrue) {
					selectionCheckbox.checked = setSelectedTrue;
					this.onChangeMultipleSelection(this.rows[r]);
				}
                selectedRows.push(this.rows[r]);			
            }
        }
        
        return selectedRows;
    },
    
    /**
     * Alias for setAllRowsSelected() method.
     *  it works with checkboxs on current page.
     */
    selectAll: function(selected) {
        this.setAllRowsSelected(selected);  
    },
    
	/**
     * Sets all rows containing a checkbox as first column to checked==false
	 * Returns all record values for selected rows.
	 *  it works with checkboxs on current page.
     * 
     * @return      JSON array with record values. 
     */
    setAllRowsUnselected: function() {
		return this.setAllRowsSelected(false);        
    },
    
    /**
     * Alias for setAllRowsUnselected() method.
     *  it works with checkboxs on current page.
     */
    unselectAll: function() {
        this.setAllRowsUnselected();  
    },
    
    /**
     * Selects (in the sense of highlighting) row specified by index.
     */
    selectRow: function(index) {
        var dataRows = this.getDataRows();
        
        if (this.selectedRowIndex >= 0 && dataRows.length > this.selectedRowIndex) {
            Ext.get(dataRows[this.selectedRowIndex]).removeClass('selected');
        }
        
        this.selectedRowIndex = index;
        if (dataRows.length > this.selectedRowIndex) {
           Ext.get(dataRows[this.selectedRowIndex]).addClass('selected');
        }
    },

	/**
     * Selects (in the sense of setting the checkBox) row specified by index.
	 */
	selectRowChecked: function(index, selected) {
		// get switch value, default == true
		var setSelectedTrue = ((typeof selected == 'undefined') || selected == true) ? true : false;

        var dataRow = this.getDataRows()[index];
		var selectionCheckbox = dataRow.firstChild.firstChild;

		if (typeof selectionCheckbox.checked != 'undefined' && selectionCheckbox.checked != setSelectedTrue) {
			selectionCheckbox.checked = setSelectedTrue;
			var row = this.getSelectedRow(index);
			this.onChangeMultipleSelection(row);			
		}
	},

	/**
	 * Get select row object.
	 * this.rows[index] is not working for category grid
	 */
	getSelectedRow: function(index) {
		var row = this.rows[index];
		if(this.config.controlType == 'category'){
			row = this.gridRows.get(index).record;
		}
		return row;
	},
    
    /**
     * Returns an array of DOM elements that represent grid data rows.
     */
    getDataRows: function() {
        return Ext.query('.dataRow', this.parentElement);
    },

    /**
     * Evaluate expressions in grid panel properties.
     */
    evaluateExpressions: function(ctx) {
        if (!valueExists(ctx)) {
            ctx = this.createEvaluationContext();
        }
        
        this.inherit(ctx);
        
		// evaluate column titles
		for (var i=0, fld; fld = this.fieldDefs[i]; i++) {
			if (fld.controlType == 'button') {
				continue;
			}
	        var evaluatedTitle = Ab.view.View.evaluateString(fld.title, ctx, false);
			if (evaluatedTitle != fld.title) {
				this.setFieldLabel(fld.id, evaluatedTitle);
			}
		}

        // delegate to all constituent rows
        this.gridRows.each(function(row) {
	        ctx.record = row.record;
            row.evaluateExpressions(ctx);
            ctx.record = null;
        });

    },

	// find & set the column title 
	setFieldLabel: function(fieldName, fieldLabel) {
		if (!this.tableHeadElement) {
			return;
		}
		
		var columnIndex = -1;
		for (var c=0, col; col = this.columns[c]; c++) {
			if (col.id == fieldName) {
				columnIndex = c;
				break;
			}
		}
		if (columnIndex < 0) {
			return;
		}
		var targetId = 'sortHeader_' + columnIndex;

		var tableHeadElements = this.tableHeadElement.getElementsByTagName('th');
		for (var i=0, headElem; headElem = tableHeadElements[i]; i++) {
			if (headElem.id == targetId) {
				if (headElem.firstChild.textContent) { // KB 3030672, 3038065
                    headElem.firstChild.textContent = fieldLabel;
				} else {
                    headElem.firstChild.innerHTML = fieldLabel;
				}
				return;
			}
		}
	},

    /**
     * Adds event listener to specified action in all rows.
     */
    addColumnActionListener: function(actionId, callback, scope) {
        // if the caller did not specify the scope, use this panel
        if (!valueExists(scope)) {
            scope = this;
        }
        
        this.gridRows.each(function (row) {
            var action = row.actions.get(actionId);
            if (action) {
                action.addListener(callback.createDelegate(scope, [row, action]));
            }
        });
    },

    /**
     * Converts specified grid row object to Ab.data.Record.
     * @param {row} Ab.grid.Row object.
     * @param {fieldNames} Optional: names of fields to include. If not specified, all fields are included.
     */
    rowToRecord: function(row, fieldNames) {
        var rawValues = {};        
        
        if (valueExists(fieldNames)) {
            for (var i = 0; i < fieldNames.length; i++) {
                var name = fieldNames[i];

                var rawValue = row[name + '.raw'];
                if (!valueExists(rawValue)) {
                    rawValue = row[name];
                }
                rawValues[name] = rawValue;
            }
        } else {
            for (var name in row) {
                // add only raw values
                if (!endsWith(name, '.key') && !endsWith(name, '.raw') &&
                    name != 'grid' && name != 'index' && name != 'row') {
                    
                    var rawValue = row[name + '.raw'];
                    if (!valueExists(rawValue)) {
                        rawValue = row[name];
                    }
                    rawValues[name] = rawValue;
                }
            }
        }
        
        // parse raw values into objects
        var values = this.getDataSource().parseValues(rawValues, false);
        var oldValues = this.getDataSource().parseValues(rawValues, false);
        
        // create and return record
        var record = new Ab.data.Record(values, false);
        record.oldValues = oldValues;
        return record;
    },

    /**
     * Converts Ab.data.Record to the grid row object.
     */
    recordToRow: function(record) {
        var rawValues = this.getDataSource().formatValues(record.values, false);
        var formattedValues = this.getDataSource().formatValues(record.values, true);

        var row = {};
        for (var name in rawValues) {
            row[name + '.raw'] = rawValues[name];
        }
        for (var name in formattedValues) {
            row[name] = formattedValues[name];
        }
        
        for (var i = 0; i < this.primaryKeyIds.length; i++) {
            var name = this.primaryKeyIds[i];
            row[name + ".key"] = rawValues[name];
        }
        
        return row;
    },
    
    /**
     * Displays specified list of Ab.data.Record objects in the grid.
     */
    setRecords: function(records, hasMoreRecords) {
        this.beforeRefresh();

        if (!valueExists(hasMoreRecords)) {
            hasMoreRecords = false;
        }
        this.hasMoreRecords = hasMoreRecords;

        var rows = [];
        for (var i = 0; i < records.length; i++) {
            var row = this.recordToRow(records[i]);
            rows.push(row);
        }
        this.rows = [];
        this.addRows(rows);

        this.beforeBuild();
        this.build();
        this.afterBuild();

        this.afterRefresh();
    },
    
	/**
	 * Default handler for document field wih controlType='link'
	 * Show document when link is clicked
	 */
	showDocumentLinkCommand: function(row, column) {
		var tableAndName = column.fullName.split('.');
        var fileName = row[column.fullName];
        var keys = row.grid.getPrimaryKeysForRow(row);
		for (name in keys) {
			var keyName = name.split('.')[1];
			keys[keyName] = keys[name]
		}

		View.showDocument(keys, tableAndName[0], tableAndName[1], fileName, null);
	},

	/**
	 * Returns the legend bitmap URL specified by the highlight pattern.  
	 */
	getLegendBitmapName: function(id, row, hpattern) {
    	// find the field definition for specified column ID
    	var tableName = '';
    	for (var i = 0; i < this.fieldDefs.length; i++) {
    		var fieldDef = this.fieldDefs[i];
    		if (fieldDef.id === id) {
    			tableName = fieldDef.fullName.substring(0, fieldDef.fullName.indexOf('.'));
    			break;
    		}
    	}
    	
    	// prepare primary key values from specified table
    	var primaryKeyValues = [];
        for (var i = 0; i < this.primaryKeyIds.length; i++) {
            var id = this.primaryKeyIds[i];
            
            if (id.indexOf(tableName + '.') != 0) {
            	continue;
            }
            
            var pkey = row[id + ".key"];
            
            if (!valueExists(pkey)) {
	            pkey = row[id];
	        } 
	       
	        primaryKeyValues.push(pkey); 
        }
    	
		return hpattern.getLegendBitmapName(tableName, primaryKeyValues);
	},
	
	//--------------- Statistic data -----------------------------
	/*
	 * Set statistic attributes.
	 */
	setStatisticAttributes: function(configObject){
		// statistic formula
		if (valueExists(configObject.formulas)) {
			this.statisticAttributes.formulas = configObject.formulas; 
		}
		// statistic fields
		if (valueExists(configObject.fields)) {
			this.statisticAttributes.fields = configObject.fields;
		}
		
		if (this.statisticAttributes.fields.length == 0 || this.statisticAttributes.formulas.length == 0) {
			this.statisticAttributes.formulas = [];
			this.statisticAttributes.fields = [];
		}
		// make statistic data array lower case
		var tmpValues = this.statisticAttributes.formulas.join(',').toLowerCase();
		this.statisticAttributes.formulas = tmpValues.split(',');	
		
		
		if (valueExists(configObject.currencyCode)) {
			this.statisticAttributes.currencyCode = configObject.currencyCode;
		}
		
		if (valueExists(configObject.exchangeRateType)) {
			this.statisticAttributes.exchangeRateType = configObject.exchangeRateType;
		}

		if (valueExists(configObject.currencyFields)) {
			this.statisticAttributes.currencyFields = configObject.currencyFields;
		}

		if (this.statisticAttributes.currencyFields.length == 0 
				|| !valueExistsNotEmpty(this.statisticAttributes.currencyCode)
				 || !valueExistsNotEmpty(this.statisticAttributes.exchangeRateType)) {
			this.statisticAttributes.currencyCode = '';
			this.statisticAttributes.exchangeRateType = '';
			this.statisticAttributes.currencyFields = [];
		}
		
		if (valueExists(configObject.formulaFields)) {
			this.statisticAttributes.formulaFields = configObject.formulaFields; 
		}

		if (valueExists(configObject.formulaValues)) {
			this.statisticAttributes.formulaValues = configObject.formulaValues;
		}
		
		if (this.statisticAttributes.formulaFields.length == 0 || this.statisticAttributes.formulaValues.length == 0) {
			this.statisticAttributes.formulaFields = [];
			this.statisticAttributes.formulaValues = [];
		}
		
		
		// WFR id
		this.statisticWorkflowRuleId = Ab.grid.ReportGrid.WORKFLOW_RULE_STATISTIC_DATA;
		
	},
	
	// Show average values ?
	isShowAverage: function(){
		return (this.statisticAttributes.formulas.indexOf('avg') != -1);
	},
	
	// Show maximum values ?
	isShowMax: function() {
		return (this.statisticAttributes.formulas.indexOf('max') != -1);
	},
	
	//Show minimum values ?
	isShowMin: function() {
		return (this.statisticAttributes.formulas.indexOf('min') != -1);
	},
	
	// Show totals for grouping data source?
	isShowSum: function() {
		return (this.statisticAttributes.formulas.indexOf('sum') != -1);
	},
	
	// if total or statistic rows are customized and statistic data WFR must be called
	isCustomTotal: function(){
		var isCustomized = false;
		isCustomized = ((valueExistsNotEmpty(this.statisticAttributes.currencyCode) || valueExistsNotEmpty(this.statisticAttributes.exchangeRateType)) 
								&& (this.statisticAttributes.currencyFields.length > 0));
		isCustomized = isCustomized || (this.statisticAttributes.formulaFields.length > 0 && this.statisticAttributes.formulaValues.length > 0);
		return isCustomized;
	},

	//--------------- API -----------------------------	
	/*
	 * Show the "No records to display." message
	 */
	showNoRecordsMessage: function(){
		this.hasNoRecords = true;
		this.buildMoreRecordsFooterRow(this.tableFootElement, this.getLocalizedString(Ab.grid.ReportGrid.z_NO_RECORDS_TO_DISPLAY));
	},

	/*
	 * Show the "Not all records can be shown." message
	 */	
	showMoreRecordsMessage: function(){
		this.hasMoreRecords = true;
		this.buildMoreRecordsFooterRow(this.tableFootElement, this.getLocalizedString(Ab.grid.ReportGrid.z_NOT_ALL_RECORDS_CAN_BE_SHOWN));
	}	
	
}, 
{
    // ----------------------- constants -----------------------------------------------------------

	// @begin_translatable
	z_NOT_ALL_RECORDS_CAN_BE_SHOWN: 'Not all records are shown.',
	z_NOT_ALL_RECORDS_CAN_BE_SHOWN2: 'This view displays the first {0} records.',
	z_NO_RECORDS_TO_DISPLAY: 'No records to display.',
	z_PAGING_NOT_ALL_RECORDS_CAN_BE_SHOWN: 'Not all records can be shown.',
	z_COUNT_OF_RECORDS: 'Total records:',
	z_TITLE_TOTALS: 'Totals:',
	z_TITLE_MAXIMUM: 'Maximum:',
	z_TITLE_MINIMUM: 'Minimum:',
	z_TITLE_AVERAGE: 'Average:',
	// @end_translatable

	// predefined name for the column that contains multiple selection checkboxes
    COLUMN_NAME_MULTIPLE_SELECTION: 'multipleSelectionColumn',

    // name of the default WFR used to render the data
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecords',
    // name of the default WFR used to get the statistic data
    WORKFLOW_RULE_STATISTIC_DATA: 'AbCommonResources-StatisticDataService-getStatisticDataRecords',

    //WFR to generate a DOCX report
    WORKFLOW_RULE_DOCX_REPORT: 'AbSystemAdministration-generatePaginatedReport-buildDocxFromDataSource',
    //WFR to generate a XLS report
    WORKFLOW_RULE_XLS_REPORT: 'AbSystemAdministration-generatePaginatedReport-generateGridXLSReport',

    // minimum height of the grid body in pixels required for the scroller to be displayed
    MIN_SCROLLING_HEIGHT: 30
});


/**
 * Grid cell hold the column reference and the cell DOM element reference.
 */
Ab.grid.Cell = Base.extend({
    // parent Ab.grid.Row object
    row: null,
    
    // matching Ab.grid.Column object
    column: null,
    
    // <td> DOM element reference
    dom: null,
    
    /**
     * Constructor.
     */
    constructor: function(row, column, cellElement) {
        this.row = row;
        this.column = column;
        this.dom = cellElement;
    },
    
    getEl: function() {
        return Ext.get(this.dom);
    }
});


/**
 * Grid row holds the data record and a collection of actions.
 */
Ab.grid.Row = Base.extend({
    // parent grid panel reference
    panel: null,
    
    // row data record
    record: null,
    
    // Ext.util.MixedCollection of actions, keyed by the field name
    actions: null,
    
    // Ext.util.MixedCollection of cells, keyed by the field name
    cells: null,
    
    // <tr> DOM element reference
    dom: null,
    
    /**
     * Constructor.
     */
    constructor: function(panel, record, rowElement) {
        this.panel = panel;
        this.record = record;
        this.dom = rowElement;
        this.actions = new Ext.util.MixedCollection();
        this.cells = new Ext.util.MixedCollection();
    },
    
    /**
     * Add action.
     */
    addAction: function(config) {
        var action = new Ab.view.Action(this.panel, config);
        action.row = this;
        this.actions.add(action.originalId, action);
    },
    
    /**
     * Removes all action listeners.
     */
    removeActionListeners: function() {
        this.actions.each(function(action) {
            action.removeListeners();
        });
    },
    
    /**
     * Returns Ab.data.Record containing values displayed in this grid row.
     * @param {fieldNames} Optional: names of fields to include. If not specified, all fields are included.
     */
    getRecord: function(fieldNames) {
        return this.panel.rowToRecord(this.record, fieldNames);
    },
    
    /**
     * Returns object value of specified field.
     */
    getFieldValue: function(fieldName) {
        var rawValue = this.record[fieldName + '.raw'];
        if (!valueExists(rawValue)) {
            rawValue = this.record[fieldName];
        }
        
        var value = rawValue;
        var dataSource = this.panel.getDataSource();
        if (dataSource) {
            value = dataSource.parseValue(fieldName, rawValue, false);
        }
        
        return value;
    },
    
    /**
     * Sets (and displays) object value of specified field.
     */
    setFieldValue: function(fieldName, fieldValue, formatting) {
    	if (!valueExists(formatting)) {
         	formatting = true;
        }    	 
    
    	var formattedValue = fieldValue;
    	this.record[fieldName + '.raw'] = fieldValue;
    	if(formatting){
         	var rawValue = this.panel.getDataSource().formatValue(fieldName, fieldValue, false);
         	this.record[fieldName + '.raw'] = rawValue;
         	formattedValue = this.panel.getDataSource().formatValue(fieldName, fieldValue, true);
        }
     
        var cellEl = Ext.get(this.cells.get(fieldName).dom);
        var linkEl = cellEl.child('a');
        if (linkEl) {
            linkEl.dom.innerHTML = formattedValue;
        } else {
            cellEl.dom.innerHTML = formattedValue;
        }
    },
    
    /**
     * Returns true if this row is selected.
     */
    isSelected: function() {
        var selectionCheckbox = this.dom.firstChild.firstChild;
        return (selectionCheckbox.checked);
    },
    
    /**
     * Selects or unselects this row.
     * @param {selected} optional, default = true
     */
    select: function(selected) {
        if (!valueExists(selected)) {
            selected = true;
        }
        var selectionCheckbox = this.dom.firstChild.firstChild;
        if (valueExists(selectionCheckbox.checked)) {
            selectionCheckbox.checked = selected;
        }
    },
    
    /**
     * Unselects this row.
     */
    unselect: function() {
        this.select(false);
    },

	/**
	 * Highlights or un-highlights the row.
	 * @param highlighted
     */
	highlight: function(highlighted) {
		if (highlighted) {
			Ext.get(this.dom).addClass('selected');
		} else {
			Ext.get(this.dom).removeClass('selected');
		}
	},

    /**
     * Returns 0-based index of the row in the grid.
     */    
    getIndex: function() {
        return this.record.index;  
    },
    
    /**
     * Evaluates expressions in property values and updates the UI state.
     * @param {ctx} Parent evaluation context, can be a panel context or a grid row context.
     */
    evaluateExpressions: function(ctx) {
        // TODO: evaluate expressions in text values, i.e. 
        // value="${record['mo.from_bl_id'] + '|' + record['mo.from_fl_id']}"
        
        this.actions.each(function(action) {
            action.evaluateExpressions(ctx);
        });
    }
});


/**
 * Command that changes the selected row.
 */
Ab.grid.SelectionCommand = Ab.command.Command.extend({
    
    // mini-console instance
    grid: null,
    
    // row to select
    row: null,
    
    /**
     * Constructor.
     */
    constructor: function(grid, row) {
        this.grid = grid;
        this.row = row;
    },
    
    /**
     * Command handler.
     */
    handle: function() {
	    if (this.grid.selectionEnabled) {
	        this.grid.selectRow(this.row.index);
	    }
    }
});

/**
 * Command that is called when the user clicks on any cell in specified row.
 */
Ab.grid.OnClickCommand = Ab.command.Command.extend({

    // row to select
    row: null,

    // listener function to call
    listener: null,

    /**
     * Constructor.
     */
    constructor: function(row, listener) {
        this.row = row;
        this.listener = listener;
    },

    /**
     * Command handler.
     */
    handle: function() {
        this.listener(this.row.row);
    }
});

/**
 * Tracks changes in the grid selection list even with multiple pages.
 */
Ab.grid.SelectionModel = Base.extend({
	/**
	 * selected rows.
	 */
    rows: null,
    
    /**
     * Adds row to selected list.
     * @param row object.
     */
    add: function(row){
        if(!this.find(row)){
              this.rows.push(row);
        }
    },
    
    /**
     * Removes the row from selected list.
     * @param row object.
     */
    remove: function(row){
    	var index = this.getIndex(row);
        if(index !== -1){
        	this.rows.splice(index, 1);
        }
    },
    
    /**
     * Finds if specified row exists in selected list.
     * @param row object.
     */
    find: function(row){
    	var index = this.getIndex(row);
    	return (index > -1);
    },
    
    /**
     * Gets the index of specified row in selected list.
     * @param row object.
     * Returns the index, if the row is not existing, returns -1.
     */
    getIndex: function(row){
        //check if record is existing or not
    	for(var i=0; i<this.rows.length; i++){
    		if(this.isIdentical(this.rows[i], row)){
    			return i;
    		}
    	}
    	
    	return -1;
    },
    
    /**
     * Checks if two specified rows are identical.
     * @param row1 object.
     * @param row2 object.
     */
    isIdentical: function(row1, row2){
    	for(var name in row1.row.record){
    		//????
    		if(name.indexOf(".") < 0){
    			continue;
    		}
    		if(row1.row.record[name] !== row2.row.record[name]){
    			return false;
    		}
    	}
    	return true;
    },

    /**
     * constructor - initialize rows.
     */
    constructor: function(){
        this.rows=[];
    },

    /**
     * Updates SelectionModel object with turning specified row's checkbox on/off. 
     */
    update: function(row, isSelected, updateCheckbox){
        if(!valueExists(updateCheckbox)){
        	updateCheckbox = false;
        }
        if(isSelected){
             this.add(row);
        }else{
             this.remove(row);
        }
        
        //row's checkbox updated
        if(updateCheckbox){
        	 row.row.select(isSelected);
        }
    
    },
    
    /**
     * Gets selected rows. 
     */
    getRows: function(){
        return this.rows;
    },
    
    /**
     * Gets selected records. 
     */
    getRecords: function(){
    	var records = [];
    	for (var r = 0, row; row = this.rows[r]; r++) {
    		records.push(row.row.record);
    	}
    	
    	return records;
    },
    
    /**
     * clears the model.
     */
    clear: function(){
    	this.rows=[];
    },
    
    /**
     * Size of the model
     */
    size: function(){
    	return this.rows.length;
    }

});


