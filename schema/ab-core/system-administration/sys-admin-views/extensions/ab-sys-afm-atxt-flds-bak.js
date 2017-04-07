var abSysAfmaTxtFldsCtrl = View.createController('abSysAfmaTxtFldsCtrl',{
	
	abSysAfmAtxtFlds_detailsAssetFlds_onUp: function(row){
		var index = row.getIndex();
		if(index == 0){
			return;
		}
		moveRow(this.abSysAfmAtxtFlds_detailsAssetFlds, index, index - 1, 'afm_flds.is_atxt');
	},
	
	abSysAfmAtxtFlds_detailsAssetFlds_onDown: function(row){
		var index = row.getIndex();
		if(index == this.abSysAfmAtxtFlds_detailsAssetFlds.rows.length -1){
			return;
		}
		moveRow(this.abSysAfmAtxtFlds_detailsAssetFlds, index, index + 1, 'afm_flds.is_atxt');
	},

	abSysAfmAtxtFlds_detailsAssetFlds_onRemove: function(row){
		alert('on Remove');
	},
	
	abSysAfmAtxtFlds_detailsAssetFlds_onSave: function(){
		alert('on Save');
	},
	
	abSysAfmAtxtFlds_detailsAvailFlds_onAdd: function(){
		alert('on Add');
	}
})

function moveRow(panel, indexOld, indexNew, field){
	panel.moveGridRow(indexOld, indexNew);
	panel.update();

//	var row = panel.gridRows.get(indexOld);
//	row.setFieldValue(field, indexOld+1);
//	row.getRecord().setValue(field, indexOld+1);
//
//	var row = panel.gridRows.get(indexNew);
//	row.setFieldValue(field, indexNew+1);
//	row.getRecord().setValue(field, indexNew+1);
	
	
}
