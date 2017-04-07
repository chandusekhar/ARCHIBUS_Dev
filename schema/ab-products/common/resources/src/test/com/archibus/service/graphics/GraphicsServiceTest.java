package com.archibus.service.graphics;

import java.io.IOException;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for GraphicsService.
 * 
 * @author Ioan Draghici
 * 
 */

public class GraphicsServiceTest extends DataSourceTestBase {
    /**
     * class handler.
     */
    private GraphicsService classHandler = null;

    /**
     * Test method for delete all enterprise graphics.
     * 
     * @throws IOException - throw IO exception
     */
    public void testDeleteAllEnterpriseGraphics() throws IOException {
        this.classHandler = new GraphicsService();
        this.classHandler.deleteAllEnterpriseGraphics();

    }

    /**
     * Test method for delete unused enterprise graphics.
     */
    public void testDeleteUnusedEnterpriseGraphics() {
        this.classHandler = new GraphicsService();
        this.classHandler.deleteUnusedEnterpriseGraphics();
    }

}
