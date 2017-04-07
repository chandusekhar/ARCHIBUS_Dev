/**
 * @author Ioan Draghici
 * 06/18/2009
 */
var repProjDataViewCtrl = View.createController('repProjDataViewCtrl',{

	// refresh report
	refreshReport: function(restriction){
		this.repProjects.refresh(restriction);
	}
})
