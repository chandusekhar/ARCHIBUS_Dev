package com.archibus.service.space.helper;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.SpaceConstants;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 *
 * <p>
 *
 */
public final class SpaceTransactionUtil {

    /**
     * Contants: string "1", represent 'true' value for activity parameter.
     *
     */
    private static final String PARAMETER_VALUE_1 = "1";

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private SpaceTransactionUtil() {

    }

    /**
     * if call from 'data change event', then get parameter 'noVpa' to true.
     *
     * @return true if from 'data change event'.
     */
    private static boolean isNoVpa() {
        Boolean noVpa = false;
        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        if (eventHandlerContext != null
                && eventHandlerContext.parameterExistsNotEmpty(SpaceConstants.NO_VPA)) {
            noVpa = (Boolean) eventHandlerContext.getParameter(SpaceConstants.NO_VPA);
        }
        return noVpa;
    }

    /**
     * @return a list after execute sql query on a given datasource.
     *
     * @param dataSource DataSource
     * @param sql boolean query sql
     * @param limit int limit value to determine is size of list match
     */
    public static boolean checkQueryList(final DataSource dataSource, final String sql,
            final int limit) {
        boolean sign = false;
        final List<DataRecord> list = dataSource.addQuery(sql).getRecords();
        if (!list.isEmpty() && list.size() > limit) {
            sign = true;
            setBooleanActivityParameterset(SpaceConstants.RESYNC_WORKSPACE_TRANSACTIONS, true);
        }
        return sign;
    }

    /**
     * If the user clears a field value, the data source expects an empty string to be passed. The
     * Smart Client passes a null value. We need to convert a null value to an empty string.
     *
     * @param record DataRecord record
     */
    public static void convertNullFieldValues(final DataRecord record) {
        final List<DataValue> fields = record.getFields();
        for (final DataValue dataValue : fields) {
            final String name = dataValue.getName();
            final boolean flag = dataValue.getFieldDef().isCharType();
            if (flag && dataValue.getValue() == null) {
                record.setValue(name, "");
            }
        }
    }

