package com.archibus.app.rplm.space;

import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.rplm.GroupSpaceAllocationHandlers;
import com.archibus.utility.*;

/**
 * Class for Creating groups form a selected Space Requirement.
 *
 * Added for 22.1 Space and Portfolio Planing - Allocate Space with Space Requirements, 2015-05-22.
 *
 * @author ASC-BJ:Zhang Yi
 *
 */
public class SpaceRequirementGroupAllocate {

    /**
     * Dot.
     *
     */
    public static final String DOT = ".";

    /**
     * Default floor's area.
     *
     */
    public static final int DEFAULT_FLOOR_AREA = 25000;

    /**
     * Default building's id.
     *
     */
    public static final String DEFAULT_BL_ID = "UNALLOC";

    /**
     * Default allocation type of floor's available area.
     *
     */
    public static final String DEFAULT_AVAIL_ALLOC_TYPE = "Usable Area - Owned";

    /**
     * Represent value 'fg' of field sb.sb_levev.
     *
     */
    public static final String SB_LEVEL_FG = "fg";

    /**
     * Represent value 'bu' of field sb.sb_levev.
     *
     */
    public static final String SB_LEVEL_BU = "bu";

    /**
     * Represent value 'dv' of field sb.sb_levev.
     *
     */
    public static final String SB_LEVEL_DV = "dv";

    /**
     * Represent value 'dp' of field sb.sb_levev.
     *
     */
    public static final String SB_LEVEL_DP = "dp";

    /**
     * Table name 'gp'.
     *
     */
    public static final String T_GP = "gp";

    /**
     * Field name 'sb_items'.
     *
     */
    public static final String SB_ITEMS = "sb_items";

    /**
     * Field name 'sb_name'.
     *
     */
    public static final String SB_NAME = "sb_name";

    /**
     * Field name 'portfolio_scenario_id'.
     *
     */
    public static final String SCENARIO_ID = "portfolio_scenario_id";

    /**
     * Field name 'allocation_type'.
     *
     */
    public static final String ALLOC_TYPE = "allocation_type";

    /**
     * Field name 'bl_id'.
     *
     */
    public static final String BL_ID = "bl_id";

    /**
     * Field name 'fl_id'.
     *
     */
    public static final String FL_ID = "fl_id";

    /**
     * Field name 'dv_id'.
     *
     */
    public static final String DV_ID = "dv_id";

    /**
     * Field name 'dp_id'.
     *
     */
    public static final String DP_ID = "dp_id";

    /**
     * Field name 'bu_id'.
     *
     */
    public static final String BU_ID = "bu_id";

    /**
     * Field name 'fg_title'.
     *
     */
    public static final String FG_TITLE = "fg_title";

    /**
     * Table-field name 'gp.sort_order'.
     *
     */
    public static final String GP_SORT_ORDER = "gp.sort_order";

    /**
     * Table-field name 'gp.fl_id'.
     *
     */
    public static final String GP_FL_ID = "gp.fl_id";

    /**
     * Table-field name 'gp.sort_order'.
     *
     */
    public static final String BL_BL_ID = "bl.bl_id";

    /**
     * Table-field name 'sb_items.bu_id'.
     *
     */
    public static final String SB_ITEMS_BU_ID = "sb_items.bu_id";

    /**
     * Table-field name 'sb_items.dv_id'.
     *
     */
    public static final String SB_ITEMS_DV_ID = "sb_items.dv_id";

    /**
     * Table-field name 'sb_items.dv_id'.
     *
     */
    public static final String SB_ITEMS_DP_ID = "sb_items.dp_id";

    /**
     * Table-field name 'sb_items.fg_title'.
     *
     */
    public static final String SB_ITEMS_FG_TITLE = "sb_items.fg_title";

    /**
     * Field name 'date_start'.
     *
     */
    public static final String DATE_START = "date_start";

    /**
     * string of zero.
     *
     */
    public static final String STR_ZERO = "0";

    /**
     * Digit 9.
     *
     */
    public static final int NINE = 9;

    /**
     * Digit 5: default max fl_id is '05' for building 'UNALLOC'.
     *
     */
    public static final int DEFAULT_MAX_FLOOR = 5;

    /**
     * Maximum number of period fields.
     *
     */
    private static final int MAX_PERIOD_NUM = 12;

    /**
     * Field name suffix 'p'.
     *
     */
    private static final String PERIOD_VALUE_PREFIX = "p";

