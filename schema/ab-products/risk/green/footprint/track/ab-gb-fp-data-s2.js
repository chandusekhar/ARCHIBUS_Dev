var abGbFpDataS2Controller = View.createController('abGbFpDataS2Ctrl', {
	//reference to dataConttroller which offers access to 'onDeleteSource' function
	dataController: View.getOpenerView().controllers.get("abGbFpDataCtrl"),

	afterViewLoad: function(){
		this.dataController.addRestrToSubTabs(this.abGbFpDataS2_fpTabs, View.getOpenerView().panels.get('abGbFpData_fpTabs').tabs[2].restriction);
	}
})
