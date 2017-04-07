package com.archibus.app.solution.common.report.crystal.adaptor.freesdk;

import java.io.*;

import com.archibus.app.solution.common.report.crystal.adaptor.ICrystalReportsAdaptor;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for CrystalReportsAdaptor.
 *
 * @author Valery Tydykov
 * @since 21.3
 *
 */
public class CrystalReportsAdaptorIntegrationTest extends DataSourceTestBase {
    public void testGenerateReportToFile() throws IOException {
        generateReportToFile("allwosum_or.rpt", "testReport.pdf");
    }

    void generateReportToFile(final String reportFileName, final String fileName)
            throws IOException {
        final ICrystalReportsAdaptor crystalReportsAdaptor = new CrystalReportsAdaptor();

        final InputStream inputStream =
                crystalReportsAdaptor.generateReportToStream(reportFileName,
                    this.context.getUserAccount(), true, fileName);

        writeToFile(inputStream, fileName);
    }

    public static void writeToFile(final InputStream inputStream, final String fileName)
            throws IOException {
        // Create a byte[] the same size as the exported ByteArrayInputStream.
        final byte[] buffer = new byte[inputStream.available()];
        int bytesRead = 0;
        final FileOutputStream fos = new FileOutputStream(new File(fileName));

        // Stream the byte array to the client.
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            fos.write(buffer, 0, bytesRead);
        }

        fos.flush();
        fos.close();
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml" };
    }
}
