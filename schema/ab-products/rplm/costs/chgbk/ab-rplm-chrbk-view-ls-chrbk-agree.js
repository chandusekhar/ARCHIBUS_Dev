var ls_id = null;
function showLsDetails(row){
	ls_id = row['ls.ls_id'];
	View.panels.get('gridChgbkAgrements').refresh({'ls_chrgbck_agree.ls_id':ls_id});
}

function refreshAgreements(){
	if(ls_id != null){
		View.panels.get('gridChgbkAgrements').refresh({'ls_chrgbck_agree.ls_id':ls_id});
	}
}

function refreshLeases(){
	View.panels.get('gridLease').refresh();
}
