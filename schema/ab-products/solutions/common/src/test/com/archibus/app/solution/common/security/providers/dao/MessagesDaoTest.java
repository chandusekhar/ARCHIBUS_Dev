package com.archibus.app.solution.common.security.providers.dao;


/**
 * Tests SecurityService event handler.
 */
public class MessagesDaoTest extends com.archibus.fixture.IntegrationTestBase {
    static final String ACTIVITY_ID = "AbSolutionsMyAdn";

    private MessagesDao messagesDao;

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/password-manager.xml",
                "/context/security/afm_users/password-changer.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml" };
    }

    public void testLocalizeMessage() {
        final String result =
                this.messagesDao.localizeMessage("AbBldgOpsHelpDesk", "ACCEPTANCE_STEP",
                    "ESCALATION_TEXT");

        assertEquals(
            "The following assignees declined on the acceptance steps for this request:   <#list steps as step><#if step.step_type.value== 'acceptance'>${step.em_id} :: ${step.comments}</#if></#list>",
            result);
    }

    /**
     * @return the MessagesDao
     */
    public MessagesDao getMessagesDao() {
        return this.messagesDao;
    }

    /**
     * @param MessagesDao the MessagesDao to set
     */
    public void setMessagesDao(final MessagesDao messagesDao) {
        this.messagesDao = messagesDao;
    }
}
