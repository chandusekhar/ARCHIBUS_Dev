package com.archibus.app.solution.common.webservice.helloworld;

/**
 * @author Valery Tydykov
 * 
 */
import javax.jws.WebService;

@WebService(endpointInterface = "com.archibus.app.solution.common.webservice.helloworld.HelloWorld")
public class HelloWorldImpl implements HelloWorld {
    
    public String sayHi(final String text) {
        System.out.println("sayHi called");
        return "Hello " + text;
    }
}
