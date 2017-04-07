
/**
 * Called when the user clicks on a cross-table item to drill-down. 
 * @param context The drill-down command execution context, contains the selected row restriction.
 * @return
 */
function crossTableByMonth_onClick(context) {
    if (context.restriction.clauses.length > 0) {
        var month = context.restriction.clauses[0].value;
        var grid = View.panels.get('crossTableByMonth_grid');
        grid.addParameter('month', month);
        grid.refresh();
    }
}