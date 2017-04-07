/**
* @inherit from ab-comp-event-common.js 
* Manage events (assigned to logged in user) that have not been started or completed past required date,
* Siniliar to "Manage Missed and Overdue Events". 
* @author Zhang Yi
*/
var myMissedAndOverdueEventController = commonEventController.extend({
	
	//sign indicates current view is for 'My' 
	 isMyEvent: true,
	 
	/**
	* @inherit 
	*/
	 afterViewLoad: function(){
		//set proper  variable indicate that current view is for "Missed and Overdue"
		this.compTabs.eventType= "Missed-Overdue";
		//bind event 
		this.compTabs.addEventListener('afterTabChange', afterTabChange);
	}
});