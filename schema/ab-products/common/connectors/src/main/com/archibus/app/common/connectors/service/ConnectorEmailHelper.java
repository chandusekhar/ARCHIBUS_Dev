package com.archibus.app.common.connectors.service;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.service.Configuration;
import com.archibus.utility.*;

/**
 * A class for handling emails sent by connectors.
 *
 * @author cole
 *
 */
public final class ConnectorEmailHelper {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ConnectorEmailHelper() {
    }
    
    /**
     * Send an email.
     *
     * @param connector the connector whose execution triggered the email.
     * @param subject the subject of the email.
     * @param body the content of the email.
     */
    private static void sendConnectorEmail(final ConnectorConfig connector, final String subject,
            final String body) {
        // prepare the message
        final MailMessage message = new MailMessage();
        message
            .setFrom(Configuration.getActivityParameterString("AbSolutionsMyAdn", "SystemEmail"));
        message.setTo(connector.getNotifyEmailAddress());
        message.setSubject(subject);
        message.setText(body);

        // send email
        new MailSender().send(message);
    }
    
    /**
     * Send an email indicating the connector completed.
     *
     * @param connector the connector database record.
     * @param body the content of the email.
     */
    public static void sendConnectorEmailComplete(final ConnectorConfig connector, final String body) {
        final String subject = "ARCHIBUS Connector Completed: " + connector.getConnectorId();
        switch (connector.getNotifyUser()) {
            case NORMAL:
            case BOTH:
                sendConnectorEmail(connector, subject, body);
                break;
            default:
                break;
        }
    }
    
    /**
     * Send an email indicating the connector failed to execute properly.
     *
     * @param connector the connector database record.
     * @param body the content of the email.
     */
    public static void sendConnectorEmailError(final ConnectorConfig connector, final String body) {
        final String subject = "ARCHIBUS Connector Error: " + connector.getConnectorId();
        switch (connector.getNotifyUser()) {
            case ERROR:
            case BOTH:
                sendConnectorEmail(connector, subject, body);
                break;
            default:
                break;
        }
    }
}
