package com.archibus.app.common.notification.service;

import java.util.List;

import com.archibus.app.common.notification.dao.INotificationDao;
import com.archibus.app.common.notification.dao.datasource.*;
import com.archibus.app.common.notification.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 *
 * Compliance Notification Finder Implementation Class.
 *
 * @author Zhang Yi
 *
 */
public class NotificationFinder implements INotificationFinder {

    /**
     * {@inheritDoc}
     */
    public List<Notification> find(final NotificationTemplate template) {

        final String restriction = getRestriction(template);
        final INotificationDao notificationDao = new NotificationDataSource();

        return notificationDao.getByRestriction(restriction);
    }

    /**
     * construct event trigger test sql by template.
     *
     * @param template notification template.
     *
     * @return String if match trigger return true else return false
     */
    private String getRestriction(final NotificationTemplate template) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String templateId = template.getId();
        final String triggerConditionTo = template.getTriggerConditionTo();
        final String triggerConditionFrom = template.getTriggerConditionFrom();

        final String eventTriggerTestCurrent =
                StringUtil.notNullOrEmpty(triggerConditionTo) ? "  AND ("
                        + triggerConditionTo.replace(Constants.MACRO_STATUS,
                            Constants.ACTIVITY_LOG_STATUS) + " ) " : "";

        final String eventTriggerTestPrev =
                StringUtil.notNullOrEmpty(triggerConditionFrom) ? " AND ("
                        + triggerConditionFrom.replace(Constants.MACRO_STATUS,
                                "notifications.status_previous")
                                + ") AND NOT ("
                                + triggerConditionFrom.replace(Constants.MACRO_STATUS,
                                    Constants.ACTIVITY_LOG_STATUS) + ") " : "";

        final String dateField = template.getTriggerDateField();
        // this.template.getTriggerTimeField();
        final String triggerDateStr =
                EventHandlerBase.formatSqlDaysBetween(context, Constants.CURRENT, "activity_log."
                        + dateField);

        final String sendDateStr =
                EventHandlerBase.formatSqlDaysBetween(context, "notifications.date_sent",
                    Constants.CURRENT);

        final StringBuilder restriction = new StringBuilder();
        restriction.append("notifications.template_id='").append(templateId)
        .append("' AND notifications.is_active=1 ");
        restriction.append(eventTriggerTestCurrent).append(eventTriggerTestPrev);

        restriction
        .append(" AND ( (notify_templates.trigger_lead_seq='None' AND notifications.date_sent IS NULL )");
        restriction
        .append("    OR (notify_templates.trigger_lead_seq='Before' AND notifications.date_sent IS NULL ");
        restriction.append("  AND " + triggerDateStr + " <= notify_templates.trigger_lead) ");
        restriction
        .append("    OR (notify_templates.trigger_lead_seq='After' AND notifications.date_sent IS NULL ");
        restriction.append(" AND   " + triggerDateStr + " <= (0-notify_templates.trigger_lead) ) ");
        restriction
        .append("    OR (notify_templates.notify_recurrence>0 AND notifications.date_sent IS NOT NULL ");
        restriction.append(" AND  notifications.notify_count < notify_templates.total_recurrence ");
        restriction.append(" AND " + sendDateStr + "= notify_templates.notify_recurrence ) )");

        return restriction.toString();

    }

}
