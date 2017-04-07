var controller = View.createController('floorsOnlyController', {
	locArray: [],
	
	afterViewLoad: function() {	
		View.panels.get('floorsonly_cadPanel').redmarksEnabled = true;
		
		this.floorsonly_cadPanel.appendInstruction("default", "", getMessage('selectDrawing'));
		this.floorsonly_cadPanel.appendInstruction("ondwgload", "", getMessage('createRedlines'));
		
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.floorsonly_floors.addEventListener('onMultipleSelectionChange', function(row) {
    		var opts = null;
    		this.controller.locArray[0] = row['rm.bl_id'];
    		this.controller.locArray[1] = row['rm.fl_id'];
    		
			View.panels.get('floorsonly_cadPanel').addDrawing(row, opts);
	    });
	},
	
	/**
	 * save redmarks as Service request
	 */
	floorsonly_cadPanel_onSaveRedmarks: function(){
		var result = this.floorsonly_cadPanel.saveRedmarksAsServiceRequest("ab-floorsonly-drawing-redlines.axvw");
		
		if(valueExistsNotEmpty(result.redlinesId) && valueExistsNotEmpty(result.redlinesImagePath)){
			var redlinesId = result.redlinesId;
			var redlinesImagePath = result.redlinesImagePath;
			
			var restriction = new Ab.view.Restriction();
			var selectedRow = this.floorsonly_floors.getSelectedRows()[0];
			restriction.addClause('activity_log.bl_id',this.locArray[0]);
			restriction.addClause('activity_log.fl_id',this.locArray[1]);
			//restriction.addClause('activity_log.bl_id',selectedRow['rm.bl_id']);
			//restriction.addClause('activity_log.fl_id',selectedRow['rm.fl_id']);
			
			//open dialog with create request view
			View.openDialog("ab-helpdesk-request-create.axvw",restriction,true,{
				//callback function, called after saving basic request information, to attach redlines to service request
		        callback: function(activityLogId) {
					try{
						var result = Workflow.callMethod('AbCommonResources-DrawingService-attachRedlinesToServiceRequest',activityLogId,redlinesId,redlinesImagePath);
					} catch(e){
						Workflow.handleError(e);							
					}	
		        },redlining:true
			});
		}
	}
});






