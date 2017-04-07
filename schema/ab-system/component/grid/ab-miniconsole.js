/**
 * Mini-console class works within the namespace 'grid' and extends the class: AFM.grid.ReportGrid
 * adding index, and filter rows to the header.
 * Most of the basic functionality (build(), etc.) is implemented by small functions 
 * that produce the differences in header rows that are the main diffence between reportGrid and miniConsole
 *
 */


// image file constants
var GRAPHICS_LOCATION		= '/archibus/schema/ab-system/graphics/';
var	IMAGE_FILTER_RUN		= GRAPHICS_LOCATION + 'ab-filter-run.gif';
var	IMAGE_FILTER_CLEAR		= GRAPHICS_LOCATION + 'ab-filter-clear.gif';
var	IMAGE_EXPAND		    = GRAPHICS_LOCATION + 'ab-miniconsole-expand.gif';
var	IMAGE_COLLAPSE		    = GRAPHICS_LOCATION + 'ab-miniconsole-collapse.gif';

var INDEX_DISPLAY_THRESHOLD = 50;


/**
 * The MiniConsole class defines a grid component with additional header functionality.
 */
AFM.grid.MiniConsole = AFM.grid.ReportGrid.extend({

	// filter row is member variable for possible restore of HTML on rebuild
	filterRow: null,
	
	// index row is member variable for possible restore of HTML on rebuild
	indexRow: null,

	// whether to display the index bar
    indexEnabled: false,

	// column on which console is indexed
	indexColumnIndex: -1,

	indexColumnID: null,

	// index entry in the {text, url} format	???
	indexValue: '',
	
	// index level or length of character string shown in index link
	indexLevel: 0,
	
	// holder for actual index entries returned from WFR
	indexEntries: null,

	// whether to display the filter bar
	filterEnabled: false,
	
	// hold FilterValues object between contructor & build calls, after that DOM elements are model + view
	filterValues: [],

	// action listener on column index links
	indexListener: null,

	// action listener on column filter controls
	filterListener: null,
	clearFilterListener: null,

    // whether the filter and index bars are collapse or expanded
    isCollapsed: true,
    
	/**
	 * Constructor creates 'empty' miniConsole; sets internal data structures (columns,rows, DOM element arrays & listeners) & then calls WFR
	 *
	 * @param controlId
	 * @param configObject - map with keys of (at least) [viewDef, groupIndex] and possibly [sortColumnID, indexColumnID, cssClassName, showOnLoad, 
	 *											selectionEnabled, multipleSelectionEnabled, useParentRestriction, refreshWorkflowRuleId, restriction, filterValues, sortAscending]
	 */
	constructor: function(controlId, configObject) {
		this.inherit(controlId, configObject);

		// if index field is not specified, use sort order field instead
		var indexColumnID = configObject.getConfigParameterIfExists('indexColumnID');
		if (valueExistsNotEmpty(indexColumnID)) {
		    this.indexEnabled = true;
			this.indexColumnID = indexColumnID;
			this.indexListener = this.onClickIndex;
		}       
		else {
		    this.indexEnabled = false;
			this.indexColumnID = '';
		}
		this.filterListener = this.onClickFilter;
		this.clearFilterListener = this.clearAllFilters;
		
		var restriction = configObject.getConfigParameterIfExists('restriction');
		if (valueExists(restriction) && restriction != '') {
		    this.restriction = restriction;
		}

		var filterValues = configObject.getConfigParameterIfExists('filterValues');
        if (valueExists(filterValues)) {
            this.filterValues = new Array();
			for (var colName in filterValues) {		
				var value = filterValues[colName];
				if (value != null && trim(value) != '')	{
					this.filterValues.push({"fieldName":  colName, "filterValue": value});
				}
			}
			this.filterEnabled = true;
			this.isCollapsed = false;
		}
	},

	
	// ----------------------- common control API methods ------------------------------------------

        
	// ----------------------- implementation methods ----------------------------------------------

	/**
	 * Add columns to grid from received data
	 * any other initialization that relies on columns existing
	 * called as part of initial WFR callback, onGetDataRecords()
	 */
	initializeColumns: function(data) {
		this.inherit(data);
		this.indexEntries = data.index;
	},


	/**
	 * perform setup ops needed before building control in DOM
	 *
	 * called as part of initial WFR callback, onGetDataRecords()
	 */
	beforeBuild: function() {
		this.inherit();
		this.enableIndex(this.indexEnabled, this.indexColumnID, this.indexEntries);
		this.filterEnabled = true;
	},

	/**
	 * perform ops on control after building it in DOM
	 *
	 * called as part of initial WFR callback, onGetDataRecords()
	 */
	afterBuild: function() {
			this.inherit();
			this.showIndexAndFilter()
	},


	/**
	 * Return standardized parameter for miniConsole's WFR
	 *  
	 */
	getParameters: function(sortValues, index) {
		var parameters = this.inherit(sortValues);
		if (typeof(index) != 'undefined' && index != null) {
		    parameters.indexField = index.columnName;
			parameters.indexLevel = index.index_level;
			parameters.indexValue = index.value + '%';
		}
		parameters.filterValues = this.getFilterValues();

        return parameters;
	},

	/**
	 * Return standardized parameter for grid's initial call to WFR
	 * for fetching column data and, possibly, row data
	 */
	getInitialParameters: function() {
		var parameters = this.inherit();
	    parameters.indexField = this.indexColumnID;
		parameters.indexLevel = '0';
		parameters.indexValue = '';
		parameters.filterValues = this.getFilterValues();
		return parameters;
	},

	/**
	 * return the WFR parameters as used for refresh of the grid
	 * miniConsole's parameters used for refresh 
	 *
	 */
	getParametersForRefresh: function() {
		return this.getParameters(this.getCurrentSortValues(), new AFM.grid.IndexValue(this.indexColumnID, this.indexValue, this.indexLevel));
	},


	/**
	 * Initialize inherited translatableDisplayStrings collection
	 * to contain all those strings that may need to be localized by the WFR for this UI component.
	 */
	initializeTranslatableDisplayStrings: function() {
		this.inherit();
		this.translatableDisplayStrings.push(new AFM.view.TranslatableDisplayString('Clear',''));
		this.translatableDisplayStrings.push(new AFM.view.TranslatableDisplayString('Filter',''));
	},


	//-----------------------------------------index--

	/**
	 * set the index column from the object ID (i.e., tableName.ColumnName)
	 */
	setIndexColumnByID: function(indexColumnID) {
		//var test = indexColumnID.replace(/^\s+/, '');
		if (this.columns == null && indexColumnID.length == 0 )	{
			return;
		}
		for (var i=0; i < this.columns.length; i++) {
			if (this.columns[i].id == indexColumnID) {
				this.indexColumnIndex = i;
				return true;
			}
		}
		// use sort column if not defined
		if (this.sortColumnID != '') {
			for (var i=0; i < this.columns.length; i++) {
				if (this.columns[i].id == this.sortColumnID) {
					this.indexColumnIndex = i;
					return true;
				}
			}
		}

		// use 1st column if sort not defined
		for (var i=0; i < this.columns.length; i++) {
			var type = this.columns[i].type;
			if (this.columnTypeIsSortable(type)) {
				this.indexColumnIndex = i;
			}
		}	
	},


	/**
	 * return the column on which miniconcole is indexed, or null if not set
	 */
	getIndexColumn: function() {
        var indexColumn = null;
        if (this.indexColumnIndex >= 0) {
            indexColumn = this.columns[this.indexColumnIndex];
        }
        return indexColumn;
	},

	/**
	 * return the name of the column on which miniconcole is indexed, or '' if not set
	 */
	getIndexColumnName: function() {
        var indexColumnName = '';
        var indexColumn = this.getIndexColumn();
        if (null != indexColumn) {
            indexColumnName = indexColumn.name;
        }
        return indexColumnName;
	},

	/**
	 * set the values of the actual index row entries
	 * an array of label : count pairs
	 */
	setIndexEntries: function(indexEntries) {
		if (typeof indexEntries != 'undefined') {
			this.indexEntries = indexEntries;		
		}
	},

	/**
	 * Enables or disables index row.
	 * @param {enabled} Boolean flag that enables or disables this feature.
	 * @param {indexEntries} array of index entries in the {text, url} format.
	 */
	enableIndex: function(enabled, newIndexColumnID, indexEntries, level) {
		this.indexEnabled = enabled;
		if (!enabled || this.columns == null || this.columns.length <= this.indexColumnIndex) {
			return;
		}
		// changing index columns reset level to zero unless explicitly given
		if (this.indexColumnID != newIndexColumnID) {
			if (level)	{
				this.indexLevel = level;
			}
			else {
				this.indexLevel = 0;
			}			
		}
		this.setIndexColumnByID(newIndexColumnID);
		this.setIndexEntries(indexEntries);
	},

	/**
	 * set the index level, the length of the index string
	 */
	setIndexLevel: function(level) {
		this.indexLevel = level;
	},

	getIndexLevel: function() {
		return this.indexLevel;
	},

	/**
	 * Add index object as index column:level:value triplets, possibly empty but not null  (currently limited to 0 or 1)
	 * store for subsequent use, e.g., when filter added/modified
	 *
	 * value : text of index link (e.g., '12x(32)' => '12' is useful part) 
	 * level : -1 indicates moving up one level, 0 indicates all, +1 indicates drill-down
	 */
	setIndexValue: function(value) {
		indexValue = value;
	},

	getIndexValue: function() {
		return (null != this.indexValue) ? this.indexValue : '';
	},



	/**
	 * Set the member vars storing the currently clicked index,
	 * useful for calling from click listener
	 */
	setCurrentIndex: function(index) {
		for (var i=0; i < this.columns.length; i++) {
			if (this.columns[i].id == index.columnName) {
				this.indexColumnIndex = i;
				break;
			}
		}
		this.indexValue = index.value;
		this.indexLevel = index.index_level;
	},


	/**
	 * Return an IndexValue object packaging the index args to the WFR
	 *
	 */
	getCurrentIndex: function() {
		return new AFM.grid.IndexValue(this.indexColumnID, this.getIndexValue(), this.indexLevel);
	},

	/**
	 * set the index listener to use the header cell as 'this' 
	 * and add the miniConsole itself as the second arg to the listener function
	 *
	 */
	activateIndexListener: function(indexRow, param) {
		if (this.indexListener != null && typeof this.indexListener == "function") {
			YAHOO.util.Event.addListener(indexRow, "click", this.indexListener, param);
			YAHOO.util.Event.addListener(indexRow, "keypress", function(e) {
				if(e.which == 13){
					e.target.click();
				}
				else if(e.keyCode == 13){
					e.srcElement.click();
				}
			});
		}
	},


	/**
	 * on click of index link send index parameters and refill the miniConsole through callback
	 */
	onClickIndex: function(e, miniConsoleAndIndex) {
		var grid = miniConsoleAndIndex.miniConsole;
		var index = miniConsoleAndIndex.index;
		// nothing within the grid tells us which index was clicked, so set from out here.
		grid.setCurrentIndex(index);
		var parameters = grid.getParameters(grid.getCurrentSortValues(), index);
		var result = AFM.workflow.Workflow.runRuleAndReturnResult(grid.refreshWorkflowRuleId, parameters);
		if (result.code == 'executed') {
			grid.reloadOnIndex(result.data);
		} 
		else {
			AFM.workflow.Workflow.handleError(result);
		}
	},


	//---------------------------------------filter----

	/**
	 * Set or modify a filter value AFTER grid is built
	 *
	 */
	setFilterValue: function(columnName, val) {
		var elem = $(this.getFilterInputId(columnName));
		if (null != elem) {
			elem.value = val;
		}
	},

	/**
	 * Reset the value of all the filter input elements in the document to null
	 */
	clearAllFilters: function(e, miniConsole) {
		var filterElements = miniConsole.filterRow.getElementsByTagName('input');
		for (var i=0, elem; elem = filterElements[i]; i++) {
			if (elem.id.indexOf('_filterColumn_') != -1) 
				elem.value = '';			
		}
		var parameters = miniConsole.getParameters(miniConsole.getCurrentSortValues(), 
											new AFM.grid.IndexValue(miniConsole.indexColumnID, miniConsole.indexValue, miniConsole.indexLevel));
		AFM.workflow.Workflow.runRule(miniConsole.refreshWorkflowRuleId, parameters, miniConsole.reloadOnFilterCallback, miniConsole);
	},


	/**
	 * Return collection of filter name:value pairs, possibly empty but not null
	 *
	 */
	getFilterValues: function() {
		var filterFieldValues = new Array();
		if (this.filterEnabled) {
			// get filter values from DOM elements
			if (this.filterRow != null && typeof(this.filterRow) != 'undefined') { 
				var filterInputs = this.filterRow.getElementsByTagName('input');
				for (var i=0, filterInput; filterInput = filterInputs[i]; i++) {
				    var index = filterInput.id.indexOf('_filterColumn_');
					if (index != -1 && 
					     null != filterInput.id && 
					     null != filterInput.value &&  
					      '"' != filterInput.value &&  
					        0  < filterInput.value.length ) {
					    var fieldName = filterInput.id.substring(index + 14);
						// KB 3017739 remove wrapping single or dbl quotes
						if ((filterInput.value.charAt(0) == "'" && filterInput.value.charAt(filterInput.value.length - 1) == "'") ||
							(filterInput.value.charAt(0) == '"' && filterInput.value.charAt(filterInput.value.length - 1) == '"')) {
							filterInput.value = filterInput.value.substring(1, filterInput.value.length - 1);
						}

						filterFieldValues.push({"fieldName": fieldName, "filterValue": filterInput.value});
					}
				}
			}
			// get filter values from member variable because DOM elements don't exist yet
			else if ((this.filterRow == null || typeof(this.filterRow) == 'undefined') && 
				(this.filterValues != null && this.filterValues.length > 0)) {
				filterFieldValues = this.filterValues;
			}
		}
		return toJSON(filterFieldValues);
	},




	/**
	 * set the filter listener to use the header cell as 'this' 
	 * and add the miniConsole itself as the second arg to the listener function
	 *
	 */
	activateFilterListener: function(filterLink, miniConsole) {
		if (this.filterListener != null && typeof this.filterListener == "function") {
			YAHOO.util.Event.addListener(filterLink, "click", this.filterListener, miniConsole);
			YAHOO.util.Event.addListener(filterLink, "keypress", function(e) {
				if(e.which == 13){
					e.target.click();
				}
				else if(e.keyCode == 13){
					e.srcElement.click();
				}
			});
		}
	},

	activateClearFilterListener: function(clearLink, miniConsole) {
		if (this.clearFilterListener != null && typeof this.clearFilterListener == "function") {
			YAHOO.util.Event.addListener(clearLink, "click", this.clearFilterListener, miniConsole);
			YAHOO.util.Event.addListener(clearLink, "keypress", function(e) {
				if(e.which == 13){
					e.target.click();
				}
				else if(e.keyCode == 13){
					e.srcElement.click();
				}
			});
		}
	},

	
	/**
	 * callback to refill the miniConsole after filter link onClick
	 *
	 */
	reloadOnFilterCallback: function(result) {
		if (result.code == 'executed') {
			this.reloadOnFilter(result.data);
		} 
		else {
			alert(result, 'ViewHandlers.getDataRecords');
		}
	},

	/**
	 * event handler for on click of filter link 
	 * send all parameters and refill the miniConsole through callback	 
	 */
	 onClickFilter: function(e, grid) {
		var parameters = grid.getParameters(grid.getCurrentSortValues(), new AFM.grid.IndexValue(grid.indexColumnID, grid.indexValue, grid.indexLevel));
		AFM.workflow.Workflow.runRule(grid.refreshWorkflowRuleId, parameters, grid.reloadOnFilterCallback, grid);
	},
	 

	/**
	 * Returns the number of generated table columns + 1 for additional (expand/collapse button) column.
	 */
	getNumberOfColumns: function() {
		var gridColCount = this.inherit();
		return gridColCount + 1;
	},
	
	// ----------------------- multiple selection --------------------------------------------------

    onChangeMultipleSelection: function(e, row) {
    },

	// ----------------------- HTML DOM building ---------------------------------------------------
	/**
	 * Creates HTML DOM tree containing grid <table> element and its children.
	 */
	 // see AFM.grid.ReportGrid.build()
	 //build: function()

	/**
	 * Add the header rows to the table
	 * sandwich super's header rows in between index rows and filter rows
	 *
	 */
	buildHeader: function(parentElement) {
		// create grid index row
		if (this.indexEnabled && this.indexEntries != null && this.indexEntries.length > 0) {
			this.createIndexRows(parentElement);
		}

		// super.buildHeader() 
		this.inherit(parentElement);

		// create grid filter row
		if (this.filterEnabled) {
		    this.createFilterRow(parentElement);
		}		
	},
	

	/**
	 * on refresh re-add the previously constructed header row(s) to the table
	 * re consstruct index rows IF NEEDED (data.index != this.indexEntries)
	 *
	 */
	rebuildHeader: function(parentElement, data) {
		// add pre-header rows, any custom rows
		this.buildPreHeaderRows(parentElement);

		var rebuildNeeded = !this.indicesEqual(this.indexEntries, data.index);
		// create index row
		if (this.indexEnabled && rebuildNeeded) {
			this.indexEntries = data.index;
			if (this.indexEntries != null && this.indexEntries.length > 0) {
				this.createIndexRows(parentElement);
			}
		}
		// use existing index row
		else if (this.indexEnabled && this.indexRow) {
			parentElement.appendChild(this.indexRow);
		}

		// reload old column title header row(s)
		for (var i=0; i < this.headerRows.length; i++) {
			parentElement.appendChild(this.headerRows[i]);
		}
		// reload old filter header row(s)
		if (this.filterRow != null) {
			parentElement.appendChild(this.filterRow);
		}
	},



	/**
	 * compare two sets of index entries
	 *
	 */
	indicesEqual: function(currentIndexEntries, newIndexEntries) {
		var result = false;
		// first test whether two arrays are structurally equal
		if ((currentIndexEntries && newIndexEntries) &&
			(currentIndexEntries != null && newIndexEntries != null) &&
			(currentIndexEntries.length == newIndexEntries.length)) {
			// second test whether each entry is equal
            for (var i=0, curEntry, newEntry; curEntry = currentIndexEntries[i], newEntry = newIndexEntries[i]; i++) {
                if (curEntry.value != newEntry.value ||
                    curEntry.count != newEntry.count ||
                    curEntry.index_level != newEntry.index_level) {
                    // two entries are not equal
                    result = false;
                    return result;
                }
            }
			result = true;
		}
		return result;
	},

	/**
	 * Creates any additional columns in the header
	 * In the case of the miniConsole this is the hide filter/clear button
	 */
	createAdditionalHeaderColumns: function(headerRow) {
		var extraCell = document.createElement('th');
		extraCell.className = 'headerButtons';
		this.createHeaderButtons(extraCell);
		headerRow.appendChild(extraCell);
	},


    /**
     * Creates filter buttons.
     */
    createHeaderButtons: function(cell) {
		var collapseExpandLink = this.createLink();
		var collapseExpandImage = this.createImage(IMAGE_COLLAPSE, getMessage('collapse'), 0);
		collapseExpandImage.id = 'collapseExpand_' + this.controlId;
		collapseExpandLink.appendChild(collapseExpandImage);
		cell.appendChild(collapseExpandLink);
		YAHOO.util.Event.addListener(collapseExpandLink, "click", this.collapseExpandListener, this, true);
		YAHOO.util.Event.addListener(collapseExpandLink, "keypress", function(e) {
			if(e.which == 13){
				e.target.click();
			}
			if(e.keyCode == 13){
				e.srcElement.click();
			}
		});
	},

	

	/**
	 *	While creating data rows add extra columns to match any columns added to header for controls
	 *
	 */
	addExtraRowCells: function(rowElement) {
    	var extraCell = document.createElement('td');
    	rowElement.appendChild(extraCell);
	},

	
	/**
	 * Creates grid index rows and add them to the grid. Index header may actually occupy multiple rows of the table.
	 * Calculate number of rows based on entries received from WFR & grid.indexEntriesPerRow
	 *
	 * Indices received from WFR contains translated Up & All link if applicable
	 * Up and All link are denoted by a count of 0 & -1, respectively
	 * All's count must be calculated from existing Down links' counts
	 */
	createIndexRows: function(parentElement) {
        if (this.indexColumnIndex < 0) {
            // index is disabled
            return;
        }        
        
		var indexRow = document.createElement('tr');
		indexRow.className = 'indexRow';
		parentElement.appendChild(indexRow);
		
		// index cell occupies the complete width of the grid
		var indexCell = document.createElement('th');
		indexCell.colSpan = this.getNumberOfColumns();
		indexCell.className = 'index';
		indexRow.appendChild(indexCell);
		
		// create leftmost cell (indexColumn title or blank) of each row
		var indexTitle = document.createElement('div');
	    indexTitle.className = 'indexTitle';
		indexTitle.appendChild(document.createTextNode('' + this.columns[this.indexColumnIndex].name + ':'));
		indexCell.appendChild(indexTitle);
		
		var indexBody = document.createElement('div');
		indexBody.className = 'indexBody';
		indexCell.appendChild(indexBody);

		// first run through entries to see if only one entry has entry.count >= 1. if so NO bDrilldownExists
		var bDrilldownExists = this.testForDrillDown();
		// counter for tally displayed by 'All link'
		var allCnt = 0;

		// form single table row of index links within header
		for (var i = 0, indexEntry; indexEntry = this.indexEntries[i]; i++) {
			allCnt = this.createSingleIndexLink(i, indexBody, bDrilldownExists, allCnt, indexEntry);
		}				    		
		this.indexRow = indexRow;
	},


	/**
	 *  Create individual index links as children of 
	 *
	 * @param i			 index into complete array of indices returned from WFR, 
	 * @param indexCell  parent element - header cell holding this row of indices
	 * @param bDrillDownExists boolean flag for whether any down links exist - if only one down link exists it is not styled as an <a>
	 * @param allCnt     previous All count to be incremented by current link's count
	 * @param indexEntry index entry from WFR for which this link is being created
	 *
	 */
	createSingleIndexLink: function(i, indexCell, bDrilldownExists, allCnt, indexEntry)	{
		var bIndexEntryNonLink = false;
		var indexLink = document.createElement('a');
		indexLink.href = 'javascript: //' ;
		var indexLinkVal;
		var indexLinkLevel;
		//var iCount = indexEntry.count;
		// 'UP' or 'TOP' link (indexEntry.count for UP: -1, for TOP: -9)
		if (indexEntry.count < 0 && i > 0)	{
			indexLink.appendChild(document.createTextNode(indexEntry.value));
			// set vals for listener arg for UP
			indexLinkVal = this.indexEntries[i - 1].value.substring(0, Math.max(this.indexEntries[i - 1].value.length - 2, 1));
			indexLinkLevel = Math.max(0, this.indexLevel + parseInt(indexEntry.count));
		}
		// 'down' links
		else if (indexEntry.count > 0) {
			if (!bDrilldownExists) {
				indexLink = document.createElement('span');
				bIndexEntryNonLink = true;
			}
			indexLink.appendChild(document.createTextNode(indexEntry.value));
			var indexCount = document.createElement('span');
			indexCount.appendChild(document.createTextNode('[' + indexEntry.count + '] '));
			indexCount.className = 'count';
			indexLink.appendChild(indexCount);
			// set vals for listener arg
			indexLinkVal = indexEntry.value;
			indexLinkLevel = this.indexLevel + 1;
			allCnt += parseInt(indexEntry.count);
		}
		// 'ALL' non-link
		else if (indexEntry.count == 0)	{
			indexLink = document.createElement('span');
			var indexText = document.createTextNode(indexEntry.value);
			indexLink.className = 'all';
			var indexCount = document.createElement('span');
			indexCount.appendChild(document.createTextNode('[' + allCnt + '] \t '));
			indexCount.className = 'count';
			indexLink.appendChild(indexText);
			indexLink.appendChild(indexCount);					
			// set flag for non-link
			bIndexEntryNonLink = true;
		}
		indexCell.appendChild(indexLink);
		// 'ALL' is not a link, just text
		if (!bIndexEntryNonLink) {
			var indexVal = new AFM.grid.IndexValue(this.columns[this.indexColumnIndex].id, indexLinkVal, indexLinkLevel);
			var miniConsoleAndIndex = {'miniConsole' : this, 'index' : indexVal };
			this.activateIndexListener(indexLink, miniConsoleAndIndex);
		}
		return allCnt;
	},


	/**
	 * Helper function to determine if there's more than one drilldown link
	 * if not indices are not links
	 */
	testForDrillDown: function() {
		var ret =  false;
		var iDrilldownEntryCount = 0;
		for (var k = 0, idx; idx = this.indexEntries[k]; k++) {
			if (idx.count > 0) {
				if (++iDrilldownEntryCount > 1) {
					ret = true;
					break;
				}
			}
		}
		return ret;
	},


	/**
	 * Creates grid filter row and adds it to the grid.
	 */
	createFilterRow: function(parentElement) {
		var row = document.createElement('tr');
		row.className = 'filterRow';
		this.filterRow = row;

		for (var c = 0; c < this.columns.length; c++) {			
			var filterCell = document.createElement('th');
//		    filterCell.className = 'filter';
			row.appendChild(filterCell);		
			this.createFilterCellContent(c, filterCell);
		}

		var extraCell = document.createElement('th');
		extraCell.className = 'headerButtons';
		this.createFilterButtons(extraCell);
		row.appendChild(extraCell);
		
		parentElement.appendChild(row);
	},

	
	/**
	 * Creates filter cell content.
	 */
	 createFilterCellContent: function(columnIndex, cell) {
		var column = this.columns[columnIndex];

		if (column.filterEnabled) {
		    var input = document.createElement('input');
		    input.setAttribute('title', getMessage('grid_filter'));
		    input.size = 12;
			input.style.marginRight = '4';
			input.id = this.getFilterInputId(column.id);
			// justify filter input to match content (numbers right justified, text left justified)
			cell.className = column.type == 'number' ? 'filterCellNumber' : 'filterCellText';
			cell.appendChild(input);
			for (var i=0, filterVal; filterVal = this.filterValues[i]; i++) {
				if (filterVal.fieldName == column.id) {
					input.value = filterVal.filterValue;
					break;
				}
			}
			cell.appendChild(document.createTextNode(' '));
		} 
		else {
			cell.appendChild(document.createTextNode(''));
		}
	 },


    /**
     * Creates filter buttons.
     */
    createFilterButtons: function(cell) {
		var searchLink = document.createElement('a');
		searchLink.href = 'javascript: //';
		searchLink.appendChild(this.createImage(IMAGE_FILTER_RUN, getMessage('filter'), 2, 16, 16));
		cell.appendChild(searchLink);
        this.activateFilterListener(searchLink, this);

        var clearLink = document.createElement('a');
        this.activateClearFilterListener(clearLink, this);
        clearLink.href = 'javascript: //';
        clearLink.appendChild(this.createImage(IMAGE_FILTER_CLEAR, getMessage('clear'), 2, 16, 16));
        cell.appendChild(clearLink);
	},
	
	/**
	 * Handles index/filter bar expand and collapse events.
	 */
	collapseExpandListener: function() {
	    if (this.isCollapsed == true) {
	        this.isCollapsed = false;
	    } else {
	        this.isCollapsed = true;
	    }
	    this.showIndexAndFilter();
	},
	
	/**
	 * Displays or hides the index and filter bars depending on the isCollapsed property.
	 */
	showIndexAndFilter: function() {
	    var image = $('collapseExpand_' + this.controlId);
	    var indexRow = YAHOO.util.Dom.getElementsByClassName('indexRow', "tr", this.parentElement);
	    var filterRow = YAHOO.util.Dom.getElementsByClassName('filterRow', "tr", this.parentElement);
	    if(image != null){
	    if (this.isCollapsed == false) {
	        image.src = IMAGE_COLLAPSE;
	        image.alt = 'Collapse Filters';
	        image.title = 'Collapse Filters';
	        if (indexRow.length > 0) {
	           YAHOO.util.Dom.setStyle(indexRow, 'display', '');
	        }
	        if (filterRow.length > 0) {
	           YAHOO.util.Dom.setStyle(filterRow, 'display', '');
	        }
	    } else {
	        image.src = IMAGE_EXPAND;
	        image.alt = 'Expand Filters';
	        image.title = 'Expand Filters';
	        
	        if (indexRow.length > 0) {
	           YAHOO.util.Dom.setStyle(indexRow, 'display', 'none');
	        }
	        if (filterRow.length > 0) {
	           YAHOO.util.Dom.setStyle(filterRow, 'display', 'none');
	        }
	    }
	    }
	},
	
	


	/**
	 * rebuild the table, reusing the header & filter bars
	 * after filter link event
	 */
	reloadOnFilter: function(data) {
		this.rows = new Array();
		this.addRows(data.records);
		this.removeRowsFromTBody();

		this.rebuildHeader(this.tableHeadElement, data);

		// create grid data rows
		this.createDataRows(this.tableBodyElement, this.columns);

		if(data.records.length == 0){
				this.hasNoRecords = true;
				this.buildMoreRecordsFooterRow(this.tableFootElement);
		}	else {		
				this.hasNoRecords = false;
				this.buildFooterRows(this.tableFootElement, data);
		}	
	},

	/**
	 * rebuild the table, reusing the header & filter bars
	 * after index link event
	 */
	reloadOnIndex: function(data) {
   		this.indexEntries = data.index;
		this.rows = new Array();
		this.addRows(data.records);

		this.removeRowsFromTBody();
		
		this.buildPreHeaderRows(this.tableHeadElement);
		// create grid index row(s)
		if (this.indexEnabled) {
			this.createIndexRows(this.tableHeadElement);
		}
		// append old header row(s)
		for (var i=0; i < this.headerRows.length; i++) {
			this.tableHeadElement.appendChild(this.headerRows[i]);
		}
		// restore grid filter row
		if (this.filterEnabled) {
			this.tableHeadElement.appendChild(this.filterRow);
		}		
		// create grid data rows
		this.createDataRows(this.tableBodyElement, this.columns);

		this.buildFooterRows(this.tableFootElement, data);
	},
	
	/**
	 * Returns ID of the filter input element for specified column.
	 */
	getFilterInputId: function(columnId) {
	    return this.controlId + '_filterColumn_' + columnId;
	}
});



/**
 * This is a helper class that defines the index field.
 */
AFM.grid.IndexValue = Base.extend({
	// full table.column of index column
	columnName: '',
	
	// value for the SQL WHERE columnName LIKE 'val%' clause
	value: '',

	// level (renamed because 'level' is a keyword in Oracle)
	index_level: 0,

	/**
	 * Constructor.
	 */
	constructor: function(column, val, lvl) {
		this.columnName = column;
		this.value = val;
		this.index_level = lvl;
	}
});

