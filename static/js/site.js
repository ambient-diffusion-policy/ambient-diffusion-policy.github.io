(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const walkVisual = document.getElementById("walk-visual");
  const walkCards = Array.from(document.querySelectorAll(".walk-card"));

  if (walkVisual && walkCards.length) {
    const setStep = (step) => {
      walkVisual.classList.remove("step-0", "step-1", "step-2", "step-3");
      walkVisual.classList.add(`step-${step}`);
      walkCards.forEach((card) => {
        card.classList.toggle("active", card.dataset.step === String(step));
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setStep(visible.target.dataset.step || "0");
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: "-18% 0px -35% 0px" }
    );

    walkCards.forEach((card) => observer.observe(card));
    setStep(0);
  }

  document.querySelectorAll(".video-card").forEach((card) => {
    const video = card.querySelector("video");
    const buttons = Array.from(card.querySelectorAll(".speed-controls button"));
    if (!video) return;

    const setSpeed = (button) => {
      const speed = Number(button.dataset.speed) || 1;
      video.defaultPlaybackRate = speed;
      video.playbackRate = speed;
      buttons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      video.play().catch(() => {});
    };

    const defaultButton = buttons.find((button) => button.classList.contains("active")) || buttons[0];
    if (defaultButton) setSpeed(defaultButton);

    buttons.forEach((button) => {
      button.addEventListener("click", () => setSpeed(button));
    });

    video.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  });

  const videos = Array.from(document.querySelectorAll("video"));
  if ("IntersectionObserver" in window && videos.length) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );

    videos.forEach((video) => videoObserver.observe(video));
  }
})();
