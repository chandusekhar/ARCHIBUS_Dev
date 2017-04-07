var pp_popup_controller = View.createController('pp_popup_controller', {
  saveData: function()
  {
    var currUser = "";
	try { currUser = this.view.user.employee.id; } catch(e) {} ;
	this.ppPanel.setFieldValue("uc_pir.approver_rom",currUser);
	this.ppPanel.setFieldValue("uc_pir.status","PP");
   },
   
   refreshOpView: function()
   {
    var openerView = this.view.getOpenerView();
    openerView.panels.get("projectViewGrid").refresh();
	openerView.panels.get("projectInitiationViewSummaryForm").refresh();
   }
});
