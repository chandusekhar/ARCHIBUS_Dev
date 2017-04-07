var cntrl = View.createController('cntrl',{
	postionLu: function() {
		var rest = "UC_courses.status='A' and not exists (select 1 from uc_position_courses p where p.course_id=UC_courses.course_id and p.position="
		rest +=makeLiteralOrNull(this.courses_form.getFieldValue('uc_position_courses.position')) +")"
		View.selectValue({
		formId: 'courses_form',
		title: "Courses",
		fieldNames: ['uc_position_courses.course_id'],
		selectTableName: 'UC_courses',
		selectFieldNames: ['UC_courses.course_id'],
		visibleFieldNames: ['UC_courses.course_id','UC_courses.course_name','UC_courses.category_id'],
		restriction: rest
		});
	}
})
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