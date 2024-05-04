function shuffle(arr) {
  const out = []
  for (const item of arr.slice()) {
    const index = Math.floor(Math.random() * arr.length)
    out.push(arr[index])
    arr.splice(index, 1)
  }
  return out
}

const submissions = document.getElementById("submissions")
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
    const counter = document.getElementById("selection-counter")
    const list = document.getElementById("submission-list")
    const ready = document.getElementById("ready")
    const submit = document.getElementById("submit")
    for (const [i, image] of images.entries()) {
      const div = document.createElement("div")
      div.dataset.id = image.id
      div.className = "submission panel"
      div.innerHTML = `
        <img src="${image.src}"></div>
        <div src="${image.src}" class="icon popupable" title="Fullscreen">fullscreen</div>
      `
      list.append(div)
      div.addEventListener("click", e => {
        if (e.target.classList.contains("icon")) return
        if (div.classList.contains("selected")) {
          div.classList.remove("selected")
          list.classList.remove("finished")
          submit.disabled = true
        } else {
          if(list.classList.contains("finished")) return
          div.classList.add("selected")
          if (list.querySelectorAll(".selected").length >= Math.ceil(images.length * 0.2)) {
            list.classList.add("finished")
            submit.disabled = !ready.checked
          }
        }
        counter.textContent = list.querySelectorAll(".selected").length
      })
    }
    ready.addEventListener("change", e => submit.disabled = !(ready.checked && list.querySelectorAll(".selected").length === Math.ceil(images.length * 0.2)))
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
  document.getElementById("vote-start").classList.add("hidden")
  loadVoting()
} else {
  const list = document.getElementById("submission-results-list")
  if (list) {
    function numSuffix(i) {
      const j = i % 10
      const k = i % 100
      if (j === 1 && k !== 11) return i + "st"
      if (j === 2 && k !== 12) return i + "nd"
      if (j === 3 && k !== 13) return i + "rd"
      return i + "th"
    }
    function position() {
      let top = 0
      const gap = window.innerWidth < 768 ? 12 : 20
      for (const [i, child] of Array.from(list.children).entries()) {
        child.style.top = top + "px"
        child.children[0].textContent = numSuffix(i + 1)
        top += child.clientHeight + gap
      }
      list.style.height = top - gap + "px"
    }
    position()
    window.addEventListener("resize", position)
    list.querySelectorAll("img").forEach(e => e.addEventListener("load", position))
    const totalVotes = document.getElementById("total-votes")
    const ws = new WebSocket(`ws${location.protocol === "http:" ? "" : "s"}://${location.host}/websocket`)
    ws.onmessage = ev => {
      const data = JSON.parse(ev.data)
      if (data.type === "votes") {
        console.log(data)
        const arr = Array.from(list.children)
        const submissions = []
        let changes
        for (const vote of data.votes) {
          const element = arr.find(e => e.dataset.id == vote.id)
          const voteCount = element.querySelector(".submission-votes")
          if (voteCount.textContent.split(" ")[0] != vote.votes) {
            changes = true
            voteCount.textContent = `${vote.votes.toLocaleString()} Vote${vote.votes === 1 ? "" : "s"}`
            voteCount.classList.add("votes-changed")
            setTimeout(() => voteCount.classList.remove("votes-changed"), 0)
          }
          submissions.push([vote.votes, element])
        }
        if (changes) {
          totalVotes.textContent = data.votes.reduce((a, e) => a + e.votes, 0).toLocaleString()
          totalVotes.classList.add("votes-changed")
          setTimeout(() => totalVotes.classList.remove("votes-changed"), 0)
          const sorted = submissions.sort((a, b) => b[0] - a[0])
          list.innerHTML = ""
          for (const item of sorted) {
            list.append(item[1])
          }
          setTimeout(position, 10)
        }
      }
    }
  }
}