/* ===================================================================
   admin-chats.js — Communication Interface (Admin ↔ Customer Sync)
   =================================================================== */

let allChats = [];
let activeChatId = null;
let chatPollInterval = null;

function initAdminChatsPage() {
  loadAdminChats();

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

  // Search filter
  const searchInput = document.querySelector('.chat-sidebar .search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = allChats.filter(c =>
        c.guestName.toLowerCase().includes(q) ||
        c.roomNumber.toString().includes(q)
      );
      renderChatList(filtered);
    });
  }

  // Poll for new messages every 3 seconds
  if (chatPollInterval) clearInterval(chatPollInterval);
  chatPollInterval = setInterval(() => {
    const freshChats = getData('stayEasePro_chats', []);
    // Only show admin-type chats (chatType === 'admin' or no chatType for backward compat)
    const adminChats = freshChats.filter(c => c.chatType === 'admin' || !c.chatType);

    // Check if anything changed
    const oldJson = JSON.stringify(allChats.map(c => c.messages.length));
    allChats = adminChats;
    const newJson = JSON.stringify(allChats.map(c => c.messages.length));

    if (oldJson !== newJson) {
      renderChatList(allChats);
      if (activeChatId) {
        renderMessages();
      }
    }
  }, 3000);
}

function loadAdminChats() {
  const freshChats = getData('stayEasePro_chats', []);
  // Only show admin-type chats (chatType === 'admin' or no chatType for backward compat)
  allChats = freshChats.filter(c => c.chatType === 'admin' || !c.chatType);
  renderChatList(allChats);
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

  if (chatsList.length === 0) {
    chatListContainer.innerHTML = '<div class="text-center text-muted" style="padding:var(--admin-space-xl); font-size:0.875rem;">No guest conversations yet.<br>Conversations will appear here when guests message the Front Desk.</div>';
    return;
  }

  chatsList.forEach(chat => {
    const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : { text: 'No messages yet' };
    const unread = chat.messages.filter(m => m.sender === 'customer' && !m.read).length;

    let timeStr = '';
    if (chat.messages.length > 0) {
      const msgDate = new Date(lastMsg.timestamp);
      const now = new Date();
      const diffMs = now - msgDate;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) timeStr = 'Just now';
      else if (diffMins < 60) timeStr = `${diffMins}m ago`;
      else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)}h ago`;
      else timeStr = msgDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

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
          <span style="font-weight:600; font-size:0.875rem;">${chat.guestName}</span>
          <span class="text-muted" style="font-size:0.7rem;">${timeStr}</span>
        </div>
        <div class="d-flex justify-between align-center">
          <p class="text-muted" style="margin:0; font-size:0.8rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px;">${lastMsg.text}</p>
          <span class="admin-badge badge-neutral" style="font-size:0.6rem; padding:2px 6px; white-space:nowrap;">Rm ${chat.roomNumber}</span>
        </div>
      </div>
    `;

    el.addEventListener('click', () => openChat(chat.id));
    chatListContainer.appendChild(el);
  });
}

function openChat(chatId) {
  activeChatId = chatId;
  // Re-read from storage to get latest
  const freshChats = getData('stayEasePro_chats', []);
  allChats = freshChats.filter(c => c.chatType === 'admin' || !c.chatType);

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
    setData('stayEasePro_chats', freshChats);
  }

  // Highlight active in list
  document.querySelectorAll('.chat-list-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === chatId);
  });

  if (updated) renderChatList(allChats);

  // Update header
  const header = document.querySelector('.chat-main-header h4');
  if (header) header.textContent = chat.guestName;

  const subtitle = document.querySelector('.chat-main-header p');
  if (subtitle) subtitle.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:var(--admin-success); display:inline-block;"></span> Room ${chat.roomNumber} &bull; Booking ${chat.bookingId}`;

  // Update info panel
  const guestInfoPanel = document.querySelector('.chat-info-content');
  if (guestInfoPanel) {
    const booking = getData('stayEasePro_bookings', []).find(b => b.id === chat.bookingId);
    guestInfoPanel.innerHTML = `
      <div class="d-flex align-center flex-column mb-lg">
        <div class="chat-avatar mb-md" style="width:64px; height:64px; margin-right:0;">
          <span class="material-symbols-outlined" style="font-size:32px;">person</span>
        </div>
        <h3 style="margin:0;">${chat.guestName}</h3>
        <span class="text-muted" style="font-size:0.8rem;">Room ${chat.roomNumber}</span>
      </div>
      
      <h4 style="margin:0 0 12px 0; border-bottom:1px solid var(--admin-surface-border); padding-bottom:8px; font-size:0.9rem;">Booking Details</h4>
      <div class="d-flex justify-between mb-sm" style="font-size:0.85rem;">
        <span class="text-muted">Booking ID</span> <strong>${chat.bookingId}</strong>
      </div>
      ${booking ? `
      <div class="d-flex justify-between mb-sm" style="font-size:0.85rem;">
        <span class="text-muted">Check-in</span> <strong>${formatDateOnly(booking.checkIn)}</strong>
      </div>
      <div class="d-flex justify-between mb-sm" style="font-size:0.85rem;">
        <span class="text-muted">Check-out</span> <strong>${formatDateOnly(booking.checkOut)}</strong>
      </div>
      <div class="d-flex justify-between mb-sm" style="font-size:0.85rem;">
        <span class="text-muted">Status</span> <span class="admin-badge badge-info">${booking.status}</span>
      </div>
      ` : ''}
      
      <h4 style="margin:16px 0 12px 0; border-bottom:1px solid var(--admin-surface-border); padding-bottom:8px; font-size:0.9rem;">Quick Actions</h4>
      <div class="d-flex flex-column gap-sm">
        <button class="admin-btn admin-btn-outline w-100" style="font-size:0.85rem;"><span class="material-symbols-outlined" style="font-size:16px;">visibility</span> View Booking</button>
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

  if (chat.messages.length === 0) {
    messagesArea.innerHTML = '<div class="chat-empty-state"><span class="material-symbols-outlined">forum</span><p>No messages yet</p></div>';
    return;
  }

  chat.messages.forEach(m => {
    const isCustomer = m.sender === 'customer';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = isCustomer ? 'flex-start' : 'flex-end';

    const div = document.createElement('div');
    div.className = `chat-bubble ${isCustomer ? 'guest' : 'admin'}`;
    div.textContent = m.text;

    const time = document.createElement('div');
    time.style.fontSize = '0.7rem';
    time.style.marginTop = '4px';
    time.style.color = 'var(--admin-text-muted)';
    time.style.textAlign = isCustomer ? 'left' : 'right';
    const msgDate = new Date(m.timestamp);
    time.textContent = msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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

  // Re-read fresh data
  const freshChats = getData('stayEasePro_chats', []);
  const chat = freshChats.find(c => c.id === activeChatId);
  if (!chat || chat.archived) return;

  const newMsg = {
    id: generateId('MSG'),
    sender: 'admin',
    text: text,
    timestamp: new Date().toISOString(),
    read: true
  };

  chat.messages.push(newMsg);
  setData('stayEasePro_chats', freshChats);

  // Update local cache
  allChats = freshChats.filter(c => c.chatType === 'admin' || !c.chatType);

  inputEl.value = '';
  renderMessages();
  renderChatList(allChats);

  showToast('Message sent', 'success');
}
