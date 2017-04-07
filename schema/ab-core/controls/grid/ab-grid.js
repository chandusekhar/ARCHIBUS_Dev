/**
 * Declare the namespace for the grid classes: Ab.grid.
 */
Ab.namespace('grid');

/**
 * The Column class defines a grid column. 
 */
Ab.grid.Column = Base.extend({
	
	// column ID, usually a fully-qualified field name e.q. 'rm.rm_id'
	id: '',
	
	// fully-qualified field name
	fullName: '',
	
	// localized column name to be displayed
	name: '',
	
	// column type: 'text'|'number'|'date'|'time'|'button'|'radiobutton'|'checkbox'|'image' | 'link' | 'color'
	type: 'text',
	
	// 'restriction' on column types, for checking validity
	supportedTypes: ['text', 'link', 'number', 'number_link', 'date', 'time', 'button', 'radiobutton', 'checkbox', 'image', 'color'],
	
	// reference to the event handler for the default user action (i.e. onclick)
	defaultActionHandler: null,
	
	// custom handler invoked when each column cell is created
	onCreateCell: null,
	
	// column span
	colSpan: 1,
    
    // column width as a CSS property, i.e. "200px" or "10%", not used if null
    width: null,
		
	// button label text
	text: null,

	// columns that are calculated are virtual
	isVirtual: false,
	
	commands: [],

	imageName: null,

	// column's underlying dataType regardless of presentation (e.g., Double presented as link, Date presented as button)
	javaType: null,

	/**
	 * Constructor.
	 * @param id   Required.
	 * @param name Required.
	 * @param type Required.
	 */
	constructor: function(id, name, type, defaultActionHandler, onCreateCell, colSpan, width, text, commands, imageName) {
		this.id = id;
		this.name = name;
		
		// validate given type
		this.type = this.supportedTypes[0];
		for (var i=0; i < this.supportedTypes.length; i++) { 
			if (this.supportedTypes[i] == type) {
				this.type = type;
				break;
			}			
		}
		if (valueExists(defaultActionHandler)) {
			this.defaultActionHandler = defaultActionHandler;
		} 
		if (valueExists(onCreateCell)) {
			this.onCreateCell = onCreateCell;
		} 
		if (valueExists(colSpan)) {
		    this.colSpan = colSpan;
		}
        if (valueExists(width)) {
            this.width = width;
        }
        if (valueExists(text)) {
            this.text = text;
        }
		if (valueExists(commands)) {
			this.commands = commands
		}
		if (valueExists(imageName)) {
			this.imageName = imageName
		}
	},

	addCommand: function(configObject) {
		this.commands.push(configObject);
	}
});


/**
 * A column command object to be attached to grid column 
 *
 * previously done by the WFR
 */
Ab.grid.ColumnCommand = Base.extend({

	columnId: null,

	commandIndex: 0,

	command: '',

	constructor: function( ) {
	}
});


/**
 * The Grid class defines a grid component.
 */
