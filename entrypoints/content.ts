import insertIcon from "@/assets/insert.svg";
import genIcon from "@/assets/generate.svg";
import editIcon from "@/assets/edit.svg";
import regenIcon from "@/assets/regenerate.svg";

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  cssInjectionMode: 'ui',

  main(ctx) {
    // Defining Modal UI
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      onMount(container) {
        const htmlModal = `
          <div id="custom-message-modal" style="position: fixed; display: none; inset: 0; background: rgba(0, 0, 0, 0.3); justify-content: center; align-items: center; z-index: 4000;">
            <div id="modal-contents" style="background: #F9FAFB; border-radius: 8px; width: 100%; max-width: 570px; padding: 20px; box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1); box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.1);">
              <div id="messages" style="margin-top: 10px; padding: 5px; display: none; flex-direction: column; max-height: 200px; overflow-y: auto;"></div>
              
              <div style="margin-bottom: 10px; border-radius: 4px;">
                <input id="user-input-text" type="text" placeholder="Your prompt" style="width: 100%; max-width: 552px; border: 1px solid #C1C7D0; border-radius: 4px; box-shadow: 0px 1px 2px 0px #0000000F inset; padding: 8px; background: #FFF;"/>
              </div>

              <div style="text-align: right; margin-top: 12px; display: flex; justify-content: end; align-items: center;">
                <button id="insert-btn" style="cursor: pointer; background: #fff; color: #666D80; padding: 4px 8px; border: 2px solid #666D80; border-radius: 6px; display: none; margin-right: 10px; font-size: 16px;">
                  <div style="display: flex; justify-content: center; align-items: center;">
                    <img src="${insertIcon}" alt="Insert" style="vertical-align: middle; margin-right: 6px; width: 12px; height: 12px;"> 
                    <b style="padding-bottom: 2px">Insert</b>
                  </div>
                </button>
                <button id="generate-btn" style="background: #3B82F6; color: #FFFFFF; padding: 4px 8px; border-radius: 6px; border: 2px solid #3B82F6; cursor: pointer; font-size: 16px; display: inline-block">
                  <div style="display: flex; justify-content: center; align-items: center;">
                    <img src="${genIcon}" alt="Generate" style="vertical-align: middle; margin-right: 6px; width: 16px; height: 16px">
                    <b style="padding-bottom: 2px">Generate</b>
                  </div>
                </button>
                <button id="regenerate-btn" style="background: #3B82F6; color: #FFFFFF; padding: 4px 8px; border: 2px solid #3B82F6; border-radius: 6px; cursor: pointer; font-size: 16px; display: none">
                  <div style="display: flex; justify-content: center; align-items: center;">
                    <img src="${regenIcon}" alt="Generate" style="vertical-align: middle; margin-right: 6px; width: 16px; height: 16px">
                    <b style="padding-bottom: 2px">Regenerate</b>
                  </div>
                </button>
              </div>
            </div>
          </div>
        `;

        // Mount Modal UI inside the container
        const app = document.createElement('div');
        app.innerHTML = htmlModal;
        container.append(app);
      },
    });
    
    // mount Modal UI in the DOM
    ui.mount();

    const modalMain = document.getElementById("custom-message-modal") as HTMLDivElement;
    const modalContent = document.getElementById("modal-contents") as HTMLDivElement;
    const insertBtn = document.getElementById("insert-btn") as HTMLButtonElement;
    const userInputText = document.getElementById("user-input-text") as HTMLInputElement;
    const generateBtn = document.getElementById("generate-btn") as HTMLButtonElement;
    const regenerateBtn = document.getElementById("regenerate-btn") as HTMLButtonElement;
    const messagesDiv = document.getElementById("messages") as HTMLDivElement;

    let parentElement: HTMLElement | null = null;
    let lastGeneratedMessageContent = "";

    // check for focus on message div element and add/remove AI Icon accordingly.
    function checkPageFocus() {
      if (document.hasFocus()) {
        var activeElement = document.activeElement;
        let messageElement = document.querySelector(".msg-form__contenteditable > p")?.parentElement;

        if(activeElement === messageElement) {
          if(!messageElement?.querySelector(".ai-message-icon")) {
            const icon = document.createElement("img");
            icon.className = "ai-message-icon";
            icon.src = editIcon;
            icon.alt = "Custom Icon";
            icon.style.position = "absolute";
            icon.style.bottom = "5px";
            icon.style.right = "5px";
            icon.style.width = "30px";
            icon.style.height = "30px";
            icon.style.cursor = "pointer";
            icon.style.zIndex = "1000";
            messageElement?.appendChild(icon);
  
            icon.addEventListener("click", (e) => {
              e.stopPropagation();
              modalMain.style.display = "flex";
            });
          }

          if(!parentElement) {
            parentElement = messageElement || null;
          }
        } else {
          if(messageElement?.querySelector(".ai-message-icon")) {
            const icon = messageElement?.querySelector(".ai-message-icon") as HTMLBaseElement;
            messageElement.removeChild(icon);
          }
        }
      }
    }
    setInterval(checkPageFocus, 300)

    // Hide modal on clicking outside modal element
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        modalMain &&
        !modalContent.contains(target) &&
        modalMain.style.display === "flex" &&
        !target.classList.contains("ai-message-icon")
      ) {
        modalMain.style.display = "none";
        regenerateBtn.style.display = "none";
        generateBtn.style.display = "inline-block";
        insertBtn.style.display = "none";
      }
    });

    // generate message on button click
    generateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      
      const userInputValue = userInputText.value.trim();
      if(!userInputValue) return;
    
      const userMessageDiv = document.createElement("div");
      userMessageDiv.textContent = userInputValue;
      Object.assign(userMessageDiv.style, {
        color: "#666D80",
        backgroundColor: "#DFE1E7",
        padding: "10px",
        marginBottom: "8px",
        textAlign: "right",
        borderRadius: "8px",
        maxWidth: "80%",
        alignSelf: "flex-end",
        marginLeft: "auto",
      });
      messagesDiv.appendChild(userMessageDiv);
      messagesDiv.style.display = 'flex';
    
      generateBtn.disabled = true;
    
      setTimeout(() => {
        lastGeneratedMessageContent = "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";
        const generatedMessageContainer = document.createElement("div");
        generatedMessageContainer.textContent = lastGeneratedMessageContent;
        Object.assign(generatedMessageContainer.style, {
          color: "#666D80",
          backgroundColor: "#DBEAFE",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "8px",
          textAlign: "left",
          maxWidth: "80%",
          alignSelf: "flex-start",
          marginRight: "auto",
        });

        messagesDiv.appendChild(generatedMessageContainer);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        generateBtn.disabled = false;
        
        // Hide Generate Button and show Regenerate Button
        generateBtn.style.display = "none";
        regenerateBtn.style.display = "inline-block";
        
        userInputText.value = "";
        insertBtn.style.display = "inline-block";
      }, 300);
    });
    
    // Insert message inside Linkedin message box
    insertBtn.addEventListener("click", () => {
      if (lastGeneratedMessageContent && parentElement) {
        const messagePlaholderElement = document.querySelector(".msg-form__placeholder");
        const messageParagraph = document.createElement("p");
        messageParagraph.id = "generated-message-new"
        messageParagraph.textContent = lastGeneratedMessageContent;

        // add message paragraph element to Message input
        parentElement.innerHTML = ``;
        parentElement.appendChild(messageParagraph);
        parentElement.focus();

        // remove Message input placeholder text "Write a message..."
        messagePlaholderElement?.classList.remove("msg-form__placeholder");

        insertBtn.style.display = "none";
        regenerateBtn.style.display = "none";
        generateBtn.style.display = "inline-block";
        modalMain.style.display = "none";
      }
    });
    
  },
});