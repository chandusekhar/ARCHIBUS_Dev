package com.archibus.service.common;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Email service.
 */
public class EmailService {
    
    /**
     * Sends email message to a user that is in one of the ARCHIBUS identity tables:
     * <ul>
     * <li>A/FM User (afm_users)
     * <li>Employee or Contractor (em)
     * <li>Craftsperson (cf)
     * <li>Contacts (contacts)
     * <li>Vendor (vn).
     * </ul>
     * This method will look up the email address from the system given the identity table name and
     * primary key.
     */
    public void notifyUsingArchibusIdentity(String userId, String identityTable, String subject,
            String body, String activityId) {
        EventHandlerContext c = ContextStore.get().getEventHandlerContext();
        
        String recipient = "";
        if (identityTable.equalsIgnoreCase("cf")) {
            recipient = EventHandlerBase.getEmailAddress(c, "em", "em_id", userId);
            if (StringUtil.notNull(recipient).length() == 0) {
                recipient = EventHandlerBase.getEmailAddress(c, "vendor", "vendor_id", userId);
            }
            if (StringUtil.notNull(recipient).length() == 0) {
                recipient = EventHandlerBase.getEmailAddress(c, "afm_users", "user_name", userId);
            }
        } else if (identityTable.equalsIgnoreCase("em")) {
            recipient = EventHandlerBase.getEmailAddress(c, identityTable, "em_id", userId);
        } else if (identityTable.equalsIgnoreCase("contact")) {
            recipient = EventHandlerBase.getEmailAddress(c, identityTable, "contact_id", userId);
        } else if (identityTable.equalsIgnoreCase("visitors")) {
            recipient = EventHandlerBase.getEmailAddress(c, identityTable, "visitor_id", userId);
        } else if (identityTable.equalsIgnoreCase("afm_users")) {
            recipient = EventHandlerBase.getEmailAddress(c, identityTable, "user_name", userId);
        } else if (identityTable.equalsIgnoreCase("vn")) {
            recipient = EventHandlerBase.getEmailAddress(c, identityTable, "vn_id", userId);
        }
        
        // create the message
        MailMessage message = new MailMessage();
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        message.setActivityId(activityId);
        
        // send the message
        MailSender sender = new MailSender();
        sender.send(message);
    }
}
