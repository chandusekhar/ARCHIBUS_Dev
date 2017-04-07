package com.archibus.app.common.notification;

import com.archibus.app.common.notification.service.ScheduleNotificationService;
import com.archibus.datasource.DataSourceTestBase;

/**
 * 
 * Compliance Service Class for Scheduled Notification workflow rule.
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class ScheduleNotificationServiceTest extends DataSourceTestBase {
    
    /**
     * Test Schedule Workflow rule method to send notifications for Compliance Event dialy.
     */
    public void testSendEmailNotifications() {
        
        new ScheduleNotificationService().sendEmailNotifications();
        
    }
}
