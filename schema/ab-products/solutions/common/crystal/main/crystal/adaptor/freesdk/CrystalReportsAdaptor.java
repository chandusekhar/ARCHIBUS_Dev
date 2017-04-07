package com.archibus.app.solution.common.report.crystal.adaptor.freesdk;

import java.io.*;
import java.sql.SQLException;

import com.archibus.app.solution.common.report.crystal.adaptor.ICrystalReportsAdaptor;
import com.archibus.config.ConfigJdbc;
import com.archibus.security.*;
import com.archibus.security.UserAccount.Immutable;
import com.archibus.utility.ExceptionBase;
import com.crystaldecisions.sdk.occa.report.application.*;
import com.crystaldecisions.sdk.occa.report.lib.*;

/**
 * Adaptor for CrystalReports.
 * <p>
 * Integrates CrystalReports with WebCentral.
 *
 * @author Valery Tydykov
 * @since 21.3
 */
public class CrystalReportsAdaptor implements ICrystalReportsAdaptor {
    /**
     * {@inheritDoc}
     */
    @Override
    public InputStream generateReportToStream(final String reportFileName,
            final UserAccount.Immutable userAccount, final boolean applyVpa,
            final String clientRestriction) {

        try {
            final ReportClientDocument reportClientDocument = new ReportClientDocument();
            try {
                // Open report
                reportClientDocument
                    .setReportAppServer(ReportClientDocument.inprocConnectionString);
                reportClientDocument.open(reportFileName, OpenReportOptions._openAsReadOnly);

                final String sqlWithVpa =
                        CrystalReportsAdaptorUtilities.prepareReport(reportFileName, userAccount,
                            applyVpa, reportClientDocument, clientRestriction);

                return CrystalReportsAdaptorUtilities.generateReport(reportClientDocument,
                    sqlWithVpa);
            } finally {
                reportClientDocument.close();
            }
        } catch (final SQLException e) {
            final String errorMessage =
                    String.format("SQLException thrown while processing report=[%s]",
                        reportFileName);
            throw new ExceptionBase(errorMessage, e);
        } catch (final ReportSDKException e) {
            final String errorMessage =
                    String.format(
                        "Crystal Reports SDK exception thrown while processing report=[%s]",
                        reportFileName);
            throw new ExceptionBase(errorMessage, e);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean publishReport(final String reportFileName, final Immutable userAccount) {
        
        final ReportClientDocument clientDoc = new ReportClientDocument();

        try {
            try {
                clientDoc.setReportAppServer(ReportClientDocument.inprocConnectionString);

                clientDoc.open(reportFileName, OpenReportOptions._discardSavedData);

                final ConfigJdbc.Immutable configJDBC =
                        com.archibus.context.ContextStore.get().getTransactionInfos()
                        .getTransactionInfo(com.archibus.context.DatabaseRole.DATA)
                        .getDatabase().getConfigJDBC();

                final PropertyBag propertyBag = new PropertyBag();
                
                propertyBag.put("Trusted_Connection", "false");
                propertyBag.put("Server Type", "JDBC (JNDI)");
                propertyBag.put("Use JDBC", "true");
                propertyBag.put("Database DLL", "crdb_jdbc.dll");
                propertyBag.put("JNDI Datasource Name", configJDBC.getJndiDataSourceName());
                propertyBag.put("Connection URL", configJDBC.getUrl());
                propertyBag.put("Database Class Name", configJDBC.getDriver());

                CrystalReportsAdaptorUtilities.changeDataSource(clientDoc, null, null,
                    configJDBC.getLogin(), configJDBC.getPassword(), propertyBag);

                clientDoc.save();
            } finally {
                clientDoc.close();
            }
        } catch (final ReportSDKException e) {
            final String errorMessage =
                    String.format(
                        "Crystal Reports SDK exception thrown while publishing report=[%s]",
                        reportFileName);
            throw new ExceptionBase(errorMessage, e);
        } catch (final IOException e) {
            final String errorMessage =
                    String.format("I/O exception thrown while saving report=[%s]", reportFileName);
            throw new ExceptionBase(errorMessage, e);
        }
        
        return true;
    }
    
}
