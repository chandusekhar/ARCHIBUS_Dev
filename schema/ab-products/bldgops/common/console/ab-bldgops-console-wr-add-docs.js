View.createController('addNewDocuments', {
	
	afterInitialDataFetch: function(){
		var closeXbuttons = jQuery(window.parent.document).find('.x-tool-close');
		jQuery(closeXbuttons[closeXbuttons.length-1]).hide();
	},

	addDocsForm_onCloseDocPanel : function() {
		var openView = View.getOpenerView();
		if (openView.needReloadAfterAddDocuments) {
			View.getOpenerWindow().location.reload(false);
		} else {
			openView.closeThisDialog();
		}
	}

});
