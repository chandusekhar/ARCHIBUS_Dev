/**
* Added for 22.1 :  Compliance and Building Operations Integration: Work History tab  - check license 
* @author Zhang Yi
*/ 

/**
 * Check license for activity. 
 */
function checkLicense( activityIds, console, isOnlyPm, ctrl){
	AdminService.getProgramLicense({
		callback: function(license) {
			var licenses = license.licenses;
			//check  license for each activity 
			for (var j=0; j<activityIds.length; j++ )	{
				var licensed = false;
				for(i in licenses){
					if ( licenses[i].id == activityIds[j] && licenses[i].enabled ) {
						licensed = true;
						break;
					}
				}
				// if any activity is not licensed then return false
				if (!licensed) {
					setInstruction(console, isOnlyPm);
					if (ctrl && ctrl.afterCheckLicense) {
						ctrl.afterCheckLicense(false);
					}
					return;
				}
			}
			// all activity is  licensed then return true
			if (ctrl && ctrl.afterCheckLicense) {
				ctrl.afterCheckLicense(true);
			}
		},				
		errorHandler: function(m, e) {
			View.showException(e);
		}
	});
}

/**
 * Check license for activity. 
 */
function setInstruction( console, isOnlyPm){
	console.setInstructions( isOnlyPm? getMessage('noPmLicense') : getMessage('noOdAndPmLicense'));
}