const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector(".chat-header"); 
const closepop = document.querySelector(".chatbot-popup");


// Ensure this exists in your HTML

// API Key and URL for the bot (Replace the API Key with your own key)
const API_KEY = "AIzaSyCtMHrYSGSJDCFQBh5FkAlr0jTPDX1T_i0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

// Function to create a new message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Function to generate the bot's response from the API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Prepare the body of the request
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
            }]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const apiResponseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remove any markdown **bold**
            .trim();
        messageElement.innerText = apiResponseText;

        // Handle API error if any
        if (data.error) {
            throw new Error(data.error.message);
        }
    } catch (error) {
        console.log('Error:', error);
        messageElement.innerText = "Sorry, something went wrong!";
    } finally {
        userData.file = {};  // Reset file data after response
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
    }
};

// Function to handle outgoing messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();

    if (!userData.message && !userData.file.data) return; // Don't send empty messages

    // Clear the input field
    messageInput.value = '';
    fileUploadWrapper.classList.remove("file-uploaded");

    // Create and add user message to the chat body
    const messageContent = `
        <div class="message-text">${userData.message}</div>
        ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>` : ""}
    `;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });

    // Add bot's thinking indicator and simulate bot response
    const botMessageContent = `
        <svg class="chatbot-avatar" width="50px" height="50px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 119.35">
            <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/>
        </svg>
        <div class="message-text">
            <div class="thinking-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;

    const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });

    // Simulate bot response after a short delay
    setTimeout(() => {
        generateBotResponse(incomingMessageDiv);
    }, 1000); // You can adjust this delay as needed
};

// Event listener for sending a message on pressing Enter
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === 'Enter' && userMessage) {
        handleOutgoingMessage(e);
    }
});

// Event listener for file input change
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");

        const base64String = e.target.result.split(",")[1];
        userData.file = {
            data: base64String,
            mime_type: file.type
        };
        fileInput.value = ''; // Reset file input after reading
    };
    reader.readAsDataURL(file);
});

fileCancelButton.addEventListener("click", () => {
    userData.file = {}; // Reset file data
    fileUploadWrapper.classList.remove("file-uploaded");
});

// Trigger file input when file upload button is clicked
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

// Event listener for sending a message by clicking the send button
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));

// Event listener for toggling the chatbot visibility
chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot");
    closeChatbot.classList.add('open-chat');
    closepop.classList.add('openpop');

});
 

// Close chatbot functionality
closeChatbot.addEventListener("click", () => {
    if (closeChatbot.classList.contains('close-chat')) {
        closeChatbot.classList.add('open-chat');
        closeChatbot.classList.remove('close-chat');
        closepop.classList.add('closepop');
        closepop.classList.remove('openpop');
        
    } else {
        closeChatbot.classList.remove('open-chat');
        closeChatbot.classList.add('close-chat');
        closepop.classList.remove('closepop');
        closepop.classList.add('openpop');
    }
});

    $(document).ready(function() {
        var counterStarted = false; // Flag to prevent re-triggering the animation
        var countElements = $('.counter_num'); // Select all counter number elements

        // Function to check if an element is in the viewport
        function isElementInView(el) {
            var rect = el.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }

        // Run when scrolling happens
        $(window).on('scroll', function() {
            var counterSection = $('.counter'); // Select the counter section

            // If the counter section is in the viewport and the counter hasn't started yet
            if (isElementInView(counterSection[0]) && !counterStarted) {
                counterStarted = true; // Start the counter animation

                // Loop through each counter element and animate its value
                countElements.each(function() {
                    var $this = $(this);
                    var targetValue = parseInt($this.text()); // Get the target value (e.g., 90)

                    // Animate the counter
                    $({ countNum: 0 }).animate({ countNum: targetValue }, {
                        duration: 2000, // Duration of the animation (2 seconds)
                        easing: 'linear', // Animation easing
                        step: function() {
                            $this.text(Math.floor(this.countNum)); // Update the number as it increments
                        },
                        complete: function() {
                            $this.text(this.countNum); // Ensure it reaches the final number
                        }
                    });
                });
            }
        });
    });
