/**
 * Declare the namespace for the grid classes: AFM.grid.
 */
AFM.namespace('grid');

/**
 * The Column class defines a grid column. 
 */
AFM.grid.Column = Base.extend({
	
	// column ID, usually a fully-qualified field name e.q. 'rm.rm_id'
	id: '',
	
	// localized column name to be displayed
	name: '',
	
	// column type: 'text'|'number'|'date'|'time'|'button'|'radiobutton'|'checkbox'|'image'
	type: 'text',
	
	// 'restriction' on column types, for checking validity
	supportedTypes: ['text', 'link', 'number', 'date', 'time', 'button', 'radiobutton', 'checkbox', 'image'],
	
	// reference to the event handler for the default user action (i.e. onclick)
	defaultActionHandler: null,
	
	// custom handler invoked when each column cell is created
	onCreateCell: null,
	
	// column span
	colSpan: 1,
    
    // column width as a CSS property, i.e. "200px" or "10%", not used if null
    width: null,  
	
	/**
	 * Constructor.
	 * @param id   Required.
	 * @param name Required.
	 * @param type Required.
	 */
	constructor: function(id, name, type, defaultActionHandler, onCreateCell, colSpan, width) {
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
	}
});

/**
 * The Grid class defines a grid component.
 */
AFM.grid.Grid = AFM.view.Component.extend({
	
	// array of column objects
	columns: [],
	
	// array of 2nd-tier column objects
	columns2: [],
	
	// array of row objects
	rows: [],
	
	// name of the CSS class for the table
	cssClassName: 'panelReport',

    // 2D array of cell DOM elements, 1st index is row, 2nd index is column
    cells: null,
    
    // array of header cell DOM elements
    headerCells: null,
    
    // array of 2nd-tier header cell DOM elements
    headerCells2: null,
    
    // array of table rows DOM elements
    rowElements: null,

	/**
	 * Constructor.
	 *
	 * @param configObject - map with keys of possibly [rows, columns, cssClassName, showData, useParentRestriction]
	 */
	constructor: function(controlId, configObject) {
	    this.inherit(controlId, 'grid', configObject); 
        
		var rows = configObject.getConfigParameterIfExists('rows');
		if (valueExists(rows)) {
			this.addRows(rows);
		}
		var columns = configObject.getConfigParameterIfExists('columns');
		if (valueExists(columns)) {
			this.addColumns(columns);
		}
		var cssClassName = configObject.getConfigParameterIfExists('cssClassName');
		if (valueExists(cssClassName)) {
		    this.cssClassName = cssClassName;
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
			headerCell.scope = 'col'; //- added to accomodate accessibility readers
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
	
	/**
	 * Creates all data rows and adds them to the grid.
	 */
	createDataRows: function(parentElement, columns) {
	    var numRows = this.rows.length;
        this.cells = new Array(numRows);
	    
		for (var r = 0; r < numRows; r++) {
			var row = this.rows[r];
			row.index = r;
			
			var rowElement = document.createElement('tr');
			rowElement.className = 'dataRow';
		
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
				if (c == 0) {
                    cellElement.scope = 'row'; //- added to accomodate accessibility readers
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
	createCellContent: function(row, column, cellElement) {
		var content = "";
		
	    var value = row[column.id];
	    var rawValue = row[column.id + '.raw'];
		if (column.type == 'text' || column.type == 'number' || column.type == 'date' || column.type == 'time') {
            if (typeof value == 'undefined') {
                value = '';
            }
            if (valueExists(rawValue) && rawValue == '') {
                value = '';
            }
            //XXX: handle special characters to make them shown up in both IE and FireFox
            if(column.type == 'text'){
            	value = value.replace(/&/g, "&amp;");
	 			value = value.replace(/>/g, "&gt;");
	 			value = value.replace(/</g, "&lt;");
            }
	 		
			content = value;
			if (column.type == 'number') {
			    cellElement.style.textAlign = 'right';
			}
			
		} else if (column.type == 'link') {
            if (typeof value == 'undefined') {
                value = '';
            }
		    content = "<a href='javascript: //'>" + value + "</a>";
		    
		} else if (column.type == 'button') {
		    if (typeof value == 'undefined' || value == true) {
			    content = "<input type='button' value='" + column.text + "'/>";
		    }
        } else if (column.type == 'image') {
            if (typeof value == 'undefined' || value == true) {
                content = "<img alt='" + column.text + "' title='" + column.text + "' src='" + column.imageName + "' hspace='1' border='0'/>";
                if (this.isActiveColumn(column)) {
                    content = "<a href='javascript: //'>" + content + "</a>";
                }
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
		}
        
        cellElement.innerHTML = content;
        if(column.type.match(/button|link|checkbox|radiobutton/i)){
        	YAHOO.util.Event.addListener(cellElement, "keypress", function(e) {
        		if(e.which == 13){
        			e.target.click();
        		}
        		else if(e.keyCode == 13){
        			e.srcElement.click();
        		}
        	});
        }
				       
        // register default column event handler
        if (column.defaultActionHandler != null) {
            var fn = column.defaultActionHandler;
            if (!fn.call) {
                fn = window[fn];
            }
            var contentElement = cellElement.childNodes[0];
            YAHOO.util.Event.addListener(contentElement, "click", fn, row, true);
        }
	},

	/**
	 * Checks whether specified column has active commands or JS event handlers.
	 */
	isActiveColumn: function(column) {
	    return (column.defaultActionHandler != null || 
	            (column.commands != null && column.commands.length > 0));
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

	createInputImage: function(src, alt, hspace, width, height) {
        var input = document.createElement('input');
        input.type = 'image';
        input.src = src;
        input.alt = alt;
        input.title = alt;
        input.border = 0;
        input.hspace = hspace;
        if (valueExists(width)) {
            input.width = width;
        }
        if (valueExists(height)) {
            input.height = height;
        }
        return input;    
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