package com.archibus.app.common.connectors.domain;

import com.archibus.jobmanager.WorkflowRuleType;

/**
 * Configuration for an ARCHIBUS workflow rule.
 *
 * @author cole
 *
 */
public class WorkflowRuleConfig {
    /**
     * ARCHBIUS activity for this rule.
     */
    private String activityId;

    /**
     * ARCHBIUS identifier for this rule within the given activity.
     */
    private String ruleId;

    /**
     * User friendly description of this rule.
     */
    private String description;

    /**
     * Whether this rule may be run.
     */
    private Boolean isActive;

    /**
     * The type of rule (for connector purposes, only MESSAGE).
     */
    private WorkflowRuleType ruleType;

    /**
     * The properties for the rule, including class name and static inputs.
     */
    private String xmlRuleProps;

    /**
     * Properties for scheduling, such as intervals, start time, and/or a cron expression.
     */
    private String xmlSchedProps;

    /**
     * @return ARCHIBUS activity for this rule.
     */
    public String getActivityId() {
        return this.activityId;
    }

    /**
     * @return ARCHBIUS identifier for this rule within the given activity.
     */
    public String getRuleId() {
        return this.ruleId;
    }

    /**
     * @return the type of rule (for connector purposes, only MESSAGE)
     */
    public String getRuleTypeDb() {
        return this.ruleType.toString();
    }

    /**
     * @return the enumerated type of rule (for connector purposes, only MESSAGE)
     */
    public WorkflowRuleType getRuleType() {
        return this.ruleType;
    }

    /**
     * @return the properties for the rule, including class name and static inputs.
     */
    public String getXmlRuleProps() {
        return this.xmlRuleProps;
    }

    /**
     * @return properties for scheduling, such as intervals, start time, and/or a cron expression.
     */
    public String getXmlSchedProps() {
        return this.xmlSchedProps;
    }

    /**
     * @return whether this rule may be run.
     */
    public Boolean getIsActive() {
        return this.isActive;
    }

    /**
     * @return whether this rule may be run (1 = yes, 0 = no)
     */
    public Integer getIsActiveDb() {
        return this.isActive == null ? null : (this.isActive ? 1 : 0);
    }

    /**
     * @return user friendly description of this rule.
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * @param activityId ARCHBIUS activity for this rule.
     */
    public void setActivityId(final String activityId) {
        this.activityId = activityId;
    }

    /**
     * @param ruleId ARCHBIUS identifier for this rule within the given activity.
     */
    public void setRuleId(final String ruleId) {
        this.ruleId = ruleId;
    }

    /**
     * @param description user friendly description of this rule.
     */
    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * @param isActiveDb whether this rule may be run (1 = yes, 0 = no).
     */
    public void setIsActiveDb(final Integer isActiveDb) {
        this.isActive = isActiveDb.intValue() != 0;
    }

    /**
     * @param isActive whether this rule may be run.
     */
    public void setIsActive(final Boolean isActive) {
        this.isActive = isActive;
    }

    /**
     * @param ruleTypeDb the type of rule (for connector purposes, only MESSAGE)
     */
    public void setRuleTypeDb(final String ruleTypeDb) {
        this.ruleType = WorkflowRuleType.fromString(ruleTypeDb);
    }

    /**
     * @param ruleType the enumerated type of rule (for connector purposes, only MESSAGE)
     */
    public void setRuleType(final WorkflowRuleType ruleType) {
        this.ruleType = ruleType;
    }

    /**
     * @param xmlRuleProps the properties for the rule, including class name and static inputs.
     */
    public void setXmlRuleProps(final String xmlRuleProps) {
        this.xmlRuleProps = xmlRuleProps;
    }

    /**
     * @param xmlSchedProps properties for scheduling, such as intervals, start time, and/or a cron
     *            expression.
     */
    public void setXmlSchedProps(final String xmlSchedProps) {
        this.xmlSchedProps = xmlSchedProps;
    }
}
