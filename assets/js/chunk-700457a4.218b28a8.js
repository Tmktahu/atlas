(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-700457a4"],{"03c1":function(e,t,n){"use strict";n("c576")},"269a":function(e,t){e.exports=function(e,t){var n="function"===typeof e.exports?e.exports.extendOptions:e.options;for(var a in"function"===typeof e.exports&&(n.directives=e.exports.options.directives),n.directives=n.directives||{},t)n.directives[a]=n.directives[a]||t[a]}},3191:function(e,t,n){(function(t,n){e.exports=n()})(0,(function(){var e=function(){function t(e){return i.appendChild(e.dom),e}function n(e){for(var t=0;t<i.children.length;t++)i.children[t].style.display=t===e?"block":"none";a=e}var a=0,i=document.createElement("div");i.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",i.addEventListener("click",(function(e){e.preventDefault(),n(++a%i.children.length)}),!1);var o=(performance||Date).now(),s=o,r=0,c=t(new e.Panel("FPS","#0ff","#002")),l=t(new e.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var d=t(new e.Panel("MB","#f08","#201"));return n(0),{REVISION:16,dom:i,addPanel:t,showPanel:n,begin:function(){o=(performance||Date).now()},end:function(){r++;var e=(performance||Date).now();if(l.update(e-o,200),e>s+1e3&&(c.update(1e3*r/(e-s),100),s=e,r=0,d)){var t=performance.memory;d.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576)}return e},update:function(){o=this.end()},domElement:i,setMode:n}};return e.Panel=function(e,t,n){var a=1/0,i=0,o=Math.round,s=o(window.devicePixelRatio||1),r=80*s,c=48*s,l=3*s,d=2*s,p=3*s,f=15*s,u=74*s,m=30*s,v=document.createElement("canvas");v.width=r,v.height=c,v.style.cssText="width:80px;height:48px";var h=v.getContext("2d");return h.font="bold "+9*s+"px Helvetica,Arial,sans-serif",h.textBaseline="top",h.fillStyle=n,h.fillRect(0,0,r,c),h.fillStyle=t,h.fillText(e,l,d),h.fillRect(p,f,u,m),h.fillStyle=n,h.globalAlpha=.9,h.fillRect(p,f,u,m),{dom:v,update:function(c,w){a=Math.min(a,c),i=Math.max(i,c),h.fillStyle=n,h.globalAlpha=1,h.fillRect(0,0,r,f),h.fillStyle=t,h.fillText(o(c)+" "+e+" ("+o(a)+"-"+o(i)+")",l,d),h.drawImage(v,p+s,f,u-s,m,p,f,u-s,m),h.fillRect(p+u-s,f,s,m),h.fillStyle=n,h.globalAlpha=.9,h.fillRect(p+u-s,f,s,o((1-c/w)*m))}}},e}))},"3d2e":function(e,t,n){},"4bdf":function(e,t,n){"use strict";n.r(t);var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("div",{directives:[{name:"resize",rawName:"v-resize",value:e.onResize,expression:"onResize"}],ref:"mapContainer",staticClass:"mapContainer",on:{keypress:e.onWDown}}),n("v-slider",{staticClass:"pan-speed-slider pb-1",attrs:{"hide-details":"",min:e.MIN_PAN_SPEED,max:e.MAX_PAN_SPEED,"thumb-label":"always",label:"Pan Speed:"},model:{value:e.masterMapData.panSpeed,callback:function(t){e.$set(e.masterMapData,"panSpeed",t)},expression:"masterMapData.panSpeed"}}),n("div",{ref:"pointInfoContainer",staticClass:"point-info"},[n("div",{ref:"pointName",staticClass:"name"},[e._v("Point Name")]),n("div",{ref:"pointCoord",staticClass:"coord"},[e._v("[Coordinate]")])]),n("div",{staticClass:"hardware-accel-info"},[e._v(" You must have Hardware Acceleration enabled in your browser, or else this website will max out your CPU trying to render. ")]),e.showControls?n("div",{staticClass:"controls-info",class:{out:e.leftNavCondensed}},[e._m(0),e._m(1),e._m(2),e._m(3),e._m(4),e._m(5),e._m(6),e._m(7)]):e._e()],1)},i=[function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("W: "),n("span",[e._v("Pan Forward")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("S: "),n("span",[e._v("Pan Backward")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("A: "),n("span",[e._v("Pan Left")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("D: "),n("span",[e._v("Pan Right")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("Space: "),n("span",[e._v("Pan Up")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("Left-Shift: "),n("span",[e._v("Pan Down")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("Left-Click: "),n("span",[e._v("Rotate Camera")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e._v("Right-Click: "),n("span",[e._v("Pan Camera")])])}],o=(n("b0c0"),n("99af"),n("3191")),s=n.n(o),r=n("a6f4"),c=n("e312"),l=n("8f2b"),d={metaInfo:function(){return{title:"Interactive Map",description:"The Atlas Interactive Map",meta:[{name:"description",content:"Atlas Interactive Map"}]}},name:"InteractiveMap",setup:function(){var e=Object(r["d"])("masterMapData"),t=Object(r["d"])("showControls"),n=Object(r["d"])("leftNavCondensed"),a=null,i=Object(c["f"])(e),o=i.init,s=i.resizeMap,d=i.panForward,p=i.panBackward,f=Object(l["a"])(),u=f.dataStoragePath,m=Object(r["i"])(e).intersects,v=Object(r["d"])("showManageDialog"),h=Object(r["d"])("showSaveDialog"),w=Object(r["d"])("showImportDialog");return{stats:a,initMap:o,resizeMap:s,panForward:d,panBackward:p,masterMapData:e,showControls:t,leftNavCondensed:n,MIN_PAN_SPEED:c["c"],MAX_PAN_SPEED:c["b"],intersects:m,dataStoragePath:u,showManageDialog:v,showSaveDialog:h,showImportDialog:w}},watch:{intersects:function(){var e;"Points"===(null===(e=this.masterMapData.intersects[0])||void 0===e?void 0:e.object.type)?(this.$refs.pointName.innerHTML=this.masterMapData.intersects[0].object.name,this.$refs.pointCoord.innerHTML="[".concat(this.masterMapData.intersects[0].object.geometry.attributes.position.array[0],", ").concat(-this.masterMapData.intersects[0].object.geometry.attributes.position.array[2],", ").concat(this.masterMapData.intersects[0].object.geometry.attributes.position.array[1],"]"),this.$refs.pointInfoContainer.style.display="block"):this.$refs.pointInfoContainer.style.display="none"}},mounted:function(){var e=this;this.$nextTick((function(){window.addEventListener("keydown",(function(t){87===t.keyCode&&e.onWDown(),83===t.keyCode&&e.onSDown()})),window.addEventListener("mousemove",(function(t){e.$refs.pointInfoContainer&&(e.$refs.pointInfoContainer.style.left="".concat(t.pageX-30,"px"),e.$refs.pointInfoContainer.style.top="".concat(t.pageY-10,"px")),e.masterMapData.mapMouse.x=(t.clientX-56)/(window.innerWidth-56)*2-1,e.masterMapData.mapMouse.y=-t.clientY/window.innerHeight*2+1})),window.addEventListener("wheel",(function(t){e.showSaveDialog||e.showManageDialog||e.showImportDialog||(t.deltaY>0?e.onSDown():e.onWDown())})),e.createStats(),e.initMap(e.$refs.mapContainer)}))},methods:{createStats:function(){this.stats=new s.a,this.stats.showPanel(0),this.stats.domElement.classList="fps-tracker",this.$refs.mapContainer.appendChild(this.stats.dom),this.masterMapData.stats=this.stats},onResize:function(){this.resizeMap(this.masterMapData)},onWDown:function(){this.panForward()},onSDown:function(){this.panBackward()}}},p=d,f=(n("03c1"),n("85e2"),n("2877")),u=n("6544"),m=n.n(u),v=n("ba0d"),h=n("269a"),w=n.n(h),_=n("dc22"),b=Object(f["a"])(p,a,i,!1,null,"0a977fa8",null);t["default"]=b.exports;m()(b,{VSlider:v["a"]}),w()(b,{Resize:_["a"]})},"85e2":function(e,t,n){"use strict";n("3d2e")},c576:function(e,t,n){}}]);
//# sourceMappingURL=chunk-700457a4.218b28a8.js.map