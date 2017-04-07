/*
 * controller definition  
 */
var abEqxpolicyController = View.createController('abEqxpolicyController', {
	afterInitialDataFetch: function(){
		var updateTitle = true;
		if(valueExists(this.view.parameters) 
				&& valueExistsNotEmpty(this.view.parameters.updateTitle)){
			updateTitle = this.view.parameters.updateTitle;
		}
		if(updateTitle){
			var title = View.taskInfo.taskId;
			if(View.title != title){
				View.setTitle(title);
			}
		}
	}
});
