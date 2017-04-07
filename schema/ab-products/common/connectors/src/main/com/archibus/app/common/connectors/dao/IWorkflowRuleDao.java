package com.archibus.app.common.connectors.dao;

import com.archibus.app.common.connectors.domain.WorkflowRuleConfig;
import com.archibus.core.dao.IDao;

/**
 * Interface to be implemented by classes that access workflow rule configuration.
 *
 * @author cole
 * @since 21.4
 *
 */
public interface IWorkflowRuleDao extends IDao<WorkflowRuleConfig> {
    /**
     * Retrieve a workflow rule for the given primary keys.
     *
     * @param activityId the ARCHIBUS activity this rule is defined under.
     * @param ruleId the identifier for this rule within it's ARCHIBUS activity.
     * @return the workflow rule.
     */
    WorkflowRuleConfig get(final String activityId, final String ruleId);
}
