package com.archibus.app.common.connectors.service;

import java.text.ParseException;
import java.util.*;

import org.apache.log4j.Logger;
import org.dom4j.*;
import org.quartz.CronTrigger;

import com.archibus.app.common.connectors.dao.IConnectorDao;
import com.archibus.app.common.connectors.dao.datasource.*;
import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ExecFlag;
import com.archibus.app.common.connectors.transfer.common.ConnectorObfuscationUtil;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.JobManager.ThreadSafe;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Workflow rules for connectors.
 *
 * @author cole
 *
 */
public class ConnectorService {

    /**
     * XPath for the schedule in the schedule XML.
     */
    private static final String XPATH_SCHED = "//xml_schedule_properties/schedule";

    /**
     * XPath for the configuration of frequency of scheduled connector execution.
     */
    private static final String XPATH_SCHED_REPEAT_INTERVAL = XPATH_SCHED
            + "/simple/@repeatInterval";

    /**
     * XPath for the configuration of a CRON expression describing when a scheduled connector should
     * run.
     */
    private static final String XPATH_SCHED_CRON_EXPRESSION = XPATH_SCHED + "/cron/@expression";

    /**
     * XPath for the configuration of the start time for running a scheduled connector.
     */
    private static final String XPATH_SCHED_START = XPATH_SCHED + "/@startTime";

    /**
     * XPath for the configuration of whether scheduled connector execution should occur when Web
     * Central starts.
     */
    private static final String XPATH_SCHED_RUN_ON_START = XPATH_SCHED + "/@runOnStartup";

    /**
     * A place holder for start time in a scheduled connector workflow rule's schedule.
     */
    private static final String XML_SCHED_PROPS_START_TIME_PARAM = "${startTime}";

    /**
     * A place holder for running on startup in a scheduled connector workflow rule's schedule.
     */
    private static final String XML_SCHED_PROPS_RUN_ON_STARTUP_PARAM = "${runOnStartup}";

    /**
     * A place holder for repeat interval/cron expression in a scheduled connector workflow rule's
     * schedule.
     */
    private static final String XML_SCHED_PROPS_INTERVAL_ELEMENT_PARAM = "${intervalElement}";

    /**
     * A template for a scheduled connector workflow rule's schedule.
     */
    private static final String XML_SCHED_PROPS_TEMPLATE =
            "<xml_schedule_properties><schedule startTime=\"" + XML_SCHED_PROPS_START_TIME_PARAM
                    + "\" endTime=\"\" runOnStartup=\"" + XML_SCHED_PROPS_RUN_ON_STARTUP_PARAM
                    + "\">" + XML_SCHED_PROPS_INTERVAL_ELEMENT_PARAM
                    + "</schedule></xml_schedule_properties>";

    /**
     * A space, used as a delimiter.
     */
    private static final String SPACE = " ";

    /**
     * The delimiter for date and time in a scheduled start time.
     */
    private static final String DATE_TIME_DELIMITER = SPACE;

    /**
     *
     */
    private static final String DATE_TIME_NOW = "now";

    /**
     * The value in a cron expression that indicates the value is arbitrary.
     */
    private static final String CRON_WILDCARD = "?";

    /**
     * The delimiter for parts of a cron expression.
     */
    private static final String CRON_DELIMITER = SPACE;

    /**
     * The minimum length of a valid cron expression.
     */
    private static final int CRON_MIN_LENGTH = 6;

    /**
     * The maximum length of a valid cron expression.
     */
    private static final int CRON_MAX_LENGTH = 7;

    /**
     * The index in a cron expression to the day of the month.
     */
    private static final int CRON_DAY_OF_MONTH_INDEX = 3;

    /**
     * The index in a cron expression to the day of the week.
     */
    private static final int CRON_DAY_OF_WEEK_INDEX = 5;

    /**
     * A string representation of true.
     */
    private static final String TRUE = "true";

    /**
     * A string representation of false.
     */
    private static final String FALSE = "false";

    /**
     * A response indicating successful execution.
     */
    private static final String SUCCESS_STATUS_MESSAGE = "Success";

    /**
     * Simple XML element terminator.
     */
    private static final String ELEMENT_TERMINATOR = "/>";
    
    /**
     * For logging non-fatal errors.
     */
    private final Logger log = Logger.getLogger(ConnectorService.class);
    
    /**
     * Job manager.
     */
    private ThreadSafe jobManager;

    /**
     * Run a particular connector.
     *
     * @param connectorId the identifier for the connector.
     */
    public void runConnector(final String connectorId) {
        this.jobManager.startJob(new ConnectorJob(connectorId));
    }

    /**
     * Run a particular connector, based on a connector provided in the workflow rule's context.
     */
    public void executeConnector() {
        final IConnectorDao connectorDao = new ConnectorDataSource();
        final ConnectorConfig connector = connectorDao.createFromContext();
        runConnector(connector.getConnectorId());
    }

