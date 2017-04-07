//
// Handler for buttons in the grid
//

function onEmpSelected(row) {
	// Call the drawing control to highlight the selected room
	// Passing the following 2 arguments:
	//		row: The row from the grid that contains required data to drive this
	//		true: When the grid multipleSelectionEnabled is not set to true,
	//			  the row does not know if it was selected or not, so explicitly do so
	View.getControl('', 'locateEmployeeExclusive_cadPanel').findAsset(row, null, true, null, true);
}


