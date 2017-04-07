// *****************************************************************************
// on save, refresh the assignment list
// *****************************************************************************
function refreshGrid()
{
	// refresh Grid (done here so we can pass in the restriction)
	View.getControl('', 'vmrs_grid').refresh();
}
