var abRepmMapBlAbstractCtrl = View.createController('abRepmMapBlAbstractCtrl', {
	blId: 'HQ',
	
	afterInitialDataFetch: function(){
		this.refreshView();
	},
	
	refreshView: function(blId){
		if(valueExistsNotEmpty(blId)){
			this.blId = blId;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', this.blId, '=');
		this.abRplmMapBlAbstract.refresh(restriction);
	},
	
	abRplmMapBlAbstract_afterRefresh: function(){
		var form = this.abRplmMapBlAbstract;
		var tBodyObject = this.getTBody(form);
		var rowsNo = tBodyObject.children.length;
		var photoIndex = 0;
		var photoRow = tBodyObject.children[photoIndex];
		// photo
		var photoField = 'bldg_photo';
		var imageField = 'image_file';
		var photoCell = document.createElement('td');
		photoCell.rowSpan = 13;
		photoCell.innerHTML = '<img id="img_'+photoField+'" style="width: 300px;" src="">';
		
		photoRow.appendChild(photoCell);
		
		
        var keys = {};
        keys["bl_id"] = form.getFieldValue("bl.bl_id");
        
        form.disable();
        
        DocumentService.getImage(keys, "bl", photoField, '1', true, {
            callback: function(image) {
                dwr.util.setValue("img_"+photoField, image);
                form.enable();
            },
            errorHandler: function(m, e) {
                Ab.view.View.showException(e);
                form.enable();
            }
        });
        
	},
	
	getTBody: function(formObj){
		var formEl  = formObj.getEl();
		var tableEl = formEl.dom.firstChild;
		return tableEl.firstChild;
	}
});