	
(function($){
	// 获取浏览器前缀
	// 判断某个元素的CSS样式 中是否存在transition 属性
	//参数：DOM元素
	//返回值： boolean， 有则返回浏览器样式 前缀，没则返回false
	var _prefix = (function(temp){
		var aPrefix = ["webkit","Moz","o","ms"],
			props = "";
		for(var i in aPrefix){
			props = aPrefix[i] + "Transition";
			if(temp.style[ props] !== undefined ){
				return "-" + aPrefix[i].toLowerCase() + "-";
			}
		}
		return false;
	})(document.createElement(PageSwitch));
	//alert(_prefix);
	var PageSwitch = (function(){
		function PageSwitch(element,opt){
			this.settings = $.extend(true, $.fn.PageSwitch.defaults,opt||{});
			this.element = element;
			this.tops = [];
			this.lefts = [];
			this.init();
		};

		PageSwitch.prototype = {
			/* 初始化插件*/
			/* 实现： 初始化 dom 结构， 布局， 分布及绑定事件 */
			init:function(){
				var me = this;
				me.oSelectors = $(me.settings.selectors);
				me.selectors = me.settings.selectors;				
				me.sections = me.selectors.sections;
				me.section = me.selectors.section;
				me.oSelectors = $(me.settings.selectors);
				me.oSections = $(me.selectors.sections);
				me.oSection = $(me.selectors.section);		

				if(!_prefix){
					me._initBackgroundImg();
				}

				me.direction = me.settings.direction == "vertical" ? true : false;
				if(me.direction){
					me.oSection.each(function(){
						me.tops.push($(this).position().top);						
					});					
				}else{
					me.oSection.each(function(i){
						//alert(me.switchLength());
						me.lefts.push(me.switchLength()*(i));	
						//alert(me.lefts[i]);				
					});	
				}
				me.pagesCount = me.fnPagesCount();
				
				me.index = (me.settings.index >=0 && me.settings.index < me.pagesCount) ? me.settings.index : 0;

				me.canScroll = true;

				if(!me.direction){
					me._initLayout();
				}
				if(me.settings.pagination){					
					me._initPaging();
				}
				me._initEvent();
			},
			//获取元素的数量
			fnPagesCount:function(){
				var me = this;
				return me.oSection.length;
			},
			//获取滑动的宽度（横屏宽度）或高度（竖屏滑动）
			switchLength:function(){
				return this.direction ? this.element.height() : this.element.width();
			},
			//向前滑动，即上一页
			prev:function(){
				var me = this;
				if(me.index > 0){
					me.index --;
				}else if(me.settings.loop){
					me.index = me.pagesCount - 1;
				}
				me._scrollPage();
			},
			//向后滑动，即下一页
			next:function(){
				var me = this;

				if(me.index < me.pagesCount){
					me.index ++;
				}else if(me.settings.loop){
					me.index = 0;
				}				
				me._scrollPage();
			},
			//主要针对横屏情况进行页面布局
			_initLayout:function(){
				var me = this;
				var width = (me.pagesCount * 100) + "%",
					cellWidth = (100/me.pagesCount).toFixed(2) + "%";

				me.oSections.width(width);
				me.oSection.width(cellWidth).css("float","left");
			},
			//实现分布的dom结构及CSS样式
			_initPaging:function(){
				var me = this;
				var pagesClass = me.selectors.page.substring(1);
				
				me.activeClass = me.selectors.active.substring(1);

				var pagesHtml = "<ul class='" + pagesClass + "'>";
				
				for(var i=0; i<me.pagesCount;i++){
					pagesHtml += "<li></li>";
				}
				pagesHtml += "</ul>";
				
				me.element.append(pagesHtml);
				var pages = me.element.find(me.selectors.page);
				me.pageItem = pages.find("li");
				me.pageItem.eq(me.index).addClass(me.activeClass);

				if(me.direction){
					pages.addClass("vertical");
				}else{
					pages.addClass("horizontal");
				}
			},
			//IE下，不兼容background-size
			_initBackgroundImg:function(){
				var me = this;
				var oCur,
					sBackgroundImg;
				me.oSection.each(function(){
					oCur = $(this);
					sBackgroundImg = oCur.css("backgroundImage").split("\"")[1];
					oCur.css("backgroundImage","none").append("<img src='" + sBackgroundImg + "' alt='' />");

				});
			},
			//初始化插件事件
			_initEvent:function(){
				var me = this;
				
				//pages li click 事件
				$(me.selectors.page + " li").on("click",function(){						
					me.index = $(this).index();
					me._scrollPage();
				});

			    // 鼠标滚轮事件
				me.element.on("mousewhell DOMMouseScroll",function(e){					
					if(me.canScroll){
						var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

						if(delta >0 &&(me.index && !me.settings.loop || me.settings.loop)){
							me.prev();
						}else if(delta<0 &&(me.index<(me.pagesCount - 1) && !me.settings.loop || me.settings.loop)){
							me.next();
						}
					}
				});
				me.element.get(0).onmousewheel = function(e){		
					e = e || window.event;			
					if(me.canScroll){
						var delta = e.wheelDelta || -e.detail;
						if(delta >0 &&(me.index && !me.settings.loop || me.settings.loop)){
							me.prev();
						}else if(delta<0 &&(me.index<(me.pagesCount - 1) && !me.settings.loop || me.settings.loop)){
							me.next();
						}
					}
				}

				if(me.settings.keyboard){
					if(_prefix){
						$(window).on("keydown",function(e){
							var keyCode = e.keyCode;						
							if(keyCode == 37 || keyCode == 38){
								me.prev();
							}else if(keyCode == 39 || keyCode == 40){
								me.next();
							}
						});
					}else{					
						//IE8，7
						document.onkeydown = function(e){	
							e = e || window.event;	
							var keyCode = e.keyCode;
							if(keyCode == 37 || keyCode == 38){
								me.prev();
							}else if(keyCode == 39 || keyCode == 40){
								me.next();
							}
						}
					}
				}

				$(window).resize(function(){					
					var currrentLength = me.switchLength(),
						offset = me.settings.direction ? me.oSection.eq(me.index).offset().top : me.oSection.eq(me.index).offset().left;
					if(Math.abs(offset) > currrentLength/2 && me.index < (me.pagesCount -1)){
						me.index ++;
					}
					if(me.index){
						me._scrollPage();
					}
				});

				me.oSections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend",function(){
					me.canScroll = true;
					if(me.settings.callback && $.type(me.settings.callback) == "function"){
						me.settings.callback();
					}
				})
			},
			_scrollPage:function(){

				var me = this;
				
				var dest = me.oSection.eq(me.index).position();
				if(!dest) return;
			
				me.canScroll = false;
				if(_prefix){

					me.oSections.css(_prefix + "transition","all " + me.settings.duration + "ms " + me.settings.easing);
					var translate = me.direction ? "translateY(-" + me.tops[me.index] + "px)" : "translateX(-" + me.lefts[me.index]+ "px)";
					me.oSections.css(_prefix + "transform",translate);
				}else{
					//alert("aa");				
					var animateCss = me.direction ? {top: -me.tops[me.index] + "px"} : {left: -me.lefts[me.index] + "px"};					
					//$(".sections").animate({'top':"-475px"},1000,function(){
					console.log(animateCss);
					me.oSections.animate(animateCss,me.settings.duration,function(){
						me.canScroll = true;
						if(me.settings.callback && $.type(me.settings.callback) == "function"){
							me.settings.callback();
						}
					});
				}
				if(me.settings.pagination){
					me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
				}
			}

		};
		return PageSwitch;
	})();
	$.fn.PageSwitch = function(opt){
		return this.each(function(){
			var me = $(this),
				instance = me.data("PageSwitch");

			if(!instance){

				instance = new PageSwitch(me,opt);
				me.data("PageSwitch",instance);

			}
		});
	}
	$.fn.PageSwitch.defaults = {
		selectors:{
			sections:".sections",
			section:".section",
			page:".pages",
			active:".active"
		},
		index:0,
		easing:"ease",
		duration:500,
		loop:false,
		pagination:true,
		keyboard:true,
		direction:"vertical",
		callback:""
	}
})(jQuery);
