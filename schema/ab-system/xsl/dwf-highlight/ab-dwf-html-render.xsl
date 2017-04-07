<?xml version="1.0"?>
<!-- Yong Shao 12/07/2006 -->
<!-- common DWF render -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../constants.xsl" />
  <xsl:template match="/">
	<html lang="EN">
		<head>
			<xsl:call-template name="DWF_HTML_HEADER"/>
		</head>
		<xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
		<xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>
		<xsl:variable name="executeTransaction" select="//afmAction[@type='executeTransaction']/@serialized"/>
		<body  onload='strTransactionserialized="{$executeTransaction}";setUpDWFFileLink();loadDwfViewer("400", "400", "{$absoluteAppPath_expressViewer5}", "{$isDwfViewer7}");loadDrawing();'  class="body" leftmargin="0" rightmargin="0" topmargin="0">
			<xsl:call-template name="DWF_HTML_BODY_CONTENT"/>
			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
	</html>
  </xsl:template>

  <xsl:include href="ab-dwf-highlight-common.xsl" />
  <xsl:include href="../common.xsl" />
</xsl:stylesheet>
