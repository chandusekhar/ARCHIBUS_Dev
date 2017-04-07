/**
*
* Added for 20.1 Compliance : Manage Compliance Notifications view
*
* @author Zhang Yi
*/
var manageNotificationController = View.createController('manageNotificationController',
{

	//restriction of console
	consoleRes: " 1=1 ", 

	//variables indicates current view is manage view or report view
	mode: 'manage', 

	afterInitialDataFetch:function(){
	},

	/**
	 * Events Handler for 'Show' action on console 
	 */
	onFilter: function(consoleRes){
		//store console's restriction
		this.consoleRes = consoleRes;

		//apply console restriction on grid
		this.abCompNotificationGrid.refresh(consoleRes);
    }
});

