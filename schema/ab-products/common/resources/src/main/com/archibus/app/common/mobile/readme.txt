This folder contains configuration files for the following remoting configuration:

DWR Services for Mobile Client.

This configuration is enabled by default.

To disable this configuration:
----------------------------------------------------------------------------------

1. Modify one line in /WEB-INF/config/context/applications/mobileservices.properties file:

mobileServices.configurationFile=classpath:com/archibus/app/common/mobile/dummy-services.xml
