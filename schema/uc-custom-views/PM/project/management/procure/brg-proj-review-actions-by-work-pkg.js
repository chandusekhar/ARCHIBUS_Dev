/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.is_template = 0 AND EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id AND activity_log.work_pkg_id IS NOT NULL)");
}

function onWorkPkgIdSelval() {
	workPkgIdSelval("EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = work_pkgs.project_id AND activity_log.work_pkg_id = work_pkgs.work_pkg_id)");
}
