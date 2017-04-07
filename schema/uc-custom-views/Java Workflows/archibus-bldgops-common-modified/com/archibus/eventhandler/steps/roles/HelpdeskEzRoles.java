package com.archibus.eventhandler.steps.roles;

import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.steps.HelpdeskRoles;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * EZ Helpdesk Roles Tool.
 *
 * Elizabeth Reynolds August 25, 2013
 */
public class HelpdeskEzRoles extends EventHandlerBase {

    /**
     * Parameter name tableName.
     *
     */
    private static final String TABLE_NAME = "tableName";

    /**
     * Parameter name fieldName.
     *
     */
    private static final String FIELD_NAME = "fieldName";

    /**
     * Parameter name role.
     *
     */
    private static final String ROLE = "role";

    /**
     * field name role helpdesk_roles.default_em.
     *
     */
    private static final String DEFAULT_EM = "helpdesk_roles.default_em";

    /**
     * field name role helpdesk_roles.security_role.
     *
     */
    private static final String SECURITY_ROLE = "helpdesk_roles.security_role";

    /**
     * field name role helpdesk_roles.em_field.
     *
     */
    private static final String EM_FIELD = "helpdesk_roles.em_field";

    /**
     * field name role helpdesk_roles.match_em.
     *
     */
    private static final String MATCH_EM = "helpdesk_roles.match_em";

    /**
     * field name role helpdesk_roles.match_request.
     *
     */
    private static final String MATCH_REQUEST = "helpdesk_roles.match_request";

    /**
     * field name role helpdesk_roles.sql_query.
     *
     */
    private static final String SQL_QUERY = "helpdesk_roles.sql_query";

    /**
     * field name role helpdesk_roles.role.
     *
     */
    private static final String HELPDESK_ROLE = "helpdesk_roles.role";

    /**
     * field name role helpdesk_roles.step_type.
     *
     */
    private static final String STEP_TYPE = "helpdesk_roles.step_type";

    /**
     * TABLE name role helpdesk_role.
     *
     */
    private static final String HELPDESK_ROLE_TABLE = "helpdesk_roles";

    /**
     * table name em.
     *
     */
    private static final String EM_TABLE = "em";

    /**
     * field name em_id.
     *
     */
    private static final String EM_ID = "em_id";

    /**
     * dot.
     *
     */
    private static final String DOT = ".";

    /**
     * semicolon.
     *
     */
    private static final String SEMICOLON = ";";

    /**
     * right bracket.
     *
     */
    private static final String RIGHT_BRACKET = "']";

    /**
     * TYPE negative one.
     *
     */
    private static final int TYPE_NEATIVE_ONE = -1;

    /**
     * TYPE one.
     *
     */
    private static final int TYPE_ONE = 1;

    /**
     * TYPE two.
     *
     */
    private static final int TYPE_TWO = 2;

    /**
     * TYPE four.
     *
     */
    private static final int TYPE_FOUR = 4;

    /**
     * TYPE five.
     *
     */
    private static final int TYPE_FIVE = 5;

    /**
     * TYPE six.
     *
     */
    private static final int TYPE_SIX = 6;

    /**
     * TYPE seven.
     *
     */
    private static final int TYPE_SEVEN = 7;

    /**
     * TYPE eight.
     *
     */
    private static final int TYPE_EIGHT = 8;

    /**
     * TYPE NINE.
     *
     */
    private static final int TYPE_NINE = 9;

    /**
     * TYPE one.
     *
     */
    private static final int TYPE_TEN = 10;

    /**
     * TYPE twelve.
     *
     */
    private static final int TYPE_TWELVE = 12;

    /**
     * employee datasource.
     */
    private DataSource emDs;

    /**
     * request datasource.
     */
    private DataSource requestDs;

    /**
     * EZ Helpdesk Roles Tool: Return list of employees based on parameters filled into the
     * additional fields in the helpdesk_roles table Always returns at least the backup default
     * employee.
     *
     * Elizabeth Reynolds August 25, 2013
     *
     * @param context Workflow rule execution context
     * @return grid list
     */
    public List<String> getList(final EventHandlerContext context) {

        // get wr or activity_log table name and pkey of request record from context
        final String tableName = context.getString(TABLE_NAME);
        final String fieldName = context.getString(FIELD_NAME);
        final String pkField = tableName + DOT + fieldName;
        final int pkValue = context.getInt(pkField);

        // get role record fields
        final String roleName = context.getString(ROLE);
        // String stepType = context.getString("step_type");
        final String[] roleFields = { DEFAULT_EM, SECURITY_ROLE, EM_FIELD, MATCH_EM, MATCH_REQUEST,
                SQL_QUERY, HELPDESK_ROLE, STEP_TYPE };
        final DataSource roleDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_ROLE_TABLE, roleFields);
        // EAR edit 2014-02-06 remove VPA restrictions from datasources
        roleDs.setApplyVpaRestrictions(false);
        roleDs.addRestriction(Restrictions.eq(HELPDESK_ROLE_TABLE, ROLE, roleName));

