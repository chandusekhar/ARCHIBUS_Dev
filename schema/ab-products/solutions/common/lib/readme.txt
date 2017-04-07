The jsp-api.jar file is required to compile the FieldNumericRangeSelector.java 
example when the web application is deployed to Tomcat. The activity build 
script does not copy the jsp-api.jar to the WEB-INF\lib folder to avoid 
runtime conflicts with the JSP API implementation provided by the server.