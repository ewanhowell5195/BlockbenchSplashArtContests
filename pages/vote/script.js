function shuffle(arr) {
  const out = []
  for (const item of arr.slice()) {
    const index = Math.floor(Math.random() * arr.length)
    out.push(arr[index])
    arr.splice(index, 1)
  }
  return out
}

function isBefore(el1, el2) {
  let cur
  if (el2.parentNode === el1.parentNode) {
    for (cur = el1.previousSibling; cur; cur = cur.previousSibling) {
      if (cur === el2) return true
    }
  }
  return false
}

function numSuffix(i) {
  const j = i % 10
  const k = i % 100
  if (j === 1 && k !== 11) return i + "st"
  if (j === 2 && k !== 12) return i + "nd"
  if (j === 3 && k !== 13) return i + "rd"
  return i + "th"
}

function position(ignoreVoted) {
  let top = 0
  for (const [i, child] of Array.from(list.children).entries()) {
    child.style.top = top + "px"
    child.children[0].textContent = numSuffix(i + 1)
    if (!ignoreVoted) {
      if (i + 1 <= Math.ceil(list.children.length * 0.2)) {
        child.querySelector(".your-vote").classList.remove("hidden")
      } else {
        child.querySelector(".your-vote").classList.add("hidden")
      }
    }
    top += child.clientHeight + 20
  }
  list.style.height = top - 20 + "px"
}

