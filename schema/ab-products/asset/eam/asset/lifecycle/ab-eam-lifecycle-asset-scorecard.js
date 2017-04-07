/**
 * Asset Scorecard Controller.
 */
View.createController('assetScorecard', {
    /**
     * Reference to the Asset Scorecard controller.
     */
    assetScorecardController: null,
    /**
     * Reference to filter console controller
     */
    filterController: null,
    /**
     * Passed filter restriction when maximize.
     */
    filterRestriction: null,
    /**
     * Initializes and displays the asset scorecard.
     */
    afterInitialDataFetch: function () {
        this.assetScorecard.setTitle(getMessage('scorecardTitle'));
        this.assetScorecardController = View.controllers.get('financialAnalysisConsoleAssetScorecard');
        // hide asset scorecard UI controls that are specific to the SFA console
        this.assetScorecardController.afterConsoleLoad('assetScorecard');
        // load the default analysis into the asset scorecard and metric trend charts
        if (FinancialAnalysisConfiguration.analyses.length == 0) {
            this.showMissingDataConfig();
            return;
        }
        // load 'Unified Capital and Expense Analysis' by default or the first analysis if not found
        var defaultAnalysis = FinancialAnalysisConfiguration.getAnalysis('Unified Capital and Expense Analysis') || FinancialAnalysisConfiguration.analyses[0];
        this.trigger('app:rplm:sfa:selectAnalysis', defaultAnalysis);
        this.filter();
    },
    /**
     * Show missing analysis data configuration message.
     */
    showMissingDataConfig: function () {
        this.assetScorecard.setTitle(getMessage('missingAnalysisData'));
        jQuery('#scorecardSelectMetrics').parent().remove();
        jQuery('#assetScorecardMaximize').parent().remove();
        jQuery(this.assetScorecard.actions.get('assetScorecardExport').button.el.dom).parent().remove();
        jQuery(this.assetScorecard.actions.get('assetScorecardReports').button.el.dom).parent().remove();
        this.assetScorecard.show();
    },
    /**
     * Opens the Select Metrics dialog.
     */
    assetScorecard_onScorecardSelectMetrics: function () {
        var assetScorecardController = this.assetScorecardController;
        var selectMetricsController = View.controllers.get('financialAnalysisConsoleSelectMetrics');
        // invoke the Select Metric dialog
        selectMetricsController.onSelectMetrics(this.assetScorecardController.selectedAnalysisCode, 'Asset Scorecard', function () {
            // when the user selects metric fields, ask the asset scorecard to display them
            assetScorecardController.afterSelectMetrics('Asset Scorecard');
        });
    },
    /**
     * Apply a restriction to the asset scorecard if exists and refresh it.
     * @param filterRestriction
     * @param selectedTreeNode
     */
    filter: function (filterRestriction, selectedTreeNode) {
        //reset restriction
        this.assetScorecardController.restriction = new Ab.view.Restriction();
        if (this.filterRestriction && this.filterRestriction.sql) {
            this.assetScorecardController.restriction.sql = this.filterRestriction.sql;
        }
        this.assetScorecardController.consoleRestriction = this.filterRestriction || new Ab.view.Restriction();
        // set console filter restrictions and selected node restriction
        this.setRestrictions(filterRestriction);
        if (selectedTreeNode) {
            var nodeRestriction = this.getRestrictionFromTreeNode(selectedTreeNode);
            if (nodeRestriction && nodeRestriction.restriction) {
                this.setRestrictions(nodeRestriction.restriction);
            }
            if (nodeRestriction && nodeRestriction.sql) {
                this.assetScorecardController.restriction.sql = nodeRestriction.sql;
            }
        }
        this.assetScorecardController.refreshAssetScorecard();
        // reset filter restriction
        this.filterRestriction = null;
    },
    /**
     * Set scorecard console restriction.
     * @param restriction
     */
    setRestrictions: function (restriction) {
        if (valueExists(restriction)) {
            var clause = restriction.findClause('bl.asset_type');
            var assetType = clause;
            if (clause) {
                var value = null;
                switch (clause.value) {
                    case 'eq':
                        value = 'Equipment';
                        break;
                    case 'property':
                        value = 'Property';
                        break;
                    case 'bl':
                        value = 'Building';
                        break;
                }
                if (value) {
                    this.assetScorecardController.consoleRestriction.addClause('finanal_sum.asset_type', value, clause.op, clause.relOp);
                }
            }
            clause = restriction.findClause('bl.asset_id');
            if (clause) {
                if (assetType) {
                    this.assetScorecardController.consoleRestriction.addClause('finanal_sum.' + assetType + '_id', clause.value);
                } else {
                    this.assetScorecardController.consoleRestriction.addClause('finanal_sum.bl_id', clause.value, clause.op, 'OR');
                    this.assetScorecardController.consoleRestriction.addClause('finanal_sum.eq_id', clause.value, clause.op, 'OR');
                    this.assetScorecardController.consoleRestriction.addClause('finanal_sum.pr_id', clause.value, clause.op, 'OR');
                }
            }
            clause = restriction.findClause('bl.ctry_id');
            if (clause) {
                this.assetScorecardController.consoleRestriction.addClause('finanal_sum.ctry_id', clause.value, clause.op, clause.relOp);
            }
            clause = restriction.findClause('bl.state_id');
            if (clause) {
                this.assetScorecardController.consoleRestriction.addClause('finanal_sum.state_id', clause.value, clause.op, clause.relOp);
            }
            clause = restriction.findClause('bl.city_id');
            if (clause) {
                this.assetScorecardController.consoleRestriction.addClause('finanal_sum.city_id', clause.value, clause.op, clause.relOp);
            }
            clause = restriction.findClause('bl.site_id');
            if (clause) {
                this.assetScorecardController.consoleRestriction.addClause('finanal_sum.site_id', clause.value, clause.op, clause.relOp);
            }
            clause = restriction.findClause('bl.bl_id');
            if (clause) {
                this.assetScorecardController.consoleRestriction.addClause('finanal_sum.bl_id', clause.value, clause.op, clause.relOp);
            }
            clause = restriction.findClause('bl.project_id');
            if (clause) {
                this.assetScorecardController.consoleRestriction.addClause('finanal_sum.project_id', clause.value, clause.op, clause.relOp);
            }
        }
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
                    sqlRestriction = "(EXISTS (SELECT 1 FROM ctry WHERE ctry.ctry_id = finanal_sum.ctry_id AND ctry.geo_region_id" + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + "))";
                } else {
                    var clauseName = 'bl' + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.'));
                    objRestriction.addClause(clauseName, tmpObjClause.value, tmpObjClause.op, tmpObjClause.relOp);
                }
            }
        } else if ('organization' === treeType) {
            var genEqSql = "EXISTS(SELECT 1 FROM eq WHERE eq.eq_id = finanal_sum.eq_id ",
                genProjectSql = "EXISTS(SELECT 1 FROM project WHERE project.project_id = finanal_sum.project_id ";
            for (var i = 0; i < nodeRestriction.clauses.length; i++) {
                var tmpObjClause = nodeRestriction.clauses[i];
                if ('bu.bu_id' === tmpObjClause.name) {
                    genEqSql += " AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = eq.dv_id AND dv.bu_id " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + " )";
                    genProjectSql += " AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = project.dv_id AND dv.bu_id " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + " )";
                } else {
                    genEqSql += " AND eq" + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.')) + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
                    genProjectSql += " AND project" + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.')) + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
                }
            }
            genEqSql += ")";
            genProjectSql += ")";
            if (nodeRestriction.clauses.length > 0) {
                sqlRestriction = "(" + genEqSql + ") OR (" + genProjectSql + ")";
            }
        } else if ('project' === treeType) {
            //restrict using activity_log table
            sqlRestriction = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE ("
            sqlRestriction += "(finanal_sum.asset_type = 'Building' AND activity_log.bl_id = finanal_sum.bl_id) ";
            sqlRestriction += "OR (finanal_sum.asset_type = 'Equipment' AND activity_log.eq_id = finanal_sum.eq_id) ";
            sqlRestriction += "OR (finanal_sum.asset_type = 'Property' AND activity_log.pr_id = finanal_sum.pr_id) ";
            sqlRestriction += "OR (finanal_sum.asset_type = 'Project' AND activity_log.pr_id = finanal_sum.project_id)) ";
            sqlRestriction += "AND EXISTS(SELECT project.project_id FROM project WHERE project.is_template = 0 AND project.project_id = activity_log.project_id";
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
            sqlRestriction = " finanal_sum.eq_id " + getSqlClauseValue(clause.op, clause.value);
        }
        return {'restriction': objRestriction, 'sql': sqlRestriction};
    },
    /**
     * Locates selected building on a map.
     */
    assetScorecard_onLocate: function (row, action) {
        var bl_id = row.getRecord().getValue('finanal_sum.bl_id');
        var gisRestriction = new Ab.view.Restriction();
        gisRestriction.addClause('bl.asset_type', 'bl');
        gisRestriction.addClause('bl.asset_id', bl_id);
        var menuActions = new Ext.util.MixedCollection();
        menuActions.addAll(
            {id: 'costReplace', actionConfig: {visible: true, enabled: true, type: '', listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
            {id: 'costDepValue', actionConfig: {visible: true, enabled: true, type: '', listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
            {id: 'costValMarket', actionConfig: {visible: true, enabled: true, type: '', listener: 'onSelectMenuAction', selected: true, dataSourceId: 'abEamGisDs_assetRegistryCosts'}}
        );
        var mapToolsActionConfig = new Ext.util.MixedCollection();
        mapToolsActionConfig.add('toolsAction', {
            id: 'toolsAction',
            actionConfig: {
                visible: true,
                enabled: true,
                type: 'menu',
                listener: null,
                selected: false,
                actions: menuActions
            }
        });
        var abAssetOptimizationLocation = View.panels.get('abAssetOptimizationLocation');
        abAssetOptimizationLocation.parameters = {
            'mapToolsActionConfig': mapToolsActionConfig,
            'panelTitle': getMessage('titleMapPanel'),
            'showMarkerLabels': false
        };
        abAssetOptimizationLocation.loadView('ab-eam-gis-map.axvw', gisRestriction, null);
    },
    /**
     * Opens the Asset Scorecard view in a dialog.
     */
    assetScorecard_onAssetScorecardMaximize: function () {
        var filterRestriction = this.assetScorecardController.restriction;
        View.openDialog('ab-eam-lifecycle-asset-scorecard.axvw', null, false, {
            maximize: true,
            afterInitialDataFetch: function (dialogView) {
                dialogView.panels.get('assetScorecard').actions.get('assetScorecardMaximize').show(false);
                dialogView.controllers.get('assetScorecard').filterRestriction = filterRestriction;
            }
        });
    }
});