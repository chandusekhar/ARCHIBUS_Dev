/**
 * Controller for Set Room Capcity by Selected Room Type.
 */
var spaceExpressSetTypeCapcity = View.createController('spaceExpressSetTypeCapcity', {

    /**
     * Initially enable the tree nodes mutltiple-selected.
     */
    afterViewLoad: function() {
		this.categoriesTree.setMultipleSelectionEnabled(0);
		this.categoriesTree.setMultipleSelectionEnabled(1);
},

    /**
     * Call Workflow rules to set room's capcity by Room Categories and Types.
     */
    categoriesTree_onSetCap: function() {
		//prepare parameters for WFR
		var catNodes = this.categoriesTree.getSelectedNodes(0);
		var catList = this.prepareStringListFromNodes(catNodes, 'rmcat.rm_cat');
		var typeNodes = this.categoriesTree.getSelectedNodes(1);
		var typeList = this.prepareStringListFromNodes(typeNodes, 'rmtype.rm_cat','rmtype.rm_type');

		if( catList.length>0 || typeList.length>0 ) {
			try {
				Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-updateRoomCapacityByCategory", catList, typeList);
				View.showMessage( getMessage('completed'));
			 } catch (e) {
				 Workflow.handleError(e); 
			 }
		} else {
			View.showMessage( getMessage('noneSelect') );
		}
    },

    /**
     * Construct list of string values from nodes.
     */
    prepareStringListFromNodes: function(nodes, pkId1, pkId2) {
		var items = new Array();
		for(var i = 0; i < nodes.length; i++ ) {
			var node = nodes[i];
			if (pkId2) {
				if ( valueExistsNotEmpty(node.data[pkId1]) && valueExistsNotEmpty(node.data[pkId2]) ) {
					var values = {};
					values['cat'] = "'"+ node.data[pkId1]+"'"; 
					values['type'] = "'"+ node.data[pkId2]+"'";
					items.push(values);
				}
			}	 
			else {
				if( valueExistsNotEmpty(node.data[pkId1]) ) {
					var value = "'"+ node.data[pkId1]+"'";
					items.push(value);
				}			   
			}
		}
		return items;
	}
});