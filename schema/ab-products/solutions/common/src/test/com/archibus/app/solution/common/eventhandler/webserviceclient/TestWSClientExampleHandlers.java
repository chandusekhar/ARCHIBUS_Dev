package com.archibus.app.solution.common.eventhandler.webserviceclient;

import junit.framework.TestCase;

/**
 * Test class for WSClientExampleHandlers.
 * 
 * @author Sergey Kuramshin
 */
public class TestWSClientExampleHandlers extends TestCase {
    
    /**
     * Test to send to the service.
     */
    private static final String INPUT = "<hello/>";
    
    /**
     * Service endpoint URL.
     */
    private static final String SERVICE_URL = "http://www.mssoapinterop.org/asmx/simple.asmx?wsdl";
    
    /**
     * Test method.
     */
    public void testEcho() {
        final WSClientExampleHandlers handler = new WSClientExampleHandlers();
        final String output = handler.echo(SERVICE_URL, INPUT);
        assertTrue(output.endsWith(INPUT));
    }
    
    /**
     * Test method.
     */
    public void testEchoCxf() {
        final WSClientExampleHandlers handler = new WSClientExampleHandlers();
        final String output = handler.echoCxf(SERVICE_URL, INPUT);
        assertTrue(output.endsWith(INPUT));
    }
}
