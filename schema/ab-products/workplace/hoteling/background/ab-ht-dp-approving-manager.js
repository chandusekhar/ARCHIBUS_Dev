var controller = View.createController('setDepartmentMangerController', {
 /**
  * Save form 
  */
 dpForm_onSave:function(){
 	var approvingMgr=this.dpForm.getFieldValue("dp.approving_mgr");
	var res=new  Ab.view.Restriction();
	res.addClause("em.em_id",approvingMgr);
	var record=this.emDS.getRecord(res);
	var emId=record.getValue('em.em_id');
	if (approvingMgr != '') {
		if (emId) {
			this.dpForm.save();
		}
		else {
			alert(getMessage("errorMessage"));
		}
	}else{
		this.dpForm.save();
	}
 }
})
/**
 * @param {Object} ob
 */
function onDpTreeClick(ob){
    var currentNode = View.panels.get('dvTree').lastNodeClicked;
    var dvId = currentNode.parent.data['dv.dv_id'];
    var dpId = currentNode.data['dp.dp_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("dp.dv_id", dvId, "=");
    restriction.addClause("dp.dp_id", dpId, "=");
    
    View.panels.get('dpForm').refresh(restriction);
}
function cancelSetManger(){
	 View.panels.get('dpForm').show(false);
	
}
/**
 * Open dialog
 */
function openDialog(){
        View.selectValue('dpForm', getMessage('emCode'), ['dp.approving_mgr'], 'em', ['em.em_id'], ['em.em_id','em.dv_id','em.dp_id','em.em_std'], null, null, null, null, null, 800, 500, null, null, null);
    
}


