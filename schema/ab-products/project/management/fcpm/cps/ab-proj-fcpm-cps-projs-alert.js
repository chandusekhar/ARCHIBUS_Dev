var projFcpmCpsProjsAlertController = View.createController('projFcpmCpsProjsAlert', {
	alertMessages : new Array('chgPendApprv', 'invPendApprv'),
	
	afterViewLoad: function(){	
		for (var i = 0; i < this.alertMessages.length; i++) {
			var alertMessage = this.alertMessages[i];
			this.projFcpmCpsProjsAlert_ds.addParameter(alertMessage, getMessage(alertMessage));
			this.projFcpmCpsProjsAlert_ds.addParameter(alertMessage + "1", getMessage(alertMessage + "1"));
		}
    }
});

