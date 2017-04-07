/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

import java.util.*;

import org.apache.log4j.Logger;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.ContextStore;
import com.archibus.db.*;
import com.archibus.schema.Record;

/**
 * DAO for messages table.
 * 
 * @author Valery Tydykov
 * 
 */
public class MessagesDao {
    private static final String FIELD_ACTIVITY_ID = "activity_id";
    
    private static final String FIELD_MESSAGE_ID = "message_id";
    
    private static final String FIELD_MESSAGE_TEXT = "message_text";
    
    private static final String FIELD_REFERENCED_BY = "referenced_by";
    
    private static final String TABLE_NAME = "messages";
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Localizes specified message from the messages table, using the current user locale.
     * 
     * @param activityId messages.activity_id
     * @param referencedBy messages.referenced_by
     * @param messageId messages.message_id
     * @return Localized text message. If localized message is not found, returns messageId.
     */
    public String localizeMessage(final String activityId, final String referencedBy,
            final String messageId) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("localizeMessage for activityId=[" + activityId + "], referencedBy=["
                    + referencedBy + "], messageId=[" + messageId + "]");
        }
        
        final UserSession.Immutable userSession = ContextStore.get().getUserSession();
        Assert.notNull(userSession, "userSession must be supplied in the Context");
        
        final Database.Immutable database = ContextStore.get().getDatabase();
        final RecordPersistenceImpl persistence = new RecordPersistenceImpl();
        persistence.setDatabase(database);
        
        final Map<String, String> fieldValues = new HashMap<String, String>();
        fieldValues.put(FIELD_ACTIVITY_ID, activityId);
        fieldValues.put(FIELD_REFERENCED_BY, referencedBy);
        fieldValues.put(FIELD_MESSAGE_ID, messageId);
        fieldValues.put(FIELD_MESSAGE_TEXT, "");
        
        final QueryDef.ThreadSafe queryDef = QueryDefLoader.getInstanceFromFields(userSession,
            database, fieldValues.keySet().iterator(), TABLE_NAME, false);
        persistence.setQueryDef(queryDef);
        
        final Record.Immutable record = persistence.retrieve(false, fieldValues);
        
        String messageText = null;
        if (record != null) {
            messageText = (String) record.findFieldValue(TABLE_NAME + "." + FIELD_MESSAGE_TEXT);
        }
        
        return messageText != null ? messageText : messageId;
    }
}
