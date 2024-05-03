class FileInput extends HTMLElement {
  #files = []
  #pasteHandler

  constructor() {
    super()
    setTimeout(() => {
      const accept = this.getAttribute("accept") ?? ""
      const types = accept.split(", ").filter(e => e)
      const multiple = this.getAttribute("multiple")
      const fileLimit = parseInt(this.getAttribute("limit"))
      const style = document.createElement("style")
      style.innerHTML = `
        :host {
          background-color: var(--color-background);
          border-radius: 14px;
          border: var(--panel-border);
        }

        .file-drop {
          padding: 20px;
          user-select: none;
          position: relative;
          text-shadow: none;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-start;

          &.active .file-drop-button::before {
            filter: brightness(1.15);
          }

          &:active .file-drop-button::before {
            filter: brightness(.9);
          }
        }

        .file-drop-button {
          font-size: 1rem;
          text-transform: uppercase;
          font-weight: 600;
          padding: 12px 16px;
          letter-spacing: .5px;
          position: relative;
          z-index: 1;
          align-items: center;
          gap: 10px;
          line-height: 1.375rem;
          color: var(--color-text);
          display: flex;
          align-items: center;
          text-shadow: 0 2px 3px #000, 0 -1px 3px #0004;
          text-wrap: nowrap;

          & svg {
            filter: drop-shadow(0 2px 1.5px #000) drop-shadow(0 -1px 1.5px #0004);
            fill: var(--color-text);
            width: 22px;
            height: 22px;
          }

          &::before {
            content: "";
            position: absolute;
            inset: 0;
            background-color: var(--color-accent);
            transition: filter .15s;
            border-radius: 8px;
            z-index: -1;
          }
        }

        .file-drop-row {
          display: flex;
          align-items: center;
          gap: 20px;
          max-width: 100%;
        }

        .file-drop-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-drop-input {
          position: absolute;
          inset: 0;
          cursor: pointer;
          opacity: 0;
          z-index: 1;
          border-radius: 50px;
        }

        .file-drop-hidden {
          display: none !important;
        }

        .file-drop-images {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          overflow-x: auto;
          position: relative;
          z-index: 1;
          margin-bottom: -10px;
          max-width: 100%;

          > div {
            display: flex;
            flex-direction: column;
            font-size: 0.8rem;
            color: var(--color-text-subtle);
            align-items: center;
            gap: 4px;
          }

          & img {
            height: 192px;
            border-radius: 8px;
            background-image: var(--transparency);
          }
        }

        @media screen and (width < 768px) {
          .file-drop {
            padding: 12px;
            gap: 12px;
          }

          .file-drop-row {
            gap: 12px;
          }

          .file-drop-button {
            font-size: .9rem;
            padding: 9px 12px;
            letter-spacing: .3px;
            gap: 6px;

            & svg {
              width: 18px;
              height: 18px;
            }
          }

          .file-drop-images {
            margin-bottom: -6px;

            & img {
              height: 128px;
            }
          }
        }
      `
      const fileDrop = document.createElement("div")
      fileDrop.classList.add("file-drop")
      fileDrop.innerHTML = `
        <div class="file-drop-row">
          <span class="file-drop-button">
            <svg viewBox="0 0 24 24"><path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" /></svg>
            <span>Choose file${multiple ? "s" : ""}</span>
          </span>
          <span class="file-drop-text">or drag and drop ${fileLimit ? `up to ${fileLimit}` : ""} ${multiple ? "files" : "a file"} here</span>
          <input class="file-drop-input" type="file" accept="${accept}">
        </div>
        <div class="file-drop-images file-drop-hidden"></div>
      `
      const textContainer = fileDrop.querySelector(".file-drop-text")
      const fileDropInput = fileDrop.querySelector(".file-drop-input")
      const imageContainer = fileDrop.querySelector(".file-drop-images")
      this.attachShadow({mode: "open"}).append(style, fileDrop)
  
      if (multiple) fileDropInput.setAttribute("multiple", true)
  
      function activeClass(state) {
        if (state) fileDrop.classList.add("active")
        else fileDrop.classList.remove("active")
      }
      
      ["dragenter", "focus", "click", "mouseenter"].forEach(e => fileDropInput.addEventListener(e, () => activeClass(true)));
      ["dragleave", "blur", "drop", "mouseleave"].forEach(e => fileDropInput.addEventListener(e, () => activeClass(false)))
  
      const fileChange = async input => {
        if (input.files.length === 1) textContainer.textContent = input.files[0].name.split("\\").pop()
        else if (input.files.length === 0) textContainer.textContent = `or drag and drop ${fileLimit ? `up to ${fileLimit}` : ""} ${multiple ? "files" : "a file"} here`
        else textContainer.textContent = `${input.files.length} files selected`
        const images = this.#files.filter(e => e.type.startsWith("image/"))
        imageContainer.innerHTML = ""
        imageContainer.classList.add("file-drop-hidden")
        if (images.length) {
          for (const image of images) {
            const reader = new FileReader()
            reader.onload = e => {
              const img = new Image()
              img.onload = e => {
                const div = document.createElement("div")
                div.innerHTML = `
                  <img src="${reader.result}">
                  <div>${img.width.toLocaleString()}x${img.height.toLocaleString()} - ${formatBytes(image.size)}</div>
                `
                imageContainer.append(div)
                imageContainer.classList.remove("file-drop-hidden")
              }
              img.src = reader.result
            }
            reader.readAsDataURL(image)
          }
        }
        input.dispatchEvent(new Event("change"))
      }

      this.addEventListener("drop", evt => {
        evt.preventDefault()
        let files = Array.from(evt.dataTransfer.items).filter(e => e.kind === "file").map(e => e.getAsFile()).slice(0, !multiple ? 1 : fileLimit || Infinity)
        if (files.length) {
          if (types.length) {
            files = files.filter(e => types.includes(e.type))
            if (!files.length) {
              textContainer.textContent = `Unsupported format. Must be of: ${accept}`
              return
            }
          }
          this.#files = files
          fileChange(this)
        }
      })
  
      this.addEventListener("dragover", evt => {
        evt.preventDefault()
      })
  
      fileDropInput.addEventListener("change", e => {
        if (e.currentTarget.files.length) {
          this.#files = Array.from(e.currentTarget.files).slice(0, fileLimit || Infinity)
          fileChange(this)
        }
      })

      this.#pasteHandler = e => {
        this.#files = Array.from(e.clipboardData.files)
        if (!this.#files.length) return
        fileChange(this)
      }
    }, 0)
  }

  connectedCallback() {
    setTimeout(() => {
      window.addEventListener("paste", this.#pasteHandler)
    }, 0)
  }

  disconnectedCallback() {
    window.removeEventListener("paste", this.#pasteHandler)
  }

  get files() {
    return this.#files
  }
}

const sizes = ["B", "KB", "MB", "GB", "TB"]

function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + " " + sizes[i]
}

customElements.define("file-input", FileInput)