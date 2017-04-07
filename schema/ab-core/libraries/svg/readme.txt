To fix d3 zoom and pan unstable issue, comment out point = point.matrixTransform(container.getScreenCTM().inverse()); in  function d3_mousePoint(container, e) 
