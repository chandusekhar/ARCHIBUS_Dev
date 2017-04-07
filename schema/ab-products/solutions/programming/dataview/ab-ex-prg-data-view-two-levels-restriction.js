
/**
 * Override the getNextLevelRestriction() method.
 */
Ab.view.DataViewLevel.prototype.getNextLevelRestriction = function(parentRecord) {
    var restrictionForNextLevel = new Ab.view.Restriction();
    restrictionForNextLevel.addClause('eq.subcomponent_of', parentRecord.getValue('eq.eq_id'), '=');
    return restrictionForNextLevel;    
}