    /**
     * Field name suffix '_value'.
     *
     */
    private static final String PERIOD_VALUE_SUFFIX = "_value";

    /**
     * Suffix '-' of negative floor.
     *
     */
    private static final String NEGATIVE_SIGN = "-";

    /**
     * Default date format.
     *
     */
    private static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";

    /**
     * DataSource of Space Requirement Items (table: sb_item).
     *
     */
    private final DataSource dsSpaceRequirementItem;

    /**
     * DataSource of Groups (table: gp).
     *
     */
    private final DataSource dsGroup;

    /**
     * DataSource of Buildings (table: bl).
     *
     */
    private final DataSource dsBl;

    /**
     * Remaining area of current unallocated floor.
     *
     */
    private double floorRemainingArea;

    /**
     * Current floor's id that match the requirement of group allocation.
     *
     */
    private int currentFloorIndex = 1;

    /**
     * Remaining area of current negative floor.
     *
     */
    private double negativeFloorRemainingArea;

    /**
     * Current negative floor's id that match the requirement of group allocation.
     *
     */
    private int currentNegativeFloorIndex = 1;

    /**
     * Current Space Requirement's sb_name.
     *
     */
    private final String sbName;

    /**
     * User selected and entered periods data.
     *
     */
    private final JSONArray periodsData;

    /**
     * Current Portfolio Scenario's id.
     *
     */
    private final String scenarioId;

    /**
     * Current scenario's As Of Date.
     *
     */
    private final String asOfDate;

    /**
     * Current Space Requirement's sb_level, used for generating gp.name.
     *
     */
    private final String sbLevel;

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
     * Buildings wait to add to the gp.
     *
     */
    private final DataSetList buildings = new DataSetList();

    /**
     * Default date formatter for parsing date string.
     *
     */
    private final SimpleDateFormat defaultDateFormat;

    /** The logger. */
    private final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Sb items belong to same current group that currently is processing.
     *
     */
    private final List<DataRecord> sbItemsOfCurrentGroup = new ArrayList<DataRecord>();

    /**
     * Constructor.
     *
     * @param sbName String Space Requirement Name (sb.sb_name)
     * @param scenarioId String Portfolio Scenario id
     * @param asOfDate String As of Date
     * @param periodsData JSONArray List of user select and input data for periods
     * @param unitTitle String current user's unit's title
     */
    public SpaceRequirementGroupAllocate(final String sbName, final String scenarioId,
            final String asOfDate, final JSONArray periodsData, final String unitTitle) {
        super();

        this.defaultDateFormat = new SimpleDateFormat(DEFAULT_DATE_FORMAT, Locale.ENGLISH);

        this.sbName = sbName;
        this.scenarioId = scenarioId;
        this.periodsData = periodsData;
        this.asOfDate = asOfDate;

        this.unitTitle = unitTitle;

        final DataSource dsSpaceRequirement = DataSourceFactory.createDataSourceForFields("sb",
            new String[] { SB_NAME, "sb_level", "sb_type" });
        this.sbLevel = dsSpaceRequirement.getRecord("sb_name='" + sbName + "'    ")
            .getString("sb.sb_level");

        this.dsSpaceRequirementItem =
                DataSourceFactory.createDataSourceForFields(SB_ITEMS, new String[] { SB_NAME, BL_ID,
                        DV_ID, DP_ID, BU_ID, FG_TITLE, "rm_std_area", "unit_headcount" });

        for (int i = 0; i <= MAX_PERIOD_NUM; i++) {
            this.dsSpaceRequirementItem
                .addField(PERIOD_VALUE_PREFIX + (i > NINE ? "" : 0) + i + PERIOD_VALUE_SUFFIX);

        }

        this.dsGroup = DataSourceFactory.createDataSourceForFields(T_GP,
            new String[] { "event_name", DATE_START, ALLOC_TYPE, BL_ID, FL_ID, "sort_order",
                    "planning_bu_id", DV_ID, DP_ID, "gp_function", SCENARIO_ID, "parent_group_id",
                    "name", "hpattern_acad", "description", "area_manual", "option1", "count_em" });

        this.floorRemainingArea = DEFAULT_FLOOR_AREA;
        this.negativeFloorRemainingArea = DEFAULT_FLOOR_AREA;

        this.dsBl = DataSourceFactory.createDataSourceForFields("bl", new String[] { BL_ID });

        this.scenarioStartDate = DataSourceFactory
            .createDataSourceForFields("portfolio_scenario", new String[] { DATE_START })
            .getRecord("portfolio_scenario_id='" + this.scenarioId + "' ")
            .getDate("portfolio_scenario.date_start");

    }

