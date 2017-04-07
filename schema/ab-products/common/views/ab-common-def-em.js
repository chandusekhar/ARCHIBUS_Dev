var abCommonDefEmCtrl =  View.createController('abCommonDefEmCtrl', {    
    detailsPanel_onSave: function(){
		//get all license
		AdminService.getProgramLicense({
			callback: function(license) {
				var licenseIds = [];
				var licenses = license.licenses;
				var hasSpaceLicense = false;
				
				//check AbBldgOpsHelpDesk license
				for(i in licenses){
					licenseIds.push(licenses[i].id);
					if(licenses[i].enabled && licenses[i].id == 'AbSpaceRoomInventoryBAR'){
						hasSpaceLicense = true;
						break;
					}
				}
				
				if (hasSpaceLicense){
					abCommonDefEmCtrl.detectIfExistsFutureInDefineEm();
				}
				else {
					abCommonDefEmCtrl.detailsPanel.save();
					abCommonDefEmCtrl.treePanel.refresh();
				}
			},				
			errorHandler: function(m, e) {
				View.showException(e);
			}
		});
	},

    detectIfExistsFutureInDefineEm: function(){
		var detailsPanel = this.detailsPanel;
		var grid = this.treePanel;
		var em_id = detailsPanel.getFieldValue('em.em_id');
		
		//3037265 ,Define Employee: Alert message is missing when change employee's location when there is future move request
		var bl_id = detailsPanel.getFieldValue('em.bl_id');
		var fl_id = detailsPanel.getFieldValue('em.fl_id');
		var rm_id = detailsPanel.getFieldValue('em.rm_id');
		
		var old_bl_id = detailsPanel.getOldFieldValues()[("em.bl_id")];
		var old_fl_id = detailsPanel.getOldFieldValues()[("em.fl_id")];
		var old_rm_id = detailsPanel.getOldFieldValues()[("em.rm_id")];

		if ( bl_id!=old_bl_id || fl_id!=old_fl_id || rm_id!=old_rm_id) {
			try {
				var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-detectIfExistsFutureInDefineEm', em_id, old_bl_id ,old_fl_id, old_rm_id);
				if ( result!=null && result.message!="" ) {
					View.confirm( getMessage("existFuture"), function(button){
						if (button == 'yes') {
							detailsPanel.save();
							grid.refresh();
						}
					});
				}
				else{
					detailsPanel.save();
					grid.refresh();
				}
			}catch(e){
				Workflow.handleError(e); 
			}
		} else {
			detailsPanel.save();
			grid.refresh();
		}
	}
});