/**
 * Common methods to prepare console restriction.
 */
/**
 *Return filter level restriction.
 */
function getFilterLevelRestriction(filterRestriction, applyLevels) {
    var result = "";
    if (applyLevels) {
        for (var i = 1; i <= 10; i++) {
            var restrictionSql = getEqSysTreeLevelRestriction(filterRestriction, i);
            if (valueExistsNotEmpty(restrictionSql)) {
                result += " (";
                result += restrictionSql;
                result += " )";
                if (i < 10) {
                    result += ' OR ';
                }
            }
        }
    } else {
        var restrictionSql = getEqSysTreeLevelRestriction(filterRestriction);
        if (valueExistsNotEmpty(restrictionSql)) {
            result += " (";
            result += restrictionSql;
            result += " )";
        }
    }
    return result;
}
/**
 * Get equipment system tree level restriction.
 */
function getEqSysTreeLevelRestriction(filterRestriction, index) {
    index = index || '';
    var result = "";
    result += getAssetRestriction(filterRestriction, index);
    if (valueExistsNotEmpty(index)) {
        var eqSysRestriction = getEquipmentSystemRestriction(filterRestriction, index);
        result += ((valueExistsNotEmpty(result) && valueExistsNotEmpty(eqSysRestriction)) ? " AND " : "") + eqSysRestriction;
    }
    var geoRestriction = getGeographicalRestrictionForEquipment(filterRestriction, index);
    result += ((valueExistsNotEmpty(result) && valueExistsNotEmpty(geoRestriction)) ? " AND " : "") + geoRestriction;
    var orgRestriction = getOrgRestrictionForEquipment(filterRestriction, index);
    result += ((valueExistsNotEmpty(result) && valueExistsNotEmpty(orgRestriction)) ? " AND " : "") + orgRestriction;
    var prjRestriction = getProjectRestrictionForEquipment(filterRestriction, index);
    result += ((valueExistsNotEmpty(result) && valueExistsNotEmpty(prjRestriction)) ? " AND " : "") + prjRestriction;
    var csiRestriction = getClassificationForEquipment(filterRestriction, index);
    result += ((valueExistsNotEmpty(result) && valueExistsNotEmpty(csiRestriction)) ? " AND " : "") + csiRestriction;
    return result;
}
/**
 * Get asset restriction.
 */
function getAssetRestriction(filterRestriction, index) {
    var result = "";
    // asset id
    var clause = filterRestriction.findClause('bl.asset_id');
    if (clause) {
        var field = " eq_id";
        if (valueExistsNotEmpty(index)) {
            field = " level" + index;
        }
        result += field + " " + getSqlClauseValue(clause.op, clause.value);
    }
    clause = filterRestriction.findClause('bl.asset_std');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq" + index + ".eq_std " + getSqlClauseValue(clause.op, clause.value);
    }
    clause = filterRestriction.findClause('bl.asset_status');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq" + index + ".status " + getSqlClauseValue(clause.op, clause.value);
    }
    return result;
}
/**
 * Get equipment system restriction.
 */
function getEquipmentSystemRestriction(filterRestriction, index) {
    var result = "";
    var clause = filterRestriction.findClause('eq_system.stakeholder_type');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq_system" + index + ".stakeholder_type " + getSqlClauseValue(clause.op, clause.value);
    }
    clause = filterRestriction.findClause('system_system_name');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq_system" + index + ".system_name " + getSqlClauseValue(clause.op, clause.value);
    }
    clause = filterRestriction.findClause('eq_system.criticality_function');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq_system" + index + ".criticality_function " + getSqlClauseValue(clause.op, clause.value);
    }
    clause = filterRestriction.findClause('assembly_system_name');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq_system" + index + ".system_name " + getSqlClauseValue(clause.op, clause.value);
    }
    clause = filterRestriction.findClause('eq_system.criticality_mission');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq_system" + index + ".criticality_mission " + getSqlClauseValue(clause.op, clause.value);
    }
    return result;
}
/**
 * Get geographical restriction.
 */