        final DataRecord roleRecord = roleDs.getRecord();

        // Get restriction criteria
        final String defaultEm = roleRecord.getString(DEFAULT_EM);
        final String securityRole = roleRecord.getString(SECURITY_ROLE);
        final String emField = roleRecord.getString(EM_FIELD);
        final String matchEm = roleRecord.getString(MATCH_EM);
        final String matchRequest = roleRecord.getString(MATCH_REQUEST);
        final String sqlQuery = roleRecord.getString(SQL_QUERY);

        // Process restriction criteria
        this.emDs = DataSourceFactory.createDataSource().addTable(EM_TABLE).addField(EM_ID);
        // EAR edit 2014-02-06 remove VPA restrictions from datasources
        this.emDs.setApplyVpaRestrictions(false);
        this.requestDs = DataSourceFactory.createDataSource().addTable(tableName);
        // EAR edit 2014-02-06 remove VPA restrictions from datasources
        this.requestDs.setApplyVpaRestrictions(false);

        if (StringUtil.notNullOrEmpty(emField)) {
            this.requestDs.addField(emField);
            this.requestDs.addRestriction(Restrictions.eq(tableName, fieldName, pkValue));
            final DataRecord requestRecord = this.requestDs.getRecord();
            final String emValue = requestRecord.getString(tableName + DOT + emField);
            this.emDs.addRestriction(Restrictions.eq(EM_TABLE, EM_ID, emValue));
        } else if (StringUtil.notNullOrEmpty(sqlQuery)) {
            parseSql(context, sqlQuery, tableName, fieldName, pkValue);
        } else {
            if (StringUtil.notNullOrEmpty(matchEm)) {
                parseEmFields(matchEm);
            }
            if (StringUtil.notNullOrEmpty(matchRequest)) {
                parseRequestFields(matchRequest, tableName, fieldName, pkValue);
            }
            if (StringUtil.notNullOrEmpty(securityRole)) {
                this.emDs.addRestriction(
                    Restrictions.sql("email in (select email from afm_users where role_name = '"
                            + securityRole + "')"));
            }
        }

        // if no restrictions were successfully parsed, add 1=0 to force no returns
        if (this.emDs.getRestrictions().size() == 0) {
            this.emDs.addRestriction(Restrictions.sql("1=0"));
        }

        // Convert records to list of em_id values
        final List<String> employees = new ArrayList<String>();

        final List<DataRecord> emRecords = this.emDs.getRecords();
        for (final DataRecord emRecord : emRecords) {
            employees.add(notNull(emRecord.getValue("em.em_id")));
        }

        // Always return at least one employee - the default em defined in the roles table
        if (employees.isEmpty()) {
            employees.add(defaultEm);
        }

