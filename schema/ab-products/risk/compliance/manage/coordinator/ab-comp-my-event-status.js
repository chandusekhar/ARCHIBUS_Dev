/**
* @inherit from ab-comp-event-common.js 
* Update and Close events (assigned to logged in user),
* Siniliar to "Update Status and Close Events". 
* @author Zhang Yi
*/
var updateMyEventController = commonEventController.extend({
	
	//sign indicates current view is for 'My' 
	 isMyEvent: true,
	 
	/**
	* @inherit 
	*/
	 afterViewLoad: function(){
		//set proper  variable indicate that current view is for "Update and Close events"
		this.compTabs.eventType= "Status-Close";
		//bind event 
		this.compTabs.addEventListener('afterTabChange', afterTabChange);
	}
});