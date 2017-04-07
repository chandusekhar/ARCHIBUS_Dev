package com.archibus.eventhandler.eam.requirements;

import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.eam.domain.SpaceBudget;

/**
 * Provides methods to create / add furniture requirements.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 *        <p>
 *        Suppress PMD warning "AvoidUsingSql" in this class.
 *        <p>
 *        Justification: Case #2.1: Statement with INSERT ... SELECT pattern. Case #2.2: Statement
 *        with UPDATE ... SELECT pattern.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class FurnitureRequirements {
    /**
     * Create equipment requirements baseline.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param bldgFloors building floors
     */
    public void createBaseline(final SpaceBudget spaceBudget, final String sumAllocation,
            final Map<String, List<String>> bldgFloors) {
        createBaseline(spaceBudget, sumAllocation, bldgFloors, "");
        addIndividualFurniture(spaceBudget, sumAllocation, bldgFloors);
    }

    /**
     * Add new locations to current budget item.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param updateRequirements if requirements must be updated
     * @param bldgFloors new locations
     */
    public void addLocation(final SpaceBudget spaceBudget, final String sumAllocation,
            final boolean updateRequirements, final Map<String, List<String>> bldgFloors) {
        updateLocations(spaceBudget, sumAllocation, updateRequirements, bldgFloors);
        // add new items
        insertLocations(spaceBudget, sumAllocation, bldgFloors);

        addIndividualFurniture(spaceBudget, sumAllocation, bldgFloors);
    }

    /**
     * Create equipment requirements baseline.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param bldgFloors building floors
     * @param customRestriction custom sql restriction
     */
    private void createBaseline(final SpaceBudget spaceBudget, final String sumAllocation,
            final Map<String, List<String>> bldgFloors, final String customRestriction) {
        String sqlByCountStatement =
                getInsertIntoByStandardStatement(spaceBudget.getLevel(), sumAllocation);
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        final String baselineLocations = projectRequirementHelper.getBaselineLocations(bldgFloors);
        sqlByCountStatement += getSelectByStandardCount(spaceBudget.getName(),
            spaceBudget.getLevel(), sumAllocation, baselineLocations);
        final String sqlRestriction = getSqlRestriction(bldgFloors, spaceBudget.getLevel());
        sqlByCountStatement += " WHERE ta.fn_std IS NOT NULL AND " + sqlRestriction;
        sqlByCountStatement += customRestriction;
        final String sqlGroupBy = getGroupByFields(spaceBudget.getLevel(), sumAllocation);
        sqlByCountStatement += " GROUP BY " + sqlGroupBy + ",  ta.fn_std ";
        sqlByCountStatement += " ORDER BY " + sqlGroupBy + ", ta.fn_std ";

        SqlUtils.executeUpdate("sb_items", sqlByCountStatement);
    }

    /**
     * Get select for furniture by standard count requirements.
     *
     * @param spaceBudgetName space budget name
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation sum allocation
     * @param baselineLocations baseline locations
     * @return string
     */
    private String getSelectByStandardCount(final String spaceBudgetName,
            final String spaceBudgetLevel, final String sumAllocation,
            final String baselineLocations) {
        String selectFromSql =
                "  SELECT  "
                        + (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)
                                ? "  NULL ${sql.as} fg_title,  " : "")
                + getGroupByFields(spaceBudgetLevel, sumAllocation);
        selectFromSql +=
                ", COUNT(ta.fn_std), COUNT(ta.fn_std), MAX(ta.fn_std), MAX(fnstd.depth * fnstd.width), "
                        + SqlUtils.formatValueForSql(spaceBudgetName)
                        + ", MAX(fnstd.price), MAX(fnstd.cost_moving), "
                        + SqlUtils.formatValueForSql(baselineLocations)
                        + " FROM (SELECT ta.ta_id ${sql.as} ta_id, ta.fn_std ${sql.as} fn_std, ta.bl_id ${sql.as} bl_id, "
                        + " ta.fl_id ${sql.as} fl_id, ta.rm_id ${sql.as} rm_id,"
                        + " (CASE WHEN ta.dv_id IS NULL THEN rm.dv_id ELSE ta.dv_id END) ${sql.as} dv_id, "
                        + " (CASE WHEN ta.dp_id IS NULL THEN rm.dp_id ELSE ta.dp_id END) ${sql.as} dp_id "
                        + " FROM ta LEFT OUTER JOIN  rm ON ta.bl_id = rm.bl_id AND ta.fl_id = rm.fl_id AND ta.rm_id = rm.rm_id) ${sql.as} ta "
                        + " LEFT OUTER JOIN fnstd ON fnstd.fn_std = ta.fn_std ";

        selectFromSql += " LEFT OUTER JOIN dv ON dv.dv_id = ta.dv_id ";

        return selectFromSql;
    }

    /**
     * Get insert into sql statement.
     *
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summarize allocation
     * @return string
     */
    private String getInsertIntoByStandardStatement(final String spaceBudgetLevel,
            final String sumAllocation) {
        String sqlStatement = "INSERT INTO sb_items( ";

        if (Constants.SB_LEVEL_BU.equals(spaceBudgetLevel)) {
            sqlStatement += " bu_id, ";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudgetLevel)) {
            sqlStatement += " bu_id, dv_id, ";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            sqlStatement += " bu_id, dv_id, dp_id, ";
        } else if (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            sqlStatement += "fg_title,  bu_id, dv_id, dp_id, ";
        }
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            sqlStatement += " bl_id, ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            sqlStatement += " bl_id, fl_id, ";
        }
        sqlStatement +=
                "p00_value, p01_value, fn_std, unit_area, sb_name, cost_of_furn, cost_of_move, baseline_locations)";
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
            result = "dv.bu_id, ta.dv_id";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            result = "dv.bu_id, ta.dv_id, ta.dp_id";
        } else if (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            result = "dv.bu_id , ta.dv_id, ta.dp_id";
        }
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            result += ", ta.bl_id";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            result += ", ta.bl_id, ta.fl_id";
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
                result += "OR (ta.bl_id = " + SqlUtils.formatValueForSql(blId) + " AND ta.fl_id = "
                        + SqlUtils.formatValueForSql(flId) + ") ";
            }
        }
        if (result.length() > 0 && result.indexOf(Constants.OPERATOR_OR) == 0) {
            result = result.substring(Constants.OPERATOR_OR.length());
        }
        result = Constants.PARANTHESIS_OPEN + result + Constants.PARANTHESIS_CLOSE;

        String rmRestricton =
                "EXISTS(SELECT rm.rm_id FROM rm WHERE ta.rm_id = rm.rm_id AND ta.fl_id = rm.fl_id AND ta.bl_id = rm.bl_id AND ";
        if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            rmRestricton += " rm.dv_id IS NOT NULL  AND ";
        } else {
            rmRestricton += "(rm.dv_id IS NOT NULL AND rm.dp_id IS NOT NULL)  AND ";
        }
        // add rmcat restriction
        rmRestricton +=
                "EXISTS(SELECT rmcat.rm_cat FROM rmcat WHERE rmcat.supercat = 'USBL' AND rmcat.rm_cat = rm.rm_cat))";
        result = rmRestricton + Constants.OPERATOR_AND + result;
        return Constants.PARANTHESIS_OPEN + result + Constants.PARANTHESIS_CLOSE;
    }

    /**
     * Add individual furniture to budget item.
     *
     * @param spaceBudget space budget
     * @param sumAllocation summ allocation
     * @param bldgFloors building floors
     */
    private void addIndividualFurniture(final SpaceBudget spaceBudget, final String sumAllocation,
            final Map<String, List<String>> bldgFloors) {
        final String sqlRestriction = getSqlRestriction(bldgFloors, spaceBudget.getLevel());

        String sqlIndividualStatement =
                getInsertIntoForIndividualStatement(spaceBudget.getLevel(), sumAllocation);
        sqlIndividualStatement += getSelectForIndividual(spaceBudget.getName(),
            spaceBudget.getLevel(), sumAllocation);
        sqlIndividualStatement += " WHERE ta.fn_std IS NULL AND " + sqlRestriction;

        SqlUtils.executeUpdate("eq_req_items", sqlIndividualStatement);
    }

    /**
     * Get insert into sql statement.
     *
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation summarize allocation
     * @return string
     */
    private String getInsertIntoForIndividualStatement(final String spaceBudgetLevel,
            final String sumAllocation) {
        String sqlStatement = "INSERT INTO eq_req_items ( ";

        if (Constants.SB_LEVEL_BU.equals(spaceBudgetLevel)) {
            sqlStatement += "bu_id, ";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudgetLevel)) {
            sqlStatement += "bu_id, dv_id, ";
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)) {
            sqlStatement += "bu_id, dv_id, dp_id, ";
        } else if (Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            sqlStatement += "bu_id , dv_id, dp_id, ";
        }

        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            sqlStatement += "bl_id, ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            sqlStatement += "bl_id, fl_id, ";
        }
        sqlStatement += "site_id, sb_name, cost_est_baseline, rm_id, ta_id)";
        return sqlStatement;
    }

    /**
     * Get select for individual furniture requirements.
     *
     * @param spaceBudgetName space budget name
     * @param spaceBudgetLevel space budget level
     * @param sumAllocation sum allocation
     * @return string
     */
    private String getSelectForIndividual(final String spaceBudgetName,
            final String spaceBudgetLevel, final String sumAllocation) {
        String selectFromSql = " SELECT  " + getGroupByFields(spaceBudgetLevel, sumAllocation);
        selectFromSql += ", bl.site_id, " + SqlUtils.formatValueForSql(spaceBudgetName)
                + ", ta.value_original, ta.rm_id, ta.ta_id FROM "
                + " (SELECT ta.ta_id ${sql.as} ta_id, ta.fn_std ${sql.as} fn_std, "
                + " ta.bl_id ${sql.as} bl_id, ta.fl_id ${sql.as} fl_id, ta.rm_id ${sql.as} rm_id, "
                + " (CASE WHEN (ta.dv_id IS NULL OR ta.dp_id IS NULL) THEN rm.dv_id ELSE ta.dv_id END) ${sql.as} dv_id,  "
                + " (CASE WHEN (ta.dv_id IS NULL OR ta.dp_id IS NULL) THEN rm.dp_id ELSE ta.dp_id END) ${sql.as} dp_id,ta.value_original ${sql.as} value_original "
                + " FROM ta LEFT OUTER JOIN rm ON ta.bl_id = rm.bl_id AND ta.fl_id = rm.fl_id AND ta.rm_id = rm.rm_id) ${sql.as} ta "
                + " LEFT OUTER JOIN bl ON bl.bl_id = ta.bl_id ";

        selectFromSql += "LEFT OUTER JOIN dv ON dv.dv_id = ta.dv_id ";

        return selectFromSql;
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

        final String sqlGroupBy = getGroupByFields(spaceBudget.getLevel(), sumAllocation);
        final String sqlRestriction = getSqlRestriction(bldgFloors, spaceBudget.getLevel());
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        final String baselineLocations = projectRequirementHelper.getBaselineLocations(bldgFloors);
        String sqlSelectFrom = "SELECT "
                + (Constants.SB_LEVEL_FG.equals(spaceBudget.getLevel())
                        ? " NULL ${sql.as} fg_title, " : "")
                + getSelectFrom(spaceBudget.getLevel(), sumAllocation);

        sqlSelectFrom +=
                ", COUNT(ta.fn_std) ${sql.as} p00_value, COUNT(ta.fn_std) ${sql.as} p01_value "
                        + " FROM "
                        + "( SELECT ta.ta_id ${sql.as} ta_id, ta.fn_std ${sql.as} fn_std, ta.bl_id ${sql.as} bl_id, "
                        + " ta.fl_id ${sql.as} fl_id, ta.rm_id ${sql.as} rm_id, "
                        + " (CASE  WHEN (ta.dv_id IS NULL OR ta.dp_id IS NULL) THEN rm.dv_id ELSE ta.dv_id END) ${sql.as} dv_id,  "
                        + " (CASE  WHEN (ta.dv_id IS NULL OR ta.dp_id IS NULL) THEN rm.dp_id ELSE ta.dp_id END) ${sql.as} dp_id,"
                        + " ta.value_original ${sql.as} value_original FROM ta "
                        + " LEFT OUTER JOIN rm ON ta.bl_id = rm.bl_id AND ta.fl_id = rm.fl_id "
                        + " AND ta.rm_id = rm.rm_id) ${sql.as} ta LEFT OUTER JOIN  fnstd ON fnstd.fn_std = ta.fn_std ";

        sqlSelectFrom += " LEFT OUTER JOIN  dv ON dv.dv_id = ta.dv_id ";
        sqlSelectFrom += " WHERE  ta.fn_std IS NOT NULL AND " + sqlRestriction;
        sqlSelectFrom += " GROUP BY  " + sqlGroupBy + ", ta.fn_std";
        // sqlSelectFrom += " ORDER BY " + sqlGroupBy + " , ta.fn_std ";
        String sqlUpdate = "";
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
            innerSelect += " AND sb_items.eq_std  = tmp_buffer.fn_std ";

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
            sqlUpdate += " AND sb_items.fn_std = tmp_buffer.fn_std ";
        }
        SqlUtils.executeUpdate(Constants.TABLE_SB_ITEMS, sqlUpdate);
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
        } else if (Constants.SB_LEVEL_DP.equals(spaceBudgetLevel)
                || Constants.SB_LEVEL_FG.equals(spaceBudgetLevel)) {
            result = "ta.dv_id ${sql.as} dv_id, ta.dp_id ${sql.as} dp_id";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudgetLevel)) {
            result = "ta.dv_id ${sql.as} dv_id ";
        }
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            result += ", ta.bl_id  ${sql.as} bl_id ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            result += ", ta.bl_id  ${sql.as} bl_id , ta.fl_id  ${sql.as} fl_id ";
        }
        result += ", ta.fn_std ${sql.as} fn_std ";
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
                    "( sb_items.dp_id = ta.dp_id OR (sb_items.dp_id IS NULL AND ta.dp_id IS NULL))";
        } else if (Constants.SB_LEVEL_DV.equals(spaceBudget.getLevel())) {
            restriction =
                    "( sb_items.dv_id = ta.dv_id OR (sb_items.dv_id IS NULL AND ta.dv_id IS NULL))";
        }
        if (Constants.SUM_ALLOC_BL.equals(sumAllocation)) {
            restriction += " AND sb_items.bl_id = ta.bl_id ";
        } else if (Constants.SUM_ALLOC_FL.equals(sumAllocation)) {
            restriction += " AND sb_items.bl_id = ta.bl_id AND sb_items.fl_id = ta.fl_id";
        }
        restriction += " AND sb_items.fn_std = ta.fn_std ";

        customRestriction += "AND " + restriction + " ) ";
        createBaseline(spaceBudget, sumAllocation, bldgFloors, customRestriction);
    }
}
