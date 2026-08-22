function isMobile() { return window.innerWidth <= 768; }

/* ===== Smooth scroll (Lenis) — desktop only; init after loader for a clean first scroll ===== */
(function(){
  if (typeof Lenis === 'undefined' || isMobile()) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var docEl = document.documentElement;
  docEl.style.overflowY = 'hidden';           /* lock scroll while the loader is up */
  try { window.scrollTo(0,0); } catch(e){}
  function start(){
    docEl.style.overflowY = '';                /* unlock exactly as Lenis takes over */
    try {
      var lenis = new Lenis({
        lerp: 0.055,
        wheelMultiplier: 1,
        smoothWheel: true,
        allowNestedScroll: true,
        autoRaf: true
      });
      window.__lenis = lenis;
      var rz; var mo=new MutationObserver(function(){ clearTimeout(rz); rz=setTimeout(function(){ try{lenis.resize();}catch(e){} },60); });
      mo.observe(document.body,{attributes:true,attributeFilter:['class']});
      setTimeout(function(){ try{lenis.resize();}catch(e){} }, 200);
    } catch(e){}
  }
  setTimeout(start, 2900);
})();

/* ===== Fit the fixed-width canvases to any screen size (zoom-to-fit) =====
   Desktop is a 1728px absolute canvas; mobile is built to a 393px reference.
   Scale each visible view down to fit the viewport (never up past its native
   size, so the 1728 / 393 designs stay pixel-identical at reference width).
   zoom scales the whole subtree incl. the fixed header, and keeps scrollY /
   offsetWidth math consistent, so no locked position or animation is touched. */
