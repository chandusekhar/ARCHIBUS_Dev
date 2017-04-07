View.createController('missionSupportController', {
    filterRestriction: null,
    afterInitialDataFetch: function () {
        this.filter();
    },
    /**
     * Apply a restriction to mission support panel and refresh it.
     * @param filterRestriction
     * @param selectedTreeNode - selected node asset from tree panels
     */
    filter: function (filterRestriction, selectedTreeNode) {
        if (valueExistsNotEmpty(filterRestriction)) {
            var restriction = this.getSqlRestriction(filterRestriction);
            this.filterRestriction = restriction;
        }
        if (selectedTreeNode && selectedTreeNode.treeType) {
            var nodeRestriction = this.getRestrictionFromTreeNode(selectedTreeNode);
            if (nodeRestriction && nodeRestriction.restriction) {
                var restriction = this.getSqlRestriction(nodeRestriction.restriction);
                this.filterRestriction += (valueExistsNotEmpty(this.filterRestriction) ? " AND " : "") + restriction;
            }
            if (nodeRestriction && nodeRestriction.sql) {
                this.filterRestriction += nodeRestriction.sql;
            }
        }
        if (this.filterRestriction) {
            this.missionSupportAnalysisPanel.addParameter('filterRestriction', this.filterRestriction);
        }
        this.missionSupportAnalysisPanel.refresh();
    },
    /**
     * Get SQL restriction based on console filter and selected asset node from tree panels.
     * @param filterRestriction
     * @returns {string}
     */
    getSqlRestriction: function (filterRestriction) {
        var restriction = "";
        var clause = filterRestriction.findClause('bl.asset_id');
        if (clause) {
            restriction += " eq.eq_id " + getSqlClauseValue(clause.op, clause.value);
        }
        clause = filterRestriction.findClause('bl.ctry_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") + " (EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=eq.bl_id AND bl.ctry_id " + getSqlClauseValue(clause.op, clause.value) + " ))";
        }
        clause = filterRestriction.findClause('bl.state_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") + " (EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=eq.bl_id AND bl.state_id " + getSqlClauseValue(clause.op, clause.value) + " ))";
        }
        clause = filterRestriction.findClause('bl.city_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") + " (EXISTS(SELECT 1 FROM bl WHERE bl.bl_id=eq.bl_id AND bl.city_id " + getSqlClauseValue(clause.op, clause.value) + " ))";
        }
        clause = filterRestriction.findClause('bl.site_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") + " eq.site_id " + getSqlClauseValue(clause.op, clause.value);
        }
        clause = filterRestriction.findClause('bl.bl_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") + " eq.bl_id " + getSqlClauseValue(clause.op, clause.value);
        }
        clause = filterRestriction.findClause('bl.fl_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") + " eq.fl_id " + getSqlClauseValue(clause.op, clause.value);
        }
        clause = filterRestriction.findClause('bl.rm_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") + " eq.rm_id " + getSqlClauseValue(clause.op, clause.value);
        }
        clause = filterRestriction.findClause('bl.project_id');
        if (clause) {
            restriction += (valueExistsNotEmpty(restriction) ? " AND " : "") +
                "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.eq_id = eq.eq_id AND activity_log.project_id " + getSqlClauseValue(clause.op, clause.value) + ")";
        }
        return restriction;
    },
    /**
     * Get asset analysis restriction from tree node restriction.
     * @param selectedTreeNode
     * @returns {{restriction: Ab.view.Restriction, sql: sql statement}}
     */
    getRestrictionFromTreeNode: function (selectedTreeNode) {
        var treeType = selectedTreeNode.treeType,
            nodeRestriction = selectedTreeNode.nodeRestriction;
        var objRestriction = new Ab.view.Restriction();
        var sqlRestriction = null;
        if ('geographical' === treeType || 'location' === treeType) {
            for (var i = 0; i < nodeRestriction.clauses.length; i++) {
                var tmpObjClause = nodeRestriction.clauses[i];
                if ('geo_region.geo_region_id' === tmpObjClause.name) {
                    sqlRestriction = "(EXISTS (SELECT 1 FROM ctry, bl WHERE ctry.ctry_id = bl.ctry_id AND eq.bl_id = bl.bl_id AND ctry.geo_region_id" + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + "))";
                } else {
                    var clauseName = 'bl' + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.'));
                    objRestriction.addClause(clauseName, tmpObjClause.value, tmpObjClause.op, tmpObjClause.relOp);
                }
            }
        } else if ('organization' === treeType) {
            var genSql = "(1=1 ";
            for (var i = 0; i < nodeRestriction.clauses.length; i++) {
                var tmpObjClause = nodeRestriction.clauses[i];
                if ('bu.bu_id' === tmpObjClause.name) {
                    genSql += " AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = eq.dv_id AND dv.bu_id " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + " )";
                } else {
                    genSql += " AND eq" + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.')) + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
                }
            }
            genSql += ")";
            if (nodeRestriction.clauses.length > 0) {
                sqlRestriction = "(" + genSql + ")";
            }
        } else if ('project' === treeType) {
            //restrict using activity_log table
            sqlRestriction = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.eq_id = eq.eq_id  AND"
            sqlRestriction += " EXISTS(SELECT project.project_id FROM project WHERE project.is_template = 0 AND project.project_id = activity_log.project_id";
            var activityLogStr = "";
            for (var i = 0; i < nodeRestriction.clauses.length; i++) {
                var tmpObjClause = nodeRestriction.clauses[i];
                if ('activity_log.activity_log_id' === tmpObjClause.name) {
                    activityLogStr += tmpObjClause.name + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
                } else if ('work_pkgs.work_pkg_id' === tmpObjClause.name) {
                    sqlRestriction += " AND EXISTS(SELECT work_pkgs.work_pkg_id FROM work_pkgs WHERE work_pkgs.project_id = project.project_id";
                    sqlRestriction += " AND " + tmpObjClause.name + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + ")";
                } else {
                    sqlRestriction += " AND project" + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.')) + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
                }
            }
            sqlRestriction += ")";
            if (valueExistsNotEmpty(activityLogStr)) {
                sqlRestriction += "AND " + activityLogStr;
            }
            sqlRestriction += ")";
        } else if ('systems' === treeType) {
            var clause = nodeRestriction.findClause('eq.eq_id');
            sqlRestriction = " eq.eq_id " + getSqlClauseValue(clause.op, clause.value);
        }
        return {'restriction': objRestriction, 'sql': sqlRestriction};
    },
    missionSupportAnalysisPanel_onMaximize: function () {
        var filterRestriction = this.filterRestriction;
        View.openDialog('ab-eam-lifecycle-mission-support.axvw', null, false, {
            maximize: true,
            afterInitialDataFetch: function (dialogView) {
                dialogView.panels.get('missionSupportAnalysisPanel').actions.get('maximize').show(false);
                if (valueExistsNotEmpty(filterRestriction)) {
                    dialogView.panels.get('missionSupportAnalysisPanel').addParameter('filterRestriction', filterRestriction);
                }
            }
        });
    }
});
/**
 * On cross-table drill down
 * @param context
 */
