var leaseAdminBldgInfoController = View.createController('leaseAdminBldgInfo',{
	bl_id:null,
	initView: function(){
		this.reportLeaseAdminBldgGeneralInfo.refresh({'bl.bl_id':this.bl_id}, false);
		if(this.reportLeaseAdminBldgGeneralInfo.getFieldValue('bl.bldg_photo')!=''){
			this.reportLeaseAdminBldgGeneralInfo.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.reportLeaseAdminBldgGeneralInfo.fields.get(this.reportLeaseAdminBldgGeneralInfo.fields.indexOfKey('image_field')).dom.src = null;
			this.reportLeaseAdminBldgGeneralInfo.fields.get(this.reportLeaseAdminBldgGeneralInfo.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
		translateFieldValue(this.reportLeaseAdminBldgGeneralInfo, 'bl.status', 'status', false, false);
	}
})

function translateFieldValue(panel, field, message, onRows, withStyle){
	if(!onRows){
		panel.setFieldValue(field, getMessage(message+'_'+panel.getFieldValue(field)));
	}else if(onRows){
		for(var i=0;i< panel.gridRows.length;i++){
			var row = panel.gridRows.get(i);
			if(withStyle){
				setStyle(row.cells.items[row.cells.indexOfKey(field)], row.getFieldValue(field));
			}
			row.setFieldValue(field, getMessage(message+'_'+row.getFieldValue(field)));
		}
	}
}

function setStyle(cell, value){
	switch(value){
		case 'pipeline_landlord':{
			cell.dom.style.backgroundColor = '#FFFF00';
			break;
		}
		case 'pipeline_tenant':{
			cell.dom.style.backgroundColor = '#FF0000';
			break;
		}
		case 'landlord':{
			cell.dom.style.backgroundColor = '#00FF7F';
			break;
		}
		case 'tenant':{
			cell.dom.style.backgroundColor = '#ADD8E6';
			break;
		}
	}
}
