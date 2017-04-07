var addNewPartsDialogController=View.createController('addNewPartsDialogController',{
	/**
	 * Save part information.
	 */
	savePartInfo: function(){
		var partCode=this.addNewPartsDetailPanel.getFieldValue('pt.part_id');
		//Save record to the part table
		var saved=this.addNewPartsDetailPanel.save();
		//Save record to the part store location table,by default saved the part to the main warehouse
		if(saved){
			//Close dialog window and show success message
			var openerView=View.getOpenerView();
			if(valueExists(openerView)){
				openerView.panels.get('abBldgopsAdjustInvForm').setFieldValue('pt.part_id',partCode);
				openerView.panels.get('wrptListPanel').show(false);
				//Refresh WrList
				openerView.closeDialog();
			}
		}
	}

});