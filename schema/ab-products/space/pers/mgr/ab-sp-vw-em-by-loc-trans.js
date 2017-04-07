/**
 * @Guo Jiangtao
 */
var controller = View.createController('abSpVwEmByLocTrans_controller', {

	/**
	 * after refresh event hander for panel abSpVwEmByLocTrans_flGrid
	 */
	abSpVwEmByLocTrans_flGrid_afterRefresh : function() {
		var flPanel = this.abSpVwEmByLocTrans_flGrid;
		if (flPanel.restriction != null) {
			flPanel.setTitle(getMessage('setTitleForFloor') + ' ' + flPanel.restriction['bl.bl_id']);
		} else
			flPanel.setTitle(getMessage('setTitleForFloor'));
		this.abSpVwEmByLocTrans_rmGrid.clear();
		this.abSpVwEmByLocTrans_emGrid.clear();
	},

	/**
	 * after refresh event hander for panel abSpVwEmByLocTrans_rmGrid
	 */
	abSpVwEmByLocTrans_rmGrid_afterRefresh : function() {
		var rmPanel = this.abSpVwEmByLocTrans_rmGrid;
		if (rmPanel.restriction != null) {
			rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + rmPanel.restriction['fl.bl_id'] + "-" + rmPanel.restriction['fl.fl_id']);
		} else
			rmPanel.setTitle(getMessage('setTitleForRm'));
		this.abSpVwEmByLocTrans_emGrid.clear();
	},

	/**
	 * after refresh event hander for panel abSpVwEmByLocTrans_emGrid
	 */
	abSpVwEmByLocTrans_emGrid_afterRefresh : function() {
		var emPanel = this.abSpVwEmByLocTrans_emGrid;
		var clauses = emPanel.restriction.clauses;
		emPanel.setTitle(getMessage('setTitleForEm') + ' ' + clauses[0].value + "-" + clauses[1].value + "-" + clauses[2].value);
	}
});

/**
 * click event hander for row link in grid abSpVwEmByLocTrans_rmGrid
 */
function showEmGrid() {
	var grid = controller.abSpVwEmByLocTrans_rmGrid;
	var row = grid.rows[grid.selectedRowIndex];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('rmpct.bl_id', row['rm.bl_id'], '=');
	restriction.addClause('rmpct.fl_id', row['rm.fl_id'], '=');
	restriction.addClause('rmpct.rm_id', row['rm.rm_id'], '=');
	controller.abSpVwEmByLocTrans_emGrid.refresh(restriction);
}