    /**
     * Create groups for given Space Requirement, portfolio scenario and user selected and entered
     * periods data.
     */
    public void allocate() {

        this.addSortToSbDs();

        final List<DataRecord> sbItems =
                this.dsSpaceRequirementItem.getRecords(" sb_name='" + this.sbName + "'  ");

        // final String sbType = spaceRequirement.getString("sb.sb_type");
        // final String sbLevel = spaceRequirement.getString("sb.sb_level");
        for (int j = 0; j < this.periodsData.length(); j++) {
            final JSONObject period = this.periodsData.getJSONObject(j);
            final int periodIndex = period.getInt("periodIndex");

            DataRecord preSbItem = null;
            this.sbItemsOfCurrentGroup.clear();
            for (final DataRecord spaceRequirementItem : sbItems) {

                if (StringUtil.isNullOrEmpty(spaceRequirementItem.getString(SB_ITEMS_BU_ID))
                        && StringUtil.isNullOrEmpty(spaceRequirementItem.getString(SB_ITEMS_DV_ID))
                        && StringUtil
                            .isNullOrEmpty(spaceRequirementItem.getString(SB_ITEMS_DP_ID))) {
                    continue;
                }

                this.storeBuilding(spaceRequirementItem.getString("sb_items.bl_id"));

                if (preSbItem == null) {

                    this.sbItemsOfCurrentGroup.add(spaceRequirementItem);

                } else {

                    if (this.isSameOrganization(preSbItem, spaceRequirementItem)) {

                        this.sbItemsOfCurrentGroup.add(spaceRequirementItem);

                    } else {

                        this.decideToCreateGroup(period, preSbItem, periodIndex);

                        this.sbItemsOfCurrentGroup.clear();
                        this.sbItemsOfCurrentGroup.add(spaceRequirementItem);
                    }
                }

                preSbItem = spaceRequirementItem;

            }

            this.decideToCreateGroup(period, preSbItem, periodIndex);
        }

        this.addBuildings();
    }

    /**
     * Detect whether there is area or headcount difference and decide whether to create a new
     * group.
     *
     * @param period JSONObject period data
     * @param preSbItem DataRecord sb_time record
     * @param periodIndex int index of period
     *
     */
    private void decideToCreateGroup(final JSONObject period, final DataRecord preSbItem,
            final int periodIndex) {

        // kb#3049656: create final group after loop
        final double areaAllocated = calculateAllocatedArea(periodIndex);
        final double headcountAllocated = calculateAllocatedHeadcount(periodIndex);

        if (areaAllocated != 0 || headcountAllocated != 0) {
            this.createGroup(period, preSbItem, areaAllocated, headcountAllocated);
        }
    }

    /**
     * Add sort order to Space Requirement DataSource according to current sb_level.
     *
     */
    private void addSortToSbDs() {

        if (SB_LEVEL_BU.equalsIgnoreCase(this.sbLevel)) {

            this.dsSpaceRequirementItem.addSort(SB_ITEMS, BU_ID);

        } else if (SB_LEVEL_DV.equalsIgnoreCase(this.sbLevel)) {

            this.dsSpaceRequirementItem.addSort(SB_ITEMS, DV_ID);

        } else if (SB_LEVEL_DP.equalsIgnoreCase(this.sbLevel)) {

            this.dsSpaceRequirementItem.addSort(SB_ITEMS, DV_ID);
            this.dsSpaceRequirementItem.addSort(SB_ITEMS, DP_ID);

        } else if (SB_LEVEL_FG.equalsIgnoreCase(this.sbLevel)) {

            this.dsSpaceRequirementItem.addSort(SB_ITEMS, FG_TITLE);

        }
    }

