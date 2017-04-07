/**
 * Report Grid concrete grid class works within the namespace 'grid' and extends the class: AFM.grid.Grid
 *
 * Contains functions that can be specialized by derived classes (e.g., AFM.grid.MiniConsole)
 */


// image file constants
var GRAPHICS_LOCATION		= '/archibus/schema/ab-system/graphics/';
var	IMAGE_SORT_ASCENDING	= GRAPHICS_LOCATION + 'ab-sort-asc.gif';
var	IMAGE_SORT_DESCENDING	= GRAPHICS_LOCATION + 'ab-sort-desc.gif';
var	IMAGE_SORT_NATURAL		= GRAPHICS_LOCATION + 'ab-sort-natl.gif';

var INITIAL_SORT_DIRECTION  = 0; // 'natural'


AFM.grid.ReportGrid = AFM.grid.Grid.extend({
    
    // ----------------------- configuration parameters --------------------------------------------

    // name of the default WFR used to render the data
    refreshWorkflowRuleId: '',
    
	// view definition to be displayed
	viewDef: null,
	
	// if this flag set to true, the WFR returns records with distinct PK values
	isDistinct: false,

	// array of primary key ID attributes, i.e. ['rm.bl_id', 'rm.fl_id', 'rm.rm_id']
    primaryKeyIds: [],
    
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
    selectionEnabled: false,
    
    // 0-based index of the selected row (-1 = no row selected)
    selectedRowIndex: -1,
    
    // whether the multiple selection checkboxes should be enabled
    multipleSelectionEnabled: false,
    
	// whether to display sort indicators in columns
	sortEnabled: true,
	
	// column on which table is initially sorted by on_load WFR call
	sortColumnID: '',

	// sort order for column on which table is sorted, exists before columns (& thus sortDirections array) exist
	sortColumnOrder: 1,

	// collection of sortDirections ; sortColumnDirection.length == columns.length ; 0 'natural', 1 ascending, -1 descending '' non-sortable (e.g., button column)
	sortDirections: [],

	// action listener on sortable column header
	sortListener: null,

	// type of report export output ['' i.e., standard; 'PDF'; 'EXCEL' ]
	exportType: '',
	
	// optional nae of the XSL-FO file
	exportFile: '',

	// URL of export to be fetched from server
	exportURL: '',

	// holder for defining the desired display height of the grid,
	// set directly -- by the XSL-generated HTML or the javascript programmer -- after constructor is called before build() is called, 
	// if it remains -1 -> height is 100%
	panelHeight: '-1',

	// data source holds more records than are shown in table ( > RecordLimit)
	hasMoreRecords: false,

	// no records
	hasNoRecords: false,
	
	// data
	data: null,
	
	/**
	 * Constructor creates 'empty' grid; sets internal data structures (columns,rows, DOM element arrays & listeners) & then calls WFR
	 *
	 * @param controlId
	 * @param configObject - map with keys of (at least) [viewDef, groupIndex] and possibly [sortColumnID, cssClassName, showOnLoad, 
	 *											selectionEnabled, multipleSelectionEnabled, useParentRestriction, refreshWorkflowRuleId, sortAscending]
	 */
	constructor: function(controlId, configObject) {
        // call AFM.grid.Grid constructor
        this.inherit(controlId, configObject); 

        // ReportGrid always uses the ViewDef
		var viewDef = configObject.getConfigParameterIfExists('viewDef');
        if (typeof viewDef == 'string') {
			var groupIndex = configObject.getConfigParameter('groupIndex');
            this.viewDef = new AFM.view.ViewDef(viewDef, groupIndex);
        } else {
		    this.viewDef = viewDef;
        } 

        // call standard localization method
        this.initializeTranslatableDisplayStrings();

		// use sortColumnID param to initial WFR call if not null or let WFR find sort
		this.sortColumnID = configObject.getConfigParameterIfExists('sortColumnID');
		this.sortListener = this.onClickSort;
		var sortAscending = configObject.getConfigParameterIfExists('sortAscending');
		if (valueExists(sortAscending) && sortAscending != '') {
			this.sortColumnOrder = sortAscending;
		}
		if (configObject.getConfigParameterIfExists('columns')) {
			this.initializeSortDirections();
		}

		var selectionEnabled = configObject.getConfigParameterIfExists('selectionEnabled');
		if (valueExists(selectionEnabled)) {
		    this.selectionEnabled = selectionEnabled;
		}
		
		var multipleSelectionEnabled = configObject.getConfigParameterIfExists('multipleSelectionEnabled');
		if (valueExists(multipleSelectionEnabled)) {
		    this.multipleSelectionEnabled = multipleSelectionEnabled;
		}
		
		var refreshWorkflowRuleId = configObject.getConfigParameterIfExists('refreshWorkflowRuleId');
		if (valueExists(refreshWorkflowRuleId) && refreshWorkflowRuleId != '') {
		    this.refreshWorkflowRuleId = refreshWorkflowRuleId;
		} else {
		    this.refreshWorkflowRuleId = AFM.grid.ReportGrid.WORKFLOW_RULE_REFRESH;
		}
	},
		
	/**
	 * Adjunct function to constructor - separated so that constructor can be inherited
	 * call WFR to get column data and load into grid via onGetDataRecords
	 */
	initialDataFetch: function() {
		AFM.workflow.Workflow.runRule(this.refreshWorkflowRuleId, this.getParametersForRefresh(), this.onGetDataRecords, this);
	},
	
	// ----------------------- common control API methods ------------------------------------------

    /**
     * Refreshes the control UI state.
     */
    refresh: function(restriction) {
        // set the mini-console restriction
        if (valueExists(restriction)) {
            this.restriction = restriction;
        }
        
        // allow the mini-console to display data rows
        this.showOnLoad = true;
        
        // clear the selection
        this.selectedRowIndex = -1;
        
        // get and display data rows
		var result = AFM.workflow.Workflow.runRuleAndReturnResult(this.refreshWorkflowRuleId, this.getParametersForRefresh());
		if (result.code == 'executed') {
			this.hasMoreRecords = result.data.hasMoreRecords;
			this.hasNoRecords = result.data.hasNoRecords;
			this.reloadGrid(result.data.records);
			this.exportURL = result.data.exportURL;
			this.data = result.data;
		} 
		else {
		    AFM.workflow.Workflow.handleError(result);
		}
	},	

	/**
	 * rebuild the table, reusing the header bar
	 * 
	 */
	reloadGrid: function(records) {
		// data object containing essential members returned by WFR as stored in the grid
		var data = this.getReloadDataFromGrid(records);
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
	 * When customizing the grid or using hard-coded data eloadGrid() must be called with a client-code-constructed data object
	 * 
	 */
	getReloadDataFromGrid: function(newRows) {
		// create data object using info saved from last WFR run
		var data = new Object();
		if (!newRows) {
			data.records = this.rows;
		}
		else {
			data.records = newRows;
		}
		data.index = this.indexEntries;
		data.hasMoreRecords = this.hasMoreRecords;
		data.hasNoRecords = this.hasNoRecords;
		return data;
	},

        
    // ----------------------- implementation methods ----------------------------------------------

	/**
	 * Fill in the previously created grid using WFR data.
	 * this is the default callback from on_load's WFR, thus grid has no columns, PK IDs, records, etc.
	 *
	 */
	onGetDataRecords: function(result) {
		if (result.code == 'executed') {
			var data = result.data;
			this.data = data;
	        
			if (this.columns.length == 0 && null != data.columns) {
    		    if (this.multipleSelectionEnabled) {
    		        this.addColumn(
    		            new AFM.grid.Column(
    		                AFM.grid.ReportGrid.COLUMN_NAME_MULTIPLE_SELECTION, '', 'checkbox', this.onChangeMultipleSelection));
    		    }
			}
			this.initializeColumns(data);

			if (this.columns.length != 0 && null != data.records) {
				this.addRows(data.records);
				this.hasMoreRecords = data.hasMoreRecords;
			} 

			if (data.records.length == 0){
						this.hasNoRecords = true;
			} else {
						this.hasNoRecords = false;
			}	
							
			if (this.columns.length != 0 && null != data.primaryKeyIds) {
				this.primaryKeyIds = data.primaryKeyIds;
			}
			if (data.translatableDisplayStrings != null && typeof(data.translatableDisplayStrings) != 'undefined') {
				this.translatableDisplayStrings = data.translatableDisplayStrings;
			}
					
		    this.beforeBuild();
			this.build();
			this.afterBuild();
		} 
		else {
			AFM.workflow.Workflow.handleError(result);
		}
	},
				
	/**
	 * Add columns to grid from received data
	 */
	initializeColumns: function(data) {
		this.addColumns(data.columns);
		this.initializeSortDirections();
	},


	/**
	 * Return standardized parameter for grid's WFR
	 *  
	 */
	getParameters: function(sortValue) {
		var parameters = {
			controlId:  this.controlId,
			viewName:   this.viewDef.viewName,
			groupIndex: this.viewDef.tableGroupIndex,
			tableName:  this.viewDef.tableName,
			fieldNames: this.viewDef.getFields(),
			isDistinct: this.isDistinct,
			sortValues: sortValue,
			showData:   this.showOnLoad,
			translatableDisplayStrings: toJSON(this.getTranslatableDisplayStrings()),
			exportType: this.exportType,
			exportFile: this.exportFile
		};
        if (this.restriction != null) {
            parameters.restriction = toJSON(this.restriction);
        }

		if ((parameters.viewName == '' && parameters.tableName == '' && parameters.fieldNames == '' ) && 
			 this.columns.length > 0) {
			parameters.tableName = this.columns[0].id.split('.', 1)[0];
			parameters.fieldNames = this.getFieldNamesParameterFromColumns();
		}

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
	 * Return the sort values needed by the workflow rule using the current sorting direction
	 *
     */
	getCurrentSortValues: function() {
		var sortElems = new Array();
		if (this.sortEnabled && valueExistsNotEmpty(this.sortColumnID)) {
			sortElems.push({'fieldName': this.sortColumnID, 'sortOrder': this.sortColumnOrder});
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
	 * Initialize inherited translatableDisplayStrings collection
	 * to contain all those strings that may need to be localized for this UI component.
	 */
	initializeTranslatableDisplayStrings: function() {
		this.translatableDisplayStrings = new Array();
		this.translatableDisplayStrings.push(new AFM.view.TranslatableDisplayString(getMessage('more_record_display'),''));
		this.translatableDisplayStrings.push(new AFM.view.TranslatableDisplayString(getMessage('no_record_display'),''));
	},
	
	/**
	 * Return collection of AFM.view.TranslatableDisplayString entries whose keys should be localized
	 * Assume translatable strings don't change over the lifetime of object, 
	 * therefore once translated pass empty array
	 */
	getTranslatableDisplayStrings: function() {
		// send collection if not empty and first entry has key but no value 
		if (this.translatableDisplayStrings.length > 0 && this.translatableDisplayStrings[0].stringValue == '') {
			return this.translatableDisplayStrings;
		}
		else {
			return new Array();
		}
	},

	/**
	 * Return the localization of the input string.
	 * Return input string itself if not found as key in collection
	 */
	getTranslatableDisplayString: function(input) {
		for (var i=0, entry; entry = this.translatableDisplayStrings[i]; i++) {
			if (entry.stringKey == input) {
				return entry.stringValue;
			}
		}
		return input;
	},

	/**
	 * Set the style class and/or attributes of the parent DIV and grid TABLE
	 * When this.panelHeight == '-1' (the default) no scrolling attributes are set
	 * Some style attributes are set based on browser detected in common.js
	 */
	setTableStyle: function() {
		var pHt = this.getPanelHeightString();		
		if (pHt != '') {
			// turn panel height into a string

			if (mozillaFireFoxBrowser) {
				//this.parentElement.className = 'scrollWrapper';
				this.tableElement.className = 'panelReport';

				this.parentElement.style['float'] = 'left';
				this.parentElement.style.overflow = 'visible';

				this.tableBodyElement.style.height = pHt;
				this.tableBodyElement.style.maxHeight = pHt;
				this.tableBodyElement.style.overflowY = 'auto';
				this.tableElement.style.borderCollapse = 'separate';
				this.tableElement.style.marginRight = '0px';
			}
			else if (microsoftIEBrowser) {
				//this.parentElement.className = 'scrollWrapperIE';
				this.parentElement.style['float'] = 'left';
				this.parentElement.style.overflowY = 'auto';

				this.tableElement.className = 'panelReport';
				var columnCount = this.columns2.length > 0 ? this.columns2.length : this.columns.length;
				this.parentElement.style.width = 200 * columnCount;
			}

			this.parentElement.style.height = pHt;
			this.parentElement.style.maxHeight = pHt;

		}
		else {
			this.tableElement.className = this.cssClassName;
		}
	},

	/**
	 * Validate and Convert the panelHeight string
	 * to a string containing a unit (e.g., px, pt, em, cm, in).
	 * If panelHeight is negative or cannot be converted to a number return the empty string.
	 *
	 */
	getPanelHeightString: function() {
		var pHt = parseFloat(this.panelHeight);
		if (isNaN(pHt) || pHt < 1) {
			return '';
		}
		var suffix = 'px';
		if (this.panelHeight.indexOf('em') > 0) {
			suffix = 'em';
		}
		else if (this.panelHeight.indexOf('pt') > 0) {
			suffix = 'pt';
		}
		else if (this.panelHeight.indexOf('in') > 0) {
			suffix = 'in';
		}
		else if (this.panelHeight.indexOf('cm') > 0) {
			suffix = 'cm';
		}
		pHt = pHt + suffix;
		return pHt;
	},

	
	// ----------------------- multiple selection --------------------------------------------------

    onChangeMultipleSelection: function(e, row) {
    },

	//----------------------------------------sort---

	
	/**
	 * Helper function to unify testing of column as type that allows sorting
	 */
	columnTypeIsSortable: function(columnType) {
		var ret = false;
 		if (columnType == 'text' || columnType == 'number' || columnType == 'date' || columnType == 'time' || columnType == 'link') {
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
		this.sortDirections = new Array();
		for (var i=0, col; col = this.columns[i]; i++) {
			if (col.id == this.sortColumnID) {
				this.sortDirections[i] = this.sortColumnOrder; 
			}
			else if (this.columnTypeIsSortable(col.type)) {
				this.sortDirections[i] = INITIAL_SORT_DIRECTION;
			}
			else {
				this.sortDirections[i] = '';
			}
		}
	},

	
	/**
	 * Return the sort values for the WFR first incrementing the sorting column's direction
	 */
	getNextSortValues: function(sortColIndex) {
		var sortElems = new Array();
		this.sortColumnOrder = this.incrementSortDirection(this.sortDirections[sortColIndex]); 
		if (this.sortEnabled) {
			sortElems.push({'fieldName': this.sortColumnID, 'sortOrder': this.sortColumnOrder});
		}
		return toJSON(sortElems);
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
			var imgLinks = headerCell.getElementsByTagName('input');
			var oldSortLink;

//			if (imgLinks != null && imgLinks.length > 0 && imgLinks[0].id.substr(0,8) == 'sortLink') {
			if (imgLinks != null && imgLinks.length > 0) {
				oldSortLink = imgLinks[0];
			}				
			
			// if col not sortable || dir == 0 && index != sortColumnIndex -> null op
			if (colNumber == '' || (colNumber != sortColIndex && this.sortDirections[colNumber] == INITIAL_SORT_DIRECTION)) {
				continue;
			}
			// else if index == sortColumnIndex -> increment val in sortDirections[], reset image 
			else if (colNumber == sortColIndex && oldSortLink != null) {
				var nextSortDir = this.incrementSortDirection(this.sortDirections[colNumber]);
				this.sortDirections[colNumber] = nextSortDir;
				headerCell.replaceChild(this.getSortImage(nextSortDir), oldSortLink);
 			}
			// else if col's dir != 0 && index != sortColumnIndex, reset to 0 in sortDirections[], reset image
			else if (oldSortLink != null) {
				this.sortDirections[colNumber] = INITIAL_SORT_DIRECTION;
				headerCell.replaceChild(this.getSortImage(INITIAL_SORT_DIRECTION), oldSortLink);
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
		    	sortImage = this.createInputImage(IMAGE_SORT_ASCENDING, 'Sorting in ASCENDING order. Click to sort on this column in DESCENDING order', 4)
				break
			case -1:	// descending
   				sortImage = this.createInputImage(IMAGE_SORT_DESCENDING, 'Sorting in DESCENDING order. Click to turn off sorting on this column', 4)
				break
			default:// 'natural'
				sortImage = this.createInputImage(IMAGE_SORT_NATURAL, 'Sorting off on this column. Click to sort on this column in ASCENDING order', 4)
		}
		return sortImage;
	},




	/**
	 * set the sort listener to use the header cell as 'this' 
	 * and add the miniConsole itself as the second arg to the listener function
	 *
	 */
	activateSortListener: function(sortHeaderCell, miniConsole) {
		if (this.sortListener != null && typeof this.sortListener == "function") {
			YAHOO.util.Event.addListener(sortHeaderCell, "click", this.sortListener, miniConsole);
			YAHOO.util.Event.addListener(sortHeaderCell, "keypress", function(e) {
				if(e.which == 13){
					e.target.click();
				}
				if(e.keyCode == 13){
					e.srcElement.click();
				}
			});
		}
	},

	/**
	 * Remove any click listener on the given DOM element
	 */
	removeSortListener: function(sortHeaderCell) {
		if (this.sortListener != null && typeof this.sortListener == "function") {
			YAHOO.util.Event.purgeElement(sortHeaderCell, "false", "click");
			YAHOO.util.Event.purgeElement(sortHeaderCell, "false", "keypress");
		}
	},

	/**
	 * on click of index link send index parameters and refill the miniConsole through callback
	 *
	 */
	onClickSort: function(e, miniConsoleAndColumnIndex ) {
		var grid = miniConsoleAndColumnIndex.miniConsole;
		// integer index into columns[] specifying which column to sort on
		var sortColIndex = miniConsoleAndColumnIndex.columnIndex;
		grid.sortColumnID = grid.columns[sortColIndex].id;
		var parameters = grid.getParameters(grid.getNextSortValues(sortColIndex));
		var result = AFM.workflow.Workflow.runRuleAndReturnResult(grid.refreshWorkflowRuleId, parameters);
		if (result.code == 'executed') {
			grid.reloadOnSort(result.data);
		} 
		else {
			AFM.workflow.Workflow.handleError(result);
		}
		grid.incrementHdrSortDirections(sortColIndex);
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
		var table = document.createElement('table');
		table.id = 'grid_' + this.parentElement.id;
		this.tableElement = table;
		this.parentElement.appendChild(table);

		// create grid header rows, add all header rows to a THEAD element in the table
		var tHead = document.createElement('thead');
		this.tableHeadElement = tHead;
		table.appendChild(tHead);
		var tBody = document.createElement('tbody');
		this.tableBodyElement = tBody;
		table.appendChild(tBody);
		var tFoot = document.createElement('tfoot');
		this.tableFootElement = tFoot;
		table.appendChild(tFoot);
		this.setTableStyle();

		this.headerRows = new Array();
		this.buildHeader(tHead);
		
		var columns = this.columns2.length > 0 ? this.columns2 : this.columns;
	
		// create grid data rows
		this.createDataRows(tBody, columns);

		// create grid footer rows, add all footer rows to a TFOOT element in the table
		this.buildFooterRows(tFoot);
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
	 * deprecated, but retained for backward compatibility
	 *
	 */
	removeRowsFromTBody: function() {
		this.removeRowsFromTable();
	},
	/**
	 * Remove all rows contained in grid's three structural elements <thead>, <tbody>, and <tfoot>
	 * Clears the table, but retains its structure. Table remains with no contaent other than these containing elements
	 *
	 */
	removeRowsFromTable: function() {
		if (this.tableBodyElement) {
			var rows = this.tableBodyElement.getElementsByTagName('tr');
		    for (var i=0, row; row = rows[0]; ) {
			    this.tableBodyElement.removeChild(row);
	        }
		}		

		if (this.tableHeadElement) {
			rows = this.tableHeadElement.getElementsByTagName('tr');
		    for (var i=0, row; row = rows[0]; ) {
			    this.tableHeadElement.removeChild(row);
			}
        }

		if (this.tableFootElement) {
			rows = this.tableFootElement.getElementsByTagName('tr');
		    for (var i=0, row; row = rows[0]; ) {
			    this.tableFootElement.removeChild(row);
			}
        }
	},

	

	/**
	 * Creates grid header row and adds it to the grid.
	 */
	createHeaderRow: function(parentElement, columns, level) {
		var tHead = this.tableHeadElement;
		var headerRow = document.createElement('tr');
		headerRow.id = 'headerRow_' + level;

		for (var c = 0, column; column = columns[c]; c++) {
			var headerCell = document.createElement('th');
			headerCell.colSpan = column.colSpan;
			headerCell.id = 'sortHeader_' + c;
			headerCell.scope = 'col'; //- added to accomodate accessibility readers
			headerRow.appendChild(headerCell);
			
			headerCell.appendChild(document.createTextNode(column.name));

			this.decorateHeaderCell(level, c, column, headerCell);

			// justify titles to match content (numbers right justified, text left justified)
			headerCell.className = column.type == 'number' ? 'headerTitleNumber' : 'headerTitleText';
		}
		this.createAdditionalHeaderColumns(headerRow);

		// somehow parentElement gets lost in IE, reset
		if (parentElement == null) {
//alert('IE still loses tHead parent elem!');
			parentElement = this.tableHeadElement;
		}

		parentElement.appendChild(headerRow);
		this.headerRows[level] = headerRow;
	},



	/**
	 * Creates additional elements within a header cell 
	 * In the case of the sortable grid this is the sort buttons
	 */
	decorateHeaderCell: function(level, c, column, headerCell) {
		if (this.sortEnabled && level == 0 && this.columnTypeIsSortable(column.type)) {
			var sortLink = this.getSortImage(this.sortDirections[c]);
			sortLink.id = 'sortLink_' + c;
			// onClick function
			var miniConsoleAndColumnIndex = {'miniConsole' : this, 'columnIndex' : c };
			this.activateSortListener(headerCell, miniConsoleAndColumnIndex);
    		headerCell.appendChild(sortLink);
		}
	},

	/**
	 * Eliminate sortListener & image links for sort direction
	 * When constructing a grid with data that cannot be retrieved from the WFR
	 * (e.g., hard-coded data or other data that doesn't exist in the database)
	 * Sorting will not work & should be removed from the grid.
	 *
	 */
	removeSorting: function() {
		var headerCells = this.headerRows[0].getElementsByTagName("th");
		// iterate over header cells. test, set sortDirections[], set image
		for (var i=0, headerCell; headerCell = headerCells[i]; i++) {
			var imgLinks = headerCell.getElementsByTagName('input');
			if (imgLinks.length > 0 && imgLinks[0].id.substr(0,8) == 'sortLink') {
					headerCell.removeChild(imgLinks[0]);
					this.removeSortListener(headerCell);
			}
		}
	},


	/**
	 * Creates any additional columns in the header
	 *  null ops for the ReportGrid
	 */
	createAdditionalHeaderColumns: function(headerRow) {
	},



	/**
	 * Creates all data rows and adds them to the grid.
	 * sorting, if needed, is performed on the server within the workflow rule's getData()
	 */
	createDataRows: function(parentElement, columns) {
		var rows = this.rows;
		// create row & cell elements
		for (var r = 0, row; row = rows[r]; r++) {
		    row.index = r;	    						
			var rowElement = document.createElement('tr');	
            rowElement.className = (r % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
					
            for (var c = 0, column; column = columns[c]; c++) {
                var cellElement = document.createElement('td');
				cellElement.className = column.type;
				if (c == 0) {
                    cellElement.scope = 'row'; //- added to accomodate accessibility readers
                }
				if (column.width != null) {
                    cellElement.width = column.width;
                }

                if (column.onCreateCell != null) {
                    column.onCreateCell(row, column, cellElement);
                } 
				else {
                    this.createCellContent(row, column, cellElement);
                }                                 
                rowElement.appendChild(cellElement);                			
			}
			this.addExtraRowCells(rowElement);
			parentElement.appendChild(rowElement);
		}
	},


	/**
	 *	While creating data rows add extra columns to match any columns added to header for controls
	 *
	 */
	addExtraRowCells: function(rowElement) {
	},


	/**
	 * Helper function to create individual cell content element.
	 * Overridden to support row-level commands.
	 */
	createCellContent: function(row, column, cellElement) {
	    this.inherit(row, column, cellElement);  
	    
        if (typeof(column.commands) != 'undefined' && column.commands.length > 0) {
            var contentElement = cellElement.childNodes[0];
            
            // create command chain to execute            
            var command = new AFM.command.commandChain(this.controlId, this.getPrimaryKeysForRow(row));
            
            if (this.selectionEnabled) {
                // add selection command first
                var selectionCommand = new AFM.grid.SelectionCommand(this, row);
                command.addCommand(selectionCommand);
            }
            
            // add other commands specified in the column
            command.addCommands(column.commands);
            
            var fn = command['handle'];
            YAHOO.util.Event.addListener(contentElement, "click", fn, command, true);
            
            // TODO: check for memory leaks
        }	    
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
			if (data.records.length == 0){
			   this.hasNoRecords = true;
		  }
		}

		if (this.hasMoreRecords) {
			this.buildMoreRecordsFooterRow(parentElement)
		}
		
		if (this.hasNoRecords) {
			this.buildMoreRecordsFooterRow(parentElement)
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
	buildMoreRecordsFooterRow: function(parentElement) {
		//create footer row
		var rowElement = document.createElement('tr');
			
		//create message cell in footer row
		var cellElement = document.createElement('td');
		var msg = getMessage('more_record_display');
	
		if (this.hasNoRecords == true){
	 			msg = getMessage('no_record_display');
		}	

		cellElement.className = 'message';
		cellElement.colSpan = this.getNumberOfColumns();
        cellElement.appendChild(document.createTextNode(msg));

        rowElement.appendChild(cellElement);
		parentElement.appendChild(rowElement);
	},

	
    // ----------------------- client API ----------------------------------------------------------
    
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
		this.rows = new Array();
		this.addRows(data.records);
		this.removeRowsFromTBody();

		this.rebuildHeader(this.tableHeadElement, data);

		// create grid data rows
		this.createDataRows(this.tableBodyElement, this.columns);

		this.buildFooterRows(this.tableFootElement, data);
	},


	/**
     * Formats and returns all record values for selected rows.
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
     * Sets all rows containing a checkbox as first column to checked==true
	 * Returns all record values for selected rows.
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
            if (typeof selectionCheckbox.checked != 'undefined') {
				selectionCheckbox.checked = setSelectedTrue;
                selectedRows.push(this.rows[r]);
            }
        }
        
        return selectedRows;
    },

	
	/**
     * Returns an array of DOM elements that represent grid data rows.
     */
    getDataRows: function() {
        return YAHOO.util.Dom.getElementsByClassName('dataRow', "tr", this.parentElement);
    }
}, 
{
    // ----------------------- constants -----------------------------------------------------------
    
    // predefined name for the column that contains multiple selection checkboxes
    COLUMN_NAME_MULTIPLE_SELECTION: 'multipleSelectionColumn',

    // name of the default WFR used to render the data
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecords'
});



/**
 * Command that changes the selected row.
 */
AFM.grid.SelectionCommand = AFM.command.Command.extend({
    
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
	        var dataRows = this.grid.getDataRows();
	        
	        if (this.grid.selectedRowIndex >= 0) {
	            YAHOO.util.Dom.removeClass(dataRows[this.grid.selectedRowIndex], 'selected');
	        }
	        
	        this.grid.selectedRowIndex = this.row.index;
            YAHOO.util.Dom.addClass(dataRows[this.grid.selectedRowIndex], 'selected');
	    }
    }
});

