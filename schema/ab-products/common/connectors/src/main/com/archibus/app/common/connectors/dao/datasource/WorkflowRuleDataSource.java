package com.archibus.app.common.connectors.dao.datasource;

import com.archibus.app.common.connectors.dao.IWorkflowRuleDao;
import com.archibus.app.common.connectors.domain.WorkflowRuleConfig;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;

/**
 * A data access object for accessing workflow rule configuration in a database and converting it to
 * a spring bean.
 *
 * @author cole
 *
 */
public class WorkflowRuleDataSource extends ObjectDataSourceImpl<WorkflowRuleConfig> implements
IWorkflowRuleDao {
    
    /**
     * The table in a database that stores workflow rule configurations.
     */
    public static final String WORKFLOW_RULE_TABLE_NAME = "afm_wf_rules";
    
    /**
     * A primary key identifier for the afm_workflow rule table, identifying the parent activity.
     */
    public static final String WORKFLOW_RULE_ACTIVITY_ID_FIELD_NAME = "activity_id";
    
    /**
     * A primary key identifier for the afm_workflow rule table, identifying a rule within an
     * activity.
     */
    public static final String WORKFLOW_RULE_ID_FIELD_NAME = "rule_id";
    
    /**
     * A description of the rule, intended for the end user.
     */
    private static final String DESCRIPTION_FIELD_NAME = "description";
    
    /**
     * The Spring bean for accessing workflow rule configuration in memory.
     */
    private static final String WORKFLOW_RULE_BEAN_NAME = "connectorWorkflowRule";
    
    /**
     * Field mapping between the workflow rule configuration in the database and in memory.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { WORKFLOW_RULE_ACTIVITY_ID_FIELD_NAME, "activityId" },
            { WORKFLOW_RULE_ID_FIELD_NAME, "ruleId" },
            { DESCRIPTION_FIELD_NAME, DESCRIPTION_FIELD_NAME }, { "is_active", "isActiveDb" },
            { "rule_type", "ruleTypeDb" }, { "xml_rule_props", "xmlRuleProps" },
            { "xml_sched_props", "xmlSchedProps" } };
    
    /**
     * Create a data access object for accessing workflow rule configuration in a database and
     * converting it to a spring bean.
     */
    public WorkflowRuleDataSource() {
        super(WORKFLOW_RULE_BEAN_NAME, WORKFLOW_RULE_TABLE_NAME);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return DaoUtil.getFieldsToProperties(FIELDS_TO_PROPERTIES);
    }
    
    /**
     * {@inheritDoc}
     */
    public WorkflowRuleConfig get(final String activityId, final String ruleId) {
        final PrimaryKeysValues wfrPrimaryKeys = new PrimaryKeysValues();
        final DataRecordField activityIdField = new DataRecordField();
        activityIdField.setName(WorkflowRuleDataSource.WORKFLOW_RULE_TABLE_NAME + '.'
                + WorkflowRuleDataSource.WORKFLOW_RULE_ACTIVITY_ID_FIELD_NAME);
        activityIdField.setValue(activityId);
        final DataRecordField ruleIdField = new DataRecordField();
        ruleIdField.setName(WorkflowRuleDataSource.WORKFLOW_RULE_TABLE_NAME + '.'
                + WorkflowRuleDataSource.WORKFLOW_RULE_ID_FIELD_NAME);
        ruleIdField.setValue(ruleId);
        
        wfrPrimaryKeys.getFieldsValues().add(activityIdField);
        wfrPrimaryKeys.getFieldsValues().add(ruleIdField);
        
        return get(wfrPrimaryKeys);
    }
}