    /**
     * Calculate allocated area from difference of two periods of given space requirement item.
     *
     * @param periodIndex int index of period
     *
     * @return double area allocated
     */
    private double calculateAllocatedArea(final int periodIndex) {

        double sumArea = 0;

        final String currentPeriodName = SB_ITEMS + DOT + PERIOD_VALUE_PREFIX
                + (periodIndex > NINE ? "" : 0) + periodIndex + PERIOD_VALUE_SUFFIX;
        final String prePeriodName = SB_ITEMS + DOT + PERIOD_VALUE_PREFIX
                + ((periodIndex - 1) > NINE ? "" : 0) + (periodIndex - 1) + PERIOD_VALUE_SUFFIX;

        final boolean allZero = isAllZero(currentPeriodName);

        if (!allZero) {

            for (final DataRecord spaceRequirementItem : this.sbItemsOfCurrentGroup) {

                final double roomStdArea = spaceRequirementItem.getDouble("sb_items.rm_std_area");

                final double prePeriodValue = spaceRequirementItem.getDouble(prePeriodName);
                final double currentPeriodValue = spaceRequirementItem.getDouble(currentPeriodName);

                sumArea = sumArea + roomStdArea * (currentPeriodValue - prePeriodValue);
            }
        }

        return sumArea;
    }

    /**
     * Calculate required headcount from difference of two periods of given space requirement item.
     *
     * @param periodIndex int index of period
     *
     * @return double headcount required
     */
    private double calculateAllocatedHeadcount(final int periodIndex) {

        double sumHeadcount = 0;

        final String currentPeriodName = SB_ITEMS + DOT + PERIOD_VALUE_PREFIX
                + (periodIndex > NINE ? "" : 0) + periodIndex + PERIOD_VALUE_SUFFIX;
        final String prePeriodName = SB_ITEMS + DOT + PERIOD_VALUE_PREFIX
                + ((periodIndex - 1) > NINE ? "" : 0) + (periodIndex - 1) + PERIOD_VALUE_SUFFIX;

        final boolean allZero = isAllZero(currentPeriodName);

        if (!allZero) {

            for (final DataRecord spaceRequirementItem : this.sbItemsOfCurrentGroup) {

                final double unitHeadcount =
                        spaceRequirementItem.getDouble("sb_items.unit_headcount");

                final double prePeriodValue = spaceRequirementItem.getDouble(prePeriodName);
                final double currentPeriodValue = spaceRequirementItem.getDouble(currentPeriodName);

                sumHeadcount = sumHeadcount + unitHeadcount * (currentPeriodValue - prePeriodValue);
            }
        }

        return sumHeadcount;
    }

    /**
     * Loop through all sb_items to see if all the current period value is '0'.
     *
     * @param currentPeriodName String period field name
     *
     * @return boolean whether all preiod value is 0
     */
    private boolean isAllZero(final String currentPeriodName) {
        boolean allZero = true;

        for (final DataRecord spaceRequirementItem : this.sbItemsOfCurrentGroup) {
            if (spaceRequirementItem.getDouble(currentPeriodName) != 0) {
                allZero = false;
                break;
            }
        }
        return allZero;
    }

    /**
     * Judge if given two space requirement items have the same orgnaization.
     *
     * @param prevSbItem DataRecord previous sb_time record
     * @param currentSbItem DataRecord current sb_time record
     *
     * @return boolean area allocated
     */
    private boolean isSameOrganization(final DataRecord prevSbItem,
            final DataRecord currentSbItem) {

        boolean isSameOrg = false;

        if (SB_LEVEL_BU.equalsIgnoreCase(this.sbLevel)) {

            isSameOrg = this.bothNullOrEmpty(prevSbItem, currentSbItem, SB_ITEMS_BU_ID)
                    || this.sameFieldValue(prevSbItem, currentSbItem, SB_ITEMS_BU_ID);

        } else if (SB_LEVEL_DV.equalsIgnoreCase(this.sbLevel)) {

            isSameOrg = this.bothNullOrEmpty(prevSbItem, currentSbItem, SB_ITEMS_DV_ID)
                    || this.sameFieldValue(prevSbItem, currentSbItem, SB_ITEMS_DV_ID);

        } else if (SB_LEVEL_DP.equalsIgnoreCase(this.sbLevel)) {
            isSameOrg = this.sameFieldValue(prevSbItem, currentSbItem, SB_ITEMS_DV_ID)
                    && (this.bothNullOrEmpty(prevSbItem, currentSbItem, SB_ITEMS_DP_ID)
                            || this.sameFieldValue(prevSbItem, currentSbItem, SB_ITEMS_DP_ID));

        } else if (SB_LEVEL_FG.equalsIgnoreCase(this.sbLevel)) {

            isSameOrg = this.sameFieldValue(prevSbItem, currentSbItem, SB_ITEMS_FG_TITLE);
        }

        return isSameOrg;

    }