    /**
     * Execute connectors referred by by context with a list of connector_id's delimited by a colon.
     */
    public void executeScheduledConnectors() {
        final Iterator<?> parameters =
                ContextStore.get().getEventHandlerContext().getInputs().entrySet().iterator();
        while (parameters.hasNext()) {
            final Map.Entry<?, ?> parameter = (Map.Entry<?, ?>) parameters.next();
            final String key = parameter.getKey().toString();
            if (key.startsWith("connector_id")) {
                runConnector(key.split(":")[1]);
            }
        }
    }
    
    /**
     * Encrypt a string.
     *
     * @param parameter the string to be encrypted.
     * @return the encrypted version of the string.
     */
    public String encodeString(final String parameter) {
        return ConnectorObfuscationUtil.encodeParameter(parameter);
    }

    /**
     * Schedule a connector using a scheduled workflow rule.
     *
     * @param activityId the activity for the workflow rule to be created.
     * @param ruleId the rule id for the workflow rule to be created.
     * @param connectorId the connector id for the connector to be executed on the schedule.
     * @param interval the cron expression or repeat interval for the connector (depends on
     *            useCronExpression)
     * @param startDate the first day to execute the connector.
     * @param startTime the first time to execute the connector.
     * @param useCronExpression whether interval is a cron expression.
     * @return an error message or "Success" if it was scheduled.
     */
    public String setScheduledConnectorRule(final String activityId, final String ruleId,
            final String connectorId, final String interval, final String startDate,
            final String startTime, final boolean useCronExpression) {
        String statusMessage = SUCCESS_STATUS_MESSAGE;
        final String xmlRuleProps =
                "<xml_rule_properties description=\"AUTOCREATED Scheduled Connector Rule\">"
                        + "<eventHandlers><eventHandler class=\"com.archibus.app.common.connectors.service.ConnectorService\""
                        + " method=\"executeScheduledConnectors\">"
                        + "<inputs><input name=\"connector_id:" + connectorId
                        + "\" value=\"\" type=\"\"/>"
                        + "</inputs></eventHandler></eventHandlers></xml_rule_properties>";

        String xmlSchedProps;
        if (useCronExpression) {
            if (this.validate(interval)) {
                xmlSchedProps =
                        XML_SCHED_PROPS_TEMPLATE
                            .replace(XML_SCHED_PROPS_START_TIME_PARAM, DATE_TIME_NOW)
                            .replace(XML_SCHED_PROPS_RUN_ON_STARTUP_PARAM, FALSE)
                            .replace(XML_SCHED_PROPS_INTERVAL_ELEMENT_PARAM,
                                "<cron expression=\"" + interval + '"' + ELEMENT_TERMINATOR);
            } else {
                xmlSchedProps = "";
                statusMessage = "Invalid Cron Expression";
            }
        } else {
            xmlSchedProps =
                    XML_SCHED_PROPS_TEMPLATE
                        .replace(XML_SCHED_PROPS_START_TIME_PARAM,
                            startDate + DATE_TIME_DELIMITER + startTime)
                        .replace(XML_SCHED_PROPS_RUN_ON_STARTUP_PARAM, FALSE)
                        .replace(
                            XML_SCHED_PROPS_INTERVAL_ELEMENT_PARAM,
                            "<simple repeatCount=\"-1\" repeatInterval=\"" + interval + '"'
                                    + ELEMENT_TERMINATOR);
        }

        if (SUCCESS_STATUS_MESSAGE.equals(statusMessage)) {
            final WorkflowRuleDataSource workflowRuleDataSource = new WorkflowRuleDataSource();
            WorkflowRuleConfig workflowRule = workflowRuleDataSource.get(activityId, ruleId);
            final boolean isNew = workflowRule == null;
            if (isNew) {
                workflowRule =
                        workflowRuleDataSource.convertRecordToObject(workflowRuleDataSource
                            .createNewRecord());
                workflowRule.setActivityId(activityId);
                workflowRule.setRuleId(ruleId);
            }
            workflowRule.setRuleType(WorkflowRuleType.SCHEDULED);
            workflowRule.setXmlRuleProps(xmlRuleProps);
            workflowRule.setXmlSchedProps(xmlSchedProps);
            workflowRule.setIsActive(true);
            workflowRule.setDescription("AUTOCREATED Scheduled Connector Rule - Do Not Delete");
            if (isNew) {
                workflowRuleDataSource.save(workflowRule);
            } else {
                workflowRuleDataSource.update(workflowRule);
            }
        }
        return statusMessage;
    }

    /**
     * @param cronExpression a potential cron expression.
     * @return true if it is a valid cron expression.
     */
    private boolean validate(final String cronExpression) {
        boolean isValid = true;
        try {
            /*
             * Determine if it has the right number of parameters.
             */
            final String[] cronParams = cronExpression.split(CRON_DELIMITER);
            if (cronParams.length < CRON_MIN_LENGTH || cronParams.length > CRON_MAX_LENGTH) {
                /*
                 * Wrong number of parameters.
                 */
                isValid = false;
            } else {
                /*
                 * Attempt to parse it (failure goes to throws clause).
                 */
                final CronTrigger cronTrigger = new CronTrigger();
                cronTrigger.setCronExpression(cronExpression);

                /*
                 * Check that day of month and day of week are not both specified.
                 */
                isValid =
                        CRON_WILDCARD.equals(cronParams[CRON_DAY_OF_MONTH_INDEX])
                                || CRON_WILDCARD.equals(cronParams[CRON_DAY_OF_WEEK_INDEX]);
            }
        } catch (final ParseException e) {
            /*
             * Parsing failed.
             */
            isValid = false;
        }
        return isValid;
    }