function onDrillDown(context) {
    var restriction = context.restriction,
        panelRestriction = " 1=1";
    var detailsTitle = getMessage("title_details") + " : ";
    var clause = restriction.findClause("eq.criticality");
    if (clause) {
        detailsTitle += " " + getMessage('criticalityTitle') + " " + clause.value + ";";
        panelRestriction += ' AND eq.criticality=' + clause.value;
    }
    clause = restriction.findClause("eq.dv_dp_id");
    if (clause && clause.value != '-') {
        detailsTitle += "  " + clause.value;
    }
    if (clause) {
        if (valueExistsNotEmpty(clause.value)) {
            panelRestriction += " AND eq.dv_id${sql.concat}'-'${sql.concat}eq.dp_id = '" + clause.value + "'";
        } else {
            panelRestriction += " AND eq.dv_id${sql.concat}'-'${sql.concat}eq.dp_id IS NULL";
        }
    }
    var filterRestriction = View.controllers.get('missionSupportController').filterRestriction;
    if (filterRestriction) {
        panelRestriction += ' AND ' + filterRestriction;
    }
    View.getOpenerView().openDialog('ab-eam-lifecycle-analysis-details.axvw', null, false, {
        width: 1200,
        height: 600,
        closeButton: true,
        afterInitialDataFetch: function (dialogView) {
            var detailPanel = dialogView.panels.get('analysisDetailsPanel');
            detailPanel.refresh(panelRestriction);
            detailPanel.setTitle(detailsTitle);
        }
    });
}