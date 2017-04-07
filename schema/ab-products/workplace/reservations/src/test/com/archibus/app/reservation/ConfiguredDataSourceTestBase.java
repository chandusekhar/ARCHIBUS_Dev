package com.archibus.app.reservation;

import org.apache.log4j.*;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Provides configuration file location for DataSource tests.
 * <p>
 * Used by Data Source Tests in the reservations package.
 *
 * @author Yorik Gerlo
 * @since 21.2
 *        <p>
 *        Suppress warning "PMD.TestClassWithoutTestCases".
 *        <p>
 *        Justification: this is a base class for other tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class ConfiguredDataSourceTestBase extends DataSourceTestBase {

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException", "PMD.AvoidUsingSql" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        // disable debug logging to speed up tests
        Logger.getLogger(this.getClass()).warn("Disable some debug logging to speed up tests.");
        Logger.getLogger("com.archibus.datasource").setLevel(Level.INFO);
        Logger.getLogger("com.archibus.jobmanager.EventHandler").setLevel(Level.INFO);
        Logger.getLogger("com.archibus.db.DbConnectionImpl.sql").setLevel(Level.INFO);
        Logger.getLogger("com.archibus.db.RestrictionParsedImpl").setLevel(Level.INFO);

        // Set AbSystemAdministration-NotificationLoggingLevel to 'off' to disable email logging.
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "reservation-service.xml" };
    }

}
