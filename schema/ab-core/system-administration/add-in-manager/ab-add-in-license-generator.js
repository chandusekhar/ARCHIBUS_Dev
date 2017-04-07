
View.createController('addInLicenseGenerator', {
	
	addInLicenseGeneratorPanel_onWriteAddInLicenseFile: function() {
	    var password = $('addInPassword').value;
	    var customerName = $('addInCustomerName').value;
	    var applicationName = $('addInApplicationName').value;
	    var applicationTitle = $('addInApplicationTitle').value;
	    var concurrentUsers = parseInt($('addInConcurrentUsers').value);
	    var securityKey = $('addInSecurityKey').value;
	    
		AddInManagerService.writeAddInLicenseFile(
				password, 
				customerName,
				applicationName,
				applicationTitle,
				concurrentUsers,
				securityKey, 
		{
	        callback: function(filename) {
	        	View.alert(getMessage('addInLicenseFileSaved') + '<br/>' + filename);
		    },
		    
	        errorHandler: function(m, e) {
	            View.showException(e);
	        }
		});
    }
});