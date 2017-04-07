var reservationDetailsController = View.createController("reservationDetailsController", {
	blId: null,
    flId: null,
    rmId: null,
	dwgname:null,
	
	afterInitialDataFetch: function() {
		if (this.drawingPanel != undefined) {
			this.drawingPanel.appendInstruction("default", "", "");
	        this.drawingPanel.addEventListener('ondwgload', this.onDwgLoaded);
		}
        
        var reservationId = this.detailsPanel.getFieldValue("reserve.res_id");
		try {
			var result = Workflow.callMethod('AbWorkplaceReservations-roomReservationService-getAttendeesResponseStatus', 
					parseInt(reservationId));
			if (result.code = 'executed') {
				var responses = result.data;
				for (var i = 0; i < responses.length; ++i) {
					// add a row
				 	var record = new Ab.data.Record(
						{
							'name' : responses[i]['name'],
							'email' : responses[i]['email'],
							'response' : getMessage(responses[i]['response'])
						}, true);
				 	var newRow = this.attendeesPanel.recordToRow(record)
				 	this.attendeesPanel.addRow(newRow);	 
				 	this.attendeesPanel.hasNoRecords = false;
				}
				this.attendeesPanel.build();
			}
		} catch (e) {
			Workflow.handleError(e);
		}
        
		if (this.roomPanel != undefined) {
			this.roomPanel_afterRefresh();
		}
	},  
    
    onDwgLoaded: function() {
    	var dwgCtrl = View.panels.get('drawingPanel');
		dwgCtrl.setTitle(reservationDetailsController.blId+ '-' 
				+ reservationDetailsController.flId + '-' + reservationDetailsController.rmId);
    },
    
    roomPanel_afterRefresh: function() {	
        this.blId = this.roomPanel.getFieldValue('reserve_rm.bl_id');
        this.flId = this.roomPanel.getFieldValue('reserve_rm.fl_id');
        this.rmId = this.roomPanel.getFieldValue('reserve_rm.rm_id');
		this.dwgname = this.roomPanel.getFieldValue('rm.dwgname'); 
		
		var dcl = new Ab.drawing.DwgCtrlLoc(this.blId, this.flId, this.rmId, this.dwgname);
        this.drawingPanel.findAsset(dcl,null,true);
    }
 
});