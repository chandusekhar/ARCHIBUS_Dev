/**

* @author lei

*/
var updateSelectionsController = View.createController('updateSelectionsController',
{	
    gridPanel: null,
    
    /**
     * Update we select compliance location which in opener view  with we filled value .
     */
    regLocPopupForm_onUpdate:function(){
		
		var keys = this.gridPanel.getPrimaryKeysForSelectedRows();
    	
	
		var resp_person=this.regLocPopupForm.getFieldValue('regloc.resp_person');
		var vn_id=this.regLocPopupForm.getFieldValue('regloc.vn_id');
		var comp_level=this.regLocPopupForm.getFieldValue('regloc.comp_level');
		var event_offset=this.regLocPopupForm.getFieldValue('regloc.event_offset');
		
		var arr=new Array();
		for(var j=0;j<keys.length;j++){
			arr.push(keys[j]['regloc.location_id']);
		}
		var restriction = new Ab.view.Restriction();
			restriction.addClause('regloc.location_id' ,arr,'in');
		var records=this.dsRegLocPopup.getRecords(restriction);
		for(var i=0;i<records.length;i++){
			var record=records[i];
			record.isNew=false;
			record.setValue("regloc.resp_person", resp_person);
			record.setValue("regloc.vn_id", vn_id);
			record.setValue("regloc.comp_level", comp_level);
			record.setValue("regloc.event_offset", event_offset);
		}
		View.dataSources.get("dsRegLocPopup").saveRecords(records);
		
		this.gridPanel.refresh();
		this.regLocPopupForm.closeWindow();
		View.alert(getMessage('updatesuccess'));
    }
});

/**
 * update we select records
 */
function updateCompLocSelections(grid){
        
    if (!grid) {
        return;
    }
    var keys = grid.getPrimaryKeysForSelectedRows();
        
    if(keys.length==0){
            View.alert(getMessage('selectLocation'));
            return;
        }
    updateSelectionsController.gridPanel = grid; 
    updateSelectionsController.regLocPopupForm.show(true);
    updateSelectionsController.regLocPopupForm.refresh('1=2');
    updateSelectionsController.regLocPopupForm.showInWindow({
        width: 750,
        height: 380,
        closeButton: true
    });
}