(function(){
  function fit(){
    var vw=document.documentElement.clientWidth||window.innerWidth||0;
    if(vw<320) return; /* ignore transient/zero widths that would collapse the page */
    var ds = vw>768 ? Math.min(1, vw/1728) : 1;
    document.documentElement.style.setProperty('--s', ds);  /* desktop: transform scale (Lenis-safe) */
    var mz = vw<=768 ? Math.min(1, vw/393) : '';
    document.querySelectorAll('.mobile-view').forEach(function(el){ el.style.zoom = mz; }); /* mobile keeps zoom */
    sizeAboutPage(ds);
    if(window.__lenis){ try{window.__lenis.resize();}catch(e){} }
  }
  /* Size the About page so the footer (which the info-section parallax lifts by 0.2*scroll)
     lands at the viewport bottom instead of scrolling out of view. */
  function sizeAboutPage(s){
    var about=document.querySelector('.about-page'); if(!about) return;
    var pw=about.querySelector('.page-wrapper');
    var infoBox=document.getElementById('infoBox');
    var footer=about.querySelector('.footer');
    if(!pw||!infoBox||!footer) return;
    if(!footer.offsetHeight) return;           /* about hidden (on Work) -> don't compute a bad height */
    var fb=infoBox.offsetTop + footer.offsetTop + footer.offsetHeight; /* unscaled footer bottom */
    var vh=window.innerHeight;
    var Hr=(fb*s + 0.2*vh)/1.2;                 /* rendered page height */
    about.style.height=Hr+'px';
    pw.style.minHeight=(Hr/s)+'px';
  }
  fit();
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  [200, 800, 3200].forEach(function(d){ setTimeout(fit, d); });
  /* Re-fit (and reset scroll) when switching About<->Work so the page sizes correctly */
  new MutationObserver(function(){
    setTimeout(function(){ fit(); if(window.__lenis){ try{ window.__lenis.scrollTo(0,{immediate:true}); }catch(e){} } }, 40);
  }).observe(document.body, { attributes:true, attributeFilter:['class'] });
})();

    /* ===== PAGE TOGGLE: ABOUT ↔ WORK ===== */
    (function(){
      var loaderDismissed = false;
      function killIntroAnimations() {
        if (loaderDismissed) return;
        loaderDismissed = true;
        // Hide loader instantly
        var loader = document.getElementById('loader');
        if (loader) { loader.style.display = 'none'; }
        // Remove all one-time intro animations so ABOUT shows instantly on return
        document.querySelectorAll('.loader-word,.intro-word,.hero-word').forEach(function(el){
          el.style.animation = 'none';
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.transform = 'none';
        });
        var stats = document.querySelector('.hero-stats');
        if (stats) { stats.style.animation = 'none'; stats.style.opacity = '1'; stats.style.transform = 'none'; }
      }
      // Desktop nav click
      function resetToProduct() {
        var pc = document.getElementById('productContainer');
        if (window.__activateContainer && pc) { window.__activateContainer(pc, true); return; }
        var all = document.querySelectorAll('.folder-svg');
        all.forEach(function(s){ s.classList.remove('active'); });
        if (pc) pc.classList.add('active');
      }
      var navEl = document.querySelector('.desktop-view .navigation');
      if (navEl) {
        navEl.addEventListener('click', function(){
          killIntroAnimations();
          document.body.classList.toggle('show-work');
          if (document.body.classList.contains('show-work')) resetToProduct();
          window.scrollTo(0,0);
        });
      }
      // Work buttons in ABOUT page → go to WORK
      document.querySelectorAll('.work-btn, .wcard-w').forEach(function(btn){
        btn.addEventListener('click', function(){
          killIntroAnimations();
          document.body.classList.add('show-work');
          resetToProduct();
          var tab=btn.getAttribute('data-tab');
          var target=tab&&document.getElementById(tab+'Container');
          if(target&&tab!=='product'&&window.__activateContainer){ window.__activateContainer(target,true); }
          window.scrollTo(0,0);
        });
      });
    })();

    /* ===== DESKTOP ABOUT SCRIPTS ===== */
    (function(){
      if (isMobile()) return;
// card 3D hover
document.querySelectorAll('.wcard-w').forEach(w=>{
  const c=w.querySelector('.wcard');
  w.addEventListener('pointerenter',()=>{c.classList.add('live');c.style.setProperty('--tz','26px');c.style.setProperty('--sc','1.04');c.style.zIndex=5;w.style.zIndex=5;});
  w.addEventListener('pointermove',e=>{
    const r=w.getBoundingClientRect();
    const nx=((e.clientX-r.left)/r.width-.5)*2, ny=((e.clientY-r.top)/r.height-.5)*2;
    c.style.setProperty('--ry',(nx*12)+'deg'); c.style.setProperty('--rx',(-ny*12)+'deg');
    c.style.setProperty('--mx',nx.toFixed(3)); c.style.setProperty('--my',ny.toFixed(3));
  });
  w.addEventListener('pointerleave',()=>{c.classList.remove('live');['--rx','--ry'].forEach(p=>c.style.setProperty(p,'0deg'));
    c.style.setProperty('--tz','0px');c.style.setProperty('--sc','1');c.style.setProperty('--mx',0);c.style.setProperty('--my',0);
    setTimeout(()=>{c.style.zIndex='';w.style.zIndex='';},550);});
});


      setTimeout(function(){ document.getElementById('loader').classList.add('done'); setTimeout(function(){ document.getElementById('loader').style.display='none'; },1300); },2800);
      var ballImg=document.querySelector('.ball-element img');var ballAngle=0;var ballBaseSpeed=22.5;var ballBoost=0;var lastBallTime=performance.now();
      function animateBall(now){var dt=(now-lastBallTime)/1000;lastBallTime=now;ballBoost*=0.96;if(Math.abs(ballBoost)<0.1)ballBoost=0;ballAngle+=(ballBaseSpeed+ballBoost)*dt;if(ballImg)ballImg.style.transform='rotate('+ballAngle+'deg)';requestAnimationFrame(animateBall);}
      requestAnimationFrame(animateBall);
      /* Services Fan: glass selector auto-cycles through the items */
      (function(){
        var fan=document.getElementById('servicesFan'); if(!fan)return;
        var sel=document.getElementById('sfSelector');
        var cur=document.getElementById('sfCursor');
        var items=[].slice.call(fan.querySelectorAll('.sf-item'));
        var selY=[3,50,97,144,191];
        var curY=[8,55,102,149,196];
        var i=1, dir=1;
        function set(idx){
          items.forEach(function(el,k){el.classList.toggle('focus',k===idx);});
          sel.style.top=selY[idx]+'px';
          cur.style.top=curY[idx]+'px';
        }
        set(i);
        setInterval(function(){
          i+=dir;
          if(i>=items.length-1){i=items.length-1;dir=-1;}
          else if(i<=0){i=0;dir=1;}
          set(i);
        },1400);
      })();
      var heroBg=document.getElementById('heroBg'),heroFg=document.getElementById('heroFg'),infoBox=document.getElementById('infoBox'),bgGrid=document.querySelector('.bg-grid'),expSection=document.querySelector('.experience-section'),workSection=document.querySelector('.work-section'),beyondSection=document.querySelector('.beyond-section'),servicesFan=document.querySelector('.services-fan'),ballEl=document.querySelector('.ball-element');
      var ticking=false,lastScrollY=0;
      function updateParallax(){var scrollY=window.scrollY;var scrollDelta=scrollY-lastScrollY;ballBoost=Math.abs(scrollDelta)*18;if(heroBg)heroBg.style.transform='translateY('+(scrollY*-0.05)+'px)';if(heroFg)heroFg.style.transform='translateY('+(scrollY*-0.2)+'px)';var rb=document.getElementById('heroRibBack'),rf=document.getElementById('heroRibFront');if(rb)rb.style.translate='0 '+(scrollY*-0.12)+'px';if(rf)rf.style.translate='0 '+(scrollY*-0.28)+'px';if(infoBox)infoBox.style.transform='translateY('+(scrollY*-0.2)+'px)';var ib=Math.max(0,scrollY-600);if(bgGrid)bgGrid.style.transform='translateY('+(ib*0.08)+'px)';var cs=ib*-0.03;if(expSection)expSection.style.transform='translateY('+cs+'px)';if(workSection)workSection.style.transform='translateY('+(cs*1.2)+'px)';if(beyondSection)beyondSection.style.transform='translateY('+(cs*1.5)+'px)';var ft=document.querySelector('.desktop-view .footer');if(ft)ft.style.transform='translateY('+(cs*1.5)+'px)';if(servicesFan)servicesFan.style.transform='translateY('+(cs*0.8)+'px) scale(0.9)';lastScrollY=scrollY;ticking=false;}
      window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(updateParallax);ticking=true;}},{passive:true});
      /* Page ends just below footer: content bottom is 2757 in layout, but info parallax
         lifts it 0.2*scrollY. Solve H = 2757 - 0.2*(H - viewport) for wrapper height. */
      var mWrap=document.getElementById('mWrap');
      function fitMobilePage(){if(!mWrap)return;var vh=window.innerHeight;var H=(2757+0.2*vh)/1.2;mWrap.style.minHeight=H+'px';mWrap.style.height=H+'px';}
      fitMobilePage();window.addEventListener('resize',fitMobilePage);
    })();

    /* ===== MOBILE ABOUT SCRIPTS ===== */
    (function(){
      if(!isMobile())return;
      var ballImg=document.querySelector('.mobile-ball img');var ballAngle=0;var ballBaseSpeed=22.5;var ballBoost=0;var lastBallTime=performance.now();
      function animateBall(now){var dt=(now-lastBallTime)/1000;lastBallTime=now;ballBoost*=0.96;if(Math.abs(ballBoost)<0.1)ballBoost=0;ballAngle+=(ballBaseSpeed+ballBoost)*dt;if(ballImg)ballImg.style.transform='rotate('+ballAngle+'deg)';requestAnimationFrame(animateBall);}
      requestAnimationFrame(animateBall);
      var mHeroBg=document.getElementById('mHeroBg'),mHeroFg=document.getElementById('mHeroFg'),mInfo=document.getElementById('mInfo');var ticking=false,lastScrollY=0;
      function updateParallax(){var scrollY=window.scrollY;var sd=scrollY-lastScrollY;ballBoost=Math.abs(sd)*18;if(mHeroBg)mHeroBg.style.transform='translateY('+(scrollY*-0.1)+'px)';if(mHeroFg)mHeroFg.style.transform='translateY('+(scrollY*-0.3)+'px)';var mrb=document.getElementById('mRibBack'),mrf=document.getElementById('mRibFront');if(mrb)mrb.style.transform='translateY('+(scrollY*-0.15)+'px)';if(mrf)mrf.style.transform='translateY('+(scrollY*-0.35)+'px)';if(mInfo)mInfo.style.transform='translateY('+(scrollY*-0.2)+'px)';lastScrollY=scrollY;ticking=false;}
      window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(updateParallax);ticking=true;}},{passive:true});
      /* Size the page so it ends just below the footer AFTER the -0.2x parallax shift:
         solve H = infoBottom + 15 - 0.2*(H - vh)  ->  H = (infoBottom + 15 + 0.2*vh) / 1.2 */
      var mWrap=document.getElementById('mWrap');
      function sizePage(){
        if(!mWrap||!mInfo)return;
        var infoBottom=mInfo.offsetTop+mInfo.offsetHeight;
        var vh=window.innerHeight;
        var H=(infoBottom+0.2*vh)/1.2;
        mWrap.style.minHeight=Math.round(H)+'px';
      }
      sizePage();window.addEventListener('resize',sizePage);setTimeout(sizePage,500);
    })();

    /* ===== WORK PAGE SCRIPTS ===== */
    (function(){
      /* Container tab switching — click text labels to bring container on top */
      var designContainer = document.getElementById('designContainer');
      var motionContainer = document.getElementById('motionContainer');
      var productContainer = document.getElementById('productContainer');
      var merchContainer = document.getElementById('merchContainer');
      var designText = document.getElementById('designTextClick');
      var motionText = document.getElementById('motionTextClick');
      var productText = document.getElementById('productTextClick');
      var merchText = document.getElementById('merchTextClick');
      var allContainers = [designContainer, motionContainer, productContainer, merchContainer];

      var folderBody = document.querySelector('.folder-body');

      function activateContainer(target, force) {
        if (!force && target.classList.contains('active')) return;
        allContainers.forEach(function(c){ c.classList.remove('active','bounce'); });
        target.classList.add('active');
        // Show marquee body for design AND product tabs
        var isDesign = target === designContainer;
        var isProduct = target === productContainer;
        var isMerch = target === merchContainer;
        folderBody.classList.toggle('visible', isDesign || isProduct || isMerch);
        var mm = document.getElementById('merchMarquee');
        if (mm) { mm.classList.toggle('visible', isMerch); if (isMerch && window.__merchReset) window.__merchReset(); }
        var dm = document.getElementById('designMarquee');
        var ps = document.getElementById('productShell');
        var dtg = document.getElementById('deviceToggle');
        if (dm) dm.style.display = isDesign ? '' : 'none';
        if (ps) ps.classList.toggle('visible', isProduct);
        if (dtg) dtg.classList.toggle('visible', isProduct);
        // Stop + reset marquee & hide progress bar when leaving DESIGN
        if (window.__setDesignActive) window.__setDesignActive(isDesign);
        // Show/hide the DESIGN left navigation sidebar (resets to ALL on enter)
        if (window.__designNav) window.__designNav(isDesign);
        // Force reflow then add bounce
        void target.offsetWidth;
        target.classList.add('bounce');
        if (target === designContainer || target === productContainer || target === merchContainer) {
          folderBody.classList.remove('bounce');
          void folderBody.offsetWidth;
          folderBody.classList.add('bounce');
        }
        if (dtg && target === productContainer) {
          dtg.classList.remove('bounce');
          void dtg.offsetWidth;
          dtg.classList.add('bounce');
        }
        target.addEventListener('animationend', function handler(){
          target.classList.remove('bounce');
          folderBody.classList.remove('bounce');
          var dtg2 = document.getElementById('deviceToggle');
          if (dtg2) dtg2.classList.remove('bounce');
          target.removeEventListener('animationend', handler);
        });
      }

      designText.addEventListener('click', function(){ activateContainer(designContainer); });
      motionText.addEventListener('click', function(){ activateContainer(motionContainer); });
      productText.addEventListener('click', function(){ activateContainer(productContainer); });
      merchText.addEventListener('click', function(){ activateContainer(merchContainer); });
      window.__activateContainer = activateContainer;

      /* Device toggle: desktop <-> mobile marquee switch */
      var deviceToggle=document.getElementById('deviceToggle');
      var btnDesktop=document.getElementById('btnDesktop'), btnMobile=document.getElementById('btnMobile');
      var desktopMarquee=document.getElementById('desktopMarquee'), mobileMarquee=document.getElementById('mobileMarquee');
      function setDevice(mobile){
        deviceToggle.classList.toggle('mobile', mobile);
        btnDesktop.classList.toggle('active', !mobile);
        btnMobile.classList.toggle('active', mobile);
        desktopMarquee.classList.toggle('visible', !mobile);
        mobileMarquee.classList.toggle('visible', mobile);
        var dtw=document.getElementById('desktopTiles'); if(dtw)dtw.classList.remove('hidden');
        mobileCatalog.classList.remove('visible');
        mobileTiles.classList.remove('hidden');
      }
      if(btnDesktop)btnDesktop.addEventListener('click', function(){ setDevice(false); });
      if(btnMobile)btnMobile.addEventListener('click', function(){ setDevice(true); });


      /* ===== Desktop tiles carousel (same logic as mobile tiles) ===== */
      var desktopTilesWrap=document.getElementById('desktopTiles');
      if(desktopTilesWrap){
        var dTiles=Array.prototype.slice.call(desktopTilesWrap.querySelectorAll('.desktop-tile'));
        var dCenterIdx=0;
        function layoutDTiles(){
          var n=dTiles.length;
          var leftIdx=(dCenterIdx-1+n)%n, rightIdx=(dCenterIdx+1)%n;
          dTiles.forEach(function(t,i){
            t.classList.remove('center','left','right');
            if(i===dCenterIdx){ t.classList.add('center'); }
            else if(i===leftIdx){ t.classList.add('left'); }
            else if(i===rightIdx){ t.classList.add('right'); }
            else { t.classList.add('left'); }
          });
        }
        layoutDTiles();
        dTiles.forEach(function(tile,i){
          tile.addEventListener('click',function(){
            if(i!==dCenterIdx){ dCenterIdx=i; layoutDTiles(); return; }
            mcLoad(parseInt(tile.getAttribute('data-catalog'),10)||0);
            document.getElementById('desktopTiles').classList.add('hidden');
            mobileCatalog.classList.add('visible');
          });
        });
        var dtPrev=document.getElementById('dtPrev'), dtNext=document.getElementById('dtNext');
        if(dtPrev)dtPrev.addEventListener('click',function(e){ e.stopPropagation(); dCenterIdx=(dCenterIdx-1+dTiles.length)%dTiles.length; layoutDTiles(); });
        if(dtNext)dtNext.addEventListener('click',function(e){ e.stopPropagation(); dCenterIdx=(dCenterIdx+1)%dTiles.length; layoutDTiles(); });
      }

      /* ===== Mobile tiles (carousel) -> catalog (vertical scroll) ===== */
      var CATALOGS=[
        {name:'FLASH TRADE V1', approach:["Flash Trade is a perps and spot exchange on Solana, up to 500x leverage with almost no price impact. I owned the product design end to end, from a blank file.","The hard part was how much Flash does. Perps, spot, staking, the token side, all of it had to fit into one app that didn't look like every other DEX but still felt like something a serious trader would trust. Getting that balance right took a lot of back and forth before it settled.","I built a dark, trader-first look and put real effort into keeping it recognizable instead of another generic exchange skin. The interface opens up when you need depth and tucks away when you don't, so your key numbers stay glanceable and the actions that matter are always within one thumb.","The token page needed a different energy. Staking pages are usually dry, and this one had to make you want to take part. That's where the rings came in: you close them by staking, we reward you for closing them, and the whole page is designed to make that loop feel worth chasing.","Onboarding had one rule, get out of the way. Wallet or social login, funded in two taps, and you're trading. Nothing sitting between you and your first position."], story:'Flash Trade is a decentralized perps and spot exchange on Solana that lets you trade with up to 500x leverage and minimal price impact. The challenge was bringing pro trader depth to a phone screen: leverage controls, order types, positions and liquidity pools, without the clutter most exchange apps carry. I led the product design from zero and built a dark, trader focused visual language that is easy to remember, with an expandable UI that keeps market data glanceable and every core action within one thumb move. Onboarding was designed around removing friction, with social or wallet login and funding in two taps.'},
        {name:'FLASH TRADE V2', approach:["V2 was the bigger, faster version: more assets, 50m/s execution, ephemeral rollups keeping fees about as low as they go.","It had to read as a real generational jump without making the traders who already lived in V1 feel lost. Beyond that, I wanted it to feel alive, less like a tool you operate, more like the interface and the user are moving as one.","So we added the quality-of-life things people actually wanted day to day: AI chat you can trade through, Duels, a proper portfolio view, and more.","I ran a full visual overhaul onto an emerald system, familiar bones on a completely rebuilt surface. The Earn page got the deepest rework: fewer pools, fewer clicks, so you see more and do more from one place, with charts you can read at a glance.","The whole time, the fight was against clutter. Holding all of this plus new features like Duels while keeping the UI clean, beautiful and memorable was the hardest constraint to sit with. Onboarding treated V2 like an event: a timed test drive on free funds, a guided walkthrough, and an auto-revert to V1 as a safety net. It was later merged fully into V1."], story:'V2 brought more assets, 50m/s execution and ephemeral rollups for the lowest fees. It needed a UI that felt like a generational step without alienating existing traders. I ran a full visual overhaul to an emerald based system: familiar layouts on a completely rebuilt surface. The Earn page was the deepest rethink, with fewer pools and fewer clicks, so users can see more information and do more in the same place, with charts readable at a glance. Onboarding treated V2 as an event: a timed test drive with free funds, a guided walkthrough, and a safety net auto revert to V1. Later, V2 was fully merged into V1.'},
        {name:'DUEL', approach:["Duel turns perps trading into a sport. You challenge up to four people, 1v1 or 1v4, everyone funds a pot, and the winner takes the whole thing.","I wanted it to commit fully to the game feeling, like you're in a match, not just watching positions. So I added a radar-style effect that shows who's joined as they drop in, a live PnL tracker so you always know where you stand, and 90s arcade music to lean into the nostalgia and make competing fun.","The trickier job was fairness and clarity. A bet between strangers has to be completely legible: who challenged who, what's on the line, and exactly where your money sits at any moment. All of that had to work on a small mobile screen and find room in a feature list that was already growing fast.","I designed the full loop, the challenge cards, splitting your deposit between your trading account and the pot, and the live countdown lobby while you wait for it to kick off.","The end of the loop is a winner card made to be screenshotted and posted. That's deliberate. The victory card is the growth engine."], story:'Duel takes perps trading and makes it a sport. Challenge up to four traders, 1v1 or 1v4, over a custom pot where the winner takes all. The design problem was making a wager between strangers feel legible and fair: who challenged whom, what is at stake, and where your money sits at every moment. I designed the full loop, from challenge cards and deposit splitting between trading account and pot, to the live countdown lobby and a winner card built to be screenshotted and shared. That last part is deliberate. The victory card is the growth loop.'}
      ];
      var mobileTiles=document.getElementById('mobileTiles');
      var mobileCatalog=document.getElementById('mobileCatalog');
      var mcScroll=document.getElementById('mcScroll');
      var mcImgsMobile=[document.getElementById('mcImgV1'),document.getElementById('mcImgV2'),document.getElementById('mcImgDuel')];
      var mcImgsDesktop=[document.getElementById('mcImgV1D'),document.getElementById('mcImgV2D'),document.getElementById('mcImgDuelD')];
      var mcTitle=document.getElementById('mcTitle');
      var tiles=Array.prototype.slice.call(document.querySelectorAll('.mobile-tile'));
      var centerIdx=0, mcIdx=0;
      /* Carousel: clicking a side tile centers it; clicking center tile opens its catalog */
      function layoutTiles(){
        var n=tiles.length;
        var leftIdx=(centerIdx-1+n)%n, rightIdx=(centerIdx+1)%n;
        tiles.forEach(function(t,i){
          t.classList.remove('center','left','right');
          if(i===centerIdx){ t.classList.add('center'); }
          else if(i===leftIdx){ t.classList.add('left'); }
          else if(i===rightIdx){ t.classList.add('right'); }
          else { t.classList.add('left'); } /* >3 tiles: park extras left */
        });
      }
      layoutTiles();
      tiles.forEach(function(tile,i){
        tile.addEventListener('click',function(){
          if(i!==centerIdx){ centerIdx=i; layoutTiles(); return; }
          mcLoad(parseInt(tile.getAttribute('data-catalog'),10)||0);
          mobileTiles.classList.add('hidden');
          mobileCatalog.classList.add('visible');
        });
      });
      function mcApply(){
        var onMobile=deviceToggle.classList.contains('mobile');
        var act=onMobile?mcImgsMobile:mcImgsDesktop;
        var inact=onMobile?mcImgsDesktop:mcImgsMobile;
        inact.forEach(function(el){ if(el)el.style.display='none'; });
        act.forEach(function(el,k){ if(el)el.style.display=(k===mcIdx)?'':'none'; });
        mcTitle.textContent=CATALOGS[mcIdx].name;
        mcScroll.scrollTop=0;
        var dv=document.getElementById('duelVideo'), dvd=document.getElementById('duelVideoD');
        if(dv&&(!onMobile||mcIdx!==2))dv.pause();
        if(dvd&&(onMobile||mcIdx!==2))dvd.pause();
        var mm=document.getElementById('mcModal'); if(mm)mm.classList.remove('open');
      }
      function mcLoad(i,dir){
        mcIdx=(i+CATALOGS.length)%CATALOGS.length;
        var al=document.getElementById('mcApproachList');
        if(al){ al.innerHTML=''; (CATALOGS[mcIdx].approach||[]).forEach(function(t){ var li=document.createElement('li'); li.textContent=t; al.appendChild(li); }); }
        var ap=document.getElementById('mcApproach'); if(ap)ap.scrollTop=0;
        if(!dir){ mcApply(); return; }
        /* slide out in arrow direction, swap, slide in from opposite side */
        mcScroll.style.opacity='0';
        mcScroll.style.transform='translateX('+(dir*-28)+'px)';
        setTimeout(function(){
          mcApply();
          mcScroll.style.transition='none';
          mcScroll.style.transform='translateX('+(dir*28)+'px)';
          void mcScroll.offsetWidth;
          mcScroll.style.transition='opacity .18s ease, transform .18s ease';
          mcScroll.style.opacity='1';
          mcScroll.style.transform='translateX(0)';
        },180);
      }
      document.getElementById('mcBack').addEventListener('click',function(){
        mobileCatalog.classList.remove('visible');
        mobileTiles.classList.remove('hidden');
        var dtw=document.getElementById('desktopTiles'); if(dtw)dtw.classList.remove('hidden');
      });
      var duelVideoD=document.getElementById('duelVideoD');
      if(duelVideoD && 'IntersectionObserver' in window){
        var vObsD=new IntersectionObserver(function(entries){
          entries.forEach(function(en){
            if(en.isIntersecting && en.intersectionRatio>=0.35){ duelVideoD.play().catch(function(){}); }
            else { duelVideoD.pause(); }
          });
        },{root:document.getElementById('mcScroll'),threshold:[0,0.35,0.7]});
        vObsD.observe(duelVideoD);
      }
      /* Duel video: play when scrolled into view, pause when out */
      var duelVideo=document.getElementById('duelVideo');
      if(duelVideo && 'IntersectionObserver' in window){
        var vObs=new IntersectionObserver(function(entries){
          entries.forEach(function(en){
            if(en.isIntersecting && en.intersectionRatio>=0.35){ duelVideo.play().catch(function(){}); }
            else { duelVideo.pause(); }
          });
        },{root:mcScroll,threshold:[0,0.35,0.6]});
        vObs.observe(duelVideo);
      }
      document.getElementById('mcPrev').addEventListener('click',function(){ mcLoad(mcIdx-1,-1); });
      document.getElementById('mcNext').addEventListener('click',function(){ mcLoad(mcIdx+1,1); });
      function tileStep(d){ centerIdx=(centerIdx+d+tiles.length)%tiles.length; layoutTiles(); }
      document.getElementById('mtPrev').addEventListener('click',function(e){ e.stopPropagation(); tileStep(-1); });
      document.getElementById('mtNext').addEventListener('click',function(e){ e.stopPropagation(); tileStep(1); });

      /* On load: PRODUCT tab is active by default, so show its shell */
      (function initTabs(){
        var isD = designContainer.classList.contains('active');
        var isP = productContainer.classList.contains('active');
        var isM = merchContainer.classList.contains('active');
        folderBody.classList.toggle('visible', isD || isP || isM);
        var mm0 = document.getElementById('merchMarquee'); if (mm0) mm0.classList.toggle('visible', isM);
        var dm = document.getElementById('designMarquee');
        var ps = document.getElementById('productShell');
        var dtg = document.getElementById('deviceToggle');
        if (dm) dm.style.display = isD ? '' : 'none';
        if (ps) ps.classList.toggle('visible', isP);
        if (dtg) dtg.classList.toggle('visible', isP);
      })();

      /* Marquee — scrolls LEFT to RIGHT */
      var marquee=document.getElementById('designMarquee'),track=document.getElementById('marqueeTrack');
      var img1=document.getElementById('mImg1');
      var progressFill=document.getElementById('designProgressFill');
      var PROGRESS_BAR_W=160;
      var SPEED=80.5,singleW=0,offset=0,paused=false,lastT=0;
      var designActive=true; /* product starts active, but flag flips on first tab click */
      var progressGroup=document.getElementById('designProgressBar');
      window.__setDesignActive=function(on){
        designActive=on;
        if(progressGroup)progressGroup.style.display=on?'':'none';
        if(!on){offset=0;if(progressFill)progressFill.setAttribute('width','0');if(track)track.style.transform='translateX(0px)';}
        /* marquee was display:none before this — hidden elements measure 0, so re-measure now that it's visible */
        if(on){setTimeout(measure,50);setTimeout(measure,400);setTimeout(measure,1500);}
      };
      /* initialize: product tab is active on load, so hide bar until DESIGN clicked */
      window.__setDesignActive(document.getElementById('designContainer').classList.contains('active'));
      /* offsetWidth = layout width, unaffected by the folder's scale(0.97) transform.
         getBoundingClientRect() returned the SCALED width, making the wrap point ~3% off → visible jump each loop. */
      function measure(){if(img1&&img1.complete&&img1.naturalWidth)singleW=img1.offsetWidth;}
      if(img1)img1.addEventListener('load',measure);
      window.addEventListener('resize',measure);setTimeout(measure,500);setTimeout(measure,2000);
      /* offset starts at singleW and decreases — content visually moves LEFT→RIGHT */
      function render(){
        if(!singleW)return;
        track.style.transform='translateX('+(-Math.round(offset*10)/10)+'px)';
        /* Progress: as offset decreases from singleW down to 0, fill goes 0 → 160 */
        if(progressFill){
          var pct=1-(offset/singleW); /* 0 at start of cycle, 1 at reset */
          progressFill.setAttribute('width', String(Math.max(0,pct*PROGRESS_BAR_W)));
        }
      }
      function tick(ts){if(!lastT)lastT=ts;var dt=(ts-lastT)/1000;lastT=ts;if(designActive&&!paused&&singleW){offset-=SPEED*dt;if(offset<=0)offset+=singleW;render();}requestAnimationFrame(tick);}
      requestAnimationFrame(tick);
      if(marquee){
        var dragX=0;
        marquee.addEventListener('pointerdown',function(e){
          paused=true;marquee.classList.add('holding');
          dragX=e.clientX;
        });
        marquee.addEventListener('pointermove',function(e){
          if(!paused||!singleW)return;
          var dx=e.clientX-dragX;dragX=e.clientX;
          offset-=dx; /* drag right -> content follows right */
          offset=((offset%singleW)+singleW)%singleW;
          render();
        });
      }
      window.addEventListener('pointerup',function(){paused=false;if(marquee)marquee.classList.remove('holding');});
    })();

    /* ===== DESIGN sub-tabs: ALL (horizontal marquee) / BRAND DESIGN (vertical marquee) / 2D / 3D ===== */
    (function(){
      var nav=document.getElementById('designNav');
      var sel=document.getElementById('dnSelector');
      var items=[].slice.call(document.querySelectorAll('#designNav .dn-item'));
      var brand=document.getElementById('brandMarquee'),bTrack=document.getElementById('brandTrack');
      var bImg1=document.getElementById('bImg1');
      var selTop=[32,78,124,170];
      var imgH=0,maxScroll=0,pos=0,bPaused=false;

      function bMeasure(){ if(bImg1&&bImg1.complete&&bImg1.naturalHeight){ imgH=bImg1.offsetHeight; maxScroll=Math.max(0,imgH-brand.clientHeight); if(pos>maxScroll)pos=maxScroll; bRender(); } }
      if(bImg1)bImg1.addEventListener('load',bMeasure);
      window.addEventListener('resize',bMeasure);
      function bRender(){ bTrack.style.transform='translateY('+(-Math.round(pos*10)/10)+'px)'; }
      function clampPos(){ if(pos<0)pos=0; else if(pos>maxScroll)pos=maxScroll; }

      function setSub(i){
        items.forEach(function(el){ el.classList.toggle('active',+el.getAttribute('data-i')===i); });
        if(sel)sel.style.top=selTop[i]+'px';
        var isAll=(i===0),isBrand=(i===1);
        var dm=document.getElementById('designMarquee');
        if(dm)dm.style.display=isAll?'':'none';
        if(brand)brand.classList.toggle('visible',isBrand);
        if(window.__setDesignActive)window.__setDesignActive(isAll); /* horizontal marquee + progress only on ALL */
        if(isBrand){ setTimeout(bMeasure,50); setTimeout(function(){bMeasure();bRender();},400); }
      }
      items.forEach(function(el){ el.addEventListener('click',function(){ setSub(+el.getAttribute('data-i')); }); });

      /* vertical drag + wheel scroll of the brand catalogue */
      if(brand){
        var dragY=0;
        brand.addEventListener('pointerdown',function(e){ bPaused=true; brand.classList.add('holding'); dragY=e.clientY; });
        brand.addEventListener('pointermove',function(e){ if(!bPaused)return; var dy=e.clientY-dragY; dragY=e.clientY; pos-=dy; clampPos(); bRender(); });
        brand.addEventListener('wheel',function(e){ e.preventDefault(); pos+=e.deltaY; clampPos(); bRender(); },{passive:false});
      }
      window.addEventListener('pointerup',function(){ bPaused=false; if(brand)brand.classList.remove('holding'); });

      /* MERCH catalogue: same drag + wheel scroll */
      (function(){
        var mq=document.getElementById('merchMarquee'),mt=document.getElementById('merchTrack'),mi=document.getElementById('merchImg');
        if(!mq||!mt||!mi)return;
        var mpos=0,mmax=0,mhold=false,mdrag=0;
        function mMeasure(){ if(mi.complete&&mi.naturalHeight){ mmax=Math.max(0,mi.offsetHeight-mq.clientHeight); if(mpos>mmax)mpos=mmax; mRender(); } }
        function mRender(){ mt.style.transform='translateY('+(-Math.round(mpos*10)/10)+'px)'; }
        function mClamp(){ if(mpos<0)mpos=0; else if(mpos>mmax)mpos=mmax; }
        mi.addEventListener('load',mMeasure); window.addEventListener('resize',mMeasure);
        mq.addEventListener('pointerdown',function(e){ mhold=true; mq.classList.add('holding'); mdrag=e.clientY; });
        mq.addEventListener('pointermove',function(e){ if(!mhold)return; var dy=e.clientY-mdrag; mdrag=e.clientY; mpos-=dy; mClamp(); mRender(); });
        mq.addEventListener('wheel',function(e){ e.preventDefault(); mpos+=e.deltaY; mClamp(); mRender(); },{passive:false});
        window.addEventListener('pointerup',function(){ mhold=false; mq.classList.remove('holding'); });
        window.__merchReset=function(){ mpos=0; setTimeout(mMeasure,50); setTimeout(function(){mMeasure();mRender();},400); };
      })();

      /* called by activateContainer on DESIGN tab enter/leave */
      window.__designNav=function(isDesign){
        if(nav)nav.classList.toggle('visible',isDesign);
        if(isDesign){ setSub(1); }               /* default to BRAND DESIGN each time DESIGN opens */
        else { if(brand)brand.classList.remove('visible'); }
      };
      var dc=document.getElementById('designContainer');
      if(dc&&dc.classList.contains('active')) window.__designNav(true);
    })();

    /* ===== MOBILE WORK PAGE: containers + tab/button animation ===== */
    (function(){
      if(!isMobile())return;
      var mWorkPage=document.getElementById('mWorkPage'),mWrap=document.getElementById('mWrap');
      var mMap={merch:'mMerchC',design:'mDesignC',motion:'mMotionC',product:'mProductC'};
      var mDeck=document.getElementById('mDeckProduct');
      var mTog=document.getElementById('mDeviceToggle');
      var mSoon=document.getElementById('mComingSoon');
      var mBtnD=document.getElementById('mBtnDesktop'),mBtnM=document.getElementById('mBtnMobile');
      var mDevice='mobile',mTab='product';
      var mDesignView=document.getElementById('mDesignView');
      var mSub=1; /* default BRAND */
      function mSetSub(i){
        mSub=i;
        var sel=document.getElementById('mDnSel');
        document.querySelectorAll('#mDesignNav .m-dn-item').forEach(function(el){el.classList.toggle('active',+el.getAttribute('data-i')===i);});
        if(sel)sel.style.transform='translateX('+(i*100)+'%)';
        var dv=document.getElementById('mDesignView'),bv=document.getElementById('mBrandView'),tr=document.getElementById('mDesignTrack');
        var isAll=(i===0),isBrand=(i===1);
        if(dv)dv.classList.toggle('active',isAll);
        if(bv)bv.classList.toggle('active',isBrand);
        if(tr)tr.classList.toggle('active',isAll);
        var shown=isAll?dv:isBrand?bv:null;
        if(shown){ shown.scrollTop=0; shown.classList.remove('bounce');void shown.offsetWidth;shown.classList.add('bounce');
          shown.addEventListener('animationend',function h(){shown.classList.remove('bounce');shown.removeEventListener('animationend',h);}); }
        if(isAll)setTimeout(function(){if(window.__mDesignUpd)window.__mDesignUpd();},50);
      }
      document.querySelectorAll('#mDesignNav .m-dn-item').forEach(function(el){ el.addEventListener('click',function(){ mSetSub(+el.getAttribute('data-i')); }); });
      function refreshProductViews(){
        var onProduct=(mTab==='product');
        if(mDesignView){
          var onD=(mTab==='design');
          var nav=document.getElementById('mDesignNav');
          if(nav)nav.classList.toggle('active',onD);
          if(onD){ mSetSub(mSub); }
          else {
            mDesignView.classList.remove('active','bounce');
            var bv=document.getElementById('mBrandView'); if(bv)bv.classList.remove('active','bounce');
            var tr=document.getElementById('mDesignTrack'); if(tr)tr.classList.remove('active');
          }
        }
        if(mTog)mTog.classList.toggle('visible',onProduct);
        var mv=document.getElementById('mMerchView');
        if(mv){ var onM=(mTab==='merch'),wasM=mv.classList.contains('active'); mv.classList.toggle('active',onM);
          if(onM&&!wasM){ mv.scrollTop=0; mv.classList.remove('bounce');void mv.offsetWidth;mv.classList.add('bounce');
            mv.addEventListener('animationend',function hm(){mv.classList.remove('bounce');mv.removeEventListener('animationend',hm);}); } }
        var deckOn=onProduct;
        var mArts={ftv1:['assets/fx/fx-m-card-teaser-3.png','assets/fx/fx-asset-4.png'],
                   ftv2:['assets/fx/fx-m-card-teaser.png','assets/fx/fx-asset-3.png'],
                   duels:['assets/fx/fx-m-card-teaser-2.png','assets/fx/fx-asset.png']};
        Object.keys(mArts).forEach(function(k){
          var card=document.querySelector('#mDeckProduct [data-card="'+k+'"] .m-card-teaser img');
          if(card){var want=mArts[k][mDevice==='desktop'?1:0]; if(card.getAttribute('src')!==want)card.setAttribute('src',want);}
        });
        if(mDeck){
          var was=mDeck.classList.contains('active');
          mDeck.classList.toggle('active',deckOn);
          if(deckOn&&!was){
            mDeck.classList.remove('bounce');void mDeck.offsetWidth;
            mDeck.classList.add('bounce');
            mDeck.addEventListener('animationend',function h2(){mDeck.classList.remove('bounce');mDeck.removeEventListener('animationend',h2);});
          }
        }
        if(mSoon)mSoon.classList.remove('visible');
      }
      function setDevice(d){
        mDevice=d;
        if(mTog)mTog.classList.toggle('mobile',d==='mobile');
        if(mBtnD)mBtnD.classList.toggle('active',d==='desktop');
        if(mBtnM)mBtnM.classList.toggle('active',d==='mobile');
        refreshProductViews();
      }
      if(mBtnD)mBtnD.addEventListener('click',function(e){e.stopPropagation();setDevice('desktop');});
      if(mBtnM)mBtnM.addEventListener('click',function(e){e.stopPropagation();setDevice('mobile');});
      function activateM(tab){
        mTab=tab;refreshProductViews();
        Object.keys(mMap).forEach(function(k){
          var svg=document.getElementById(mMap[k]);
          var lbl=document.querySelector('.m-tab-'+(k==='design'?'design':k));
          if(!svg)return;
          if(k===tab){svg.classList.remove('bounce');void svg.offsetWidth;svg.classList.add('active','bounce');svg.addEventListener('animationend',function h2(){svg.classList.remove('bounce');svg.removeEventListener('animationend',h2);});}
          else{svg.classList.remove('active','bounce');}
          if(lbl)lbl.classList.toggle('active',k===tab);
        });
      }
      window.__openMobileWork=function(tab){
        if(mWrap)mWrap.style.display='none';
        if(mWorkPage)mWorkPage.classList.add('visible');
        document.body.classList.add('m-show-work');
        window.scrollTo(0,0);
        /* Clear stale states so the entry bounce always retriggers */
        if(mDeck)mDeck.classList.remove('active','bounce');
        if(mDesignView)mDesignView.classList.remove('active','bounce');
        var mbv=document.getElementById('mBrandView');if(mbv)mbv.classList.remove('active','bounce');
        var mmv=document.getElementById('mMerchView');if(mmv)mmv.classList.remove('active','bounce');
        activateM(tab||'product');
      };
      window.__closeMobileWork=function(){
        document.querySelectorAll('.m-hero-word,.mobile-hero-stats').forEach(function(el){el.style.animation='none';el.style.opacity='1';el.style.transform='none';el.style.filter='none';});
        if(mWorkPage)mWorkPage.classList.remove('visible');
        document.body.classList.remove('m-show-work');
        if(mWrap)mWrap.style.display='';
        window.scrollTo(0,0);
        ['mHeroBg','mHeroFg','mInfo','mRibBack','mRibFront'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.transform='';});
      };
      document.querySelectorAll('.m-tab-label').forEach(function(b){
        b.addEventListener('click',function(){activateM(b.getAttribute('data-mtab'));});
      });
      /* Work box buttons: glow lights (CSS :active), then open work page on that tab */
      document.querySelectorAll('.mwc-w').forEach(function(btn){
        btn.addEventListener('click',function(){
          var tab=btn.getAttribute('data-tab');
          setTimeout(function(){window.__openMobileWork(tab);},180);
        });
      });
      /* Header WORK toggle switches between about and work */
      var mNav=document.querySelector('.mobile-nav .nav-toggle');
      if(mNav)mNav.addEventListener('click',function(){
        if(mWorkPage.classList.contains('visible'))window.__closeMobileWork();
        else window.__openMobileWork('product');
      });
    })();

    /* Product deck: fixed order (duels < v2 < v1). Clicking a card drops the cards in front of it; clicking a dropped card brings it back. */
    (function(){
      if(!isMobile())return;
      var deck=document.getElementById('mDeckProduct');
      if(!deck)return;
      var order=['duels','ftv2','ftv1'];
      var cards={};
      order.forEach(function(k){cards[k]=deck.querySelector('[data-card="'+k+'"]');});
      function syncRevealed(){
        /* a card is 'revealed' (front-most visible) if it isn't dropped but everything in front of it is */
        order.forEach(function(k,i){
          var front=false;
          for(var j=i+1;j<order.length;j++){if(!cards[order[j]].classList.contains('dropped'))front=true;}
          cards[k].classList.toggle('revealed',!front&&!cards[k].classList.contains('dropped')&&i<order.length-1);
        });
      }
      order.forEach(function(k,i){
        cards[k].addEventListener('click',function(){
          if(cards[k].classList.contains('dropped')){
            cards[k].classList.remove('dropped');
          }else{
            for(var j=i+1;j<order.length;j++){cards[order[j]].classList.add('dropped');}
          }
          syncRevealed();
        });
      });
    })();

    /* Mobile catalogue: EXPLORE opens it; back/arrows/info like desktop */
    (function(){
      if(!isMobile())return;
      var M_CATS=[
        {key:'ftv1',name:'FLASH TRADE V1',img:'mMcImgV1',imgX:'mMcImgV1X',story:'Flash Trade is a decentralized perps and spot exchange on Solana that lets you trade with up to 500x leverage and minimal price impact. The challenge was bringing pro trader depth to a phone screen: leverage controls, order types, positions and liquidity pools, without the clutter most exchange apps carry. I led the product design from zero and built a dark, trader focused visual language that is easy to remember, with an expandable UI that keeps market data glanceable and every core action within one thumb move. Onboarding was designed around removing friction, with social or wallet login and funding in two taps.'},
        {key:'ftv2',name:'FLASH TRADE V2',img:'mMcImgV2',imgX:'mMcImgV2X',story:'V2 brought more assets, 50m/s execution and ephemeral rollups for the lowest fees. It needed a UI that felt like a generational step without alienating existing traders. I ran a full visual overhaul to an emerald based system: familiar layouts on a completely rebuilt surface. The Earn page was the deepest rethink, with fewer pools and fewer clicks, so users can see more information and do more in the same place, with charts readable at a glance. Onboarding treated V2 as an event: a timed test drive with free funds, a guided walkthrough, and a safety net auto revert to V1. Later, V2 was fully merged into V1.'},
        {key:'duels',name:'DUEL',img:'mMcImgDuel',imgX:'mMcDuelWrapX',story:'Duel takes perps trading and makes it a sport. Challenge up to four traders, 1v1 or 1v4, over a custom pot where the winner takes all. The design problem was making a wager between strangers feel legible and fair: who challenged whom, what is at stake, and where your money sits at every moment. I designed the full loop, from challenge cards and deposit splitting between trading account and pot, to the live countdown lobby and a winner card built to be screenshotted and shared. That last part is deliberate. The victory card is the growth loop.'}
      ];
      var mCat=document.getElementById('mCatalog');
      if(!mCat)return;
      var mMcScroll=document.getElementById('mMcScroll');
      var mMcTitle=document.getElementById('mMcTitle');
      var mIdx=0;
      function mApply(){
        var tg=document.getElementById('mDeviceToggle');
        var onMob=!tg||tg.classList.contains('mobile');
        M_CATS.forEach(function(c,k){
          var elM=(c.key==='duels')?document.getElementById('mMcDuelWrap'):document.getElementById(c.img);
          var elX=document.getElementById(c.imgX);
          if(elM)elM.style.display=(onMob&&k===mIdx)?'':'none';
          if(elX)elX.style.display=(!onMob&&k===mIdx)?'':'none';
        });
        var dv=document.getElementById('mDuelVideo'),dvx=document.getElementById('mDuelVideoX');
        var duelOn=(M_CATS[mIdx].key==='duels');
        if(dv){ if(duelOn&&onMob){dv.play().catch(function(){});} else {dv.pause();} }
        if(dvx){ if(duelOn&&!onMob){dvx.play().catch(function(){});} else {dvx.pause();} }
        mMcTitle.textContent=M_CATS[mIdx].name;
        mMcScroll.scrollTop=0;
        var mm=document.getElementById('mMcModal');if(mm)mm.classList.remove('open');
      }
      function mLoad(i,dir){
        mIdx=(i+M_CATS.length)%M_CATS.length;
        if(!dir){mApply();return;}
        mMcScroll.style.opacity='0';
        mMcScroll.style.transform='translateX('+(dir*-28)+'px)';
        setTimeout(function(){
          mApply();
          mMcScroll.style.transition='none';
          mMcScroll.style.transform='translateX('+(dir*28)+'px)';
          void mMcScroll.offsetWidth;
          mMcScroll.style.transition='opacity .18s ease, transform .18s ease';
          mMcScroll.style.opacity='1';
          mMcScroll.style.transform='translateX(0)';
        },180);
      }
      /* EXPLORE buttons open catalogue for their card */
      document.querySelectorAll('#mDeckProduct .m-card').forEach(function(card){
        var btn=card.querySelector('.m-card-btn');
        if(!btn)return;
        btn.addEventListener('click',function(e){
          e.stopPropagation();
          var key=card.getAttribute('data-card');
          var i=M_CATS.findIndex(function(c){return c.key===key;});
          mLoad(i<0?0:i);
          mCat.classList.add('visible');
        });
      });
      document.getElementById('mMcBack').addEventListener('click',function(){mCat.classList.remove('visible');});
      document.getElementById('mMcPrev').addEventListener('click',function(){mLoad(mIdx-1,-1);});
      document.getElementById('mMcNext').addEventListener('click',function(){mLoad(mIdx+1,1);});
      document.getElementById('mMcInfo').addEventListener('click',function(){
        document.getElementById('mMcModalTitle').textContent=M_CATS[mIdx].name;
        document.getElementById('mMcModalText').textContent=M_CATS[mIdx].story;
        document.getElementById('mMcModal').classList.add('open');
      });
      document.getElementById('mMcModalClose').addEventListener('click',function(){
        document.getElementById('mMcModal').classList.remove('open');
      });
    })();

    /* design catalogue scroll progress */
    (function(){
      if(!isMobile())return;
      var v=document.getElementById('mDesignView'),tr=document.getElementById('mDesignTrack'),th=document.getElementById('mDesignThumb');
      if(!v||!th)return;
      function upd(){
        var max=v.scrollHeight-v.clientHeight;
        if(max<=0){th.style.opacity='0';return;}
        th.style.opacity='1';
        var trackH=tr.clientHeight;
        var thumbH=Math.max(36,trackH*(v.clientHeight/v.scrollHeight));
        th.style.height=thumbH+'px';
        th.style.transform='translateY('+((v.scrollTop/max)*(trackH-thumbH))+'px)';
      }
      v.addEventListener('scroll',upd,{passive:true});
      window.addEventListener('resize',upd);
      window.__mDesignUpd=upd;
      var im=v.querySelector('img');
      if(im&&!im.complete)im.addEventListener('load',upd);
    })();

    /* ===== MOBILE EXPERIENCE STRIP: manual scroll + magnet snap (restored) ===== */
    (function(){
      if(!isMobile())return;
      var strip=document.getElementById('mExpStrip'),fill=document.getElementById('mExpScrubFill');
      if(!strip)return;
      var img=strip.querySelector('.mexp-img');
      var cardW=0,holding=false,snapping=false,idleTimer=null,snapRAF=0;
      function measure(){
        var total=strip.scrollWidth,vw=strip.clientWidth;
        if(total<=0||vw<=0){cardW=0;return;}
        var n=Math.max(1,Math.round(total/vw));
        cardW=total/n;
      }
      function updateFill(){
        if(!fill)return;
        var max=strip.scrollWidth-strip.clientWidth;
        var p=max>0?Math.max(0,Math.min(1,strip.scrollLeft/max)):0;
        fill.style.width=(10+p*90)+'%';
      }
      function snap(){
        if(holding)return;
        if(cardW<=0)measure();
        if(cardW<=0)return;
        var max=strip.scrollWidth-strip.clientWidth;
        var target=Math.round(strip.scrollLeft/cardW)*cardW;
        if(target>max)target=max;if(target<0)target=0;
        cancelAnimationFrame(snapRAF);
        snapping=true;
        (function step(){
          var d=target-strip.scrollLeft;
          if(Math.abs(d)<0.5){strip.scrollLeft=target;updateFill();snapping=false;return;}
          strip.scrollLeft+=d*0.18; /* magnet pull */
          updateFill();
          snapRAF=requestAnimationFrame(step);
        })();
      }
      strip.addEventListener('scroll',function(){
        updateFill();
        if(snapping)return;
        clearTimeout(idleTimer);
        idleTimer=setTimeout(snap,120);
      },{passive:true});
      function hold(){holding=true;snapping=false;cancelAnimationFrame(snapRAF);clearTimeout(idleTimer);}
      function release(){if(!holding)return;holding=false;clearTimeout(idleTimer);idleTimer=setTimeout(snap,120);}
      strip.addEventListener('touchstart',hold,{passive:true});
      strip.addEventListener('touchend',release,{passive:true});
      strip.addEventListener('touchcancel',release,{passive:true});
      strip.addEventListener('pointerdown',hold);
      window.addEventListener('pointerup',release);
      if(img&&!img.complete)img.addEventListener('load',function(){measure();updateFill();});
      measure();updateFill();
      window.addEventListener('resize',function(){measure();updateFill();});
    })();


    /* ===== URL routing: /, /work, /design, /motion, /merch (deep-link + history) ===== */
    (function(){
      var PATHS={ '/design':'design','/motion':'motion','/merch':'merch','/product':'product','/work':'product' };
      function isAbout(p){ return p==='/'||p==='/about'||p===''; }
      function norm(p){ if(p.length>1&&p.charAt(p.length-1)==='/')p=p.slice(0,-1); return p; }

      function openDesktop(path){
        var cat=PATHS[path];
        if(!cat){ document.body.classList.remove('show-work'); return; } /* default = ABOUT */
        document.body.classList.add('show-work');
        var el=document.getElementById(cat+'Container');
        if(window.__activateContainer&&el) window.__activateContainer(el,true);
      }
      function openMobile(path){
        var cat=PATHS[path];
        if(!cat){ /* default = ABOUT */
          document.body.classList.remove('m-show-work');
          var wp=document.getElementById('mWorkPage'); if(wp)wp.classList.remove('visible');
          var wr=document.getElementById('mWrap'); if(wr)wr.style.display='';
          return;
        }
        if(window.__openMobileWork) window.__openMobileWork(cat);
      }
      function apply(path){ path=norm(path); (isMobile()?openMobile:openDesktop)(path); }

      /* URL to write for a given category */
      function urlFor(cat){ return cat==='product'?'/work':cat==='about'?'/':'/'+cat; }
      window.__setRoute=function(cat){ var u=urlFor(cat); if(location.pathname!==u){ try{history.pushState({},'',u);}catch(e){} } };

      /* deep-link on first load + browser back/forward */
      /* Always start on About (ignore any persisted work URL); reset the URL to / */
      apply('/');
      try{ if(location.pathname!=='/') history.replaceState({},'','/'); }catch(e){}
      window.addEventListener('popstate', function(){ apply(location.pathname); });

      /* keep the URL in sync as the user navigates (desktop) */
      function hook(id,cat){ var el=document.getElementById(id); if(el)el.addEventListener('click',function(){ window.__setRoute(cat); }); }
      hook('designTextClick','design'); hook('productTextClick','product');
      hook('motionTextClick','motion'); hook('merchTextClick','merch');
      var pill=document.querySelector('.desktop-view .navigation');
      if(pill)pill.addEventListener('click',function(){ setTimeout(function(){ window.__setRoute(document.body.classList.contains('show-work')?'product':'about'); },0); });
      document.querySelectorAll('.work-btn, .wcard-w').forEach(function(b){ b.addEventListener('click',function(){ window.__setRoute(b.getAttribute('data-tab')||'product'); }); });
    })();

    /* ===================== MOTION TAB (contained) ===================== */
    (function(){
      var CHANNEL = "https://www.youtube.com/@sarthakcreates";
      var MOTION_VIDEOS = [
        {n:1,  title:"Flash Trade V2 Explainer", yt:"9EROvt87uyk", desc:"A full walkthrough of Flash Trade V2. Built to explain the new trading flow in a way anyone can follow."},
        {n:2,  title:"Equity Perps",             yt:"RiB74hr6eaM", desc:"Launch animation for Equity Perps on Flash Trade. Stocks meet onchain perpetuals."},
        {n:3,  title:"Flash Trade V2 Launch",    yt:"U-souFbSLBk", desc:"The V2 launch film. A new beginning for effortless perpetuals trading."},
        {n:4,  title:"Futarchy",                 yt:"QNMzlUXPbW0", desc:"Explaining futarchy governance and how the community steers the protocol."},
        {n:5,  title:"FAF Mint",                 yt:"Qw5vPrCkBPE", desc:"Mint announcement for $FAF. Fully diluted, revenue share, zero team allocation."},
        {n:6,  title:"2024 Wrapped",             yt:"N6XxhS9s6VE", desc:"A year of Flash Trade in one animation. Everything we shipped in 2024."},
        {n:7,  title:"DUEL",                     yt:"1Fpv-570m4o", desc:"Promo for DUEL. Trade head to head and battle for the prize pool."},
        {n:8,  title:"ORE",                      yt:"XUoqv7TwTW8", desc:"ORE listing animation. New asset, same effortless trading."},
        {n:9,  title:"Ownership",                yt:"6U3CPdQ3Up8", desc:"What ownership means on Flash Trade. Revenue share explained in motion."},
        {n:10, title:"RUG",                      yt:"ON9GRaFvlb4", desc:"A playful take on rugs and why Flash Trade is built different."},
        {n:11, title:"Pengu",                    yt:"1YFM-vhgzuw", desc:"Pengu listing promo. Bringing the flock onchain."},
        {n:12, title:"x-stocks",                 yt:"_Nwviw9ZDtU", desc:"x-stocks on Flash Trade. Trade equities with crypto rails."},
        {n:13, title:"2025 Wrapped",             yt:"YcTLVXFasH0", desc:"The 2025 recap. Bigger numbers, faster fills, more markets."},
        {n:14, title:"Trade on Charts",          yt:"9SCfXW7JwJ8", desc:"Feature promo for trading directly on charts. Click, drag, done."},
        {n:15, title:"Save Charts",              yt:"pgpOYAgRqfY", desc:"Save your chart layouts and pick up right where you left off."},
        {n:16, title:"Auto Compounding",         yt:"Zwd9Atmo7b4", desc:"Auto compounding explained. Your rewards keep working for you."},
        {n:17, title:"Degen Mode",               yt:"-EgmznPpeRk", desc:"Degen Mode promo. 500x leverage for the ones who want it all."},
        {n:18, title:"Promo Animation 2",        yt:"aR6cHB_Bu9Y", desc:"Brand promo animation for Flash Trade."},
        {n:19, title:"Promo Animation 3",        yt:"A3hXcRZJQV4", desc:"Brand promo animation for Flash Trade."},
        {n:20, title:"Promo Animation 1",        yt:"T4x0llwlsVo", desc:"Brand promo animation for Flash Trade."}
      ];
      var EDITS_VIDEOS = [];

      var src   = function(n){ return "assets/motion/" + n + ".mp4"; };
      var thumb = function(n){ return "assets/motion/thumbs/" + n + ".jpg"; };
      var mod   = function(a,m){ return ((a % m) + m) % m; };
      var videoLink = function(item){ return item.yt ? ("https://youtu.be/" + item.yt) : CHANNEL; };
      var $ = function(id){ return document.getElementById(id); };

      /* ---------------- DESKTOP ---------------- */
      (function(){
        var layer = $('moLayer'); if(!layer) return;
        var views = { folders:$('moFolders'), slide:$('moSlide'), grid:$('moGrid'), player:$('moPlayer') };
        var vswitch = $('moVswitch'), back = $('moBack');
        var deckMode = 'slide', currentFolder = null, slideIndex = 0, animLock = false;

        function list(){ return currentFolder === 'edits' ? EDITS_VIDEOS : MOTION_VIDEOS; }
        function pauseAll(root){
          if(!root) return;
          root.querySelectorAll('video').forEach(function(v){ v.pause(); });
          root.querySelectorAll('.mo-media.playing').forEach(function(m){ m.classList.remove('playing'); });
        }
        function show(name){
          Object.keys(views).forEach(function(k){ views[k].classList.toggle('on', k === name); });
          vswitch.style.display = (name === 'slide' || name === 'grid') ? 'block' : 'none';
          back.style.display = (name === 'folders') ? 'none' : 'flex';
          if(name !== 'slide') pauseAll(views.slide);
          if(name !== 'grid') pauseAll(views.grid);
          if(name !== 'player') pMedia.innerHTML = '';
        }

        // folders
        layer.querySelectorAll('#moFolders .mo-folder').forEach(function(f){
          f.addEventListener('click', function(){
            if(f.classList.contains('opening')) return;
            f.classList.add('opening');
            setTimeout(function(){
              f.classList.remove('opening');
              currentFolder = f.getAttribute('data-folder');
              slideIndex = 0;
              openMode(deckMode);
            }, 380);
          });
        });
        function openMode(m){
          deckMode = m;
          vswitch.classList.toggle('slide', m === 'slide');
          vswitch.classList.toggle('grid',  m === 'grid');
          if(m === 'slide'){ deckInit(); show('slide'); }
          else { renderGrid(); show('grid'); }
        }
        vswitch.querySelectorAll('.mo-vs-btn').forEach(function(b){
          b.addEventListener('click', function(){ openMode(b.getAttribute('data-mode')); });
        });
        back.addEventListener('click', function(){
          if(views.player.classList.contains('on')){ openMode(deckMode); return; }
          currentFolder = null; show('folders');
        });

        // slide deck (7 cards, both-side loop)
        var deckCards = [].slice.call(views.slide.querySelectorAll('.mo-deck-card'));
        var POS = ['mo-pl3','mo-pl2','mo-pl1','mo-pc','mo-pr1','mo-pr2','mo-pr3'];
        var OFFSET = [-3,-2,-1,0,1,2,3];
        var roles = [];
        function setCardMedia(card, item, instant){
          var media = card.querySelector('.mo-media'), img = card.querySelector('img.mo-thumb'), vid = card.querySelector('video');
          media.classList.remove('playing');
          if(instant) card.classList.add('noanim');
          if(!item){ img.removeAttribute('src'); vid.removeAttribute('src'); delete vid.dataset.n; vid.load(); }
          else {
            img.src = thumb(item.n);
            if(vid.dataset.n !== String(item.n)){ vid.src = src(item.n); vid.dataset.n = item.n; vid.load(); }
          }
          if(instant) requestAnimationFrame(function(){ card.classList.remove('noanim'); });
        }
        function itemAt(off){ var v = list(); return v.length ? v[mod(slideIndex + off, v.length)] : null; }
        function applyRoles(){ roles.forEach(function(card,i){ POS.forEach(function(c){ card.classList.remove(c); }); card.classList.add(POS[i]); }); }
        function playFront(){
          var f = roles[3], vid = f.querySelector('video'), media = f.querySelector('.mo-media');
          if(!vid.src) return; vid.currentTime = 0;
          vid.play().then(function(){ media.classList.add('playing'); }).catch(function(){});
        }
        function stopCard(card){ card.querySelector('video').pause(); card.querySelector('.mo-media').classList.remove('playing'); }
        function deckInit(){
          roles = deckCards.slice();
          roles.forEach(function(card,i){ setCardMedia(card, itemAt(OFFSET[i]), true); });
          applyRoles(); deckCards.forEach(stopCard); playFront();
        }
        function deckNext(){
          var v = list(); if(!v.length || animLock) return; animLock = true;
          stopCard(roles[3]); slideIndex = mod(slideIndex + 1, v.length);
          var wrap = roles[0]; roles = [roles[1],roles[2],roles[3],roles[4],roles[5],roles[6],wrap];
          setCardMedia(wrap, itemAt(3), true); applyRoles();
          setTimeout(function(){ playFront(); animLock = false; }, 560);
        }
        function deckPrev(){
          var v = list(); if(!v.length || animLock) return; animLock = true;
          stopCard(roles[3]); slideIndex = mod(slideIndex - 1, v.length);
          var wrap = roles[6]; roles = [wrap,roles[0],roles[1],roles[2],roles[3],roles[4],roles[5]];
          setCardMedia(wrap, itemAt(-3), true); applyRoles();
          setTimeout(function(){ playFront(); animLock = false; }, 560);
        }
        $('moNext').addEventListener('click', deckNext);
        $('moPrev').addEventListener('click', deckPrev);
        deckCards.forEach(function(card){
          card.addEventListener('click', function(){
            var i = roles.indexOf(card), v = list(); if(!v.length) return;
            if(i === 4){ deckNext(); return; }
            if(i === 5){ deckNext(); setTimeout(deckNext, 620); return; }
            if(i === 2){ deckPrev(); return; }
            if(i === 1){ deckPrev(); setTimeout(deckPrev, 620); return; }
            if(i === 3){
              if(animLock) return; animLock = true;
              card.classList.add('expanding');
              setTimeout(function(){ openPlayer(v[slideIndex]); card.classList.remove('expanding'); animLock = false; }, 560);
            }
          });
        });

        // grid
        var gridwrap = $('moGridwrap');
        function renderGrid(){
          gridwrap.innerHTML = '';
          var v = list(), items = v.length ? v : [null,null,null,null,null,null];
          for(var i=0;i<items.length;i+=3){
            var row = document.createElement('div'); row.className = 'mo-g-row';
            items.slice(i,i+3).forEach(function(item){
              var card = document.createElement('div');
              card.className = 'mo-g-card mo-gstroke' + (item ? '' : ' empty');
              var media = document.createElement('div'); media.className = 'mo-media'; media.style.position = 'absolute';
              card.appendChild(media);
              if(item){
                var img = document.createElement('img'); img.className = 'mo-thumb'; img.src = thumb(item.n);
                var vd = document.createElement('video'); vd.muted = true; vd.loop = true; vd.playsInline = true; vd.preload = 'none';
                media.appendChild(vd); media.appendChild(img);
                card.addEventListener('mouseenter', function(){ if(!vd.src) vd.src = src(item.n); vd.currentTime = 0; vd.play().then(function(){ media.classList.add('playing'); }).catch(function(){}); });
                card.addEventListener('mouseleave', function(){ vd.pause(); media.classList.remove('playing'); });
                card.addEventListener('click', function(){ openPlayer(item); });
              }
              row.appendChild(card);
            });
            gridwrap.appendChild(row);
          }
        }

        // player
        var pMedia = $('moPmedia'), pTitle = $('moPtitle'), pNote = $('moPnote'), pDesc = $('moPdesc'), pCopy = $('moPcopy');
        var currentDesc = '', currentLink = CHANNEL;
        function renderPlayer(item){
          pMedia.innerHTML = '';
          pTitle.textContent = item.n + '. ' + item.title;
          currentDesc = item.desc; currentLink = videoLink(item);
          pDesc.textContent = item.desc; pCopy.textContent = 'COPY LINK';
          if(item.yt){
            pNote.innerHTML = '';
            var f = document.createElement('iframe');
            f.src = 'https://www.youtube.com/embed/' + item.yt + '?autoplay=1&rel=0';
            f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
            pMedia.appendChild(f);
          } else {
            pNote.innerHTML = 'Full video coming soon on <a href="' + CHANNEL + '" target="_blank" rel="noopener">YouTube</a>. Playing the preview for now.';
            var vd = document.createElement('video'); vd.src = src(item.n); vd.poster = thumb(item.n);
            vd.controls = true; vd.autoplay = true; vd.loop = true; vd.playsInline = true; pMedia.appendChild(vd);
          }
        }
        function openPlayer(item){ renderPlayer(item); show('player'); }
        function playerStep(step){ var v = list(); if(!v.length) return; slideIndex = mod(slideIndex + step, v.length); renderPlayer(v[slideIndex]); }
        $('moPprev').addEventListener('click', function(){ playerStep(-1); });
        $('moPnext').addEventListener('click', function(){ playerStep(1); });
        pCopy.addEventListener('click', function(){
          navigator.clipboard.writeText(currentLink).then(function(){ pCopy.textContent = 'COPIED'; })
            .catch(function(){ pCopy.textContent = 'COPY FAILED'; });
          setTimeout(function(){ pCopy.textContent = 'COPY LINK'; }, 1600);
        });

        // reset to folders whenever the motion tab is (re)entered
        function resetMotion(){ currentFolder = null; deckMode = 'slide'; slideIndex = 0; show('folders'); }

        // Hook into existing desktop tab switching: show layer only when motion active.
        var motionContainer = $('motionContainer');
        var folderBody = document.querySelector('.folder-body');
        function sync(){
          var active = motionContainer && motionContainer.classList.contains('active');
          layer.classList.toggle('visible', !!active);
          if(active){
            if(folderBody) folderBody.classList.remove('visible');
            resetMotion();
          } else {
            pauseAll(views.slide); pauseAll(views.grid); pMedia.innerHTML = '';
          }
        }
        // observe class changes on the motion container
        var mo = new MutationObserver(sync);
        mo.observe(motionContainer, { attributes:true, attributeFilter:['class'] });
        sync();
      })();

      /* ---------------- MOBILE ---------------- */
      (function(){
        var layer = $('moMLayer'); if(!layer) return;
        var views = { folders:$('moMFolders'), slide:$('moMSlide'), grid:$('moMGrid'), player:$('moMPlayer') };
        var sw = $('moMSwitch'), back = $('moMBack');
        var mode = 'grid', currentFolder = null, slideIndex = 0;

        function list(){ return currentFolder === 'edits' ? EDITS_VIDEOS : MOTION_VIDEOS; }
        function pauseAll(root){ if(!root) return; root.querySelectorAll('video').forEach(function(v){ v.pause(); }); root.querySelectorAll('.mo-media.playing').forEach(function(m){ m.classList.remove('playing'); }); }
        function show(name){
          Object.keys(views).forEach(function(k){ views[k].classList.toggle('on', k === name); });
          sw.style.display = (name === 'slide' || name === 'grid') ? 'block' : 'none';
          back.style.display = (name === 'folders') ? 'none' : 'flex';
          if(dotsEl) dotsEl.classList.toggle('show', name === 'grid');
          layer.classList.toggle('gridmode', name === 'grid');
          if(name !== 'slide') pauseAll(views.slide);
          if(name !== 'grid') pauseAll(views.grid);
          if(name !== 'player') pMedia.innerHTML = '';
        }
        layer.querySelectorAll('#moMFolders .mo-m-folder').forEach(function(f){
          f.addEventListener('click', function(){
            if(f.classList.contains('opening')) return;
            f.classList.add('opening');
            setTimeout(function(){
              f.classList.remove('opening');
              currentFolder = f.getAttribute('data-folder'); slideIndex = 0; openMode(mode);
            }, 380);
          });
        });
        function openMode(m){
          mode = m; sw.classList.toggle('slide', m === 'slide'); sw.classList.toggle('grid', m === 'grid');
          layer.classList.toggle('gridmode', m === 'grid');
          if(m === 'slide'){ renderSlide(); show('slide'); } else { renderGrid(); buildDots(); show('grid'); setTimeout(updGridPlay,60); }
        }
        sw.querySelectorAll('.mo-m-vs').forEach(function(b){ b.addEventListener('click', function(){ openMode(b.getAttribute('data-mode')); }); });
        back.addEventListener('click', function(){
          if(views.player.classList.contains('on')){ openMode(mode); return; }
          currentFolder = null; show('folders');
        });

        // fanned stacked deck (mobile), same feel as the product cards
        var mDeckEl = $('moMDeck');
        var mCards = mDeckEl ? [].slice.call(mDeckEl.querySelectorAll('.mo-m-dcard')) : [];
        var MPOS = ['d0','d1','d2','dhide'];      // d0 = front
        var MOFF = [0,1,2,3];
        var mRoles = [];
        var mAnim = false;
        function mSetCard(card, item, instant){
          var media=card.querySelector('.mo-media'), img=card.querySelector('img.mo-thumb'), vid=card.querySelector('video');
          media.classList.remove('playing');
          if(instant) card.style.transition='none';
          if(!item){ img.removeAttribute('src'); vid.removeAttribute('src'); }
          else { img.src=thumb(item.n); if(vid.dataset.n!==String(item.n)){ vid.src=src(item.n); vid.dataset.n=item.n; } }
          if(instant){ void card.offsetWidth; card.style.transition=''; }
        }
        function mItemAt(off){ var v=list(); return v.length? v[mod(slideIndex+off, v.length)] : null; }
        function mApply(){ mRoles.forEach(function(card,i){ MPOS.forEach(function(c){ card.classList.remove(c); }); card.classList.add(MPOS[i]); }); }
        function mPlayFront(){ if(!mRoles.length) return; var f=mRoles[0], vid=f.querySelector('video'), media=f.querySelector('.mo-media'); if(!vid.src) return; vid.currentTime=0; vid.play().then(function(){ media.classList.add('playing'); }).catch(function(){}); }
        function mStop(card){ card.querySelector('video').pause(); card.querySelector('.mo-media').classList.remove('playing'); }
        function renderSlide(){
          if(!mCards.length) return;
          mRoles = mCards.slice();
          mRoles.forEach(function(card,i){ mSetCard(card, mItemAt(MOFF[i]), true); });
          mApply(); mCards.forEach(mStop); mPlayFront();
        }
        function mNext(){
          var v=list(); if(!v.length||mAnim) return; mAnim=true;
          var front=mRoles[0]; mStop(front); front.classList.add('dropping');
          setTimeout(function(){
            slideIndex=mod(slideIndex+1, v.length);
            front.classList.remove('dropping');
            mRoles=[mRoles[1],mRoles[2],mRoles[3],front];
            mSetCard(front, mItemAt(3), true);
            mApply(); mPlayFront(); mAnim=false;
          },420);
        }
        function mPrev(){
          var v=list(); if(!v.length||mAnim) return; mAnim=true;
          slideIndex=mod(slideIndex-1, v.length);
          var back=mRoles[3]; mSetCard(back, mItemAt(0), true);
          mRoles=[back,mRoles[0],mRoles[1],mRoles[2]];
          mApply(); setTimeout(function(){ mPlayFront(); mAnim=false; },420);
        }
        $('moMNext').addEventListener('click', mNext);
        $('moMPrev').addEventListener('click', mPrev);
        mCards.forEach(function(card){
          card.addEventListener('click', function(){
            var i=mRoles.indexOf(card), v=list(); if(!v.length) return;
            if(i===0){ openPlayer(v[mod(slideIndex, v.length)]); }
            else if(i>0){ mNext(); }
          });
        });

        // grid
        var gridwrap = $('moMGridwrap');
        var mGridCards=[];
        function renderGrid(){
          gridwrap.innerHTML = ''; mGridCards=[];
          var v = list(), items = v.length ? v : [null,null,null,null];
          items.forEach(function(item){
            var card = document.createElement('div'); card.className = 'mo-m-gcard mo-gstroke' + (item?'':' empty');
            var media = document.createElement('div'); media.className = 'mo-media'; media.style.position='absolute'; card.appendChild(media);
            if(item){
              var img = document.createElement('img'); img.className='mo-thumb'; img.src = thumb(item.n);
              var vd = document.createElement('video'); vd.muted=true; vd.loop=true; vd.playsInline=true; vd.preload='none';
              media.appendChild(vd); media.appendChild(img);
              var badge=document.createElement('button'); badge.className='mo-m-play';
              badge.innerHTML='<svg viewBox="0 0 12 14"><polygon points="1,1 11,7 1,13"/></svg>';
              media.appendChild(badge);
              card.addEventListener('click', function(){ openPlayer(item); });
              mGridCards.push({card:card, media:media, vid:vd, item:item});
            }
            gridwrap.appendChild(card);
          });
        }
        // autoplay the card nearest the viewport centre, pause the rest
        function updGridPlay(){
          if(!gridScroll || !mGridCards.length) return;
          var mid = gridScroll.scrollTop + gridScroll.clientHeight/2;
          var best=null, bestD=1e9;
          mGridCards.forEach(function(c){
            var cy = c.card.offsetTop + c.card.offsetHeight/2;
            var d = Math.abs(cy - mid);
            if(d<bestD){ bestD=d; best=c; }
          });
          mGridCards.forEach(function(c){
            if(c===best){
              if(!c.vid.src) c.vid.src = src(c.item.n);
              c.vid.play().then(function(){ c.media.classList.add('playing'); }).catch(function(){});
            } else {
              c.vid.pause(); c.media.classList.remove('playing');
            }
          });
        }
        // dots rail (20 dots) tracking scroll position in grid
        var dotsEl=$('moMDots');
        var gridScroll=views.grid.querySelector('.mo-m-grid');
        function buildDots(){
          if(!dotsEl) return;
          var v=list(); dotsEl.innerHTML='';
          v.forEach(function(){ var d=document.createElement('i'); dotsEl.appendChild(d); });
          updDots();
        }
        function updDots(){
          if(!dotsEl||!gridScroll) return;
          var dots=dotsEl.children; if(!dots.length) return;
          var max=gridScroll.scrollHeight-gridScroll.clientHeight;
          var ratio=max>0?gridScroll.scrollTop/max:0;
          var active=Math.round(ratio*(dots.length-1));
          for(var i=0;i<dots.length;i++) dots[i].classList.toggle('on', i===active);
        }
        if(gridScroll){ gridScroll.addEventListener('scroll', updDots, {passive:true}); gridScroll.addEventListener('scroll', updGridPlay, {passive:true}); }

        // player
        var pMedia = $('moMPmedia'), pTitle = $('moMPtitle'), pDesc = $('moMPdesc'), pCopy = $('moMPcopy');
        var currentLink = CHANNEL;
        function renderPlayer(item){
          pMedia.innerHTML = '';
          pTitle.textContent = item.n + '. ' + item.title; pDesc.textContent = item.desc;
          currentLink = videoLink(item); pCopy.textContent = 'COPY LINK';
          if(item.yt){
            var f = document.createElement('iframe');
            f.src = 'https://www.youtube.com/embed/' + item.yt + '?autoplay=1&rel=0&playsinline=1';
            f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; pMedia.appendChild(f);
          } else {
            var vd = document.createElement('video'); vd.src = src(item.n); vd.poster = thumb(item.n);
            vd.controls = true; vd.autoplay = true; vd.loop = true; vd.playsInline = true; pMedia.appendChild(vd);
          }
        }
        function openPlayer(item){ renderPlayer(item); show('player'); }
        pCopy.addEventListener('click', function(){
          navigator.clipboard.writeText(currentLink).then(function(){ pCopy.textContent='COPIED'; }).catch(function(){ pCopy.textContent='COPY FAILED'; });
          setTimeout(function(){ pCopy.textContent='COPY LINK'; }, 1600);
        });

        function resetMotion(){ currentFolder = null; mode = 'grid'; slideIndex = 0; show('folders'); }

        // Hook into existing mobile tab switching: show layer when mMotionC active.
        var mMotion = $('mMotionC');
        function sync(){
          var active = mMotion && mMotion.classList.contains('active');
          layer.classList.toggle('visible', !!active);
          if(active) resetMotion();
          else { pauseAll(views.slide); pauseAll(views.grid); pMedia.innerHTML=''; }
        }
        if(mMotion){
          var mo = new MutationObserver(sync);
          mo.observe(mMotion, { attributes:true, attributeFilter:['class'] });
          sync();
        }
      })();
    })();
    /* ===================== END MOTION TAB ===================== */

