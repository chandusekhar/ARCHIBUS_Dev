package com.archibus.app.reservation.exchange.service;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.AutodiscoverLocalException;

import org.apache.log4j.*;

import com.archibus.app.reservation.domain.CalendarException;
import com.archibus.app.reservation.exchange.util.ExchangeTraceListener;

/**
 * Test class for Exchange Service helper.
 *
 * @author Yorik Gerlo
 */
public class AutodiscoverExchangeServiceHelperTest extends ExchangeServiceHelperTest {

    /** The Service Helper under test. */
    private AutodiscoverExchangeServiceHelper serviceHelper;

    /**
     * Set up for a test case for Exchange auto-discover.
     *
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        this.serviceHelper.setUrl(null);
        Logger.getLogger(ExchangeTraceListener.class).setLevel(Level.TRACE);
    }

    /**
     * Test connecting to Exchange using invalid email addresses.
     */
    @Override
    public void testGetServiceInvalidEmails() {
        try {
            this.serviceHelper.getService(OTHER_EMAIL);
            Assert.fail("Should not be able to get a service endpoint for an external user.");
        } catch (final CalendarException exception) {
            Assert.assertTrue(exception.getPattern().contains(OTHER_EMAIL));
        }

        try {
            this.serviceHelper.getService(OTHER_EXCHANGE_EMAIL);
            Assert
                .fail("Should not be able to get a service endpoint for a user that doesn't exist.");
        } catch (final CalendarException exception) {
            Assert.assertTrue(exception.getPattern().contains(OTHER_EXCHANGE_EMAIL));
        }
    }

    /**
     * Test the auto-discover URL validation callback.
     */
    public void testRedirectionUrlValidationCallback() {
        try {
            Assert.assertTrue(this.serviceHelper
                .autodiscoverRedirectionUrlValidationCallback("https://autodiscover.outlook.com"));
            Assert.assertFalse(this.serviceHelper
                .autodiscoverRedirectionUrlValidationCallback("http://autodiscover.outlook.com"));
            Assert.assertFalse(this.serviceHelper
                .autodiscoverRedirectionUrlValidationCallback(null));
            Assert.assertFalse(this.serviceHelper.autodiscoverRedirectionUrlValidationCallback(""));
        } catch (final AutodiscoverLocalException e) {
            Assert.fail(e.toString());
        }
    }

    /**
     * Set the service helper.
     *
     * @param serviceHelper the new service helper
     */
    public void setServiceHelper(final AutodiscoverExchangeServiceHelper serviceHelper) {
        super.setServiceHelper(serviceHelper);
        this.serviceHelper = serviceHelper;
    }

}