    /**
     *
     * @param prevSbItem DataRecord previous sb_time record
     * @param currentSbItem DataRecord current sb_time record
     * @param fieldName String field id
     *
     * @return boolean is both item has null or empty value of given field
     */
    private boolean bothNullOrEmpty(final DataRecord prevSbItem, final DataRecord currentSbItem,
            final String fieldName) {
        return StringUtil.isNullOrEmpty(prevSbItem.getString(fieldName))
                && StringUtil.isNullOrEmpty(currentSbItem.getString(fieldName));
    }

    /**
     *
     * @param prevSbItem DataRecord previous sb_time record
     * @param currentSbItem DataRecord current sb_time record
     * @param fieldName String field id
     *
     * @return boolean is both item has same not null or empty value of given field
     */
    private boolean sameFieldValue(final DataRecord prevSbItem, final DataRecord currentSbItem,
            final String fieldName) {
        return StringUtil.notNullOrEmpty(prevSbItem.getString(fieldName))
                && StringUtil.notNullOrEmpty(currentSbItem.getString(fieldName)) && prevSbItem
                    .getString(fieldName).equalsIgnoreCase(currentSbItem.getString(fieldName));
    }

    /**
     * Create a single group record.
     *
     * @param period JSONObject period data
     * @param spaceRequirementItem DataRecord sb_time record
     * @param areaAllocated double area allocated for group
     * @param headcountAllocated double headcount allocated for group
     *
     */
    private void createGroup(final JSONObject period, final DataRecord spaceRequirementItem,
            final double areaAllocated, final double headcountAllocated) {

        final DataRecord gpRecord = this.dsGroup.createNewRecord();

        gpRecord.setValue("gp.event_name", period.getString("eventName"));
        try {
            gpRecord.setValue("gp.date_start", this.defaultDateFormat.parse(getDateStart(period)));

        } catch (final NoSuchElementException e) {
            this.logger.error(e.getLocalizedMessage());
        } catch (final ParseException e) {
            this.logger.error(e.getLocalizedMessage());
        }

        gpRecord.setValue("gp.allocation_type", "Allocated Area");
        gpRecord.setValue("gp.bl_id", DEFAULT_BL_ID);
        gpRecord.setValue("gp.description", "Create Group");
        gpRecord.setValue("gp.parent_group_id", null);

        gpRecord.setValue("gp.planning_bu_id", spaceRequirementItem.getString(SB_ITEMS_BU_ID));
        gpRecord.setValue("gp.dv_id", spaceRequirementItem.getString(SB_ITEMS_DV_ID));
        gpRecord.setValue("gp.dp_id", spaceRequirementItem.getString(SB_ITEMS_DP_ID));
        gpRecord.setValue("gp.gp_function", spaceRequirementItem.getString(SB_ITEMS_FG_TITLE));

        gpRecord.setValue(GP_FL_ID, areaAllocated > 0 ? this.getUnallocFloor(areaAllocated)
                : this.getNegativeUnallocFloor(areaAllocated));

        gpRecord.setValue(GP_SORT_ORDER, this.getGroupSortOrder());
        gpRecord.setValue("gp.name", this.getGroupName(spaceRequirementItem));
        gpRecord.setValue("gp.hpattern_acad", this.getGroupHpatternAcad());

        gpRecord.setValue("gp.portfolio_scenario_id", this.scenarioId);

        gpRecord.setValue("gp.area_manual", Math.abs(areaAllocated));
        gpRecord.setValue("gp.count_em", Math.abs((int) Math.round(headcountAllocated)));

        if (areaAllocated < 0 || headcountAllocated < 0) {
            gpRecord.setValue("gp.option1", "1");
        }

        this.dsGroup.saveRecord(gpRecord);
    }

    /**
     * Get date start or as of date.
     *
     * @param period JSONObject
     *
     * @return floor id
     */
    private String getDateStart(final JSONObject period) {
        String dateStart = period.getString("dateStart");
        if (StringUtil.isNullOrEmpty(dateStart)) {
            dateStart = this.asOfDate;
        }
        return dateStart;
    }

