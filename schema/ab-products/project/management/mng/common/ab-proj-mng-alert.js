var projMngAlertController = View.createController('projMngAlert', {
	alertMessages : new Array('assignedAct', 'workpkgsOutBid', 'contrPendSig', 'chgPendApprv', 'actsBehSched', 'actsOnHold', 'openInv', 'highLog', 'urgLog'),
	
	afterViewLoad: function(){	
		for (var i = 0; i < this.alertMessages.length; i++) {
			var alertMessage = this.alertMessages[i];
			this.projMngAlert_ds.addParameter(alertMessage, getMessage(alertMessage));
			this.projMngAlert_ds.addParameter(alertMessage + "1", getMessage(alertMessage + "1"));
		}
    }
});

