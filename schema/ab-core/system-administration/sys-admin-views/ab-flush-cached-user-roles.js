var flushCachedUserRolesController = View.createController('flushCachedUserRoles', {

	flushCachedUserRoles_onFlushCachedUserRoles : function(panel, action) {
		var controller = this;
		View.confirm(getMessage('confirmFlush'), function(button) {
			if (button === 'yes') {
				AdminService.flushCachedUserRoles({
					callback : function(result) {
						var logoutView = View.getUrlForPath(View.logoutView);
						window.top.location.href = logoutView;
					},
					errorHandler : function(m, e) {
						View.showException(e);
					}
				});
			}
		});
	},
});