    /**
     * For each group that is created, the application will check the remaining size on floor 01 of
     * the UNALLOC building and add see if the new group will fit, and if so, add it to that floor.
     * If there is not enough room, go to the next highest floor. If none of them have room, create
     * a new floor.
     *
     * @param areaAllocated double area allocated for group
     *
     * @return floor id
     */
    private String getUnallocFloor(final double areaAllocated) {

        String calculatedFlId = "";

        if (this.floorRemainingArea < areaAllocated) {

            this.currentFloorIndex++;

            calculatedFlId = this.currentFloorIndex > NINE ? String.valueOf(this.currentFloorIndex)
                    : (STR_ZERO + this.currentFloorIndex);

            if (this.currentFloorIndex > DEFAULT_MAX_FLOOR) {
                this.createGroupOfFloor(calculatedFlId);
            }

            this.floorRemainingArea = DEFAULT_FLOOR_AREA;

        } else {

            calculatedFlId = this.currentFloorIndex > NINE ? String.valueOf(this.currentFloorIndex)
                    : (STR_ZERO + this.currentFloorIndex);
        }

        this.floorRemainingArea = this.floorRemainingArea - areaAllocated;

        return calculatedFlId;
    }

    /**
     * Get possible negative unallocated floor for group has negative group area.
     *
     * @param areaAllocated double area allocated for group
     *
     * @return negative floor id
     */
    private String getNegativeUnallocFloor(final double areaAllocated) {

        String calculatedFlId = "";

        if (this.negativeFloorRemainingArea < -areaAllocated) {

            this.currentNegativeFloorIndex++;

            calculatedFlId = this.currentNegativeFloorIndex > NINE
                    ? String.valueOf(this.currentNegativeFloorIndex)
                    : (STR_ZERO + this.currentNegativeFloorIndex);

            this.negativeFloorRemainingArea = DEFAULT_FLOOR_AREA;

        } else {

            calculatedFlId = this.currentNegativeFloorIndex > NINE
                    ? String.valueOf(this.currentNegativeFloorIndex)
                    : (STR_ZERO + this.currentNegativeFloorIndex);
        }

        this.negativeFloorRemainingArea = this.negativeFloorRemainingArea - areaAllocated;

        this.createGroupOfFloor(NEGATIVE_SIGN + calculatedFlId);

        return NEGATIVE_SIGN + calculatedFlId;
    }

    /**
     * Create a new gp record for floor index.
     *
     * @param calculatedFlId String fl_id to be created
     */
    private void createGroupOfFloor(final String calculatedFlId) {
        final DataSource dsGp = DataSourceFactory.createDataSourceForTable(T_GP);

        dsGp.addRestriction(Restrictions.eq(T_GP, BL_ID, DEFAULT_BL_ID));
        dsGp.addRestriction(Restrictions.eq(T_GP, FL_ID, calculatedFlId));
        dsGp.addRestriction(Restrictions.eq(T_GP, SCENARIO_ID, this.scenarioId));
        dsGp.addRestriction(Restrictions.eq(T_GP, ALLOC_TYPE, DEFAULT_AVAIL_ALLOC_TYPE));

        final DataRecord record = dsGp.getRecord();

        if (record == null) {
            dsGp.clearRestrictions();

            dsGp.addRestriction(Restrictions.eq(T_GP, BL_ID, DEFAULT_BL_ID));
            dsGp.addRestriction(Restrictions.eq(T_GP, SCENARIO_ID, this.scenarioId));
            dsGp.addRestriction(Restrictions.eq(T_GP, ALLOC_TYPE, DEFAULT_AVAIL_ALLOC_TYPE));

            dsGp.addRestriction(Restrictions.eq(T_GP, FL_ID, "01"));
            final DataRecord prevRecord = dsGp.getRecord();

            final DataRecord newRecord = dsGp.createNewRecord();
            newRecord.setFieldValues(prevRecord.getFieldValues());
            newRecord.setValue(GP_FL_ID, calculatedFlId);
            newRecord.setValue("gp.gp_id", null);
            dsGp.saveRecord(newRecord);
        }
    }

    /**
     * The algorithm to create the groups will run in alphabetical order, according to the
     * organizational level. The groups’ sort_order values for the UNALLOC building will be
     * determined by the next available sort order on the floor to which the group is added.
     *
     * @return group's sort order id
     */
    private int getGroupSortOrder() {
        int maxSortOrder = 1;

        final String flId = this.currentFloorIndex > NINE ? String.valueOf(this.currentFloorIndex)
                : (STR_ZERO + this.currentFloorIndex);

        final DataRecord gpRecord = this.dsGroup.getRecord(" gp.bl_id='UNALLOC' and  gp.fl_id='"
                + flId
                + "' and gp.sort_order= (select max(g.sort_order) from gp ${sql.as} g where g.fl_id=gp.fl_id and g.bl_id=gp.bl_id) ");

        if (gpRecord != null) {

            maxSortOrder = gpRecord.getInt(GP_SORT_ORDER) + 1;

        }

        return maxSortOrder;
    }