Ab.grid.Grid = Ab.view.Component.extend({
	
	// array of column objects
	columns: null,
	
	// array of 2nd-tier column objects
	columns2: null,
	
	// array of row objects
	rows: null,
	
	// name of the CSS class for the table
	cssClassName: 'panelReport',

	// name of the CSS class for the table header
	cssHeaderClassName: '',

    // 2D array of cell DOM elements, 1st index is row, 2nd index is column
    cells: null,
    
    // array of header cell DOM elements
    headerCells: null,
    
    // array of 2nd-tier header cell DOM elements
    headerCells2: null,
    
    // array of table rows DOM elements
    rowElements: null,
    
 	// The opacity to apply to cell type of 'color'.  Default is null, meaning do not set.
	colorOpacity: null,

	// the maximum width of a grid cell's content, 
	// beyond which content is shortened to ellipses & whole content is shown in tooltip
	maxCellContentWidth: 50,

	/**
	 * Constructor.
	 *
	 * @param configObject - map with keys of possibly [rows, columns, cssClassName, showData, useParentRestriction]
	 */
	constructor: function(id, configObject) {
	    this.inherit(id, 'grid', configObject); 
	    
	    this.rows = [];
	    this.columns = [];
	    this.columns2 = [];
        
		var rows = configObject.getConfigParameterIfExists('rows');
		if (valueExists(rows)) {
			this.addRows(rows);
		}
		var columns = configObject.getConfigParameterIfExists('columns');
		if (valueExists(columns)) {
			this.addColumns(columns);
		}
		var maxCellContentWidthConfig = configObject.getConfigParameterIfExists('maxCellContentWidth');
		if (valueExists(maxCellContentWidthConfig)) {
			this.maxCellContentWidth = maxCellContentWidthConfig;
		}
		var cssClassName = configObject.getConfigParameterIfExists('cssClassName');
		if (valueExists(cssClassName)) {
		    this.cssClassName = cssClassName;
		}		
		var cssHeaderClassName = configObject.getConfigParameterIfExists('headerClass');
		if (valueExists(cssHeaderClassName)) {
		    this.cssHeaderClassName = cssHeaderClassName;
		}
	},
	
	// ----------------------- methods to manipulate the grid structure ----------------------------
    
	/**
	 * Adds a column object to the grid list of columns.
	 */
	addColumn: function(column, level) {
        this.getColumnsForLevel(level).push(column);
	},
	
	/**
	 * Add one column object to the beginning of the array of the grid list of columns.
	 */ 
	addColumnFirst: function(column) {
		this.columns.unshift(column);
	},
	
	/**
	 * Adds all column objects from the array to the grid list of columns.
	 */ 
	addColumns: function(columns) {
		this.columns = this.columns.concat(columns);
	},
	
	/**
	 * Removes column object at specified index.
	 */
	removeColumn: function(columnIndex) {
	    this.columns.splice(columnIndex, 1);
	},

    /**
     * Removes columns starting with specified index.
     */	
	removeColumns: function(columnIndex, level) {
	    var columns = this.getColumnsForLevel(level);
	    columns.splice(columnIndex, columns.length - columnIndex);
	},
	
	/**
	 * Returns columns array for specified level.
	 */
	getColumnsForLevel: function(level) {
	    if (typeof level != 'undefined' && level == 2) {
	        return this.columns2;
	    } else {
		    return this.columns;
	    }
	},
	
	/**
	 * Adds a row object to the grid list of rows.
	 */
	addRow: function(row) {
        row.grid = this;
		this.rows.push(row);
	},
	
	/**
	 * Adds all row objects from the array to the grid list of rows.
	 */ 
	addRows: function(rows) {
        for (var r = 0; r < rows.length; r++) {
            rows[r].grid = this;
        }
		this.rows = this.rows.concat(rows);
	},
	
	/**
	 * Removes row object at specified index.
	 */
	removeRow: function(rowIndex) {
	    this.rows.splice(rowIndex, 1);
	},

    /**
     * Removes rows starting with specified index.
     */	
	removeRows: function(rowIndex) {
	    this.rows.splice(rowIndex, this.rows.length - rowIndex);
	},

	/**
	 * Returns the number of generated table columns.
	 */
	getNumberOfColumns: function() {
		var numberOfColumns = 0;
		for (var c = 0; c < this.columns.length; c++) {
			var column = this.columns[c];
			numberOfColumns += column.colSpan;
		}
		return numberOfColumns;
	},
	
	/**
	 * Returns grid cell DOM element.
	 */
	getCell: function(row, column) {
	    return this.cells[row][column];
	},
	
	/**
	 * Sets the opacity to be applied to cells of type 'color'.
	 */
	setColorOpacity: function(op) {
	    this.colorOpacity=op;
	},	
	
	// ----------------------- DOM building methods ------------------------------------------------
	
    /**
     * Removes the HTML content. Assumes that the grid <table> element 
     * is the first <table> child of the parent element with an ID = 'grid_' parentElement.id.
     */
    clear: function() {
        this.cells = null;
        
		if (null == this.parentElement) {
			return false;
		}
		
        var tables = this.parentElement.getElementsByTagName('table');
        if (tables != null && tables.length > 0) {
			if (tables[0].id == 'grid_' + this.parentElement.id) {
	            this.parentElement.removeChild(tables[0]);
			}
        }
    },
	
	/**
	 * Creates HTML DOM treee containing grid <table> element and its children.
	 */
	build: function() {
        this.clear();
	    
		var table = document.createElement('table');
		table.id = 'grid_' + this.parentElement.id;
		table.className = this.cssClassName;
				
		var thead = document.createElement('thead');
		var tbody = document.createElement('tbody');
		// not used yet
		// var tfoot = document.createElement('tfoot');
		
		this.rowElements = new Array();
		this.headerCells = new Array();
	    this.headerCells2 = new Array();
		
		// create grid header row
		var columns = this.columns;
		this.createHeaderRow(thead, columns, this.headerCells);

        // create 2nd-tier header row		
		if (this.columns2.length > 0) {
		    columns = this.columns2;
		    this.createHeaderRow(thead, columns, this.headerCells2);
		}
		table.appendChild(thead);
		
		// create grid data rows
		this.createDataRows(tbody, columns);		
		table.appendChild(tbody);

        this.parentElement.appendChild(table);
	},
	
	/**
	 * Invoked before the build() method.
	 */
	beforeBuild: function() {},
	
	/**
	 * Invoked after the build() method.
	 */
	afterBuild: function() {},
	
	
	/**
	 * Creates grid header row and adds it to the grid.
	 */
	createHeaderRow: function(parentElement, columns, headerCells) {
		var headerRow = document.createElement('tr');
		for (var c = 0; c < columns.length; c++) {
			var column = columns[c];
			
			var headerCell = document.createElement('th');
			headerCell.colSpan = column.colSpan;
            if (column.width != null) {
                headerCell.style.width = column.width;
            }
			headerRow.appendChild(headerCell);
			
			headerCell.appendChild(document.createTextNode(column.name));
			
			headerCells.push(headerCell);
		}
	    parentElement.appendChild(headerRow);
	    this.rowElements.push(headerRow);
	},
	
	hasMultiline: function(columns) {
		var multiline = false;
		for (var c = 0, column; column = columns[c]; c++) {
			if(column.width){
				multiline = true;
			}
		}
		return multiline;
	},
		
	/**
	 * Creates all data rows and adds them to the grid.
	 */
	createDataRows: function(parentElement, columns) {
	    var numRows = this.rows.length;
        this.cells = new Array(numRows);
        var multiline = this.hasMultiline(columns);
	    
		for (var r = 0; r < numRows; r++) {
			var row = this.rows[r];
			row.index = r;
			
			var rowElement = document.createElement('tr');
			rowElement.className = 'dataRow';
			rowElement.className += (multiline) ? ' multiline' : ' singleline'; 
		
		    var numColumns = columns.length;
		    this.cells[r] = new Array(numColumns);	
            
			for (var c = 0; c < numColumns; c++) {
				var column = columns[c];

                var cellElement = document.createElement('td');
                this.cells[r][c] = cellElement;
                
                // if custom create handler is defined for this column
                if (column.onCreateCell != null) {
                    column.onCreateCell(row, column, cellElement);
                    // if custom create handler set the cell colSpan attribute, 
                    // skip as many cells in this row
                    var colSpan = cellElement.colSpan;
                    c = c + colSpan - 1;
                } else {
                    // create default cell content
                    this.createCellContent(row, column, cellElement);
                }                 
			
                if (column.width != null) {
                    cellElement.style.width = column.width;
                }
                
                rowElement.appendChild(cellElement);
			}
            
            parentElement.appendChild(rowElement);
	        this.rowElements.push(rowElement);
		}
	},
	
	/**
	 * Helper function to create individual cell content element.
	 */
	createCellContent: function(row, column, cellElement, colorVal) {
		var content = "";
		
	    var value = row[column.id];
	    if (typeof value == 'undefined') {
	        value = row[column.fullName];
	    }

    	var tooltipTag = (Ext.isIE) ? 'title' : 'ext:qtip';

		if (column.type == 'text' || column.type == 'number' || column.type == 'date' || column.type == 'time') {
            if (typeof value == 'undefined') {
                value = '';
            }
			
			// handle special characters
			value = this.transformCellValueSpecialChars(value);

            if(valueExistsNotEmpty(column.width)){
            	content = value;
            } else {
            	content = Ext.util.Format.ellipsis(value, this.maxCellContentWidth);
          	}

			if (value.length > this.maxCellContentWidth) {
                value = value.replace(/\r\n/g, "<br/>");
                if(!valueExistsNotEmpty(column.width)){
                	cellElement.setAttribute(tooltipTag, value);
                }
            }
            
			if (column.type == 'number') {
			    cellElement.style.textAlign = 'right';
			}			
		} else if (column.type == 'link' || column.type == 'number_link') {
            if (typeof value == 'undefined') {
                value = '';
            }

            if (column.type == 'number_link') {
                cellElement.style.textAlign = 'right';
            }
			
            if (column.javaType == 'java.lang.String') {
				value = this.transformCellValueSpecialChars(value);
			}

		    if(valueExistsNotEmpty(column.width)){
		    	if(column.format == 'Memo'){
		    		content = "<p class='memo'><a href='javascript: //' " + tooltipTag + "='" + this.getDisplayableTooltip(value) + "'>" + value + "</a></p>";
		    	} else {
		    		content = "<a href='javascript: //'>" + value + "</a>";
		    	}
		    } else {
		    	content = "<a href='javascript: //'>" + Ext.util.Format.ellipsis(value, this.maxCellContentWidth) + "</a>";
		    }
			
			if (value.length > this.maxCellContentWidth && !valueExistsNotEmpty(column.width)) {
				cellElement.setAttribute(tooltipTag, value.replace(/\r\n/g, "<br/>"));
			}
		} else if (column.type == 'button') {
		    if (typeof value == 'undefined' || value == true) {
			    content = "<input type='button' value='" + column.text + "'/>";
		    }
        } else if (column.type == 'image') {
            if (typeof value == 'undefined' || value == true) {
            	content = "<input type='image' alt='" + column.text + "' title='" + column.text + "' src='" + column.imageName + "' hspace='1' border='0' />";
            }
		} else if (column.type == 'checkbox') {
            content = "<input type='checkbox'";
            if (value == 'true') {
                content = content + " checked='true' ";
            }
            content = content + "/>";
		} else if (column.type == 'radiobutton') {
            content = "<input type='radio' name='" + column.id + "'";
            if (value == 'true') {
                content = content + " checked='true' ";
            }
            content = content + "/>";
		} else if (column.type == 'color') {
			if (value == undefined)
				value = '';
			  content = (valueExistsNotEmpty(column.width)) ? '' : Ext.util.Format.ellipsis('', 50);

			var hpattern = new Ab.data.HighlightPattern(value);
			if (hpattern.isHatched()) {
		    	// HATCHED pattern
				var bitmapName = this.getLegendBitmapName(column.id, row, hpattern);
				if (bitmapName) {
					//KB# 3036630 - fill the cell with hatch pattern.
					//kb# 3036164 - fix "unusual row height when bitmap images are not yet generated."
	                content = "<img src='" + View.project.projectGraphicsFolder + '/' + bitmapName + ".png' hspace='0' border='0' style='width:100%;height:16px;'/>";
				}
		    	
			} else {
				// handle possibility that the raw value passed in is a hex value already
				var color = '';
				if (value.substr(0,2) == '0x') {
					color = value.substr(2);
			    } else {
					color = gAcadColorMgr.getRGBFromPatternForGrid(value, true);
					if (color == "-1") {
						if (colorVal == undefined || !colorVal.length)
							color = gAcadColorMgr.getUnassignedColor(true);
						else
							color = gAcadColorMgr.getColorFromValue(colorVal, true);
					}
				}

				var legendKeyColumn = this.getLegendKeyColumn();
				if(valueExists(legendKeyColumn)){
					gAcadColorMgr.setColor(legendKeyColumn.id, row[legendKeyColumn.id], color);
				}
				
				
				var style = (valueExistsNotEmpty(this.colorOpacity)) ? 'opacity: ' + this.colorOpacity + '; filter: alpha(opacity=\'' + (this.colorOpacity * 100).toFixed() + '\')' : '';
				content = '<div class="colorSwatch" style="background-color:#' + color + ';' + style + '"></div>';
				

				// KB 3027141 content width should not be set or the color block does NOT fill the cell
				// var width = '200px';
				// if (column.width != null) { width = column.width; }
				//content = '<div style="width:' + width + ';height:16px;background-color:#' + color + ';"></div>';
				//content = '<div style="width:100%;height:16px;background-color:#' + color + ';"></div>';
		    }
			cellElement.style.padding = "0";
			}
        
        cellElement.innerHTML = content;

        var contentElement = cellElement.childNodes[0];
        // IE6 cannot add an ID to a text node
        if (valueExists(contentElement) && contentElement.nodeType != 3) {
            contentElement.id = this.generateId(row, column);
        }
        
        // register default column event handler
        if (column.defaultActionHandler != null) {
            var fn = column.defaultActionHandler;
            if (!fn.call) {
                fn = window[fn];
            }
            var delegate = fn.createDelegate(row, [row, column]);
            jQuery(contentElement).on("click", delegate);
        }
		this.afterCreateCellContent(row, column, cellElement);
	},
	
	getDisplayableTooltip: function(text) {
		if (valueExistsNotEmpty(text)){
			text = text.replace(/'/g, '&apos;');
		}
		return text;
	},

	/**
	 * Gets legend key column from this.columns list.
	 */
	getLegendKeyColumn: function(){
		for(var i=0; i < this.columns.length; i++){
			var column = this.columns[i];
			if(valueExistsNotEmpty(column.legendKey) && column.legendKey === "true"){
				return column;
			}
		}
		return null;
	},


	transformCellValueSpecialChars: function(value) {
            // handle special characters to make them shown up in both IE and FireFox
            value = value.replace(/\&/g, "&amp;");
            value = value.replace(/>/g, "&gt;");
            value = value.replace(/</g, "&lt;");
			// extended ASCII characters (e.g., &#225; &aacute) must preserver the &, translate only isolated ampersands
            //value = value.replace(/ & /g, " &amp; ");

			return value;
	},

	
	/**
	 * Returns the legend bitmap URL specified by the highlight pattern.  
	 */
	getLegendBitmapName: function(id, row, hpattern) {
		return null;
	},
	
	/**
	 * Stub for user customization
	 */
	afterCreateCellContent: function(row, column, cellElement) {
	},
	
	/**
	 * Checks whether specified column has active commands or JS event handlers.
	 */
	isActiveColumn: function(column) {
	    return (column.defaultActionHandler != null || 
	            (column.commands != null && column.commands.length > 0));
	},
	
	/**
	 * Generates unique ID for a cell element.
	 */
	generateId: function(row, column) {
	    return (this.id + '_row' + row.index + '_' + column.id);
	},

	/**
	 * Creates image element.
	 * @param {src} Relative image file path.
	 * @param {alt} Alternative image text, also shown in IE as a tooltip.
	 */
	createImage: function(src, alt, hspace, width, height) {
        var image = document.createElement('img');
        image.src = src;
        image.alt = alt;
        image.title = alt;
        image.border = 0;
        image.hspace = hspace;
        if (valueExists(width)) {
            image.width = width;
        }
        if (valueExists(height)) {
            image.height = height;
        }
        return image;    
	},
	
	/**
	 * Creates empty link for JS even handler.
	 */
	createLink: function() {
		var link = document.createElement('a');
		link.href = 'javascript: //';
        return link;	    
	}
});