    /**
     * @param activityId the activity of the workflow rule.
     * @param ruleId the rule id for the workflow rule.
     * @return a set of properties representing the workflow rule's schedule.
     */
    public Map<String, String> loadScheduledConnectorRule(final String activityId,
            final String ruleId) {
        final Map<String, String> scheduledRuleProps = new HashMap<String, String>();
        final WorkflowRuleDataSource workflowRuleDataSource = new WorkflowRuleDataSource();
        final WorkflowRuleConfig workflowRule = workflowRuleDataSource.get(activityId, ruleId);

        String response;
        if (workflowRule == null) {
            response = TRUE;
        } else {
            response = FALSE;

            final String xmlSchedProps = workflowRule.getXmlSchedProps();
            Document docTemplate;
            try {
                docTemplate = DocumentHelper.parseText(xmlSchedProps);
            } catch (final DocumentException e) {
                throw new ExceptionBase(
                    "Unable to parse XML Schedule Properties for workflow rule " + activityId + "|"
                            + ruleId, e);
            }

            final String interval = readXMLNode(docTemplate, XPATH_SCHED_REPEAT_INTERVAL);
            final String cron = readXMLNode(docTemplate, XPATH_SCHED_CRON_EXPRESSION);
            final String[] start =
                    readXMLNode(docTemplate, XPATH_SCHED_START).split(DATE_TIME_DELIMITER);
            final String startDate = start[0];
            String startTime = "";
            if (!DATE_TIME_NOW.equalsIgnoreCase(startDate)) {
                startTime = start[1];
            }
            final String runOnStartup = readXMLNode(docTemplate, XPATH_SCHED_RUN_ON_START);
            scheduledRuleProps.put("interval", interval);
            scheduledRuleProps.put("cron", cron);
            scheduledRuleProps.put("startDate", startDate);
            scheduledRuleProps.put("startTime", startTime);
            scheduledRuleProps.put("runOnStartup", runOnStartup);
        }
        scheduledRuleProps.put("response", response);
        return scheduledRuleProps;
    }

    /**
     * Apply xPath to the document and return it's value.
     *
     * @param docTemplate the XML document containing the value.
     * @param xPath xPath to the value in the document.
     * @return the value the xPath refers to.
     */
    private String readXMLNode(final Document docTemplate, final String xPath) {
        String nodeValue;
        final Node selectedNode = docTemplate.selectSingleNode(xPath);
        if (selectedNode == null) {
            nodeValue = "";
        } else {
            nodeValue = selectedNode.getText();
        }
        return nodeValue;
    }

    /**
     * Execute connectors for which the EXECUTE status is set.
     */
    public void scheduleConnector() {
        final boolean useLoadBalancer =
                TRUE.equals(ContextStore.get().getCurrentContext()
                    .getAttribute("//preferences/loadBalancer/@runScheduledRules"));
        final boolean runScheduledRules =
                TRUE.equals(ContextStore.get().getCurrentContext()
                    .getAttribute("//preferences/@runScheduledRules"));
        this.log.debug("[Execute Connector on this server (loadBalancer)]: " + useLoadBalancer);
        this.log.debug("[Execute Connector on this server (runScheduledRules)]: "
                + runScheduledRules);
        if (useLoadBalancer || runScheduledRules) {

            final IConnectorDao connectorDao = new ConnectorDataSource();
            final List<String> staleConnectors =
                    connectorDao.getByExecutionStatus(ExecFlag.EXECUTE);
            if (!staleConnectors.isEmpty()) {
                for (final String staleConnectorId : staleConnectors) {
                    refreshStaleConnector(staleConnectorId, connectorDao);
                }
            }
        }

    }

    /**
     * @param staleConnectorId the id for a stale the connector configuration.
     * @param connectorDao a dao to access the connector's updated status.
     */
    private void refreshStaleConnector(final String staleConnectorId,
            final IConnectorDao connectorDao) {
        this.log.debug("[About to execute rule]: " + staleConnectorId);
        /*
         * Refresh execution flag, and if it's still EXECUTE, run the connector.
         */
        final ConnectorConfig connector = connectorDao.get(staleConnectorId);
        if (connector.getExecFlag() == ExecFlag.EXECUTE) {
            runConnector(connector.getConnectorId());
        }
    }

    /**
     * @return ARCHIBUS's job manager.
     */
    public ThreadSafe getJobManager() {
        return this.jobManager;
    }

    /**
     * Used by Spring to inject ARCHIBUS's job manager.
     *
     * @param jobManager ARCHIBUS's job manager.
     */
    public void setJobManager(final ThreadSafe jobManager) {
        this.jobManager = jobManager;
    }
}
