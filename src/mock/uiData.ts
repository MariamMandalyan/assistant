import type { ChatMessage, CitizenTicket, Department } from '../api/types';

export const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', code: 'housing', name: 'ЖКХ и благоустройство' },
  { id: '2', code: 'docs', name: 'Документы и справки' },
  { id: '3', code: 'social', name: 'Социальная помощь' },
];

export const MOCK_TICKETS: CitizenTicket[] = [
  {
    id: 't1',
    subject: 'Нет горячей воды',
    description: 'В подъезде 3 нет горячей воды уже 2 дня.',
    status: 'in_progress',
    priority: 'normal',
    referenceCode: 'TK-2026-0142',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    department: MOCK_DEPARTMENTS[0],
    messages: [
      {
        id: 'm1',
        content: 'Принято в работу, бригада выедет сегодня.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 't2',
    subject: 'Справка о составе семьи',
    description: 'Нужна справка для детского сада.',
    status: 'open',
    priority: 'low',
    referenceCode: 'TK-2026-0143',
    createdAt: new Date().toISOString(),
    department: MOCK_DEPARTMENTS[1],
    messages: [],
  },
];

export const MOCK_CHAT: ChatMessage[] = [
  {
    id: 'c1',
    role: 'assistant',
    content:
      'Здравствуйте! Я ваш AI-ассистент. Помогу с вопросами по услугам, документам и задачам.',
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'c2',
    role: 'user',
    content: 'Как подать заявку на справку?',
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'c3',
    role: 'assistant',
    content:
      'Откройте раздел «Новая задача» или опишите запрос здесь — я подскажу, какие данные нужны, включая паспорт при верификации.',
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_OTP = '1234';
