/**
 * Keven.xi
 * 02/03/2010
 */

/**
 * called when user click the Refresh button
 * Refresh the Building and Floor Tree panel
 */
function onRefreshBlTree(){
	View.panels.get('abEmEmergencyInfoxfl_tree_bl').refresh();
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){

    var currentNode = View.panels.get('abEmEmergencyInfoxfl_tree_bl').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.bl_id", blId, "=");
    restriction.addClause("em.fl_id", flId, "=");
    var detailPanel = View.panels.get('abEmEmergencyInfoxfl_grid_em');
    detailPanel.refresh(restriction);
}
