// *****************************************************************************
// on save, refresh the assignment list
// *****************************************************************************
function saveAssignEmployee()
{
	// refresh Grid (done here so we can pass in the restriction)
	View.getControl('', 'assign_grid').refresh();
}
