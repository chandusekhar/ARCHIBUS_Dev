
View.createController('exFormLookupFields', {

	lookupFilter_onLookupFilterShowRestriction: function() {
		this.showRestriction(this.lookupFilter);
	},
	
	lookupPanel_onLookupShowRestriction: function() {
		this.showRestriction(this.lookupPanel);
	},
	
	noLookupPanel_onNoLookupShowRestriction: function() {
		this.showRestriction(this.noLookupPanel);
	},
	
	namePanel_onNameShowRestriction: function() {
		this.showRestriction(this.namePanel);
	},
	
	showRestriction(panel) {
	    var restriction = panel.getFieldRestriction();
	    View.alert(restriction.toJSON());
	}
});