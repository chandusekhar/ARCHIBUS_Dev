var catCoursesController = View.createController('catCoursesController',{
	afterViewLoad: function () {
		this.postionsGrid_status_menu = new Ext.menu.Menu({
            items: [{
                text: "<b style='color:green;'>Active</b>",
				fld:"status",
				val:'A',
                handler: catCoursesController.posStatus
            }, {
              text: "<b style='color:green;'>Inactive</b>",
				fld:"status",
				val:'I',
                handler: catCoursesController.posStatus           
			}]
        });
		this.postionsGrid_required_menu = new Ext.menu.Menu({
            items: [{
				text: "<b style='color:green;'>Required</b>",
				fld:"required",
				val:'R',
                handler: catCoursesController.posRequired 
            }, {
				text: "<b style='color:green;'>Optional</b>",
				fld:"required",
				val:'O',
                handler: catCoursesController.posRequired
            }]
        });
	},
	
	postionsGrid_onPosStatus: function (e){
		var axis = [e.getClickEl().getX(), e.getClickEl().getBottom()];
        this.postionsGrid_status_menu.showAt(axis);
	},
	postionsGrid_onPosRequired: function (e){
		var axis = [e.getClickEl().getX(), e.getClickEl().getBottom()];
        this.postionsGrid_required_menu.showAt(axis);
	},
	posStatus: function (e){
		catCoursesController.updatePosition(e)
	},
	posRequired: function (e){
		catCoursesController.updatePosition(e)
	},
	
	
    hidePanel: function(thePanel)
	{
	  thePanel.show(false,true);
	},
	
	hideCourses: function()
	{
	  this.hidePanel(this.detailsPanelCourses);
	  this.hidePanel(this.postionsGrid);
	},
	
    hideCategories: function()
	{
	  //make pk readonly on edit 
	  //
	  var targetField = this.detailsPanelCourses.getFieldElement("UC_courses.course_id");
	  targetField.disabled= true;
	  //hide cats edit form
	  this.hidePanel(this.detailsPanelCategory);
	},
	
	coursesPanel_onAddNew: function ()
	{
	  //enable pk editing
	  this.detailsPanelCourses.getFieldElement("UC_courses.course_id").disabled = false;
	   this.hidePanel(this.postionsGrid);
	  this.hidePanel(this.detailsPanelCategory);
	},
	
	postionsGrid_onAdd: function (){
		var rest = "position not in (''";
		var grid = this.postionsGrid;
		//}
		
		for (var j = 0; j < grid.gridRows.length; j++) {
			var row = grid.gridRows.items[j];
			rest += "," + makeLiteralOrNull(row.getFieldValue("uc_position_courses.position"));
		}
		rest += ")"
		this.formSelectValueMultiple_grid.showInWindow({width: 600, height: 400});

		this.formSelectValueMultiple_grid.refresh(rest);
		
	},
	
	formSelectValueMultiple_grid_onAddSelected: function () {
		var rows = this.formSelectValueMultiple_grid.getSelectedGridRows();
		var grid = this.postionsGrid;
		for(i=0; i<rows.length; i++){
			var row = rows[i];
			var posid =  row.getFieldValue('uc_position.position')
			var record = new Ab.data.Record();
			record.setValue("uc_position_courses.position", posid);
			record.setValue("uc_position_courses.course_id", this.detailsPanelCourses.getFieldValue('UC_courses.course_id'));
			record.setValue("uc_position_courses.required", "R");
			record.setValue("uc_position_courses.status", 'A');
			record.isNew=true
			
			
			var ds= View.dataSources.get(grid.dataSourceId)
			ds.saveRecord(record)
	
		}
		
		grid.refresh()
		
		this.formSelectValueMultiple_grid.closeWindow();
	},
	
	
	
	updatePosition : function (e) {
		var grid = catCoursesController.postionsGrid;
		var fld = 'uc_position_courses.' + e.fld
		var rows = grid.getSelectedGridRows();
		if (rows.length == 0) {
			View.showMessage('Please select at least one postion to modify.');
			return false;
		}
		var ds= View.dataSources.get(grid.dataSourceId)
		
		for(i=rows.length - 1; i>-1; i--){
			var row = rows[i];
			
			var record = new Ab.data.Record({
				'uc_position_courses.position': row.getFieldValue("uc_position_courses.position"),
				'uc_position_courses.course_id': row.getFieldValue("uc_position_courses.course_id"),
				isNew:false},
				false
			);
			record.values[fld]=e.val 
			
			record.oldValues[fld]="" 
			record.oldValues['uc_position_courses.position']=row.getFieldValue("uc_position_courses.position") 
			record.oldValues['uc_position_courses.course_id']=row.getFieldValue("uc_position_courses.course_id") 
			ds.saveRecord(record)
		}
		
		grid.refresh()
		
	}
	
	
});

function makeLiteralOrNull(val,op) {
    var rVal = "NULL";
	if (!op) {op="";}
	if (op !="" ) {
		rVal = " IS NULL";
	}
    if (val != '') {
         rVal = op + "'" + val.toString().replace(/'/g, "''") + "'";
    }
    return  rVal;
}