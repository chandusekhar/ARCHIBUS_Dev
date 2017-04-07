/**
 * Controller of the LaborAnalysis dashboard main controller
 * @author Guo Jiangtao
 */
var dashLaborAnalysisMainController = View.createController('dashLaborAnalysisMainController', {

    // restriction of the tree filter
    treeRes: " 1=1 ",
    
    // the selected year in the cosole filter
    year: null,
	isCalYear:true,
	dateStart:'',
	dateEnd:'',
    
    // the selected categorize by value in the cosole filter
    categorizeBy: null,
	
	// the selected work type in the cosole filter
    workType: '',
    
    //collection of the sub view controllers
    subViewControllers: [],
	
	
	afterViewLoad: function(){
		View.controllers.get("dashTreeController").parentController = this;
	},
	
	isSubControllerRegistered:function(dashController){
		if(this.subViewControllers){
			for (var i=0; i<this.subViewControllers.length;i++){
				if(this.subViewControllers[i].id == dashController.id){
					return true;
				}
			}
		}
		return false;
	},
    
    /**
     * add controllers of sub views
     * @param subViewController {Object} the view controller object of the sub view.
     */
    addSubViewController: function(subViewController){
        this.subViewControllers.push(subViewController);
    },
    
    /**
     * refresh seleted sub view in selectedControllerArray by calling refreshPanel method of the sub view controller
     * if selectedControllerArray is undefined or null, refresh all sub views
     * @param selectedControllerArray {Array} the seleted view controllers that need to be refreshed.
     */
    refreshSubViews: function(selectedControllerArray){
        for (var i = 0; i < this.subViewControllers.length; i++) {
            if (valueExists(selectedControllerArray)) {
                if (this.isMemberOfArray(this.subViewControllers[i].id, selectedControllerArray)) {
                    this.subViewControllers[i].refreshPanel();
                }
                else {
                    continue;
                }
            }
            else {
                this.subViewControllers[i].refreshPanel();
            }
        }
    },
    
    /**
     * is a member of the given array
     * @param value {String} the test value
     * @param array {Array} the given array
     */
    isMemberOfArray: function(value, array){
        var flag = false;
        for (var i = 0; i < array.length; i++) {
            if (array[i] == value) {
                flag = true;
                break;
            }
        }
        
        return flag;
    },
    
    /**
     * refresh whole dashboard
     */
    refreshDashboard: function(){
        this.refreshSubViews();
    }
});
