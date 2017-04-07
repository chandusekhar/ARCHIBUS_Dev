<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:template match="/">

		<html lang="EN">
			<body class="jc-default">
				<xsl:for-each select="/*/FRAMESET">
				<!-- select the children of the logo element -->
				<xsl:apply-templates select="FRAMESET/*">
				  <!-- recursively apply this template to them -->
				  <xsl:template>
					<xsl:copy>
					  <xsl:apply-templates select="@* | *"/>
					</xsl:copy>
				  </xsl:template>
				</xsl:apply-templates>
		        </xsl:for-each>
			</body>
		</html>

	</xsl:template>
</xsl:stylesheet>



