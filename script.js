var controller = new ScrollMagic.Controller();

document.querySelectorAll(".project").forEach(function (section) {
  var tween = gsap.to(section, {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: "power2.out"
  });

  new ScrollMagic.Scene({
    triggerElement: section,
    triggerHook: 0.8,
    reverse: false
  })
    .setTween(tween)
    .addTo(controller);
});
