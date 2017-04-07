package com.archibus.app.solution.common.webservice.employee.client;

import java.net.URL;
import java.util.List;

import javax.xml.ws.BindingProvider;

import com.archibus.utility.ExceptionBase;

/**
 * This is an example of client calling EmployeeService WebService (exposed by an abstract ERP).
 * This client is supposed to be in WebCentral.
 *
 * @see EmployeeServiceImpl
 * @author Valery Tydykov
 *
 */
public class EmployeeServiceClientImpl implements EmployeeServiceClient {

    private static final String EMPLOYEE_SERVICE_WSDL = "EmployeeService.wsdl";

    private URL serviceAddress;

    public URL getServiceAddress() {
        return this.serviceAddress;
    }

    public void setServiceAddress(final URL serviceAddress) {
        this.serviceAddress = serviceAddress;
    }

    // TODO unit test
    /*
     * (non-Javadoc)
     *
     * @see
     * com.archibus.app.solution.common.webservice.employee.download.client.EmployeeServiceClient#
     * getEmployees(java. lang.String, java.lang.String)
     */
    @Override
    public List<Employee> getEmployees(final String divisionId, final String departmentId)
            throws ExceptionBase {
        final EmployeeService port = createPort();

        try {
            // invoke WebService
            final List<Employee> employees = port.getEmployees(divisionId, departmentId);
            return employees;
        } catch (final DataRetrievalException_Exception e) {
            // TODO
            // @non-translatable
            throw new ExceptionBase(null, e);
        } catch (final InvalidArgumentException_Exception e) {
            // TODO
            // @non-translatable
            throw new ExceptionBase(null, e);
        }
    }

    private EmployeeService createPort() {
        // load WSDL from the file
        // TODO performance hit? Move to constructor?
        final URL wsdlLocation = this.getClass().getResource(EMPLOYEE_SERVICE_WSDL);

        final EmployeeServiceProxyImpl serviceProxy = new EmployeeServiceProxyImpl(wsdlLocation);

        final EmployeeService port = serviceProxy.getEmployeeServiceSoapPort();

        final BindingProvider provider = (BindingProvider) port;
        // override the service address: set the address per request
        provider.getRequestContext().put(BindingProvider.ENDPOINT_ADDRESS_PROPERTY,
            this.serviceAddress.toString());

        return port;
    }
}
