package com.archibus.app.solution.common.webservice.util;

import java.net.*;

import com.archibus.utility.ExceptionBase;

/**
 * Helper methods for WebServices examples.
 * 
 * @author Valery Tydykov
 * 
 */
public final class WebServiceUtils {
    public static URL getWsdlLocation(final URL siteRoot, final String wsdlRelativeLocation)
            throws ExceptionBase {
        URL wsdlLocation;
        try {
            wsdlLocation = siteRoot.toURI().resolve(new URI(wsdlRelativeLocation)).toURL();
        } catch (final Exception e) {
            // @non-translatable
            // TODO
            throw new ExceptionBase(null, e);
        }
        
        return wsdlLocation;
    }
    
    /**
     * This is a static class that should not be instantiated.
     */
    private WebServiceUtils() throws InstantiationException {
    }
}
