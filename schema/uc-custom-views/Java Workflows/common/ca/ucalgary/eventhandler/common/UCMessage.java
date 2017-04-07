package ca.ucalgary.eventhandler.common;

import java.io.IOException;
import java.util.Map;

import com.archibus.eventhandler.steps.Message;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

import freemarker.template.TemplateException;

/**
 *
 * Class for sending mail message
 */
public class UCMessage extends Message {
	private final EventHandlerContext context;

	public UCMessage(EventHandlerContext context) {
		super(context);
		this.context = context;
	}

	public void sendMessage(){
	    if (StringUtil.notNullOrEmpty(this.getMailTo())){
			String from = EventHandlerBase.getEmailFrom(this.context);
			String host = getActivityParameterString(this.context, "AbSystemAdministration", "UC_EMAIL_HOST");
			String port = getActivityParameterString(this.context, "AbSystemAdministration", "UC_EMAIL_PORT");
			String userId = getActivityParameterString(this.context, "AbSystemAdministration", "UC_EMAIL_USER");
			String password = getActivityParameterString(this.context, "AbSystemAdministration", "UC_EMAIL_PWD");

	        // for multiple recipients, we assume separator for the multiple recipients is ","/";"
	        String[] recipients = this.getMailTo().split(";");
	        // for multiple recipients,
	        if (recipients != null && recipients.length == 1) {
	            recipients = this.getMailTo().split(",");
	        }

	        if (recipients.length > 1) {
	            for (String recipient: recipients) {
	                String localName = (String) selectDbValue(this.context,"afm_users","locale","email = " + literal(this.context, recipient));
	                if((this.getSubjectMessageId() != null) || (this.getBodyMessageId() != null)){
	                    format(localName);
	                }

					try {
						EventHandlerBase.sendEmail(this.getText(), from, host, port, this.getSubject(), recipient,
							null, null, userId, password, null,"text/html");
					}
					catch (Exception ex) {

					}
	            }
	        } else {
	            String localName = (String) selectDbValue(this.context,"afm_users","locale","email = " + literal(this.context,this.getMailTo()));
                if((this.getSubjectMessageId() != null) || (this.getBodyMessageId() != null)){
                    format(localName);
                }

				try {
					EventHandlerBase.sendEmail(this.getText(), from, host, port, this.getSubject(), this.getMailTo(),
						null, null, userId, password, null,"text/html");
				}
				catch (Exception ex) {

				}

	        }
	    } else {
	        this.log.warn("E-mail address is empty..., can not send mail");
	        return;
	    }
	}
}
