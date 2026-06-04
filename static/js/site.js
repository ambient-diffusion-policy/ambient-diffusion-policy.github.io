(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      navToggle.textContent = open ? "Close" : "Menu";
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        navToggle.textContent = "Menu";
      });
    });
  }

  const progress = document.querySelector(".read-progress span");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const topbar = document.querySelector(".topbar");

  const anchorOffset = () => {
    const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
    return topbarHeight + 22;
  };

  const scrollToHashTarget = (hash, behavior = "smooth") => {
    if (!hash || hash === "#") return false;
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return false;

    const top = target.getBoundingClientRect().top + window.scrollY - anchorOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
    window.setTimeout(queueScrollState, behavior === "smooth" ? 260 : 40);
    return true;
  };

  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.width = `${amount * 100}%`;
  };

  const updateActiveNav = () => {
    if (!navLinks.length || !sections.length) return;
    const probe = window.scrollY + Math.min(window.innerHeight * 0.5, 520);
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= probe) {
        currentId = section.dataset.section || section.id;
      }
    });

    navLinks.forEach((link) => {
      const target = link.getAttribute("href").slice(1);
      const active = target === currentId;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let scrollQueued = false;
  const queueScrollState = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      updateProgress();
      updateActiveNav();
    });
  };

  updateProgress();
  updateActiveNav();
  window.addEventListener("scroll", queueScrollState, { passive: true });
  window.addEventListener("resize", queueScrollState);
  window.addEventListener("hashchange", () => {
    window.setTimeout(() => {
      scrollToHashTarget(window.location.hash, "auto");
      queueScrollState();
    }, 80);
  });

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      history.pushState(null, "", hash);
      scrollToHashTarget(hash);
    });
  });

  window.addEventListener("load", () => {
    if (!window.location.hash) return;
    [0, 250, 900].forEach((delay) => {
      window.setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), delay);
    });
  });

  document.querySelectorAll(".video-card").forEach((card) => {
    const video = card.querySelector("video");
    const buttons = Array.from(card.querySelectorAll("[data-speed]"));
    if (!video || buttons.length === 0) return;

    const setSpeed = (button, play) => {
      const speed = Number(button.dataset.speed) || 1;
      video.defaultPlaybackRate = speed;
      video.playbackRate = speed;

      buttons.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("active", active);
        candidate.setAttribute("aria-pressed", String(active));
      });

      if (play) {
        video.play().catch(() => {});
      }
    };

    const defaultButton = buttons.find((button) => button.classList.contains("active")) || buttons[0];
    setSpeed(defaultButton, false);

    buttons.forEach((button) => {
      button.addEventListener("click", () => setSpeed(button, true));
    });
  });

  const videos = Array.from(document.querySelectorAll(".video-card video"));

  if ("IntersectionObserver" in window && videos.length > 0) {
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

  const expandableFigures = Array.from(document.querySelectorAll(".wide-figure img, .result-card img"));

  if (expandableFigures.length > 0) {
    const lightbox = document.createElement("div");
    lightbox.className = "figure-lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Expanded figure");
    lightbox.innerHTML = `
      <div class="figure-lightbox-panel" role="document">
        <button class="figure-lightbox-close" type="button" aria-label="Close expanded figure">X</button>
        <div class="figure-lightbox-viewport">
          <img class="figure-lightbox-image" alt="">
        </div>
        <p class="figure-lightbox-caption"></p>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector(".figure-lightbox-image");
    const lightboxCaption = lightbox.querySelector(".figure-lightbox-caption");
    const closeButton = lightbox.querySelector(".figure-lightbox-close");
    let activeTrigger = null;

    const figureCaptionFor = (image) => {
      if (image.dataset.fullCaption) {
        return image.dataset.fullCaption.trim();
      }

      const figure = image.closest("figure");
      const figcaption = figure ? figure.querySelector("figcaption") : null;
      const card = image.closest(".result-card");
      const cardTitle = card ? card.querySelector("h3") : null;
      return (figcaption && figcaption.textContent.trim()) || (cardTitle && cardTitle.textContent.trim()) || image.alt || "";
    };

    const closeLightbox = () => {
      if (lightbox.hidden) return;
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
      lightboxCaption.textContent = "";

      if (activeTrigger) {
        activeTrigger.focus({ preventScroll: true });
        activeTrigger = null;
      }
    };

    const openLightbox = (image) => {
      const aspectRatio = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
      activeTrigger = image;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "";
      lightboxImage.classList.toggle("is-wide", aspectRatio > 1.5);
      lightboxCaption.textContent = figureCaptionFor(image);
      lightboxCaption.hidden = lightboxCaption.textContent.length === 0;
      lightbox.classList.toggle("has-long-caption", lightboxCaption.textContent.length > 520);
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      closeButton.focus({ preventScroll: true });
    };

    expandableFigures.forEach((image) => {
      image.classList.add("expandable-figure");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `View larger: ${image.alt || "figure"}`);

      image.addEventListener("click", () => openLightbox(image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    closeButton.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    });
  }
})();
