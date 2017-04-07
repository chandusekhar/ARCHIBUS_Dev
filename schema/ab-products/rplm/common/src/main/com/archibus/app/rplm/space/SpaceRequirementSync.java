package com.archibus.app.rplm.space;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.rplm.GroupSpaceAllocationHandlers;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.*;

/**
 * Class Sync Space Requirements.
 *
 * Added for 22.1 Space and Portfolio Planing - Sync Space Requirements.
 *
 * @author ASC-BJ:Zhang Yi
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class SpaceRequirementSync {

    /**
     * Table name 'gp'.
     *
     */
    private static final String GP_TABLE = "gp";

    /**
     * Table name 'sb_items'.
     *
     */
    private static final String SB_ITEMS = "sb_items";

    /**
     * Table-field name 'gp.gp_id'.
     *
     */
    private static final String GP_GP_ID = "gp.gp_id";

    /**
     * Table-field name 'gp.planning_bu_id'.
     *
     */
    private static final String GP_BU_ID = "gp.planning_bu_id";

    /**
     * Table-field name 'gp.dv_id'.
     *
     */
    private static final String GP_DV_ID = "gp.dv_id";

    /**
     * Table-field name 'gp.dp_id'.
     *
     */
    private static final String GP_DP_ID = "gp.dp_id";

    /**
     * Table-field name 'gp.bl_id'.
     *
     */
    private static final String GP_BL_ID = "gp.bl_id";

    /**
     * Table-field name 'gp.fl_id'.
     *
     */
    private static final String GP_FL_ID = "gp.fl_id";

    /**
     * Table-field name 'gp.gp_function'.
     *
     */
    private static final String GP_GP_FUNCTION = "gp.gp_function";

    /**
     * size of field 'gp.gp_function'.
     *
     */
    private static final int GP_FUNCTION_SIZE = 25;

    /**
     * Table-field name 'gp.area_manual'.
     *
     */
    private static final String GP_AREA_MANUAL = "gp.area_manual";

    /**
     * Table-field name 'gp.count_em'.
     *
     */
    private static final String GP_COUNT_EM = "gp.count_em";

    /**
     * Table-field name 'gp.date_end'.
     *
     */
    private static final String GP_DATE_END = "gp.date_end";

    /**
     * Table-field name 'sb_items.p01_value'.
     *
     */
    private static final String SB_ITEMS_P01 = "sb_items.p01_value";

    /**
     * Table-field name 'sb_items.rm_std_area'.
     *
     */
    private static final String SB_ITEMS_RM_STD_AREA = "sb_items.rm_std_area";

    /**
     * Table-field name 'sb_items.unit_headcount'.
     *
     */
    private static final String SB_ITEMS_UNIT_HEADCOUNT = "sb_items.unit_headcount";

    /**
     * Table-field name 'sb_items.fg_title'.
     *
     */
    private static final String SB_ITEMS_FG_TITLE = "sb_items.fg_title";

    /**
     * Table-field name 'sb_items.dv_id'.
     *
     */
    private static final String SB_ITEMS_DV_ID = "sb_items.dv_id";

    /**
     * Field name 'date_start'.
     *
     */
    private static final String DATE_START = "date_start";

    /**
     * Table-field name 'sb_items.dp_id'.
     *
     */
    private static final String SB_ITEMS_DP_ID = "sb_items.dp_id";

    /**
     * Table-field name 'sb_items.bl_id'.
     *
     */
    private static final String SB_ITEMS_BL_ID = "sb_items.bl_id";

    /**
     * Table-field name 'sb_items.fl_id'.
     *
     */
    private static final String SB_ITEMS_FL_ID = "sb_items.fl_id";

    /**
     * Field name 'gp_id'.
     *
     */
    private static final String GP_ID = "gp_id";

    /**
     * Field name 'planning_bu_id'.
     *
     */
    private static final String PLANING_BU_ID = "planning_bu_id";

    /**
     * Default date format.
     *
     */
    private static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";

    /**
     * Default allocation type of gp's available area.
     *
     */
    private static final String DEFAULT_GP_ALLOC_TYPE = "Allocated Area";

    /**
     * String "'".
     *
     */
    private static final String LEFT_SINGLE_QUOTE = "'";

    /**
     * Current Space Requirement's sb_name.
     *
     */
    private final String sbName;

    /**
     * Current Scenario's id.
     *
     */
    private final String scenarioId;

    /**
     * Event name.
     *
     */
    private final String eventName;

    /**
     * Start Date.
     *
     */
    private final String startDate;

    /**
     * Current user's unit title.
     *
     */

    private final String unitTitle;

    /**
     * Current scenario's start date.
     *
     */

    private final Date scenarioStartDate;

    /**
     * List of newly added group records.
     *
     */
    private final List<DataRecord> newGroups = new ArrayList<DataRecord>();

    /**
     * List of newly added group records.
     *
     */
    private final List<DataRecord> sbItemsOfCurrentGroup = new ArrayList<DataRecord>();

    /**
     * Group record that is present.
     *
     */
    private DataRecord currentNewGroup;

    /**
     * Indicate if current group contains sb_items with same fg_title but different organization.
     *
     */
    private boolean sameFgTitleDifferentOrg;

    /**
     * Indicate if current group contains sb_items with same fg_title but different location.
     *
     */
    private boolean sameFgTitleDifferentLoc;

    /**
     * Constructor.
     *
     * @param sbName String Space Requirement Name (sb.sb_name)
     * @param scenarioId String Portfolio Scenatio Id
     * @param eventName String Event Name
     * @param startDate String Start date
     * @param unitTitle String current user's unit's title
     */
    public SpaceRequirementSync(final String sbName, final String scenarioId,
            final String eventName, final String startDate, final String unitTitle) {

        super();

        this.sbName = sbName;
        this.scenarioId = scenarioId;
        this.eventName = eventName;
        this.startDate = startDate;
        this.unitTitle = unitTitle;

        this.scenarioStartDate = DataSourceFactory
            .createDataSourceForFields("portfolio_scenario", new String[] { DATE_START })
            .getRecord("scn_name='" + this.sbName + LEFT_SINGLE_QUOTE)
            .getDate("portfolio_scenario.date_start");

    }

    /**
     * Create groups for given Space Requirement, portfolio scenario and user selected and entered
     * periods data.
     *
     */
    public void startSync() {

        this.copyGpIds();

        this.calculateLinkGpAreas();

        this.insertGps();
    }

    /**
     * Search for sb_items that do not have a gp_id. For those items, check to see if it has the
     * same organization, building, and floor as other items that already have a gp_id. o If so,
     * copy the gp_id to those sb_items records.
     *
     *
     */
    private void copyGpIds() {

        final StringBuilder sql = new StringBuilder();

        sql.append(" UPDATE sb_items SET sb_items.gp_id= (");
        sql.append("         SELECT max(s1.gp_id) FROM sb_items ${sql.as} s1 ");
        sql.append("         WHERE ((s1.bu_id is null and sb_items.bu_id is null  ");
        sql.append(
            "             or s1.bu_id is not null and sb_items.bu_id is not null and  s1.bu_id=sb_items.bu_id)");
        sql.append(
            "            and (s1.dv_id is null and sb_items.dv_id is null or s1.dv_id is not null and sb_items.dv_id is not null and  s1.dv_id=sb_items.dv_id)  ");
        sql.append(
            "            and (s1.dp_id is null and sb_items.dp_id is null or s1.dp_id is not null and sb_items.dp_id is not null and  s1.dp_id=sb_items.dp_id)  ");
        sql.append(
            "            and (s1.bl_id is null and sb_items.bl_id is null or s1.bl_id is not null and sb_items.bl_id is not null and  s1.bl_id=sb_items.bl_id)  ");
        sql.append(
            "            and (s1.fl_id is null and sb_items.fl_id is null or s1.fl_id is not null and sb_items.fl_id is not null and  s1.fl_id=sb_items.fl_id)  ");
        sql.append(
            "            or s1.fg_title is not null and sb_items.fg_title is not null and s1.fg_title=sb_items.fg_title)  ");
        sql.append("            and s1.gp_id is not null ");
        sql.append("            and s1.sb_name='" + this.sbName + "'  ) ");
        sql.append(" WHERE  sb_items.gp_id is null and sb_items.sb_name='" + this.sbName
                + LEFT_SINGLE_QUOTE);
        sql.append("        AND  EXISTS ( select 1 from sb_items ${sql.as} s2   ");
        sql.append("                 where ( (s2.bu_id is null and sb_items.bu_id is null"
                + "                          or s2.bu_id is not null and sb_items.bu_id is not null and  s2.bu_id=sb_items.bu_id)");
        sql.append(
            "                    and (s2.dv_id is null and sb_items.dv_id is null or s2.dv_id is not null and sb_items.dv_id is not null and  s2.dv_id=sb_items.dv_id)  ");
        sql.append(
            "                    and (s2.dp_id is null and sb_items.dp_id is null or s2.dp_id is not null and sb_items.dp_id is not null and  s2.dp_id=sb_items.dp_id)  ");
        sql.append(
            "                    and (s2.bl_id is null and sb_items.bl_id is null or s2.bl_id is not null and sb_items.bl_id is not null and  s2.bl_id=sb_items.bl_id)  ");
        sql.append(
            "                    and (s2.fl_id is null and sb_items.fl_id is null or s2.fl_id is not null and sb_items.fl_id is not null and  s2.fl_id=sb_items.fl_id)  ");
        sql.append(
            "                    or s2.fg_title is not null and sb_items.fg_title is not null and s2.fg_title=sb_items.fg_title)  ");
        sql.append("                    and s2.gp_id is not null ");
        sql.append("                    and s2.sb_name='" + this.sbName + "'  )  ");

        SqlUtils.executeUpdate(SB_ITEMS, sql.toString());
    }

    /**
     * Recalculate the area all the linked groups. Set gp.area_manual = sum of (p01_value multiplied
     * by rm_std_area) for all sb_items records where sb_items.gp_id = gp.gp_id.
     */
    private void calculateLinkGpAreas() {

        final StringBuilder sql = new StringBuilder();

        sql.append(" UPDATE gp SET gp.area_manual=(");
        sql.append("         SELECT SUM(s1.p01_value*s1.rm_std_area) FROM sb_items ${sql.as} s1 ");
        sql.append("         WHERE  s1.gp_id=gp.gp_id ");
        sql.append("                AND s1.sb_name='" + this.sbName + LEFT_SINGLE_QUOTE);
        sql.append("      ),");
        sql.append("      gp.count_em=(");
        sql.append(
            "         SELECT CAST(SUM(s1.p01_value*s1.unit_headcount) AS INTEGER) FROM sb_items ${sql.as} s1 ");
        sql.append("         WHERE  s1.gp_id=gp.gp_id  ");
        sql.append("                AND  s1.sb_name='" + this.sbName + LEFT_SINGLE_QUOTE);
        sql.append("      )");
        sql.append(" WHERE  EXISTS ( select 1 from sb_items ${sql.as} s2");
        sql.append(
            "                 where  s2.gp_id=gp.gp_id AND s2.sb_name='" + this.sbName + "')");
        sql.append("        AND gp.portfolio_scenario_id='" + this.scenarioId + LEFT_SINGLE_QUOTE);

        SqlUtils.executeUpdate(GP_TABLE, sql.toString());
    }

    /**
     * Create new group records for any remaining sb_items that do not have a gp_id.
     *
     */
    private void insertGps() {

        final DataSource dsSbItems = DataSourceFactory.createDataSourceForFields(SB_ITEMS,
            new String[] { SpaceRequirementGroupAllocate.SB_NAME,
                    SpaceRequirementGroupAllocate.FG_TITLE, SpaceRequirementGroupAllocate.BL_ID,
                    SpaceRequirementGroupAllocate.FL_ID, SpaceRequirementGroupAllocate.DV_ID,
                    SpaceRequirementGroupAllocate.DP_ID, SpaceRequirementGroupAllocate.BU_ID, GP_ID,
                    "p01_value", "rm_std_area", "unit_headcount" });

        dsSbItems.addSort(SB_ITEMS, SpaceRequirementGroupAllocate.FG_TITLE);
        dsSbItems.addSort(SB_ITEMS, SpaceRequirementGroupAllocate.BU_ID);
        dsSbItems.addSort(SB_ITEMS, SpaceRequirementGroupAllocate.DV_ID);
        dsSbItems.addSort(SB_ITEMS, SpaceRequirementGroupAllocate.DP_ID);
        dsSbItems.addSort(SB_ITEMS, SpaceRequirementGroupAllocate.BL_ID);
        dsSbItems.addSort(SB_ITEMS, SpaceRequirementGroupAllocate.FL_ID);

        final DataSource dsGroup = DataSourceFactory.createDataSourceForFields(GP_TABLE,
            new String[] { "portfolio_scenario_id", "event_name", DATE_START, "date_end", GP_ID,
                    "gp_function", PLANING_BU_ID, SpaceRequirementGroupAllocate.BL_ID,
                    SpaceRequirementGroupAllocate.FL_ID, SpaceRequirementGroupAllocate.DV_ID,
                    SpaceRequirementGroupAllocate.DP_ID, "allocation_type", "sort_order",
                    "parent_group_id", "area_manual", "count_em", "name", "description" });

        final StringBuilder sbitemsRes = new StringBuilder();
        sbitemsRes.append(" ( sb_items.p00_value!=sb_items.p01_value and sb_items.gp_id is null ");

        sbitemsRes.append("   or sb_items.fg_title is null ");
        sbitemsRes.append("      and Exists ( SELECT 1 FROM sb_items ${sql.as} s1  WHERE   ");
        sbitemsRes.append("     (s1.bu_id is null and sb_items.bu_id is null ");
        sbitemsRes.append(
            "           or s1.bu_id is not null and sb_items.bu_id is not null and  s1.bu_id=sb_items.bu_id)");
        sbitemsRes.append(
            "               and (s1.dv_id is null and sb_items.dv_id is null or s1.dv_id is not null and sb_items.dv_id is not null and  s1.dv_id=sb_items.dv_id)  ");
        sbitemsRes.append(
            "               and (s1.dp_id is null and sb_items.dp_id is null or s1.dp_id is not null and sb_items.dp_id is not null and  s1.dp_id=sb_items.dp_id)  ");
        sbitemsRes.append(
            "               and (s1.bl_id is null and sb_items.bl_id is null or s1.bl_id is not null and sb_items.bl_id is not null and  s1.bl_id=sb_items.bl_id)  ");
        sbitemsRes.append(
            "               and (s1.fl_id is null and sb_items.fl_id is null or s1.fl_id is not null and sb_items.fl_id is not null and  s1.fl_id=sb_items.fl_id)  ");
        sbitemsRes.append("     and s1.p00_value!=s1.p01_value and s1.gp_id is null ");
        sbitemsRes.append("     and s1.sb_name='" + this.sbName + "' ) ");

        sbitemsRes.append("  or sb_items.fg_title is not null and sb_items.gp_id is null ");

        sbitemsRes.append(" ) and sb_items.sb_name='" + this.sbName + LEFT_SINGLE_QUOTE);

        final List<DataRecord> sbItems = dsSbItems.getRecords(sbitemsRes.toString());

        for (final DataRecord sbItem : sbItems) {

            if (this.sameGpAsPreviousSbItem(sbItem)) {

                this.updateCurrentGroup(sbItem);

            } else {

                if (this.currentNewGroup != null) {
                    this.saveCurrentGroup(dsGroup, dsSbItems);
                }

                this.createNewGroup(sbItem, dsGroup);
            }

            this.sbItemsOfCurrentGroup.add(sbItem);
        }

        if (this.currentNewGroup != null) {
            this.saveCurrentGroup(dsGroup, dsSbItems);
        }

        // When placing record into the UNALLOC building, follow the same procedure as when doing
        // the "Allocate Requirements" in terms of which floor and sort order
        this.assignUnallocFloors(dsGroup);
    }

    /**
     * Judge if given sb_items record belongs to the current new gp record.
     *
     * @param sbItem sb_items record.
     *
     * @return if given sb_items record has same group record with previous sb_items
     */
    private boolean sameGpAsPreviousSbItem(final DataRecord sbItem) {
        boolean isSame = false;

        if (this.currentNewGroup != null) {
            final String gpFunction = this.currentNewGroup.getString(GP_GP_FUNCTION);
            final String fgTitle = sbItem.getString(SB_ITEMS_FG_TITLE);

            if (StringUtil.isNullOrEmpty(gpFunction) && StringUtil.isNullOrEmpty(fgTitle)) {

                isSame = this.isSameOrganization(sbItem) && this.isSameLocation(sbItem);

            } else {

                isSame = StringUtil.notNullOrEmpty(gpFunction)
                        && gpFunction.equalsIgnoreCase(fgTitle);

                this.processForSameFG(sbItem, isSame);
            }

        }

        return isSame;
    }

    /**
     * / For same fg title sb_items, need to judge whether they have same // organization, if // not
     * then set gp's organization to null..
     *
     * @param sbItem sb_items record.
     * @param isSameFG boolean indicate if given sb_items record belong the same FG of current new
     *            group
     */
    private void processForSameFG(final DataRecord sbItem, final boolean isSameFG) {

        if (isSameFG) {
            if (!this.isSameOrganization(sbItem)) {
                this.currentNewGroup.setValue(GP_BU_ID, null);
                this.currentNewGroup.setValue(GP_DV_ID, null);
                this.currentNewGroup.setValue(GP_DP_ID, null);

                this.sameFgTitleDifferentOrg = true;
            }

            if (SpaceRequirementGroupAllocate.DEFAULT_BL_ID.equalsIgnoreCase(
                this.currentNewGroup.getString(GP_BL_ID)) || !this.isSameLocation(sbItem)) {

                this.currentNewGroup.setValue(GP_BL_ID,
                    SpaceRequirementGroupAllocate.DEFAULT_BL_ID);

                this.sameFgTitleDifferentLoc = true;
            }
        }

    }

    /**
     * Judge if current gp has same organization as given sb_items record.
     *
     * @param sbItem sb_items record.
     *
     * @return if given sb_items record has same group record with previous sb_items
     */
    private boolean isSameOrganization(final DataRecord sbItem) {
        boolean isSame;
        // final String gpBu = this.currentNewGroup.getString(GP_BU_ID);
        final String gpDv = this.currentNewGroup.getString(GP_DV_ID);
        final String gpDp = this.currentNewGroup.getString(GP_DP_ID);

        // final String sbItemBu = sbItem.getString("sb_items.bu_id");
        final String sbItemDv = sbItem.getString(SB_ITEMS_DV_ID);
        final String sbItemDp = sbItem.getString(SB_ITEMS_DP_ID);

        // final boolean isSameBu =
        // StringUtil.isNullOrEmpty(gpBu) && StringUtil.isNullOrEmpty(sbItemBu)
        // || StringUtil.notNullOrEmpty(gpBu) && gpBu.equalsIgnoreCase(sbItemBu);
        final boolean isSameDv =
                StringUtil.isNullOrEmpty(gpDv) && StringUtil.isNullOrEmpty(sbItemDv)
                        || StringUtil.notNullOrEmpty(gpDv) && gpDv.equalsIgnoreCase(sbItemDv);
        final boolean isSameDp =
                StringUtil.isNullOrEmpty(gpDp) && StringUtil.isNullOrEmpty(sbItemDp)
                        || StringUtil.notNullOrEmpty(gpDp) && gpDp.equalsIgnoreCase(sbItemDp);

        isSame = isSameDv && isSameDp;
        return isSame;
    }

    /**
     * Create a new group record for given sb_items record.
     *
     * @param sbItem DataRecord sb_items record
     * @param dsGroup DataSource of table gp
     */
    private void createNewGroup(final DataRecord sbItem, final DataSource dsGroup) {

        final DataRecord group = dsGroup.createNewRecord();

        group.setValue("gp.portfolio_scenario_id", this.scenarioId);
        group.setValue("gp.event_name", this.eventName);
        group.setValue("gp.date_start", DateTime.stringToDate(this.startDate, DEFAULT_DATE_FORMAT));
        group.setValue("gp.description", "Create Group");

        group.setValue(GP_GP_FUNCTION, sbItem.getValue(SB_ITEMS_FG_TITLE));
        group.setValue(GP_BU_ID, sbItem.getValue("sb_items.bu_id"));
        group.setValue(GP_DV_ID, sbItem.getValue(SB_ITEMS_DV_ID));
        group.setValue(GP_DP_ID, sbItem.getValue(SB_ITEMS_DP_ID));
        group.setValue(GP_BL_ID, sbItem.getValue(SB_ITEMS_BL_ID));
        group.setValue(GP_FL_ID, sbItem.getValue(SB_ITEMS_FL_ID));
        group.setValue("gp.name",
            StringUtil.notNullOrEmpty(sbItem.getValue(SB_ITEMS_FG_TITLE))
                    ? sbItem.getValue(SB_ITEMS_FG_TITLE)
                    : sbItem.getString(SB_ITEMS_DV_ID) + "-" + sbItem.getString(SB_ITEMS_DP_ID));

        group.setValue("gp.allocation_type", DEFAULT_GP_ALLOC_TYPE);
        group.setValue(SpaceRequirementGroupAllocate.GP_SORT_ORDER, 1);

        group.setValue(GP_AREA_MANUAL,
            sbItem.getDouble(SB_ITEMS_P01) * sbItem.getDouble(SB_ITEMS_RM_STD_AREA));

        group.setValue(GP_COUNT_EM, (int) Math
            .round(sbItem.getDouble(SB_ITEMS_P01) * sbItem.getDouble(SB_ITEMS_UNIT_HEADCOUNT)));

        this.currentNewGroup = group;
        this.sameFgTitleDifferentOrg = false;
        this.sameFgTitleDifferentLoc = false;
    }

    /**
     * Save current new group record and its associated sb_ittems record.
     *
     * @param dsGroup DataSource of table gp
     * @param dsSbItems DataSource of table sb_items
     */
    private void saveCurrentGroup(final DataSource dsGroup, final DataSource dsSbItems) {

        // before save the new group, add building inventory of group if it's no in group table
        this.addBuildingIfNotExists(dsGroup);

        if (this.sameFgTitleDifferentLoc || this.sameFgTitleDifferentOrg) {
            this.updateParentGroupBySbItems(dsGroup);

        } else {
            // Set the value of fields "parent_group_id" and "sort_order" for the new group record
            // from
            // existing group record that is ending if found
            final DataRecord parentGp = this.updateParentGroup(dsGroup);
            if (parentGp != null) {
                this.currentNewGroup.setValue("gp.parent_group_id", parentGp.getInt(GP_GP_ID));
                this.currentNewGroup.setValue("gp.sort_order",
                    parentGp.getInt(SpaceRequirementGroupAllocate.GP_SORT_ORDER));
            }
        }

        // KB#3048964: check if bl_id or fl_id of group is null, if so assign UNALLOC building and
        // floor.
        if (StringUtil.isNullOrEmpty(this.currentNewGroup.getString(GP_BL_ID))
                || StringUtil.isNullOrEmpty(this.currentNewGroup.getString(GP_FL_ID))) {
            this.currentNewGroup.setValue(GP_BL_ID, SpaceRequirementGroupAllocate.DEFAULT_BL_ID);
            this.currentNewGroup.setValue(GP_FL_ID, "01");
        }

        // kb#3049860: format area value to be two decimals
        final double areaOfGp = this.currentNewGroup.getDouble(GP_AREA_MANUAL);
        final BigDecimal bigDecimal = new BigDecimal(areaOfGp);
        this.currentNewGroup.setValue(GP_AREA_MANUAL,
            bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue());

        // kb#3049860: truncate the value of fg_title if its size is larger than 25 which is
        // gp_function's size.
        final String gpFunction = this.currentNewGroup.getString(GP_GP_FUNCTION);
        if (StringUtil.notNullOrEmpty(gpFunction) && gpFunction.length() > GP_FUNCTION_SIZE) {
            this.currentNewGroup.setValue(GP_GP_FUNCTION,
                gpFunction.substring(0, GP_FUNCTION_SIZE - 1));
        }

        final DataRecord newGroup = dsGroup.saveRecord(this.currentNewGroup);
        final int newGpId = newGroup.getInt(GP_GP_ID);

        for (final DataRecord sbItem : this.sbItemsOfCurrentGroup) {
            sbItem.setValue("sb_items.gp_id", newGpId);
            dsSbItems.updateRecord(sbItem);
        }

        this.sbItemsOfCurrentGroup.clear();

        this.currentNewGroup.setValue(GP_GP_ID, newGpId);
        this.newGroups.add(this.currentNewGroup);
    }

    /**
     * Add an End Date to each existing group record that have the same values in bu_id, dv_id,
     * dp_id, bl_id, fl_id as the sb_items records.
     *
     * @param dsGroup DataSource of table gp
     *
     */
    private void updateParentGroupBySbItems(final DataSource dsGroup) {

        for (final DataRecord sbItem : this.sbItemsOfCurrentGroup) {

            final ParsedRestrictionDef parentGpResDef = new ParsedRestrictionDef();

            this.addClauseBySbItemField(parentGpResDef, sbItem,
                SpaceRequirementGroupAllocate.BL_ID);
            this.addClauseBySbItemField(parentGpResDef, sbItem,
                SpaceRequirementGroupAllocate.FL_ID);
            this.addClauseBySbItemField(parentGpResDef, sbItem,
                SpaceRequirementGroupAllocate.DV_ID);
            this.addClauseBySbItemField(parentGpResDef, sbItem,
                SpaceRequirementGroupAllocate.DP_ID);
            this.addClauseByGpField(parentGpResDef, SpaceRequirementGroupAllocate.SCENARIO_ID);

            // kb#3049074: parent group should only be "Allocated Area"
            parentGpResDef.addClause(GP_TABLE, SpaceRequirementGroupAllocate.ALLOC_TYPE,
                DEFAULT_GP_ALLOC_TYPE, Operation.EQUALS);

            final List<DataRecord> parentGpRecords = dsGroup.getRecords(parentGpResDef);

            if (!parentGpRecords.isEmpty()) {

                final DataRecord parentGp = parentGpRecords.get(0);
                final java.sql.Date dateStart =
                        DateTime.stringToDate(this.startDate, DEFAULT_DATE_FORMAT);

                parentGp.setValue(GP_DATE_END,
                    new java.sql.Date(DateTime.addDays(dateStart, -1).getTime()));
                dsGroup.updateRecord(parentGp);
            }
        }
    }

    /**
     * Add an End Date to those existing group records that have the same values in bu_id, dv_id,
     * dp_id, bl_id, fl_id as the CURRENT new group record.
     *
     * @param dsGroup DataSource of table gp
     *
     * @return parent group record if found, else return null.
     */
    private DataRecord updateParentGroup(final DataSource dsGroup) {
        DataRecord parentGp = null;

        final ParsedRestrictionDef parentGpResDef = new ParsedRestrictionDef();

        this.addClauseByGpField(parentGpResDef, SpaceRequirementGroupAllocate.BL_ID);
        this.addClauseByGpField(parentGpResDef, SpaceRequirementGroupAllocate.FL_ID);
        this.addClauseByGpField(parentGpResDef, SpaceRequirementGroupAllocate.DV_ID);
        this.addClauseByGpField(parentGpResDef, SpaceRequirementGroupAllocate.DP_ID);
        this.addClauseByGpField(parentGpResDef, SpaceRequirementGroupAllocate.SCENARIO_ID);

        // kb#3049074: parent group should only be "Allocated Area"
        parentGpResDef.addClause(GP_TABLE, SpaceRequirementGroupAllocate.ALLOC_TYPE,
            DEFAULT_GP_ALLOC_TYPE, Operation.EQUALS);

        // this.addClauseByField(parentGpResDef, PLANING_BU_ID);

        final List<DataRecord> parentGpRecords = dsGroup.getRecords(parentGpResDef);

        if (!parentGpRecords.isEmpty()) {

            parentGp = parentGpRecords.get(0);
            final java.sql.Date dateStart =
                    DateTime.stringToDate(this.startDate, DEFAULT_DATE_FORMAT);

            parentGp.setValue(GP_DATE_END,
                new java.sql.Date(DateTime.addDays(dateStart, -1).getTime()));
            dsGroup.updateRecord(parentGp);
        }

        return parentGp;
    }

    /**
     * Add a caluse based on a string type field's value.
     *
     * @param parentGpResDef ParsedRestrictionDef
     * @param fieldName String
     *
     */
    private void addClauseByGpField(final ParsedRestrictionDef parentGpResDef,
            final String fieldName) {
        final String value = this.currentNewGroup
            .getString(GP_TABLE + SpaceRequirementGroupAllocate.DOT + fieldName);
        if (StringUtil.isNullOrEmpty(value)) {

            parentGpResDef.addClause(GP_TABLE, fieldName, null, Operation.IS_NULL);

        } else {
            parentGpResDef.addClause(GP_TABLE, fieldName, value, Operation.EQUALS);
        }
    }

    /**
     * Add a caluse based on a string type field's value of given sb_items record.
     *
     * @param parentGpResDef ParsedRestrictionDef
     * @param sbItem DataRecord record
     * @param fieldName String
     *
     */
    private void addClauseBySbItemField(final ParsedRestrictionDef parentGpResDef,
            final DataRecord sbItem, final String fieldName) {
        final String value =
                sbItem.getString(SB_ITEMS + SpaceRequirementGroupAllocate.DOT + fieldName);
        if (StringUtil.isNullOrEmpty(value)) {

            parentGpResDef.addClause(GP_TABLE, fieldName, null, Operation.IS_NULL);

        } else {
            parentGpResDef.addClause(GP_TABLE, fieldName, value, Operation.EQUALS);
        }
    }

    /**
     * Update current new group record for any remaining sb_items that do not have a gp_id.
     *
     * @param sbItem DataRecord sb_items record
     */
    private void updateCurrentGroup(final DataRecord sbItem) {

        this.currentNewGroup.setValue(GP_AREA_MANUAL, this.currentNewGroup.getDouble(GP_AREA_MANUAL)
                + sbItem.getDouble(SB_ITEMS_P01) * sbItem.getDouble(SB_ITEMS_RM_STD_AREA));

        if (SpaceRequirementGroupAllocate.DEFAULT_BL_ID.equalsIgnoreCase(
            this.currentNewGroup.getString(GP_BL_ID)) || !this.isSameLocation(sbItem)) {
            // If SB_ITEMS records do not all have the same BL/FL, that group gets placed into the
            // UNALLOC building
            this.currentNewGroup.setValue(GP_BL_ID, SpaceRequirementGroupAllocate.DEFAULT_BL_ID);
        }
    }

    /**
     * Judge if current gp has same building and floor as given sb_items record.
     *
     * @param sbItem sb_items record.
     *
     * @return if given sb_items record has same location with previous sb_items
     */
    private boolean isSameLocation(final DataRecord sbItem) {
        final String gpBl = this.currentNewGroup.getString(GP_BL_ID);
        final String gpFl = this.currentNewGroup.getString(GP_FL_ID);

        final String sbItemBl = sbItem.getString(SB_ITEMS_BL_ID);
        final String sbItemFl = sbItem.getString(SB_ITEMS_FL_ID);

        final boolean isSameBl =
                StringUtil.isNullOrEmpty(gpBl) && StringUtil.isNullOrEmpty(sbItemBl)
                        || StringUtil.notNullOrEmpty(gpBl) && gpBl.equalsIgnoreCase(sbItemBl);
        final boolean isSameFl =
                StringUtil.isNullOrEmpty(gpFl) && StringUtil.isNullOrEmpty(sbItemFl)
                        || StringUtil.notNullOrEmpty(gpFl) && gpFl.equalsIgnoreCase(sbItemFl);

        return isSameBl && isSameFl;
    }

    /**
     * Call the WFR method 'addRmEmLsGroups' in GroupSpaceAllocationHandlers to add building to
     * scenario.
     *
     * @param dsGroup DataSource of table gp
     */
    private void addBuildingIfNotExists(final DataSource dsGroup) {

        final DataSetList buildingsToAdd = new DataSetList();

        final DataSource dsBl = DataSourceFactory.createDataSourceForFields("bl",
            new String[] { SpaceRequirementGroupAllocate.BL_ID });

        for (final DataRecord sbItem : this.sbItemsOfCurrentGroup) {

            final String blId = sbItem.getString(SB_ITEMS_BL_ID);
            if (StringUtil.notNullOrEmpty(blId)) {

                final DataRecord gpRecord =
                        dsGroup.getRecord("gp.allocation_type='Usable Area - Owned' and gp.bl_id='"
                                + blId + "' and gp.portfolio_scenario_id='" + this.scenarioId
                                + LEFT_SINGLE_QUOTE);
                if (gpRecord == null) {

                    final DataRecord record = dsBl.createNewRecord();
                    record.setValue(SpaceRequirementGroupAllocate.BL_BL_ID, blId);
                    buildingsToAdd.addRecord(record);

                    new GroupSpaceAllocationHandlers().createGroupFromInventory(this.scenarioId,
                        buildingsToAdd, new DataSetList(),
                        DateTime.dateToString(new java.sql.Date(this.scenarioStartDate.getTime()),
                            DEFAULT_DATE_FORMAT),
                        SpaceRequirementGroupAllocate.SB_LEVEL_FG, 0.0, this.unitTitle);
                }
            }
        }
    }

    /**
     * Calculate and Assign proper floor to group records in building 'UNALLOC'.
     *
     * @param dsGroup DataSource of table gp
     */
    private void assignUnallocFloors(final DataSource dsGroup) {

        double floorRemainingArea = SpaceRequirementGroupAllocate.DEFAULT_FLOOR_AREA;
        int startFloorIndex = 1;
        String calculatedFlId = "";

        for (final DataRecord newGp : this.newGroups) {

            if (SpaceRequirementGroupAllocate.DEFAULT_BL_ID
                .equalsIgnoreCase(newGp.getString(GP_BL_ID))) {
                final DataRecord gpRecord = dsGroup.getRecord("gp.gp_id=" + newGp.getInt(GP_GP_ID));

                final double gpArea = gpRecord.getDouble(GP_AREA_MANUAL);

                if (floorRemainingArea < gpArea) {

                    startFloorIndex++;

                    calculatedFlId = startFloorIndex > SpaceRequirementGroupAllocate.NINE
                            ? String.valueOf(startFloorIndex)
                            : (SpaceRequirementGroupAllocate.STR_ZERO + startFloorIndex);

                    floorRemainingArea = SpaceRequirementGroupAllocate.DEFAULT_FLOOR_AREA;

                } else {

                    calculatedFlId = startFloorIndex > SpaceRequirementGroupAllocate.NINE
                            ? String.valueOf(startFloorIndex)
                            : (SpaceRequirementGroupAllocate.STR_ZERO + startFloorIndex);
                }

                floorRemainingArea = floorRemainingArea - gpArea;

                gpRecord.setValue(GP_FL_ID, calculatedFlId);

                dsGroup.updateRecord(gpRecord);
            }
        }

    }
}
