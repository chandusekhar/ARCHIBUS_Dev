package com.archibus.app.solution.common.report.crystal.service.impl;

import java.io.*;

import org.directwebremoting.io.FileTransfer;

import com.archibus.app.solution.common.report.crystal.adaptor.freesdk.CrystalReportsAdaptorIntegrationTest;
import com.archibus.app.solution.common.report.crystal.service.ICrystalReportsService;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for CrystalReportService.
 *
 * @author Valery Tydykov
 * @since 21.3
 *
 */
public class CrystalReportServiceIntegrationTest extends DataSourceTestBase {
    // TODO Move this setPopulateProtectedVariables call to base class.
    public CrystalReportServiceIntegrationTest() {
        super();
        // Enable Field Injection. Declare protected variables of the required type which match
        // named beans in the context. This is autowire by name, rather than type.
        this.setPopulateProtectedVariables(true);
    }

    protected ICrystalReportsService crystalReportsService;

    public ICrystalReportsService getCrystalReportsService() {
        return this.crystalReportsService;
    }

    public void setCrystalReportsService(final ICrystalReportsService crystalReportsService) {
        this.crystalReportsService = crystalReportsService;
    }

    public void testGenerateReportToFile() throws IOException {
        generateReportToFile("allwosum_or.rpt", "testReport.pdf");
    }

    void generateReportToFile(final String reportFileName, final String fileName)
            throws IOException {
        final FileTransfer fileTransfer =
                this.crystalReportsService.generateReport(reportFileName, true, fileName);

        final InputStream inputStream = fileTransfer.getInputStream();

        CrystalReportsAdaptorIntegrationTest.writeToFile(inputStream, fileName);
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
        "crystal-reports-services-test.xml" };
    }
}
