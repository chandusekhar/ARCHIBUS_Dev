// Example for customizing the Ab.grid.ReportGrid
// This same code will work with a miniConsole control because the Ab.grid.MiniConsole is derived from the Ab.grid.ReportGrid
//
// Add an additional row at the very top of the grid by overriding a function called by all (re)building processes  - buildPreHeaderRows(parentElement)
// Style a whole row based on the value of one of the columns
// Style a row cell based on the value of one of the cell
// Add an additional row after the grid by overriding a function called by all (re)building processes  - buildPreFooterRows(parentElement)
// 
//

function user_form_onload() {

	// get the grid 
	var grid = Ab.view.View.getControl(window, 'miniconsoleCustomHdrBodyFtr_grid');
	if (grid == null) {
		alert(getMessage("errNotFound"));
		return;
	}


	/**
	 * Redefine the class function buildPreHeaderRows() used for both building & rebuilding a row preceeding the column titles.
	 * In this case only one row is created showing the date & time of the row construction
	 */
	grid.buildPreHeaderRows = function(parentElement) {
		// create new header row 
		var headerRow = document.createElement('tr');
		// create one header cell for the message
		var headerCell = document.createElement('th');
		// cell spans all columns, any styling goes next
		headerCell.colSpan = this.getNumberOfColumns();
		// put the message into the cell
		headerCell.appendChild(document.createTextNode(this.getDataFetchedString()));
		// attach cell to row
		headerRow.appendChild(headerCell);
		// attach row to parentElement ( table's thead )
		parentElement.appendChild(headerRow);
	}



	/**
	 * Supply custom content for header cell in buildPreHeaderRows()
	 * this is an additional (new) function for grid and can be named anything you wish
	 */
	grid.getDataFetchedString = function() {
		var month_names = new Array('January','February','March', 'April','May','June','July','August','September','October','November','December');
		var now = new Date();
		var nowHour = now.getHours();
		var meridian = (nowHour < 12) ? 'AM' : 'PM';
		nowHour = (nowHour < 13) ? nowHour : nowHour - 12;
		var nowYear = now.getYear();
		nowYear = (nowYear < 1000) ? nowYear + 1900 : nowYear;
		return 'Data fetched on ' + month_names[now.getMonth()] + ' ' + now.getDate() + ', ' + nowYear + ' at ' + nowHour + ':' + now.getMinutes() + ':' + now.getSeconds() + ' ' + meridian;
	}



	/**
	 * Redefine the class function afterCreateDataRows(). 
	 * In this case, depending on column and value, reset the style of the row.
	 *
	 */
	grid.afterCreateDataRows = function(parentElement, columns) {
		// get array of dataRow elements
		var dataRows = Ext.query('tr.dataRow', grid.tableBodyElement);
		// iterate over the rows
		for (var i=0, row; row = dataRows[i]; i++) {
			// row children are <td /> elements
			var children = row.childNodes;
			// test column name & value to see if row should be highlighted (here if the floor == '17')
			for (var j = 0; j < grid.columns.length ; j++) {
				if (grid.columns[j].id == 'rm.fl_id' && children[j].innerHTML == '17') {
					row.style.background = (i%2 != 0) ? '#DDDDDD' : '#FFF8DF';
				}
			}
		}
	}


	/**
	 * Redefine the class function afterCreateCellContent(). 
	 * In this case, customize the style of a room area cell depending on its value
	 * 
	 */
	grid.afterCreateCellContent = function(row, column, cellElement) {
	    var value = row[column.id];
		// set cell style depending on cell value, if cell has target id
		if (column.id == 'rm.area' && value != '' && value < 100)	{
			if (value <= 0)	{
				var contentElement = cellElement.childNodes[0];
				contentElement.nodeValue = '(' + contentElement.nodeValue + ')';
				cellElement.style.color = 'Red';
			}
			else {
				cellElement.style.color = 'Blue';
			}
		}
	}



	/**
	 * Add a function used for both building & rebuilding a row following the data rows
	 * In this case only one row is created showing the count of the rooms (actually, of the rows) 
	 * This will preceed the possible 'more records' message footer row 
	 *
	 */
	grid.buildPreFooterRows = function(parentElement) {
		// ID of the column we are aggregating
		var areaColID = 'rm.area';

		// holders for aggregate values
		var rowCount = this.rows.length;
	
		//create summary row
		var rowElement = document.createElement('tr');
		// style the row
		rowElement.className = (rowCount % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
			
		//create cells in summary row
		var cellElement = document.createElement('td');
		cellElement.className = 'text';
        cellElement.appendChild(document.createTextNode('Total Room Count: ' + this.allCount));
        rowElement.appendChild(cellElement);
		//create blanks cells in totals row for second through last columns, except put totals under Area
		var columnCount = this.columns.length;
		for (var c = 1; c < columnCount; c++) {
			cellElement = document.createElement('td');
			cellElement.className = 'text';
		
			cellElement.appendChild(document.createTextNode(''));
			
			rowElement.appendChild(cellElement);
		}
		// attach the row to the parent 
		parentElement.appendChild(rowElement);
	}
}