    /**
     * Return activity log datasource.
     *
     * @return DataSource activity log datasource
     */
    public static DataSource getActivityDataSource() {
        
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.ACTIVITY_LOG,
                    new String[] { SpaceConstants.ACT_QUEST, SpaceConstants.DESCRIPTION,
                            SpaceConstants.REQUESTOR, SpaceConstants.STATUS,
                            SpaceConstants.ACTIVITY_TYPE, SpaceConstants.DV_ID,
                            SpaceConstants.DP_ID, SpaceConstants.ACTIVITY_LOG_ID,
                            SpaceConstants.DOC_1, SpaceConstants.DOC_2, SpaceConstants.DOC_3,
                            SpaceConstants.DOC_4 });
        if (SpaceTransactionUtil.isNoVpa()) {
            dataSource.setApplyVpaRestrictions(false);
        }
        return dataSource;
    }

    /**
     * Return afm_roleprocs datasource.
     *
     * @return activityParamDS
     */
    public static DataSource getActivityParamsDataSource() {
        final DataSource activityParamDS =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.AFM_ACTIVITY_PARAMS,
                    new String[] { SpaceConstants.ACTIVITY_ID, SpaceConstants.PARAM_ID,
                        SpaceConstants.PARAM_VALUE });
        if (SpaceTransactionUtil.isNoVpa()) {
            activityParamDS.setApplyVpaRestrictions(false);
        }
        return activityParamDS;
    }

    /**
     * Return activity type enum list for 20.1 Space Transaction.
     *
     * @return List<String> project datasource
     */
    public static List<String> getActivityTypeEnumList() {

        final List<String> activityTypeEnumList = new ArrayList<String>();

        activityTypeEnumList.add("SERVICE DESK - INDIVIDUAL MOVE");
        activityTypeEnumList.add("SERVICE DESK - GROUP MOVE");
        activityTypeEnumList.add("SERVICE DESK - DEPARTMENT SPACE");

        return activityTypeEnumList;
    }

    /**
     * Return afm_processes datasource.
     *
     * @return activityParamDS
     */
    public static DataSource getAfmProcessDataSource() {
        final DataSource afmProcessDS =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.AFM_PROCESSES,
                    new String[] { SpaceConstants.PROCESS_ID, SpaceConstants.ACTIVITY_ID,
                        SpaceConstants.IS_ACTIVE });
        if (SpaceTransactionUtil.isNoVpa()) {
            afmProcessDS.setApplyVpaRestrictions(false);
        }
        return afmProcessDS;
    }

    /**
     * Return AFM_ROLES datasource.
     *
     * @return DataSourceFactory.createDataSourceForFields(AFM_ROLES, new String[] {
     *         SpaceConstants.ROLE_NAME});
     */
    public static DataSource getAfmRulesDatasource() {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.AFM_ROLES,
                    new String[] { SpaceConstants.ROLE_NAME });
        if (SpaceTransactionUtil.isNoVpa()) {
            dataSource.setApplyVpaRestrictions(false);
        }
        return dataSource;

    }

    /**
     * @return SQL sentence for compare two string fields like 'rmpct.dv_id!=rm.dv_id' considering
     *         the null.
     *
     * @param field1 field name
     * @param field2 field name
     */
    public static String getCompareNotEqualSqlOfStringField(final String field1, final String field2) {
        return " ( case when " + field1 + "  is null then 'null' else " + field1
                + " end) !=   ( case when " + field2 + " is null then 'null' else " + field2
                + " end) ";

    }

    /**
     * Return em datasource.
     *
     * @return DataSource em datasource
     */
    public static DataSource getEmDataSource() {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.T_EM, new String[] {
                        SpaceConstants.EM_ID, SpaceConstants.BL_ID, SpaceConstants.FL_ID,
                        SpaceConstants.RM_ID, SpaceConstants.DV_ID, SpaceConstants.DP_ID,
                        SpaceConstants.PHONE, SpaceConstants.EM_STD });
        if (SpaceTransactionUtil.isNoVpa()) {
            dataSource.setApplyVpaRestrictions(false);
        }
        return dataSource;
    }

    /**
     * Return mo datasource.
     *
     * @return DataSource mo datasource
     */
    public static DataSource getMoDataSource() {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.T_MO, new String[] {
                        "date_created", "date_requested", "time_requested", "dept_contact",
                        "description", "requestor", "mo_type", "status", "date_to_perform",
                        "date_end_req", "date_start_req", "to_bl_id", "to_fl_id", "to_rm_id",
                        "em_id", "from_bl_id", "from_fl_id", "from_rm_id", "phone",
                        "phone_dept_contact", "dv_id", "dp_id", "from_dv_id", "from_dp_id",
                        "from_phone", "to_dv_id", "to_dp_id", "to_phone", "project_id",
                        "activity_log_id"
                
                });
        if (SpaceTransactionUtil.isNoVpa()) {
            dataSource.setApplyVpaRestrictions(false);
        }
        return dataSource;

    }

    /**
     * Return afm_procs datasource.
     *
     * @return processDS
     */
    public static DataSource getProcessDataSource() {
        final DataSource processDS =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.AFM_PROCESSES,
                    new String[] { SpaceConstants.ACTIVITY_ID, SpaceConstants.PROCESS_ID,
                        SpaceConstants.IS_ACTIVE });
        if (SpaceTransactionUtil.isNoVpa()) {
            processDS.setApplyVpaRestrictions(false);
        }
        return processDS;
    }

    /**
     * Return move project datasource.
     *
     * @return DataSource project datasource
     */
    public static DataSource getProjectDataSource() {
        final DataSource projDS =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.PROJECT, new String[] {
                        SpaceConstants.PROJECT_ID, SpaceConstants.PROJECT_TYPE,
                        SpaceConstants.DEPT_CONTACT, SpaceConstants.BL_ID,
                        SpaceConstants.DATE_START, SpaceConstants.STATUS, SpaceConstants.DATE_END,
                        SpaceConstants.CONTACT_ID, SpaceConstants.REQUESTOR,
                        SpaceConstants.DESCRIPTION, SpaceConstants.DV_ID, SpaceConstants.DP_ID,
                        SpaceConstants.PHONE_REQ, SpaceConstants.PHONE_DEPT_CONTACT });
        if (SpaceTransactionUtil.isNoVpa()) {
            projDS.setApplyVpaRestrictions(false);
        }
        return projDS;
    }

    /**
     * Return rm datasource.
     *
     * @return DataSource rm datasource
     */
    public static DataSource getRmDataSource() {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(new String[] { SpaceConstants.T_RM,
                        SpaceConstants.RMCAT }, new String[] {
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.BL_ID,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.FL_ID,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_ID,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.DV_ID,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.DP_ID,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_CAT,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_TYPE,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_STD,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.CAP_EM,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.PRORATE,
                        SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.AREA,
                        SpaceConstants.T_RM + SpaceConstants.DOT + "count_em",
                        SpaceConstants.RMCAT + SpaceConstants.DOT + SpaceConstants.OCCUPIABLE });
        if (SpaceTransactionUtil.isNoVpa()) {
            dataSource.setApplyVpaRestrictions(false);
        }
        return dataSource;
    }

    /**
     * Return rmpct datasource.
     *
     * @return DataSource rmpct datasource
     */
    public static DataSource getRmpctDataSource() {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.RMPCT, new String[] {
                        SpaceConstants.PCT_ID, SpaceConstants.PARENT_PCT_ID,
                        SpaceConstants.DATE_START, SpaceConstants.EM_ID, SpaceConstants.BL_ID,
                        SpaceConstants.FL_ID, SpaceConstants.RM_ID, SpaceConstants.FROM_BL_ID,
                        SpaceConstants.FROM_FL_ID, SpaceConstants.FROM_RM_ID,
                        SpaceConstants.STATUS, SpaceConstants.ACTIVITY_LOG_ID,
                        SpaceConstants.DV_ID, SpaceConstants.DP_ID, SpaceConstants.RM_CAT,
                        SpaceConstants.RM_TYPE, SpaceConstants.USER_NAME,
                        SpaceConstants.PRIMARY_EM, SpaceConstants.PRIMARY_RM,
                        SpaceConstants.PCT_SPACE, SpaceConstants.PRORATE, SpaceConstants.DATE_END,
                        SpaceConstants.MO_ID });
        if (SpaceTransactionUtil.isNoVpa()) {
            dataSource.setApplyVpaRestrictions(false);
        }
        return dataSource;
    }

    /**
     * @param mainTable rmpct or hrmpct that will join rmcat and bl.
     *
     * @return DataSource rmpct join bl and rm and rmcat
     */
    public static DataSource getRmpctHrmpctJoinBlAndRmAndRmcat(final String mainTable) {

        final DataSource dsRmpct = DataSourceFactory.createDataSource();
        dsRmpct.addTable(mainTable, DataSource.ROLE_MAIN);
        dsRmpct.addTable(SpaceConstants.T_BL, DataSource.ROLE_STANDARD);
        dsRmpct.addTable(SpaceConstants.T_RM, DataSource.ROLE_STANDARD);
        dsRmpct.addTable(SpaceConstants.RMCAT, DataSource.ROLE_STANDARD);

        dsRmpct.addField(mainTable, SpaceConstants.PCT_ID);
        dsRmpct.addField(mainTable, SpaceConstants.DATE_START);
        dsRmpct.addField(mainTable, SpaceConstants.DATE_END);
        dsRmpct.addField(mainTable, SpaceConstants.PCT_SPACE);
        dsRmpct.addField(mainTable, SpaceConstants.PCT_TIME);
        dsRmpct.addField(mainTable, SpaceConstants.DAY_PART);
        dsRmpct.addField(mainTable, SpaceConstants.DV_ID);
        dsRmpct.addField(mainTable, SpaceConstants.DP_ID);
        dsRmpct.addField(mainTable, SpaceConstants.BL_ID);
        dsRmpct.addField(mainTable, SpaceConstants.FL_ID);
        dsRmpct.addField(mainTable, SpaceConstants.RM_ID);
        dsRmpct.addField(mainTable, SpaceConstants.RM_CAT);
        dsRmpct.addField(mainTable, SpaceConstants.AREA_RM);
        dsRmpct.addField(mainTable, SpaceConstants.PRORATE);
        dsRmpct.addField(mainTable, SpaceConstants.STATUS);
        dsRmpct.addField(mainTable, SpaceConstants.EM_ID);

        dsRmpct.addField(SpaceConstants.T_RM, SpaceConstants.HOTELABLE);
        dsRmpct.addField(SpaceConstants.T_RM, SpaceConstants.AREA);
        dsRmpct.addField(SpaceConstants.T_RM, SpaceConstants.CAP_EM);
        dsRmpct.addField(SpaceConstants.T_BL, SpaceConstants.SITE_ID);
        dsRmpct.addField(SpaceConstants.RMCAT, SpaceConstants.SUPERCAT);
        dsRmpct.addField(SpaceConstants.RMCAT, SpaceConstants.OCCUPIABLE);
        if (SpaceTransactionUtil.isNoVpa()) {
            dsRmpct.setApplyVpaRestrictions(false);
        }
        return dsRmpct;
    }

    /**
     * Return rmpct join activity log datasource.
     *
     * @return DataSource rmpct join activity log datasource
     */
    public static DataSource getRmpctJoinActivityLogDataSource() {

        final DataSource dsRmpct = DataSourceFactory.createDataSource();
        dsRmpct.addTable(SpaceConstants.RMPCT, DataSource.ROLE_MAIN);
        dsRmpct.addTable(SpaceConstants.ACTIVITY_LOG, DataSource.ROLE_STANDARD);

        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.BL_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.FL_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.RM_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.FROM_BL_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.FROM_FL_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.FROM_RM_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.DV_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.DP_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.RM_CAT);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.RM_TYPE);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.PCT_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.EM_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.PRORATE);
        dsRmpct.addField(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_LOG_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID);
        dsRmpct.addField(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE);
        dsRmpct.addSort(SpaceConstants.RMPCT, SpaceConstants.BL_ID, DataSource.SORT_DESC);
        dsRmpct.addSort(SpaceConstants.RMPCT, SpaceConstants.FL_ID, DataSource.SORT_DESC);
        dsRmpct.addSort(SpaceConstants.RMPCT, SpaceConstants.RM_ID, DataSource.SORT_DESC);
        dsRmpct.addSort(SpaceConstants.RMPCT, SpaceConstants.DATE_START, DataSource.SORT_DESC);
        if (SpaceTransactionUtil.isNoVpa()) {
            dsRmpct.setApplyVpaRestrictions(false);
        }
        return dsRmpct;
    }

    /**
     *
     * @return DataSource rmpct join rmcat.
     */
    public static DataSource getRmpctJoinRmcat() {

        final DataSource dsRmpct = DataSourceFactory.createDataSource();
        dsRmpct.addTable(SpaceConstants.RMPCT, DataSource.ROLE_MAIN);
        dsRmpct.addTable(SpaceConstants.RMCAT, DataSource.ROLE_STANDARD);

        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.PCT_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.DATE_START);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.DATE_END);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.PCT_SPACE);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.DAY_PART);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.DV_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.DP_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.BL_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.FL_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.RM_ID);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.RM_CAT);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.RM_TYPE);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.STATUS);
        dsRmpct.addField(SpaceConstants.RMPCT, SpaceConstants.EM_ID);

        dsRmpct.addField(SpaceConstants.RMCAT, SpaceConstants.OCCUPIABLE);
        if (SpaceTransactionUtil.isNoVpa()) {
            dsRmpct.setApplyVpaRestrictions(false);
        }
        return dsRmpct;
    }

    /**
     *
     * Return afm_roleprocs datasource.
     *
     * @return DataSource project datasource
     */
    public static DataSource getRoleProcessDataSource() {
        final DataSource roleProcsDS =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.AFM_ROLEPROCS,
                    new String[] { SpaceConstants.ACTIVITY_ID, SpaceConstants.PROCESS_ID,
                        SpaceConstants.ROLE_NAME, SpaceConstants.TRANSFER_STATUS });
        if (SpaceTransactionUtil.isNoVpa()) {
            roleProcsDS.setApplyVpaRestrictions(false);
        }
        return roleProcsDS;
    }

    /**
     * @return " is null" for null value, or equal clause for not null value.
     *
     * @param value string type of field value
     */
    public static String getSqlClauseForFieldValue(final String value) {

        return (value == null || "".equals(value)) ? SpaceConstants.IS_NULL : "= '" + value
                + "'        ";
    }

    /**
     * Return AFM_WF_RULES datasource.
     *
     * @return DataSourceFactory.createDataSourceForFields(SpaceConstants.AFM_WF_RULES, new String[]
     *         { SpaceConstants.IS_ACTIVE, SpaceConstants.ACTIVITY_ID, SpaceConstants.RULE_ID});
     */
    public static DataSource getWfRulesDatasource() {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(SpaceConstants.AFM_WF_RULES,
                    new String[] { SpaceConstants.IS_ACTIVE, SpaceConstants.ACTIVITY_ID,
                            SpaceConstants.RULE_ID });
        if (SpaceTransactionUtil.isNoVpa()) {
            dataSource.setApplyVpaRestrictions(false);
        }
        return dataSource;
    }

    /**
     * @return boolean value of given activity parameter having value of '1' or '0'.
     *
     * @param parameter String parameter name
     */
    public static boolean loadBooleanActivityParameter(final String parameter) {
        boolean value = false;
        // Prepare needed activity parameters in below process
        final String paraValue =
                EventHandlerBase.getActivityParameterString(ContextStore.get()
                    .getEventHandlerContext(), SpaceConstants.SPACE_ACTIVITY, parameter);
        if (StringUtil.notNullOrEmpty(paraValue) && PARAMETER_VALUE_1.equals(paraValue)) {
            value = true;
        }
        return value;
    }

    /**
     * set string value of given activity parameter having to '1' or '0'.
     *
     * @param parameterName String parameter name
     * @param parameterValue boolean parameter value: true or false
     */
    public static void setBooleanActivityParameterset(final String parameterName,
            final boolean parameterValue) {
        final DataSource activityParameterDS = SpaceTransactionUtil.getActivityParamsDataSource();

        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();
        resDef.addClause(SpaceConstants.AFM_ACTIVITY_PARAMS, SpaceConstants.ACTIVITY_ID,
            SpaceConstants.SPACE_ACTIVITY, Operation.EQUALS);
        resDef.addClause(SpaceConstants.AFM_ACTIVITY_PARAMS, SpaceConstants.PARAM_ID,
            parameterName, Operation.EQUALS);

        final List<DataRecord> paraList = activityParameterDS.getRecords(resDef);

        if (!paraList.isEmpty()) {
            final DataRecord paraRecord = paraList.get(0);
            paraRecord.setValue(SpaceConstants.AFM_ACTIVITY_PARAMS + SpaceConstants.DOT
                + "param_value", PARAMETER_VALUE_1);
            activityParameterDS.updateRecord(paraRecord);
        }
    }
}