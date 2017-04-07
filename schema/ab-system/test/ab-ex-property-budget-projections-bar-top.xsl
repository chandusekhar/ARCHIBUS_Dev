<?xml version="1.0"?>
<!-- ab-ex-property-holdings-by-status-chart.xsl for ab-ex-property-holdings-by-status-chart.axvw-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../xsl/constants.xsl" />
  <xsl:variable name="chart_view_name" select="'ab-ex-property-budget-projections-bar.axvw'"/>
  <xsl:template match="/">
	<html>
		<title>
			<xsl:value-of select="//title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
		    <!-- LinkingCSS in common.xsl includes the default style sheets -->
		    <xsl:call-template name="LinkingCSS" />
		     <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
			<xsl:value-of select="$whiteSpace" />
		    </script>
		    <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-ex-property-budget-projections-bar.js">
			<xsl:value-of select="$whiteSpace" />
		    </script>
		</head>
		<!-- svg viewer body -->
		<xsl:call-template name="svg-common">
			<xsl:with-param name="chart_view_name" select="$chart_view_name" /> 
		</xsl:call-template>
	</html>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../xsl/common.xsl" />
  <xsl:include href="../xsl/ab-ex-svg-charts-common.xsl" />
</xsl:stylesheet>
