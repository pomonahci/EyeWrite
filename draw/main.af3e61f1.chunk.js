(this["webpackJsonpcollaborative-drawing"]=this["webpackJsonpcollaborative-drawing"]||[]).push([[0],{172:function(e,t,i){},173:function(e,t,i){},284:function(e,t,i){},286:function(e,t,i){},287:function(e,t,i){},289:function(e,t,i){"use strict";i.r(t);var r=i(6),o=i(0),s=i.n(o),n=i(10),h=i.n(n),a=(i(172),i(19)),c=i(20),d=i(30),u=i(29),l=(i(173),i(155)),p=i(15),v=i(55),k=i(140),g=i(59),f=i(334),m=i(332),y=i(141),S=i.n(y),b=i(87),x=i.n(b),C=(i(114),i(157)),j=i(337),w=i(329),M=i(147),O=i.n(M),P=i(148),T=i.n(P),I=i(150),G=i.n(I),E=i(151),D=i.n(E),z=i(152),H=i.n(z),L=i(153),B=i.n(L),F=i(154),N=i.n(F),U=i(327),V=i(336),W=i(3),X=i.n(W),Y=i(156),A=i(323),J=i(335),K=function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(e){var r;return Object(a.a)(this,i),(r=t.call(this,e)).handleClick=function(){r.setState({displayColorPicker:!r.state.displayColorPicker})},r.handleClose=function(){r.setState({displayColorPicker:!1})},r.handleChange=function(e){r.props.changeColor(e)},r.state={displayColorPicker:!1},r}return Object(c.a)(i,[{key:"render",value:function(){var e=X()({default:{main:{float:"left",padding:"10px"},color:{width:"36px",height:"14px",borderRadius:"2px",background:"".concat(this.props.color)},swatch:{padding:"5px",background:"#fff",borderRadius:"1px",boxShadow:"0 0 0 1px rgba(0,0,0,.1)",display:"inline-block",cursor:"pointer"},popover:{position:"absolute",zIndex:"2"},cover:{position:"fixed",top:"0px",right:"0px",bottom:"0px",left:"0px"}}});return Object(r.jsxs)("div",{style:e.main,children:[Object(r.jsxs)(A.a,{children:[Object(r.jsxs)(J.a,{color:"secondary",children:["  ",Object(r.jsx)("div",{style:{fontSize:"12px"},children:"Color"}),";"]}),Object(r.jsx)("div",{style:e.swatch,onClick:this.handleClick,children:Object(r.jsx)("div",{style:e.color})})]}),this.state.displayColorPicker?Object(r.jsxs)("div",{style:e.popover,children:[Object(r.jsx)("div",{style:e.cover,onClick:this.handleClose}),Object(r.jsx)(Y.a,{color:this.props.color,onChange:this.handleChange})]}):null]})}}]),i}(s.a.Component),R=i(331),Z=i(338),q=i(149),Q=i.n(q),$=(i(284),function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(e){var r;return Object(a.a)(this,i),(r=t.call(this,e)).changeMode=function(e,t){r.setState({mode:t})},r.handleStrokeSizeChange=function(e){r.props.changeStrokeSize(e.target.value)},r.state={mode:"draw"},r}return Object(c.a)(i,[{key:"render",value:function(){var e=this;return Object(r.jsxs)("div",{id:"topbar",children:[Object(r.jsx)(K,{color:this.props.color,changeColor:this.props.changeColor}),Object(r.jsxs)(V.a,{className:"float-btn",value:this.state.mode,exclusive:!0,onChange:this.changeMode,"aria-label":"sketch mode",children:[Object(r.jsx)(U.a,{onClick:function(){return e.props.drawMode()},value:"draw","aria-label":"draw mode",children:Object(r.jsx)(j.a,{title:"Draw Mode",children:Object(r.jsx)(O.a,{})})}),Object(r.jsx)(U.a,{onClick:function(){return e.props.colorMode()},value:"color","aria-label":"color mode",children:Object(r.jsx)(j.a,{title:"Change Stroke Color",children:Object(r.jsx)(T.a,{})})}),Object(r.jsx)(U.a,{onClick:function(){return e.props.pickColor()},value:"pickColor","aria-label":"pick color",children:Object(r.jsx)(j.a,{title:"Pick Color",children:Object(r.jsx)(Q.a,{})})}),Object(r.jsx)(U.a,{onClick:function(){return e.props.eraseMode()},value:"erase","aria-label":"erase mode",children:Object(r.jsx)(j.a,{title:"Erase Stroke",children:Object(r.jsx)(G.a,{})})}),Object(r.jsx)(U.a,{onClick:function(){return e.props.moveMode()},value:"move","aria-label":"move mode",children:Object(r.jsx)(j.a,{title:"Move Stroke",children:Object(r.jsx)(D.a,{style:{height:20}})})})]}),Object(r.jsx)(j.a,{title:"Undo",children:Object(r.jsx)(w.a,{onClick:function(){return e.props.undo()},color:"secondary","aria-label":"undo stroke",children:Object(r.jsx)(H.a,{})})}),Object(r.jsx)(j.a,{title:"Redo",children:Object(r.jsx)(w.a,{onClick:function(){return e.props.redo()},color:"secondary","aria-label":"redo stroke",children:Object(r.jsx)(B.a,{})})}),Object(r.jsx)(j.a,{title:"Clear Canvas",children:Object(r.jsx)(w.a,{onClick:function(){return e.props.clear()},color:"secondary","aria-label":"clear drawing",children:Object(r.jsx)(N.a,{})})}),Object(r.jsxs)(A.a,{children:[Object(r.jsx)(J.a,{color:"secondary",children:"Size"}),Object(r.jsx)(R.a,{color:"secondary",value:this.props.strokeSize,onChange:this.handleStrokeSizeChange,children:Object(C.a)(Array(60).keys()).map((function(e){return Object(r.jsx)(Z.a,{value:e,children:e},"stroke-size-"+e)}))})]})]})}}]),i}(o.Component)),_=i(67),ee=i(85),te=i.n(ee),ie=function(){function e(t,i,r,o,s,n,h,c,d,u,l,p,v,k){Object(a.a)(this,e),this.pathCoords=r,this.svgPath=null,this.color=t,this.width=i,this.opacity=1,this.draw=o,this.options={width:this.width,color:this.color,opacity:this.opacity,linecap:"round",linejoin:"round"},this.rendered=!0,this.erased=!1,this.idCreator=s,this.idStroke=n,this.status=h,this.idMovedFrom=c,this.movedFrom=null,this.created=d,this.timeStart=u,this.timeEnd=l,this.pencilTextureToggle=v,this.pencilTexture=k,this.drawn=!0,this.undone=p,this.svgPath=this.draw.polyline(this.pathCoords).fill("none").stroke(this.options),this.pencilTextureToggle&&this.svgPath.filter(this.pencilTexture)}return Object(c.a)(e,[{key:"serialize",value:function(){return{coords:te.a.cloneDeep(this.pathCoords),color:this.color,width:this.width,idCreator:this.idCreator,idStroke:this.idStroke,status:this.status,idMovedFrom:this.idMovedFrom,created:this.created,timeStart:this.timeStart,timeEnd:this.timeEnd,undone:this.undone}}},{key:"addPoint",value:function(e,t){this.pathCoords.push(e),this.pathCoords.push(t),this.svgPath.plot(this.pathCoords)}},{key:"moveBy",value:function(e,t){for(var i=0;i<this.pathCoords.length;i++)this.pathCoords[i]=i%2===0?this.pathCoords[i]+e:this.pathCoords[i]+t;this.svgPath.dmove(e,t)}},{key:"highlight",value:function(){this.svgPath.opacity(this.opacity)}},{key:"setColor",value:function(e){this.color=e,this.svgPath.stroke({color:e})}},{key:"remove",value:function(e){this.svgPath.remove(),this.rendered=!1,this.status=e,2===e&&(this.erased=!0)}},{key:"addToGroup",value:function(e){e.add(this.svgPath),this.rendered=!0,this.status=1}},{key:"pathCoordsAtIndex",value:function(e,t,i){return e[2*t+i]}},{key:"smoothCoords",value:function(e){var t="";t+="M "+this.pathCoordsAtIndex(e,0,0)+" "+this.pathCoordsAtIndex(e,0,1)+" ";for(var i,r,o,s,n=!0,h=!1,a=0;a<e.length/2-1;a++)n&&(i=this.pathCoordsAtIndex(e,a,0),r=this.pathCoordsAtIndex(e,a,1),n=!1,h=!0),h?(o=this.pathCoordsAtIndex(e,a,0),s=this.pathCoordsAtIndex(e,a,1),n=!1,h=!1):(t+="C "+i+" "+r+" "+o+" "+s+" "+this.pathCoordsAtIndex(e,a,0)+" "+this.pathCoordsAtIndex(e,a,1)+" ",n=!0,h=!1);return t}},{key:"addToGroupSmoothed",value:function(e){this.svgPath.remove();var t=this.draw.path(this.smoothCoords(this.pathCoords)).fill("none").stroke(this.options);this.pencilTextureToggle&&t.filter(this.pencilTexture),this.svgPath=t,e.add(t)}}],[{key:"deserialize",value:function(t,i,r){return new e(t.color,t.width,t.coords,i,t.idCreator,t.idStroke,t.status,t.idMovedFrom,t.created,t.timeStart,t.timeEnd,t.undone,t.pencilTextureToggle,r)}}]),e}(),re=function(){function e(t,i,r,o,s){Object(a.a)(this,e),this.type=i.type,this.drawn=!1,this.draw=t,this.stroke=i,this.rendered=!0,this.idCreator=r,this.idStroke=o,this.status=s,this.opacity=1,this.movedFrom=null}return Object(c.a)(e,[{key:"serialize",value:function(){return{msg:"placeholder text",type:this.type,status:this.status}}},{key:"getHTML",value:function(){return this.stroke.node.outerHTML}},{key:"copy",value:function(){var t=te.a.cloneDeep(this.stroke);return new e(this.draw,t,this.idCreator,this.idStroke,this.status)}},{key:"moveBy",value:function(e,t){this.stroke.dmove(e,t)}},{key:"highlight",value:function(){this.stroke.opacity(this.opacity)}},{key:"setColor",value:function(e){this.color=e,console.log(this.stroke.attr("stroke")),console.log(this.stroke.attr("fill")),"#000000"!==this.stroke.attr("stroke")&&"none"!==this.stroke.attr("stroke")&&this.stroke.stroke({color:e}),"#000000"!==this.stroke.attr("fill")&&"none"!==this.stroke.attr("fill")&&this.stroke.fill({color:e})}},{key:"remove",value:function(e){this.stroke.remove(),this.rendered=!1,this.status=e,2===e&&(this.erased=!0)}},{key:"addToGroup",value:function(e){e.add(this.stroke),this.rendered=!0,this.status=1}}]),e}(),oe=function(){function e(t,i,r){Object(a.a)(this,e),this.clearedSketches=[[]],this.sketchGroup=t.group(),this.draw=t,this.currentPath=null,this.undoIndex=0,this.clearUndoIndex=0,this.svg=i,this.prevMouseLocation=null,this.currMouseLocation=null,this.beganHighlighting=!1,this.userID=null,this.currStrokeID=1,this.pencilTexture=r,this.originalWidth=this.getWidth(),this.originalHeight=this.getHeight(),this.updateDimensions(),this.animationfinished=!0}return Object(c.a)(e,[{key:"getPaths",value:function(){return this.clearedSketches[this.clearedSketches.length-this.clearUndoIndex-1]}},{key:"setPaths",value:function(e){this.clearedSketches[this.clearedSketches.length-this.clearUndoIndex-1]=e}},{key:"updatePaths",value:function(e,t){e.push(t),this.setPaths(e),this.clearedSketches=this.clearedSketches.slice(0,this.clearedSketches.length-this.clearUndoIndex),this.undoIndex=0,this.clearUndoIndex=0}},{key:"getWidth",value:function(){var e=document.getElementById("sketchpad");return null!==e?e.clientWidth:this.svg.clientWidth}},{key:"getHeight",value:function(){var e=document.getElementById("sketchpad");return null!==e?e.clientHeight:this.svg.clientHeight}},{key:"addZero",value:function(e,t){for(;e.toString().length<t;)e="0"+e;return e}},{key:"getTime",value:function(){var e=new Date;return this.addZero(e.getHours(),2)+":"+this.addZero(e.getMinutes(),2)+":"+this.addZero(e.getSeconds(),2)+":"+this.addZero(e.getMilliseconds(),3)}},{key:"serialize",value:function(){for(var e=[],t=this.getPaths(),i=0;i<t.length-this.undoIndex;i++)e.push(t[i].serialize());return e}},{key:"loadSketch",value:function(e){this.remove(),this.setPaths([]);var t,i=Object(_.a)(e);try{for(i.s();!(t=i.n()).done;){var r=t.value;if(0<r.status){var o=ie.deserialize(r,this.draw,this.pencilTexture);null!==o&&(o.hasprettyStroke=!1,1!==o.status&&(o.rendered=!1),this.getPaths().push(o))}}}catch(s){i.e(s)}finally{i.f()}}},{key:"displayLoadedSketch",value:function(e){var t=this;e=void 0===e||e,this.sketchGroup.remove(),this.sketchGroup=this.draw.group(),e||this.updateDimensions();var i,r=Object(_.a)(this.getPaths());try{var o=function(){var e=i.value;e.addToGroupSmoothed(t.sketchGroup),1!==e.status&&e.remove(e.status),"move"===e.created&&(e.movedFrom=t.getPaths().find((function(t){return t.idStroke===e.idMovedFrom})))};for(r.s();!(i=r.n()).done;)o()}catch(u){r.e(u)}finally{r.f()}var s=this.getWidth(),n=this.getHeight();if(e){var h=this.sketchGroup.bbox(),a=n,c=document.getElementById("votebar");null!==c&&(a-=c.getClientRects()[0].height);var d=Math.min(s/h.width,a/h.height);this.sketchGroup.transform({x:s/2-h.cx,y:a/2-h.cy,relative:!0}),this.sketchGroup.transform({scaleX:.8*d,scaleY:.8*d})}}},{key:"displayText",value:function(e){var t;"peek"===e?(t=this.draw.text("User has only peeked so far.")).move(20,70):(t=this.draw.text("User has not sketched \nnor peeked so far.")).move(40,70),this.sketchGroup=t}},{key:"updateDimensions",value:function(){var e=this.getWidth()/this.originalWidth,t=this.getHeight()/this.originalHeight;this.updateOrigin();var i=Math.min(e,t);this.sketchGroup.transform({scale:i,cx:0,cy:0})}},{key:"updateOrigin",value:function(){this.sketchGroup.transform({scale:1}),this.sketchGroup.transform({x:this.getWidth()/2,y:this.getHeight()/2})}},{key:"undo",value:function(e){if(this.undoIndex<this.getPaths().length){if(!e)return!1;2===e.status&&!e.rendered&&e.erased?e.addToGroup(this.sketchGroup):e.rendered&&null!==e.movedFrom&&!e.movedFrom.rendered?(e.remove(3),e.movedFrom.addToGroup(this.sketchGroup)):e.remove(2),this.undoIndex+=1}else{if(!(this.clearUndoIndex<this.clearedSketches.length-1))return!1;this.undoIndex=0,this.clearUndoIndex+=1;var t,i=Object(_.a)(this.getPaths());try{for(i.s();!(t=i.n()).done;){var r=t.value;r.rendered&&r.addToGroup(this.sketchGroup)}}catch(o){i.e(o)}finally{i.f()}}return!0}},{key:"redo",value:function(e){if(this.undoIndex>0){if(!e)return!1;e.rendered&&e.erased?e.remove():!e.rendered&&null!==e.movedFrom&&e.movedFrom.rendered?(e.addToGroup(this.sketchGroup),e.movedFrom.remove(3)):e.addToGroup(this.sketchGroup),this.undoIndex-=1}else{if(!(this.clearUndoIndex>0))return!1;this.remove(),this.clearUndoIndex-=1,this.undoIndex=this.getPaths().length}return!0}},{key:"clear",value:function(){return 0!==this.getPaths().length&&(this.clearedSketches=this.clearedSketches.slice(0,this.clearedSketches.length-this.clearUndoIndex),this.clearUndoIndex=0,this.undoIndex=0,this.remove(),this.clearedSketches.push([]),!0)}},{key:"remove",value:function(){this.sketchGroup.remove(),this.sketchGroup=this.draw.group(),this.updateDimensions()}},{key:"erase",value:function(e,t){var i=this.select(e,t);if("undefined"!==typeof i){var r=i[0],o=i[1];return o.remove(2),this.updatePaths(r,o),!0}return!1}},{key:"color",value:function(e,t,i){var r=this.select(e,t);return"undefined"!==typeof r&&(r[1].setColor(i),!0)}},{key:"pickColor",value:function(e,t){var i=this.select(e,t);return"undefined"!==typeof i&&i[1].color}},{key:"select",value:function(e,t){if(this.getPaths().length>0){var i=this.svg.getBoundingClientRect(),r=this.sketchGroup.transform(),o=(e-i.left-r.x)/r.scaleX,s=(t-i.top-r.y)/r.scaleY;if(this.prevMouseLocation=[o,s],this.currMouseLocation=[o,s],!Number.isNaN(o)&&!Number.isNaN(s)){for(var n=this.getPaths().slice(0,this.getPaths().length-this.undoIndex),h=[],a=0;a<n.length;a++)1===n[a].status?n[a].drawn?h.push(this.getClosestDistanceDrawnSVG(n[a].pathCoords,o,s)):h.push(this.getClosestDistanceImportedSVG(n[a].stroke.node.getBoundingClientRect(),e,t)):h.push(9999);var c=Math.min.apply(null,h);if(c<40)return[n,n[h.indexOf(c)]]}}}},{key:"getClosestDistanceDrawnSVG",value:function(e,t,i){for(var r=[],o=0;o<e.length;o+=2){var s=e[o]-t,n=e[o+1]-i;r.push(Math.sqrt(s*s+n*n))}return Math.min.apply(null,r)}},{key:"getClosestDistanceImportedSVG",value:function(e,t,i){for(var r=[],o=0;o<e.width;o++)for(var s=0;s<e.height;s++){var n=e.x+o-t,h=e.y+s-i;r.push(Math.sqrt(n*n+h*h))}return Math.min.apply(null,r)}},{key:"startMove",value:function(e){e.type.startsWith("touch")&&(e=e.changedTouches[0]);var t=this.select(e.clientX,e.clientY);if("undefined"!==typeof t){var i,r=t[0],o=t[1];if(o.drawn)(i=ie.deserialize(o.serialize(),this.draw,this.pencilTexture)).addToGroupSmoothed(this.sketchGroup);else{var s=this.draw.svg(o.getHTML());(i=new re(this.draw,s.children()[3],this.userID,this.currStrokeID,1)).addToGroup(this.sketchGroup)}return i.timeStart=this.getTime(),i.idStroke=this.currStrokeID,i.pencilTextureToggle=o.pencilTextureToggle,i.created=2,i.idMovedFrom=o.idStroke,i.movedFrom=o,o.remove(3),this.currStrokeID+=1,i.opacity=.1,i.highlight(),this.updatePaths(r,i),this.currentPath=i,!0}return!1}},{key:"endMove",value:function(){this.currentPath.opacity=1,this.currentPath.highlight(),this.currentPath.timeEnd=this.getTime();var e=this.prevMouseLocation.concat(this.currMouseLocation);return this.currMouseLocation=null,e}},{key:"hide",value:function(){this.sketchGroup.hide()}},{key:"show",value:function(){this.sketchGroup.show()}},{key:"continueLineWithEvent",value:function(e,t,i,r){var o,s,n=this.svg.getBoundingClientRect(),h=this.sketchGroup.transform();null===e?(o=(i-n.left-h.x)/h.scaleX,s=(r-n.top-h.y)/h.scaleY):(e.type.startsWith("touch")&&(e=e.changedTouches[0]),o=(e.clientX-n.left-h.x)/h.scaleX,s=(e.clientY-n.top-h.y)/h.scaleY),"draw"===t?(this.currentPath.addPoint(o,s),sketchEdit('point')):"move"===t&&null!==this.currMouseLocation&&(this.currentPath.moveBy(o-this.currMouseLocation[0],s-this.currMouseLocation[1]),this.currMouseLocation=[o,s])}},{key:"startPath",value:function(e,t,i){this.currentPath=new ie(e,t,[],this.draw,this.userID,this.currStrokeID,1,0,1,"","",false,i,this.pencilTexture),this.currStrokeID+=1,this.currentPath.addToGroup(this.sketchGroup),this.currentPath.timeStart=this.getTime()}},{key:"finishPath",value:function(){this.currentPath.timeEnd=this.getTime();var e=this.getPaths().slice(0,this.getPaths().length-this.undoIndex);this.updatePaths(e,this.currentPath),this.currentPath.addToGroupSmoothed(this.sketchGroup),sketchEdit("draw")}},{key:"addPathFromCode",value:function(e){var t=ie.deserialize(e,this.draw,this.pencilTexture),i=this.getPaths().slice(0,this.getPaths().length-this.undoIndex),r=this.currentPath;t.idStroke=this.currStrokeID,t.pencilTextureToggle=r.pencilTextureToggle,t.created=2,this.currStrokeID+=1,t.idMovedFrom=r.idStroke,t.movedFrom=r,t.hasprettyStroke=!1,r.remove(3),t.addToGroupSmoothed(this.sketchGroup),t.timeStart=this.getTime(),this.updatePaths(i,t),this.currentPath=t}},{key:"highlightPeekedStroke",value:function(e){var t=this.select(e.clientX,e.clientY);"undefined"!==typeof t&&(t[1].highlight(),this.beganHighlighting=!0)}},{key:"getHighlightedPeekedStrokes",value:function(){var e,t=[],i=Object(_.a)(this.getPaths());try{for(i.s();!(e=i.n()).done;){var r=e.value;r.peekHighlighted&&t.push(r)}}catch(o){i.e(o)}finally{i.f()}return t}},{key:"animateNewPeekedStroke",value:function(e){var t=this;if("sketch"===e){var i=this.getPaths(),r=i[i.length-1];if(1===r.created&&1===r.status){this.animationfinished||(this.currentPath.remove(2),r.addToGroup(this.sketchGroup),this.animationfinished=!0,clearInterval(this.intvl)),this.animationfinished=!1,r.remove(2);var o=(this.convertToMillisec(r.timeEnd)-this.convertToMillisec(r.timeStart))/(r.pathCoords.length/2),s=0;this.startPath(r.color,r.width,r.pencilTextureToggle,this.pencilTexture),this.intvl=setInterval((function(){s>=r.pathCoords.length?(t.currentPath.addToGroupSmoothed(t.sketchGroup),t.currentPath.remove(2),r.addToGroup(t.sketchGroup),t.animationfinished=!0,clearInterval(t.intvl)):(t.currentPath.addPoint(r.pathCoords[s],r.pathCoords[s+1]),s+=2)}),o)}}}},{key:"convertToMillisec",value:function(e){var t=e.split(":");return parseInt(36e5*t[0])+parseInt(6e4*t[1])+parseInt(1e3*t[2])+parseInt(t[3])}},{key:"addImportedStroke",value:function(e){this.currentPath=new re(this.draw,e,this.userID,this.currStrokeID,1),this.currStrokeID+=1,this.currentPath.timeEnd=this.getTime();var t=this.getPaths().slice(0,this.getPaths().length-this.undoIndex);this.updatePaths(t,this.currentPath),this.currentPath.addToGroup(this.sketchGroup)}}]),e}(),se=i.p+"static/media/paper.64f19b60.png",ne=i.p+"static/media/pencil1loop.e5fcd29b.mp3",he=i.p+"static/media/pencil2loop.1d70b1af.mp3",ae=i.p+"static/media/pencil3loop.f85ab838.mp3",ce=(i(286),function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(e){var r;return Object(a.a)(this,i),(r=t.call(this,e)).state={sketchMode:"draw",currSoundCount:0,currStroke:r.props.currStroke,currColor:"#D4AAAA",currStrokeSize:4,snackbarOpen:!1},r.drawing=!1,r.sketchSounds=[new g.Howl({src:[ne],loop:!0}),new g.Howl({src:[he],loop:!0}),new g.Howl({src:[ae],loop:!0})],r.setBindings(),r}return Object(c.a)(i,[{key:"setBindings",value:function(){this.verifyJSON=this.verifyJSON.bind(this),this.drawMode=this.drawMode.bind(this),this.colorMode=this.colorMode.bind(this),this.eraseMode=this.eraseMode.bind(this),this.moveMode=this.moveMode.bind(this),this.clear=this.clear.bind(this),this.undo=this.undo.bind(this),this.redo=this.redo.bind(this),this.changeColor=this.changeColor.bind(this),this.pickColor=this.pickColor.bind(this),this.changeStrokeSize=this.changeStrokeSize.bind(this)}},{key:"componentDidMount",value:function(){var e=this,t=document.getElementById("sketchpage").clientWidth,i=document.getElementById("sketchpage").clientHeight;k.isMobile?(this.draw=x()("svg").size(t,i),this.background=this.draw.image(se,t,i)):(this.draw=x()("svg").size("100%","100%"),this.background=this.draw.image(se,t,i)),this.background.scale(5).hide();var r=document.getElementById("svg").getElementsByTagName("svg")[0];this.pencilTexture=new x.a.Filter,this.pencilTexture.turbulence(1.5,1,0,"noStitch","fractalNoise").result("f1"),this.pencilTexture.colorMatrix("matrix","0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1.5 2.8").result("f2"),this.pencilTexture.composite("SourceGraphic","f2","in").result("f3"),this.pencilTexture.turbulence(1.8,3,0,"noStitch","fractalNoise").result("noise"),this.pencilTexture.displacementMap("f3","",2.5,"R","G").result("f4"),this.primarySketch=new oe(this.draw,r,this.pencilTexture),primSket=this.primarySketch,window.addEventListener("resize",(function(){e.primarySketch.updateDimensions()})),window.addEventListener("keyup",(function(t){return e.handleKeyUp(t)})),window.addEventListener("keydown",(function(t){return e.handleKeyDown(t)})),r.addEventListener("touchmove",(function(e){e.preventDefault()})),r.addEventListener("wheel",(function(t){e.changeStrokeSize(-.02*t.deltaY,!0)})),this.cursor=document.querySelector(".cursor"),r.addEventListener("mousemove",(function(t){return e.moveCursor(t,"in")})),r.addEventListener("mouseleave",(function(t){return e.moveCursor(t,"out")})),r.addEventListener("mouseenter",(function(t){return e.moveCursor(t,"into")}))}},{key:"moveCursor",value:function(e,t){"in"===t?"draw"===this.state.sketchMode?(this.cursor.style.top=e.pageY+"px",this.cursor.style.left=e.pageX+"px",document.body.style.cursor="none"):this.cursor.style.display="none":"out"===t?(this.cursor.style.display="none",document.body.style.cursor="auto",this.handleMouseUp(e,"mouse")):"draw"===this.state.sketchMode?(this.cursor.style.display="block",this.cursor.style.top=e.pageY+"px",this.cursor.style.left=e.pageX+"px",document.body.style.cursor="none"):"color"===this.state.sketchMode?document.body.style.cursor="cell":"pickColor"===this.state.sketchMode?document.body.style.cursor="crosshair":"erase"===this.state.sketchMode?document.body.style.cursor="no-drop":document.body.style.cursor="grab"}},{key:"handleMouseDown",value:function(e){currentlyEditing=true;if(this.prevX=e.clientX,this.prevY=e.clientY,"erase"===this.state.sketchMode)this.primarySketch.erase(e.clientX,e.clientY),sketchEdit("erase",e.clientX,e.clientY);else if("move"===this.state.sketchMode)!this.moving&&this.primarySketch.startMove(e)&&(this.moving=!0,document.body.style.cursor="grabbing",this.primarySketch.continueLineWithEvent(e,"move"));else if("draw"===this.state.sketchMode){var t=Math.floor(Math.random()*Math.floor(3));this.sketchSounds[t].play(),this.setState({currSoundCount:t}),this.drawing=!0,this.primarySketch.startPath(this.state.currColor,this.state.currStrokeSize,this.state.paperTextureSwitch),this.primarySketch.continueLineWithEvent(e,"draw")}else if("color"===this.state.sketchMode)this.primarySketch.color(e.clientX,e.clientY,this.state.currColor),sketchEdit("color",e.clientX,e.clientY,this.state.currColor);else if("pickColor"===this.state.sketchMode){var i=this.primarySketch.pickColor(e.clientX,e.clientY);i&&this.changeColor(i,!0)}}},{key:"handleMove",value:function(e){this.drawing?(this.changeStrokeVolume(e),this.primarySketch.continueLineWithEvent(e,"draw")):this.moving?this.primarySketch.continueLineWithEvent(e,"move"):"draw"!==this.state.sketchMode&&this.hoverStroke(e),e.persist(),this.prevMouseEvent=e}},{key:"handleMouseUp",value:function(e,t){"move"===this.state.sketchMode&&this.moving&&!this.drawing?(this.moving=!1,document.body.style.cursor="grab",sketchEdit("move")):"draw"===this.state.sketchMode&&this.drawing&&(this.sketchSounds[this.state.currSoundCount].stop(),this.drawing=!1,this.primarySketch.finishPath()),null!==this.primarySketch.currentPath?this.props.updateStrokeCode(JSON.stringify(this.primarySketch.currentPath.serialize()),"there"):this.props.updateStrokeCode("Start drawing a SVG to begin! --\x3e")}},{key:"handleKeyUp",value:function(e){}},{key:"handleKeyDown",value:function(e){90===e.keyCode&&(e.ctrlKey||e.metaKey)&&e.shiftKey?sketchEdit("redo"):90===e.keyCode&&(e.ctrlKey||e.metaKey)&&sketchEdit("undo")}},{key:"hoverStroke",value:function(e){var t=this.primarySketch.select(e.clientX,e.clientY);"undefined"!==typeof t?("undefined"!==typeof this.currHoveredStroke&&this.currHoveredStroke.idStroke!==t[1].idStroke&&(this.currHoveredStroke.opacity=1,this.currHoveredStroke.highlight()),this.currHoveredStroke=t[1],this.currHoveredStroke.opacity=.1,this.currHoveredStroke.highlight()):"undefined"!==typeof this.currHoveredStroke&&(this.currHoveredStroke.opacity=1,this.currHoveredStroke.highlight())}},{key:"mode",value:function(){"draw"===this.state.sketchMode?this.eraseMode():"erase"===this.state.sketchMode?this.moveMode():"move"===this.state.sketchMode&&this.drawMode()}},{key:"drawMode",value:function(){this.setState({sketchMode:"draw"}),document.body.style.cursor="auto","undefined"!==typeof this.currHoveredStroke&&(this.currHoveredStroke.opacity=1,this.currHoveredStroke.highlight())}},{key:"colorMode",value:function(){this.setState({sketchMode:"color"}),document.body.style.cursor="cell"}},{key:"pickColor",value:function(){this.setState({sketchMode:"pickColor"}),document.body.style.cursor="crosshair"}},{key:"eraseMode",value:function(){this.setState({sketchMode:"erase"}),document.body.style.cursor="no-drop"}},{key:"moveMode",value:function(){this.setState({sketchMode:"move"}),document.body.style.cursor="grab"}},{key:"clear",value:function(){this.primarySketch.clear()&&(this.primarySketch.updateDimensions(),sketchEdit("clear"))}},{key:"undo",value:function(){sketchEdit("undo")}},{key:"redo",value:function(){sketchEdit("redo")}},{key:"changeColor",value:function(e){var t=this,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];i?this.setState({currColor:e},(function(){document.getElementById("draw-cursor").style.border="1px solid ".concat(t.state.currColor)})):this.setState({currColor:e.hex},(function(){document.getElementById("draw-cursor").style.border="1px solid ".concat(t.state.currColor)}))}},{key:"changeStrokeSize",value:function(e){var t=this,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];i?this.setState({currStrokeSize:this.state.currStrokeSize+e},(function(){t.cursor.style.width=t.state.currStrokeSize+"px",t.cursor.style.height=t.state.currStrokeSize+"px"})):this.setState({currStrokeSize:e},(function(){t.cursor.style.width=t.state.currStrokeSize+"px",t.cursor.style.height=t.state.currStrokeSize+"px"}))}},{key:"download",value:function(){this.setState({paperTextureSwitch:!1}),this.background.hide();var e=document.getElementById("svg").getElementsByTagName("svg")[0],t=(new XMLSerializer).serializeToString(e),i=new Blob([t],{type:"image/svg+xml"});S.a.saveAs(i,"img.svg")}},{key:"import",value:function(e){var t=this.primarySketch,i=e.files[0];i.name.endsWith("svg")?new Promise((function(e){var t=new FileReader;t.onload=function(){e(t.result)},t.readAsText(i)})).then((function(e){var i=t.draw.svg(e).children()[3];i.each((function(e,i){"rect"===this.type&&"none"===this.node.attributes.fill.value?this.remove():t.addImportedStroke(this)})),i.node.parentNode.removeChild(i.node)})):this.setState({snackbarOpen:!0})}},{key:"changeStrokeVolume",value:function(e){var t="touchmove"===e.type?e.touches[0].clientX:e.clientX,i="touchmove"===e.type?e.touches[0].clientY:e.clientY;clearTimeout(this.timeout),this.timeout=setTimeout((function(){g.Howler.mute(!0)}),50);var r=Math.sqrt(Math.pow(this.prevX-t,2)+Math.pow(this.prevY-i,2));this.prevX=t,this.prevY=i;var o=Math.round(10*Math.min(1,r/10))/10;o<.1&&(o=0),o=o<.3?.2:o<.7?.5:.8,g.Howler.mute(!1),this.sketchSounds[this.state.currSoundCount].fade(this.sketchSounds[this.state.currSoundCount].volume(),o,100)}},{key:"verifyJSON",value:function(){try{var e=JSON.parse(this.props.currStrokeCode);this.primarySketch.addPathFromCode(e)}catch(t){this.setState({snackbarOpen:!0})}}},{key:"render",value:function(){var e=this;return Object(r.jsxs)("div",{id:"sketchpage",style:{height:"100%"},children:[Object(r.jsx)($,{verifyJSON:this.verifyJSON,color:this.state.currColor,drawMode:this.drawMode,colorMode:this.colorMode,pickColor:this.pickColor,eraseMode:this.eraseMode,moveMode:this.moveMode,undo:this.undo,redo:this.redo,clear:this.clear,changeColor:this.changeColor,changeStrokeSize:this.changeStrokeSize,strokeSize:this.state.currStrokeSize}),Object(r.jsx)("div",{id:"svg",style:{height:"100%"},onMouseDown:function(t){return e.handleMouseDown(t)},onMouseMove:function(t){return e.handleMove(t)},onMouseLeave:function(t){return e.handleMouseUp(t,"mouse")},onMouseUp:function(t){return e.handleMouseUp(t,"mouse")},onTouchCancel:function(t){return e.handleMouseUp(t,"mobile")},onTouchEnd:function(t){return e.handleMouseUp(t,"mobile")},onTouchMove:function(t){return e.handleMove(t)},onTouchStart:function(t){return e.handleMouseDown(t)}}),Object(r.jsx)(f.a,{open:this.state.snackbarOpen,autoHideDuration:2e3,onClose:function(){return e.setState({snackbarOpen:!1})},children:Object(r.jsx)(m.a,{severity:"error",elevation:6,variant:"filled",children:"SVG code invalid!"})})]})}}]),i}(o.Component)),de=(i(287),function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(e){var r;return Object(a.a)(this,i),(r=t.call(this,e)).state={width:window.innerWidth,currStrokeCode:"Start drawing a SVG to begin! --\x3e",currSliderVal:1,codeToSVGButtonClicked:!1,sliderVisible:!1},r.updateStrokeCode=r.updateStrokeCode.bind(Object(v.a)(r)),r.verifyStrokeCode=r.verifyStrokeCode.bind(Object(v.a)(r)),r.updateSliderVal=r.updateSliderVal.bind(Object(v.a)(r)),r}return Object(c.a)(i,[{key:"componentDidMount",value:function(){var e=this;window.addEventListener("resize",(function(){e.setState({width:window.innerWidth})}))}},{key:"updateStrokeCode",value:function(e){this.setState({currStrokeCode:e}),this.setState({sliderVisible:!0})}},{key:"updateSliderVal",value:function(e){this.setState({currSliderVal:e});for(var t=JSON.parse(this.state.currStrokeCode),i=[],r=0;r<t.coords.length-2*e;r+=2){for(var o=0,s=0,n=0;n<2*e;n++)n%2===0?o+=t.coords[r+n]:s+=t.coords[r+n];o/=e,s/=e,o=Math.round(o),s=Math.round(s),i.push.apply(i,[o,s])}t.coords=i,this.setState({currStrokeCode:JSON.stringify(t)})}},{key:"verifyStrokeCode",value:function(){this.setState({codeToSVGButtonClicked:!0})}},{key:"render",value:function(){return Object(r.jsxs)("div",{id:"root",style:{height:"100%"},children:[Object(r.jsx)(ce,{currStrokeCode:this.state.currStrokeCode,updateStrokeCode:this.updateStrokeCode,codeToSVGButtonClicked:this.state.codeToSVGButtonClicked}),Object(r.jsx)("div",{id:"draw-cursor",className:"cursor"})]})}}]),i}(o.Component)),ue=function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(){return Object(a.a)(this,i),t.apply(this,arguments)}return Object(c.a)(i,[{key:"render",value:function(){return Object(r.jsx)("div",{className:"App",style:{height:"100%"},children:Object(r.jsx)(l.a,{onUpdate:function(){return window.scrollTo(0,0)},children:Object(r.jsx)(p.c,{children:Object(r.jsx)(p.a,{path:"/",component:de})})})})}}]),i}(o.Component),le=function(e){e&&e instanceof Function&&i.e(3).then(i.bind(null,339)).then((function(t){var i=t.getCLS,r=t.getFID,o=t.getFCP,s=t.getLCP,n=t.getTTFB;i(e),r(e),o(e),s(e),n(e)}))};h.a.render(Object(r.jsx)(ue,{}),document.getElementById("root")),le()}},[[289,1,2]]]);
//# sourceMappingURL=main.af3e61f1.chunk.js.map