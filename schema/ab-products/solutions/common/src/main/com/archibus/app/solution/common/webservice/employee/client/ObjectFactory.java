
package com.archibus.app.solution.common.webservice.employee.client;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.archibus.app.solution.common.webservice.employee.client package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

    private final static QName _GetEmployeesResponse_QNAME = new QName("http://server.employee.webservice.mycompany.com/", "getEmployeesResponse");
    private final static QName _InvalidArgumentException_QNAME = new QName("http://server.employee.webservice.mycompany.com/", "InvalidArgumentException");
    private final static QName _GetEmployees_QNAME = new QName("http://server.employee.webservice.mycompany.com/", "getEmployees");
    private final static QName _DataRetrievalException_QNAME = new QName("http://server.employee.webservice.mycompany.com/", "DataRetrievalException");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.archibus.app.solution.common.webservice.employee.client
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link GetEmployeesResponse }
     * 
     */
    public GetEmployeesResponse createGetEmployeesResponse() {
        return new GetEmployeesResponse();
    }

    /**
     * Create an instance of {@link DataRetrievalException }
     * 
     */
    public DataRetrievalException createDataRetrievalException() {
        return new DataRetrievalException();
    }

    /**
     * Create an instance of {@link Employee }
     * 
     */
    public Employee createEmployee() {
        return new Employee();
    }

    /**
     * Create an instance of {@link GetEmployees }
     * 
     */
    public GetEmployees createGetEmployees() {
        return new GetEmployees();
    }

    /**
     * Create an instance of {@link InvalidArgumentException }
     * 
     */
    public InvalidArgumentException createInvalidArgumentException() {
        return new InvalidArgumentException();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetEmployeesResponse }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://server.employee.webservice.mycompany.com/", name = "getEmployeesResponse")
    public JAXBElement<GetEmployeesResponse> createGetEmployeesResponse(GetEmployeesResponse value) {
        return new JAXBElement<GetEmployeesResponse>(_GetEmployeesResponse_QNAME, GetEmployeesResponse.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link InvalidArgumentException }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://server.employee.webservice.mycompany.com/", name = "InvalidArgumentException")
    public JAXBElement<InvalidArgumentException> createInvalidArgumentException(InvalidArgumentException value) {
        return new JAXBElement<InvalidArgumentException>(_InvalidArgumentException_QNAME, InvalidArgumentException.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetEmployees }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://server.employee.webservice.mycompany.com/", name = "getEmployees")
    public JAXBElement<GetEmployees> createGetEmployees(GetEmployees value) {
        return new JAXBElement<GetEmployees>(_GetEmployees_QNAME, GetEmployees.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link DataRetrievalException }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://server.employee.webservice.mycompany.com/", name = "DataRetrievalException")
    public JAXBElement<DataRetrievalException> createDataRetrievalException(DataRetrievalException value) {
        return new JAXBElement<DataRetrievalException>(_DataRetrievalException_QNAME, DataRetrievalException.class, null, value);
    }

}
