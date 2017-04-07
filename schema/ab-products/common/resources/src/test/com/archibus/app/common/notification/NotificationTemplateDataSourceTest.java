package com.archibus.app.common.notification;

import com.archibus.app.common.notification.dao.INotificationTemplateDao;
import com.archibus.app.common.notification.dao.datasource.NotificationTemplateDataSource;
import com.archibus.app.common.notification.domain.NotificationTemplate;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.Utility;

/**
 * Unit test for NotificationTemplateDataSource.
 * 
 * @author Zhang Yi
 * 
 */
public class NotificationTemplateDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for {@link NotificationTemplateDataSource#save(java.lang.Object)} and
     * {@link NotificationTemplateDataSource#get(java.lang.Object)}.
     */
    public void testFind() {
        final INotificationTemplateDao dataSource = new NotificationTemplateDataSource();
        
        Utility.currentDate();
        // save new object to database
        final NotificationTemplate expected = prepareNotificationTemplates();
        
        // saved has primary key valye only
        final NotificationTemplate saved = dataSource.save(expected);
        
        {
            // verify that new object can be retrieved from database
            final String templateId = saved.getId();
            
            final NotificationTemplate actual = dataSource.getByPrimaryKey(templateId);
            
            verify(expected, actual);
        }
        
        // set ID of the saved object
        expected.setId(saved.getId());
        // update existing object
        expected.setSubject("subject2");
        dataSource.update(expected);
        
        {
            // verify that updated object can be retrieved from database
            final String templateId = saved.getId();
            final NotificationTemplate actual = dataSource.getByPrimaryKey(templateId);
            verify(expected, actual);
            
        }
    }
    
    private NotificationTemplate prepareNotificationTemplates() {
        
        final NotificationTemplate notificationTemplate = new NotificationTemplate();
        notificationTemplate.setId("test1");
        notificationTemplate.setSubject("subject1");
        
        return notificationTemplate;
    }
    
    private void verify(final NotificationTemplate expected, final NotificationTemplate actual) {
        assertEquals(expected.getId(), actual.getId());
        assertEquals(expected.getSubject(), actual.getSubject());
    }
}
