package com.archibus.app.reservation.exchange.service;

import java.io.OutputStreamWriter;
import java.util.*;

import org.apache.log4j.*;

import com.archibus.app.reservation.ConfiguredDataSourceTestBase;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

/**
 * Cleans up the mailboxes used for testing.
 *
 * @author Yorik Gerlo
 */
public class ExchangeCleanUpTest extends ConfiguredDataSourceTestBase {

    /** Intermittent progress report every 100 items. */
    private static final int HUNDRED = 100;

    /** Email addresses used for testing that reside on the connected Exchange. */
    private static final String[] EXCHANGE_EMAIL =
            { "unittest1@procos1.onmicrosoft.com", "unittest2@procos1.onmicrosoft.com" };

    /** The Service Helper to connect with Exchange. */
    private ExchangeServiceHelper serviceHelper;

    /** The logger. */
    private final Logger logger = Logger.getLogger(this.getClass());

    /** List of mailboxes including the resource and organizer account. */
    private List<String> emails;

    /**
     * Set up for a cleanup procedure.
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
        if (this.logger.getAppender(this.logger.getName()) == null) {
            final ConsoleAppender appender = new ConsoleAppender();
            appender.setName(this.logger.getName());
            appender.setWriter(new OutputStreamWriter(System.out));
            appender.setLayout(new PatternLayout("%d [%p][%C{1}][%m]%n"));
            appender.setThreshold(Level.INFO);
            appender.activateOptions();
            this.logger.addAppender(appender);
        }
        this.emails = new ArrayList<String>();
        this.emails.addAll(Arrays.asList(EXCHANGE_EMAIL));
        this.emails.add(this.serviceHelper.getResourceAccount());
        this.emails.add(this.serviceHelper.getOrganizerAccount());
    }

    /**
     * Cleans up the calendars used for all unit tests.
     */
    public void testCleanCalendar() {
        int deleteCount = 0;
        for (final String email : this.emails) {
            try {
                final ExchangeService service = this.serviceHelper.getService(email);
                final ItemView view = new ItemView(1024);

                final FindItemsResults<Item> results =
                        service.findItems(WellKnownFolderName.Calendar, view);

                Assert.assertNotNull(results);
                final List<Item> items = results.getItems();

                for (final Item item : items) {
                    try {
                        item.delete(DeleteMode.HardDelete);
                        ++deleteCount;
                    } catch (final ServiceResponseException exception) {
                        if (!ServiceError.ErrorItemNotFound.equals(exception.getErrorCode())) {
                            throw exception;
                        }
                    }

                    if (deleteCount % HUNDRED == 0) {
                        this.logger.warn(String.format("Deleted %d appointments...", deleteCount));
                    }
                }
                // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API
                // method throws a checked Exception.
            } catch (final Exception exception) {
                // CHECKSTYLE:ON
                this.logger.warn("Error deleting calendar item. " + exception.toString(),
                    exception);
            }
            this.logger.warn(
                String.format("Deleted %d appointments after processing %s", deleteCount, email));
        }
    }

    /**
     * Cleans up the calendars used for all unit tests.
     */
    public void testCleanInbox() {
        int deleteCount = 0;
        for (final String email : this.emails) {
            try {
                final ExchangeService service = this.serviceHelper.getService(email);
                final ItemView view = new ItemView(1024);
                view.getOrderBy().add(EmailMessageSchema.DateTimeReceived, SortDirection.Ascending);
                final FindItemsResults<Item> results =
                        service.findItems(WellKnownFolderName.Inbox, view);

                Assert.assertNotNull(results);
                final List<Item> items = results.getItems();

                for (final Item item : items) {
                    item.delete(DeleteMode.HardDelete);
                    ++deleteCount;

                    if (deleteCount % HUNDRED == 0) {
                        this.logger
                            .warn(String.format("Deleted %d items from inbox...", deleteCount));
                    }
                }
                // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API
                // method throws a checked Exception.
            } catch (final Exception exception) {
                // CHECKSTYLE:ON
                this.logger.warn("Error deleting an item. " + exception.toString(), exception);
            }
            this.logger.warn(String.format("Deleted %d items from inboxes after processing %s",
                deleteCount, email));
        }
    }

    /**
     * Set the service helper for cleanup.
     *
     * @param serviceHelper the service helper
     */
    public void setServiceHelper(final ExchangeServiceHelper serviceHelper) {
        this.serviceHelper = serviceHelper;
    }

}
