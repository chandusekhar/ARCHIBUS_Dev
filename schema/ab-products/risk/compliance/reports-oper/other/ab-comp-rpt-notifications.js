/**
*
* Added for 20.1 Compliance  :   Operational Reports:  Compliance Event Notifications
*
* @author Zhang Yi
*/
var abCompRptNotificationsController = View.createController('abCompRptNotificationsController',
{
	//restriction of console
	consoleRes: " 1=1 ", 

	//variables indicates current view is manage view or report view
	mode: 'report', 

	/**
	 * Events Handler for 'Show' action on console 
	 */
	onFilter: function(consoleRes, subExistsRestriction){
		//store console's restriction
		this.consoleRes = consoleRes;

		this.abCompNotificationGrid.addParameter("existsRes",subExistsRestriction);
		//apply console restriction on grid
		this.abCompNotificationGrid.refresh(consoleRes);
    }
});