var projMngDashTeamEditController = View.createController('projMngDashTeamEdit', {

	afterInitialDataFetch: function(){
    	showEmPhoto();
	}
});

function showEmPhoto(){
    var detailsPanel = View.panels.get('projMngDashTeamEditForm');
    var imageFile = detailsPanel.getFieldValue('projteam.image_file').toLowerCase();
    
    if (imageFile != '') {
        detailsPanel.showImageFile('image_field', View.project.projectGraphicsFolder + "/" + imageFile);
    }
    else {
        //detailsPanel.showImageFile('image_field', getMessage("noimage"));
    }
}
