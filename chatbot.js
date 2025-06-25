/**
 * Embeddable Chatbot Script
 * Version: 1.0.0
 *
 * A beautiful popup chatbot interface that can be integrated into any website.
 * Simply include this script in your HTML to add the chatbot functionality.
 */

(function() {
    // Create and inject required styles if not already present
    if (!document.getElementById('chatbot-icons-style')) {
        const iconStyle = document.createElement('link');
        iconStyle.id = 'chatbot-icons-style';
        iconStyle.rel = 'stylesheet';
        iconStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        document.head.appendChild(iconStyle);
    }

    // Constants
    const BOT_NAME = 'FPTAssist';
    const USER_NAME = 'Bạn';

    // Get or generate a session ID
    function getSessionId() {
        let sessionId = localStorage.getItem('chatbot_session_id');

        if (!sessionId) {
            // Generate a random session ID if not exists
            sessionId = 'session_' + Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);
            localStorage.setItem('chatbot_session_id', sessionId);
        }

        return sessionId;
    }

    // Create chatbot HTML structure
    function createChatbotHTML() {
        const chatbotContainer = document.createElement('div');
        chatbotContainer.className = 'chatbot-container';

        // Chat bubble button
        const chatBubble = document.createElement('div');
        chatBubble.className = 'chat-bubble';
        chatBubble.innerHTML = '<i class="chat-bubble-icon fas fa-comment"></i>';

        // Chat window
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chat-window';

        // Chat header
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        chatHeader.innerHTML = `
            <div class="chat-header-title">
                <h3>${BOT_NAME}</h3>
            </div>
            <button class="close-chat"><i class="fas fa-chevron-down"></i></button>
        `;

        // Chat messages container
        const chatMessages = document.createElement('div');
        chatMessages.className = 'chat-messages';

        // Typing indicator - create it but don't append it yet
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        typingIndicator.style.display = 'none';

        // Chat input
        const chatInputContainer = document.createElement('div');
        chatInputContainer.className = 'chat-input-container';
        chatInputContainer.innerHTML = `
            <input type="text" class="chat-input" placeholder="Nhập tin nhắn của bạn...">
            <button class="send-button"><i class="fas fa-paper-plane"></i></button>
        `;

        // Assemble the chat window
        chatWindow.appendChild(chatHeader);
        chatWindow.appendChild(chatMessages);
        chatWindow.appendChild(chatInputContainer);

        // Add all elements to the container
        chatbotContainer.appendChild(chatWindow);
        chatbotContainer.appendChild(chatBubble);

        // Add the container to the body
        document.body.appendChild(chatbotContainer);

        return {
            container: chatbotContainer,
            bubble: chatBubble,
            window: chatWindow,
            messages: chatMessages,
            input: chatInputContainer.querySelector('.chat-input'),
            sendButton: chatInputContainer.querySelector('.send-button'),
            closeButton: chatHeader.querySelector('.close-chat'),
            typingIndicator: typingIndicator
        };
    }

    // Initialize the chatbot
    function initChatbot() {
        const chatbot = createChatbotHTML();

        // Initial welcome message
        setTimeout(() => {
            addMessage("Xin chào! 👋 Tôi có thể giúp gì cho bạn hôm nay?", 'bot');
        }, 500);

        // Toggle chat window visibility and hide chat bubble
        chatbot.bubble.addEventListener('click', () => {
            chatbot.window.style.display = 'flex';
            chatbot.bubble.style.display = 'none';
            chatbot.input.focus();
        });

        // Close chat window and show chat bubble
        chatbot.closeButton.addEventListener('click', () => {
            // Add closing animation
            chatbot.window.classList.add('closing');

            // Wait for animation to complete before hiding
            setTimeout(() => {
                chatbot.window.style.display = 'none';
                chatbot.bubble.style.display = 'flex';
                // Remove the closing class for next open
                chatbot.window.classList.remove('closing');
            }, 300); // Match animation duration (0.3s = 300ms)
        });

        // Send message when clicking send button
        chatbot.sendButton.addEventListener('click', () => {
            sendMessage(chatbot);
        });

        // Send message when pressing Enter
        chatbot.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(chatbot);
            }
        });

        return chatbot;
    }

    // Send a message
    function sendMessage(chatbot) {
        const messageText = chatbot.input.value.trim();

        if (messageText) {
            // Add user message
            addMessage(messageText, 'user');

            // Clear input
            chatbot.input.value = '';

            // Add and show typing indicator at the bottom of messages
            chatbot.messages.appendChild(chatbot.typingIndicator);
            chatbot.typingIndicator.style.display = 'flex';
            chatbot.messages.scrollTop = chatbot.messages.scrollHeight;

            // Send request to the API
            fetchBotResponse(chatbot, messageText);
        }
    }

    // Add a message to the chat
    function addMessage(text, sender) {
        const chatbot = window.activeChatbot;

        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${sender}-container`;

        // Name setup
        const name = sender === 'bot' ? BOT_NAME : USER_NAME;

        // Format links in text if any
        const formattedText = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" style="color:inherit;text-decoration:underline;">$1</a>'
        ).replace(/\n/g, '<br>'); // Convert newlines to HTML line breaks

        // Get current time
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' +
                         now.getMinutes().toString().padStart(2, '0');

        // Construct message HTML
        messageContainer.innerHTML = `
            <div class="message-content">
                <div class="message-name ${sender}-name">${name}</div>
                <div class="message-bubble ${sender}-message">
                    ${formattedText}
                    <div class="message-time">${timeString}</div>
                </div>
            </div>
        `;

        chatbot.messages.appendChild(messageContainer);
        chatbot.messages.scrollTop = chatbot.messages.scrollHeight;
    }

    // Fetch response from the API
    async function fetchBotResponse(chatbot, userMessage) {
        try {
            const sessionId = getSessionId();

            const response = await fetch('https://n8n.ragassist.online/webhook/rag-assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatInput: userMessage,
                    sessionId: sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Hide typing indicator
            chatbot.typingIndicator.style.display = 'none';

            // Add bot response
            addMessage(data.output || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn vào lúc này.", 'bot');

        } catch (error) {
            console.error('Error fetching bot response:', error);

            // Hide typing indicator
            chatbot.typingIndicator.style.display = 'none';

            // Add error message
            addMessage("Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.", 'bot');
        }
    }

    // Initialize the chatbot and store reference
    window.activeChatbot = initChatbot();
})();
