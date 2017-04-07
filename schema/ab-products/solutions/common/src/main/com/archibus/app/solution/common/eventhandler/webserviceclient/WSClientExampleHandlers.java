package com.archibus.app.solution.common.eventhandler.webserviceclient;

import java.io.StringReader;

import javax.xml.namespace.QName;
import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import javax.xml.ws.*;

import org.apache.axis.client.Call;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

/**
 * This event handler demonstrates how to invoke external web service using Apache Axis web services
 * toolkit. It was tested using Axis 1.2 and Microsoft SOAP Interop Server.
 * 
 * @see <a href="http://ws.apache.org/axis/java/index.html">Apache Axis 1.2 documentation</a>
 * @see <a href="http://www.mssoapinterop.org">Microsoft SOAP Interop Server documentation</a>
 * 
 * @author Sergey Kuramshin
 */
public class WSClientExampleHandlers extends EventHandlerBase {
    
    /**
     * Service name.
     */
    private static final String SERVICE_NAME = "SimpleTest";
    
    /**
     * Port name.
     */
    private static final String PORT_NAME = "SimpleTestSoap";
    
    /**
     * Operation name.
     */
    private static final String OPERATION_NAME = "echoString";
    
    /**
     * Service namespace.
     */
    private static final String NAMESPACE = "http://soapinterop.org/";
    
    /**
     * Calls Echo web service using specified URL and input string.
     * 
     * @param urlString The service URL.
     * @param input The text to sent to the service.
     * @return The service return value.
     * @throws ExceptionBase if the service throws an error.
     */
    public String echo(final String urlString, final String input) throws ExceptionBase {
        try {
            System.out.println("Connecting to echo service at " + urlString);
            
            // create Axis Call object to invoke web service
            final org.apache.axis.client.Service service = new org.apache.axis.client.Service();
            final Call call = (Call) service.createCall();
            final java.net.URL url = new java.net.URL(urlString);
            call.setTargetEndpointAddress(url);
            call.setOperationName(new QName(NAMESPACE, OPERATION_NAME));
            call.addParameter("inputString", org.apache.axis.Constants.XSD_STRING,
                javax.xml.rpc.ParameterMode.IN);
            call.setReturnType(org.apache.axis.Constants.XSD_STRING);
            
            // invoke web service
            final String output = (String) call.invoke(new Object[] { input });
            final String message = "echo service " + urlString + " invoked: sent " + input
                    + ", got " + output;
            
            System.out.println(message);
            return message;
            
            // the catch block is required because Axis classes throw checked exceptions
            // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API method
            // throws a checked Exception, which needs to be wrapped in ExceptionBase.
        } catch (Throwable t) {
            // CHECKSTYLE:ON
            // @non-translatable
            throw new ExceptionBase(null, "echo service invocation failed", t);
        }
    }
    
    /**
     * Calls Echo web service using specified URL and input string.
     * 
     * @param urlString The service URL.
     * @param input The text to sent to the service.
     * @return The service return value.
     * @throws ExceptionBase if the service throws an error.
     */
    public String echoCxf(final String urlString, final String input) throws ExceptionBase {
        try {
            System.out.println("Connecting to echo service at " + urlString);
            
            final java.net.URL url = new java.net.URL(urlString);
            final Service service = Service.create(url, new QName(NAMESPACE, SERVICE_NAME));
            final Dispatch<Source> dispatch = service.createDispatch(
                new QName(NAMESPACE, PORT_NAME), Source.class, Service.Mode.PAYLOAD);
            final Source request = new StreamSource(new StringReader(input));
            final Source response = dispatch.invoke(request);
            
            final String message = "echo service " + urlString + " invoked: sent " + input
                    + ", got " + response;
            
            System.out.println(message);
            return message;
            
            // the catch block is required because Axis classes throw checked exceptions
            // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API method
            // throws a checked Exception, which needs to be wrapped in ExceptionBase.
        } catch (Throwable t) {
            // CHECKSTYLE:ON
            // @non-translatable
            throw new ExceptionBase(null, "echo service invocation failed", t);
        }
    }
}
