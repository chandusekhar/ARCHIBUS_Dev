Ext.define( 'Solutions.view.PhotoPanel', {
	extend : 'Common.view.navigation.EditBase',

	xtype : 'demoPhotoPanel',

	config : {
		imageData : null,

		styleHtmlContent : true,

		isCreateView : true,
		
		model : 'Solutions.model.Document',
		storeId : 'selectorExampleStore',
		
		scrollable : {
			direction : 'vertical',
			directionLock : true
		},

        items: [
            {
                itemId: 'imageContainer',
                xtype: 'container',
                html: ''
            }
        ]
	},

    applyRecord: function(record){
        if(record){
            this.setImageHtml(record.get('doc_contents'));
        }

        return record;
    },

	setImageHtml : function(imageData) {
		var imageContainer = this.query('#imageContainer')[0];
		imageContainer
				.setHtml('<div style="width:380px;margin-left:auto;margin-right:auto;"><img style="margin:auto;display:block" width=220" height="220" src="data:image/jpg;base64,'
						+ imageData + '"/></div>');
	}

});