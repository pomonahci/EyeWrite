(this["webpackJsonpcollaborative-drawing"]=this["webpackJsonpcollaborative-drawing"]||[]).push([[0],{163:function(e,t,i){},274:function(e,t,i){},276:function(e,t,i){},277:function(e,t,i){"use strict";i.r(t);var r=i(6),s=i(0),o=i.n(s),n=i(10),h=i.n(n),a=(i(163),i(19)),c=i(20),d=i(49),u=i(48),l=i(132),v=i(53),p=i(324),k=i(322),g=i(133),f=i.n(g),m=i(81),y=i.n(m),S=(i(106),i(148)),b=i(327),x=i(319),w=i(140),M=i.n(w),C=i(141),j=i.n(C),P=i(142),T=i.n(P),O=i(143),I=i.n(O),G=i(144),E=i.n(G),D=i(145),H=i.n(D),z=i(146),L=i.n(z),F=i(317),U=i(326),B=i(3),N=i.n(B),W=i(147),A=i(313),X=i(325),Y=function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(){var e;Object(a.a)(this,i);for(var r=arguments.length,s=new Array(r),o=0;o<r;o++)s[o]=arguments[o];return(e=t.call.apply(t,[this].concat(s))).state={displayColorPicker:!1,color:{r:"212",g:"170",b:"170",a:"1"}},e.handleClick=function(){e.setState({displayColorPicker:!e.state.displayColorPicker})},e.handleClose=function(){e.setState({displayColorPicker:!1})},e.handleChange=function(t){e.setState({color:t.rgb}),e.props.handleColorChange(t)},e}return Object(c.a)(i,[{key:"render",value:function(){var e=N()({default:{main:{float:"left",padding:"10px"},color:{width:"36px",height:"14px",borderRadius:"2px",background:"rgba(".concat(this.state.color.r,", ").concat(this.state.color.g,", ").concat(this.state.color.b,", ").concat(this.state.color.a,")")},swatch:{padding:"5px",background:"#fff",borderRadius:"1px",boxShadow:"0 0 0 1px rgba(0,0,0,.1)",display:"inline-block",cursor:"pointer"},popover:{position:"absolute",zIndex:"2"},cover:{position:"fixed",top:"0px",right:"0px",bottom:"0px",left:"0px"}}});return Object(r.jsxs)("div",{style:e.main,children:[Object(r.jsxs)(A.a,{children:[Object(r.jsxs)(X.a,{color:"secondary",children:["  ",Object(r.jsx)("div",{style:{fontSize:"12px"},children:"Color"})]}),Object(r.jsx)("div",{style:e.swatch,onClick:this.handleClick,children:Object(r.jsx)("div",{style:e.color})})]}),this.state.displayColorPicker?Object(r.jsxs)("div",{style:e.popover,children:[Object(r.jsx)("div",{style:e.cover,onClick:this.handleClose}),Object(r.jsx)(W.a,{color:this.state.color,onChange:this.handleChange})]}):null]})}}]),i}(o.a.Component),R=i(321),K=i(328),J=(i(274),function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(e){var r;return Object(a.a)(this,i),(r=t.call(this,e)).changeMode=function(e,t){r.setState({mode:t})},r.handleStrokeSizeChange=function(e){r.setState({strokeSize:e.target.value}),r.props.changeStrokeSize(e.target.value)},r.handleColorChange=function(e){r.setState({color:e.rgb}),r.props.changeColor(e)},r.state={mode:"draw",color:{r:"0",g:"0",b:"0",a:"1"},strokeSize:4},r}return Object(c.a)(i,[{key:"render",value:function(){var e=this;return Object(r.jsxs)("div",{id:"topbar",children:[Object(r.jsx)(Y,{handleColorChange:this.handleColorChange}),Object(r.jsxs)(U.a,{className:"float-btn",value:this.state.mode,exclusive:!0,onChange:this.changeMode,"aria-label":"sketch mode",children:[Object(r.jsx)(F.a,{onClick:function(){return e.props.drawMode()},value:"draw","aria-label":"draw mode",children:Object(r.jsx)(b.a,{title:"Draw mode",children:Object(r.jsx)(M.a,{})})}),Object(r.jsx)(F.a,{onClick:function(){return e.props.colorMode()},value:"color","aria-label":"color mode",children:Object(r.jsx)(b.a,{title:"Change Stroke Color",children:Object(r.jsx)(j.a,{})})}),Object(r.jsx)(F.a,{onClick:function(){return e.props.eraseMode()},value:"erase","aria-label":"erase mode",children:Object(r.jsx)(b.a,{title:"Delete Stroke",children:Object(r.jsx)(T.a,{})})}),Object(r.jsx)(F.a,{onClick:function(){return e.props.moveMode()},value:"move","aria-label":"move mode",children:Object(r.jsx)(b.a,{title:"Move Stroke",children:Object(r.jsx)(I.a,{style:{height:20}})})})]}),Object(r.jsx)(b.a,{title:"Undo",children:Object(r.jsx)(x.a,{onClick:function(){return e.props.undo()},color:"secondary","aria-label":"undo stroke",children:Object(r.jsx)(E.a,{})})}),Object(r.jsx)(b.a,{title:"Redo",children:Object(r.jsx)(x.a,{onClick:function(){return e.props.redo()},color:"secondary","aria-label":"redo stroke",children:Object(r.jsx)(H.a,{})})}),Object(r.jsx)(b.a,{title:"Clear Canvas",children:Object(r.jsx)(x.a,{onClick:function(){return e.props.clear()},color:"secondary","aria-label":"clear drawing",children:Object(r.jsx)(L.a,{})})}),Object(r.jsxs)(A.a,{children:[Object(r.jsx)(X.a,{color:"secondary",children:"Size"}),Object(r.jsx)(R.a,{color:"secondary",value:this.state.strokeSize,onChange:this.handleStrokeSizeChange,children:Object(S.a)(Array(60).keys()).map((function(e){return Object(r.jsx)(K.a,{value:e,children:e})}))})]})]})}}]),i}(s.Component)),V=i(62),Z=i(79),q=i.n(Z),Q=function(){function e(t,i,r,s,o,n,h,c,d,u,l,v,p,k){Object(a.a)(this,e),this.pathCoords=r,this.svgPath=null,this.color=t,this.width=i,this.opacity=1,this.draw=s,this.options={width:this.width,color:this.color,opacity:this.opacity,linecap:"round",linejoin:"round"},this.rendered=!0,this.erased=!1,this.idCreator=o,this.idStroke=n,this.status=h,this.idMovedFrom=c,this.movedFrom=null,this.created=d,this.timeStart=u,this.timeEnd=l,this.pencilTextureToggle=p,this.pencilTexture=k,this.drawn=!0,this.undone=v,this.svgPath=this.draw.polyline(this.pathCoords).fill("none").stroke(this.options),this.pencilTextureToggle&&this.svgPath.filter(this.pencilTexture)}return Object(c.a)(e,[{key:"serialize",value:function(){return{coords:q.a.cloneDeep(this.pathCoords),color:this.color,width:this.width,idCreator:this.idCreator,idStroke:this.idStroke,status:this.status,idMovedFrom:this.idMovedFrom,created:this.created,timeStart:this.timeStart,timeEnd:this.timeEnd,undone:this.undone}}},{key:"addPoint",value:function(e,t){this.pathCoords.push(e),this.pathCoords.push(t),this.svgPath.plot(this.pathCoords)}},{key:"moveBy",value:function(e,t){for(var i=0;i<this.pathCoords.length;i++)this.pathCoords[i]=i%2===0?this.pathCoords[i]+e:this.pathCoords[i]+t;this.svgPath.dmove(e,t)}},{key:"highlight",value:function(){this.svgPath.opacity(this.opacity)}},{key:"setColor",value:function(e){this.color=e,this.svgPath.stroke({color:e})}},{key:"remove",value:function(e){this.svgPath.remove(),this.rendered=!1,this.status=e,2===e&&(this.erased=!0)}},{key:"addToGroup",value:function(e){e.add(this.svgPath),this.rendered=!0,this.status=1}},{key:"pathCoordsAtIndex",value:function(e,t,i){return e[2*t+i]}},{key:"smoothCoords",value:function(e){var t="";t+="M "+this.pathCoordsAtIndex(e,0,0)+" "+this.pathCoordsAtIndex(e,0,1)+" ";for(var i,r,s,o,n=!0,h=!1,a=0;a<e.length/2-1;a++)n&&(i=this.pathCoordsAtIndex(e,a,0),r=this.pathCoordsAtIndex(e,a,1),n=!1,h=!0),h?(s=this.pathCoordsAtIndex(e,a,0),o=this.pathCoordsAtIndex(e,a,1),n=!1,h=!1):(t+="C "+i+" "+r+" "+s+" "+o+" "+this.pathCoordsAtIndex(e,a,0)+" "+this.pathCoordsAtIndex(e,a,1)+" ",n=!0,h=!1);return t}},{key:"addToGroupSmoothed",value:function(e){this.svgPath.remove();var t=this.draw.path(this.smoothCoords(this.pathCoords)).fill("none").stroke(this.options);this.pencilTextureToggle&&t.filter(this.pencilTexture),this.svgPath=t,e.add(t)}}],[{key:"deserialize",value:function(t,i,r){return new e(t.color,t.width,t.coords,i,t.idCreator,t.idStroke,t.status,t.idMovedFrom,t.created,t.timeStart,t.timeEnd,t.undone,t.pencilTextureToggle,r)}}]),e}(),$=function(){function e(t,i,r,s,o){Object(a.a)(this,e),this.type=i.type,this.drawn=!1,this.draw=t,this.stroke=i,this.rendered=!0,this.idCreator=r,this.idStroke=s,this.status=o,this.opacity=1,this.movedFrom=null}return Object(c.a)(e,[{key:"serialize",value:function(){return{msg:"placeholder text",type:this.type,status:this.status}}},{key:"getHTML",value:function(){return this.stroke.node.outerHTML}},{key:"copy",value:function(){var t=q.a.cloneDeep(this.stroke);return new e(this.draw,t,this.idCreator,this.idStroke,this.status)}},{key:"moveBy",value:function(e,t){this.stroke.dmove(e,t)}},{key:"highlight",value:function(){this.stroke.opacity(this.opacity)}},{key:"setColor",value:function(e){this.color=e,console.log(this.stroke.attr("stroke")),console.log(this.stroke.attr("fill")),"#000000"!==this.stroke.attr("stroke")&&"none"!==this.stroke.attr("stroke")&&this.stroke.stroke({color:e}),"#000000"!==this.stroke.attr("fill")&&"none"!==this.stroke.attr("fill")&&this.stroke.fill({color:e})}},{key:"remove",value:function(e){this.stroke.remove(),this.rendered=!1,this.status=e,2===e&&(this.erased=!0)}},{key:"addToGroup",value:function(e){e.add(this.stroke),this.rendered=!0,this.status=1}}]),e}(),_=function(){function e(t,i,r){Object(a.a)(this,e),this.clearedSketches=[[]],this.sketchGroup=t.group(),this.draw=t,this.currentPath=null,this.undoIndex=0,this.clearUndoIndex=0,this.svg=i,this.prevMouseLocation=null,this.currMouseLocation=null,this.beganHighlighting=!1,this.userID=null,this.currStrokeID=1,this.pencilTexture=r,this.originalWidth=this.getWidth(),this.originalHeight=this.getHeight(),this.updateDimensions(),this.animationfinished=!0}return Object(c.a)(e,[{key:"getPaths",value:function(){return this.clearedSketches[this.clearedSketches.length-this.clearUndoIndex-1]}},{key:"setPaths",value:function(e){this.clearedSketches[this.clearedSketches.length-this.clearUndoIndex-1]=e}},{key:"updatePaths",value:function(e,t){e.push(t),this.setPaths(e),this.clearedSketches=this.clearedSketches.slice(0,this.clearedSketches.length-this.clearUndoIndex),this.undoIndex=0,this.clearUndoIndex=0}},{key:"getWidth",value:function(){var e=document.getElementById("sketchpad");return null!==e?e.clientWidth:this.svg.clientWidth}},{key:"getHeight",value:function(){var e=document.getElementById("sketchpad");return null!==e?e.clientHeight:this.svg.clientHeight}},{key:"addZero",value:function(e,t){for(;e.toString().length<t;)e="0"+e;return e}},{key:"getTime",value:function(){var e=new Date;return this.addZero(e.getHours(),2)+":"+this.addZero(e.getMinutes(),2)+":"+this.addZero(e.getSeconds(),2)+":"+this.addZero(e.getMilliseconds(),3)}},{key:"serialize",value:function(){for(var e=[],t=this.getPaths(),i=0;i<t.length-this.undoIndex;i++)e.push(t[i].serialize());return e}},{key:"loadSketch",value:function(e){this.remove(),this.setPaths([]);var t,i=Object(V.a)(e);try{for(i.s();!(t=i.n()).done;){var r=t.value;if(0<r.status){var s=Q.deserialize(r,this.draw,this.pencilTexture);null!==s&&(s.hasprettyStroke=!1,1!==s.status&&(s.rendered=!1),this.getPaths().push(s))}}}catch(o){i.e(o)}finally{i.f()}}},{key:"displayLoadedSketch",value:function(e){var z = this;e=void 0===e||e,this.sketchGroup.remove(),this.sketchGroup=this.draw.group(),e||this.updateDimensions();var t,i=Object(V.a)(this.getPaths());try{for(i.s();!(t=i.n()).done;){t.value.addToGroupSmoothed(this.sketchGroup),1!==t.value.status&&t.value.remove(t.value.status),"move"===t.value.created&&(t.value.movedFrom=z.getPaths().find((function(z){return z.idStroke===t.value.idMovedFrom})))}}catch(c){i.e(c)}finally{i.f()}var r=this.getWidth(),s=this.getHeight();if(e){var o=this.sketchGroup.bbox(),n=s,h=document.getElementById("votebar");null!==h&&(n-=h.getClientRects()[0].height);var a=Math.min(r/o.width,n/o.height);this.sketchGroup.transform({x:r/2-o.cx,y:n/2-o.cy,relative:!0}),this.sketchGroup.transform({scaleX:.8*a,scaleY:.8*a})}}},{key:"displayText",value:function(e){var t;"peek"===e?(t=this.draw.text("User has only peeked so far.")).move(20,70):(t=this.draw.text("User has not sketched \nnor peeked so far.")).move(40,70),this.sketchGroup=t}},{key:"updateDimensions",value:function(){var e=this.getWidth()/this.originalWidth,t=this.getHeight()/this.originalHeight;this.updateOrigin();var i=Math.min(e,t);this.sketchGroup.transform({scale:i,cx:0,cy:0})}},{key:"updateOrigin",value:function(){this.sketchGroup.transform({scale:1}),this.sketchGroup.transform({x:this.getWidth()/2,y:this.getHeight()/2})}},{key:"undo",value:function(){if(this.undoIndex<this.getPaths().length){for(var e=0,z=this.getPaths().length-1;z>-1;z--)if(console.log(this.getPaths()[z]),!this.getPaths()[z].undone&&this.userId===this.getPaths()[z].idCreator){e=this.getPaths()[z];console.log("sucess");break}if(0===e)return!1;2===e.status&&!e.rendered&&e.erased?e.addToGroup(this.sketchGroup):e.rendered&&null!==e.movedFrom&&!e.movedFrom.rendered?(e.remove(3),e.movedFrom.addToGroup(this.sketchGroup)):e.remove(2),this.undoIndex+=1}else{if(!(this.clearUndoIndex<this.clearedSketches.length-1))return!1;this.undoIndex=0,this.clearUndoIndex+=1;var t,i=Object(V.a)(this.getPaths());try{for(i.s();!(t=i.n()).done;){var r=t.value;r.rendered&&r.addToGroup(this.sketchGroup)}}catch(s){i.e(s)}finally{i.f()}}return!0}},{key:"redo",value:function(){if(this.undoIndex>0){var e=this.getPaths()[this.getPaths().length-this.undoIndex];e.rendered&&e.erased?e.remove():!e.rendered&&null!==e.movedFrom&&e.movedFrom.rendered?(e.addToGroup(this.sketchGroup),e.movedFrom.remove(3)):e.addToGroup(this.sketchGroup),this.undoIndex-=1}else{if(!(this.clearUndoIndex>0))return!1;this.remove(),this.clearUndoIndex-=1,this.undoIndex=this.getPaths().length}return!0}},{key:"clear",value:function(){return 0!==this.getPaths().length&&(this.setPaths(this.getPaths().slice(0,this.getPaths().length-this.undoIndex)),this.clearedSketches=this.clearedSketches.slice(0,this.clearedSketches.length-this.clearUndoIndex),this.clearUndoIndex=0,this.undoIndex=0,this.remove(),this.clearedSketches.push([]),!0)}},{key:"remove",value:function(){this.sketchGroup.remove(),this.sketchGroup=this.draw.group(),this.updateDimensions()}},{key:"erase",value:function(e,t){var i=this.select(e,t);if("undefined"!==typeof i){var r=i[0],s=i[1];return s.remove(2),this.updatePaths(r,s),ecThis=s,!0}return!1}},{key:"color",value:function(e,t,i){var r=this.select(e,t);if("undefined"!==typeof r){var s=r[1];return s.setColor(i),ecThis=s,!0}return!1}},{key:"select",value:function(e,t){if(this.getPaths().length>0){var i=this.svg.getBoundingClientRect(),r=this.sketchGroup.transform(),s=(e-i.left-r.x)/r.scaleX,o=(t-i.top-r.y)/r.scaleY;if(this.prevMouseLocation=[s,o],this.currMouseLocation=[s,o],!Number.isNaN(s)&&!Number.isNaN(o)){for(var n=this.getPaths().slice(0,this.getPaths().length-this.undoIndex),h=[],a=0;a<n.length;a++)1===n[a].status?n[a].drawn?h.push(this.getClosestDistanceDrawnSVG(n[a].pathCoords,s,o)):h.push(this.getClosestDistanceImportedSVG(n[a].stroke.node.getBoundingClientRect(),e,t)):h.push(9999);var c=Math.min.apply(null,h);if(c<40)return[n,n[h.indexOf(c)]]}}}},{key:"getClosestDistanceDrawnSVG",value:function(e,t,i){for(var r=[],s=0;s<e.length;s+=2){var o=e[s]-t,n=e[s+1]-i;r.push(Math.sqrt(o*o+n*n))}return Math.min.apply(null,r)}},{key:"getClosestDistanceImportedSVG",value:function(e,t,i){for(var r=[],s=0;s<e.width;s++)for(var o=0;o<e.height;o++){var n=e.x+s-t,h=e.y+o-i;r.push(Math.sqrt(n*n+h*h))}return Math.min.apply(null,r)}},{key:"startMove",value:function(e){2!==Object.keys(e).length&&e.type.startsWith("touch")&&(e=e.changedTouches[0]);var t=this.select(e.clientX,e.clientY);if("undefined"!==typeof t){var i,r=t[0],s=t[1];if(s.drawn)(i=Q.deserialize(s.serialize(),this.draw,this.pencilTexture)).addToGroupSmoothed(this.sketchGroup);else{var o=this.draw.svg(s.getHTML());(i=new $(this.draw,o.children()[3],this.userID,this.currStrokeID,1)).addToGroup(this.sketchGroup)}return i.timeStart=e.clientX,i.timeEnd=e.clientY,i.idStroke=this.currStrokeID,i.pencilTextureToggle=s.pencilTextureToggle,i.created=2,i.idMovedFrom=s.idStroke,i.movedFrom=s,s.remove(3),this.currStrokeID+=1,i.opacity=.1,i.highlight(),this.updatePaths(r,i),this.currentPath=i,!0}return!1}},{key:"endMove",value:function(){this.currentPath.opacity=1,this.currentPath.highlight(),this.currentPath.timeEnd=this.getTime();var e=this.prevMouseLocation.concat(this.currMouseLocation);return this.currMouseLocation=null,e}},{key:"hide",value:function(){this.sketchGroup.hide()}},{key:"show",value:function(){this.sketchGroup.show()}},{key:"continueLineWithEvent",value:function(e,t,i,r){var s,o,n=this.svg.getBoundingClientRect(),h=this.sketchGroup.transform();null===e?(s=(i-n.left-h.x)/h.scaleX,o=(r-n.top-h.y)/h.scaleY):(e.type.startsWith("touch")&&(e=e.changedTouches[0]),s=(e.clientX-n.left-h.x)/h.scaleX,o=(e.clientY-n.top-h.y)/h.scaleY),"draw"===t?(this.currentPath.addPoint(s,o),sketchEdit("point")):"move"===t&&null!==this.currMouseLocation&&(this.currentPath.moveBy(s-this.currMouseLocation[0],o-this.currMouseLocation[1]),this.currMouseLocation=[s,o])}},{key:"startPath",value:function(e,t,i){this.currentPath=new Q(e,t,[],this.draw,this.userID,this.currStrokeID,1,0,1,"","",!1,i,this.pencilTexture),this.currStrokeID+=1,this.currentPath.addToGroup(this.sketchGroup),this.currentPath.timeStart=this.getTime()}},{key:"finishPath",value:function(){this.currentPath.timeEnd=this.getTime();var e=this.getPaths().slice(0,this.getPaths().length-this.undoIndex);this.updatePaths(e,this.currentPath),this.currentPath.addToGroupSmoothed(this.sketchGroup)}},{key:"addPathFromCode",value:function(e){var t=Q.deserialize(e,this.draw,this.pencilTexture),i=this.getPaths().slice(0,this.getPaths().length-this.undoIndex),r=this.currentPath;t.idStroke=this.currStrokeID,t.pencilTextureToggle=r.pencilTextureToggle,t.created=2,this.currStrokeID+=1,t.idMovedFrom=r.idStroke,t.movedFrom=r,t.hasprettyStroke=!1,r.remove(3),t.addToGroupSmoothed(this.sketchGroup),t.timeStart=this.getTime(),this.updatePaths(i,t),this.currentPath=t}},{key:"highlightPeekedStroke",value:function(e){var t=this.select(e.clientX,e.clientY);"undefined"!==typeof t&&(t[1].highlight(),this.beganHighlighting=!0)}},{key:"getHighlightedPeekedStrokes",value:function(){var e,t=[],i=Object(V.a)(this.getPaths());try{for(i.s();!(e=i.n()).done;){var r=e.value;r.peekHighlighted&&t.push(r)}}catch(s){i.e(s)}finally{i.f()}return t}},{key:"animateNewPeekedStroke",value:function(e){var t=this;if("sketch"===e){var i=this.getPaths(),r=i[i.length-1];if(1===r.created&&1===r.status){this.animationfinished||(this.currentPath.remove(2),r.addToGroup(this.sketchGroup),this.animationfinished=!0,clearInterval(this.intvl)),this.animationfinished=!1,r.remove(2);var s=(this.convertToMillisec(r.timeEnd)-this.convertToMillisec(r.timeStart))/(r.pathCoords.length/2),o=0;this.startPath(r.color,r.width,r.pencilTextureToggle,this.pencilTexture),this.intvl=setInterval((function(){o>=r.pathCoords.length?(t.currentPath.addToGroupSmoothed(t.sketchGroup),t.currentPath.remove(2),r.addToGroup(t.sketchGroup),t.animationfinished=!0,clearInterval(t.intvl)):(t.currentPath.addPoint(r.pathCoords[o],r.pathCoords[o+1]),o+=2)}),s)}}}},{key:"convertToMillisec",value:function(e){var t=e.split(":");return parseInt(36e5*t[0])+parseInt(6e4*t[1])+parseInt(1e3*t[2])+parseInt(t[3])}},{key:"addImportedStroke",value:function(e){this.currentPath=new $(this.draw,e,this.userID,this.currStrokeID,1),this.currStrokeID+=1,this.currentPath.timeEnd=this.getTime();var t=this.getPaths().slice(0,this.getPaths().length-this.undoIndex);this.updatePaths(t,this.currentPath),this.currentPath.addToGroup(this.sketchGroup)}}]),e}(),ee=i.p+"static/media/paper.64f19b60.png",te=i.p+"static/media/pencil1loop.e5fcd29b.mp3",ie=i.p+"static/media/pencil2loop.1d70b1af.mp3",re=i.p+"static/media/pencil3loop.f85ab838.mp3",se=(i(276),function(e){Object(d.a)(i,e);var t=Object(u.a)(i);function i(e){var r;return Object(a.a)(this,i),(r=t.call(this,e)).testicles=o.a.createRef(),r.state={sketchMode:"draw",currSoundCount:0,currStroke:r.props.currStroke,currColor:"#D4AAAA",currStrokeSize:4,snackbarOpen:!1},r.drawing=!1,r.sketchSounds=[new v.Howl({src:[te],loop:!0}),new v.Howl({src:[ie],loop:!0}),new v.Howl({src:[re],loop:!0})],r.setBindings(),r}return Object(c.a)(i,[{key:"setBindings",value:function(){this.verifyJSON=this.verifyJSON.bind(this),this.drawMode=this.drawMode.bind(this),this.colorMode=this.colorMode.bind(this),this.eraseMode=this.eraseMode.bind(this),this.moveMode=this.moveMode.bind(this),this.clear=this.clear.bind(this),this.undo=this.undo.bind(this),this.redo=this.redo.bind(this),this.changeColor=this.changeColor.bind(this),this.changeStrokeSize=this.changeStrokeSize.bind(this)}},{key:"componentDidMount",value:function(){var e=this,t=document.getElementById("sketchpage").clientWidth,i=document.getElementById("sketchpage").clientHeight;l.isMobile?(this.draw=y()("svg").size(t,i),this.background=this.draw.image(ee,t,i)):(this.draw=y()("svg").size("100%","100%"),this.background=this.draw.image(ee,t,i)),this.background.scale(5).hide();var r=document.getElementById("svg").getElementsByTagName("svg")[0];this.pencilTexture=new y.a.Filter,this.pencilTexture.turbulence(1.5,1,0,"noStitch","fractalNoise").result("f1"),this.pencilTexture.colorMatrix("matrix","0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1.5 2.8").result("f2"),this.pencilTexture.composite("SourceGraphic","f2","in").result("f3"),this.pencilTexture.turbulence(1.8,3,0,"noStitch","fractalNoise").result("noise"),this.pencilTexture.displacementMap("f3","",2.5,"R","G").result("f4"),this.primarySketch=new _(this.draw,r,this.pencilTexture),ServerSketch=new _(this.draw,r,this.pencilTexture),ServerSketch=ServerSketch.serialize(),primSket=this.primarySketch,window.addEventListener("resize",(function(){e.primarySketch.updateDimensions()})),window.addEventListener("keyup",(function(t){return e.handleKeyUp(t)})),window.addEventListener("keydown",(function(t){return e.handleKeyDown(t)})),r.addEventListener("touchmove",(function(e){e.preventDefault()}))}},{key:"handleMouseDown",value:function(e){if(currentlyEditing=!0,this.prevX=e.clientX,this.prevY=e.clientY,"erase"===this.state.sketchMode)this.primarySketch.erase(e.clientX,e.clientY),sketchEdit("erase",e.clientX,e.clientY);else if("move"===this.state.sketchMode)!this.moving&&this.primarySketch.startMove(e)&&(this.moving=!0,document.body.style.cursor="grabbing",this.primarySketch.continueLineWithEvent(e,"move"));else if("draw"===this.state.sketchMode){var t=Math.floor(Math.random()*Math.floor(3));this.sketchSounds[t].play(),this.setState({currSoundCount:t}),this.drawing=!0,this.primarySketch.startPath(this.state.currColor,this.state.currStrokeSize,this.state.paperTextureSwitch),this.primarySketch.continueLineWithEvent(e,"draw")}else"color"===this.state.sketchMode&&(this.primarySketch.color(e.clientX,e.clientY,this.state.currColor),sketchEdit("color",e.clientX,e.clientY,this.state.currColor))}},{key:"handleMove",value:function(e){this.drawing?(this.changeStrokeVolume(e),this.primarySketch.continueLineWithEvent(e,"draw")):this.moving?this.primarySketch.continueLineWithEvent(e,"move"):"draw"!==this.state.sketchMode&&this.hoverStroke(e),e.persist(),this.prevMouseEvent=e}},{key:"handleMouseUp",value:function(e,t){if(currentlyEditing=!1,"mouseup"===e.type)if("move"===this.state.sketchMode&&this.moving&&!this.drawing)this.moving=!1,document.body.style.cursor="grab",sketchEdit("move");else if("draw"===this.state.sketchMode){for(var i=0;i<3;i++)this.handleMove(e);this.drawing&&(this.sketchSounds[this.state.currSoundCount].stop(),this.drawing=!1,this.primarySketch.finishPath(),sketchEdit("draw"))}}},{key:"handleKeyUp",value:function(e){}},{key:"handleKeyDown",value:function(e){90===e.keyCode&&(e.ctrlKey||e.metaKey)&&e.shiftKey?(this.primarySketch.redo(),sketchEdit("redo")):90===e.keyCode&&(e.ctrlKey||e.metaKey)&&(this.primarySketch.undo(),sketchEdit("undo"))}},{key:"hoverStroke",value:function(e){var t=this.primarySketch.select(e.clientX,e.clientY);"undefined"!==typeof t?("undefined"!==typeof this.currHoveredStroke&&this.currHoveredStroke.idStroke!==t[1].idStroke&&(this.currHoveredStroke.opacity=1,this.currHoveredStroke.highlight()),this.currHoveredStroke=t[1],this.currHoveredStroke.opacity=.1,this.currHoveredStroke.highlight()):"undefined"!==typeof this.currHoveredStroke&&(this.currHoveredStroke.opacity=1,this.currHoveredStroke.highlight())}},{key:"mode",value:function(){"draw"===this.state.sketchMode?this.eraseMode():"erase"===this.state.sketchMode?this.moveMode():"move"===this.state.sketchMode&&this.drawMode()}},{key:"drawMode",value:function(){this.setState({sketchMode:"draw"}),document.body.style.cursor="auto","undefined"!==typeof this.currHoveredStroke&&(this.currHoveredStroke.opacity=1,this.currHoveredStroke.highlight())}},{key:"colorMode",value:function(){this.setState({sketchMode:"color"}),document.body.style.cursor="cell"}},{key:"eraseMode",value:function(){this.setState({sketchMode:"erase"}),document.body.style.cursor="no-drop"}},{key:"moveMode",value:function(){this.setState({sketchMode:"move"}),document.body.style.cursor="grab"}},{key:"clear",value:function(){this.primarySketch.clear()&&(this.primarySketch.updateDimensions(),sketchEdit("clear"))}},{key:"undo",value:function(){this.primarySketch.undo(),sketchEdit("undo")}},{key:"redo",value:function(){this.primarySketch.redo(),sketchEdit("redo")}},{key:"changeColor",value:function(e){this.setState({currColor:e.hex})}},{key:"changeStrokeSize",value:function(e){this.setState({currStrokeSize:e})}},{key:"download",value:function(){this.setState({paperTextureSwitch:!1}),this.background.hide();var e=document.getElementById("svg").getElementsByTagName("svg")[0],t=(new XMLSerializer).serializeToString(e),i=new Blob([t],{type:"image/svg+xml"});f.a.saveAs(i,"img.svg")}},{key:"import",value:function(e){var t=this.primarySketch,i=e.files[0];i.name.endsWith("svg")?new Promise((function(e){var t=new FileReader;t.onload=function(){e(t.result)},t.readAsText(i)})).then((function(e){var i=t.draw.svg(e).children()[3];i.each((function(e,i){"rect"===this.type&&"none"===this.node.attributes.fill.value?this.remove():t.addImportedStroke(this)})),i.node.parentNode.removeChild(i.node)})):this.setState({snackbarOpen:!0})}},{key:"changeStrokeVolume",value:function(e){var t="touchmove"===e.type?e.touches[0].clientX:e.clientX,i="touchmove"===e.type?e.touches[0].clientY:e.clientY;clearTimeout(this.timeout),this.timeout=setTimeout((function(){v.Howler.mute(!0)}),50);var r=Math.sqrt(Math.pow(this.prevX-t,2)+Math.pow(this.prevY-i,2));this.prevX=t,this.prevY=i;var s=Math.round(10*Math.min(1,r/10))/10;s<.1&&(s=0),s=s<.3?.2:s<.7?.5:.8,v.Howler.mute(!1),this.sketchSounds[this.state.currSoundCount].fade(this.sketchSounds[this.state.currSoundCount].volume(),s,100)}},{key:"verifyJSON",value:function(){try{var e=JSON.parse(this.props.currStrokeCode);this.primarySketch.addPathFromCode(e)}catch(t){this.setState({snackbarOpen:!0})}}},{key:"render",value:function(){var e=this;return Object(r.jsxs)("div",{id:"sketchpage",style:{height:"100%"},children:[Object(r.jsx)(J,{verifyJSON:this.verifyJSON,drawMode:this.drawMode,colorMode:this.colorMode,eraseMode:this.eraseMode,moveMode:this.moveMode,undo:this.undo,redo:this.redo,clear:this.clear,changeColor:this.changeColor,changeStrokeSize:this.changeStrokeSize}),Object(r.jsx)("div",{id:"svg",style:{height:"100%"},onMouseDown:function(t){return e.handleMouseDown(t)},onMouseMove:function(t){return e.handleMove(t)},onMouseLeave:function(t){return e.handleMouseUp(t,"mouse")},onMouseUp:function(t){return e.handleMouseUp(t,"mouse")},onTouchCancel:function(t){return e.handleMouseUp(t,"mobile")},onTouchEnd:function(t){return e.handleMouseUp(t,"mobile")},onTouchMove:function(t){return e.handleMove(t)},onTouchStart:function(t){return e.handleMouseDown(t)}}),Object(r.jsx)(p.a,{open:this.state.snackbarOpen,autoHideDuration:2e3,onClose:function(){return e.setState({snackbarOpen:!1})},children:Object(r.jsx)(k.a,{severity:"error",elevation:6,variant:"filled",children:"SVG code invalid!"})})]})}}]),i}(s.Component)),oe=function(e){e&&e instanceof Function&&i.e(3).then(i.bind(null,329)).then((function(t){var i=t.getCLS,r=t.getFID,s=t.getFCP,o=t.getLCP,n=t.getTTFB;i(e),r(e),s(e),o(e),n(e)}))};h.a.render(Object(r.jsx)(se,{}),document.getElementById("root")),oe()}},[[277,1,2]]]);
//# sourceMappingURL=main.38182fbc.chunk.js.map