function getGeographicalRestrictionForEquipment(filterRestriction, index) {
    var result = "";
    // ctry.geo_region_id
    var clause = filterRestriction.findClause('bl.geo_region_id');
    if (clause) {
        result += " (EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=eq" + index + ".bl_id AND EXISTS (SELECT 1 FROM ctry as ctry_b_bl  WHERE ctry_b_bl.ctry_id = bl.ctry_id  AND ctry_b_bl.geo_region_id " + getSqlClauseValue(clause.op, clause.value) + " )))";
    }
    // bl.ctry_id
    clause = filterRestriction.findClause('bl.ctry_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " (EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=eq" + index + ".bl_id AND bl.ctry_id " + getSqlClauseValue(clause.op, clause.value) + " ))";
    }
    // bl.state_id
    clause = filterRestriction.findClause('bl.state_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " (EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=eq" + index + ".bl_id AND bl.state_id " + getSqlClauseValue(clause.op, clause.value) + " ))";
    }
    // bl.city_id
    clause = filterRestriction.findClause('bl.city_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " (EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=eq" + index + ".bl_id AND bl.city_id " + getSqlClauseValue(clause.op, clause.value) + " ))";
    }
    // bl.site_id
    clause = filterRestriction.findClause('bl.site_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq" + index + ".site_id " + getSqlClauseValue(clause.op, clause.value);
    }
    //bl.bl_id
    clause = filterRestriction.findClause('bl.bl_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq" + index + ".bl_id " + getSqlClauseValue(clause.op, clause.value);
    }
    //bl.fl_id
    clause = filterRestriction.findClause('bl.fl_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq" + index + ".fl_id " + getSqlClauseValue(clause.op, clause.value);
    }
    //bl.rm_id
    clause = filterRestriction.findClause('bl.rm_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + " eq" + index + ".rm_id " + getSqlClauseValue(clause.op, clause.value);
    }
    return result;
}
/**
 * Get organizational restriction.
 */
function getOrgRestrictionForEquipment(filterRestriction, index) {
    var result = "";
    // bu_id
    var clause = filterRestriction.findClause('bl.bu_id');
    if (clause) {
        result = "EXISTS(SELECT dv.bu_id FROM dv WHERE dv.dv_id = eq" + index + ".dv_id AND dv.bu_id " + getSqlClauseValue(clause.op, clause.value) + ")";
    }
    // dv_id
    var clause = filterRestriction.findClause('bl.dv_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + "eq" + index + ".dv_id " + getSqlClauseValue(clause.op, clause.value);
    }
    // dp_id
    var clause = filterRestriction.findClause('bl.dp_id');
    if (clause) {
        result += (valueExistsNotEmpty(result) ? " AND " : "") + "eq" + index + ".dp_id " + getSqlClauseValue(clause.op, clause.value);
    }
    return result;
}
/**
 * Get project restriction.
 */
function getProjectRestrictionForEquipment(filterRestriction, index) {
    var projectRestriction = "";
    var clause = filterRestriction.findClause('project.program_id');
    if (clause) {
        projectRestriction = " EXISTS(SELECT project.project_id FROM project WHERE project.status NOT IN ('Closed', 'Completed', 'Canceled') AND project.program_id "
            + getSqlClauseValue(clause.op, clause.value)
            + " AND activity_log.project_id = project.project_id ) ";
    }
    var clause = filterRestriction.findClause('bl.project_id');
    if (clause) {
        projectRestriction += (valueExistsNotEmpty(projectRestriction) ? " AND " : "") + " activity_log.project_id " + getSqlClauseValue(clause.op, clause.value);
    }
    var clause = filterRestriction.findClause('work_pkgs.work_pkg_id');
    if (clause) {
        projectRestriction += (valueExistsNotEmpty(projectRestriction) ? " AND " : "") + " activity_log.work_pkg_id " + getSqlClauseValue(clause.op, clause.value);
    }
    var result = "";
    if (valueExistsNotEmpty(projectRestriction)) {
        projectRestriction = " AND " + projectRestriction;
        result = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.eq_id = eq" + index + ".eq_id " + projectRestriction + ")";
    }
    return result;
}
/**
 * Get classification restriction.
 */
function getClassificationForEquipment(filterRestriction, index) {
    var result = "";
    var clause = filterRestriction.findClause('activity_log.csi_id');
    if (clause) {
        result = " EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.eq_id = eq" + index + ".eq_id ";
        result += " AND activity_log.csi_id " + getSqlClauseValue(clause.op, clause.value) + ")";
    }
    return result;
}