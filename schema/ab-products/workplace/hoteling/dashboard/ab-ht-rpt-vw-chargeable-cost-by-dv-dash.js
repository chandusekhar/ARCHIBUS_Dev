var controller = View.createController('hotelCostRptController', {
         
    afterViewLoad: function(){
		var dvId = View.user.employee.organization.divisionId;
		var dpId = View.user.employee.organization.departmentId;
		var title = getMessage("dpPanelTitle").replace("<{0}>", dvId+'-'+dpId);
		setPanelTitle("deptGrid", title);
    }
});