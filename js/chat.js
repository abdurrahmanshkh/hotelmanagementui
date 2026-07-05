/* ===================================================================
   chat.js — Customer-Admin Chat Simulation
   =================================================================== */

const ADMIN_REPLIES = {
  clean:    "We have received your cleaning request. Housekeeping will be there shortly.",
  wifi:     "Our team will check the Wi-Fi issue shortly. Try restarting the router in your room.",
  towel:    "Extra towels will be sent to your room within 10 minutes.",
  food:     "Our staff will assist you with food ordering. Check the in-room menu card.",
  passcode: "Please check your booking details page for your current passcode status.",
  checkout: "Late check-out can be arranged subject to availability. We'll confirm shortly.",
  default:  "Thank you for contacting support. We will assist you shortly."
};

function getAdminReply(text) {
  const t = text.toLowerCase();
  if (t.includes('clean'))       return ADMIN_REPLIES.clean;
  if (t.includes('wifi') || t.includes('wi-fi') || t.includes('internet')) return ADMIN_REPLIES.wifi;
  if (t.includes('towel'))       return ADMIN_REPLIES.towel;
  if (t.includes('food') || t.includes('order') || t.includes('menu'))    return ADMIN_REPLIES.food;
  if (t.includes('passcode') || t.includes('key') || t.includes('code'))  return ADMIN_REPLIES.passcode;
  if (t.includes('checkout') || t.includes('check-out') || t.includes('late')) return ADMIN_REPLIES.checkout;
  return ADMIN_REPLIES.default;
}

function initChat() {
  const chatWindow = document.getElementById('chatMessages');
  if (!chatWindow) return;
  if (!requireAuth()) return;

  const user = getCurrentUser();
  refreshPasscodeStatuses();

  // Determine which booking to chat about
  const bookingId = sessionStorage.getItem('stayEasePro_chatBooking')
    || getData('stayEasePro_bookings', [])
        .filter(b => b.userId === user.id && (b.status === 'Checked In' || b.status === 'Confirmed'))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.id;

  if (!bookingId) {
    showToast('You need an active booking to use chat.', 'warning');
    return;
  }

  const booking = findById('stayEasePro_bookings', bookingId);
  if (!booking) return;

  // Set context panel
  const el = id => document.getElementById(id);
  if (el('chatRoomInfo'))    el('chatRoomInfo').textContent = `${booking.roomType} Room ${booking.roomNumber}`;
  if (el('chatGuestName'))   el('chatGuestName').textContent = booking.guestName;
  if (el('chatBookingId'))   el('chatBookingId').textContent = booking.id;
  if (el('chatBookingDates'))el('chatBookingDates').textContent = `${formatDateOnly(booking.checkIn)} – ${formatDateOnly(booking.checkOut)}`;

  // Load or create chat thread
  let chats = getData('stayEasePro_chats', []);
  let chat = chats.find(c => c.bookingId === bookingId && c.userId === user.id);
  if (!chat) {
    chat = {
      id: generateId('CHAT'), userId: user.id, bookingId: bookingId,
      roomNumber: booking.roomNumber, guestName: booking.guestName,
      archived: false,
      messages: [
        { id: 'MSG-AUTO', sender: 'admin', text: `Hello ${user.fullName.split(' ')[0]}! Welcome to StayEase Pro. How can we help you today?`, timestamp: new Date().toISOString(), read: true }
      ]
    };
    addItem('stayEasePro_chats', chat);
  }

  // Check if read-only (completed booking)
  const isReadOnly = booking.status === 'Completed' || booking.status === 'Cancelled';
  const inputArea = document.getElementById('chatInputArea');
  if (isReadOnly && inputArea) {
    inputArea.innerHTML = '<p class="text-muted text-center p-md" style="font-size:0.85rem;">This stay is completed. Chat is read-only.</p>';
  }

  renderChatMessages(chat.id);

  // Send message
  document.getElementById('chatSendBtn')?.addEventListener('click', () => sendChatMessage(chat.id));
  document.getElementById('chatInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(chat.id); }
  });

  // Quick suggestion chips
  document.querySelectorAll('.chat-suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('chatInput');
      if (input) { input.value = chip.textContent; sendChatMessage(chat.id); }
    });
  });
}

function renderChatMessages(chatId) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const chat = findById('stayEasePro_chats', chatId);
  if (!chat) return;

  container.innerHTML = chat.messages.map(m => `
    <div class="chat-bubble ${m.sender === 'customer' ? 'chat-customer' : 'chat-admin'}">
      ${m.text}
      <span class="chat-timestamp">${new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}${m.sender === 'customer' ? ' ✓✓' : ''}</span>
    </div>`).join('');

  container.scrollTop = container.scrollHeight;
}

function sendChatMessage(chatId) {
  const input = document.getElementById('chatInput');
  const text = input?.value?.trim();
  if (!text) { showToast('Cannot send empty message.', 'warning'); return; }
  if (text.length > 500) { showToast('Message too long (max 500 chars).', 'warning'); return; }

  const msg = {
    id: generateId('MSG'), sender: 'customer', text,
    timestamp: new Date().toISOString(), read: true
  };

  // Add message
  const chats = getData('stayEasePro_chats', []);
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  chat.messages.push(msg);
  setData('stayEasePro_chats', chats);

  input.value = '';
  renderChatMessages(chatId);

  // Simulate admin typing & reply
  const container = document.getElementById('chatMessages');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-bubble chat-admin text-muted';
  typingEl.style.cssText = 'width:60px;text-align:center;font-size:0.85rem;';
  typingEl.textContent = '...';
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typingEl.remove();
    const adminMsg = {
      id: generateId('MSG'), sender: 'admin', text: getAdminReply(text),
      timestamp: new Date().toISOString(), read: true
    };
    chat.messages.push(adminMsg);
    setData('stayEasePro_chats', chats);
    renderChatMessages(chatId);

    // Notification for admin reply
    const user = getCurrentUser();
    if (user) {
      addItem('stayEasePro_notifications', {
        id: generateId('NTF'), userId: user.id, type: 'chat',
        message: 'New reply from Front Desk.', read: false,
        createdAt: new Date().toISOString(), relatedId: chatId
      });
    }
  }, 1500);
}