        return employees;
    }

    /**
     * Parse request fields.
     *
     * @param matchRequest match request
     * @param tableName table name
     * @param fieldName field name
     * @param pkValue primary key value
     */
    private void parseRequestFields(final String matchRequest, final String tableName,
            final String fieldName, final int pkValue) {
        final String[] fields = matchRequest.split(SEMICOLON);
        for (final String field : fields) {
            this.requestDs.addField(field);
        }
        this.requestDs.addRestriction(Restrictions.eq(tableName, fieldName, pkValue));
        final DataRecord requestRecord = this.requestDs.getRecord();
        String fieldValue;
        for (final String field : fields) {
            fieldValue = requestRecord.getString(tableName + DOT + field);
            this.emDs.addRestriction(Restrictions.eq(EM_TABLE, field, fieldValue));
        }
    }

    /**
     * Parse em field.
     *
     * @param matchEm match em
     */
    private void parseEmFields(final String matchEm) {
        final String[] fields = matchEm.split(SEMICOLON);
        String[] fieldAndValue;
        for (final String field : fields) {
            fieldAndValue = field.split(":");
            this.emDs.addRestriction(Restrictions.eq(EM_TABLE, fieldAndValue[0], fieldAndValue[1]));
        }
    }

    /**
     * Parse sql.
     *
     * @param context context
     * @param sqlQuery sql query
     * @param tableName table name
     * @param fieldName field name
     * @param pkValue pkey value
     */
    private void parseSql(final EventHandlerContext context, final String sqlQuery,
            final String tableName, final String fieldName, final int pkValue) {
        this.emDs.addRestriction(Restrictions.sql(sqlQuery));
        final String[] parameters = sqlQuery.split("\\$\\{parameters\\['");
        for (final String parameter : parameters) {
            if (parameter.indexOf(RIGHT_BRACKET) > 0) {
                this.requestDs.addField(parameter.substring(0, parameter.indexOf(RIGHT_BRACKET)));
            }
        }
        this.requestDs.addRestriction(Restrictions.eq(tableName, fieldName, pkValue));
        final DataRecord requestRecord = this.requestDs.getRecord();
        for (final String parameter : parameters) {
            if (parameter.indexOf(RIGHT_BRACKET) > 0) {
                final String parameterName =
                        parameter.substring(0, parameter.indexOf(RIGHT_BRACKET));
                final Integer type = com.archibus.eventhandler.EventHandlerBase
                    .getFieldSqlType(context, tableName, parameterName);
                final String dataType = convertType(type);
                this.emDs.addParameter(parameterName, "", dataType);

                setParameterValue(requestRecord, tableName, parameterName, type);
            }
        }
    }

    /**
     * Set parameter value.
     *
     * @param requestRecord request record
     * @param tableName table name
     * @param parameter parameter
     * @param type type
     */
    private void setParameterValue(final DataRecord requestRecord, final String tableName,
            final String parameter, final Integer type) {
        if (this.isText(type)) {
            final String value = requestRecord.getString(tableName + DOT + parameter);
            this.emDs.setParameter(parameter, value);
        } else if (this.isInteger(type)) {
            final int value = requestRecord.getInt(tableName + DOT + parameter);
            this.emDs.setParameter(parameter, value);
        } else if (isNumber(type)) {
            final Double value = requestRecord.getDouble(tableName + DOT + parameter);
            this.emDs.setParameter(parameter, value);
        } else if (type == TYPE_NINE || type == TYPE_TEN) {
            final Date value = requestRecord.getDate(tableName + DOT + parameter);
            this.emDs.setParameter(parameter, value);
        }
    }

    /**
     * convert type.
     *
     * @param type type
     * @return convert result
     */
    private String convertType(final Integer type) {
        String result = null;
        if (this.isText(type)) {
            result = DataSource.DATA_TYPE_TEXT;
        } else if (this.isInteger(type)) {
            result = DataSource.DATA_TYPE_INTEGER;
        } else if (isNumber(type)) {
            result = DataSource.DATA_TYPE_NUMBER;
        } else if (type == TYPE_NINE) {
            result = DataSource.DATA_TYPE_DATE;
        } else if (type == TYPE_TEN) {
            result = DataSource.DATA_TYPE_TIME;
        }
        return result;
    }

    /**
     * is text field.
     *
     * @param type type
     * @return test result
     */
    private boolean isText(final Integer type) {
        return type == TYPE_ONE || type == TYPE_TWELVE || type == TYPE_NEATIVE_ONE;
    }

    /**
     * is integer field.
     *
     * @param type type
     * @return test result
     */
    private boolean isInteger(final Integer type) {
        return type == TYPE_FOUR || type == TYPE_FIVE;
    }

    /**
     * is number field.
     *
     * @param type type
     * @return test result
     */
    private boolean isNumber(final Integer type) {
        return type == TYPE_TWO || type == TYPE_SIX || type == TYPE_SEVEN || type == TYPE_EIGHT;
    }

    /**
     * test service desk role.
     *
     * @param context context
     */
    public void testServiceDeskRole(final EventHandlerContext context) {
        final String role = context.getString(ROLE);
        final String tableName = context.getString(TABLE_NAME);
        final String fieldName = context.getString(FIELD_NAME);
        final int id = context.getInt("id");
        List<String> ems = null;
        ems = HelpdeskRoles.getEmployeesFromHelpdeskRole(context, role, tableName, fieldName, id);

        JSONArray jsonEms = null;
        if (ems == null) {
            jsonEms = new JSONArray();

        } else {
            jsonEms = new JSONArray(ems);
        }

        context.addResponseParameter("jsonExpression", jsonEms.toString());
    }
}
