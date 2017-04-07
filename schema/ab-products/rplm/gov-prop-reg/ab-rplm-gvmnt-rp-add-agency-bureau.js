var addAgencyBureauController = View.createController('addAgencyBureau',{
	gridAgencyBureau_grpAgencyId_onClick:function(row){
		this.showDetails(row);
	},
	gridAgencyBureau_onNew:function(){
		this.showDetails(null);
	},
	showDetails:function(row){
		if(row != null){
			this.formAgencyBureau.refresh({'grp_agency.grp_agency_id':row.getFieldValue('grp_agency.grp_agency_id')},false);
		}else{
			this.formAgencyBureau.refresh({},true);
		}
	}	
})

function refreshGrid(){
	addAgencyBureauController.gridAgencyBureau.refresh();
	hideForm();
}

function hideForm(){
	addAgencyBureauController.formAgencyBureau.show(false, true);
}
