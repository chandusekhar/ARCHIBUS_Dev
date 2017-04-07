<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle any common filter form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:console="http://www.archibus.com/FMWebCentral/console">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	
	<xsl:template match="/">

		<xsl:call-template name="ConsoleContent" />
		
	</xsl:template>
	
	<!-- including xsl which are called -->
	<xsl:include href="ab-console-helper.xsl" />
	<xsl:include href="common.xsl" />
	<xsl:include href="inputs-validation.xsl" />
	<xsl:include href="locale.xsl" />
</xsl:stylesheet>
