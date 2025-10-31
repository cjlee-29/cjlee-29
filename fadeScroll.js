const sections = document.querySelectorAll(".section");

function fadeInOnScroll() {
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
      section.classList.add("visible");
    } else {
      section.classList.remove("visible");
    }
  });
}

window.addEventListener("scroll", fadeInOnScroll);
window.addEventListener("load", fadeInOnScroll);
