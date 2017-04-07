var treeController = View.createController('treeController', {
	/**
	 * EventHandler save a function from other file which used for running other function when we click floor.
	 */
	eventHandler:null,
	
	/**
	 * Register eventHandler  by other view function call
	 */
	register:function(registerFunction){
		this.eventHandler=registerFunction;
	},
	
	/**
	 * Running when we click floor .
	 */
	onTreeFlClick:function(){
		this.eventHandler();
	}
	
})

