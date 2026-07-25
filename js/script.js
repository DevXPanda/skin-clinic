// ===== Mobile nav toggle =====
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
navToggle?.addEventListener("click", () => {
  nav.classList.toggle("open");
  navToggle.classList.toggle("active");
});
nav
  ?.querySelectorAll(".nav__link")
  .forEach((link) =>
    link.addEventListener("click", () => nav.classList.remove("open")),
  );

// ===== Header shadow on scroll =====
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
});

// ===== FAQ accordion =====
document.querySelectorAll(".acc__q").forEach((q) => {
  q.addEventListener("click", () => {
    const acc = q.parentElement;
    const answer = acc.querySelector(".acc__a");
    const isOpen = acc.classList.contains("open");
    document.querySelectorAll(".acc").forEach((a) => {
      a.classList.remove("open");
      a.querySelector(".acc__a").style.maxHeight = null;
    });
    if (!isOpen) {
      acc.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// ===== Gallery filter chips (visual toggle) =====
document.querySelectorAll(".gallery__filters .chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll(".gallery__filters .chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const label = chip.textContent.trim().toLowerCase();
    document.querySelectorAll(".gtile").forEach((t) => {
      const cat = (t.dataset.cat || "").toLowerCase();
      t.style.display =
        label === "all" || cat.includes(label) || label.includes(cat)
          ? ""
          : "none";
    });
  });
});

// ===== Scroll reveal =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("in");
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".section").forEach((s) => {
  s.classList.add("reveal");
  io.observe(s);
});

// ===== Enquiry form → Google Sheets (Apps Script) =====
// Paste your deployed Apps Script Web App URL here (see SETUP.md).
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyFwF65y-cwmjVscMVxMsNrvZENME4F-dmveiC80dcAciSXuNdvrNm5tbOvIEIqmsU46Q/exec";
const form = document.getElementById("enquiryForm");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const mobile = form.mobile.value.trim();
  const email = form.email.value.trim();

  if (!name) return showError("Please enter your full name.");
  if (!/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, "").slice(-10))) {
    return showError("Please enter a valid 10-digit mobile number.");
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return showError("Please enter a valid email address.");
  }

  const btn = form.querySelector('button[type="submit"]');
  const note = document.getElementById("formNote");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Sending…";

  const payload = new FormData(form);
  payload.append("source", "Website — Contact Form");

  try {
    if (APPS_SCRIPT_URL.startsWith("http")) {
      await fetch(APPS_SCRIPT_URL, { method: "POST", body: payload });
    } else {
      console.warn("APPS_SCRIPT_URL not configured — submission not sent.");
    }

    note.hidden = false;
    note.textContent =
      "✓ Thank you! Your appointment request has been received. We will contact you shortly.";
    note.style.color = "";
    form.reset();
    btn.textContent = "Submitted ✓";
  } catch (err) {
    console.error(err);
    note.hidden = false;
    note.textContent =
      "⚠ Could not submit. Please call us on 0120-4552014 or WhatsApp +91-92177 54696.";
    note.style.color = "#b23b3b";
    btn.textContent = original;
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = original;
      note.hidden = true;
    }, 6000);
  }

  function showError(msg) {
    const n = document.getElementById("formNote");
    n.hidden = false;
    n.textContent = "⚠ " + msg;
    n.style.color = "#b23b3b";
    setTimeout(() => {
      n.hidden = true;
    }, 4000);
  }
});
//read more//
// ===== Blog cards collapsible =====
document.querySelectorAll(".bcard__toggle").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // taaki document click turant na chal jaye
    const card = btn.closest(".bcard");
    const content = card.querySelector(".bcard__content");
    const isOpen = content.classList.contains("open");

    // pehle sab band kar
    document.querySelectorAll(".bcard__content.open").forEach((c) => {
      c.classList.remove("open");
      c.previousElementSibling.textContent = "Read More →";
    });

    // agar ye already open nahi tha, toh khol
    if (!isOpen) {
      content.classList.add("open");
      btn.textContent = "Read Less ↑";
    }
  });
});

// Kahin bhi (card ke bahar) click karne pe collapse
document.addEventListener("click", (e) => {
  if (!e.target.closest(".bcard")) {
    document.querySelectorAll(".bcard__content.open").forEach((c) => {
      c.classList.remove("open");
      c.previousElementSibling.textContent = "Read More →";
    });
  }
});
// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();
