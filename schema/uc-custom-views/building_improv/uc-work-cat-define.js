var ucWorkCatDefineController = View.createController('ucWorkCatDefineCntrl', {

afterViewLoad: function() {
	View.setToolbarButtonVisible('printButton', false); 
	View.setToolbarButtonVisible('emailButton', false); 
	View.setToolbarButtonVisible('alterButton', false); 
	View.setToolbarButtonVisible('favoritesButton', false);
},

workCatDefine_eastPanel_afterRefresh: function() {
	if (this.workCatDefine_eastPanel.newRecord == false) {
		this.workCatDefine_eastPanel.enableField('uc_bl_workcat.category', false);
	} else {
		this.workCatDefine_eastPanel.enableField('uc_bl_workcat.category', true);
	}
}

});

 function refreshWestPanel() {
	View.panels.get("workCatDefine_westPanel").refresh();
} 
