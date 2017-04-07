<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	
	<xsl:template match="/">
		<html lang="EN">
			<body>
				<iframe name="kpi" style="align=left" width="150%" height="5" frameborder="0" src="kpi.htm"></iframe>
				<iframe name="kpi1" style="align=left" bgcolor="green" width="150%" height="5" frameborder="1" src="kpi1-b.htm"></iframe>
				<iframe name="kpi2" style="align=left" width="150%" height="5" frameborder="1" src="kpi2-b.htm"></iframe>
				<iframe name="kpi3" style="align=left"  width="150%" height="5" frameborder="1" src="kpi3-b.htm"></iframe>
				<iframe name="kpi4" style="align=left"  width="150%" height="5" frameborder="1" src="kpi4-b.htm"></iframe>
				<iframe name="alert" style="align=left"  width="150%" height="5" frameborder="1" src="alert.htm"></iframe>
				<iframe name="alert1" style="align=left"  width="150%" height="5" frameborder="1" src="alert1-b.htm"></iframe>
				<iframe name="alert2" style="align=left"  width="150%" height="5" frameborder="1" src="alert2-b.htm"></iframe>
				<iframe name="alert3" style="align=left"  width="150%" height="5" frameborder="1" src="alert3-b.htm"></iframe>
				<iframe name="alert4" style="align=left"  width="150%" height="5" frameborder="1" src="alert4-b.htm"></iframe>
				<iframe name="kpi" style="align=left"  width="150%" height="5" frameborder="0" src="kpi.htm"></iframe>

			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>


