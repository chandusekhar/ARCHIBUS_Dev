/**
 * Set the footer HTML and then reloads the grid
 * note, reload doesn't refetch data from the server
 *
 */

function setFooterToDate(grid) {
	var now = new Date();
	grid.setFooter(getMessage('footerString') + ': ' + now);
	grid.reloadGrid();
}
