var contactDetailController = View.createController('contactDetailCtrl',{
	afterViewLoad: function() {
		this.repContactsTreeLevel1.createRestrictionForLevel = function(parentNode, level) {
			var restriction = null;
			if (level == 1) {
				var company = parentNode.data['company.company'];
				var cityId = parentNode.data['company.city_id'];
				var countyId = parentNode.data['company.county_id'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('contact.company', company, '=');
				if (valueExists(cityId)) {
					restriction.addClause('contact.city_id', cityId, '=');
				}
				if (valueExists(countyId)) {
					restriction.addClause('contact.county_id', countyId, '=');
				}
			}
			return restriction;
		};
	},
	
	/**
	 * show paginated report
	 */
	repContactsFilterPanel_onPaginatedReport: function(){
		var restriction = this.repContactsFilterPanel.getRecord().toRestriction();
		View.openPaginatedReportDialog('ab-ca-cont-prnt.axvw', {'ds_Contacts_data':restriction});
	},	
	//form after refresh
	contactDetailsPanel_afterRefresh: function(){
		var form = View.panels.get('contactDetailsPanel');
		if(valueExistsNotEmpty(this.contactDetailsPanel.getFieldValue('contact.contact_photo'))) {
			form.showImageDoc('contact_image', 'contact.contact_id', 'contact.contact_photo');
		} else {
			var imageField = form.fields.get('contact_image');
			imageField.dom.src = null;
			imageField.dom.alt = getMessage('text_no_image');
		}
	},
	
	// hide contactDetailsPanel
	repContactsFilterPanel_onShow:function(){
		var console = View.panels.get('repContactsFilterPanel');
		var sqlFilter = "1 = 1";
		var contact_id = console.getFieldValue('contact.contact_id');
		if(contact_id){
			sqlFilter += " AND contact.contact_id LIKE '" + contact_id + "'";
		}
		var company = console.getFieldValue('contact.company');
		if(company){
			sqlFilter += " AND contact.company = '" + company + "'";
		}
		var contact_type = console.getFieldValue('contact.contact_type');
		if(contact_type){
			sqlFilter += " AND contact.contact_type = '" + contact_type + "'";
		}
		var status = console.getFieldValue('contact.status');
		if(status){
			sqlFilter += " AND contact.status = '" + status + "'";
		}
		var city_id = console.getFieldValue('city.city_id');
		if(city_id){
			sqlFilter += " AND city.city_id = '" + city_id + "'";
		}
		var county_id = console.getFieldValue('county.county_id');
		if(county_id){
			sqlFilter += " AND county.county_id = '" + county_id + "'";
		}
		var tree = View.panels.get('repContactsTreeLevel1');
		var form = View.panels.get('contactDetailsPanel');
		tree.addParameter('sqlFilter', sqlFilter);
		tree.addParameter('sqlFilter', sqlFilter);
		tree.refresh();
		form.refresh();
		this.contactDetailsPanel.show(false);
	}
});
