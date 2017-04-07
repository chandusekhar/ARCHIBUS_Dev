package com.archibus.eventhandler.security;

import java.util.*;

import com.archibus.eventhandler.ViewHandlers;
import com.archibus.fixture.*;
import com.archibus.utility.ExceptionBase;

/**
 * Tests PasswordManagerHandler event handlers.
 */
public class TestPasswordManagerHandler extends IntegrationTestBase {

    private static final String RESTRICTION =
            "{relOp: 'AND', clauses: [{name:'afm_users.user_name', value:'Z-TEST', op:'='}]}";

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/authentication.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/security/afm_users/password-manager.xml",
                "/context/security/afm_users/password-changer.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml" };
    }

    /*
     * (non-Javadoc)
     *
     * @see com.archibus.fixture.ServiceTestBase#onSetUp()
     */
    @Override
    public void onSetUp() throws Exception {
        this.fixture = new EventHandlerFixture(this);
        super.onSetUp();
    }

    /*
     * (non-Javadoc)
     *
     * @see com.archibus.fixture.ServiceTestBase#onTearDown()
     */
    @Override
    public void onTearDown() {
        this.fixture.tearDown();
        super.onTearDown();
    }

    /**
     * Helper object providing test-related resource and methods.
     */
    private EventHandlerFixture fixture = null;

    /**
     * Tests PasswordManagerHandler.sendNewPassword event handler.
     *
     * @exception ExceptionBase Description of the Exception
     */
    public void testSendNewPassword() throws ExceptionBase {
        final Map inputs = new HashMap();
        inputs.put(PasswordManagerHandler.INPUT_USERNAME, "AI");
        inputs.put(PasswordManagerHandler.INPUT_PASSWORD, "newPassword");
        final Map response = new HashMap();
        try {
            this.fixture.runEventHandlerMethod("AbSystemAdministration",
                "com.archibus.eventhandler.security.PasswordManagerHandler", "sendNewPassword",
                inputs, response);
        } catch (final ExceptionBase expected) {
            if (expected.getPattern().indexOf("SMTP") == -1) {
                throw expected;
            }
        }
    }

    /**
     * Tests PasswordManagerHandler.sendTemporaryPasswords event handler.
     *
     * @exception ExceptionBase Description of the Exception
     */
    public void testSendTemporaryPasswords() throws ExceptionBase {
        final Map inputs = new HashMap();
        inputs.put(ViewHandlers.INPUT_RESTRICTION, RESTRICTION);
        final Map response = new HashMap();
        try {
            this.fixture.runEventHandlerMethod("AbSystemAdministration",
                "com.archibus.eventhandler.security.PasswordManagerHandler",
                "sendTemporaryPasswords", inputs, response);
        } catch (final ExceptionBase expected) {
            if (expected.getPattern().indexOf("SMTP") == -1) {
                throw expected;
            }
        }
    }

    /**
     * Tests PasswordManagerHandler.resetPasswords event handler.
     *
     * @exception ExceptionBase Description of the Exception
     */
    public void testResetPasswords() throws ExceptionBase {
        final Map inputs = new HashMap();
        inputs.put(ViewHandlers.INPUT_RESTRICTION, RESTRICTION);
        inputs.put(PasswordManagerHandler.INPUT_KEY_PHRASE, "myKeyPhrase");
        final Map response = new HashMap();
        this.fixture.runEventHandlerMethod("AbSystemAdministration",
            "com.archibus.eventhandler.security.PasswordManagerHandler", "resetPasswords", inputs,
            response);
    }

    /**
     * Tests PasswordManagerHandler.encryptPasswords event handler.
     *
     * @exception ExceptionBase Description of the Exception
     */
    public void testEncryptPasswords() throws ExceptionBase {
        final Map inputs = new HashMap();
        inputs.put(ViewHandlers.INPUT_RESTRICTION, RESTRICTION);
        final Map response = new HashMap();
        this.fixture.runEventHandlerMethod("AbSystemAdministration",
            "com.archibus.eventhandler.security.PasswordManagerHandler", "encryptPasswords",
            inputs, response);
    }
}
