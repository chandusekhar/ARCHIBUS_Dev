/**
 * 
 */
package com.archibus.app.solution.common.webservice.helloworld;

/**
 * @author tydykov
 * 
 */
import javax.jws.WebService;

@WebService
public interface HelloWorld {
    String sayHi(String text);
}
