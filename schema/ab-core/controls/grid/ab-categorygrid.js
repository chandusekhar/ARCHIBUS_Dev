Ab.grid.Category = Ab.grid.MiniConsole.extend({
	// datasource for grouping categories
	categoryDataSource: null,

	// datasource id for grouping categories
	categoryDataSourceId: '',
	
	categoryField: '',
	
	categoryOrder: [],
	
	isCustomCategoryOrder: false,
	
	categoryRecords: [],
	
	categoryColors: {},
	
	//max displayed records  under each category
	categoryDisplayedLimit: 100,
	//category is collapsing or not
	categoryCollapsed: true,
	//each category opening/collapsing status by user's open/collapse action
	categoryCollapsedInfo:{},
	//each category displayed records by user's "View More" action
	categoryDisplayedInfo:{},
	
	// @begin_translatable
	z_NO_FIELD_ERROR_MESSAGE: 'No field specified.  Please specify a field name.',
	z_CATEGORY_FIELD_NOT_FOUND_ERROR_MESSAGE: 'Category field could not be matched to field list in details.  Please ensure that a category field has been specified and that a similar field exists in the details datasource and panel.',
	z_NONE: '<none>',
	z_TITLE_VIEWMORERECORDS: 'more, view next',
	z_TITLE_VIEWTHEM: 'more, view them',
	// @end_translatable
				
	/**
	 * Constructor creates 'empty' grid; sets internal data structures (columns,rows, DOM element arrays & listeners) & then calls WFR
	 *
	 * @param id
	 * @param configObject - map with keys of (at least) [viewDef, groupIndex] and possibly [cssClassName, showOnLoad, 
	 *											selectionEnabled, multipleSelectionEnabled, useParentRestriction, refreshWorkflowRuleId, sortAscending]
	 */
	constructor: function(id, configObject) {
		// call Ab.grid.MiniConsole constructor
		if (configObject.getConfigParameterIfExists('recordLimit') == -1) {
			configObject.recordLimit = 0;			
		}
		this.inherit(id, configObject); 
		this.imageCategoryCollapse = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/tri-opened.png';
		this.imageCategoryExpand = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/tri-closed.png';
		this.categoryDataSourceId = configObject.getConfigParameterIfExists('categoryDataSource');
		this.categoryCollapsedInfo = {};
		this.categoryDisplayedInfo = {};
		//XXX: reduce categoryDisplayedLimit by half for slowest IE browser???
		//if(Ext.isIE){
		//	this.categoryDisplayedLimit = this.categoryDisplayedLimit/2;
		//}
	},
	
	getCategoryDataSourceId: function() {
		return this.categoryDataSourceId;
	},
	
	setCategoryDataSourceId: function(categoryDataSourceId) {
		this.categoryDataSourceId = categoryDataSourceId;	
	},

	getCategoryField: function() {
		return this.categoryField;
	},
	
	setCategoryField: function(categoryField) {
		this.categoryField = categoryField;	
	},
	
	getCategoryOrder: function() {
		return this.categoryOrder;
	},
	
	setCategoryOrder: function(categoryOrder) {
		this.isCustomCategoryOrder = true;
		this.categoryOrder = categoryOrder;	
	},	
	
	getCategoryColors: function(){
		return this.categoryColors;
	},
	
	setCategoryColors: function(categoryColors){
		this.categoryColors = categoryColors;
	},

	getCategoryRecords: function() {
		return this.categoryRecords;
	},

	setCategoryRecords: function(categoryRecords) {
		return this.categoryRecords;
	},
	
	getCategoryField: function() {
		return this.categoryField;	
	},
			
	setCategoryField: function(categoryField) {
		this.categoryField = categoryField;	
	},
			
	getCategoryDataSource: function() {
		return this.categoryDataSource;
	},
	
	setCategoryDataSource: function(categoryDataSource) {
		this.categoryDataSource = categoryDataSource;	
	},

	setCategoryDataSourceById: function(categoryDataSourceId) {
		this.categoryDataSource = View.dataSources.get(categoryDataSourceId)
	},

	setshowWithoutGroupings: function(showWithoutGroupings) {
		this.showWithoutGroupings = showWithoutGroupings;	
	},
			
	getshowWithoutGroupings: function() {
		return this.showWithoutGroupings;
	},
			
	setCategoryConfiguration: function(configObj){
		// showWithoutGroupings
		if(valueExists(configObj['showWithoutGroupings'])){  
			this.setshowWithoutGroupings(configObj['showWithoutGroupings']);
		}
				
		if(this.showWithoutGroupings){
			return;
		}

		// specify the category field
		if(valueExists(configObj['fieldName'])){		
			this.setCategoryField(configObj['fieldName']);
		} else {
			var message = View.getLocalizedString(this.z_NO_FIELD_ERROR_MESSAGE);
			View.showMessage('error', message);
			return;
		}
		
		// specify the order in which the categories should appear.
		if(valueExists(configObj['order'])){  
			this.setCategoryOrder(configObj['order']);
		}
		
		if(valueExists(configObj['categoryDataSourceId'])){
			this.setCategoryDataSourceId(configObj['categoryDataSourceId']);
		}

		if(valueExists(configObj['setCategoryDataSouceById']) && (configObj['setCategoryDataSouceById'] == true)){
			this.setCategoryDataSourceById(configObj['categoryDataSourceId']);
		}
		
		if(valueExists(configObj['categoryDataSource'])){
			this.setCategoryDataSource(configObj['categoryDataSource']);
		}
				
		// apply custom style for category
		if(valueExists(configObj['getStyleForCategory'])){
			this.getStyleForCategory = configObj['getStyleForCategory'];
		}
							
		// apply order and style
		this.setOrderAndStyle(); 		
	},
	
		
	setOrderAndStyle: function() {
		var categoryDS = View.dataSources.get(this.getCategoryDataSourceId());
		var reorderedRecords = [];
		var records = categoryDS.getRecords();
		
		// if no order is specified, use default
		if(this.categoryOrder.length == 0 ){
			this.isCustomCategoryOrder = false;
			for(var h=0; h<records.length; h++){
				this.categoryOrder.push(records[h].getValue(this.categoryField));
			}
		}
		
		var fieldDef = this.getFieldDef(this.categoryField);
		if(fieldDef){
			// get the display value for enums, if such exists
			var isEnum = fieldDef.isEnum;
			this.categoryFieldIsEnum = isEnum;
			var enumValues = (isEnum) ? fieldDef.enumValues : {};
			
			for(i=0, n=this.categoryOrder.length; i<n; i++){
				for(var j=0, nj = records.length; j<nj; j++){
					var record = records[j];
					var category = record.getValue(this.categoryField);
					if(category == this.categoryOrder[i]){
						record.style = this.getStyleForCategory(record);
						record.categoryTitle = (isEnum)? enumValues[category]: category;
						record.category = category;
						reorderedRecords.push(record);
					}  
				}  		    		
			}
		} else {
			var message = View.getLocalizedString(this.z_CATEGORY_FIELD_NOT_FOUND_ERROR_MESSAGE);
			View.showMessage('error', message);
			return;
		}
		this.categoryRecords = reorderedRecords;
		
		return this.categoryRecords;
	},
	
	// can be used to specify custom style for categories
	getStyleForCategory: function(record){
		record.style = {};
		return record;
	},    				
  
  	
	findStopIndex: function(currentIndex){
		var categoryDetailEls = this.tableBodyElement.getElementsByTagName('th');
		var stopIndex = 0;

		// find the index of the next category
		for(var k=0; k<categoryDetailEls.length; k++){
			if(categoryDetailEls[k].parentElement.rowIndex ==  currentIndex){
				stopIndex = (k==categoryDetailEls.length-1) ?  this.tableBodyElement.rows.length+ categoryDetailEls[0].parentElement.rowIndex: categoryDetailEls[k+1].parentElement.rowIndex;
			}
		}
		return stopIndex;
	},


	/**
	 * override
	 */
	beforeBuild: function() {
		this.inherit();
		this.enableIndex(this.indexEnabled, this.indexColumnID, this.indexEntries);
		this.filterEnabled = this.config.getConfigParameterIfExists('showIndexAndFilterOnLoad');;
	},

	/**
	 * override
	 * If this.showWithoutGroupings = false (default) display with catgories.  Otherwise, display without categories (similar to report grid)
	 */		
	createDataRows: function(parentElement, columns) {
		if(this.showWithoutGroupings){
			this.inherit(parentElement, columns);
		}else{
			var tableEl = Ext.get(this.parentElement.id);
			tableEl.addClass('categoryGrid');
			this.createCategoryAndDetailRows(parentElement, columns);
		}
	},

	createCategoryAndDetailRows: function(parentElement, columns) {
		this.gridRows = new Ext.util.MixedCollection();
		var noneMsg = View.getLocalizedString(this.z_NONE);
		for (var x = 0; x < this.categoryRecords.length; x++) {
			var categoryRecord = this.categoryRecords[x];
			  var categoryTitle = categoryRecord.categoryTitle;
			//var records = this.getMatchedRecords(this.rows, categoryTitle);
			var records = this.getMatchedRecords(this.rows, categoryRecord.category);  
			if(records.length === 0){
				//XXX: display nothing if category has no record???
				continue;
			}
			if(!valueExistsNotEmpty(categoryTitle)){
	            	categoryTitle = noneMsg;
	        }  
			var display = (this.categoryCollapsed) ? 'none' : '';
		    var imageCategory = (this.categoryCollapsed) ?  this.imageCategoryExpand : this.imageCategoryCollapse;
			if(categoryTitle in this.categoryCollapsedInfo){
				display = this.categoryCollapsedInfo[categoryTitle];
				if(display === 'none'){
					imageCategory = this.imageCategoryExpand;
				}else{
					imageCategory = this.imageCategoryCollapse;
				}
			}
            // create category row
 			var category = document.createElement('th');
			category.colSpan = this.columns.length;

            // create category title element
            var categoryTitleElement = document.createElement('a');
            categoryTitleElement.className = 'categoryTitle';
          
            var textElement = document.createElement('span');
            textElement.innerHTML = categoryTitle;
            textElement.id = this.id + '_category' + categoryTitle + '_multipleSelectionColumn';
            categoryTitleElement.appendChild(textElement);
            categoryTitleElement.style.background = 'url(' + imageCategory + ') no-repeat 0 50%';

			if(this.multipleSelectionEnabled){
				var checkBox = document.createElement("input");
				checkBox.type = 'checkBox';
				checkBox.className = 'categoryCheckBox';
				//checkBox.id = this.id + '_category' + x + '_multipleSelectionColumn';
				checkBox.id = this.id + '_category' + categoryTitle + '_checkAll';
				categoryTitleElement.appendChild(checkBox);
				var grid = this;
				// when click on category checkbox
				Ext.get(checkBox).addListener('click', function(e) {
				    // don't fire parent div's click 
				    e.stopPropagation();
				    
					grid.handleCategoryCheckBox(this);
				});
			}
			category.appendChild(categoryTitleElement);
			
			// add custom style properties to the category title element
            var style = categoryRecord.style;
            for (var s in style) {
                categoryTitleElement.style[s] = style[s];
            }
       
            var tr = document.createElement('tr');
            tr.className = 'categoryRow';
            tr.appendChild(category);           
            this.tableBodyElement.appendChild(tr);
            
            //click a category
            Ext.get(category).addListener('click', this.openOrCollapseCategory.createDelegate(this, [categoryTitleElement, categoryTitle]));

            // create data rows
            this.createDetailRows(this.tableBodyElement, columns, categoryTitle, category, categoryTitleElement, records, display);
        }
	},
	/**
	 *Opens or Collapses the Category 
	 */
	openOrCollapseCategory: function(categoryTitleElement, categoryTitle){
         var stopIndex = this.findStopIndex(categoryTitleElement.parentElement.parentElement.rowIndex);
         var categoryDetailEls = this.tableBodyElement.getElementsByTagName('th');
         // account for header rows, showIndexAndFilterOnLoad
         var offset = categoryDetailEls[0].parentElement.rowIndex;
         // toggleExpand
         var backgroundImage = '';
         var display = '';
         if (categoryTitleElement.style.background.match(/closed/gi)) {
             backgroundImage = this.imageCategoryCollapse;
         } else {
             backgroundImage = this.imageCategoryExpand;
             display = 'none';
         }

        this.categoryCollapsedInfo[categoryTitle] =  display; 
         categoryTitleElement.style.background = 'url(' + backgroundImage + ') no-repeat 0 50%';;
         for (var m = categoryTitleElement.parentElement.parentElement.rowIndex - offset +1; m < stopIndex - offset; m++) {
        	 this.tableBodyElement.rows[m].style.display = display;
         }
         this.clearPreviousColumnRowWidths();            
         this.updateHeight();
	},
	
	/**
	 * Gets matched records by specified category value.
	 * 
	 */
	getMatchedRecords: function(records, category){
		var result = [];
		var categoryField = this.categoryField;	
		var categoryFieldRaw = this.categoryField;
		if (this.categoryFieldIsEnum === true){					// handle enum fields
			categoryFieldRaw = this.categoryField + ".raw";
		}
		
		for(var i = 0, record; record = records[i]; i++){			
			var recordCategory = record[categoryFieldRaw];
			
			// KB 3050790  when raw values are identical with displayed values
            // core does not send raw values in data set (optimization issue)
			if(!valueExistsNotEmpty(record[categoryFieldRaw]) && valueExistsNotEmpty(record[categoryField])){
				recordCategory = record[categoryField];
			}
			if(recordCategory === category) result.push(record);
		}
		return result;
	},
	
	/**
	 * Called when the category checkbox is checked/unchecked.
	 */	
	handleCategoryCheckBox: function(checkBox) {
		var grid = this;
		var categoryTitleElement = checkBox.dom.parentElement;	
		var startIndex = categoryTitleElement.parentElement.parentElement.rowIndex;
	    var stopIndex = grid.findStopIndex(startIndex);
	    var categoryDetailEls = grid.tableBodyElement.getElementsByTagName('th');
	    var numOfPreviousCategories = 0;
	    var categoryRows = grid.getCategoryRows();
	    for(var i=0, n=categoryRows.length; i<n; i++){
	    	 if(categoryRows[i].rowIndex === startIndex){
	    		 numberOfPreviousCategories = i+1;
	    	 }              	
	    }
	    // paging action rows
	    for(var r=0, n=grid.tableBodyElement.rows.length; r<n && r < startIndex; r++){
	    	var trId = grid.tableBodyElement.rows[r].id;
	    	if(trId && trId.indexOf('paging_more_records') >= 0){
	    		numberOfPreviousCategories++;
	    	}
	    }
	    // account for header rows, showIndexAndFilterOnLoad
	    var offset = categoryDetailEls[0].parentElement.rowIndex;
	    var isChecked = checkBox.dom.checked;
	    for (var m = categoryTitleElement.parentElement.parentElement.rowIndex - offset +1 ; m < stopIndex - offset ; m++) {
	        grid.tableBodyElement.rows[m].cells[0].getElementsByTagName("input")[0].checked = isChecked;
	        grid.onChangeMultipleSelection(grid.gridRows.get(m - numberOfPreviousCategories).record);
	    }
	},

	createDetailRows: function(parentElement, columns, category, categoryElement, categoryTitleElement, records, display) {
		var listener = this.getEventListener('onClickItem');
		var multiline = this.hasMultiline(columns);
		this.buildCategoryGridRows(listener, multiline, records, parentElement, columns,  category, categoryElement, categoryTitleElement, false,  records.length, null, display);
	},
	/**
	 * Builds Category Grid Rows
	 */
	buildCategoryGridRows: function(listener, multiline, records, parentElement, columns,  category, categoryElement, categoryTitleElement, paging, totals, pagingElement, display){
		var count = 0;
		var gridRowElement = null;
		var insertDataRowIndex = this.getStartInsertIndex(categoryElement, paging);
		var displayLimit = this.categoryDisplayedLimit;
		if((!paging && records.length > this.categoryDisplayedLimit) && category in this.categoryDisplayedInfo){
			displayLimit = this.categoryDisplayedInfo[category];
		}
		// create row & cell elements
		for (var r =  0, record; record = records[r]; r++) {
			gridRowElement = document.createElement('tr'); 
			gridRowElement.style.display = display;
			gridRowElement.name = category + '_details'; 
			gridRowElement.className = (this.tableBodyElement.rows.length % 2 === 0) ? 'dataRow' : 'dataRow odd' ;
			gridRowElement.onmouseover = function(){
				this.className = this.className + ' selected';
			}
			gridRowElement.onmouseout = function(){
				this.className = this.className.replace(' selected', '');
			}
			gridRowElement.className += (multiline) ? ' multiline' : ' singleline';		
			var row = new Ab.grid.Row(this, record, gridRowElement);
			this.gridRows.insert(insertDataRowIndex +  r, row);

			record.index = this.gridRows.length-1;	
			record.row = row;	
			for (var c = 0, column; column = columns[c]; c++) {
				if (column.hidden) continue;
				var cellElement = document.createElement('td');
				// TODO: ab-sp-hl-su-by-ls.axvw
				if(listener && this.columnTypeIsSortable(column.type) && column.type !== 'image' && column.enabled === "true"){
					column.type = 'link';
					if (column.javaType === 'java.lang.Double' || column.javaType === 'java.lang.Integer') {
						column.type = 'number_link';
					}
				}
				cellElement.className = column.type;
				if (column.width != null) {
					cellElement.width = column.width;
				}
				if (column.onCreateCell != null) {
					column.onCreateCell(record, column, cellElement);
				} else {
					this.createCellContent(record, column, cellElement);
				}                                 
				gridRowElement.appendChild(cellElement); 
				var cell = new Ab.grid.Cell(row, column, cellElement);
				row.cells.add(column.id, cell);
			}
			if(pagingElement){
				parentElement.insertBefore(gridRowElement, pagingElement);
			}else{
				parentElement.appendChild(gridRowElement); 
			}
			++count;
			if(count >= displayLimit) break;
		}
		
		this.addRowLevelActions(listener, columns);
		this.afterCreateDataRows(parentElement, columns);
		
		var countId = this.id + "count" + categoryElement.id;
		var countElement;
		if(paging){
			countElement = $(countId);
		}else{
			countElement = document.createElement('span');
			countElement.id = countId;
		}
		if(records.length > count){
			records.splice(0, count);
			var displayedRecords = totals - records.length;
			this.categoryDisplayedInfo[category] = displayedRecords;
			countElement.innerHTML = "("  + displayedRecords + "/" + totals + ")";
			//create paging button
			this.createViewMoreRecordsAction(gridRowElement, displayedRecords, listener, multiline, records, parentElement, columns,  category, categoryElement, categoryTitleElement, totals, pagingElement, display);
		}else{
			this.categoryDisplayedInfo[category] = totals;
			countElement.innerHTML = "(" + totals + ")";
		}	
		countElement.className = 'count';
		categoryTitleElement.appendChild(countElement);
	},
	/**
	 * If paging is true, get the exact indexing to insert records into this.gridRows
	 */
	getStartInsertIndex: function(categoryElement, paging){
		var index = this.gridRows.length;
		if(paging){
			var pagingRowId = 'paging_more_records' + categoryElement.id;
			var pagingRow = $(pagingRowId);
			if(pagingRow){
				index = 0;
				var dataRows = Ext.query('.dataRow', this.parentElement);
				for(var i = 0, dataRow; dataRow = dataRows[i]; i++){
					if(pagingRow.rowIndex > dataRow.rowIndex){
						index++;
					}
				}
			}
		}
		return index;
	},
	
	/**
	 * Creates paging action for more records
	 */
	createViewMoreRecordsAction: function(gridRowElement, displayedRecords, listener, multiline, records, parentElement, columns,  category, categoryElement, categoryTitleElement, totals, pagingElement, display){
		var newPagingEl = document.createElement('tr'); 
		newPagingEl.id = 'paging_more_records' + categoryElement.id;
		newPagingEl.style.display = display; 
		parentElement.insertBefore(newPagingEl, gridRowElement.nextSibling);
		
		var cellElement = document.createElement('td');
		newPagingEl.appendChild(cellElement); 
		cellElement = document.createElement('td');
		newPagingEl.appendChild(cellElement); 
		cellElement.colSpan = (columns.length - 1) + "";
		var showMore = document.createElement('a');
		showMore.className = 'mainAction button ';
		
	    var textElement = document.createElement('span');
	    if(this.categoryDisplayedLimit < records.length){
	    	textElement.innerHTML = records.length + " " + View.getLocalizedString(this.z_TITLE_VIEWMORERECORDS) + " " + this.categoryDisplayedLimit;
	    }else{
	    	textElement.innerHTML = records.length + " " + View.getLocalizedString(this.z_TITLE_VIEWTHEM);
	    }
       
	    showMore.appendChild(textElement);
        var me = this;
		Ext.fly(showMore).addListener('click', function(e) {
			 e.stopPropagation();
			 me.buildCategoryGridRows(listener, multiline, records, parentElement, columns,  category, categoryElement, categoryTitleElement, true, totals, newPagingEl);
			 parentElement.removeChild(newPagingEl); 
			 me.clearAllCategoryCheckBoxs();
			 //XXX: after calling clearAllCategoryCheckBoxs() 
			 //apps call afterRefresh() to process row actions
			 me.afterRefresh();
		});
		cellElement.appendChild(showMore);  
	},
	/**
	 * XXX: Clears all checkbox after clicking more records button, otherwise, afterRefresh() will NOT work properly???
	 * 
	 */
	clearAllCategoryCheckBoxs: function(){
		var inputs = document.getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++) {
		    if(inputs[i].type === "checkbox") {
		        inputs[i].checked = false; 
		    }  
		}
	},
	
	/**
	 * override ab-reportgrid.js
	 */
	getFirstRowIndex: function(){
		this.columnWidthRowIndex = this.getFirstUncollapsedRowIndex();
		return this.columnWidthRowIndex;
	},

	/**
	 * find the first uncollapsed row to base resizing calculations
	 */				
	getFirstUncollapsedRowIndex: function(){
		// TODO: optimize
		var dataRows = Ext.query('.dataRow', this.parentElement);
		for(var i=0; i<dataRows.length; i++){
			var dataRowIndex = dataRows[i].rowIndex;
			if(dataRowIndex < this.tableBodyElement.rows.length){
				if(this.tableBodyElement.rows[dataRowIndex].style.display == ''){
					return dataRowIndex
				}
			}
		}
		return -1;
	},

	/**
	 * clear previous column widths that were set
	 */
	clearPreviousColumnRowWidths: function(){
		if(this.columnWidthRowIndex != -1){
			var columns = this.tableBodyElement.rows[this.columnWidthRowIndex].cells;
			for(var i=0; i<columns.length; i++){
				columns[i].style.width = 'auto';
			}	
		}	
	},

    /**
     * @override
     */
    selectAll: function(selected) {
        this.setAllCategoryRowsSelected(selected);
        this.setAllRowsSelected(selected);
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
		for (var r = 0, n=dataRows.length; r < n; r++) {
			var dataRow = dataRows[r];
			var selectionCheckbox = dataRow.firstChild.firstChild;
			if (typeof selectionCheckbox.checked != 'undefined') {
				if (selectionCheckbox.checked != setSelectedTrue) {
					selectionCheckbox.checked = setSelectedTrue;
					this.onChangeMultipleSelection(this.gridRows.get(r).record);
				}
				selectedRows.push(this.gridRows.get(r).record);			
			}
		}
		return selectedRows;
	},

	setAllCategoryRowsSelected: function(selected) {
		// get switch value, default == true
		var setSelectedTrue = ((typeof selected == 'undefined') || selected == true) ? true : false;		
		var categoryRows = this.getCategoryRows();		
		for (var r = 0, n=categoryRows.length; r < n; r++) {
			var categoryRow = categoryRows[r];
			var selectionCheckbox = categoryRow.firstChild.firstChild.firstChild.nextSibling;
			if (typeof selectionCheckbox.checked != 'undefined') {
				if (selectionCheckbox.checked != setSelectedTrue) {
					selectionCheckbox.checked = setSelectedTrue;
				}		
			}
		}
	},

    /**
     * Returns an array of DOM elements that represent grid data rows.
     */
    getCategoryRows: function() {
        return Ext.query('.categoryRow', this.parentElement);
    },
    
    /**
     * @override
     */
    onChangeMultipleSelection: function(row) {    	
    	this.inherit(row);
    	
    	// if single checked box is unchecked, uncheck the select all checkbox
    	if (row.row.isSelected() == false){
    		var checkAllEl = Ext.get(this.id + '_category' + row[this.categoryField] + '_checkAll');
    		if (valueExists(checkAllEl)) {
    			checkAllEl.dom.checked = false;
    		}    	
    	}
    },  
	
	/////////////////////panel reports///////////////////
	callDOCXReportJob: function(title, restriction, parameters){
		this.setCategoryProperties(parameters);
		if(!valueExistsNotEmpty(title)){
			title = "";
		}
		if(!valueExists(parameters.recordLimit)){
			//default to report all records
			parameters.recordLimit = 0;
		}
		var viewName = this.viewDef.viewName + '.axvw'; 
		return Workflow.startJob(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, viewName, this.dataSourceId, title, this.getVisibleFieldDefs(), toJSON(restriction), parameters);
	},
	callXLSReportJob: function(title, restriction, parameters){
		this.setCategoryProperties(parameters);
		if(!valueExistsNotEmpty(title)){
			title = "";
		}
		if(!valueExists(parameters.recordLimit)){
			//default to report all records
			parameters.recordLimit = 0;
		}
		var viewName = this.viewDef.viewName + '.axvw'; 
		return Workflow.startJob(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, viewName, this.dataSourceId, title, this.getVisibleFieldDefs(), toJSON(restriction), parameters);
	},
	
	setCategoryProperties: function(parameters){
		parameters.categoryDataSourceId = this.getCategoryDataSourceId();
		parameters.categoryFields = [this.getCategoryFieldDef(this.categoryField)];
		//XXX: 
		for(var i=0;i<this.getVisibleFieldDefs().length; i++){
			parameters.categoryFields.push({});
		}
		if(this.isCustomCategoryOrder){
			parameters.categoryOrder = this.categoryOrder;
		}
		parameters.categoryColors = this.categoryColors;
	},
	getCategoryFieldDefs: function(){
		var ctx = this.createEvaluationContext();
		
		var categoryFields = [];
		var categoryDS = View.dataSources.get(this.getCategoryDataSourceId());
		categoryDS.fieldDefs.each(function (fieldDef) {
			fieldDef.title = Ab.view.View.evaluateString(fieldDef.title, ctx, false);
			fieldDef.hidden = Ab.view.View.evaluateString(fieldDef.hidden, ctx, false);
			categoryFields.push(fieldDef);
    	});
		return categoryFields;
	},
	getCategoryFieldDef: function(fieldId){
		var categoryFields = this.getCategoryFieldDefs();
		for (var i = 0, field; field = categoryFields[i]; i++) {
			if(field.id === fieldId){
				return field;
			}	
		}
		return {};
	},  
	
	refresh: function(restriction, newRecord, clearRestriction) {		
		if (this.getCategoryField() != '') {
			this.setOrderAndStyle();			
		}
		this.inherit(restriction, newRecord, clearRestriction);
	},

	/*
	 * Performance optimizations: override mini-console methods that are not used.
	 */

	showIndexAndFilter: function() {
		// category grid does not display index and filter
	},

	addFilterPaletteAndListeners: function() {
		// category grid does not use filter listeners
	}
});
