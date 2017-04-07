var controller = View.createController('hotelCostRptController', {

    updateRuleId: 'AbCommonResources-SpaceService-updateAreaTotalsSpaceTimeAndPerformChargeBack',
    isExcludeNullArea: false,
    
    onRefresh: function(){
        this.divisionGrid.refresh();
        this.deptGrid.show(false);
        this.rmpctGrid.show(false);
    },
    /**
     * Set grid title
     */
    rmpctGrid_onExcludeNullArea: function(){
        this.isExcludeNullArea = !this.isExcludeNullArea;
        if (this.isExcludeNullArea) {
            this.rmpctGrid.actions.get("excludeNullArea").setTitle(getMessage("include0"));
        }
        else {
            this.rmpctGrid.actions.get("excludeNullArea").setTitle(getMessage("exclude0"));
        }
        onSelectDept();
    }
    
});

var divisionId = "";
var deptCode = "";
/**
 * Set title for selected row
 */
function onSelectDivision(){
    var divisionGrid = View.panels.get('divisionGrid');
    divisionId = divisionGrid.rows[divisionGrid.selectedRowIndex]["dv.dv_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("dp.dv_id", divisionId, "=");
    View.panels.get('deptGrid').refresh(restriction);
    var title = getMessage("floorPanelTitle").replace("<{0}>", divisionId);
    setPanelTitle("deptGrid", title);
    
    View.panels.get('rmpctGrid').clear();
    title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
    setPanelTitle("rmpctGrid", title);
}

/**
 * Set title for selected row
 */
function onSelectDept(){
    var deptGrid = View.panels.get('deptGrid');
    deptCode = deptGrid.rows[deptGrid.selectedRowIndex]["dp.dp_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.dv_id", divisionId, "=");
    restriction.addClause("rm.dp_id", deptCode, "=");
    if (View.controllers.get("hotelCostRptController").isExcludeNullArea) {
        restriction.addClause("rmpct.area_rm", 0, ">");
    }
    View.panels.get('rmpctGrid').refresh(restriction);
    var title = getMessage("roomFloorPanelTitle").replace("<{0}>", divisionId + "-" + deptCode);
    setPanelTitle("rmpctGrid", title);
}
