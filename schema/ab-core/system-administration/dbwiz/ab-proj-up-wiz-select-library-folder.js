var selectFolderController = View.createController('selectFolder_ctrl', {

	afterInitialDataFetch:function(){
		readFolders();
	}
});