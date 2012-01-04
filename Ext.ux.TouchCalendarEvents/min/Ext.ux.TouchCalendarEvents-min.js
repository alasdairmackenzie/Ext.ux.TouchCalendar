/*
 * Ext.ux.TouchCalendarEvents
 */
Ext.ux.TouchCalendarEvents=Ext.extend(Ext.util.Observable,{startEventField:"start",endEventField:"end",colourField:"colour",eventBarCls:"event-bar",eventWrapperCls:"event-wrapper",eventBarSelectedCls:"event-bar-selected",cellHoverCls:"date-cell-hover",autoUpdateEvent:true,allowEventDragAndDrop:true,eventBarSpacing:1,eventBarTpl:new Ext.XTemplate("{title}"),init:function(a){this.calendar=a;this.calendar.eventsPlugin=this;this.calendar.addEvents("eventtap","eventdragstart","beforeeventdrop","eventdrop","eventdrag");this.calendar.refresh=Ext.createSequence(this.calendar.refresh,this.refreshEvents,this);this.calendar.afterComponentLayout=Ext.createSequence(this.calendar.afterComponentLayout,this.refreshEvents,this)},refreshEvents:function(){this.removeEvents();this.generateEventBars();this.createEventWrapper();this.renderEventBars(this.eventBarStore);if(this.allowEventDragAndDrop){this.createDroppableRegion()}},createDroppableRegion:function(){var b=this;var a=0;this.droppable=new Ext.util.Droppable(this.calendar.getEl(),{onDrag:function(c,h){if(c.el.hasCls(b.eventBarCls)){this.setCanDrop(this.isDragOver(c),c,h);a++;if(a%15===0){var g,f,d=b.getEventRecord(c.el.getAttribute("eventID"));b.calendar.all.removeCls(b.cellHoverCls);b.calendar.all.each(function(e,i){var j=e.getPageBox(true);var k=c.el.getPageBox(true);if(j.partial(k)){g=e;f=this.calendar.getCellDate(e);e.addCls(b.cellHoverCls);return}},b);b.calendar.fireEvent("eventdrag",c,d,f,g,h);a=0}}}});this.droppable.on({drop:this.onEventDrop,dropdeactivate:this.onEventDropDeactivate,scope:this})},onEventDropDeactivate:function(f,a,d,c){if(a.el.hasCls(this.eventBarCls)){var b=this.getEventRecord(a.el.getAttribute("eventID"));this.calendar.getEl().select("div."+b.internalId).each(function(e){e.show()},this)}},onEventDrop:function(f,a,d,c){var b=false;if(a.el.hasCls(this.eventBarCls)){this.calendar.all.each(function(e){var j=e.getPageBox(true);var k=a.el.getPageBox(true);if(j.partial(k)&&this.calendar.fireEvent("beforeeventdrop",a,f,g,d)){b=true;var g=this.getEventRecord(a.el.getAttribute("eventID")),h=this.calendar.getCellDate(e),i=this.getDaysDifference(g.get(this.startEventField),h);if(this.autoUpdateEvent){g.set(this.startEventField,h);g.set(this.endEventField,g.get(this.endEventField).add(Date.DAY,i))}this.refreshEvents();this.calendar.fireEvent("eventdrop",a,f,g,d);return}},this);this.calendar.all.removeCls(this.cellHoverCls);if(!b){a.setOffset(a.startOffset,true)}}},generateEventBars:function(){this.eventBarStore=new Ext.data.Store({model:"Ext.ux.CalendarEventBarModel",data:[]});var c=this.calendar.store;var a=this.calendar.eventStore;var b;c.each(function(e){var d=e.get("date"),f=d.clearTime(true).getTime(),g=[];a.filterBy(function(i){var h=i.get(this.startEventField).clearTime(true).getTime(),j=i.get(this.endEventField).clearTime(true).getTime();return(h<=f)&&(j>=f)},this);a.sort(this.startEventField,"ASC");a.each(function(i){var k=this.eventBarStore.findBy(function(l,m){return l.get("EventID")===i.internalId},this);if(k>-1){b=this.eventBarStore.getAt(k);while(b.linked().getCount()>0){b=b.linked().getAt(b.linked().getCount()-1)}if(d.getDay()===this.calendar.weekStart){g.push(b.get("BarPosition"));var h=Ext.ModelMgr.create({EventID:i.internalId,Date:d,BarLength:1,BarPosition:b.get("BarPosition"),Colour:b.get("Colour"),Record:i},"Ext.ux.CalendarEventBarModel");b.linked().add(h)}else{g.push(b.get("BarPosition"));b.set("BarLength",b.get("BarLength")+1)}}else{var j=this.getNextFreePosition(g);g.push(j);b=Ext.ModelMgr.create({EventID:i.internalId,Date:d,BarLength:1,BarPosition:j,Colour:this.getRandomColour(),Record:i},"Ext.ux.CalendarEventBarModel");this.eventBarStore.add(b)}},this);a.clearFilter()},this)},renderEventBars:function(a){var b=this;a.each(function(h){var n=this.getEventRecord(h.get("EventID")),k=this.calendar.getDateCell(h.get("Date")),o=this.eventBarDoesWrap(h),g=this.eventBarHasWrapped(h);var p=Ext.DomHelper.append(this.eventWrapperEl,{tag:"div",style:{"background-color":n.get(this.colourField)},html:this.eventBarTpl.apply(n.data),eventID:h.get("EventID"),cls:this.eventBarCls+" "+h.get("EventID")+(o?" wrap-end":"")+(g?" wrap-start":"")},true);if(this.allowEventDragAndDrop){new Ext.util.Draggable(p,{revert:true,onStart:function(u){var q=this,t=q.el.getAttribute("eventID"),r=b.getEventRecord(t),s=b.getEventBarRecord(t);q.el.setWidth(q.el.getWidth()/s.get("BarLength"));q.el.setLeft(u.startX-(q.el.getWidth()/2));b.calendar.getEl().select("div."+r.internalId).each(function(v){if(v.dom!==q.el.dom){v.hide()}},this);Ext.util.Draggable.prototype.onStart.apply(this,arguments);b.calendar.fireEvent("eventdragstart",q,r,u);return true}})}var m=h.get("BarPosition"),d=h.get("BarLength"),j=k.getX(),i=k.getY(),c=k.getHeight(),f=k.getWidth(),e=p.getHeight(),l=this.eventBarSpacing;p.setLeft(j+(g?0:l));p.setTop((((i-this.calendar.getEl().getY())+c)-e)-((m*e+(m*l)+l)));p.setWidth((f*d)-(l*(o?(o&&g?0:1):2)));if(h.linked().getCount()>0){this.renderEventBars(h.linked())}},this)},onEventDragStart:function(a,f){var d=a.el.getAttribute("eventID"),b=this.getEventRecord(d),c=this.getEventBarRecord(d);a.el.setWidth(a.el.getWidth()/c.get("BarLength"));a.updateBoundary(true);this.calendar.getEl().select("div."+b.internalId).each(function(e){if(e.dom!==a.el.dom){e.hide()}},this);this.calendar.fireEvent("eventdragstart",a,b,f)},eventBarDoesWrap:function(a){var b=a.get("Date").add(Date.DAY,(a.get("BarLength")-1));return b.clearTime(true).getTime()!==a.get("Record").get(this.endEventField).clearTime(true).getTime()},eventBarHasWrapped:function(a){return a.get("Date").clearTime(true).getTime()!==a.get("Record").get(this.startEventField).clearTime(true).getTime()},createEventWrapper:function(){if(this.calendar.rendered&&!this.eventWrapperEl){this.eventWrapperEl=Ext.DomHelper.append(this.getEventsWrapperContainer(),{tag:"div",cls:this.eventWrapperCls},true);this.calendar.mon(this.eventWrapperEl,"click",this.onEventWrapperTap,this,{delegate:"div."+this.eventBarCls})}},onEventWrapperTap:function(d,c){d.stopPropagation();var b=c.attributes.eventID;if(b){var a=this.getEventRecord(c.attributes.eventID.value);this.deselectEvents();this.eventWrapperEl.select("div."+a.internalId).addCls(this.eventBarSelectedCls);this.calendar.fireEvent("eventtap",a,d)}},getEventsWrapperContainer:function(){return this.calendar.getEl().select("thead th").first()||this.calendar.getEl().select("tr td").first()},getNextFreePosition:function(a){var b=0;while(a.indexOf(b)>-1){b++}return b},getEventRecord:function(a){var b=this.calendar.eventStore.findBy(function(c){return c.internalId===a},this);return this.calendar.eventStore.getAt(b)},getEventBarRecord:function(a){var b=this.eventBarStore.findBy(function(c){return c.get("EventID")===a},this);return this.eventBarStore.getAt(b)},deselectEvents:function(){this.calendar.getEl().select("."+this.eventBarSelectedCls).removeCls(this.eventBarSelectedCls)},getDaysDifference:function(b,a){b=b.clearTime(true).getTime();a=a.clearTime(true).getTime();return(a-b)/1000/60/60/24},removeEvents:function(){if(this.eventWrapperEl){this.eventWrapperEl.dom.innerHTML="";this.eventWrapperEl.remove();this.eventWrapperEl=null}if(this.eventBarStore){this.eventBarStore.remove(this.eventBarStore.getRange());this.eventBarStore=null}if(this.droppable){this.droppable=null}},getRandomColour:function(){return"#"+(Math.random()*16777215<<0).toString(16)}});Ext.regModel("Ext.ux.CalendarEventBarModel",{fields:[{name:"EventID",type:"string"},{name:"Date",type:"date"},{name:"BarLength",type:"int"},{name:"BarPosition",type:"int"},{name:"Colour",type:"string"},"Record"],hasMany:[{model:"Ext.ux.CalendarEventBarModel",name:"linked"}]});Ext.override(Ext.util.Region,{partial:function(g){var f=this,e=g.right-g.left,c=g.bottom-g.top,b=f.right-f.left,a=f.bottom-f.top,d=g.top>f.top&&g.top<f.bottom;horizontalValid=g.left>f.left&&g.left<f.right;return horizontalValid&&d}});