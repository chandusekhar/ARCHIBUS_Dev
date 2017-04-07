package com.archibus.eventhandler.security;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.db.RestrictionSqlBase;
import com.archibus.eventhandler.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.Record;
import com.archibus.security.UserAccountLoaderImpl;
import com.archibus.security.providers.dao.PasswordManager;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * @author Valery Tydykov
 */
public class PasswordManagerHandler extends EventHandlerBase {
    public static final String INPUT_PASSWORD = "password";
    
    public static final String INPUT_USERNAME = "username";
    
    public static final String INPUT_KEY_PHRASE = "keyPhrase";
    
    private static final String FIELD_NAME_AFM_USERS_USER_NAME = "afm_users.user_name";
    
    private static final String TABLE_NAME_AFM_USERS = "afm_users";
    
    private static final String PASSWORD_MANAGER_BEAN_ID = "passwordManager";
    
    public void sendNewPassword(EventHandlerContext context) throws ExceptionBase {
        // send new password
        // username is a required input parameter
        String username = context.getString(INPUT_USERNAME);
        
        // password is a required input parameter
        String password = context.getString(INPUT_PASSWORD);
        
        // get PasswordManager bean from the Spring context
        PasswordManager passwordManager =
                (PasswordManager) ContextStore.get().getBean(PASSWORD_MANAGER_BEAN_ID);
        
        passwordManager.sendNewPassword(username, password);
    }
    
    public void sendTemporaryPasswords(EventHandlerContext context) throws ExceptionBase {
        doForEachUserAccountInRestriction(context, new PasswordManagerCallback() {
            
            public void doWithContext(PasswordManager passwordManager, String username) {
                // send temporary password
                passwordManager.sendTemporaryPassword(username);
            }
        });
    }
    
    public void encryptPasswords(EventHandlerContext context) throws ExceptionBase {
        doForEachUserAccountInRestriction(context, new PasswordManagerCallback() {
            
            public void doWithContext(PasswordManager passwordManager, String username) {
                // encrypt password
                passwordManager.encryptPassword(username);
            }
        });
    }
    
    public void resetPasswords(EventHandlerContext context) throws ExceptionBase {
        // keyPhrase is a required input parameter
        final String keyPhrase = context.getString(INPUT_KEY_PHRASE);
        
        doForEachUserAccountInRestriction(context, new PasswordManagerCallback() {
            
            public void doWithContext(PasswordManager passwordManager, String username) {
                // reset password
                passwordManager.resetPassword(username, keyPhrase);
            }
        });
    }
    
    private Vector<RestrictionSqlBase.Immutable> parseClientRestrictions(String restriction,
            EventHandlerContext context) {
        Vector<RestrictionSqlBase.Immutable> restrictions;
        // create new DataSource
        DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable(TABLE_NAME_AFM_USERS);
        ds.setContext(context);
        
        restrictions =
                new Vector<RestrictionSqlBase.Immutable>(ds.parseClientRestrictions(restriction));
        return restrictions;
    }
    
    interface PasswordManagerCallback {
        void doWithContext(PasswordManager passwordManager, String username);
    }
    
    void doForEachUserAccountInRestriction(EventHandlerContext context,
            PasswordManagerCallback callback) throws ExceptionBase {
        // restriction is an optional input parameter
        String restriction = context.getString(ViewHandlers.INPUT_RESTRICTION);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Restriction = [" + restriction + "]");
        }
        
        // convert restrictions to objects
        Vector<RestrictionSqlBase.Immutable> restrictions =
                parseClientRestrictions(restriction, context);
        
        // get PasswordManager bean from the Spring context
        PasswordManager passwordManager =
                (PasswordManager) ContextStore.get().getBean(PASSWORD_MANAGER_BEAN_ID);
        
        // for each user account in Restriction
        List<Record.Immutable> accounts =
                UserAccountLoaderImpl.getUserAccounts(restrictions).getRecordset().getRecords();
        for (Record.Immutable record : accounts) {
            String username = (String) record.findFieldValue(FIELD_NAME_AFM_USERS_USER_NAME);
            
            callback.doWithContext(passwordManager, username);
        }
    }
}
