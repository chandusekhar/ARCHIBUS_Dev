package com.archibus.app.reservation.exchange.service;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import com.archibus.app.reservation.ConfiguredDataSourceTestBase;
import com.archibus.app.reservation.domain.CalendarException;

/**
 * Test class for Exchange Service helper.
 * 
 * @author Yorik Gerlo
 */
public class ExchangeServiceHelperTest extends ConfiguredDataSourceTestBase {
    
    /** An email address that resides on the connected Exchange. */
    protected static final String EXCHANGE_EMAIL = "yorik.gerlo@procos1.onmicrosoft.com";
    
    /** An email address that doesn't reside on the connected Exchange. */
    protected static final String OTHER_EMAIL = "ai@tgd.com";
    
    /** An email address with the correct domain that doesn't exist on the connected Exchange. */
    protected static final String OTHER_EXCHANGE_EMAIL = "dummy@procos1.onmicrosoft.com";
    
    /** The Service Helper under test. */
    private ExchangeServiceHelper serviceHelper;
    
    /**
     * Test method for
     * {@link com.archibus.app.reservation.exchange.service.AutodiscoverExchangeServiceHelper
     * #getService(java.lang.String)}
     * .
     */
    public void testGetServiceString() {
        final ExchangeService service = this.serviceHelper.getService(EXCHANGE_EMAIL);
        try {
            Folder.bind(service, WellKnownFolderName.Calendar, PropertySet.IdOnly);
            // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API method
            // throws a checked Exception.
        } catch (final Exception exception) {
            // CHECKSTYLE:ON
            Assert.fail(exception.toString());
        }
    }
    
    /**
     * Test connecting to Exchange using invalid email addresses.
     */
    public void testGetServiceInvalidEmails() {
        try {
            try {
                this.serviceHelper.getService(OTHER_EMAIL);
                Assert.fail("Should not be able to get a service reference for an external user.");
            } catch (final CalendarException exception) {
                Assert.assertTrue(exception.getPattern().contains(OTHER_EMAIL));
            }
            
            final ExchangeService service = this.serviceHelper.getService(OTHER_EXCHANGE_EMAIL);
            try {
                Folder.bind(service, WellKnownFolderName.Calendar, PropertySet.IdOnly);
                Assert.fail("Should not be able to bind to a folder of a user that doesn't exist.");
            } catch (final ServiceResponseException exception) {
                Assert.assertEquals(ServiceError.ErrorNonExistentMailbox, exception.getErrorCode());
            }
            // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API method
            // throws a checked Exception.
        } catch (final Exception exception) {
            // CHECKSTYLE:ON
            Assert.fail(exception.toString());
        }
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.reservation.exchange.service.AutodiscoverExchangeServiceHelper
     * #initializeService(java.lang.String)}
     * .
     */
    public void testInitializeService() {
        ExchangeService service = this.serviceHelper.initializeService(EXCHANGE_EMAIL);
        
        service = this.serviceHelper.initializeService(OTHER_EMAIL);
        Assert.assertEquals(this.serviceHelper.getOrganizerAccount(), service.getImpersonatedUserId().getId());
        
        service = this.serviceHelper.initializeService(OTHER_EXCHANGE_EMAIL);
        Assert.assertEquals(this.serviceHelper.getOrganizerAccount(), service.getImpersonatedUserId().getId());
    }
    
    /**
     * Set the Exchange service.
     * 
     * @param serviceHelper the Exchange service helper
     */
    public void setServiceHelper(final ExchangeServiceHelper serviceHelper) {
        this.serviceHelper = serviceHelper;
    }

}
