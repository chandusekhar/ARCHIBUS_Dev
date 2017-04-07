var mobileMenuManageController = View.createController('mobileMenuManageController', {
	
	mobileMenuForm_onCancelEditMobileMenu: function() {
		this.mobileMenuForm.show(false);
	},
	
	handleMenuSelection: function() {
		var selectedRow = this.mobileMenu_grid.rows[this.mobileMenu_grid.selectedRowIndex];
		var menuId = selectedRow['afm_mobile_menu.menu_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_mobile_menu.menu_id', menuId, '=');
		this.mobileMenuForm.refresh(restriction);
	}
});