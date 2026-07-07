/* ===================================================================
   admin-chats.js — Communication Interface
   =================================================================== */

let allChats = [];
let activeChatId = null;

function initAdminChatsPage() {
  allChats = getData('stayEasePro_chats', []);
  renderChatList(allChats);
  
  if (allChats.length > 0) {
    openChat(allChats[0].id);
  }

  const sendBtn = document.querySelector('.chat-input-area .admin-btn-primary');
  const inputEl = document.querySelector('.chat-input-area input');
  
  if (sendBtn && inputEl) {
    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
}

function renderChatList(chatsList) {
  const chatListContainer = document.querySelector('.chat-list');
  if (!chatListContainer) return;

  chatListContainer.innerHTML = '';
  
  // Sort chats by latest message
  chatsList.sort((a, b) => {
    const aLast = a.messages.length ? new Date(a.messages[a.messages.length - 1].timestamp) : new Date(0);
    const bLast = b.messages.length ? new Date(b.messages[b.messages.length - 1].timestamp) : new Date(0);
    return bLast - aLast;
  });

  chatsList.forEach(chat => {
    const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : { text: 'No messages yet' };
    const unread = chat.messages.filter(m => m.sender === 'customer' && !m.read).length;
    const timeStr = chat.messages.length > 0 ? formatAdminDate(lastMsg.timestamp).split(',')[1] : '';

    const el = document.createElement('div');
    el.className = `chat-list-item ${chat.id === activeChatId ? 'active' : ''}`;
    el.dataset.id = chat.id;
    el.innerHTML = `
      <div class="chat-avatar">
        <span class="material-symbols-outlined">person</span>
        ${unread > 0 ? `<div class="chat-badge">${unread}</div>` : ''}
      </div>
      <div class="chat-preview">
        <div class="d-flex justify-between">
          <span style="font-weight:600;">${chat.guestName}</span>
          <span class="text-muted" style="font-size:0.75rem;">${timeStr}</span>
        </div>
        <div class="d-flex justify-between align-center">
          <p class="text-muted" style="margin:0; font-size:0.875rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px;">${lastMsg.text}</p>
          <span class="admin-badge badge-neutral" style="font-size:0.6rem; padding:2px 4px;">Rm ${chat.roomNumber}</span>
        </div>
      </div>
    `;

    el.addEventListener('click', () => openChat(chat.id));
    chatListContainer.appendChild(el);
  });
}

function openChat(chatId) {
  activeChatId = chatId;
  const chat = allChats.find(c => c.id === chatId);
  if (!chat) return;

  // Mark all customer messages as read
  let updated = false;
  chat.messages.forEach(m => {
    if (m.sender === 'customer' && !m.read) {
      m.read = true;
      updated = true;
    }
  });

  if (updated) {
    setData('stayEasePro_chats', allChats);
  }

  // Highlight active in list
  document.querySelectorAll('.chat-list-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === chatId);
  });
  
  // Re-render list to clear badges if any
  if (updated) renderChatList(allChats);

  // Update header
  const header = document.querySelector('.chat-main-header h4');
  if (header) header.textContent = chat.guestName;
  
  const subtitle = document.querySelector('.chat-main-header .text-muted');
  if (subtitle) subtitle.innerHTML = `Room ${chat.roomNumber} &bull; Booking ${chat.bookingId}`;

  // Update info panel
  const guestInfoPanel = document.querySelector('.chat-info-content');
  if (guestInfoPanel) {
    guestInfoPanel.innerHTML = `
      <div class="d-flex align-center flex-column mb-lg">
        <div class="chat-avatar mb-md" style="width:64px; height:64px; margin-right:0;">
          <span class="material-symbols-outlined" style="font-size:32px;">person</span>
        </div>
        <h3 style="margin:0;">${chat.guestName}</h3>
      </div>
      
      <div class="mb-md">
        <p class="text-muted" style="font-size:0.875rem; margin-bottom:4px;">Current Booking</p>
        <p style="margin:0; font-weight:500;">${chat.bookingId}</p>
      </div>
      <div class="mb-md">
        <p class="text-muted" style="font-size:0.875rem; margin-bottom:4px;">Room</p>
        <p style="margin:0; font-weight:500;">${chat.roomNumber}</p>
      </div>
    `;
  }

  renderMessages();
}

function renderMessages() {
  const chat = allChats.find(c => c.id === activeChatId);
  const messagesArea = document.querySelector('.chat-messages');
  if (!messagesArea || !chat) return;

  messagesArea.innerHTML = '';
  
  chat.messages.forEach(m => {
    const isCustomer = m.sender === 'customer';
    const alignClass = isCustomer ? '' : 'admin';
    const bgClass = isCustomer ? 'var(--admin-surface)' : 'var(--admin-primary)';
    const colorClass = isCustomer ? 'var(--admin-text-main)' : '#fff';

    const div = document.createElement('div');
    div.className = `chat-bubble ${alignClass}`;
    div.style.backgroundColor = bgClass;
    div.style.color = colorClass;
    div.textContent = m.text;
    
    const time = document.createElement('div');
    time.className = 'text-muted';
    time.style.fontSize = '0.7rem';
    time.style.marginTop = '4px';
    time.style.textAlign = isCustomer ? 'left' : 'right';
    time.textContent = formatAdminDate(m.timestamp);

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.appendChild(div);
    wrapper.appendChild(time);

    messagesArea.appendChild(wrapper);
  });

  messagesArea.scrollTop = messagesArea.scrollHeight;

  // Handle archived state
  const inputEl = document.querySelector('.chat-input-area input');
  const sendBtn = document.querySelector('.chat-input-area .admin-btn-primary');
  
  if (chat.archived) {
    if (inputEl) {
      inputEl.disabled = true;
      inputEl.placeholder = 'This chat is archived (stay completed).';
    }
    if (sendBtn) sendBtn.disabled = true;
  } else {
    if (inputEl) {
      inputEl.disabled = false;
      inputEl.placeholder = 'Type a message...';
    }
    if (sendBtn) sendBtn.disabled = false;
  }
}

function sendMessage() {
  const inputEl = document.querySelector('.chat-input-area input');
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text) return;

  const chat = allChats.find(c => c.id === activeChatId);
  if (!chat || chat.archived) return;

  const newMsg = {
    id: generateId('MSG'),
    sender: 'admin',
    text: text,
    timestamp: new Date().toISOString(),
    read: true
  };

  chat.messages.push(newMsg);
  setData('stayEasePro_chats', allChats);

  inputEl.value = '';
  renderMessages();
  renderChatList(allChats); // update timestamps
  
  showToast('Message sent', 'success');
}
