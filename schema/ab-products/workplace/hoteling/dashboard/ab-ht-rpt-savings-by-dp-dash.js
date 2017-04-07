var htSavingByDpController = View.createController(' htSavingByDpController', {

    afterViewLoad: function(){
		var dvId = View.user.employee.organization.divisionId;
		var dpId = View.user.employee.organization.departmentId;

        this.htSavingSeatByDpChart.addParameter('dvId', "='" + dvId+"'")
		this.htSavingSeatByDpChart.addParameter('dpId', "='" + dpId+"'");

		 this.htSavingSeatByDpChart.refresh();
		 this.htSavingSeatByDpChart.show(true);
    }
})