    /**
     * Follow same naming convention as the addRmEmLsGroups method of the
     * PortfolioForecastingService WFR.
     *
     * @param spaceRequirementItem DataRecord sb_time record
     *
     * @return group's name
     */
    private String getGroupName(final DataRecord spaceRequirementItem) {
        String name = "";

        if (SB_LEVEL_BU.equalsIgnoreCase(this.sbLevel)) {

            name = this.getEmptyIfNull(SB_ITEMS_BU_ID, spaceRequirementItem);

        } else if (SB_LEVEL_DV.equalsIgnoreCase(this.sbLevel)) {

            name = this.getEmptyIfNull(SB_ITEMS_DV_ID, spaceRequirementItem);

        } else if (SB_LEVEL_FG.equalsIgnoreCase(this.sbLevel)) {

            name = this.getEmptyIfNull(SB_ITEMS_FG_TITLE, spaceRequirementItem);

        } else if (SB_LEVEL_DP.equalsIgnoreCase(this.sbLevel)) {

            name = this.getEmptyIfNull(SB_ITEMS_DV_ID, spaceRequirementItem) + NEGATIVE_SIGN
                    + this.getEmptyIfNull(SB_ITEMS_DP_ID, spaceRequirementItem);

        }

        return name;
    }

    /**
     * If field value exists return uppercase value else return empty string.
     *
     * @param field String field name
     * @param spaceRequirementItem DataRecord sb_time record
     *
     * @return field value
     */
    private String getEmptyIfNull(final String field, final DataRecord spaceRequirementItem) {
        return StringUtil.notNullOrEmpty(spaceRequirementItem.getString(field))
                ? spaceRequirementItem.getString(field).toUpperCase() : "";
    }

    /**
     * gp.hpattern_acad", "NULL, unless level = FG and sb_items.fg_title is not null. Then call core
     * control to generate color and store in this field.
     *
     * @return group's hpattern_acad
     */
    private String getGroupHpatternAcad() {

        String hpatternAcad = "";

        if (SB_LEVEL_FG.equalsIgnoreCase(this.sbLevel)) {
            hpatternAcad = ".fg_title";

        }
        return hpatternAcad;

    }

    /**
     * Store the given building to the buildings list.
     *
     * @param blId String bl_id
     */
    private void storeBuilding(final String blId) {
        if (StringUtil.notNullOrEmpty(blId)) {

            boolean isFound = false;
            for (final DataRecord building : this.buildings.getRecords()) {
                if (building.getString(BL_BL_ID).equalsIgnoreCase(blId)) {
                    isFound = true;
                    break;
                }
            }

            if (!isFound) {
                final DataRecord record = this.dsBl.createNewRecord();
                record.setValue(BL_BL_ID, blId);

                this.buildings.addRecord(record);
            }

        }
    }

    /**
     * Call the WFR method 'addRmEmLsGroups' in GroupSpaceAllocationHandlers to add buildings to
     * scenario.
     */
    private void addBuildings() {

        final DataSetList buildingsToAdd = new DataSetList();
        for (final DataRecord building : this.buildings.getRecords()) {
            final String blId = building.getString(BL_BL_ID);
            final DataRecord gpRecord =
                    this.dsGroup.getRecord("gp.allocation_type='Usable Area - Owned' and gp.bl_id='"
                            + blId + "' and gp.portfolio_scenario_id='" + this.scenarioId + "'");
            if (gpRecord == null) {
                buildingsToAdd.addRecord(building);
            }
        }

        if (buildingsToAdd.getRecords().size() > 0) {

            new GroupSpaceAllocationHandlers().createGroupFromInventory(this.scenarioId,
                buildingsToAdd, new DataSetList(),
                DateTime.dateToString(new java.sql.Date(this.scenarioStartDate.getTime()),
                    DEFAULT_DATE_FORMAT),
                this.sbLevel, 0.0, this.unitTitle);
        }
    }
}
