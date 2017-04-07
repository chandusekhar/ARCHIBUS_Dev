/**
 * Declare the namespace for the form JS classes.
 */
Ab.namespace('grid');


/**
 * ResourceReport component is similar to Data View and to Column Report in that it is a read-only compact presentation of data.
 * It combines a report (grid) above a form. 
 * More specifically it is a grid having column headers from the fields in gridColumnNames above a set of records.
 * Each record displays as multiple grid rows separated from the next record by an empty row. The first record row shows values for 
 * the fields in gridColumnNames and the subsequent rows show the label and then value for each record field in formColumnNames.
 *
 * This control is designed to show the set of work request resources (trade, part, tool type, etc.) for a specific work request
 * but may be used for other 'child' records needing this presentation
 *
 */
Ab.grid.ResourceReport = Ab.view.Component.extend({
    
	// view definition to be displayed
	viewDef: null,

	// dataSource ID and dataSource object for field definitions
	dataSourceId: null,
	dataSource: null,

	parentRecordId: null,
	parentPKColumn: null,
    
	// array of field definitions
	fieldDefs: null,
	
    // name of the default WFR used to get the record
    refreshWorkflowRuleId: '',
    
    // whether the control should display its field values on load
    showOnLoad: true,

    // whether the control should display resource tables having no records
	showEmptyResources: false,
    
    // user function to call after refresh()
    afterRefreshListener: null,
    
	// array of column names for those fields presented as grid columns
    gridColumnNames: null,
    
	// array of column names for those fields presented as left-labelled, single-column form columns
    formColumnNames: null,
    
	// array of data records retrieved from the serve
	records: null,

  	// <table> element that is the parent of <thead><tbody><tfoot>, retained for lifetime of grid
	tableElement: null,
	// <thead> element that is the parent of all header rows, retained for lifetime of grid
	tableHeadElement: null,
	// <tbody> element that is the parent of all data rows, retained for lifetime of grid
	tableBodyElement: null,

	// name of the CSS class for the table
	cssClassName: 'panelReport',
	cssHeaderClassName: null,
	
    // ----------------------- initialization ------------------------------------------------------
    
    /**
     * Constructor.
	 *
	 * @param id
	 * @param configObject
     */
	constructor: function(id, configObject) {
        this.inherit(id, 'resourceReport', configObject);  

		this.viewDef = new Ab.view.ViewDef(configObject.getConfigParameter('viewDef'), configObject.getConfigParameter('groupIndex'), null, null, configObject.getConfigParameter('dataSourceId'));
                
        this.showOnLoad = configObject.getConfigParameter('showOnLoad', true);

		this.dataSourceId = configObject.getConfigParameter('dataSourceId', 'dataSource');

		this.parentRecordId = configObject.getConfigParameter('parentRecordId', null);
		this.parentPKColumn = configObject.getConfigParameter('parentPKColumn', null);

        this.fieldDefs = configObject.getConfigParameter('fieldDefs', []);

		this.showEmptyResources = configObject.getConfigParameter('showEmptyResources', false);

		this.refreshWorkflowRuleId = configObject.getConfigParameterNotEmpty('refreshWorkflowRuleId', Ab.grid.ResourceReport.WORKFLOW_RULE_REFRESH);
        this.addEventListenerFromConfig('afterRefresh', configObject);

	    this.gridColumnNames = [];
		var gridColNames = configObject.getConfigParameterIfExists('gridColumnNames');
		if (valueExists(gridColNames))  {
			this.gridColumnNames = gridColNames;
		}

	    this.formColumnNames = [];
		var formColNames = configObject.getConfigParameterIfExists('formColumnNames');
		if (valueExists(formColNames))  {
			this.formColumnNames = formColNames;
		}

		var rec = configObject.getConfigParameterIfExists('records');					
		if (valueExists(rec))  {
			this.records = [];
			this.records = rec;
		}

        this.visible = true;
    },
    
    // ------------------------ common control API methods -----------------------------------------
	/**
	 * Adds all row objects from the array to the grid list of rows.
	 */ 
	addRecords: function(records) {
		if (!this.records) {
		    this.records = [];
		}
		this.records = this.records.concat(records);
	},

	/**
	 * Adjunct function to constructor - separated so that constructor can be inherited
	 * call WFR to get column data and load into grid via onGetDataRecords
	 */
	initialDataFetch: function() {
		//alert('Now Again');
        if (this.showOnLoad) {
			try {
				if (this.records != null) {
					this.hasMoreRecords = false;
				}
				else {
					var result = Workflow.call(this.refreshWorkflowRuleId, this.getParameters());			
					this.onInitialDataFetch(result);				
					if (result.data.records) {
						this.addRecords(result.data.records);
						this.hasMoreRecords = result.data.hasMoreRecords;
					}
				}
				if (!this.fieldDefs || this.fieldDefs.length == 0) {
					this.dataSource = View.dataSources.get(this.dataSourceId);
					this.fieldDefs = this.dataSource.fieldDefs;
				}

				if (this.records.length > 0 || this.showEmptyResources) {
					this.beforeBuild();
					this.build();
					this.afterBuild();
				}
				this.afterRefresh();
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	

	/**
     * Override to handle WFR results in subclasses.
     */
    onInitialDataFetch: function(result) {},
    beforeBuild: function() {},
    afterBuild: function() {},
    afterRefresh: function() {},  


	/**
	 * Returns standardized parameters for grid's WFR
	 */
	getParameters: function() {
		var parameters = {
			controlId:  this.id,
			viewName:   this.viewDef.viewName,
			groupIndex: this.viewDef.tableGroupIndex,
			tableName:  this.viewDef.tableName,
			fieldNames: this.viewDef.getFields(),
			isDistinct: this.isDistinct,
			showData:   true, 
			exportType: this.exportType,
			exportFile: this.exportFile,
			exportTitle: this.title,
            version:     "2.0"
		};
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

        Ext.apply(parameters, this.parameters);

        return parameters;
	},


    refresh: function(restriction, newRecord, clearRestriction) {
        this.inherit(restriction, newRecord);

        if (valueExists(clearRestriction) && clearRestriction == true) {
            this.restriction = null;
        }
        
        // clear the selection
        this.selectedRowIndex = -1;
        
        // get and display data rows
        try {
    		var result = Workflow.call(this.refreshWorkflowRuleId, this.getParameters(), 60);
			// call afterGetData for post-processing (e.g., localization of data from messages)
            var listener = this.getEventListener('afterGetData');
            if (listener) {
                listener(this, result.data);
            }
			
			this.records = new Array();
			this.records = this.records.concat(data.records);

			this.build();
		} catch (e) {
		    Workflow.handleError(e);
		}
		
        this.afterRefresh();

	},


    // ----------------------- implementation ------------------------------------------------------
   	/**
	 * Creates HTML DOM treee containing grid <table> element and its children.
	 */
	build: function() {
        this.clear();

		var table = document.createElement('table');
		table.id = 'rsrcRpt_' + this.dataSourceId ;
		// get a parent record id to give the table a unique id
		if (this.restriction) {
			if (this.restriction.clauses) {
				this.parentRecordId = this.restriction.clauses[0].value;
			}
			else if (this.parentPKColumn) {
				this.parentRecordId = this.restriction[this.parentPKColumn];
			}
		}
		if (this.parentRecordId) {
			table.id += '_' + this.parentRecordId;
		}
		table.className = this.cssClassName;
		this.tableElement = table;
		this.parentElement.appendChild(table);

		// create grid header rows, add all header rows to a THEAD element in the table
		var tHead = document.createElement('thead');
		this.tableHeadElement = tHead;
		table.appendChild(tHead);

		var tBody = document.createElement('tbody');
		this.tableBodyElement = tBody;
		table.appendChild(tBody);

		//this.setTableStyle();
		// create grid header row
		this.createHeaderRow(tHead);
	
		// create grid data rows
		this.createDataRows(tBody);
	},
	
	/**
	 * Creates grid header row and adds it to the grid.
	 */
	createHeaderRow: function(parentElement) {
		var headerRow = document.createElement('tr');
		headerRow.id = 'headerRow';
		if (this.cssHeaderClassName != '') {
			headerRow.className = this.cssHeaderClassName;
		}

		var columnCount = 0;
		for (var c = 0, columnName; columnName = this.gridColumnNames[c]; c++) {			
            var column = this.getFieldDef(columnName);
		    if (column.hidden === true) {
				continue;
			}
			columnCount++;

			var headerCell = document.createElement('th');
			headerCell.colSpan = column.colspan;
			headerCell.id = 'header_' + c;			
			headerCell.appendChild(document.createTextNode(column.title));
			
			// justify titles to match content (numbers right justified, text left justified)
			headerCell.className = column.type == 'number' ? 'headerTitleNumber' : 'headerTitleText';
			
			headerRow.appendChild(headerCell);
		}
		parentElement.appendChild(headerRow);

		headerRow = document.createElement('tr');
		for (var i=0; i < columnCount; i++) {
			var headerCell = document.createElement('th');
			//headerCell.colSpan = column.colspan;
			headerCell.innerHTML = '<hr>';
			headerRow.appendChild(headerCell);
		}
		parentElement.appendChild(headerRow);
	},


		/**
	 * Creates all data rows and adds them to the grid.
	 * sorting, if needed, is performed on the server within the workflow rule's getData()
	 */
	createDataRows: function(parentElement) {
		var columnWidth = (100 / this.gridColumnNames.length) + '%;';
		// iterate through the records
		for (var r = 0, record; record = this.records[r]; r++) {

			if (record.values) {
				record = record.values;
			}

			// create grid row & cell elements
            var rowElement = document.createElement('tr');  
            rowElement.className = 'dataRow';                    
            for (var c = 0, columnName; columnName = this.gridColumnNames[c]; c++) {
				var column = this.getFieldDef(columnName);
                if (column.hidden === true) {
					continue;
				}            
                var cellElement = document.createElement('td');
				cellElement.className = column.type;
				cellElement.width = columnWidth;
				if (column.width != null && column.width != '') {
                    cellElement.width = column.width;
                }

                this.createCellContent(record, column, cellElement);
                rowElement.appendChild(cellElement); 
   			}
			parentElement.appendChild(rowElement);

                    
			// create form rows
            for (var c = 0, column; columnName = this.formColumnNames[c]; c++) {
				var column = this.getFieldDef(columnName);
                if (column.hidden === true) {
					continue;
				}            
	            var rowElement = document.createElement('tr');  
		        rowElement.className = 'dataRow odd';

                var cellElement = document.createElement('td');
				cellElement.appendChild(document.createTextNode(column.title));
                rowElement.appendChild(cellElement); 
				
				cellElement = document.createElement('td');
				cellElement.colSpan = this.gridColumnNames.length - 1;
				this.createCellContent(record, column, cellElement);
				//cellElement.style.whiteSpace = 'pre';
                rowElement.appendChild(cellElement); 
				parentElement.appendChild(rowElement);
			}		

			// after record spacer
			rowElement = document.createElement('tr');  
	        rowElement.className = 'dataRow odd';
            var cellElement = document.createElement('td');
			cellElement.colSpan = this.gridColumnNames.length;
			cellElement.innerHTML = '&nbsp;';
            rowElement.appendChild(cellElement); 
			parentElement.appendChild(rowElement);
		}	
	},


	getFieldDef: function(columnName) {
		return this.fieldDefs.get(columnName);
	},


	/**
	 * Helper function to create individual cell content element.
	 */
	createCellContent: function(row, column, cellElement) {
		var content = "";
		
	    var value = row[column.id];
	    if (typeof value == 'undefined') {
	        value = row[column.fullName];
	    }
	    
		if (column.type == 'text' || column.type == 'number' || column.type == 'date' || column.type == 'time' || 
			column.type == 'java.lang.Integer' || column.type == 'java.lang.Double' || column.type == 'java.lang.String' || 
			column.type == 'java.sql.Date' || column.type == 'java.sql.Time') {
            if (typeof value == 'undefined') {
                value = '';
            }
			// format values that are objects
			if ((column.type == 'date' || column.type == 'time' || column.type == 'java.sql.Date' || column.type == 'java.sql.Time') && 
				typeof value == 'object' && this.dataSource){
				value = this.dataSource.formatValue(column.fullName, value, true);
			}

            // handle special characters to make them shown up in both IE and FireFox
            if (typeof value == 'string') {
				//value = + value;
				value = value.replace(/&/g, "&amp;");
				value = value.replace(/>/g, "&gt;");
				value = value.replace(/</g, "&lt;");
			}
            /*
            content = Ext.util.Format.ellipsis(value, 50);
            if (value.length > content.length) {
                cellElement.setAttribute('ext:qtip', value);
            }
            */
			content = value;
			if (column.type == 'number') {
			    cellElement.style.textAlign = 'right';
			}			
		}
        cellElement.innerHTML = content;

        var contentElement = cellElement.childNodes[0];
        // IE6 cannot add an ID to a text node
        if (valueExists(contentElement) && contentElement.nodeType != 3) {
            contentElement.id = this.generateId(row, column);
        }
	},


    /**
     * Refreshes the control UI state.
     * @param {newRecord} Ignored.
     * @param {clearRestriction} If specified and true, the current restriction is removed.
     */
    refresh: function(restriction, newRecord, clearRestriction) {
        this.inherit(restriction, newRecord);
        
        if (valueExists(clearRestriction) && clearRestriction == true) {
            this.restriction = null;
        }
                
        // get and display data rows
        try {
    		var result = Workflow.call(this.refreshWorkflowRuleId, this.getParameters(), 60);

			this.reloadReport(result.data);
		} 
		catch (e) {
		    Workflow.handleError(e);
		}
		
        this.afterRefresh();

        View.log('After refresh: grid = [' + this.id + ']');
	},	
    

	/**
	 * rebuild the table, reusing the header bar
	 */
	reloadReport: function(resultData) {
		this.records = resultData.records;
		if (this.tableHeadElement == null) {
            this.beforeBuild();
            this.build();
            this.afterBuild();
		}
		else {
			// clear tbody rows
			this.removeRowsFromTable();
			// create grid data rows
			this.createDataRows(this.tableBodyElement);
		}
	},

	removeRowsFromTable: function() {
		if (this.tableBodyElement) {
			var rows = this.tableBodyElement.getElementsByTagName('tr');
		    for (var i=0, row; row = rows[0]; ) {
			    this.tableBodyElement.removeChild(row);
	        }
		}		
	},

    /**
     * Return the specified field TD element.
     */
    getFieldElement: function(fieldName) {
        return $(this.id + '_' + fieldName, false);
    },
    
    getFieldEl: function(fieldName) {
        return Ext.get(this.id + '_' + fieldName);
    }
    
}, {
    // ----------------------- constants -----------------------------------------------------------

    // name of the default WFR used to render the data
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecords'
});