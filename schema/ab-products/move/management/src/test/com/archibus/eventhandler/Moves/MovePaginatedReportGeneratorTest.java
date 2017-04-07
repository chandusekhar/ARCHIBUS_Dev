package com.archibus.eventhandler.Moves;

import com.archibus.datasource.DataSourceTestBase;

public class MovePaginatedReportGeneratorTest extends DataSourceTestBase {
    MovePaginatedReportGenerator classHandler = null;

    public void testGenerateReport() {
        String rptType = "group";
        String projectId = "PROJECT 12";
        String moveId = "";
        this.classHandler = new MovePaginatedReportGenerator(rptType, projectId, moveId);
        this.classHandler.run();
    }
}
