var leaseAdminPropertyInfoController = View.createController('leaseAdminPropertyInfo',{
	pr_id:null,
	initView: function(){
		this.reportLeaseAdminPropertyGeneralInfo.refresh({'property.pr_id':this.pr_id}, false);
		if(this.reportLeaseAdminPropertyGeneralInfo.getFieldValue('property.prop_photo')!=''){
			this.reportLeaseAdminPropertyGeneralInfo.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.reportLeaseAdminPropertyGeneralInfo.fields.get(this.reportLeaseAdminPropertyGeneralInfo.fields.indexOfKey('image_field')).dom.src = null;
			this.reportLeaseAdminPropertyGeneralInfo.fields.get(this.reportLeaseAdminPropertyGeneralInfo.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
		translateFieldValue(this.reportLeaseAdminPropertyGeneralInfo, 'property.status', 'status', false, false);
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
