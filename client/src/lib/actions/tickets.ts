
import type { Ticket, Chat, Message, Attachment, CreateTicketMessageClientPayload, UpdateTicketPayload, CreateChatMessageClientPayload, TicketStatus } from '../types';
import { LMS_API_URL } from "@/lib/config";

const API_BASE_URL = LMS_API_URL;
const CONTENT_PROVIDER_URL = 'https://content-provider.pharmacollege.lk';
const QA_API_BASE_URL = LMS_API_URL;

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const headers: HeadersInit = options.headers || {};
    
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new Error(errorData.message ? `${errorData.message} (Status: ${response.status})` : `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(error.message || 'An unknown network error occurred.');
    }
    throw new Error('An unknown error occurred.');
  }
}

interface ApiMessage {
  id: string;
  ticket_id?: string; 
  from_role: 'student' | 'staff'; 
  text: string;
  time: string;
  avatar?: string;
  attachments?: Attachment[];
  img_url?: string;
  read_status?: 'Read' | 'Unread';
  created_by?: string;
}

function mapApiMessageToMessage(apiMsg: ApiMessage): Message {
    let attachments: Attachment[] = [];

    if (apiMsg.img_url) {
        attachments.push({
            type: 'image',
            url: `${CONTENT_PROVIDER_URL}${apiMsg.img_url}`,
            name: apiMsg.img_url.split('/').pop() || 'image.jpg',
        });
    }

    if (Array.isArray(apiMsg.attachments)) {
        attachments = [...attachments, ...apiMsg.attachments];
    }

    return {
        id: String(apiMsg.id),
        from: apiMsg.from_role,
        text: apiMsg.text,
        time: apiMsg.time,
        avatar: apiMsg.avatar,
        attachments: attachments,
        readStatus: apiMsg.read_status,
        createdBy: apiMsg.created_by,
    };
}

interface ApiChat {
    id: string;
    user_name: string;
    user_avatar: string;
    student_number?: string;
    last_message_preview?: string;
    last_message_time?: string;
    unread_count?: number | string;
}

function mapApiChatToChat(apiChat: ApiChat): Chat {
    return {
        id: apiChat.id,
        userName: apiChat.user_name,
        userAvatar: apiChat.user_avatar,
        studentNumber: apiChat.student_number,
        lastMessagePreview: apiChat.last_message_preview,
        lastMessageTime: apiChat.last_message_time,
        unreadCount: typeof apiChat.unread_count === 'string' 
            ? parseInt(apiChat.unread_count, 10) 
            : apiChat.unread_count,
    };
}

function mapApiTicketToTicket(apiTicket: any): Ticket {
    let attachments: Attachment[] = [];
    if (typeof apiTicket.attachments === 'string' && apiTicket.attachments) {
        const attachmentUrls = apiTicket.attachments.split(',');
        attachments = attachmentUrls.map((url: string) => {
            const trimmedUrl = url.trim();
            if (!trimmedUrl) return null;
            return {
                type: 'image',
                url: `${CONTENT_PROVIDER_URL}${trimmedUrl}`,
                name: trimmedUrl.split('/').pop() || 'attachment.jpg'
            };
        }).filter(Boolean) as Attachment[];
    } else if (Array.isArray(apiTicket.attachments)) {
        attachments = apiTicket.attachments;
    }

    return {
        id: apiTicket.id,
        subject: apiTicket.subject,
        description: apiTicket.description,
        priority: apiTicket.priority,
        category: apiTicket.category || 'Other',
        status: apiTicket.status,
        createdAt: apiTicket.created_at,
        updatedAt: apiTicket.updated_at,
        studentNumber: apiTicket.student_number || apiTicket.student_name,
        studentName: apiTicket.student_name, 
        studentAvatar: apiTicket.student_avatar,
        assignedTo: apiTicket.assigned_to,
        assigneeAvatar: apiTicket.assignee_avatar,
        isLocked: apiTicket.is_locked == 1,
        lockedByStaffId: apiTicket.locked_by_staff_id,
        attachments: attachments,
        lastMessagePreview: apiTicket.last_message_preview,
        rating: apiTicket.rating_value || apiTicket.rating,
    };
}

function mapTicketToApiPayload(ticketData: Partial<Ticket>): any {
    const apiPayload: { [key: string]: any } = {};
    if (ticketData.subject !== undefined) apiPayload.subject = ticketData.subject;
    if (ticketData.description !== undefined) apiPayload.description = ticketData.description;
    if (ticketData.priority !== undefined) apiPayload.priority = ticketData.priority;
    if (ticketData.category !== undefined) apiPayload.category = ticketData.category;
    if (ticketData.status !== undefined) apiPayload.status = ticketData.status;
    if (ticketData.studentNumber !== undefined) apiPayload.student_number = ticketData.studentNumber;
    if (ticketData.studentName !== undefined) apiPayload.student_name = ticketData.studentName;
    if (ticketData.studentAvatar !== undefined) apiPayload.student_avatar = ticketData.studentAvatar;
    if (ticketData.assignedTo !== undefined) apiPayload.assigned_to = ticketData.assignedTo;
    if (ticketData.assigneeAvatar !== undefined) apiPayload.assignee_avatar = ticketData.assigneeAvatar;
    if (ticketData.isLocked !== undefined) apiPayload.is_locked = ticketData.isLocked ? 1 : 0;
    if (ticketData.lockedByStaffId !== undefined) apiPayload.locked_by_staff_id = ticketData.lockedByStaffId;
    
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      apiPayload.attachments = JSON.stringify(ticketData.attachments.map(att => ({
        type: att.type,
        name: att.name,
        url: att.url,
      })));
    }

    return apiPayload;
}

// Tickets
export const getTickets = async (studentNumber: string): Promise<Ticket[]> => {
    const endpoint = `/tickets/username/${studentNumber}`;
    const apiResult = await apiFetch<any>(endpoint);
    if (!apiResult) return [];

    const apiTickets = Array.isArray(apiResult) ? apiResult : [apiResult];
    
    return apiTickets.map(mapApiTicketToTicket);
};
export const getAdminTickets = async (): Promise<Ticket[]> => {
    const endpoint = `/tickets`;
    const apiTickets = await apiFetch<any[]>(endpoint);
    if (!apiTickets) return [];
    return apiTickets.map(mapApiTicketToTicket);
}
export const getTicket = async (id: string): Promise<Ticket> => {
    const apiTicket = await apiFetch<any>(`/tickets/${id}`);
    return mapApiTicketToTicket(apiTicket);
};
export const getTicketMessages = async (ticketId: string): Promise<Message[]> => {
    const apiMessages = await apiFetch<ApiMessage[]>(`/ticket-messages/by-ticket/${ticketId}`);
    if (!apiMessages) return [];
    return apiMessages.map(mapApiMessageToMessage);
};

export const sendTicketCreatedSms = async (payload: {
    mobile: string;
    studentName?: string;
    studentNumber: string;
    ticketId: string | number;
    subject: string;
}): Promise<any> => {
    let { mobile, studentName, studentNumber, ticketId, subject } = payload;
    let formattedMobile = mobile.replace(/[^0-9]/g, "");
    if (formattedMobile.startsWith("94") && formattedMobile.length === 11) {
        formattedMobile = "0" + formattedMobile.slice(2);
    } else if (formattedMobile.length === 9 && !formattedMobile.startsWith("0")) {
        formattedMobile = "0" + formattedMobile;
    }

    const namePart = studentName ? `Dear ${studentName},\n\n` : `Dear Student,\n\n`;
    const message = `${namePart}A support ticket has been created for your inquiry regarding "${subject}".\nTicket No: #${ticketId}\nIndex: ${studentNumber}\n\nOur team is reviewing it and will update you shortly.\n\nCeylon Pharma College`;

    const response = await fetch(`${QA_API_BASE_URL}/send-sms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mobile: formattedMobile,
            senderId: 'Pharma C.',
            message
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `SMS sending failed with status ${response.status}` }));
        throw new Error(errorData.message || 'SMS sending failed');
    }

    return response.json();
};

export const sendTicketResolvedSms = async (payload: {
    mobile: string;
    studentName?: string;
    studentNumber: string;
    ticketId: string | number;
    subject: string;
}): Promise<any> => {
    let { mobile, studentName, studentNumber, ticketId, subject } = payload;
    let formattedMobile = mobile.replace(/[^0-9]/g, "");
    if (formattedMobile.startsWith("94") && formattedMobile.length === 11) {
        formattedMobile = "0" + formattedMobile.slice(2);
    } else if (formattedMobile.length === 9 && !formattedMobile.startsWith("0")) {
        formattedMobile = "0" + formattedMobile;
    }

    const namePart = studentName ? `Dear ${studentName},\n\n` : `Dear Student,\n\n`;
    const message = `${namePart}Your support inquiry regarding "${subject}" has been marked as RESOLVED.\nTicket No: #${ticketId}\nIndex: ${studentNumber}\n\nThank you for reaching out to Ceylon Pharma College!\nwww.pharmacollege.lk`;

    const response = await fetch(`${QA_API_BASE_URL}/send-sms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mobile: formattedMobile,
            senderId: 'Pharma C.',
            message
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `SMS sending failed with status ${response.status}` }));
        throw new Error(errorData.message || 'SMS sending failed');
    }

    return response.json();
};

export const createTicket = async (ticketFormData: FormData): Promise<Ticket> => {
    const response = await apiFetch<{ message: string, ticket: any }>('/tickets', {
        method: 'POST',
        body: ticketFormData
    });
    return mapApiTicketToTicket(response.ticket);
};

export const updateTicket = async (ticketData: UpdateTicketPayload): Promise<Ticket> => {
    const apiPayload = mapTicketToApiPayload(ticketData);
    const updatedApiTicket = await apiFetch<any>(`/tickets/${ticketData.id}`, { method: 'POST', body: JSON.stringify(apiPayload) });
    return mapApiTicketToTicket(updatedApiTicket);
};

export const updateTicketRating = async (ticketId: string, rating: number): Promise<{ message: string, ticket: { id: string } }> => {
    const response = await apiFetch<{ message: string; ticket: { id: string } }>(`/tickets/update-rating/${ticketId}`, {
        method: 'POST',
        body: JSON.stringify({ rating_value: rating }),
    });
    return response;
};

export const assignTicket = async (ticketId: string, assignedTo: string, assigneeAvatar: string, lockedByStaffId: string): Promise<Ticket> => {
  const apiPayload = {
    assigned_to: assignedTo,
    assignee_avatar: assigneeAvatar,
    is_locked: 1, 
    locked_by_staff_id: lockedByStaffId,
  };
  const updatedApiTicket = await apiFetch<any>(`/tickets/${ticketId}/assign`, {
    method: 'POST',
    body: JSON.stringify(apiPayload),
  });
  return mapApiTicketToTicket(updatedApiTicket);
};

export const updateTicketStatus = async (ticketId: string, newStatus: TicketStatus): Promise<Ticket> => {
    const response = await apiFetch<{ message: string; ticket: any }>(`/tickets/${ticketId}/status/`, {
        method: 'POST',
        body: JSON.stringify({ newStatus: newStatus }),
    });
    return mapApiTicketToTicket(response.ticket);
}

export const markTicketMessagesAsRead = async (messageIds: string[]): Promise<any> => {
    if (messageIds.length === 0) {
        return Promise.resolve({ success: true, message: 'No messages to mark as read.' });
    }
    const promises = messageIds.map(id => 
        apiFetch(`/ticket-messages/update-read-status/${id}/`, { 
            method: 'PUT',
            body: JSON.stringify({ read_status: "Read" })
        })
    );
    return Promise.all(promises);
};

export const getUnreadMessageCount = async (ticketId: string, fromRole: 'student' | 'staff'): Promise<number> => {
    const payload = {
        read_status: 'Unread',
        from_role: fromRole,
    };
    const response = await apiFetch<ApiMessage[]>(`/ticket-messages/get-unread-messages/${ticketId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return response.length;
};

export const createTicketMessage = async (
  arg1: CreateTicketMessageClientPayload | string | number,
  arg2: CreateTicketMessageClientPayload | string | number
): Promise<Message> => {
  let messageData: CreateTicketMessageClientPayload;
  let ticketId: string;

  if (typeof arg1 === 'object' && arg1 !== null) {
    messageData = arg1 as CreateTicketMessageClientPayload;
    ticketId = String(arg2);
  } else {
    ticketId = String(arg1);
    messageData = arg2 as CreateTicketMessageClientPayload;
  }

  const formData = new FormData();
  formData.append('ticket_id', ticketId);
  formData.append('from_role', messageData.from || 'staff');
  formData.append('text', messageData.text || '');
  formData.append('time', new Date().toISOString());
  if (messageData.createdBy) {
    formData.append('created_by', messageData.createdBy);
  }

  if (messageData.attachments && messageData.attachments.length > 0) {
    const attachmentMetadata = messageData.attachments.map(att => ({
        type: att.type,
        name: att.name,
    }));
    formData.append('attachments_meta', JSON.stringify(attachmentMetadata));

    messageData.attachments.forEach(att => {
        if (att.file) {
            formData.append('attachments[]', att.file, att.name);
        }
    });
  }

  const newApiMessage = await apiFetch<ApiMessage>(`/ticket-messages`, { 
    method: 'POST', 
    body: formData 
  });
  
  return mapApiMessageToMessage(newApiMessage);
};

// Chats
export const getChats = async (studentNumber: string): Promise<Chat[]> => {
    const endpoint = `/chats/username/${studentNumber}`;
    try {
        const apiResult = await apiFetch<ApiChat[] | ApiChat>(endpoint);
        if (!apiResult) {
            return [];
        }
        const apiChats = Array.isArray(apiResult) ? apiResult : [apiResult];
        
        const studentChat = apiChats.filter(chat => chat.student_number === studentNumber || chat.user_name === studentNumber);
        return studentChat.map(mapApiChatToChat);

    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
            return [];
        }
        throw error;
    }
};

export const getAdminChats = async (): Promise<Chat[]> => {
    const endpoint = '/chats';
    const apiChats = await apiFetch<ApiChat[]>(endpoint);
    if (!apiChats) return [];
    return apiChats.map(mapApiChatToChat);
};

export const getChat = async (id: string): Promise<Chat> => {
    const apiChat = await apiFetch<ApiChat>(`/chats/${id}`);
    return mapApiChatToChat(apiChat);
};

export const createChat = async (studentInfo: { studentNumber: string, studentAvatar: string }): Promise<Chat> => {
    const apiPayload = {
        student_number: studentInfo.studentNumber,
        user_name: studentInfo.studentNumber,
        user_avatar: studentInfo.studentAvatar
    };
    const apiChat = await apiFetch<ApiChat>('/chats', { 
        method: 'POST',
        body: JSON.stringify(apiPayload),
    });
    return mapApiChatToChat(apiChat);
};

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
    const apiMessages = await apiFetch<ApiMessage[]>(`/chat-messages/by-chat/${chatId}`);
    if (!apiMessages) return [];
    return apiMessages.map(mapApiMessageToMessage);
};

export const createChatMessage = (messageData: CreateChatMessageClientPayload): Promise<Message> => {
  const apiPayload = {
    chat_id: messageData.chatId,
    from_role: messageData.from,
    text: messageData.text,
    time: new Date().toISOString(),
    attachment_type: messageData.attachments?.[0]?.type || null,
    attachment_name: messageData.attachments?.[0]?.name || null,
    attachment_url: null, 
  };
  return apiFetch('/chat-messages', { method: 'POST', body: JSON.stringify(apiPayload) });
};

export const unlockTicket = async (ticketId: string): Promise<Ticket> => {
    const updatedApiTicket = await apiFetch<any>(`/tickets/${ticketId}/unlock`, {
        method: 'POST',
    });
    return mapApiTicketToTicket(updatedApiTicket);
}
