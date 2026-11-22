// Optional progressive enhancement, separate from navigation and form controls.
if(window.gsap&&window.ScrollTrigger){
  const {gsap,ScrollTrigger}=window;
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.mg-site').forEach(site=>{
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion:no-preference)',()=>{
      site.querySelectorAll('[data-reveal]').forEach(el=>gsap.fromTo(el,{y:14},{y:0,ease:'none',scrollTrigger:{trigger:el,start:'top 96%',end:'top 67%',scrub:1.1}}));
      site.querySelectorAll('.photo-reveal').forEach(el=>gsap.fromTo(el,{y:25},{y:0,ease:'none',scrollTrigger:{trigger:el,start:'top 96%',end:'top 56%',scrub:1.2}}));
    });
    const refresh=()=>requestAnimationFrame(()=>ScrollTrigger.refresh());
    document.fonts.ready.then(refresh);window.addEventListener('load',refresh,{once:true});window.addEventListener('pageshow',refresh);
    let height=site.offsetHeight;
    const observer=new ResizeObserver(()=>{if(Math.abs(site.offsetHeight-height)>2){height=site.offsetHeight;refresh();}});
    observer.observe(site);
    window.addEventListener('pagehide',event=>{if(!event.persisted){observer.disconnect();media.revert();}},{once:true});
  });
}
