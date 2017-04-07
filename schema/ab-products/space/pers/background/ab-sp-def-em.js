View.createController('abSpDefEm_Controller', {
    afterInitialDataFetch: function(){
    	
//   this.detailsPanel.fields.get("em.image_file").actions.get(0).command.commands[0].actionListener = showEmPhoto;
    },
    
    detailsPanel_afterRefresh: function(){
//        showEmPhoto();
    }
});

function showEmPhoto(fieldName, newValue, oldValue){
    var detailsPanel = View.panels.get('detailsPanel');
    var imageFile = detailsPanel.getFieldValue('em.image_file').toLowerCase();
    if (newValue) {
        imageFile = newValue;
    }
    
    if (imageFile) {
        detailsPanel.showImageFile('em_photo', View.project.projectGraphicsFolder + "/" + imageFile);
    }
    else {
        detailsPanel.showImageFile('em_photo', getMessage("noimage"));
    }
}
/**
 * for 'move'
 * check if Another request exists involving the same employee for a future assignment. 
 * @param em_id
 * 
 * @returns
 */
function detectIfExistsFutureInDefineEm(){
    var detailsPanel = View.panels.get('detailsPanel');
    var em_id = detailsPanel.getFieldValue('em.em_id');
    
    var bl_id = detailsPanel.getFieldValue('em.bl_id');
    var fl_id = detailsPanel.getFieldValue('em.fl_id');
    var rm_id = detailsPanel.getFieldValue('em.rm_id');
    
    //3037265 ,Define Employee: Alert message is missing when change employee's location when there is future move request
	var oldBl_id = detailsPanel.getOldFieldValues()[("em.bl_id")];
	var oldFl_id = detailsPanel.getOldFieldValues()[("em.fl_id")];
	var oldRm_id = detailsPanel.getOldFieldValues()[("em.rm_id")];
	if(bl_id!=oldBl_id||fl_id!=oldFl_id||rm_id!=oldRm_id){
		try {
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-detectIfExistsFutureInDefineEm', 
					em_id,oldBl_id,oldFl_id,oldRm_id);
			if(result!=null&&result.message!=""){
				
			 var message = getMessage("existFuture");
			        View.confirm(message, function(button){
			            if (button == 'yes') {
			            	detailsPanel.save();
			            }
			        });
				
			}else{
				detailsPanel.save();
			}
		}catch(e){
			Workflow.handleError(e); 
		}
	}else{
		detailsPanel.save();
	}
}