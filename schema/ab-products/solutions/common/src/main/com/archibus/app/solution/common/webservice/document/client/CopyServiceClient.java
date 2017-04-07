package com.archibus.app.solution.common.webservice.document.client;

import java.net.*;
import java.util.ArrayList;

import javax.xml.ws.Holder;

import org.apache.cxf.frontend.ClientProxy;
import org.apache.cxf.transport.http.HTTPConduit;
import org.apache.cxf.transports.http.configuration.HTTPClientPolicy;
import org.springframework.util.Assert;

import com.archibus.app.solution.common.webservice.util.WebServiceUtils;
import com.archibus.utility.ExceptionBase;

/**
 * This is an example of client calling Copy.asmx WebService of MS SharePoint server. This client is
 * supposed to be in WebCentral.
 * 
 * @author Valery Tydykov
 * 
 */
// TODO: create unit test, server
public class CopyServiceClient {

    private URL siteRoot;

    static final String WSDL_RELATIVE_LOCATION = "/_vti_bin/Copy.asmx?wsdl";

    public URL getSiteRoot() {
        return this.siteRoot;
    }

    public void setSiteRoot(URL siteRoot) {
        this.siteRoot = siteRoot;
    }

    public void copyIntoItems(byte[] item, String documentLibraryFolder, String fileName,
            ArrayList<FieldInformation> fieldInfos) throws ExceptionBase {
        // prepare WebService parameters

        String destinationPath = prepareFileUrl(documentLibraryFolder, fileName);

        // Even though the sourceUrl is not used, it still has to be valid.
        // The below statement is here to avoid error :
        // "Value does not fall within the expected range."
        String sourceUrl = destinationPath;

        DestinationUrlCollection destinationUrls = new DestinationUrlCollection();
        {
            destinationUrls.string = new ArrayList<String>();
            destinationUrls.string.add(destinationPath);
        }

        FieldInformationCollection fieldInformationCollection = new FieldInformationCollection();
        if (fieldInfos == null) {
            fieldInformationCollection.fieldInformation = new ArrayList<FieldInformation>();
            fieldInformationCollection.fieldInformation.add(new FieldInformation());
        } else {
            fieldInformationCollection.fieldInformation = fieldInfos;
        }

        Holder<Long> result = new Holder<Long>();
        Holder<CopyResultCollection> results = new Holder<CopyResultCollection>();

        // invoke WebService
        CopySoapPort port = createPort();
        port.copyIntoItems(sourceUrl, destinationUrls, fieldInformationCollection, item, result,
            results);

        // check the result
        checkResult(result, results);
    }

    private void checkResult(Holder<Long> result, Holder<CopyResultCollection> results)
            throws ExceptionBase {
        Assert.isTrue(result.value.intValue() == 0);
        Assert.isTrue(results.value.getCopyResult().size() == 1);

        CopyResult copyResult = results.value.getCopyResult().get(0);

        CopyErrorCode errorCode = copyResult.getErrorCode();
        if (!errorCode.equals(CopyErrorCode.SUCCESS)) {
            // TODO
            // @non-translatable
            String message = "Operation copyIntoItems failed, error code = [{0}], error message= [{1}]";
            ExceptionBase exception = new ExceptionBase();
            exception.setPattern(message);
            exception.setArgs(new Object[] { copyResult.errorCode, copyResult.errorMessage });
            throw exception;
        }
    }

    private CopySoapPort createPort() {
        // load WSDL from the server on each invocation
        URL wsdlLocation = WebServiceUtils.getWsdlLocation(this.siteRoot, WSDL_RELATIVE_LOCATION);
        CopyServiceProxy serviceProxy = new CopyServiceProxy(wsdlLocation);
        CopySoapPort port = serviceProxy.getCopySoap();

        // turn off chunking
        disableChunking(port);

        return port;
    }

    private void disableChunking(CopySoapPort port) {
        org.apache.cxf.endpoint.Client client = ClientProxy.getClient(port);
        HTTPConduit httpConduit = (HTTPConduit) client.getConduit();

        HTTPClientPolicy httpClientPolicy = new HTTPClientPolicy();
        httpClientPolicy.setAllowChunking(false);
        httpConduit.setClient(httpClientPolicy);
    }

    // TODO call in AfterPropertiesSet, store result in property

    public byte[] getItem(String documentLibraryFolder, String fileName) throws ExceptionBase {
        // prepare WebService parameters

        Holder<FieldInformationCollection> fields = new Holder<FieldInformationCollection>();

        Holder<Long> result = new Holder<Long>();

        Holder<byte[]> stream = new Holder<byte[]>();

        String url = prepareFileUrl(documentLibraryFolder, fileName);

        // invoke WebService
        CopySoapPort port = createPort();
        port.getItem(url, result, fields, stream);

        // check the result
        Assert.isTrue(result.value.intValue() == 0);

        return stream.value;
    }

    private String prepareFileUrl(String documentLibraryFolder, String fileName) {
        try {
            // TODO more reliable handling of "/"
            URL documentLibraryUrl = new URL(this.siteRoot, documentLibraryFolder + "/");
            URL fileUrl = new URL(documentLibraryUrl, fileName);
            return fileUrl.toString();
        } catch (MalformedURLException e) {
            // TODO message
            throw new ExceptionBase(null, e);
        }
    }
}