const submissions = document.getElementById("submissions")
const list = document.getElementById("submission-list")
if (submissions) {
  const images = shuffle(Array.from(submissions.content.children).map(e => ({ id: e.dataset.id, src: e.src })))
  const preview = document.getElementById("submission-preview")
  document.getElementById("start").addEventListener("click", e => {
    document.getElementById("vote-start").classList.add("hidden")
    let currentIndex = 0
    const back = preview.querySelector("button:first-child")
    const next = preview.querySelector("button:last-child")
    const img = preview.querySelector("img")
    const spinner = preview.querySelector("svg")
    const progress = document.getElementById("submission-progress")
    let loading
    let first = true
    function showPreviewImage() {
      loading = true
      if (!first) preview.classList.add("loading-fade")
      setTimeout(async () => {
        if (currentIndex === images.length) {
          loadVoting()
        } else {
          first = false
          img.src = images[currentIndex].src
          preview.style.backgroundImage = `linear-gradient(#000C, #000C), url('${img.src}')`
          const timeout = setTimeout(() => spinner.classList.add("visible"), 500)
          await img.decode()
          if (currentIndex <= 0) {
            back.classList.add("hidden")
          } else {
            back.classList.remove("hidden")
          }
          if (currentIndex >= images.length - 1) {
            next.textContent = "Vote"
          } else {
            next.textContent = "Next"
          }
          progress.textContent = currentIndex + 1
          clearTimeout(timeout)
          spinner.classList.remove("visible")
          preview.classList.remove("loading-fade")
          setTimeout(() => loading = false, 500)
        }
      }, first ? 0 : 500)
    }
    back.addEventListener("click", e => {
      if (loading) return
      currentIndex--
      showPreviewImage()
    })
    next.addEventListener("click", e => {
      if (loading) return
      currentIndex++
      showPreviewImage()
    })
    showPreviewImage()
    preview.classList.remove("hidden")
  })
  function loadVoting() {
    let processing, selected
    preview.classList.add("hidden")
    document.getElementById("submission-voting").classList.remove("hidden")
    for (const [i, image] of images.entries()) {
      const div = document.createElement("div")
      div.dataset.id = image.id
      div.className = "panel"
      div.draggable = true
      div.style.backgroundImage = `linear-gradient(90deg, var(--color-panel), #0004), linear-gradient(90deg, var(--color-panel), transparent), url('${image.src}')`
      div.innerHTML = `
        <div>${numSuffix(i + 1)}</div>
        <img src="${image.src}" class="popupable"></div>
        <div class="submission-info">
          <div class="your-vote">
            <span class="icon">check_circle</span>
            <span>Your vote</span>
          </div>
        </div>
        <div class="spacer"></div>
        <div class="position-controls">
          <div class="move-up icon">expand_less</div>
          <div class="move-down icon">expand_more</div>
        </div>
        <div class="icon">drag_indicator</div>
      `
      list.append(div)
    }
    window.addEventListener("resize", () => position())
    list.querySelectorAll("img").forEach(e => e.addEventListener("load", () => position()))
    list.querySelectorAll(".move-up").forEach(e => e.addEventListener("click", evt => {
      processing = true
      e.parentNode.parentNode.classList.add("sliding")
      e.parentNode.parentNode.parentNode.insertBefore(e.parentNode.parentNode, e.parentNode.parentNode.previousElementSibling)
      setTimeout(() => position(), 10)
      setTimeout(() => {
        e.parentNode.parentNode.classList.remove("sliding")
        processing = false
      }, 260)
    }))
    list.querySelectorAll(".move-down").forEach(e => e.addEventListener("click", evt => {
      processing = true
      e.parentNode.parentNode.classList.add("sliding")
      e.parentNode.parentNode.parentNode.insertBefore(e.parentNode.parentNode.nextElementSibling, e.parentNode.parentNode)
      setTimeout(() => position(), 10)
      setTimeout(() => {
        e.parentNode.parentNode.classList.remove("sliding")
        processing = false
      }, 260)
    }))
    document.addEventListener("dragover", e => e.preventDefault())
    document.addEventListener("dragenter", e => e.preventDefault())
    list.querySelectorAll(".panel").forEach(e => {
      e.addEventListener("dragstart", evt => {
        event.dataTransfer.setDragImage(new Image(), 0, 0)
        evt.dataTransfer.effectAllowed = "move"
        evt.dataTransfer.setData("text/plain", null)
        selected = evt.currentTarget
        selected.classList.add("selected")
      })
      e.addEventListener("dragover", evt => {
        if (processing) return
        evt.dataTransfer.dropEffect = "grabbing"
        if (isBefore(selected, evt.currentTarget)) {
          processing = true
          evt.currentTarget.parentNode.insertBefore(selected, evt.currentTarget)
          setTimeout(() => position(), 10)
          setTimeout(() => processing = false, 260)
        } else if (isBefore(evt.currentTarget, selected)) {
          processing = true
          evt.currentTarget.parentNode.insertBefore(selected, evt.currentTarget.nextSibling)
          setTimeout(() => position(), 10)
          setTimeout(() => processing = false, 260)
        }
      })
      e.addEventListener("dragend", evt => {
        selected.classList.remove("selected")
        selected = null
      })
    })
    const submit = document.getElementById("submit")
    document.getElementById("ready").addEventListener("change", e => submit.disabled = !submit.disabled)
    submit.addEventListener("click", async e => {
      if (submit.classList.contains("loading")) return
      if (confirm("Are you sure you want to submit your votes? Votes cannot be recast.")) {
        submit.classList.add("loading")
        const r = await fetch("/api/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            votes: Array.from(list.children).map(e => Number(e.dataset.id))
          })
        })
        location.reload()
      }
    })
  }
} else {
  position(true)
  window.addEventListener("resize", () => position(true))
  list.querySelectorAll("img").forEach(e => e.addEventListener("load", () => position(true)))
  const ws = new WebSocket(`ws${location.protocol === "http:" ? "" : "s"}://${location.host}/websocket`)
  ws.onmessage = ev => {
    const data = JSON.parse(ev.data)
    if (data.type === "votes") {
      const arr = Array.from(list.children)
      const submissions = []
      let changes
      for (const vote of data.votes) {
        const element = arr.find(e => e.dataset.id == vote.id)
        const voteCount = element.querySelector(".submission-votes")
        if (voteCount.textContent.split(" ")[0] != vote.votes) {
          changes = true
          voteCount.textContent = `${vote.votes} Vote${vote.votes === 1 ? "" : "s"}`
          voteCount.classList.add("votes-changed")
          setTimeout(() => {
            voteCount.classList.remove("votes-changed")
          }, 0)
        }
        submissions.push([vote.votes, element])
      }
      if (changes) {
        const sorted = submissions.sort((a, b) => b[0] - a[0])
        list.innerHTML = ""
        for (const item of sorted) {
          list.append(item[1])
        }
        setTimeout(() => position(true), 10)
      }
    }
  }
}