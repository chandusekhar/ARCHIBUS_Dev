<?xml version="1.0" encoding="UTF-8"?>
<!--  xsl called by Java to handle calendar -->
<!-- since calendar.xsl is included in another XSl which import constants.xsl -->
<!-- xsl variable schemaPath in constants.xsl can be used here -->
<!-- javascript variables and functions used here are in calendar.js -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="Calendar">
		<xsl:param name="MM"/>
		<xsl:param name="YYYY"/>
		<xsl:param name="But"/>
		<xsl:param name="Size"/>
	</xsl:template>
</xsl:stylesheet>