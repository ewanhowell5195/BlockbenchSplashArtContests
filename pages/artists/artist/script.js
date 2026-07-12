const submissions = document.getElementById("submissions")
const items = Array.from(submissions.children)
const rowHeight = 8

function layout() {
  const gap = window.innerWidth < 768 ? 12 : 20
  submissions.classList.add("masonry")
  for (const item of items) {
    const img = item.querySelector("img")
    if (!img.naturalWidth) continue
    const width = item.getBoundingClientRect().width
    const height = width * img.naturalHeight / img.naturalWidth
    item.style.gridRow = `span ${Math.max(1, Math.round((height + gap) / rowHeight))}`
    item.style.marginBottom = gap + "px"
  }
}

for (const img of submissions.querySelectorAll("img")) {
  if (!img.complete) img.addEventListener("load", layout)
}

let resizeFrame
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(layout)
})

layout()