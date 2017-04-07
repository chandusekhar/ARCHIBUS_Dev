/**
 * Mini-console class works within the namespace 'grid' and extends the class: Ab.grid.ReportGrid
 * adding index, and filter rows to the header.
 * Most of the basic functionality (build(), etc.) is implemented by small functions 
 * that produce the differences in header rows that are the main diffence between reportGrid and miniConsole
 *
 */



var INDEX_DISPLAY_THRESHOLD = 50;


/**
 * The MiniConsole class defines a grid component with additional header functionality.
 */
Ab.grid.MiniConsole = Ab.grid.ReportGrid.extend({

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

	// search palette DOM element
	filterPaletteElement: null,

	// count of entries & exits to test for hide
	filterPaletteEntryCount: 0,

	// shorthand boolean to guide listeners & workaround FF 2 bug
	filterPaletteIsActive: false,

    // whether the filter and index bar's collapse or expanded
    isCollapsed: false,
	
	// image file constants
	imageFilterClear: '',
	imageExpand: '',
	imageCollapse: '',

	// record limit defined in afm-cofig.xml
	configurationRecordLimit: -1,
	
	// boolean for whether paging exists	
	hasPaging: false, 

	// action listener for Prev link
	prevListener: null,
	
	// action listener for Next link
	nextListener: null,
	
	// holder for first row of current page
	currentPageFirstRecord: {},
	
	// holder for last row of current page
	currentPageLastRecord: {},
	
	// array of first rows
	firstRecords: null,
	
	// count of all records found in the index
	allCount: 0,
	
	// whether prev or next
	pagingAction: null,
	
	// current page number
	currentPage: -1,
	
	// total number of pages
	totalPages: -1,
	
	pagingRecordLimit: -1,
	

	/**
	 * Constructor creates 'empty' miniConsole; sets internal data structures (columns,rows, DOM element arrays & listeners) & then calls WFR
	 *
	 * @param id
	 * @param configObject - map with keys of (at least) [viewDef, groupIndex] and possibly [sortColumnID, indexColumnID, cssClassName, showOnLoad, 
	 *											selectionEnabled, multipleSelectionEnabled, useParentRestriction, refreshWorkflowRuleId, restriction, filterValues, sortAscending]
	 */
	constructor: function(id, configObject) {
		this.inherit(id, configObject);

		// if index column is not specified, do not show index row
		var indexColumnID = configObject.getConfigParameterIfExists('indexColumnID');
		if (valueExistsNotEmpty(indexColumnID)) {
		    this.indexEnabled = true;
			this.indexColumnID = indexColumnID;
			this.indexListener = this.onClickIndex;
			this.prevListener = this.onClickPrev;
			this.nextListener = this.onClickNext;	
			this.isCollapsed = false;
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
        
        var showIndexAndFilterOnLoad = configObject.getConfigParameterIfExists('showIndexAndFilterOnLoad');
        this.isCollapsed = !showIndexAndFilterOnLoad;
        		
		// initialize image file 'constants'
		this.imageFilterClear = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-filter-clear.png';
		this.imageExpand = Ab.view.View.contextPath + '/schema/ab-system/graphics/ab-miniconsole-expand.gif';
		this.imageCollapse = Ab.view.View.contextPath + '/schema/ab-system/graphics/ab-miniconsole-collapse.gif';

		// initialize paging vfariables
		this.firstRecords = [];
		this.pagingAction = null;
		this.currentPageFirstRecord = null;
		this.currentPageLastRecord = null;
		this.configurationRecordLimit = configObject.getConfigParameterIfExists('configurationRecordLimit');

	},

	
	// ----------------------- common control API methods ------------------------------------------

        
	// ----------------------- implementation methods ----------------------------------------------

	/**
     * Add control-specific functionality to grid columns. 
	 */
	initializeColumns: function() {
		this.inherit();
		this.setFilterEnabled();
	},

	/**
	 * Set a flag on each column 
	 * whether or not it can be used i miniconsole filter header
	 * based on data type
	 *
	 */
	setFilterEnabled: function() {
		var differentUnits = (View.project.units != View.user.displayUnits);
		
		for (var i=0, col; col = this.columns[i]; i++) {
			var fieldDef = this.getFieldDef(col.id);
			var isDateField = (fieldDef && fieldDef.hasOwnProperty('type'))? (fieldDef.type.toUpperCase() == 'JAVA.SQL.DATE') : false;
			var hasDifferentUnits = (fieldDef && (fieldDef.numericFormat == 'area' || fieldDef.numericFormat == 'length') && differentUnits);

			if (!col.isVirtual  && !isDateField && !hasDifferentUnits &&
					(col.type == 'text' || col.type == 'number' || col.type == 'link' || col.type == 'number_link')) {
				col.filterEnabled = true;
			}
			else {
				col.filterEnabled = false;
			}
		}
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
		this.showIndexAndFilter();
		this.addFilterPaletteAndListeners();
	},

    /**
     * Updates the grid header rows after showing/hiding/sorting columns.
     */
	updateHeader: function() {
		this.inherit();
		this.showIndexAndFilter();
		this.addFilterPaletteAndListeners();
	},

	/**
	 * Add a div for attaching the filter expand/collapse button & filter/clear buttons
	 * attach listeners to first column title header, first column filter and the palette itself
	 *
	 * don't actually create the palette buttons in case the miniconsole is not visible. 
	 * We can't position the palette properly unless the control is displayed (e.g., in a non-selected tab)
	 */
	addFilterPaletteAndListeners: function() {
		var smartSearchDivId = 'searchDiv_' + this.parentElement.id;
		var smartSearchDiv = document.getElementById(smartSearchDivId);
		if (smartSearchDiv == null) {
			this.filterPaletteElement = document.createElement('div');
			this.filterPaletteElement.id = smartSearchDivId;
			this.filterPaletteElement.style.zIndex = -2;
			this.filterPaletteElement.style.display = 'none';
			this.filterPaletteElement.className = 'smartFilterPalette';
			this.parentElement.appendChild(this.filterPaletteElement);

			//this.createHeaderButtons( this.filterPaletteElement );
			//this.createFilterButtons( this.filterPaletteElement );
		}
		
		// place mouse listeners on all column headers
		if (this.headerRows.length > 0) {
			var headerRow = this.headerRows[0];
			var grid = this;
			for (var i=0, headerCell; headerCell = this.headerRows[0].childNodes[i]; i++) {
				this.activateFilterPaletteListener(headerCell, false);
			}
		}
		if (this.filterRow != null) {
			for (var j=0, filterCell; filterCell = this.filterRow.childNodes[j]; j++) {
				this.activateFilterPaletteListener(filterCell, false);
			}
		}
		this.activateFilterPaletteListener(this.filterPaletteElement, true);
	},

	expandIndexAndFilter: function(){
		if(this.filterEnabled){
			this.isCollapsed = false;
			this.showIndexAndFilter();
		}
	},
	
	/**
	 * Attach listeners to the element
	 * mouseOver exposes & increments count
	 * mouseOut decrements coutn & hides if count == 0
	 */
	activateFilterPaletteListener: function(element, self) {
		var delegateOver = !self ? this.filterPaletteExposeListener.createDelegate(this) : this.filterPaletteExposeSelfListener.createDelegate(this);
		var delegateOut = this.filterPaletteHideListener.createDelegate(this);
	    Ext.fly(element).on({
			'mouseover' : {fn: delegateOver, scope: element},
			'mouseout' : {fn: delegateOut, scope: element}
		});
	},
	
	/**
	 * mouseOver listeners to show the palette & increment counter
	 */
	filterPaletteExposeListener: function() {
		// if palette buttons haven't been created yet, create and reposition
		//if (this.filterPaletteElement.firstChild == null) {
			var extTop = Ext.fly(this.tableBodyElement).getTop(false);
			var extLeft = Ext.fly(this.tableBodyElement).getLeft(false);
			Ext.fly(this.filterPaletteElement).setY(extTop);
			Ext.fly(this.filterPaletteElement).setX(extLeft);
		//}

		// expose
		this.filterPaletteElement.style.zIndex = 200;
		this.filterPaletteElement.style.visibility = 'visible';
		this.filterPaletteIsActive = true;		
		if (this.filterPaletteEntryCount == 0) {
			this.filterPaletteEntryCount++;
		}
	},

	/**
	 * Handle bug in Firefox 2.0.0.17 where listeners not disabled for 'hidden' elements
	 * For palette only, continue showing palette if palette still exposed,
	 * but when palette is not shown mouseover doesn't expose it.
	 */
	filterPaletteExposeSelfListener: function() {
		if (this.filterPaletteElement.style.zIndex >= 0) {
			this.filterPaletteElement.style.zIndex = 200;
			this.filterPaletteElement.style.visibility = 'visible';
			this.filterPaletteIsActive = true;
			if (this.filterPaletteEntryCount == 0) {
				this.filterPaletteEntryCount++;
			}
		}
	},

	/**
	 * mouseOut listeners to decrement counter & possibly hide the palette after delay
	 */
	filterPaletteHideListener: function() {
		if (this.filterPaletteEntryCount > 0) {
			this.filterPaletteEntryCount--;
		}
		// defer hide for 1/2 sec
		this.hideFilterPalette.defer(500, this);
	},

	/**
	 * test counter & possibly hide the palette
	 */
	hideFilterPalette: function() {
		if (this.filterPaletteEntryCount <= 0 ) {
			this.filterPaletteElement.style.zIndex = -2;
			this.filterPaletteElement.style.visibility = 'hidden';
			this.filterPaletteIsActive = false;
		}
	},
	
	/**
	 * Miniconsole sort adds a spurious increment to the palette counter, decrement to keep it straight
	 */
	onClickSort: function(columnIndex) {
		this.firstRecords = [];
		this.inherit(columnIndex);
		this.restorePreviousSelections();
	},



	/**
	 * Return standardized parameter for miniConsole's WFR
	 *  
	 */
	getParameters: function(sortValues, index) {
		var parameters = this.inherit(sortValues);
		if (typeof(index) != 'undefined' && index != null) {
			this.indexColumnID = index.columnName;
			this.indexLevel = index.index_level;
			this.indexValue = index.value + '%';
		}
		// sort from reportGrid has no idex arg, use this' index properties
		if (typeof(this.indexColumnID) != 'undefined' && this.indexColumnID != null) {
		    parameters.indexField = this.indexColumnID;
			parameters.indexLevel = this.indexLevel;
			parameters.indexValue = this.indexValue + '%';
		}
		parameters.filterValues = this.getFilterValues();
		parameters.pagingAction = this.pagingAction;
		parameters.currentPageFirstRecord = this.currentPageFirstRecord;
		parameters.currentPageLastRecord = this.currentPageLastRecord;
		parameters.currentPage = this.currentPage;
		if (this.firstRecords.length > 0){
			parameters.firstRecords = this.firstRecords[this.firstRecords.length-1];
			
		} else {
			parameters.pagingAction = null;
			parameters.currentPageFirstRecord = {};
			parameters.currentPageLastRecord = {};
			parameters.firstRecords = {};		
		}
		
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
		parameters.pagingAction = this.pagingAction;
		return parameters;
	},

	/**
	 * return the WFR parameters as used for refresh of the grid
	 * miniConsole's parameters used for refresh 
	 *
	 */
	getParametersForRefresh: function() {
		return this.getParameters(this.getCurrentSortValues(), new Ab.grid.IndexValue(this.indexColumnID, this.indexValue, this.indexLevel));
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
		//View.log('Index = ' + index.value);
		this.indexLevel = index.index_level;
	},


	/**
	 * Return an IndexValue object packaging the index args to the WFR
	 *
	 */
	getCurrentIndex: function() {
		return new Ab.grid.IndexValue(this.indexColumnID, this.getIndexValue(), this.indexLevel);
	},

	/**
	 * set the index listener to use the header cell as 'this' 
	 * and add the miniConsole itself as the second arg to the listener function
	 *
	 */
	activateIndexListener: function(indexLink, index) {
		if (this.indexListener != null && typeof this.indexListener == "function") {
		    var delegate = this.indexListener.createDelegate(this, [index]);
		    Ext.fly(indexLink).addListener("click", delegate);
		}
	},

	/**
	 * on click of index link send index parameters and refill the miniConsole through callback
	 */
	onClickIndex: function(index) {
		// clear previous and next restriction if navigate back to top level or if switching between indexes
		if((index.index_level == 0) || (this.indexValue.charAt(0) != index.value.charAt(0)) || (this.indexLevel > index.index_level) ){
			this.firstRecords = [];						
		}
		
		// nothing within the grid tells us which index was clicked, so set from out here.
		this.setCurrentIndex(index);
		var parameters = this.getParameters(this.getCurrentSortValues(), index);
		try {
		    var result = this.getData(parameters);
			this.reloadOnIndex(result.data);
			this.restorePreviousSelections();
		} catch (e) { 
			this.handleError(e);
		}
	},
	
	/**
	 * Restore previously selected rows
	 * Common helper method for both onClick and onFilter
	 */	
	restorePreviousSelections: function() {
		if(!this.selectionAcrossPagesEnabled){
			return;
		}
		var selectedRows = this.getAllSelectedRows();	
		if(selectedRows.length === 0){
			return;
		}
		if(this.multipleSelectionEnabled || this.selectValueType === 'multiple'){
			// restore any existing selected 
			for (var r = 0, row; row = this.rows[r]; r++) {
	        	for (var rr = 0, selectedRow; selectedRow = selectedRows[rr]; rr++) {
					if (this.selectionModel.isIdentical(row, selectedRow)) {
						this.selectRowChecked(r)
						break;
					}
				}
			}
		}
	},

	/**
	 * set the index listener to use the header cell as 'this' 
	 * and add the miniConsole itself as the second arg to the listener function
	 *
	 */
	activatePrevListener: function(prevLink, index) {
		if (this.prevListener != null && typeof this.prevListener == "function") {
		    var delegate = this.prevListener.createDelegate(this, [index]);
		    Ext.fly(prevLink).addListener("click", delegate);
		}
	},

	/**
	 * on click of previous link send paging paramters and refresh the miniconsole and grid with updated values
	 */
	onClickPrev: function() {
		this.pagingAction = "prev";
		if(this.getDataSource(this.dataSourceId)){
			var ds = this.getDataSource(this.dataSourceId);
			this.currentPageFirstRecord = toJSON(ds.processOutboundRecord(this.rows[0].row.getRecord()).values);
			this.currentPageLastRecord = toJSON(ds.processOutboundRecord(this.rows[this.rows.length-1].row.getRecord()).values);
		} else {
			this.currentPageFirstRecord = toJSON(this.getPagingValuesFromRecord(this.rows[0].row.record));
			this.currentPageLastRecord = toJSON(this.getPagingValuesFromRecord(this.rows[this.rows.length-1].row.record));			
		}
		if (this.firstRecords.length > 0){
			this.doRefresh();		
			this.firstRecords.pop();				
	 	}				 	
        this.afterRefresh();
        this.restorePreviousSelections();
	},

	/**
	 * Get record limit.  Use view's record limit, if such exists.  Otherwise, use recordlimit from afm-config.xml.  If all else fails, use number of rows in view.
	 */	
	getPagingRecordLimit: function(){
		if (this.recordLimit == -1){
			if (this.configurationRecordLimit){
				return this.configurationRecordLimit;
			} else {
				return this.rows.length;
			}
		} else {
			return this.recordLimit;
		}		
	},
			
	/**
	 * set the index listener to use the header cell as 'this' 
	 * and add the miniConsole itself as the second arg to the listener function
	 *
	 */
	activateNextListener: function(nextLink, index) {
		if (this.nextListener != null && typeof this.nextListener == "function") {
		    var delegate = this.nextListener.createDelegate(this, [index]);
		    Ext.fly(nextLink).addListener("click", delegate);
		}
	},
	
	/**
	 * on click of next link send paging paramters and refresh the miniconsole and grid with updated values
	 */	
	onClickNext: function() {
		this.pagingAction = "next";
		if(this.getDataSource(this.dataSourceId)){
			var ds = this.getDataSource(this.dataSourceId);
			this.currentPageFirstRecord = toJSON(ds.processOutboundRecord(this.rows[0].row.getRecord()).values);
			this.currentPageLastRecord = toJSON(ds.processOutboundRecord(this.rows[this.rows.length-1].row.getRecord()).values);
		} else {
			this.currentPageFirstRecord = toJSON(this.getPagingValuesFromRecord(this.rows[0].row.record));
			this.currentPageLastRecord = toJSON(this.getPagingValuesFromRecord(this.rows[this.rows.length-1].row.record));
		}

		this.firstRecords.push(this.currentPageFirstRecord);
		this.doRefresh();		     
        this.afterRefresh();
        this.restorePreviousSelections();
	},
	
	/**
	 * used in select value dialogs, where only text fields are supported 
	 */	
	getPagingValuesFromRecord: function(record){
		var values = {};		
		for (var name in record) {
			if (name.indexOf('.key') == -1 && name.indexOf('.raw') == -1 &&
				name != 'grid' && name != 'index' && name != 'row') {
					var value = new Object();
					values[name] = record[name];     
			}
		}
		return values;
	},

	//---------------------------------------filter----

	/**
	 * Set or modify a filter value AFTER grid is built.
	 */
	setFilterValue: function(columnName, val) {
		var elem = $(this.getFilterInputId(columnName));
		if (null != elem) {
			elem.value = val;
		}
	},
    
    /**
     * Resets the value of all the filter input elements.
     */
    clearAllFilterValues: function() {
        var filterElements = this.getAllFilterElements();
        for (var i=0, elem; elem = filterElements[i]; i++) {
            if (elem.id.indexOf('_filterColumn_') != -1) {
                elem.value = '';
            }
        }
    },

	/**
     * Resets the value of all the filter input elements that do not begin with a double quote.
	 */
	clearAllNonQuotedFilterValues: function() {
        var filterElements = this.getAllFilterElements();
        for (var i=0, elem; elem = filterElements[i]; i++) {
            if (elem.id.indexOf('_filterColumn_') != -1) {
				if (elem.value != '' && elem.value.charAt(0) != '"')
				{
					elem.value = '';
				}
            }
        }
    },

	/**
	 * Resets the value of all the filter input elements and re-queries grid records.
	 */
	clearAllFilters: function() {
		if (this.filterPaletteIsActive) {
			this.clearAllFilterValues(); 
			
			// reset paging parameters
			this.pagingAction = null;  
			this.firstRecords = []; 
			this.currentPageFirstRecord = {};
			this.currentPageLastRecord = {};
			       
			var parameters = this.getParameters(
				this.getCurrentSortValues(),
				new Ab.grid.IndexValue(this.indexColumnID, this.indexValue, this.indexLevel));
			try {
			    var result = this.getData(parameters);
				this.reloadOnFilter(result.data);
				
				this.restorePreviousSelections();

				if(this.actionbar && this.selectionAcrossPagesEnabled){
					 this.actionbar.updateSelected(this.getAllSelectedRows().length);
				}
				
			} catch (e) {
				this.handleError(e);
			}
		}
	},

	/**
	 * Return all filter document objects as array
	 */
	getAllFilterElements: function(){
		var filterInputs = [];
		if (this.filterRow != null && typeof(this.filterRow) != 'undefined') {
			// regular field filters
			var inputs = this.filterRow.getElementsByTagName('input');
			if(inputs != null){
				for(var i = 0;i < inputs.length; i++){
					filterInputs.push(inputs[i]);
				}
			}
			// Enum field filters
			var selects = this.filterRow.getElementsByTagName('select');
			if(selects != null){
				for(var i = 0;i < selects.length; i++){
					filterInputs.push(selects[i]);
				}
			}
		}
		
		return filterInputs;
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
				var filterInputs = this.getAllFilterElements();
				
				for (var i=0, filterInput; filterInput = filterInputs[i]; i++) {
				    var index = filterInput.id.indexOf('_filterColumn_');
					if (index != -1 && 
					     null != filterInput.id && 
					     null != filterInput.value &&  
					      '"' != filterInput.value &&  
					        0  < filterInput.value.length ) {
					    var fieldName = filterInput.id.substring(index + 14);
					    
					    // allow filter to accept comma decimal separator
					    var filterInputValue = filterInput.value;				    
					    for (var j = 0; j < this.columns.length; j++) {
					    	if (this.columns[j].id == fieldName) {				    	
					    		if(this.columns[j].type == 'number' || this.columns[j].type == 'number_link'){
					    			filterInputValue = filterInputValue.replace(strGroupingSeparator, '');
					    			filterInputValue = filterInputValue.replace(strDecimalSeparator, sNeutralDecimalSeparator);
					    		}
					    	}
					    }
					    filterFieldValues.push({"fieldName": fieldName, "filterValue": filterInputValue});
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
	
    setFilterConfiguration: function(configObject){
    	this.filterConfiguration = configObject;
    	this.filterEnabled = true;
    },
    
	activateClearFilterListener: function(clearLink, miniConsole) {
		if (this.clearFilterListener != null && typeof this.clearFilterListener == "function") {
		    Ext.fly(clearLink).addListener("click", this.clearFilterListener, this);
		}
	},

	/**
	 * event handler for on click of filter link 
	 * send all parameters and refill the miniConsole through callback	 
	 */
	onClickFilter: function(e) {
		if (this.filterPaletteIsActive) {
			this.onFilter();
		}
	},
	 
	onFilter: function(e, el) {
		if (e && e.target){
			e.target.blur(); //otherwise click two times to fire the event???
		}
		
		if (this.filterPaletteIsActive) {
			this.firstRecords = [];
		}

		var parameters = this.getParameters(
				this.getCurrentSortValues(), 
				new Ab.grid.IndexValue(this.indexColumnID, this.indexValue, this.indexLevel));
		try {
		    var result = this.getData(parameters);
			this.reloadOnFilter(result.data);

			if(el && el.target){
				el.target.focus();
				//el.target.select();
			}
			this.restorePreviousSelections();
		} catch (e) {
			this.handleError(e);
		}
	},

	// ----------------------- HTML DOM building ---------------------------------------------------

	/**
	 * Fill in the previously created grid using WFR data.
	 * this is the default callback from on_load's WFR, thus grid has no columns, PK IDs, records, etc.
	 * For Yalta_5 columns are added in ab-grid constructor, r.t here in initializeColumns() as in Yalta
	 */
	onInitialDataFetch: function(result) {
		if ((this.columns.length != 0 || result.data.columns.length != 0) && null != result.data.index) {
			this.indexEntries = result.data.index;
		}
		this.inherit(result);
	},

	/**
	 * Add the header rows to the table
	 * sandwich super's header rows in between index rows and filter rows
	 *
	 */
	buildHeader: function(parentElement) {
		// create grid index row
		if (this.indexEnabled && this.indexEntries != null) {
			this.createIndexRow(parentElement);
		}

		// super.buildHeader() 
		this.inherit(parentElement);

		// create grid filter row
		if (this.filterEnabled) {
		    this.createFilterRow(parentElement);
		    Ext.get(this.filterRow).setDisplayed((this.rows.length == 0  && (this.getFilterValues().length == 2)) ? false : true);
		}
		var listener = this.getEventListener('afterBuildHeader');
        if (listener) {
            listener(this, parentElement);
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

		// var rebuildNeeded = !this.indicesEqual(this.indexEntries, data.index);
		
		if (this.indexEnabled) {
			this.indexEntries = data.index;
			if (this.indexEntries != null && this.indexEntries.length > 0) {
				// create index row
				this.createIndexRow(parentElement);
				
		    } else if (this.indexRow) {
				// use existing index row
				parentElement.appendChild(this.indexRow);
			}
		}

		// reload old column title header row(s)
		for (var i=0; i < this.headerRows.length; i++) {
			parentElement.appendChild(this.headerRows[i]);
		}

		// reload old filter header row(s)
		if (this.filterRow != null) {
			parentElement.appendChild(this.filterRow);

			Ext.get(this.filterRow).setDisplayed((this.rows.length == 0  && (this.getFilterValues().length == 2)) ? false : true);
		}

	},

	/**
	 *  @override
	 */
	displayHeaderRows: function() {
		for(var i=0; i<this.headerRows.length; i++){
			this.headerRows[i].style.display = (this.rows.length == 0 && (this.getFilterValues().length == 2)) ? 'none' : '';
		}
	},

	/**
	 * Return a data object similar to the one returned by a WFR, but just containing the data necessary for reloadGrid()
	 *
	 * The function reloadGrid() should be called with the data object returned rom the WFR
	 * When customizing the grid or using hard-coded data eloadGrid() must be called with a client-code-constructed data object
	 * 
	 */
	getReloadDataFromGrid: function(resultData) {
		// create data object using info saved from last WFR run
		var data = this.inherit(resultData);
		if (valueExists(resultData) && valueExists(resultData.index)) {
		    data.index = resultData.index;
		}
		return data;
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
	 * Creates grid index row and adds it to the grid. 
	 * Calculate number of rows based on entries received from WFR & grid.indexEntriesPerRow
	 *
	 * Indices received from WFR contains translated Up & All link if applicable
	 * Up and All link are denoted by a count of 0 & -1, respectively
	 * All's count must be calculated from existing Down links' counts
	 */
	createIndexRow: function(parentElement) {
        if (this.indexColumnIndex < 0) {
            // index is disabled
            return;
        }        
        
		var indexRow = document.createElement('tr');
		indexRow.id = this.id + '_indexRow';
		parentElement.appendChild(indexRow);
		
		// index cell occupies the complete width of the grid
		var indexCell = document.createElement('th');
		indexCell.colSpan = this.getNumberOfColumns();
		indexCell.className = 'index';
		indexRow.appendChild(indexCell);
		
		// create leftmost cell (indexColumn title or blank) of each row
		var indexTitle = document.createElement('div');
	    indexTitle.className = 'indexTitle';
		indexTitle.appendChild(document.createTextNode('' + this.getDisplayableTitle(this.columns[this.indexColumnIndex].name) + ':'));
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
		
		this.createPagingLinks(indexBody);			    		
		this.indexRow = indexRow;

        var idxRow = Ext.get(this.id + "_indexRow", parentElement);
        if (idxRow) {
            idxRow.setDisplayed(!this.isCollapsed);
        }
	},
	
	/**
	 * create 'prev' and 'next' links along with page numbers and attached to given parent element
	 */
	createPagingLinks: function(parentElement){

		// 'Next' and 'Prev' buttons are never shown in aggregating views
		if (!this.hasGrouping() && (this.rows.length > 0)){
			
			// find current page
			this.currentPage = this.firstRecords.length + 1;
			
			// base the paging record limit off of the first page
			if (this.currentPage == 1) {
				this.pagingRecordLimit = this.getPagingRecordLimit();
			}
				
			// indicate current and total pages
			this.totalPages = (this.pagingRecordLimit == 0) ? 0 : Math.ceil((this.allCount / this.pagingRecordLimit));

			// decrement page number if prev button is clicked
			if((this.pagingAction == 'prev') && (this.currentPage > 1)){
				this.currentPage += -1;
			}	
			
			if (this.currentPage < this.totalPages){
				this.hasPaging = true;
			}
			
			// only show paging links if there is paging
			if(this.hasPaging){
				
				// create element to hold prev, page of, and next text
				var pagingElement = parentElement.appendChild(document.createElement('span'));
				
				// keep paging elements together
				pagingElement.style.whiteSpace = 'nowrap';
				
				// only show prev button if after page1
				if (this.currentPage > 1){
					var prev = document.createElement('a');
					prev.appendChild(document.createTextNode(this.getLocalizedString(Ab.grid.MiniConsole.z_MESSAGE_PREVIOUS) + '    '));
					prev.style.whiteSpace = 'pre';	
					pagingElement.appendChild(prev);	
					prev.href = 'javascript: //' ;
					this.activatePrevListener(prev, '');
				}
				
				// Page X of Y
				var page = document.createElement('span');
				page.appendChild(document.createTextNode(this.getLocalizedString(Ab.grid.MiniConsole.z_MESSAGE_PAGE) + ' ' + this.currentPage + ' ' + this.getLocalizedString(Ab.grid.MiniConsole.z_MESSAGE_OF) +' ' + this.totalPages + '    '));
				page.style.whiteSpace = 'pre';
				pagingElement.appendChild(page);	    	
				
				// only show next button if current page is less than total pages
				if (this.currentPage < this.totalPages){
					var next = document.createElement('a');
					next.appendChild(document.createTextNode(this.getLocalizedString(Ab.grid.MiniConsole.z_MESSAGE_NEXT)));
					pagingElement.appendChild(next);	
					next.href = 'javascript: //' ;
					this.activateNextListener(next, '');
				}
			}
		}	
	},

	/**
	 * Check for dataSource type="grouping"
	 */
	 hasGrouping: function(){
	 	var ds = this.getDataSource();		  
	 	if((ds) && (ds.hasOwnProperty("type"))){
	 		if (ds.type){
  			return true;
  	  }
  	}
		return false;
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
			indexCount.appendChild(document.createTextNode('[' + allCnt + ']       '));
			indexCount.style.whiteSpace = 'pre';
			if (this.firstRecords.length == 0){
				this.allCount = allCnt;
			}
			indexCount.className = 'count';
			indexLink.appendChild(indexText);
			indexLink.appendChild(indexCount);					
			// set flag for non-link
			bIndexEntryNonLink = true;
		}
		indexCell.appendChild(indexLink);
		// 'ALL' is not a link, just text
		if (!bIndexEntryNonLink) {
			var indexVal = new Ab.grid.IndexValue(this.columns[this.indexColumnIndex].id, indexLinkVal, indexLinkLevel);
			this.activateIndexListener(indexLink, indexVal);
		}
		return allCnt;
	},


	/**
	 * Helper function to determine if there's an index of count > 1
	 * if not indices are not links
	 */
	testForDrillDown: function() {
		var ret =  false;
		var max = 0;
		for (var i=0, indx; indx = this.indexEntries[i]; i++) {
			if (indx.count > max) {
				max = indx.count;
			}
		}

/*		if there's more than one drilldown link

		var iDrilldownEntryCount = 0;
		for (var k = 0, idx; idx = this.indexEntries[k]; k++) {
			if (idx.count > 0) {
				if (++iDrilldownEntryCount > 1) {
					ret = true;
					break;
				}
			}
		}
 */
		if (max > 1) {
			ret = true;
		}
		return ret;
	},


	/**
	 * Creates grid filter row and adds it to the grid.
	 */
	createFilterRow: function(parentElement) {
		var row = document.createElement('tr');
		row.id = this.id + '_filterRow';
		this.filterRow = row;

		this.getLastVisibleColumnIndex();
		
		for (var c = 0; c < this.columns.length; c++) {
			if (this.columns[c].hidden) {
				continue;
			}
			var filterCell = document.createElement('th');
			row.appendChild(filterCell);		
			this.createFilterCellContent(c, filterCell);
		}
		parentElement.appendChild(row);
	},
	
	getLastVisibleColumnIndex: function() {
		for (var i = this.columns.length-1; i > 0; i--) {
			if (!this.columns[i].hidden) {
				this.lastVisibleColumnIndex = i;
				break;
			}
		}
		return this.lastVisibleColumnIndex;
	},
	

	/**
	 * Return fieldDef by name
	 */
	getFieldDef:function(name){
		for (var i = 0, fieldDef; fieldDef = this.fieldDefs[i]; i++) {
			if(fieldDef.id == name) return fieldDef;  
		}
		return null;
	},
	
	/**
	 * Creates filter cell content.
	 */
	 createFilterCellContent: function(columnIndex, cell) {
		var column = this.columns[columnIndex];
		var id = valueExists(column.fullName) ? column.fullName : column.id;

		if (column.filterEnabled) {	
			var fieldDef = this.getFieldDef(column.id);
			var isEnumField = fieldDef != null && fieldDef.isEnum;
			var input = null;
			if(isEnumField){
				var i = 0;
				input = document.createElement("select");
				input.options[i++] = new Option("","", true);
				for(var storedValue in fieldDef.enumValues){
					input.options[i++] = new Option(fieldDef.enumValues[storedValue], storedValue);
				}	
				input.className="inputField_box";				
				input.className += ((column.type == 'number' || column.type == 'number_link') && !this.sortEnabled) ? ' floatRight': '';	

				// run filter when user click on one enum value
				Ext.EventManager.addListener(input, "change", this.onFilter.createDelegate(this));
				input.id = this.getFilterInputId(id);
				cell.appendChild(input);
			} else if (!this.getDataSourceFieldDefById(id) && !valueExists(this.selectValueType) && this.filterConfiguration) {
		
				// handle calculated fields
				if (this.filterConfiguration && this.filterConfiguration['columns']) {
					var customColumn = this.filterConfiguration.columns[id];
					if (customColumn) {						
						var customFields = customColumn['fields'];
						if (customFields) {
							for (var i=0; i<customFields.length; i++) {
								input = this.createFilterInput(customFields[i]);
								input.size = 5;
								
								if ((this.lastVisibleColumnIndex) && columnIndex == this.lastVisibleColumnIndex) {
									cell.style.whiteSpace = 'inherit';
								}
								
								cell.appendChild(input);
								
								// placeholder (unless IE8 which treats placeholders as filter text - KB 3043971)
								if (customColumn.hasOwnProperty('placeholders') && jQuery.support.leadingWhitespace) {
									input.placeholder = (customColumn.placeholders[i]) ? customColumn.placeholders[i] : '';
								}
								
								// delimiter
								if (customColumn.hasOwnProperty('delimiter') && i < customFields.length-1) {
									var delimiter = document.createElement('span');
									delimiter.innerHTML = "-";
									cell.appendChild(delimiter);						
								}
							}							
						}						
					}			
				}
			}else{
				input = this.createFilterInput(id);
				input.size = 12;
				
				// last filter input needs to share cell with clear filter, so float left
				if(columnIndex == (this.columns.length-1)){
					input.className = 'floatLeft';
				}
				cell.appendChild(input);
			}
			
			for (var i=0, filterVal; filterVal = this.filterValues[i]; i++) {
				if (filterVal.fieldName == column.id) {
					input.value = filterVal.filterValue;
					break;
				}
			}
		} else {
			cell.appendChild(document.createTextNode(''));
		}

		// this.lastVisibleColumnIndex is only used in the "selectFields" command
		if(columnIndex == this.columns.length-1 || ((this.lastVisibleColumnIndex) && columnIndex == this.lastVisibleColumnIndex) ){
			//this.createHeaderButtons( cell );
			this.createFilterButtons( cell );
		}
	 },
	 
	 /**
	  * Creates input element for filter
	  **/
	createFilterInput: function(id) {
		var input = document.createElement('input')		
		// run filter when user presses enter key
		var control = this;
        Ext.get(input).on('keydown', function (e) {
			if(e.keyCode == 13){
				this.blur();
				control.setScrollerToPosition(0);
				control.onFilter();
				this.focus();		
				control.setScrollerToPosition(control.divHeadElement.scrollLeft);			
			}
		}, false);
		
		input.style.marginRight = '4';	
		input.id = this.getFilterInputId(id);
		return input;
	},
	
    /**
     * Creates filter expand/collaps button.
     */
    createHeaderButtons: function(cell) {
		var collapseExpandLink = this.createLink();
		var collapseExpandImage = this.createImage(this.imageExpand, this.getLocalizedString(Ab.grid.MiniConsole.z_TOOLTIP_EXPAND), 0);
		collapseExpandImage.id = 'collapseExpand_' + this.id;
		collapseExpandLink.appendChild(collapseExpandImage);
		cell.appendChild(collapseExpandLink);
        Ext.fly(collapseExpandLink).addListener("click", this.toggleSmartSearch, this);
	},

	
    /**
     * Creates filter buttons.
     */
    createFilterButtons: function(cell) {
        var clearLink = document.createElement('a');
        this.activateClearFilterListener(clearLink, this);
        clearLink.href = 'javascript: //';
		var msg = this.getLocalizedString(Ab.grid.MiniConsole.z_TITLE_CLEAR);
		var clearImage = this.createImage(this.imageFilterClear, msg, 2, 16, 16);
		clearImage.className = 'clearFilterBtn';
        clearLink.appendChild(clearImage);       
        cell.appendChild(clearLink);      
	},
	
	/**
	 * Handles index/filter bar expand and collapse events.
	 */
	toggleSmartSearch: function() {
		if (!this.filterPaletteIsActive) {
			return;
		}
	    if (this.isCollapsed == true) {
	        this.isCollapsed = false;
	    } 
		else {
	        this.isCollapsed = true;
	    }
	    this.showIndexAndFilter();
	},
	
	/**
	 * Displays or hides the index and filter bars depending on the isCollapsed property.
	 */
	showIndexAndFilter: function() {
	    var image = $('collapseExpand_' + this.id);
        if (valueExists(image)) {
    	    if (this.isCollapsed == false) {
    	        image.src = this.imageCollapse;
    	        image.alt = this.getLocalizedString(Ab.grid.MiniConsole.z_TOOLTIP_COLLAPSE);
    	        image.title = this.getLocalizedString(Ab.grid.MiniConsole.z_TOOLTIP_COLLAPSE);
    	    } 
			else {
    	        image.src = this.imageExpand;
    	        image.alt = this.getLocalizedString(Ab.grid.MiniConsole.z_TOOLTIP_EXPAND);
    	        image.title = this.getLocalizedString(Ab.grid.MiniConsole.z_TOOLTIP_EXPAND);
    	    }
        }
        
        var isCollapsed = this.isCollapsed;
       	if(this.rows.length == 0 && (this.getFilterValues().length == 2) && this.visible){
            isCollapsed = true;
       	}

        var indexRow = Ext.get(this.id + "_indexRow", this.parentElement);
        if (indexRow) {
            indexRow.setDisplayed(!isCollapsed);
        }
        
        var filterRow = Ext.get(this.id + "_filterRow", this.parentElement);
        if (filterRow) {
            filterRow.setDisplayed(!isCollapsed);
        }
        this.updateHeight();
	},
	
	/**
	 * rebuild the table, reusing the header & filter bars
	 * after filter link event
	 */
	reloadOnFilter: function(data) {
		
        this.beforeRefresh();

        this.rows = [];

		// call afterGetData for post-processing (e.g., localization of data from messages)
        var listener = this.getEventListener('afterGetData');
        if (listener) {
            listener(this, data);
        }

		this.addRows(data.records);
		this.removeRowsFromTBody();

		this.rebuildHeader(this.tableHeadElement, data);

		// create grid data rows
		this.createDataRows(this.tableBodyElement, this.columns);

		this.buildFooterRows(this.tableFootElement, data);
        
        this.afterRefresh();
        
        this.setScrollerToPosition(0);
        
        this.updateHeight();      
	},

	// KB 3022769: with multiple miniConsoles loaded into multiple tabs refresh on select tabs to reposition searchPalette.
	// KB 3024774: do not call afterRefresh() - it will register duplicate per-row button event listeners.
	showActions: function(visible) {
        this.inherit();
	},

	/**
	 * Reset the filter palette location after each refresh
	 */
	afterRefresh: function(updateHeight) {
		this.inherit(updateHeight);
		this.showIndexAndFilter();
	},
	
	
	// @deprecated
	repositionSearchPalette: function() {
	},

	/**
	 * rebuild the table, reusing the header & filter bars
	 * after index link event
	 */
	reloadOnIndex: function(data) {
        this.beforeRefresh();

   		this.indexEntries = data.index;
		this.rows = [];
		this.addRows(data.records);

		this.removeRowsFromTBody();
		
		this.buildPreHeaderRows(this.tableHeadElement);
		// create grid index row(s)
		if (this.indexEnabled) {
			this.createIndexRow(this.tableHeadElement);
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
        
        this.afterRefresh();
	},
	
	/**
	 * Returns ID of the filter input element for specified column.
	 */
	getFilterInputId: function(columnId) {
	    return this.id + '_filterColumn_' + columnId;
	}
},
{
	// @begin_translatable
	z_TITLE_CLEAR: 'Clear',
	z_TOOLTIP_COLLAPSE: 'Collapse',
	z_TOOLTIP_EXPAND: 'Expand',
	z_MESSAGE_NEXT: 'Next >>',
	z_MESSAGE_PREVIOUS: '<< Prev',
	z_MESSAGE_PAGE: 'Page',
	z_MESSAGE_OF: 'of'
	// @end_translatable
});



/**
 * This is a helper class that defines the index field.
 */
Ab.grid.IndexValue = Base.extend({
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

