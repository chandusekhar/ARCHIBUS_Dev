package com.archibus.eventhandler.eam.requirements;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.eam.domain.SpaceBudget;
import com.archibus.model.config.Units;

/**
 * Provides methods to handle space requirements.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 *        <p>
 *        Suppress PMD warning "AvoidUsingSql" in this class.
 *        <p>
 *        Justification: Case #2.1: Statement with INSERT ... SELECT pattern. Case #2.2: Statement
 *        with UPDATE ... SELECT pattern.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class SpaceRequirements {

    /**
     * rm_cat restriction for rm table.
     */
    private static final String RM_RMCAT_RESTRICTION =
            "EXISTS(SELECT rmcat.rm_cat FROM rmcat WHERE rmcat.supercat = 'USBL' AND rmcat.rm_cat = rm.rm_cat)";

    /**
     * rm_cat restriction for em table.
     */
    private static final String EM_RMCAT_RESTRICTION =
            "EXISTS(SELECT rm.rm_cat FROM rm LEFT OUTER JOIN rmcat ON rm.rm_cat = rmcat.rm_cat WHERE rmcat.supercat = 'USBL' AND rmcat.rm_cat = rm.rm_cat AND em.bl_id=rm.bl_id AND em.fl_id=rm.fl_id AND em.rm_id=rm.rm_id )";

    /**
     * Reg ex pattern.
     */
    private static final String RM_TABLE_PATTERN = Constants.TABLE_ROOM + "\\" + Constants.DOT;

    /**
     * Create space requirements baseline.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param bldgFloors building floors
     */
    public void createBaseline(final SpaceBudget spaceBudget, final String sumAllocation,
            final Map<String, List<String>> bldgFloors) {
        createBaseline(spaceBudget, sumAllocation, bldgFloors, "");
    }

    /**
     * Add locations to baseline.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param updateRequirements if requirements must be updated
     * @param bldgFloors new locations
     */
    public void addLocation(final SpaceBudget spaceBudget, final String sumAllocation,
            final boolean updateRequirements, final Map<String, List<String>> bldgFloors) {
        updateLocations(spaceBudget, sumAllocation, updateRequirements, bldgFloors);
        insertLocations(spaceBudget, sumAllocation, bldgFloors);
    }

    /**
     * Update current requirements and add new locations.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param updateRequirements if requirements must be updated
     * @param bldgFloors building floors
     */
    private void updateLocations(final SpaceBudget spaceBudget, final String sumAllocation,
            final boolean updateRequirements, final Map<String, List<String>> bldgFloors) {

        final String sqlSelectFrom =
                getUpdateLocationSelectFrom(spaceBudget, sumAllocation, bldgFloors);
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        final String baselineLocations = projectRequirementHelper.getBaselineLocations(bldgFloors);
        String sqlUpdate;

        // KB 3048962 - rewrite update SQL for Oracle
        if (SqlUtils.isOracle()) {
            String innerSelect = "SELECT inner_sb_items.p00_value + tmp_buffer.p00_value, ";
            sqlUpdate = "UPDATE sb_items SET (p00_value, ";
            if (updateRequirements) {
                sqlUpdate += "p01_value, ";
                innerSelect += "inner_sb_items.p01_value + tmp_buffer.p01_value, ";
            }
            sqlUpdate += "baseline_locations) = ( ";
            innerSelect += "inner_sb_items.baseline_locations${sql.concat}';' ${sql.concat} "
                    + SqlUtils.formatValueForSql(baselineLocations);
            innerSelect += " FROM sb_items inner_sb_items INNER JOIN ( " + sqlSelectFrom
                    + ") ${sql.as} tmp_buffer ON "
                    + getJoinConditionOnBuffer(sumAllocation, "inner_sb_items");

            innerSelect += " WHERE inner_sb_items.auto_number = sb_items.auto_number AND "
                    + getJoinOnGroupField(spaceBudget.getLevel(), sumAllocation);

            if (Constants.ROOM_AS_STANDARD.equals(spaceBudget.getCreatedAs())) {
                innerSelect += " AND sb_items.rm_std =  tmp_buffer.rm_std ";
            }

            sqlUpdate += innerSelect + ") WHERE sb_items.sb_name = "
                    + SqlUtils.formatValueForSql(spaceBudget.getName());
            sqlUpdate += " AND EXISTS(" + innerSelect + ")";
        } else {
            sqlUpdate =
                    "UPDATE sb_items SET sb_items.p00_value =  sb_items.p00_value + tmp_buffer.p00_value ";
            if (updateRequirements) {
                sqlUpdate += ", sb_items.p01_value =  sb_items.p01_value + tmp_buffer.p01_value ";
            }
            sqlUpdate += ", baseline_locations = baseline_locations ${sql.concat}';' ${sql.concat}"
                    + SqlUtils.formatValueForSql(baselineLocations);

            sqlUpdate +=
                    " FROM (" + sqlSelectFrom + ") ${sql.as} tmp_buffer WHERE sb_items.sb_name = "
                            + SqlUtils.formatValueForSql(spaceBudget.getName());

            sqlUpdate += Constants.OPERATOR_AND
                    + getJoinOnGroupField(spaceBudget.getLevel(), sumAllocation);
            if (Constants.ROOM_AS_STANDARD.equals(spaceBudget.getCreatedAs())) {
                sqlUpdate += " AND sb_items.rm_std =  tmp_buffer.rm_std";
            }
        }

        SqlUtils.executeUpdate(Constants.TABLE_SB_ITEMS, sqlUpdate);
    }

    /**
     * Update current requirements and add new locations - create select from statement.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param bldgFloors building floors
     * @return string
     */
    private String getUpdateLocationSelectFrom(final SpaceBudget spaceBudget,
            final String sumAllocation, final Map<String, List<String>> bldgFloors) {
        String sqlGroupBy = getGroupByFields(spaceBudget.getLevel(), sumAllocation);
        String sqlRestriction = getSqlRestriction(bldgFloors, spaceBudget.getLevel());

        String sqlSelectFrom = "SELECT " + getSelectFrom(spaceBudget.getLevel(), sumAllocation);
        final String roomStandard = getRoomStandard();
        if (Constants.ROOM_AS_AREAS.equals(spaceBudget.getCreatedAs())) {
            sqlSelectFrom +=
                    ", SUM(rm.area) ${sql.as} p00_value,  SUM(rm.area) ${sql.as} p01_value FROM rm ";
            sqlSelectFrom += " LEFT OUTER JOIN  dv ON dv.dv_id = rm.dv_id ";
            sqlSelectFrom += "LEFT OUTER JOIN rmstd  ON rmstd.rm_std = "
                    + SqlUtils.formatValueForSql(roomStandard);

        } else if (Constants.ROOM_AS_STANDARD.equals(spaceBudget.getCreatedAs())) {
            sqlSelectFrom += ", rmstd.rm_std ${sql.as} rm_std, (CASE WHEN rmstd.rm_std = "
                    + SqlUtils.formatValueForSql(roomStandard)
                    + " THEN SUM(rm.area) ELSE COUNT(rm.rm_std) END) ${sql.as} p00_value, (CASE WHEN rmstd.rm_std = "
                    + SqlUtils.formatValueForSql(roomStandard)
                    + " THEN SUM(rm.area) ELSE COUNT(rm.rm_std) END) ${sql.as} p01_value FROM rm ";
            sqlSelectFrom += "LEFT OUTER JOIN  dv ON dv.dv_id = rm.dv_id ";
            sqlSelectFrom +=
                    "LEFT OUTER JOIN rmstd ON rmstd.rm_std = ( CASE WHEN rm.rm_std IS NOT NULL THEN rm.rm_std ELSE "
                            + SqlUtils.formatValueForSql(roomStandard) + " END )";

            sqlGroupBy += ", rmstd.rm_std ";

        } else if (Constants.EM_AS_HEADCOUNT.equals(spaceBudget.getCreatedAs())) {
            sqlSelectFrom =
                    sqlSelectFrom.replaceAll(RM_TABLE_PATTERN, Constants.TABLE_EM + Constants.DOT);
            sqlSelectFrom +=
                    ", COUNT(em.em_id ) ${sql.as} p00_value,  COUNT(em.em_id ) ${sql.as} p01_value FROM em ";
            sqlSelectFrom += " LEFT OUTER JOIN dv  ON dv.dv_id = em.dv_id ";
            sqlSelectFrom += " LEFT OUTER JOIN rmstd ON  rmstd.rm_std = "
                    + SqlUtils.formatValueForSql(Constants.RMSTD_PEOPLE);

            sqlRestriction =
                    sqlRestriction.replaceAll(RM_TABLE_PATTERN, Constants.TABLE_EM + Constants.DOT);

            // KB3049654 - rewrite invalid rm_cat restriction for em table resulted from replacing
            // 'rm.' with 'em.'
            sqlRestriction =
                    sqlRestriction.replace(RM_RMCAT_RESTRICTION.replaceAll(RM_TABLE_PATTERN,
                        Constants.TABLE_EM + Constants.DOT), EM_RMCAT_RESTRICTION);

            sqlGroupBy =
                    sqlGroupBy.replaceAll(RM_TABLE_PATTERN, Constants.TABLE_EM + Constants.DOT);
        }

        sqlSelectFrom += " WHERE " + sqlRestriction;
        sqlSelectFrom += " GROUP BY " + sqlGroupBy;
        // sqlSelectFrom += " ORDER BY " + sqlGroupBy;
        return sqlSelectFrom;
    }

    /**
     * Insert new locations.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param bldgFloors building floors
     */
    private void insertLocations(final SpaceBudget spaceBudget, final String sumAllocation,
            final Map<String, List<String>> bldgFloors) {
        String customRestriction =
                " AND NOT EXISTS(SELECT sb_items.auto_number FROM sb_items WHERE sb_items.sb_name = "
                        + SqlUtils.formatValueForSql(spaceBudget.getName());
        String restriction = "";
        if (Constants.SB_LEVEL_BU.equals(spaceBudget.getLevel())) {
            restriction =
                    "( sb_items.bu_id = dv.bu_id OR (sb_items.bu_id IS NULL AND dv.bu_id IS NULL))";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudget.getLevel())
                || Constants.SB_LEVEL_FG.equals(spaceBudget.getLevel())) {
            restriction =
                    "( sb_items.dp_id = rm.dp_id OR (sb_items.dp_id IS NULL AND rm.dp_id IS NULL))";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudget.getLevel())) {
            restriction =
                    "( sb_items.dv_id = rm.dv_id OR (sb_items.dv_id IS NULL AND rm.dv_id IS NULL))";
        }
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            restriction += " AND sb_items.bl_id = rm.bl_id ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            restriction += " AND sb_items.bl_id = rm.bl_id AND sb_items.fl_id = rm.fl_id";
        }

        if (Constants.ROOM_AS_STANDARD.equals(spaceBudget.getCreatedAs())) {
            restriction += " AND sb_items.rm_std =  rm.rm_std";
        } else if (Constants.EM_AS_HEADCOUNT.equals(spaceBudget.getCreatedAs())) {
            restriction =
                    restriction.replaceAll(RM_TABLE_PATTERN, Constants.TABLE_EM + Constants.DOT);
        }
        customRestriction += "AND " + restriction + Constants.PARANTHESIS_CLOSE;

        createBaseline(spaceBudget, sumAllocation, bldgFloors, customRestriction);
    }

    /**
     * Create space requirements baseline.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param bldgFloors building floors
     * @param customRestriction custom restriction
     */
    private void createBaseline(final SpaceBudget spaceBudget, final String sumAllocation,
            final Map<String, List<String>> bldgFloors, final String customRestriction) {

        String sqlStatement = getInsertIntoStatement(spaceBudget.getLevel(), sumAllocation);
        String sqlGroupBy = getGroupByFields(spaceBudget.getLevel(), sumAllocation);
        String sqlRestriction = getSqlRestriction(bldgFloors, spaceBudget.getLevel());
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        final String baselineLocations = projectRequirementHelper.getBaselineLocations(bldgFloors);
        if (Constants.ROOM_AS_AREAS.equals(spaceBudget.getCreatedAs())) {
            sqlStatement += getSelectForAreas(spaceBudget.getName(), spaceBudget.getLevel(),
                sumAllocation, baselineLocations);
        } else if (Constants.ROOM_AS_STANDARD.equals(spaceBudget.getCreatedAs())) {
            sqlStatement += getSelectForStandards(spaceBudget.getName(), spaceBudget.getLevel(),
                sumAllocation, baselineLocations);
            sqlGroupBy += ", rmstd.rm_std";
        } else if (Constants.EM_AS_HEADCOUNT.equals(spaceBudget.getCreatedAs())) {
            sqlStatement =
                    sqlStatement.replaceAll(RM_TABLE_PATTERN, Constants.TABLE_EM + Constants.DOT);
            sqlStatement += getSelectForHeadcounts(spaceBudget.getName(), spaceBudget.getLevel(),
                sumAllocation, baselineLocations);
            sqlRestriction =
                    sqlRestriction.replaceAll(RM_TABLE_PATTERN, Constants.TABLE_EM + Constants.DOT);
            // KB3049006 - rewrite invalid rm_cat restriction for em table resulted from replacing
            // 'rm.' with 'em.'
            sqlRestriction =
                    sqlRestriction.replace(RM_RMCAT_RESTRICTION.replaceAll(RM_TABLE_PATTERN,
                        Constants.TABLE_EM + Constants.DOT), EM_RMCAT_RESTRICTION);

            sqlGroupBy =
                    sqlGroupBy.replaceAll(RM_TABLE_PATTERN, Constants.TABLE_EM + Constants.DOT);
        }

        sqlStatement += "  WHERE " + sqlRestriction;
        sqlStatement += customRestriction;
        sqlStatement += "  GROUP BY " + sqlGroupBy;
        sqlStatement += "  ORDER BY " + sqlGroupBy;

        SqlUtils.executeUpdate(Constants.TABLE_SB_ITEMS, sqlStatement);

    }

    /**
     * Create sql statement for room as areas case.
     *
     * @param spaceBudgetName space budget name
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summ allocation
     * @param baselineLocations baseline locations
     * @return string
     */
    private String getSelectForAreas(final String spaceBudgetName, final String spaceBudgetLevel,
            final String sumAllocation, final String baselineLocations) {
        String selectFromSql =
                " SELECT  "
                        + (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)
                                ? "  NULL ${sql.as} fg_title,  " : "")
                + getGroupByFields(spaceBudgetLevel, sumAllocation);
        selectFromSql += ", SUM(rm.area), SUM(rm.area), MAX(rmstd.rm_std), MAX(rmstd.std_area), "
                + SqlUtils.formatValueForSql(spaceBudgetName)
                + ", MAX(rmstd.cost_of_space), MAX(rmstd.cost_of_furn), MAX(rmstd.cost_of_move), MAX(rmstd.std_em),"
                + SqlUtils.formatValueForSql(baselineLocations) + "  FROM rm ";
        selectFromSql += " LEFT OUTER JOIN dv ON dv.dv_id = rm.dv_id ";
        final String roomStandard = getRoomStandard();
        selectFromSql += "LEFT OUTER JOIN rmstd ON rmstd.rm_std = "
                + SqlUtils.formatValueForSql(roomStandard);
        return selectFromSql;
    }

    /**
     * Create sql statement for room as standards case.
     *
     * @param spaceBudgetName space budget name
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summ allocation
     * @param baselineLocations baseline locations
     * @return string
     */
    private String getSelectForStandards(final String spaceBudgetName,
            final String spaceBudgetLevel, final String sumAllocation,
            final String baselineLocations) {
        final String roomStandard = getRoomStandard();
        String selectFromSql =
                " SELECT "
                        + (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)
                                ? " NULL ${sql.as} fg_title, " : "")
                + getGroupByFields(spaceBudgetLevel, sumAllocation);
        selectFromSql += ", (CASE WHEN rmstd.rm_std = " + SqlUtils.formatValueForSql(roomStandard)
                + " THEN SUM(rm.area) ELSE COUNT(rm.rm_std) END), (CASE WHEN rmstd.rm_std = "
                + SqlUtils.formatValueForSql(roomStandard)
                + " THEN SUM(rm.area) ELSE COUNT(rm.rm_std) END), MAX(rmstd.rm_std), MAX(rmstd.std_area), "
                + SqlUtils.formatValueForSql(spaceBudgetName)
                + ", MAX(rmstd.cost_of_space), MAX(rmstd.cost_of_furn),MAX(rmstd.cost_of_move), MAX(rmstd.std_em), "
                + SqlUtils.formatValueForSql(baselineLocations) + " FROM rm ";
        selectFromSql += "LEFT OUTER JOIN dv ON dv.dv_id = rm.dv_id ";
        selectFromSql +=
                "LEFT OUTER JOIN rmstd ON rmstd.rm_std = (CASE WHEN rm.rm_std IS NOT NULL THEN rm.rm_std ELSE "
                        + SqlUtils.formatValueForSql(roomStandard) + " END)";
        return selectFromSql;
    }

    /**
     * Create sql statement for employee as headcount case.
     *
     * @param spaceBudgetName space budget name
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summ allocation
     * @param baselineLocations baseline locations
     * @return string
     */
    private String getSelectForHeadcounts(final String spaceBudgetName,
            final String spaceBudgetLevel, final String sumAllocation,
            final String baselineLocations) {
        String selectFromSql = "  SELECT  "
                + (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel) ? " NULL ${sql.as} fg_title,  "
                        : "")
                + getGroupByFields(spaceBudgetLevel, sumAllocation).replaceAll(
                    Constants.TABLE_ROOM + Constants.DOT, Constants.TABLE_EM + Constants.DOT);

        selectFromSql +=
                ", COUNT(em.em_id), COUNT(em.em_id), MAX(rmstd.rm_std), MAX(rmstd.std_area), "
                        + SqlUtils.formatValueForSql(spaceBudgetName)
                        + ", MAX(rmstd.cost_of_space), MAX(rmstd.cost_of_furn), MAX(rmstd.cost_of_move), MAX(rmstd.std_em), "
                        + SqlUtils.formatValueForSql(baselineLocations) + " FROM em ";

        selectFromSql += " LEFT OUTER JOIN dv ON dv.dv_id = em.dv_id ";
        selectFromSql += " LEFT OUTER JOIN rmstd ON rmstd.rm_std = "
                + SqlUtils.formatValueForSql(Constants.RMSTD_PEOPLE);

        return selectFromSql;
    }

    /**
     * Get insert into sql statement.
     *
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summarize allocation
     * @return string
     */
    private String getInsertIntoStatement(final String spaceBudgetLevel,
            final String sumAllocation) {
        String sqlStatement = "INSERT INTO sb_items ( ";

        if (Constants.SB_LEVEL_BU.equals(spaceBudgetLevel)) {
            sqlStatement += "bu_id, ";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudgetLevel)) {
            sqlStatement += "bu_id, dv_id, ";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            sqlStatement += "bu_id, dv_id, dp_id, ";
        } else if (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            sqlStatement += "fg_title, bu_id, dv_id, dp_id, ";
        }
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            sqlStatement += "bl_id, ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            sqlStatement += "bl_id, fl_id, ";
        }
        sqlStatement +=
                "p00_value, p01_value, rm_std, rm_std_area, sb_name, cost_of_space, cost_of_furn, cost_of_move, unit_headcount, baseline_locations)";
        return sqlStatement;
    }

    /**
     * Get group by fields.
     *
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summarize allocation
     * @return string
     */
    private String getGroupByFields(final String spaceBudgetLevel, final String sumAllocation) {
        String result = "";

        if (Constants.SB_LEVEL_BU.equals(spaceBudgetLevel)) {
            result = "dv.bu_id";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudgetLevel)) {
            result = "dv.bu_id, rm.dv_id";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            result = "dv.bu_id, rm.dv_id , rm.dp_id";
        } else if (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            result = "dv.bu_id, rm.dv_id, rm.dp_id";
        }

        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            result += ", rm.bl_id";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            result += ", rm.bl_id, rm.fl_id";
        }
        return result;
    }

    /**
     * Create select from for update locations.
     *
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summarize allocation
     * @return string
     */
    private String getSelectFrom(final String spaceBudgetLevel, final String sumAllocation) {
        String result = "";

        if (Constants.SB_LEVEL_BU.equals(spaceBudgetLevel)) {
            result = "dv.bu_id ${sql.as} bu_id ";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudgetLevel)) {
            result = "dv.bu_id ${sql.as} bu_id, rm.dv_id ${sql.as} dv_id ";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            result = "dv.bu_id ${sql.as} bu_id , rm.dv_id ${sql.as} dv_id, rm.dp_id ${sql.as} dp_id ";
        } else if (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            result = "dv.bu_id ${sql.as} bu_id, rm.dv_id ${sql.as} dv_id, rm.dp_id ${sql.as} dp_id ";
        }
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            result += ", rm.bl_id  ${sql.as} bl_id ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            result += ", rm.bl_id  ${sql.as} bl_id , rm.fl_id  ${sql.as} fl_id ";
        }
        return result;
    }

    /**
     * Get join condition on group field and buffer table.
     *
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summarize allocation
     * @return string
     */
    private String getJoinOnGroupField(final String spaceBudgetLevel, final String sumAllocation) {
        String result = "";
        if (Constants.SB_LEVEL_BU.equals(spaceBudgetLevel)) {
            result = "( sb_items.bu_id = tmp_buffer.bu_id OR (sb_items.bu_id IS NULL AND tmp_buffer.bu_id IS NULL))";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudgetLevel)) {
            result = "((sb_items.dv_id = tmp_buffer.dv_id) "
                    + "OR (sb_items.dv_id IS NULL AND tmp_buffer.dv_id IS NULL))";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            result = "((sb_items.dv_id = tmp_buffer.dv_id AND sb_items.dp_id = tmp_buffer.dp_id)"
                    + " OR (sb_items.dp_id IS NULL AND tmp_buffer.dp_id IS NULL))";
        } else if (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            result = "((sb_items.dv_id = tmp_buffer.dv_id AND sb_items.dp_id = tmp_buffer.dp_id) "
                    + "OR (sb_items.dp_id IS NULL AND tmp_buffer.dp_id IS NULL))";
        }

        result += " AND " + getJoinConditionOnBuffer(sumAllocation, Constants.TABLE_SB_ITEMS);
        return result;
    }

    /**
     * Get join condition on buffer table.
     *
     *
     * @param sumAllocation summ allocation
     * @param aliasName table name or table alias
     * @return String
     */
    private String getJoinConditionOnBuffer(final String sumAllocation, final String aliasName) {
        String result = " 1=1 ";
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            result = aliasName + ".bl_id = tmp_buffer.bl_id ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            result = aliasName + ".bl_id = tmp_buffer.bl_id AND " + aliasName
                    + ".fl_id = tmp_buffer.fl_id";
        }
        return result;
    }

    /**
     * Get sql restriction for selected building and floors.
     *
     * @param bldgFloors selected floors
     * @param spaceBudgetLevel space budget level
     * @return string
     */
    private String getSqlRestriction(final Map<String, List<String>> bldgFloors,
            final String spaceBudgetLevel) {
        String result = "";

        final Iterator<String> keys = bldgFloors.keySet().iterator();
        while (keys.hasNext()) {
            final String blId = keys.next();
            final List<String> floors = bldgFloors.get(blId);
            for (int index = 0; index < floors.size(); index++) {
                final String flId = floors.get(index);
                result += "OR (rm.bl_id = " + SqlUtils.formatValueForSql(blId) + " AND rm.fl_id = "
                        + SqlUtils.formatValueForSql(flId) + " ) ";
            }
        }
        if (result.length() > 0) {
            if (result.indexOf(Constants.OPERATOR_OR) == 0) {
                result = result.substring(Constants.OPERATOR_OR.length());
            }
        } else {
            result = "1=1";
        }
        result = Constants.PARANTHESIS_OPEN + result + Constants.PARANTHESIS_CLOSE;
        if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            result = " rm.dv_id IS NOT NULL  AND " + result;
        } else {
            result = "(rm.dv_id IS NOT NULL AND rm.dp_id IS NOT NULL)  AND " + result;
        }
        // add rmcat restriction
        result = RM_RMCAT_RESTRICTION + Constants.OPERATOR_AND + result;

        return Constants.PARANTHESIS_OPEN + result + Constants.PARANTHESIS_CLOSE;
    }

    /**
     * Return room standard.
     *
     * @return String
     */
    private String getRoomStandard() {
        String rmStd = Constants.RMSTD_UNIT_IMPERIAL;
        if (Units.Metric.equals(ContextStore.get().getProject().getUnits())) {
            rmStd = Constants.RMSTD_UNIT_METRIC;
        }
        return rmStd;
    }
}
