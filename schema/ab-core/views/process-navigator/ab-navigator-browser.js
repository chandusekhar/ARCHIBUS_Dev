
View.createController('navigatorTree', {
	
	selectedProductId: '',
	selectedActivityId: '',
	selectedProcessId: '',
	
    afterViewLoad: function() {
        // override default createRestrictionForLevel() method of this tree control
        // do it in afterViewLoad() to make sure the overridden method is used in tree control's initial data fetch
        // the returned restriction will be used by the tree control as is, without any modifications
		// if the method returns null, the tree control will use its default restriction
        this.products_tree.createRestrictionForLevel = function(parentNode, level) {
			var restriction = null;
			
			if (level == 1) {
				// from products (level 1) to activities
				this.selectedProductId = parentNode.data['afm_products.product_id'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('afm_actprods.product_id', this.selectedProductId);
				
			} else if (level == 2) {
				// from activities (level 2) to processes
				this.selectedActivityId = parentNode.data['afm_activities.activity_id'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('afm_processes.activity_id', this.selectedActivityId);
				
			} else if (level == 3) {
				// from processes (level 3) to tasks
				this.selectedProcessId = parentNode.data['afm_processes.process_id'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('afm_tasks.activity_id', this.selectedActivityId);
				restriction.addClause('afm_tasks.process_id', this.selectedProcessId);
			}

            return restriction;
        }
    }
});