View.createController('exTreeHierarchy', {
    afterViewLoad: function() {
        this.equipmentTree1.updateRestrictionForLevel = function(parentNode, level, restriction) {
            if (level > 0) {
                restriction.removeClause('eq.eq_id');
                restriction.addClause('eq.subcomponent_of', parentNode.data['eq.eq_id'], '=');
            }
        };
    }
});