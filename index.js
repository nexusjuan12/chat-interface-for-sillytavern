import { getContext } from "../../../../public/scripts/extensions.js"; // Corrected path
import { eventSource, event_types } from "../../../../public/scripts/script.js"; // Corrected path

class SimplifiedChatInterface {
    constructor() {
        this.context = getContext();
        this.visible = false;
        this.addToggleButton();
        this.initializeUI();
        this.setupEventListeners();
    }

    addToggleButton() {
        // Add a button to the top navigation
        const nav = document.querySelector('#top-nav');
        if (nav) {
            this.toggleButton = document.createElement('div');
            this.toggleButton.className = 'nav-toggle';
            this.toggleButton.innerHTML = `
                <div id="toggle-simplified" 
                     class="nav-item" 
                     title="Toggle Simplified Interface">
                    <div class="nav-item-icon">🔄</div>
                    <span>Simple Mode</span>
                </div>
            `;
            nav.appendChild(this.toggleButton);
            
            // Add click handler
            this.toggleButton.querySelector('#toggle-simplified')
                .addEventListener('click', () => this.toggleInterface());
        }
    }

    initializeUI() {
        // Create the container but don't show it yet
        this.container = document.createElement('div');
        this.container.className = 'simplified-chat-container';
        this.container.style.display = 'none';  // Hidden by default
        
        // Add the HTML content
        this.container.innerHTML = `
            <div class="chat-header">
                <h1>Simplified Chat</h1>
            </div>
            
            <div class="messages-container" id="messages">
                <!-- Messages will be inserted here dynamically -->
            </div>
            
            <div class="input-container">
                <textarea id="chat-input" placeholder="Type your message..."></textarea>
                <button id="send-button">Send</button>
            </div>
        `;
        
        document.body.appendChild(this.container);

        // Cache DOM elements
        this.messagesContainer = this.container.querySelector('#messages');
        this.input = this.container.querySelector('#chat-input');
        this.sendButton = this.container.querySelector('#send-button');
        
        // Get the main ST interface elements
        this.mainInterface = document.querySelector('#main');
    }

    toggleInterface() {
        this.visible = !this.visible;
        
        // Toggle visibility of interfaces
        if (this.visible) {
            // Hide main ST interface
            if (this.mainInterface) this.mainInterface.style.display = 'none';
            // Show our interface
            this.container.style.display = 'flex';
            // Update button
            this.toggleButton.querySelector('#toggle-simplified').classList.add('active');
        } else {
            // Show main ST interface
            if (this.mainInterface) this.mainInterface.style.display = 'block';
            // Hide our interface
            this.container.style.display = 'none';
            // Update button
            this.toggleButton.querySelector('#toggle-simplified').classList.remove('active');
        }
    }

    setupEventListeners() {
        // Listen for incoming messages
        eventSource.on(event_types.MESSAGE_RECEIVED, (data) => this.handleIncomingMessage(data));

        // Send button click
        this.sendButton.addEventListener('click', () => this.handleSendMessage());

        // Enter key press (with shift+enter for new line)
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 150) + 'px';
        });
    }

    async handleSendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToUI(message, 'user');
        
        // Clear input and reset height
        this.input.value = '';
        this.input.style.height = 'auto';
        
        try {
            // Use SillyTavern's context to send the message
            await this.context.sendMessage(message);
        } catch (error) {
            console.error('Failed to send message:', error);
            this.addMessageToUI('Failed to send message. Please try again.', 'system');
        }
    }

    handleIncomingMessage(data) {
        this.addMessageToUI(data.message, 'assistant');
    }

    addMessageToUI(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = text;
        
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize the extension
window.addEventListener('load', () => {
    new SimplifiedChatInterface();
});
