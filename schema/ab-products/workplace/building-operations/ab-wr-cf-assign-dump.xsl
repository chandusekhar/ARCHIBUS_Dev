<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data:ab-wr-approve-or-issue.axvw: edit tgrp -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

	<xsl:template match="/">
		<html>	
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			
		</head>
		
		<body class="body"   leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0"> 
			<script language="javascript">
				if(opener!=null)
				{
					opener.parent.location.reload();
				}
				window.close();
			</script>
		</body>
		</html>
	</xsl:template>
</xsl:stylesheet>