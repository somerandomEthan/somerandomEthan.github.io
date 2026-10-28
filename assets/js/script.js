'use strict';



/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}



/**
 * toggle navbar
 */

const navbar = document.querySelector("[data-navbar]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const navToggler = document.querySelector("[data-nav-toggler]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggler.classList.toggle("active");
}

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
}

addEventOnElem(navLinks, "click", closeNavbar);



/**
 * header active
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
});


/**
 * gallery lightbox
 */

const lightbox = document.querySelector("[data-lightbox]");
const galleryCards = document.querySelectorAll(".gallery-card");

if (lightbox && galleryCards.length && typeof lightbox.showModal === "function") {
  const lightboxImg = lightbox.querySelector("[data-lightbox-img]");
  const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
  let current = 0;

  const showPhoto = function (index) {
    current = (index + galleryCards.length) % galleryCards.length;
    const card = galleryCards[current];
    const img = card.querySelector(".gallery-img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = card.querySelector(".gallery-title").textContent + " \u2014 " + card.querySelector(".gallery-text").textContent;
  }

  galleryCards.forEach(function (card, i) {
    card.querySelector(".gallery-open").addEventListener("click", function () {
      showPhoto(i);
      lightbox.showModal();
    });
  });

  lightbox.querySelector("[data-lightbox-close]").addEventListener("click", function () { lightbox.close(); });
  lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", function () { showPhoto(current - 1); });
  lightbox.querySelector("[data-lightbox-next]").addEventListener("click", function () { showPhoto(current + 1); });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") showPhoto(current - 1);
    if (event.key === "ArrowRight") showPhoto(current + 1);
  });
}
