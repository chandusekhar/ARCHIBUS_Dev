
View.createController('viewPropertyAbstracts', {

    /**
     * Ext element for the property photo.
     */
    propertyPhoto: null,
    
    /**
     * Ext element for the property map.
     */
    propertyMap: null,
    
	/**
	 * Initializes the view.
	 */
    afterViewLoad: function(){
        this.propertyPhoto = Ext.get('property_photo');
        this.propertyMap = Ext.get('property_map');
        
        this.propertyPhoto.setVisible(false);
        this.propertyMap.setVisible(false);
		
		this.propertyPhoto.addListener('click', this.onClickImage);
        this.propertyMap.addListener('click', this.onClickImage);
    },
	
    /**
     * Event handler for the Select row button in the properties grid.
     * @param {Object} row
     */
    propertiesGrid_onSelectProperty: function(row){
        var restriction = row.getRecord().toRestriction();
        
        this.propertyDetailsReport.refresh(restriction);
        
        var record = this.property.getRecord(restriction);
		
		var propertyId = record.getValue('property.pr_id');
        var propertyName = record.getValue('property.name');
		this.propertyPhotos.setTitle(propertyName + ' -- ' + propertyId);
        
        var propertyImageFile = record.getValue('property.image_file');
        if (valueExistsNotEmpty(propertyImageFile)) {
            this.propertyPhoto.setVisible(true);
            this.propertyPhoto.dom.src = View.project.projectGraphicsFolder + '/' + propertyImageFile;
        }
        else {
            this.propertyPhoto.setVisible(false);
            this.propertyPhoto.dom.src = '';
        }
        
        var propertyImageMap = record.getValue('property.image_map');
        if (valueExistsNotEmpty(propertyImageMap)) {
            this.propertyMap.setVisible(true);
            this.propertyMap.dom.src = View.project.projectGraphicsFolder + '/' + propertyImageMap;
        }
        else {
            this.propertyMap.setVisible(false);
            this.propertyMap.dom.src = '';
        }
    },
	
	/**
	 * Event handler for property photo and map image click.
	 */
	onClickImage: function() {
		View.openDialog(this.dom.src);
	}
});
