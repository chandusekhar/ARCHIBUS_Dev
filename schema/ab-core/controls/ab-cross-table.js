/**
 * MDX cross-table report.
 */
Ab.view.CrossTable = Ab.view.Component.extend({
    
	// view definition to be displayed
	viewDef: null,
    
    // whether the panel should display its field values on load
    showOnLoad: false,
    
    // name of the default WFR used to get the record
    refreshWorkflowRuleId: '',
    
    // user function to call after refresh()
    afterRefreshListener: null,
    
	// array of Ab.data.FieldDef for groupBy fields
	groupByFields: null,
	
    // array of Ab.data.FieldDef for calculated fields
    calculatedFields: null,
    
    // data record retrieved from the server
    dataSet: null,
	
	// 1d or 2d
	dataType: '',
	
	//drill-down
	clickable: true,
	
    // optional: name of the first (row) dimension data source 
	rowDimensionDataSourceId: '',
	
    // optional: name of the second (column) dimension data source 
	columnDimensionDataSourceId: '',
    
    // optional: first (row) dimension data source 
	rowDataSource: null,
	
    // optional: second (column) dimension data source 
	columnDataSource: null,
	
	// array of Ab.data.FieldDef for row measures
	rowMeasureFields: null,
	
	// id for click-able link. It's started with clicked field's full name followed by a semicolon and the rest part
	clickableId: null,
	
	scrollbarFactor: 20,
	
	hasScroller: false,
    // ----------------------- initialization ------------------------------------------------------
    
    /**
     * Constructor.
	 *
	 * @param id
	 * @param configObject
     */
	constructor: function(id, configObject) {
        this.inherit(id, 'crossTable', configObject);  
        
        this.clickableId = this.id;

        this.viewDef = new Ab.view.ViewDef(configObject.getConfigParameter('viewDef'), configObject.getConfigParameter('groupIndex'), null, null, configObject.getConfigParameter('dataSourceId'));
                
        this.columns = configObject.getConfigParameter('columns', 1);
        this.showOnLoad = configObject.getConfigParameter('showOnLoad', false);
		this.refreshWorkflowRuleId = configObject.getConfigParameterNotEmpty('refreshWorkflowRuleId', 
            Ab.view.CrossTable.WORKFLOW_RULE_REFRESH);
        this.fieldDefs = configObject.getConfigParameter('fieldDefs', []);

        this.addEventListenerFromConfig('afterGetData', configObject);
		
		var groupByFields = [];
		var calculatedFields = [];
		this.getDataSource().fieldDefs.each(function (fieldDef) {
			if (fieldDef.groupBy) {
				groupByFields.push(fieldDef);
			} else {
				calculatedFields.push(fieldDef);
			}
		});
		this.groupByFields = groupByFields;
		this.calculatedFields = calculatedFields;

        this.rowDimensionDataSourceId = configObject.getConfigParameter('rowDimensionDataSourceId', '');
        this.columnDimensionDataSourceId = configObject.getConfigParameter('columnDimensionDataSourceId', '');
        
        var rowMeasureFields = [];        		
        if (valueExistsNotEmpty(this.rowDimensionDataSourceId)) {
        	this.rowDataSource = View.dataSources.get(this.rowDimensionDataSourceId);
        	var skipField = true; // skip the first field
    		this.rowDataSource.fieldDefs.each(function (fieldDef) {
    			if (skipField) {
    				skipField = false;
    			} else {
                    rowMeasureFields.push(fieldDef);
    			}
    		});
        }
        if (valueExistsNotEmpty(this.columnDimensionDataSourceId)) {
        	this.columnDataSource = View.dataSources.get(this.columnDimensionDataSourceId);
        }
        this.rowMeasureFields = rowMeasureFields;
		
        this.dataType = (this.groupByFields.length == 2) ? '2d' : '1d';
                    
        this.visible = true;
        
        this.parentEl.addClass('AbMdx_Table');
    },
    
    // ------------------------ common control API methods -----------------------------------------

    /**
     * Returns Ext.Element wrapper for the parent element.
     */
    getEl: function() {
        var el = this.inherit();
        var layoutWrapperEl = Ext.get(this.getWrapperElementId());
        if (layoutWrapperEl) {
            // KB 3038565: handle the case when the panel and an action button have the same ID
            // in the view file (not recommended, but not prohibited either).
            el = layoutWrapperEl.child('.crossTable');
        }
        return el;
    },
    
    /**
     * Returns true if component implement own scroller.
     */
    useScroller: function(){
    	this.hasScroller;
    },
    
    /**
     * Returns true if the layout region can scroll the component content.
     * Override in components that either scroll their own content (e.g. grid) or scale it (e.g. drawing, map).
     */
    isScrollInLayout: function() {
        return !this.useScroller();
    },

    /**
     * Returns the Ext element that can be resized to match the region height and scrolled.
     */
    getScrollableEl: function() {
        return null;
    },

    /**
     * Performs initial data fetch from the server to display the control after the view is loaded. 
     */
    initialDataFetch: function() {
    	this.clickable = (this.getEventListener('onClickItem')) ? true : false;
    	
        if (this.showOnLoad || this.restriction != null) {
            this.getDataSet(true);
        }  

        this.show(this.showOnLoad);
    },
    
    /**
     * Refreshes the control UI state, possibly by obtaining data from the server.
     */
    refresh: function(restriction) {
        // store the restriction if specified
        // if restriction is not specified, keep the current one
        if (typeof(restriction) != 'undefined' && restriction != null && restriction != '') {
            this.restriction = restriction;
        }

        this.getDataSet(false);
    },
    
    /**
     * Called after the panel data is retrieved.
     */
    afterGetData: function(dataSet) {
        var listener = this.getEventListener('afterGetData');
        if (listener) {
            listener(this, dataSet);
        }
    },
    
    /**
     * Clears the panel content.
     */
    clear: function() {
        var tableId = this.parentElementId + '_table';
        var table = Ext.get(tableId);
        if (table != null) {
            table.remove();
        }
    },
    
    /**
     * Displays new data set in the report.
     * @param {Object} dataSet
     */
    setDataSet: function(dataSet) {
        this.clear();
        this.dataSet = dataSet;
        this.formatDataRecords();
        this.onModelUpdate();
    },
    
    // ----------------------- implementation ------------------------------------------------------
    
	/**
	 * Handles report data records. Applies field formatting, such as currency symbol.
	 */
    formatDataRecords: function(result) {
		var ds = this.getDataSource();
		if (valueExists(ds)) {
			var processRecords = function(records) {
				if (valueExists(records)) {
			        for (var i = 0; i < records.length; i++) {
			            var formattedValues = ds.formatCurrencyValues(records[i].localizedValues, false);
			            Ext.apply(records[i].localizedValues, formattedValues);
			        }
				}
			};
	
			if(valueExists(this.dataSet.records)){
				processRecords(this.dataSet.records);
			}
			if(valueExists(this.dataSet.columnSubtotals)){
				processRecords(this.dataSet.columnSubtotals);
			}
			if(valueExists(this.dataSet.rowSubtotals)){
				processRecords(this.dataSet.rowSubtotals);
			}
			if(valueExists(this.dataSet.totals)){
				processRecords(this.dataSet.totals);
			}
		}
	},
	
    /**
     * Clears visible content and displays the current data.
     */
    onModelUpdate: function() {
        this.clear();

        var tableId = this.parentElementId + '_table';
        var html = '<table id="' + tableId + '" class="AbMdx_Table">';

		if (this.dataType == '1d') {
			html = html + this.render1D();
		} else {
			html = html + this.render2D();
		}

        html = html + '</table>';
        var table = Ext.DomHelper.insertHtml('afterBegin', this.parentElement, html);
		
        // attach drill-down event listeners
		var panel = this;
	    var links = Ext.DomQuery.select('a', table);
	    var listener = this.getEventListener('onClickItem');
		for (var i = 0; i < links.length; i++) {
			if (listener) {
				Ext.get(links[i]).addListener('click', function(){
					panel.onClickItem(this.id);
				});
			} 
		}
    },
    
    /**
     * Returns true if there is at least one calculated field with showTotals="true".
     */
    showTotals: function() {
    	showTotals = false;
		for (var i = 0; i < this.calculatedFields.length; i++) {
            if (this.calculatedFields[i].showTotals) {
            	showTotals = true;
            	break;
            }
		}
		
		if (this.dataSet.totals.length == 0) {
			showTotals = false;
		}
    	
    	return showTotals;
    },
    
    /**
     * Renders 1D cross-table and returns the formatted HTML.
     */
    render1D: function() {
    	var html = '';
        var totalsTitle = this.getLocalizedString(Ab.view.CrossTable.z_MESSAGE_TOTALS);
        
		// add title row
		html = html + '<tr class="first">';
	    html = html + '<td class="AbMdx_DimensionNames first">' + convertFromXMLValue(this.groupByFields[0].title) + '</td>';
		for (var i = 0; i < this.rowMeasureFields.length; i++) {
			html = html + '<td class="AbMdx_DimensionNames">' + convertFromXMLValue(this.rowMeasureFields[i].title) + '</td>';
		}
		for (var i = 0; i < this.calculatedFields.length; i++) {
			html = html + '<td class="AbMdx_DimensionColumnHeader">' + convertFromXMLValue(this.calculatedFields[i].title) + '</td>';
		}
		html = html + '</tr>';
		
		// add totals row
		if (this.showTotals()) {
			html = html + '<tr>';
			html = html + '<td class="AbMdx_TotalCellHeader first">' + totalsTitle + '</td>';
			for (var i = 0; i < this.rowMeasureFields.length; i++) {
				html = html + '<td class="AbMdx_SubTotalRowData"></td>';
			}
			for (var i = 0; i < this.calculatedFields.length; i++) {
				var totalValue = this.dataSet.totals[0].getLocalizedValue(this.calculatedFields[i].id);
	            if (!this.calculatedFields[i].showTotals) {
	            	totalValue = '';
	            }
	            this.clickableId = this.calculatedFields[i].id + ';' + this.id;
				html = html + '<td class="AbMdx_SubTotalRowData">' + this.getTotalsHtml(totalValue) + '</td>';
			}
			html = html + '</tr>';
		}
		
		// add data rows
		for (var r = 0; r < this.dataSet.records.length; r++) {
			var record = this.dataSet.records[r];
			var rowTitle = this.dataSet.rowValues[r].l;
			var rowRecord = this.dataSet.rowRecords[r];
			
			html = html + '<tr class="' + ((r % 2 == 0) ? 'dataRow' : 'dataRow odd') + '">';
			html = html + '<td class="AbMdx_DimensionRowHeader first">' + this.getRowHtml(r, rowTitle)  + '</td>';
			for (var f = 0; f < this.rowMeasureFields.length; f++) {
				this.clickableId = this.rowMeasureFields[f].id + ';' + this.id;
				var cellValue = rowRecord.getLocalizedValue(this.rowMeasureFields[f].id);
				html = html + '<td class="AbMdx_MeasureCellData">' + this.getCellHtml(r, 0, f, cellValue) + '</td>';
			}
			for (var f = 0; f < this.calculatedFields.length; f++) {
				this.clickableId = this.calculatedFields[f].id + ';' + this.id;
				var cellValue = record.getLocalizedValue(this.calculatedFields[f].id);
				html = html + '<td class="AbMdx_MeasureCellData">' + this.getCellHtml(r, 0, f, cellValue) + '</td>';
			}
            html = html + '</tr>';
		}
		
		return html;
    },
    
    /**
     * Renders 2D cross-table and returns the formatted HTML.
     */
    render2D: function() {
    	var html = '';
        var totalsTitle = this.getLocalizedString(Ab.view.CrossTable.z_MESSAGE_TOTALS);
        
        // get the number of row dimension fields (eg. department|division)
        var nRowDimensionFields = this.getNumberOfRowDimensionFields();
        var nRowMeasureFields = this.rowMeasureFields.length;
        var nMeasureFields = this.calculatedFields.length;
	    
		// row 1: 2nd dimension name
		html = html + '<tr class="first">';
        html = html + '<td class="AbMdx_DimensionNames first" colspan="' + (nRowDimensionFields + nRowMeasureFields + 1) + '"><br/></td>';
        html = html + '<td class="AbMdx_DimensionNames" colspan="' + (this.dataSet.columnValues.length + 1) + '">' + convertFromXMLValue(this.groupByFields[1].title) + '</td>';
        html = html + '</tr>';
		
		// row 2: 1st dimension name, 2nd dimension values
        html = html + '<tr>';
        html = html + '<td class="AbMdx_DimensionNames first">' + convertFromXMLValue(this.groupByFields[0].title) + '</td>';
        if (nRowDimensionFields > 1) {
            html = html + '<td  class="AbMdx_DimensionNames"></td>';
        }
        for (var i = 0; i < nRowMeasureFields; i++) {
			html = html + '<td class="AbMdx_DimensionNames">' + convertFromXMLValue(this.rowMeasureFields[i].title) + '</td>';
        }
        html = html + '<td class="AbMdx_DimensionNames"><br/></td>';
        
        if (this.showTotals()) {
            html = html + '<td class="AbMdx_TotalCellHeader">' + totalsTitle + '</td>';
        }
        
        for (var c = 0; c < this.dataSet.columnValues.length; c++) {
			var columnTitle = this.dataSet.columnValues[c].l;
            html = html + '<td class="AbMdx_DimensionColumnHeader">' + this.getColumnHtml(c, columnTitle) + '</td>';
        }
        html = html + '</tr>';
		
		// row 3 (multiple sub-rows): 2st dimension subtotals for all measures
        if (this.showTotals()) {
            var totalValue = this.dataSet.totals[0].getLocalizedValue(this.calculatedFields[0].id);
            if (!this.calculatedFields[0].showTotals) {
            	totalValue = '';
            }
            
            html = html + '<tr>';
            html = html + '<td class="AbMdx_TotalCellHeader first" rowspan="' + this.calculatedFields.length + '">' + totalsTitle + '</td>';
            for (var i = 0; i < nRowMeasureFields; i++) {
    			html = html + '<td class="AbMdx_TotalCellData"></td>';
            }
            this.clickableId = this.calculatedFields[0].id + ';' + this.id;
            html = html + '<td class="AbMdx_MeasureName">' + convertFromXMLValue(this.calculatedFields[0].title) + '</td>';
            html = html + '<td class="AbMdx_TotalCellData">' + this.getTotalsHtml(totalValue) + '</td>';
            for (var c = 0; c < this.dataSet.columnValues.length; c++) {
            	var columnSubtotal = this.dataSet.columnSubtotals[c];

            	var subtotalValue = '';
            	if (valueExists(columnSubtotal) && this.calculatedFields[0].showTotals) {
            		subtotalValue = this.dataSet.columnSubtotals[c].getLocalizedValue(this.calculatedFields[0].id);
            	}
            	
                html = html + '<td class="AbMdx_SubTotalColumnData">' + this.getColumnTotalsHtml(c, subtotalValue) + '</td>';
            }
            html = html + '</tr>';

			for (var f = 1; f < this.calculatedFields.length; f++) {
                totalValue = this.dataSet.totals[0].getLocalizedValue(this.calculatedFields[f].id);
                if (!this.calculatedFields[f].showTotals) {
                	totalValue = '';
                }

				html = html + '<tr>';
	            for (var i = 0; i < nRowMeasureFields; i++) {
	    			html = html + '<td class="AbMdx_TotalCellData"></td>';
	            }
	            this.clickableId = this.calculatedFields[f].id + ';' + this.id;
	            html = html + '<td class="AbMdx_MeasureName">' + convertFromXMLValue(this.calculatedFields[f].title) + '</td>';
	            html = html + '<td class="AbMdx_TotalCellData">' + this.getTotalsHtml(totalValue) + '</td>';
	            for (var c = 0; c < this.dataSet.columnValues.length; c++) {
					// KB-3048702 verify this.dataSet.columnSubtotals[c] is defined before getting localized value.
					var subtotalValue = '';
					if (this.calculatedFields[f].showTotals && this.dataSet.columnSubtotals[c] ) {
						subtotalValue = this.dataSet.columnSubtotals[c].getLocalizedValue(this.calculatedFields[f].id); 
					}
                    
	                html = html + '<td class="AbMdx_SubTotalColumnData">' + this.getColumnTotalsHtml(c, subtotalValue) + '</td>';
	            }
				html = html + '</tr>';
			}
        }
			
		// rows for all row dimension values (multiple sub-rows)
        var trCounter = 0;
		for (var r = 0; r < this.dataSet.rowValues.length; r++) {
            var rowTitle = this.dataSet.rowValues[r].l;
			var rowValue = this.dataSet.rowValues[r].n;
			var rowRecord = this.dataSet.rowRecords[r];
			
            var calculatedField = this.calculatedFields[0];
            this.clickableId = calculatedField.id + ';' + this.id;
            
			html = html + '<tr class="' + ((trCounter++ % 2 == 0) ? 'dataRow' : 'dataRow odd') + '">';
			
            var separatorIndex = rowTitle.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
            if (separatorIndex >= 0 && nRowDimensionFields > 1) {
                var firstTitle = rowTitle.slice(0, separatorIndex);
                var secondTitle = rowTitle.slice(separatorIndex + 1);
                html = html + '<td class="AbMdx_DimensionRowHeader first" rowspan="' + this.calculatedFields.length + '">' + this.getRowHtml(r, firstTitle) + '</td>';
                html = html + '<td class="AbMdx_DimensionRowHeader" rowspan="' + this.calculatedFields.length + '">' + this.getRowHtml(r, secondTitle) + '</td>';
            } else {
                html = html + '<td class="AbMdx_DimensionRowHeader first" rowspan="' + this.calculatedFields.length + '">' + this.getRowHtml(r, rowTitle) + '</td>';
            }
            for (var f = 0; f < nRowMeasureFields; f++) {
				var cellValue = rowRecord.getLocalizedValue(this.rowMeasureFields[f].id);
				html = html + '<td class="AbMdx_DimensionRowHeader" style="font-weight:normal;" rowSpan="' + this.calculatedFields.length + '">' + this.getCellHtml(r, 0, f, cellValue, false) + '</td>';
            }
            html = html + '<td class="AbMdx_MeasureColumn">' + convertFromXMLValue(calculatedField.title) + '</td>';
            
            if (this.showTotals()) {
                var subtotalValue = this.dataSet.rowSubtotals[r].getLocalizedValue(calculatedField.id);
                if (!calculatedField.showTotals) {
                	subtotalValue = '';
                }
               
                html = html + '<td class="AbMdx_SubTotalRowData">' + this.getRowTotalsHtml(r, subtotalValue) + '</td>';
            }
			
            for (var c = 0; c < this.dataSet.columnValues.length; c++) {
                var columnValue = this.dataSet.columnValues[c].n;
                var cellValue = this.getCellValue(rowValue, columnValue, calculatedField);
                html = html + '<td class="AbMdx_MeasureCellData">' + this.getCellHtml(r, c, 0, cellValue) + '</td>';
            }
            html = html + '</tr>';

            for (var f = 1; f < this.calculatedFields.length; f++) {
				calculatedField = this.calculatedFields[f];
				this.clickableId = calculatedField.id + ';' + this.id;
				
				html = html + '<tr class="' + ((trCounter++ % 2 == 0) ? 'dataRow' : 'dataRow odd') + '">';

				html = html + '<td class="AbMdx_MeasureColumn">' + convertFromXMLValue(calculatedField.title)  + '</td>';

                if (this.showTotals()) {
                    var subtotalValue = this.dataSet.rowSubtotals[r].getLocalizedValue(calculatedField.id);
                    if (!calculatedField.showTotals) {
                    	subtotalValue = '';
                    }
                  
                    html = html + '<td class="AbMdx_SubTotalRowData">' + this.getRowTotalsHtml(r, subtotalValue) + '</td>';
                }
				
                for (var c = 0; c < this.dataSet.columnValues.length; c++) {
					var columnValue = this.dataSet.columnValues[c].n;
					var cellValue = this.getCellValue(rowValue, columnValue, calculatedField);
                    html = html + '<td class="AbMdx_MeasureCellData">' + this.getCellHtml(r, c, f, cellValue) + '</td>';
                }
                html = html + '</tr>';
            }
		}      
    	
    	return html;
    },
    
    /**
     * Returns the number of row dimension fields (eg. department|division).
     */
    getNumberOfRowDimensionFields: function() {
        var nRowDimensionFields = 1;
        if (this.dataSet.rowValues.length > 0) {
	        var firstRowTitle = this.dataSet.rowValues[0].l;
	        var separatorIndex = firstRowTitle.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
	        if (separatorIndex >= 0) {
	        	nRowDimensionFields = 2;
	        }
        }
        
        return nRowDimensionFields;
    },
	
	/**
	 * Returns cell value for specified calculated field.
	 * @param {Object} rowValue
	 * @param {Object} columnValue
	 * @param {Object} calculatedField
	 */
	getCellValue: function(rowValue, columnValue, calculatedField) {
        var cellValue = this.getLocalizedString(Ab.view.CrossTable.z_MESSAGE_NODATA);
        var record = this.dataSet.getRecordForRowAndColumn(rowValue, columnValue);
        if (valueExists(record)) {
            cellValue = record.getLocalizedValue(calculatedField.id);
        }
        return cellValue;
	},
	
    /**
     * Returns row cell HTML for specified row index and cell value.
     * @param {Object} r
     * @param {Object} cellValue
     */
    getTotalsHtml: function(cellValue) {
        return this.getItemHtml(this.clickableId + '_totals', cellValue);
    },
    
    /**
     * Returns row cell HTML for specified row index and cell value.
     * @param {Object} r
     * @param {Object} cellValue
     */
    getRowHtml: function(r, cellValue) {
        return this.getItemHtml(this.clickableId + '_row_r' + r, cellValue);
    },
    
    /**
     * Returns row cell HTML for specified row index and cell value.
     * @param {Object} r
     * @param {Object} cellValue
     */
    getRowTotalsHtml: function(r, cellValue) {
        return this.getItemHtml(this.clickableId + '_rowTotals_r' + r, cellValue);
    },
    
    /**
     * Returns column cell HTML for specified column index and cell value.
     * @param {Object} c
     * @param {Object} cellValue
     */
    getColumnHtml: function(c, cellValue) {
        return this.getItemHtml(this.clickableId + '_column_c' + c, cellValue);
    },
    
    /**
     * Returns column cell HTML for specified column index and cell value.
     * @param {Object} c
     * @param {Object} cellValue
     */
    getColumnTotalsHtml: function(c, cellValue) {
        return this.getItemHtml(this.clickableId + '_columnTotals_c' + c, cellValue);
    },
    
    /**
     * Returns cell HTML for specified row, column, and field indices and cell value.
     * @param {Object} r
     * @param {Object} c
     * @param {Object} f
     * @param {Object} cellValue
     */
    getCellHtml: function(r, c, f, cellValue, clickable) {
        if (!valueExists(clickable)) {
            clickable = this.clickable;
        }
        return this.getItemHtml(this.clickableId + '_cell_r' + r + '_c' + c + '_f' + f, cellValue, clickable);
    },
	
    /**
     * @param {Object} r
     * @param {Object} c
     * @param {Object} f
     * @param {Object} cellValue
     */
    getItemHtml: function(cellId, cellValue, clickable) {
        if (!valueExists(clickable)) {
            clickable = this.clickable;
        }
        if (clickable) {
            return ('<a id="' + cellId + '" href="javascript: //">' + cellValue + '</a>');
        } else {
            return ('<span id="' + cellId + '">' + cellValue + '</span>'); 
        }
    },
    
	/**
	 * This function is called when the user clicks on any drill-down link.
	 * @param {Object} id
	 */
	onClickItem: function(id) {
		var listener = this.getEventListener('onClickItem');

		if (listener) {
			var restriction = this.getRestrictionFromId(id);

			// kb3025051
			var parameters = this.getParameters();
			var parameterRestriction = eval("(" + parameters.restriction + ")");
			if (typeof(parameterRestriction) != 'undefined' && parameterRestriction  != null && parameterRestriction  != '') {
				for(name in parameterRestriction){
					// kb3025500
					if(name != 'clauses' && name.indexOf('.') > 0 && parameterRestriction[name]){
						restriction.addClause(name, parameterRestriction[name], "=");
					}
				}				
			}
			
			// KB 3025051, 3025500: the panel might have additional restriction applied from another 
			// panel (console, tree, etc); it must be added to the drill-down restriction
			if (this.restriction != null && this.restriction.constructor != String) {
				restriction.addClauses(this.restriction, false, true);
			}

			if (listener.call) {
				// event listener is a function
				listener(this, restriction);
			} else {
				// event listener is a Command
				listener.restriction = restriction;
				listener.handle();
			}
		}
	},
	
	/**
	 * Creates a restriction from the drill-down link id.
	 * @param {Object} id
	 */
	getRestrictionFromId: function(id) {
        var restriction = new Ab.view.Restriction();
        
        id = this.parsedClickableId(id);
       
		if (id.indexOf('_rowTotals') == 0) {
            var rowIndex = id.slice(12);
            var rowValue = (this.dataSet.nullValueTitle == this.dataSet.rowValues[rowIndex].n) ? '' : this.dataSet.rowValues[rowIndex].n;
            var rowName = this.groupByFields[0].id;
            this.addRestrictionClause(restriction, rowName, rowValue);
            
        } else if (id.indexOf('_row') == 0) {
            var rowIndex = id.slice(6);
            var rowValue = this.dataSet.rowValues[rowIndex].n;
            var rowName = this.groupByFields[0].id;
            this.addRestrictionClause(restriction, rowName, rowValue);
            
        } else if (id.indexOf('_columnTotals') == 0) {
            var columnIndex = id.slice(15);
            var columnValue = this.dataSet.columnValues[columnIndex].n;
            var columnName = this.groupByFields[1].id;
            this.addRestrictionClause(restriction, columnName, columnValue);
            
        } else if (id.indexOf('_column') == 0) {
            var columnIndex = id.slice(9);
            var columnValue = this.dataSet.columnValues[columnIndex].n;
            var columnName = this.groupByFields[1].id;
            this.addRestrictionClause(restriction, columnName, columnValue);
            
		} else if (id.indexOf('_cell') == 0) {
			var parts = id.slice(6).split('_');

			var rowIndex = parts[0].slice(1);
            var rowValue = (this.dataSet.nullValueTitle == this.dataSet.rowValues[rowIndex].n) ? '' : this.dataSet.rowValues[rowIndex].n;
            var rowName = this.groupByFields[0].id;
            this.addRestrictionClause(restriction, rowName, rowValue);

            if (valueExists(this.dataSet.columnValues)) {
				var columnIndex = parts[1].slice(1);
				var columnValue = this.dataSet.columnValues[columnIndex].n;
				var columnName = this.groupByFields[1].id;
				this.addRestrictionClause(restriction, columnName, columnValue);
			}
		}

		return restriction;
	},
	
	/**
	 * Parse raw clickable item's id into a format which is recognized by getRestrictionFromId().
	 */
	parsedClickableId: function(clickableId){
		var id = clickableId;
		
		//separate field name with the rest of id if the id includes a semicolon.
		var idsArray = id.split(';');
		if(idsArray.length===1){
			id = idsArray[0];
		}else{
			id = idsArray[1];
		}
		
		// remove this id prefix
		id = id.replace(this.id, '');
		
		return id;
	},
	
	/**
	 * Get clicked item's full field name if possible.
	 */
	getClickedFieldName: function(clickableId){
		var idsArray = clickableId.split(';');
		if(idsArray.length > 1){
			return idsArray[0];
		}

		return null;
	},
	
	/**
	 * Get cell HTML Element object by indexings.
	 * 
	 * @param rowIndex: row index (started with 0);
	 * @param columnIndex: column index (started with 0);
	 * @param fieldIndex: field index (started with 0);
	 * @returns cell HTML Element object.
	 */
	getCellElement: function(rowIndex, columnIndex, fieldIndex){
		var cellId = this.calculatedFields[fieldIndex].id + ';' + this.id + '_cell_r' + rowIndex + '_c' + columnIndex + '_f' + fieldIndex;
		var cellDom = Ext.get(cellId);
		if(cellDom != null){
			return cellDom.dom;
		}
		return null;
	},
	
	/**
	 * Adds restriction clause based on row or column value. 1D and 2D datasets have 'N/A' values 
	 * instead of NULLs. In the restriction we must use the IS NULL clause in these cases.  
	 */
	addRestrictionClause: function(restriction, name, value) {
	    if (value.indexOf('no value') != -1) {
            restriction.addClause(name, '', 'IS NULL');
	    } else {
            restriction.addClause(name, value, '=');
	    }
	},
    
    /**
     * Retrieve the data set from the server using the new AbCommonResources-DataSourceService WFR.
     */    
    getDataSet: function(isInitialDataFetch) {
		// if a custom WFR is specified, call it 
		if (this.refreshWorkflowRuleId !== Ab.view.CrossTable.WORKFLOW_RULE_REFRESH) {
			this.getData();
			return;
		}

        this.beforeRefresh();

		// try to call the new WFR
        try {
        	var restriction = '';
            if (this.restriction != null) {
                restriction = toJSON(this.restriction);
            }
            
            // start the getGroupingDataSet job
            var jobId = Workflow.startJob('AbCommonResources-DataSourceService-getGroupingDataSet', 
            		this.viewDef.viewName,
            		this.viewDef.dataSourceId,
            		this.rowDimensionDataSourceId,
            		this.columnDimensionDataSourceId,
            		this.dataType,
            		this.getGroupByFieldNames(),
            		this.getDataSource().sortFieldDefs,
            		restriction,
            		this.parameters);
            
            var message = this.getLocalizedString(Ab.view.CrossTable.z_MESSAGE_WORKING);
            var panel = this;

            // open the progress bar and wait until the job is complete
            View.openJobProgressBar(message, jobId, null, function(status) {
            	
		        // call user-defined afterGetData listener
            	panel.afterGetData(status.dataSet);

                // render the data
				panel.setDataSet(status.dataSet);
				
				// show the panel if hidden
		        panel.show(true);
	            
		        // call user-defined afterRefresh listener
		        if (!isInitialDataFetch) {
		            panel.afterRefresh();
		        }
            }, 
            function(status) {
            	panel.handleError(status);
            });
            
        } catch (e) {
        	panel.handleError(e);
        }
    },
    
    /**
     * Retrieve record data from the server.
     */    
    getData: function(isInitialDataFetch) {
        this.beforeRefresh();

        try {
            var result = Ab.workflow.Workflow.call(this.refreshWorkflowRuleId, this.getParameters());
            if (valueExists(result.dataSet)) {
                
		        // call user-defined afterGetData listener
            	this.afterGetData(result.dataSet);

                // render the data
				this.setDataSet(result.dataSet);
				
				// show the panel if hidden
		        this.show(true);
	            
		        // call user-defined afterRefresh listener
		        if (!isInitialDataFetch) {
		            this.afterRefresh();
		        }
            }
        } catch (e) {
            this.handleError(e);
        }
    },
    
    /**
     * Returns parameters for the workflow rule.
     */
    getParameters: function() {
        var parameters = {
            viewName:          this.viewDef.viewName,
            dataSourceId:      this.viewDef.dataSourceId,
            rowDimensionDataSourceId: this.rowDimensionDataSourceId,
            columnDimensionDataSourceId: this.columnDimensionDataSourceId,
			dataType:          this.dataType,
			groupByFieldNames: toJSON(this.getGroupByFieldNames()),
			sortFieldDefs:     toJSON(this.getDataSource().sortFieldDefs),
			recordLimit:       -1
        };
		
        if (this.restriction != null) {
            parameters.restriction = toJSON(this.restriction);
        }
        
        Ext.apply(parameters, this.parameters);

        return parameters;
    },
    
    getGroupByFieldNames: function() {
		var groupByFieldNames = [];
		for (var i = 0; i < this.groupByFields.length; i++) {
			groupByFieldNames.push(this.groupByFields[i].id);
		}
		return groupByFieldNames;
    },
    
 // ----------------------- export report selection --------------------------------------------------
    /**
     * Called by Ab.command.exportPanel in ab-command.js to have a report. 
     * 
     * @param {reportProperties} Map {outputType: this.outputType, printRestriction: this.printRestriction, orientation: this.orientation}
     */
    callReportJob: function(reportProperties){
    	var outputType = reportProperties.outputType;
    	if(outputType === 'xls'){
    		var reportTitle = this.title;
    		if(reportTitle==''){
    			reportTitle = Ab.view.View.title;
    		}
    		return this.callXLSReportJob(reportTitle, this.restriction);
    	}else if(outputType === 'docx'){
    		//no translatable since it's only for viwew designers.
    		View.showMessage('error', 'DOCX action is NOT supported for a Cross-table panel.');
    	}
    	return null;
    },
    /**
     * Call the job to generate a XLS report and return the job id. It's could be called by applicayions.
     * 
     * reportTitle: report title.
     * restriction: parsed restriction.
     */
    callXLSReportJob: function(reportTitle, restriction){
    	var reportViewName = this.viewDef.viewName + '.axvw';
		var parameters = this.getParameters();
		
		var jobId = Workflow.startJob(Ab.view.CrossTable.WORKFLOW_RULE_XLS_REPORT, reportViewName, this.dataSourceId, this.dataType, reportTitle, this.groupByFields, 
				this.calculatedFields, this.getDataSource().sortFieldDefs, this.rowDimensionDataSourceId,  this.columnDimensionDataSourceId, this.rowMeasureFields, toJSON(restriction), parameters);
		
		return jobId;
    }
    
}, {
    // ----------------------- constants -----------------------------------------------------------
    
    // @begin_translatable
    z_MESSAGE_TOTALS: 'Total',
    z_MESSAGE_WORKING: 'Retrieving the data',
    // @end_translatable
    
    z_MESSAGE_NODATA: '',
	
    // name of the default WFR used to get the record
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecords',
    
    // name of the WFR used to invoke XLS report
    WORKFLOW_RULE_XLS_REPORT: 'AbSystemAdministration-generatePaginatedReport-generateCrossTabXLSReport',
    
    // minimum height of the grid body in pixels required for the scroller to be displayed
    MIN_SCROLLING_HEIGHT: 30
});
