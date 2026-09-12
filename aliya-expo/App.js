import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { getSupabaseClient, isSupabaseConfigured } from './services/supabase';

const supabase = getSupabaseClient();

const COLORS = {
  pink: '#F7D6E0',
  cream: '#FFF9F3',
  blue: '#DCECF7',
  lilac: '#E5DDF5',
  sage: '#DCE8DC',
  yellow: '#FFF0C7',
  text: '#4A4145',
  white: '#FFFFFF',
};

const emojis = ['✨','🦢','🍓','🎀','🌷','🍒','🧸','🪽','💗','🌺','🍋','🍵'];
const decorations = ['✨','🦢','🍓','🎀','🌷','🍒','🧸','🪽','💗','🌺','🍋','🍵'];

const STORAGE_KEY = 'ALIYA_PAGES';
const STUDY_STORAGE_KEY = 'ALIYA_STUDY_SESSIONS';
const CATEGORIES = ['No category', 'Personal', 'School', 'Ideas', 'Other'];
const STUDY_SUBJECTS = ['Law', 'History', 'English Language', 'Other'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const FONT_SIZE_OPTIONS = ['Small', 'Normal', 'Large', 'Heading'];
const FONT_SIZE_MAP = {
  Small: { label: 'Small', size: 14 },
  Normal: { label: 'Normal', size: 16 },
  Large: { label: 'Large', size: 20 },
  Heading: { label: 'Heading', size: 28 },
};

const FONT_OPTIONS = {
  Classic: { label: 'Classic', family: 'sans-serif' },
  Modern: { label: 'Modern', family: 'Arial' },
  Serif: { label: 'Serif', family: 'Times New Roman' },
  Script: { label: 'Script', family: 'Trebuchet MS' },
  Typewriter: { label: 'Typewriter', family: 'Courier' },
  Soft: { label: 'Soft', family: 'Trebuchet MS' },
  Study: { label: 'Study', family: 'Georgia' },
  Floral: { label: 'Floral', family: 'Verdana' },
  Elegant: { label: 'Elegant', family: 'serif' },
};

const FONT_OPTIONS_LIST = Object.keys(FONT_OPTIONS);

const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right'];
const LIST_STYLE_OPTIONS = ['none', 'bullet', 'numbered'];
const HIGHLIGHT_PALETTE = {
  pink: '#F7D6E0',
  blue: '#DCECF7',
  lilac: '#E5DDF5',
  sage: '#DCE8DC',
  yellow: '#FFF0C7',
};
const HIGHLIGHT_NAMES = ['pink', 'blue', 'lilac', 'sage', 'yellow'];
const TEXT_COLOUR_PALETTE = {
  blush: '#A1848B',
  ink: '#4A4145',
  sage: '#6B7C63',
  blue: '#779BAE',
  lilac: '#8C7BAF',
};
const TEXT_COLOUR_NAMES = ['blush', 'ink', 'sage', 'blue', 'lilac'];

const TEMPLATE_LIBRARY = [
  { id: 'study-notes', type: 'Note', icon: '📚', title: 'Study Notes', pageTitle: 'Study Notes', subtitle: 'Topic, Key Points, Examples and Things to Remember', category: 'Notes', body: 'Topic\n\nKey Points\n\nExamples\n\nThings to Remember', pageColour: COLORS.cream, font: 'Classic' },
  { id: 'brain-dump', type: 'Note', icon: '💡', title: 'Brain Dump', pageTitle: 'Brain Dump', subtitle: 'A big blank writing area', category: 'Notes', body: '', pageColour: COLORS.cream, font: 'Classic' },
  { id: 'wishlist', type: 'List', icon: '🛍️', title: 'Wishlist', pageTitle: 'Wishlist', subtitle: 'Items to add', category: 'Lists', body: 'Items to add', pageColour: COLORS.lilac, font: 'Classic', tasks: ['Something I want', 'Something I need', 'Something beautiful'] },
  { id: 'daily-journal', type: 'Diary', icon: '🌷', title: 'Daily Journal', pageTitle: 'Daily Journal', subtitle: 'Date, how I am feeling, what happened today, what I am thinking about', category: 'Diary', body: 'How I\'m feeling\n\nWhat happened today\n\nWhat I\'m thinking about', pageColour: COLORS.pink, font: 'Classic', date: '' },
  { id: 'gratitude', type: 'Diary', icon: '💗', title: 'Gratitude', pageTitle: 'Gratitude', subtitle: 'Things I am grateful for', category: 'Diary', body: 'Things I\'m grateful for\n\nA good thing that happened today\n\nSomething I\'m looking forward to', pageColour: COLORS.yellow, font: 'Classic', date: '' },
  { id: 'memories', type: 'Diary', icon: '✨', title: 'Memories', pageTitle: 'Memories', subtitle: 'Date, memory, why it was special', category: 'Diary', body: 'Date\n\nMemory\n\nWhy it was special', pageColour: COLORS.blue, font: 'Classic', date: '' },
  { id: 'todo-template', type: 'List', icon: '✅', title: 'To-Do List', pageTitle: 'To-Do List', subtitle: 'Create an interactive List page using the existing To-Do List functionality', category: 'Lists', body: 'My tasks', pageColour: COLORS.sage, font: 'Classic', tasks: ['Plan the day', 'Finish one meaningful task', 'Make time to rest'] },
  { id: 'travel-checklist', type: 'List', icon: '🧳', title: 'Travel Checklist', pageTitle: 'Travel Checklist', subtitle: 'Things to pack, things to remember', category: 'Lists', body: 'Things to pack\n\nThings to remember', pageColour: COLORS.blue, font: 'Classic', tasks: ['Passport', 'Ticket', 'Travel essentials'] },
  { id: 'goals-template', type: 'List', icon: '🎀', title: 'Goals', pageTitle: 'Goals', subtitle: 'Goal, why it matters, steps', category: 'Lists', body: 'Goal\n\nWhy it matters\n\nSteps', pageColour: COLORS.lilac, font: 'Classic', tasks: ['Start with one step', 'Keep momentum'] },
  { id: 'favourites-template', type: 'List', icon: '🍓', title: 'Favourites', pageTitle: 'Favourites', subtitle: 'Things I love', category: 'Lists', body: 'Things I love\n\nPeople, places and things', pageColour: COLORS.pink, font: 'Classic', tasks: ['Something I love', 'Someone I cherish', 'A place I remember'] },
];

const DESIGN_THEMES = {
  'Soft Pink': { pageColour: COLORS.pink, accent: '#FFF3F7', label: '🌸 Soft Pink' },
  'Baby Blue': { pageColour: '#D7ECF7', accent: '#EAF8FF', label: '🦢 Baby Blue' },
  'Lilac': { pageColour: COLORS.lilac, accent: '#F7F2FF', label: '💜 Lilac' },
  'Sage': { pageColour: COLORS.sage, accent: '#EDF8EF', label: '🌿 Sage' },
  'Butter Yellow': { pageColour: COLORS.yellow, accent: '#FFFDF2', label: '🍋 Butter Yellow' },
  'Cream': { pageColour: COLORS.cream, accent: '#FFFDF6', label: '🤍 Cream' },
  'Blush + Cream': { pageColour: '#FCE6EA', accent: '#FFF9F4', label: '🌷 Blush + Cream' },
  'Blue + Cream': { pageColour: '#DCECF7', accent: '#FFFDF8', label: '🪽 Blue + Cream' },
  'Pink + Lilac': { pageColour: '#F6DDEA', accent: '#F8F1FF', label: '🎀 Pink + Lilac' },
  'Sage + Cream': { pageColour: '#DCE8DC', accent: '#FFFDF8', label: '🍵 Sage + Cream' },
};
const DESIGN_THEME_LIST = Object.keys(DESIGN_THEMES);

const getToday = () => {
  return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateKey = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDiaryDate = (date) => {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getDateKeyFromDiaryDateText = (dateText) => {
  if (!dateText || typeof dateText !== 'string') return '';
  const parts = dateText.trim().split(' ');
  if (parts.length !== 3) return '';
  const day = Number(parts[0]);
  const month = MONTHS.indexOf(parts[1]);
  const year = Number(parts[2]);
  if (Number.isNaN(day) || month < 0 || Number.isNaN(year)) return '';
  return formatDateKey(new Date(year, month, day));
};

const getDateKeyFromPage = (page) => {
  if (page.dateKey) return page.dateKey;
  if (!page.date || page.type !== 'Diary') return '';
  return getDateKeyFromDiaryDateText(page.date);
};

const getTodayInputValue = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseDisplayDate = (dateKey) => {
  if (!dateKey) return '';
  const pieces = dateKey.split('-');
  if (pieces.length < 3) return dateKey;
  const year = Number(pieces[0]);
  const month = Number(pieces[1]) - 1;
  const day = Number(pieces[2]);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  if (mins) return `${mins}m`;
  return '0m';
};

const normalizeDuration = (hours, mins) => {
  return Number(hours || 0) * 60 + Number(mins || 0);
};

const TEMPLATE_TYPES = {
  NOTE: 'Note',
  DIARY: 'Diary',
  LIST: 'List',
};

export default function App() {
  if (!isSupabaseConfigured) {
    // Keep the ALIYA routes and UI intact. Supabase is optional by design:
    // the app will continue to work locally with AsyncStorage until the
    // required EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
    // environment variables are added by the developer.
  }

  const [screen, setScreen] = useState('welcome');
  const [sessionUser, setSessionUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);

  const [pagesLoaded, setPagesLoaded] = useState(false);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All categories');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [type, setType] = useState('Note');
  const [pageColour, setPageColour] = useState(COLORS.cream);
  const [font, setFont] = useState('Classic');
  const [fontFamily, setFontFamily] = useState('Classic');
  const [fontSize, setFontSize] = useState('Normal');
  const [textAlign, setTextAlign] = useState('left');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [listStyle, setListStyle] = useState('none');
  const [highlightColor, setHighlightColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [icon, setIcon] = useState('✨');
  const [selectedDecorations, setSelectedDecorations] = useState([]);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('No category');
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [expandedToolbar, setExpandedToolbar] = useState(null);
  const [photoUri, setPhotoUri] = useState('');

  const [editorUndoStack, setEditorUndoStack] = useState([]);
  const [editorRedoStack, setEditorRedoStack] = useState([]);
  const richEditorRef = useRef(null);

  const [studySessions, setStudySessions] = useState([]);
  const [studySubject, setStudySubject] = useState('Law');
  const [studyCustomSubject, setStudyCustomSubject] = useState('');
  const [studyDate, setStudyDate] = useState(getTodayInputValue());
  const [studyHours, setStudyHours] = useState(1);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [studyNotes, setStudyNotes] = useState('');
  const [studyEditingId, setStudyEditingId] = useState(null);
  const [studyView, setStudyView] = useState('stats');

  const normalizeSupabaseStudySession = (row) => ({
    id: row.id,
    subject: row.subject || 'Other',
    date: row.date || getTodayInputValue(),
    duration: Number(row.duration_minutes || 0),
    notes: row.notes || '',
  });

  const studySessionToSupabaseRow = (session, userId) => ({
    id: String(session.id),
    user_id: String(userId),
    subject: session.subject || 'Other',
    date: session.date || getTodayInputValue(),
    duration_minutes: Number(session.duration || 0),
    notes: session.notes || '',
  });

  const normalizeSupabasePage = (row) => ({
    id: String(row.id),
    title: row.title || 'Untitled',
    body: stripHtmlToPlain(row.body || ''),
    bodyHtml: row.body || '',
    type: row.type || 'Note',
    pageColour: row.page_colour || row.pageColour || COLORS.cream,
    font: row.font_family || row.font || 'Classic',
    fontSize: row.font_size || 'Normal',
    fontFamily: row.font_family || row.font || 'Classic',
    textAlign: row.text_align || 'left',
    bold: Boolean(row.bold),
    italic: Boolean(row.italic),
    underline: Boolean(row.underline),
    listStyle: row.list_style || 'none',
    highlightColor: row.highlight_color || '',
    textColor: row.text_color || '',
    icon: row.icon || '✨',
    decorations: Array.isArray(row.decorations) ? row.decorations : [],
    date: row.date || '',
    dateKey: row.date_key || row.dateKey || '',
    category: row.category || 'No category',
    favourite: Boolean(row.favourite),
    pinned: Boolean(row.pinned),
    tasks: Array.isArray(row.tasks) ? row.tasks.map((task) => ({ id: task.id || Date.now() + Math.random(), text: task.text || task, completed: Boolean(task.completed) })) : [],
    photoUri: row.photo_uri || row.photoUri || '',
  });

  const pageToSupabaseRow = (page, userId) => ({
    id: String(page.id),
    title: page.title || 'Untitled',
    body: page.bodyHtml || page.body || '',
    type: page.type || 'Note',
    page_colour: page.pageColour || COLORS.cream,
    font: page.font || 'Classic',
    icon: page.icon || '✨',
    decorations: Array.isArray(page.decorations) ? page.decorations : [],
    date: page.type === 'Diary' ? (page.date || '') : '',
    date_key: page.type === 'Diary' ? (page.dateKey || '') : '',
    category: page.category || 'No category',
    favourite: Boolean(page.favourite),
    pinned: Boolean(page.pinned),
    tasks: Array.isArray(page.tasks) ? page.tasks.map((task) => ({ id: task.id || Date.now() + Math.random(), text: task.text || '', completed: Boolean(task.completed) })) : [],
    photo_uri: page.type === 'List' ? '' : (page.photoUri || ''),
    user_id: userId,
  });

  const dedupePages = (items) => {
    const map = new Map();
    items.forEach((page) => {
      const key = String(page.id);
      if (!map.has(key)) {
        map.set(key, page);
      } else {
        const existing = map.get(key);
        const merged = {
          ...existing,
          ...page,
          tasks: Array.isArray(page.tasks) && page.tasks.length > 0 ? page.tasks : (existing.tasks || []),
          decorations: Array.isArray(page.decorations) && page.decorations.length > 0 ? page.decorations : (existing.decorations || []),
        };
        map.set(key, merged);
      }
    });
    return Array.from(map.values());
  };

  const loadRemotePages = async () => {
    if (!supabase || !sessionUser || !sessionUser.id) return [];
    try {
      const { data, error } = await supabase
        .from('Pages')
        .select('*')
        .eq('user_id', sessionUser.id);

      if (error) {
        console.log('Could not load Supabase Pages:', error);
        return [];
      }

      return (data || []).map(normalizeSupabasePage);
    } catch (error) {
      console.log('Could not load Supabase Pages:', error);
      return [];
    }
  };

  const mergePagesSafely = (localPages, remotePages) => {
    const localMap = new Map(localPages.map((page) => [String(page.id), page]));
    const remoteMap = new Map(remotePages.map((page) => [String(page.id), page]));
    const merged = new Map();

    localPages.forEach((page) => merged.set(String(page.id), { ...page }));
    remotePages.forEach((page) => {
      const key = String(page.id);
      if (!merged.has(key)) {
        merged.set(key, { ...page });
      } else {
        const localPage = localMap.get(key);
        const remotePage = remoteMap.get(key);
        merged.set(key, {
          ...remotePage,
          ...localPage,
          id: key,
          tasks: Array.isArray(localPage?.tasks) ? localPage.tasks : (Array.isArray(remotePage?.tasks) ? remotePage.tasks : []),
          decorations: Array.isArray(localPage?.decorations) ? localPage.decorations : (Array.isArray(remotePage?.decorations) ? remotePage.decorations : []),
        });
      }
    });

    return dedupePages(Array.from(merged.values()));
  };

  const upsertPageToSupabase = async (page) => {
    if (!supabase || !sessionUser || !sessionUser.id) return;
    try {
      const payload = pageToSupabaseRow(page, sessionUser.id);
      const { error } = await supabase
        .from('Pages')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('[ALIYA Pages] primary Supabase upsert failed', {
          table: 'Pages',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          payload,
        });

        const fallbackPayload = {
          id: payload.id,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          page_colour: payload.page_colour,
          font: payload.font,
          icon: payload.icon,
          decorations: payload.decorations,
          date: payload.date,
          category: payload.category,
          favourite: payload.favourite,
          pinned: payload.pinned,
          tasks: payload.tasks,
          photo_uri: payload.photo_uri,
          user_id: payload.user_id,
        };

        const { error: fallbackError } = await supabase
          .from('Pages')
          .upsert(fallbackPayload, { onConflict: 'id' });

        if (fallbackError) {
          console.error('[ALIYA Pages] Supabase fallback upsert failed', {
            table: 'Pages',
            message: fallbackError.message,
            code: fallbackError.code,
            details: fallbackError.details,
            hint: fallbackError.hint,
          });
        }
      }
    } catch (error) {
      console.error('[ALIYA Pages] Supabase save threw', {
        table: 'Pages',
        message: error?.message,
        stack: error?.stack,
      });
    }
  };

  const deletePageFromSupabase = async (pageId) => {
    if (!supabase || !sessionUser || !sessionUser.id) return;
    try {
      const { error } = await supabase
        .from('Pages')
        .delete()
        .eq('id', String(pageId))
        .eq('user_id', sessionUser.id);

      if (error) {
        console.log('Could not delete page from Supabase:', error);
      }
    } catch (error) {
      console.log('Could not delete page from Supabase:', error);
    }
  };

  const loadRemoteStudySessions = async () => {
    if (!supabase || !sessionUser || !sessionUser.id) return [];
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', sessionUser.id);

      if (error) {
        console.log('Could not load study sessions from Supabase:', error);
        return [];
      }

      return (data || []).map(normalizeSupabaseStudySession);
    } catch (error) {
      console.log('Could not load study sessions from Supabase:', error);
      return [];
    }
  };

  const dedupeStudySessions = (items) => {
    const map = new Map();
    items.forEach((session) => {
      const key = String(session.id);
      if (!map.has(key)) {
        map.set(key, session);
      } else {
        const existing = map.get(key);
        map.set(key, { ...existing, ...session });
      }
    });
    return Array.from(map.values());
  };

  const mergeStudySessions = (localSessions, remoteSessions) => {
    const localMap = new Map(localSessions.map((session) => [String(session.id), session]));
    const remoteMap = new Map(remoteSessions.map((session) => [String(session.id), session]));
    const merged = new Map();

    localSessions.forEach((session) => merged.set(String(session.id), { ...session }));
    remoteSessions.forEach((session) => {
      const key = String(session.id);
      if (!merged.has(key)) {
        merged.set(key, { ...session });
      } else {
        const localSession = localMap.get(key);
        const remoteSession = remoteMap.get(key);
        merged.set(key, {
          ...remoteSession,
          ...localSession,
          id: key,
        });
      }
    });

    return dedupeStudySessions(Array.from(merged.values()));
  };

  const upsertStudySessionToSupabase = async (session) => {
    if (!supabase) {
      console.log('[ALIYA study_sessions] Supabase client is not configured; skipping remote upsert.');
      return;
    }

    if (!sessionUser || !sessionUser.id) {
      console.log('[ALIYA study_sessions] sessionUser is not available yet; skipping remote upsert.');
      return;
    }

    try {
      const payload = studySessionToSupabaseRow(session, sessionUser.id);
      console.log('[ALIYA study_sessions] attempting upsert', {
        table: 'study_sessions',
        userId: sessionUser.id,
        payload,
      });

      const { data, error } = await supabase
        .from('study_sessions')
        .upsert(payload, { onConflict: 'id' })
        .select('id');

      if (error) {
        console.error('[ALIYA study_sessions] Supabase insert/update failed', {
          table: 'study_sessions',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          payload,
          userId: sessionUser.id,
        });
        return;
      }

      console.log('[ALIYA study_sessions] Supabase insert/update succeeded', { data, table: 'study_sessions' });
    } catch (error) {
      console.error('[ALIYA study_sessions] Supabase insert/update threw', {
        table: 'study_sessions',
        message: error?.message,
        stack: error?.stack,
        payload: studySessionToSupabaseRow(session, sessionUser?.id ?? 'missing-user'),
      });
    }
  };

  const deleteStudySessionFromSupabase = async (id) => {
    if (!supabase || !sessionUser || !sessionUser.id) return;
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', String(id))
        .eq('user_id', sessionUser.id);

      if (error) {
        console.log('Could not delete study session from Supabase:', error);
      }
    } catch (error) {
      console.log('Could not delete study session from Supabase:', error);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!supabase) {
        setAuthReady(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setAuthError(error.message);
          return;
        }

        if (data.session?.user) {
          setSessionUser(data.session.user);
        }
        setAuthReady(true);
      } catch (error) {
        setAuthError('Could not restore your ALIYA session.');
      }
    };

    const startListener = () => {
      if (!supabase) return undefined;
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        setSessionUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') {
          setAuthMode('login');
          setAuthError('');
        }
      });
      return data?.subscription;
    };

    restoreSession();
    const subscription = startListener();
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const savedPages = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedPages) {
          const parsedPages = JSON.parse(savedPages);
          const normalizedPages = parsedPages.map((page) => ({
            ...page,
            pinned: page.pinned === true,
            favourite: page.favourite === true,
          }));
          setPages(normalizedPages);
          setPagesLoaded(true);
        } else {
          setPagesLoaded(true);
        }
      } catch (error) {
        console.log('Could not load pages:', error);
        setPagesLoaded(true);
      }
    };

    const loadStudySessions = async () => {
      try {
        const savedStudy = await AsyncStorage.getItem(STUDY_STORAGE_KEY);
        if (savedStudy) {
          const parsedSessions = JSON.parse(savedStudy);
          setStudySessions(parsedSessions);
        }
      } catch (error) {
        console.log('Could not load study sessions:', error);
      }
    };

    loadPages();
    loadStudySessions();
  }, []);

  useEffect(() => {
    const syncWhenAuthenticated = async () => {
      if (!supabase || !sessionUser || !sessionUser.id || !pagesLoaded) return;

      try {
        const localPages = pages;
        const remotePages = await loadRemotePages();
        const mergedPages = mergePagesSafely(localPages, remotePages);
        const uniquePages = dedupePages(mergedPages);

        if (uniquePages.length !== pages.length || uniquePages.some((page) => String(page.id) === '')) {
          setPages(uniquePages);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(uniquePages));
        }

        for (const page of uniquePages) {
          await upsertPageToSupabase(page);
        }

        const localSessions = studySessions;
        const remoteSessions = await loadRemoteStudySessions();
        const mergedSessions = mergeStudySessions(localSessions, remoteSessions);
        const uniqueSessions = dedupeStudySessions(mergedSessions);

        if (uniqueSessions.length !== studySessions.length || uniqueSessions.some((session) => String(session.id) === '')) {
          setStudySessions(uniqueSessions);
          await AsyncStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(uniqueSessions));
        }

        for (const session of uniqueSessions) {
          await upsertStudySessionToSupabase(session);
        }
      } catch (error) {
        console.log('Could not sync Supabase pages or study sessions:', error);
      }
    };

    syncWhenAuthenticated();
  }, [sessionUser, pagesLoaded]);

  useEffect(() => {
    const savePages = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
      } catch (error) {
        console.log('Could not save pages:', error);
      }
    };
    savePages();
  }, [pages]);

  useEffect(() => {
    const saveStudySessions = async () => {
      try {
        await AsyncStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(studySessions));
      } catch (error) {
        console.log('Could not save study sessions:', error);
      }
    };
    saveStudySessions();
  }, [studySessions]);

  const handleSignUp = async () => {
    if (!supabase) {
      setAuthError('Supabase is not configured yet.');
      return;
    }

    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();
    if (!email || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Your password needs at least 6 characters.');
      return;
    }

    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: authName.trim(),
        },
      },
    });

    setAuthBusy(false);
    if (error) {
      setAuthError(error.message || 'Unable to create your ALIYA account.');
      return;
    }

    if (data?.user) {
      setAuthMessage('Welcome to ALIYA. Check your email to confirm your account.');
      setAuthMode('login');
      setAuthEmail(email);
      setAuthPassword('');
      setAuthName('');
    }
  };

  const handleLogin = async () => {
    if (!supabase) {
      setAuthError('Supabase is not configured yet.');
      return;
    }

    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();
    if (!email || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }

    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setAuthBusy(false);
    if (error) {
      setAuthError(error.message || 'Unable to log in to ALIYA.');
      return;
    }

    if (data?.user) {
      setSessionUser(data.user);
      setScreen('home');
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
      setAuthMessage('');
    }
  };

  const handleLogout = async () => {
    if (!supabase) {
      setSessionUser(null);
      setScreen('home');
      return;
    }

    setAuthBusy(true);
    const { error } = await supabase.auth.signOut();
    setAuthBusy(false);

    if (error) {
      setAuthError(error.message || 'Unable to log out.');
      return;
    }

    setSessionUser(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthError('');
    setAuthMessage('');
    setScreen('home');
  };

  const clearAliyaLocalData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(STUDY_STORAGE_KEY);
      await AsyncStorage.removeItem('ALIYA_PAGES');
      await AsyncStorage.removeItem('ALIYA_STUDY_SESSIONS');
    } catch (error) {
      console.log('Could not clear ALIYA local cached data:', error);
    }
  };

  const requestDeleteAccount = () => {
    if (!sessionUser) return;

    Alert.alert(
      'Delete your ALIYA account?',
      'This will permanently delete your ALIYA account and remove your associated cloud data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (!supabase || !sessionUser) {
      setAuthError('You need an active ALIYA account session to delete your account.');
      return;
    }

    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('delete-account');

      if (error) {
        console.log('Could not delete ALIYA account from Supabase function:', error);
        setAuthError(error.message || 'Unable to delete your ALIYA account right now.');
        setAuthBusy(false);
        return;
      }

      await clearAliyaLocalData();
      setPages([]);
      setStudySessions([]);
      setSessionUser(null);
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
      setAuthMessage('Your ALIYA account has been deleted.');

      if (supabase) {
        await supabase.auth.signOut();
      }

      setScreen('welcome');
    } catch (error) {
      console.log('Could not delete ALIYA account:', error);
      setAuthError(error?.message || 'Unable to delete your ALIYA account right now.');
    } finally {
      setAuthBusy(false);
    }
  };

  const resetEditor = () => {
    setTitle('');
    setBody('');
    setBodyHtml('');
    setType('Note');
    setPageColour(COLORS.cream);
    setFont('Classic');
    setFontFamily('Classic');
    setFontSize('Normal');
    setTextAlign('left');
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setListStyle('none');
    setHighlightColor('');
    setTextColor('');
    setIcon('✨');
    setSelectedDecorations([]);
    setDate('');
    setCategory('No category');
    setTasks([]);
    setTaskInput('');
    setEditingPage(null);
    setExpandedToolbar(null);
    setPhotoUri('');
    setEditorUndoStack([]);
    setEditorRedoStack([]);
  };

  const clearEditorHistory = () => {
    setEditorUndoStack([]);
    setEditorRedoStack([]);
  };

  const pushEditorHistory = (snapshot) => {
    setEditorUndoStack((prev) => {
      const next = [...prev, snapshot];
      return next.slice(-(100));
    });
    setEditorRedoStack([]);
  };

  const updateTitle = (value) => {
    if (value === title) return;
    pushEditorHistory({ title, body, bodyHtml });
    setTitle(value);
  };

  const updateBody = (html) => {
    const plainText = stripHtmlToPlain(html || '');
    if (plainText === body && html === bodyHtml) return;
    pushEditorHistory({ title, body, bodyHtml });
    setBodyHtml(html || '');
    setBody(plainText);
  };

  const applyRichEditorMethod = (name, data) => {
    if (!richEditorRef.current || Platform.OS === 'web') return;

    if (name === 'fontName') {
      richEditorRef.current.setFontName(data);
      return;
    }

    if (name === 'fontSize') {
      const size = data;
      richEditorRef.current.setFontSize(size);
      return;
    }

    if (name === 'textColor') {
      richEditorRef.current.setForeColor(data);
      return;
    }

    if (name === 'highlightColor') {
      richEditorRef.current.setHiliteColor(data);
      return;
    }

    if (name === 'alignLeft') {
      richEditorRef.current.sendAction(actions.alignLeft, 'result');
      return;
    }

    if (name === 'alignCenter') {
      richEditorRef.current.sendAction(actions.alignCenter, 'result');
      return;
    }

    if (name === 'alignRight') {
      richEditorRef.current.sendAction(actions.alignRight, 'result');
      return;
    }

    if (name === 'bullet') {
      richEditorRef.current.sendAction(actions.insertBulletsList, 'result');
      return;
    }

    if (name === 'numbered') {
      richEditorRef.current.sendAction(actions.insertOrderedList, 'result');
      return;
    }

    if (name === 'bold') {
      richEditorRef.current.sendAction(actions.setBold, 'result');
      return;
    }

    if (name === 'italic') {
      richEditorRef.current.sendAction(actions.setItalic, 'result');
      return;
    }

    if (name === 'underline') {
      richEditorRef.current.sendAction(actions.setUnderline, 'result');
      return;
    }
  };

  const undoEditorText = () => {
    if (editorUndoStack.length === 0) return;
    const previous = editorUndoStack[editorUndoStack.length - 1];
    const current = { title, body, bodyHtml };
    setEditorUndoStack((prev) => prev.slice(0, -1));
    setEditorRedoStack((prev) => {
      const next = [...prev, current];
      return next.slice(-(100));
    });
    setTitle(previous.title);
    setBody(previous.body);
    setBodyHtml(previous.bodyHtml || makeRichBody(previous.body || ''));
  };

  const redoEditorText = () => {
    if (editorRedoStack.length === 0) return;
    const next = editorRedoStack[editorRedoStack.length - 1];
    const current = { title, body, bodyHtml };
    setEditorRedoStack((prev) => prev.slice(0, -1));
    setEditorUndoStack((prev) => {
      const updated = [...prev, current];
      return updated.slice(-(100));
    });
    setTitle(next.title);
    setBody(next.body);
    setBodyHtml(next.bodyHtml || makeRichBody(next.body || ''));
  };

  const openCreate = (newType, dateValue = null) => {
    resetEditor();
    setType(newType);
    if (newType === 'Diary') {
      const chosenDate = dateValue || new Date();
      setDate(formatDiaryDate(chosenDate));
      setCategory('No category');
    }
    setScreen('editor');
  };

  const openPage = (page) => {
    clearEditorHistory();
    setEditingPage(page);
    setTitle(page.title);
    setBody(page.body || stripHtmlToPlain(page.bodyHtml || ''));
    setBodyHtml(page.bodyHtml || makeRichBody(page.body || ''));
    setType(page.type);
    setPageColour(page.pageColour || page.backgroundColor || COLORS.cream);
    setFont(page.font || 'Classic');
    setFontFamily(page.fontFamily || page.font || 'Classic');
    setFontSize(page.fontSize || 'Normal');
    setTextAlign(page.textAlign || 'left');
    setBold(Boolean(page.bold));
    setItalic(Boolean(page.italic));
    setUnderline(Boolean(page.underline));
    setListStyle(page.listStyle || 'none');
    setHighlightColor(page.highlightColor || '');
    setTextColor(page.textColor || '');
    setIcon(page.icon || '✨');
    setSelectedDecorations(page.decorations || []);
    setDate(page.date || '');
    setCategory(page.category || 'No category');
    setTasks(page.tasks || []);
    setTaskInput('');
    setPhotoUri(page.photoUri || '');
    setScreen('editor');
  };

  const addTask = () => {
    const text = taskInput.trim();
    if (!text) return;
    setTasks([...tasks, { id: Date.now(), text, completed: false }]);
    setTaskInput('');
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const toggleFavourite = (page) => {
    setPages(pages.map((item) => item.id === page.id ? { ...item, favourite: !item.favourite } : item));
  };

  const togglePin = (page) => {
    setPages(pages.map((item) => item.id === page.id ? { ...item, pinned: !item.pinned } : item));
  };

  const duplicatePage = (page) => {
    const copy = {
      ...page,
      id: Date.now(),
      title: `${page.title} — Copy`,
      favourite: false,
      pinned: false,
      category: page.category || 'No category',
      dateKey: getDateKeyFromPage(page),
      tasks: page.tasks ? page.tasks.map((task) => ({ ...task })) : [],
      photoUri: page.type === 'List' ? '' : (page.photoUri || ''),
    };
    setPages([copy, ...pages]);
    if (supabase && sessionUser) {
      upsertPageToSupabase(copy);
    }
  };

  const deletePage = (page) => {
    Alert.alert(
      'Delete this page? 🌷',
      `"${page.title}" will be removed from your pages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
            setPages(pages.filter((item) => item.id !== page.id));
            if (supabase && sessionUser) {
              deletePageFromSupabase(page.id);
            }
          } },
      ]
    );
  };

  const pageOptions = (page) => {
    Alert.alert(
      page.title,
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: page.pinned ? 'Unpin page' : 'Pin page', onPress: () => togglePin(page) },
        { text: page.favourite ? 'Remove from favourites' : 'Add to favourites', onPress: () => toggleFavourite(page) },
        { text: 'Duplicate', onPress: () => duplicatePage(page) },
        { text: 'Share', onPress: () => sharePage(page) },
        { text: 'Export as PDF', onPress: () => exportPageAsPdf(page) },
        { text: 'Delete', style: 'destructive', onPress: () => deletePage(page) },
      ]
    );
  };

  const stripHtmlToPlain = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<\/li>/gi, '')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const makeRichBody = (plainText) => {
    if (!plainText || typeof plainText !== 'string') return '';
    const safe = escapeHtml(plainText);
    return `<div>${safe.replace(/\n/g, '<br/>')}</div>`;
  };

  const buildPageShareText = (page) => {
    const lines = [];
    lines.push(`ALIYA Page: ${page.title || 'Untitled'}`);
    lines.push(`Type: ${page.type || 'Note'}`);
    if (page.type === 'Diary' && page.date) {
      lines.push(`Diary date: ${page.date}`);
    }
    const body = typeof page.body === 'string' ? page.body : stripHtmlToPlain(page.bodyHtml || '');
    if (body) lines.push(`Body:\n${body}`);
    if (page.type === 'List' && Array.isArray(page.tasks) && page.tasks.length > 0) {
      lines.push('List tasks:');
      page.tasks.forEach((task) => lines.push(`- ${task.text || ''}`));
    }
    return lines.join('\n\n');
  };

  const sharePage = async (page) => {
    const text = buildPageShareText(page);
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: page.title || 'ALIYA page', text });
        } catch (error) {
          console.log('Web share cancelled or failed:', error);
        }
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(text);
          Alert.alert('ALIYA Share', 'Page content copied to your clipboard.');
        } catch (error) {
          Alert.alert('ALIYA Share', 'Sharing is not available in this browser.');
        }
      } else {
        Alert.alert('ALIYA Share', 'Sharing is not available in this browser.');
      }
      return;
    }

    try {
      await Share.share({ message: text, title: page.title || 'ALIYA page' });
    } catch (error) {
      console.log('Could not share ALIYA page:', error);
      Alert.alert('Share failed', 'ALIYA could not open the device sharing sheet.');
    }
  };

  const escapeHtml = (value) => {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
  };

  const exportPageAsPdf = async (page) => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'PDF export is for iOS / Expo Go',
        'The ALIYA web preview cannot generate or share a native PDF file. Please run the project on iOS/Expo Go to export the selected page as a PDF.'
      );
      return;
    }

    if (!page) return;

    try {
      const font = FONT_OPTIONS[page.font] || FONT_OPTIONS.Classic;
      const fontSize = FONT_SIZE_MAP[page.fontSize] || FONT_SIZE_MAP.Normal;
      const align = TEXT_ALIGN_OPTIONS.includes(page.textAlign) ? page.textAlign : 'left';
      const color = page.textColor ? (TEXT_COLOUR_PALETTE[page.textColor] || page.textColor) : COLORS.text;
      const highlight = page.highlightColor || 'transparent';
      const pageColour = page.pageColour || COLORS.cream;
      const fontFamily = font.family || 'sans-serif';
      const fontWeight = page.bold ? '700' : (page.font === 'Bold' ? '700' : '400');
      const fontStyle = page.italic ? 'italic' : (page.font === 'Soft' ? 'italic' : 'normal');
      const textDecoration = page.underline ? 'underline' : 'none';
      const bodyLines = String(page.body || '').replace(/\r\n/g, '\n');
      const title = escapeHtml(page.title || 'Untitled');
      const date = page.type === 'Diary' && page.date ? `<div class="date">${escapeHtml(page.date)}</div>` : '';
      const bodyHtml = `<div class="body">${escapeHtml(bodyLines)}</div>`;

      let taskHtml = '';
      if (page.type === 'List' && Array.isArray(page.tasks) && page.tasks.length > 0) {
        const listItems = page.tasks.map((task) => `<li>${escapeHtml(task.text || '')}</li>`).join('');
        taskHtml = `<div class="tasks"><h3>Tasks</h3><ul>${listItems}</ul></div>`;
      }

      const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { margin: 0; padding: 0; background: ${COLORS.cream}; font-family: ${fontFamily}; color: ${COLORS.text}; }
              .page { width: 820px; min-height: 1100px; margin: 0 auto; padding: 48px 50px; background: ${pageColour}; border-radius: 16px; box-sizing: border-box; }
              .inner { background: rgba(255,255,255,0.45); border-radius: 10px; padding: 32px; border: 1px solid #EADFDA; }
              h1 { font-size: 30px; font-weight: 700; margin: 0 0 14px 0; color: ${COLORS.text}; font-family: ${fontFamily}; text-align: ${align}; }
              .date { font-size: 14px; color: #8A7B82; margin-bottom: 16px; font-family: ${fontFamily}; text-align: ${align}; }
              .body { font-size: ${fontSize.size}px; font-family: ${fontFamily}; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; color: ${color}; text-align: ${align}; background: ${highlight}; white-space: pre-wrap; line-height: 1.7; }
              .tasks { margin-top: 20px; border-top: 1px solid #EADFDA; padding-top: 18px; }
              .tasks h3 { font-size: 16px; color: ${COLORS.text}; margin: 0 0 8px 0; }
              .tasks ul { margin: 0; padding-left: 24px; }
              .tasks li { font-size: ${fontSize.size}px; color: ${color}; font-family: ${fontFamily}; }
              .meta { font-size: 11px; color: #8A7B82; margin-top: 20px; letter-spacing: 1.2px; text-transform: uppercase; }
            </style>
          </head>
          <body>
            <div class="page">
              <div class="inner">
                <div class="meta">ALIYA page</div>
                <h1>${title}</h1>
                ${date}
                ${bodyHtml}
                ${taskHtml}
              </div>
            </div>
          </body>
        </html>`;

      const file = await Print.printToFileAsync({ html, base64: false });
      if (file?.uri) {
        await Sharing.shareAsync(file.uri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Export ${page.title || 'ALIYA page'} as PDF`,
        });
      }
    } catch (error) {
      console.log('Could not export page PDF:', error);
      Alert.alert('PDF export failed', 'The ALIYA PDF export could not be generated.');
    }
  };

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo library permission needed', 'Please allow ALIYA to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setExpandedToolbar(null);
    }
  };

  const removePhoto = () => {
    setPhotoUri('');
    setExpandedToolbar(null);
  };

  const savePage = () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert('Add something first 💗', 'Write a title or some words before saving.');
      return;
    }

    const newPage = {
      id: editingPage ? editingPage.id : Date.now(),
      title: title.trim() || 'Untitled',
      body,
      bodyHtml: bodyHtml || makeRichBody(body),
      type,
      pageColour,
      font,
      fontFamily,
      fontSize,
      textAlign,
      bold,
      italic,
      underline,
      listStyle,
      highlightColor,
      textColor,
      icon,
      decorations: selectedDecorations,
      date: type === 'Diary' ? date : '',
      dateKey: type === 'Diary' ? getDateKeyFromDiaryDateText(date) : '',
      category: category || 'No category',
      favourite: editingPage ? editingPage.favourite || false : false,
      pinned: editingPage ? editingPage.pinned === true : false,
      tasks: type === 'List' ? tasks.map((task) => ({ ...task })) : [],
      photoUri: type === 'List' ? '' : photoUri,
    };

    if (editingPage) {
      const nextPages = pages.map((page) => page.id === editingPage.id ? newPage : page);
      setPages(nextPages);
      if (supabase && sessionUser) {
        upsertPageToSupabase(newPage);
      }
    } else {
      const nextPages = [newPage, ...pages];
      setPages(nextPages);
      if (supabase && sessionUser) {
        upsertPageToSupabase(newPage);
      }
    }

    resetEditor();
    setSearch('');
    setFilter('All');
    setScreen('home');
  };

  const toggleDecoration = (item) => {
    if (selectedDecorations.includes(item)) {
      setSelectedDecorations(selectedDecorations.filter((decoration) => decoration !== item));
    } else {
      setSelectedDecorations([...selectedDecorations, item]);
    }
  };

  const toggleToolbar = (section) => {
    setExpandedToolbar(expandedToolbar === section ? null : section);
  };

  const startStudyForm = () => {
    setStudySubject('Law');
    setStudyCustomSubject('');
    setStudyDate(getTodayInputValue());
    setStudyHours(1);
    setStudyMinutes(0);
    setStudyNotes('');
    setStudyEditingId(null);
    setStudyView('form');
  };

  const openStudyEdit = (session) => {
    setStudyEditingId(session.id);
    setStudySubject(session.subject || 'Law');
    setStudyCustomSubject(session.subject && !STUDY_SUBJECTS.includes(session.subject) ? session.subject : '');
    setStudyDate(session.date || getTodayInputValue());
    setStudyHours(Math.floor((session.duration || 0) / 60));
    setStudyMinutes((session.duration || 0) % 60);
    setStudyNotes(session.notes || '');
    setStudyView('form');
  };

  const saveStudySession = () => {
    const subject = studySubject === 'Other' ? (studyCustomSubject.trim() || 'Other') : studySubject;
    const minutes = normalizeDuration(studyHours, studyMinutes);
    if (!subject.trim()) {
      Alert.alert('Choose a subject', 'Please choose or create a study subject.');
      return;
    }
    if (!studyDate) {
      Alert.alert('Choose a date', 'Please choose a study date.');
      return;
    }
    if (!minutes || minutes < 1) {
      Alert.alert('Add duration', 'Please add at least 1 minute of study time.');
      return;
    }

    const payload = {
      id: studyEditingId || Date.now(),
      subject,
      date: studyDate,
      duration: minutes,
      notes: studyNotes.trim(),
    };

    console.log('[ALIYA study_sessions] saveStudySession UI payload', {
      route: 'saveStudySession',
      table: 'study_sessions',
      id: payload.id,
      sessionUserAvailable: Boolean(sessionUser && sessionUser.id),
      sessionUserId: sessionUser?.id ?? null,
      payload,
    });

    if (studyEditingId) {
      setStudySessions(studySessions.map((item) => item.id === studyEditingId ? payload : item));
    } else {
      setStudySessions([payload, ...studySessions]);
    }

    if (supabase && sessionUser && sessionUser.id) {
      upsertStudySessionToSupabase(payload);
    } else {
      console.log('[ALIYA study_sessions] remote upsert skipped', {
        table: 'study_sessions',
        reason: 'missing supabase client or sessionUser.id',
        hasSupabase: Boolean(supabase),
        hasSessionUser: Boolean(sessionUser && sessionUser.id),
      });
    }

    setStudyView('stats');
    setStudySubject('Law');
    setStudyCustomSubject('');
    setStudyDate(getTodayInputValue());
    setStudyHours(1);
    setStudyMinutes(0);
    setStudyNotes('');
    setStudyEditingId(null);
  };


  const openTemplate = (template) => {
    resetEditor();
    setType(template.type);
    setPageColour(template.pageColour || COLORS.cream);
    setFont(template.font || 'Classic');
    setFontFamily('Classic');
    setFontSize('Normal');
    setTextAlign('left');
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setListStyle('none');
    setHighlightColor('');
    setTextColor('');
    setIcon(template.icon || '✦');
    setSelectedDecorations([]);
    setTitle(template.pageTitle || template.title || 'Untitled');
    setBody(template.body || '');
    setCategory(template.category || 'No category');
    setTasks(template.tasks ? template.tasks.map((task, index) => ({ id: Date.now() + index, text: task, completed: false })) : []);
    setTaskInput('');
    setExpandedToolbar(null);
    if (template.type === 'Diary') {
      const templateDate = new Date();
      setDate(formatDiaryDate(templateDate));
    } else {
      setDate('');
    }
    if (template.type === 'List') {
      setBody('');
    }
    setScreen('editor');
  };

  const templateBackgroundItem = (designName) => {
    return DESIGN_THEMES[designName] || DESIGN_THEMES['Soft Pink'];
  };

  const deleteStudySession = (id) => {
    const session = studySessions.find((item) => item.id === id);
    if (!session) return;
    Alert.alert(
      'Delete study session?',
      `${session.subject} — ${formatDuration(session.duration)} on ${parseDisplayDate(session.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setStudySessions(studySessions.filter((item) => item.id !== id));
          if (supabase && sessionUser) {
            deleteStudySessionFromSupabase(id);
          }
        } },
      ]
    );
  };

  const getFontStyle = () => {
    const base = FONT_OPTIONS[font] || FONT_OPTIONS.Classic;
    const size = FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.Normal;

    const fontFamily = base.family || 'sans-serif';
    const fontStyle = italic ? 'italic' : (font === 'Soft' ? 'italic' : 'normal');
    const fontWeight = bold ? '700' : (font === 'Bold' ? '700' : '400');
    const fontSizeStyle = size.size;
    const textDecorationLine = underline ? 'underline' : 'none';
    const textAlignValue = textAlign || 'left';

    return {
      fontFamily,
      fontSize: fontSizeStyle,
      fontStyle,
      fontWeight,
      textDecorationLine,
      textAlign: textAlignValue,
      backgroundColor: highlightColor || 'transparent',
      color: textColor ? TEXT_COLOUR_PALETTE[textColor] || textColor : COLORS.text,
    };
  };

  const filteredPages = pages
    .filter((page) => {
      const text = `${page.title} ${page.body} ${page.type} ${page.date || ''}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const pageCategory = page.category || 'No category';
      const matchesCategory = categoryFilter === 'All categories' || pageCategory === categoryFilter;

      let matchesFilter = true;
      if (filter === 'Favourites') matchesFilter = page.favourite === true;
      else if (filter === 'Pinned') matchesFilter = page.pinned === true;
      else if (filter !== 'All') matchesFilter = page.type === filter;

      return matchesSearch && matchesFilter && matchesCategory;
    })
    .sort((a, b) => Number(b.pinned === true) - Number(a.pinned === true));

  if (screen === 'welcome') {
    return (
      <View style={styles.welcome}>
        <Text style={styles.logo}>aliya</Text>
        <Text style={styles.tagline}>your little space to write, create & remember ♡</Text>
        <Pressable style={styles.mainButton} onPress={() => setScreen('home')}>
          <Text style={styles.mainButtonText}>Get started ✨</Text>
        </Pressable>
      </View>
    );
  }

  if (screen === 'auth') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹ Back</Text></Pressable>
        <Text style={styles.screenTitle}>ALIYA account</Text>

        {sessionUser ? (
          <View style={styles.authCard}>
            <Text style={styles.authGreeting}>Welcome back ♡</Text>
            <Text style={styles.authEmail}>{sessionUser.email}</Text>
            <Pressable style={styles.authPrimaryButton} onPress={handleLogout}>
              <Text style={styles.authPrimaryButtonText}>{authBusy ? 'Logging out...' : 'Logout'}</Text>
            </Pressable>
            <Pressable style={styles.authDeleteButton} onPress={requestDeleteAccount}>
              <Text style={styles.authDeleteButtonText}>{authBusy ? 'Deleting account...' : 'Delete Account'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.authCard}>
            <View style={styles.authTabs}>
              <Pressable style={[styles.authTab, authMode === 'login' && styles.authTabActive]} onPress={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); }}>
                <Text style={authMode === 'login' ? styles.authTabTextActive : styles.authTabText}>Login</Text>
              </Pressable>
              <Pressable style={[styles.authTab, authMode === 'signup' && styles.authTabActive]} onPress={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage(''); }}>
                <Text style={authMode === 'signup' ? styles.authTabTextActive : styles.authTabText}>Sign up</Text>
              </Pressable>
            </View>

            {authMode === 'signup' && (
              <View>
                <Text style={styles.optionTitle}>NAME</Text>
                <TextInput value={authName} onChangeText={setAuthName} placeholder="Your ALIYA name" placeholderTextColor="#9A8E94" style={styles.authInput} autoCapitalize="words" />
              </View>
            )}

            <Text style={styles.optionTitle}>EMAIL</Text>
            <TextInput value={authEmail} onChangeText={setAuthEmail} placeholder="you@example.com" placeholderTextColor="#9A8E94" keyboardType="email-address" autoCapitalize="none" style={styles.authInput} />

            <Text style={styles.optionTitle}>PASSWORD</Text>
            <TextInput value={authPassword} onChangeText={setAuthPassword} placeholder="••••••••" placeholderTextColor="#9A8E94" secureTextEntry style={styles.authInput} />

            {authError ? <Text style={styles.authError}>{authError}</Text> : null}
            {authMessage ? <Text style={styles.authMessage}>{authMessage}</Text> : null}

            <Pressable style={styles.authPrimaryButton} onPress={authMode === 'signup' ? handleSignUp : handleLogin}>
              <Text style={styles.authPrimaryButtonText}>{authBusy ? 'Please wait...' : authMode === 'signup' ? 'Create ALIYA account' : 'Login to ALIYA'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  }

  if (screen === 'home') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.homeContent}>
        <View style={styles.homeTopStrip}>
          <Text style={styles.greeting}>Good afternoon ♡</Text>
          <Pressable style={styles.accountMiniButton} onPress={() => setScreen('auth')}>
            <Text style={styles.accountMiniButtonText}>{sessionUser ? 'Account' : 'Log in / Create account'}</Text>
          </Pressable>
        </View>
        <Text style={styles.homeTitle}>What are you creating today?</Text>

        <Pressable style={styles.newPageButton} onPress={() => setScreen('create')}>
          <Text style={styles.newPageText}>＋ New page</Text>
        </Pressable>

        <Pressable style={styles.studyFeatureButton} onPress={() => {
          setStudyView('stats');
          setExpandedToolbar(null);
          setScreen('study');
        }}>
          <View style={styles.studyFeatureIconWrap}>
            <Text style={styles.studyFeatureIcon}>📚</Text>
          </View>
          <View style={styles.studyFeatureTextWrap}>
            <Text style={styles.studyFeatureTitle}>Study</Text>
            <Text style={styles.studyFeatureSubtitle}>Track your study time & progress</Text>
          </View>
        </Pressable>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search your pages..." placeholderTextColor="#9A8E94" style={styles.searchInput} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Note', 'Diary', 'List', 'Favourites', 'Pinned'].map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterButton, filter === item && styles.selectedFilter]}>
              <Text style={filter === item ? styles.selectedFilterText : styles.filterText}>
                {item === 'All' ? 'All' : item === 'Note' ? 'Notes' : item === 'Diary' ? 'Diary' : item === 'List' ? 'Lists' : item === 'Favourites' ? '♡ Favourites' : '📌 Pinned'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterScroll}>
          {['All categories', ...CATEGORIES].map((item) => (
            <Pressable key={item} onPress={() => setCategoryFilter(item)} style={[styles.filterButton, styles.categoryFilterButton, categoryFilter === item && styles.selectedFilter]}>
              <Text style={categoryFilter === item ? styles.selectedFilterText : styles.filterText}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{search || filter !== 'All' ? 'Your pages' : 'Recent Pages'}</Text>

        {filteredPages.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>{search ? '🔎' : filter === 'Favourites' ? '♡' : filter === 'Pinned' ? '📌' : '🌷'}</Text>
            <Text style={styles.emptyTitle}>{search ? 'Nothing found' : filter === 'Favourites' ? 'No favourites yet' : filter === 'Pinned' ? 'No pinned pages yet' : filter !== 'All' ? `No ${filter.toLowerCase()}s yet` : 'Nothing here yet ♡'}</Text>
            <Text style={styles.emptyText}>{search ? 'Try searching for another word.' : filter === 'Favourites' ? 'Save your favourite pages here.' : filter === 'Pinned' ? 'Pin a saved page from the card.' : filter !== 'All' ? `Create your first ${filter.toLowerCase()}.` : 'Create your first little page.'}</Text>
          </View>
        ) : (
          filteredPages.map((page) => (
            <Pressable key={page.id} style={[styles.pageCard, { backgroundColor: page.pageColour }]} onPress={() => openPage(page)} onLongPress={() => pageOptions(page)} delayLongPress={500}>
              <View style={styles.pageHeader}>
                <Text style={styles.pageIcon}>{page.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.typeRow}>
                    <Text style={styles.pageType}>{page.type}</Text>
                    <View style={styles.cardActionRow}>
                      <Pressable onPress={(event) => { event.stopPropagation(); togglePin(page); }} hitSlop={10} style={styles.pinButton}>
                        <Text style={page.pinned ? styles.pinnedIcon : styles.unpinnedIcon}>{page.pinned ? '📌' : '📍'}</Text>
                      </Pressable>
                      <Pressable onPress={(event) => { event.stopPropagation(); toggleFavourite(page); }} hitSlop={10}>
                        <Text style={styles.favouriteIcon}>{page.favourite ? '♥' : '♡'}</Text>
                      </Pressable>
                    </View>
                  </View>

                  <Text style={[styles.pageTitle, page.font === 'Soft' && { fontStyle: 'italic' }, page.font === 'Bold' && { fontWeight: '700' }, page.font === 'Tiny' && { fontSize: 14 }]}>{page.title}</Text>
                  <Text style={styles.pageCategory}>{page.category || 'No category'}</Text>
                  {page.type === 'Diary' && page.date && <Text style={styles.pageDate}>{page.date}</Text>}
                </View>
              </View>

              {page.decorations && page.decorations.length > 0 && <Text style={styles.savedDecorations}>{page.decorations.join(' ')}</Text>}
              <Text style={[styles.pagePreview, page.font === 'Soft' && { fontStyle: 'italic' }, page.font === 'Bold' && { fontWeight: '700' }, page.font === 'Tiny' && { fontSize: 14 }]}>{page.body || 'No text yet'}</Text>
              <Text style={styles.deleteHint}>Press and hold for options</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    );
  }

  if (screen === 'templates') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.templatesContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹ Back</Text></Pressable>
        <Text style={styles.screenTitle}>Templates</Text>
        <Text style={styles.templateIntro}>Start with a beautiful ready-made page</Text>
        <View style={styles.templateGrid}>
          {TEMPLATE_LIBRARY.map((template) => (
            <Pressable key={template.id} style={styles.templateCard} onPress={() => openTemplate(template)}>
              <View style={styles.templateCardTop}>
                <Text style={styles.templateCardIcon}>{template.icon}</Text>
                <Text style={styles.templateCardTitle}>{template.title}</Text>
              </View>
              <Text style={styles.templateCardSubtitle}>{template.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }


  if (screen === 'create') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.createContent}>
          <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹ Back</Text></Pressable>
          <Text style={styles.screenTitle}>Create something ♡</Text>
          <Pressable style={styles.createCard} onPress={() => openCreate('Note')}><Text style={styles.createEmoji}>📝</Text><Text style={styles.createTitle}>Note</Text><Text style={styles.createSubtitle}>Thoughts, ideas & reminders</Text></Pressable>
          <Pressable style={styles.createCard} onPress={() => openCreate('Diary')}><Text style={styles.createEmoji}>🌷</Text><Text style={styles.createTitle}>Diary</Text><Text style={styles.createSubtitle}>A little memory for the day</Text></Pressable>
          <Pressable style={styles.createCard} onPress={() => openCreate('List')}><Text style={styles.createEmoji}>🎀</Text><Text style={styles.createTitle}>List</Text><Text style={styles.createSubtitle}>To-dos, plans & everything else</Text></Pressable>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'diaryCalendar') {
    const monthStart = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    );

    const monthTitle = monthStart.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });

    const startDay = monthStart.getDay();
    const numberOfDays = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    ).getDate();

    const blanks = [];
    for (let i = 0; i < startDay; i++) {
      blanks.push(null);
    }

    const days = [];
    for (let i = 1; i <= numberOfDays; i++) {
      days.push(
        new Date(
          monthStart.getFullYear(),
          monthStart.getMonth(),
          i
        )
      );
    }

    const cells = [...blanks, ...days];
    while (cells.length < 42) {
      cells.push(null);
    }

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.calendarContent}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => setScreen('home')}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <Text style={styles.screenTitle}>Diary Calendar</Text>

          <View style={styles.calendarTopBar}>
            <Pressable
              style={styles.calendarArrow}
              onPress={() => {
                const newMonth = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() - 1,
                  1
                );
                setCalendarMonth(newMonth);
              }}
            >
              <Text style={styles.calendarArrowText}>‹</Text>
            </Pressable>

            <Text style={styles.calendarMonthText}>{monthTitle}</Text>

            <Pressable
              style={styles.calendarArrow}
              onPress={() => {
                const newMonth = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() + 1,
                  1
                );
                setCalendarMonth(newMonth);
              }}
            >
              <Text style={styles.calendarArrowText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.calendarWeekRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {cells.map((cell, index) => {
              if (!cell) {
                return (
                  <View
                    key={`empty-${index}`}
                    style={styles.calendarBlankCell}
                  />
                );
              }

              const cellKey = formatDateKey(cell);
              const diaryPages = pages.filter(
                (page) =>
                  page.type === 'Diary' &&
                  getDateKeyFromPage(page) === cellKey
              );

              return (
                <Pressable
                  key={cellKey}
                  style={[
                    styles.calendarDayCell,
                    diaryPages.length > 0 && styles.calendarHasEntry,
                    cell.getMonth() !== calendarMonth.getMonth() && styles.calendarOutsideMonth,
                  ]}
                  onPress={() => {
                    if (diaryPages.length > 0) {
                      openPage(diaryPages[0]);
                    } else {
                      openCreate('Diary', cell);
                    }
                  }}
                >
                  <Text style={styles.calendarDayText}>{cell.getDate()}</Text>
                  {diaryPages.length > 0 && (
                    <Text style={styles.calendarEntryDot}>●</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'study') {
    const todayKey = getTodayInputValue();
    const todayMinutes = studySessions
      .filter((session) => session.date === todayKey)
      .reduce((total, session) => total + Number(session.duration || 0), 0);

    const todayObj = new Date();
    const mondayOffset = todayObj.getDay() === 0 ? -6 : 1 - todayObj.getDay();
    const monday = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate() + mondayOffset);
    const currentWeekDays = [];
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      currentWeekDays.push(formatDateKey(date));
    }

    const weekMinutes = studySessions
      .filter((session) => currentWeekDays.includes(session.date))
      .reduce((total, session) => total + Number(session.duration || 0), 0);

    const subjectTotals = {};
    for (const session of studySessions) {
      subjectTotals[session.subject] = (subjectTotals[session.subject] || 0) + Number(session.duration || 0);
    }

    const sortedSubjects = Object.keys(subjectTotals).sort();
    const recentSessions = [...studySessions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    const dateKeys = [...new Set(studySessions.map((session) => session.date))].sort().reverse();
    const dateMap = new Map();
    for (const session of studySessions) {
      const key = session.date;
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key).push(session);
    }

    const streakDates = new Set(studySessions.map((session) => session.date));
    let streak = 0;
    let cursor = new Date();
    while (streakDates.has(formatDateKey(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    }

    if (studyView === 'form') {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.studyContent} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹ Back</Text></Pressable>
          <Text style={styles.screenTitle}>Log study</Text>
          <View style={styles.studyFormCard}>
            <Text style={styles.optionTitle}>SUBJECT</Text>
            <View style={styles.studySubjectRow}>
              {STUDY_SUBJECTS.map((subject) => (
                <Pressable key={subject} onPress={() => {
                  setStudySubject(subject);
                  setStudyCustomSubject('');
                }} style={[styles.studySubjectButton, studySubject === subject && styles.studySubjectButtonActive]}>
                  <Text style={studySubject === subject ? styles.studySubjectTextActive : styles.studySubjectText}>{subject}</Text>
                </Pressable>
              ))}
            </View>
            {studySubject === 'Other' && (
              <TextInput value={studyCustomSubject} onChangeText={setStudyCustomSubject} placeholder="Create your own subject" placeholderTextColor="#9A8E94" style={styles.studyInput} />
            )}
            <Text style={styles.optionTitle}>DATE</Text>
            <TextInput value={studyDate} onChangeText={setStudyDate} placeholder="YYYY-MM-DD" placeholderTextColor="#9A8E94" style={styles.studyInput} />
            <Text style={styles.optionTitle}>DURATION</Text>
            <View style={styles.durationRow}>
              <TextInput value={String(studyHours)} onChangeText={(text) => setStudyHours(Number(text) || 0)} keyboardType="numeric" style={styles.studyDurationInput} />
              <Text style={styles.durationLabel}>hours</Text>
              <TextInput value={String(studyMinutes)} onChangeText={(text) => setStudyMinutes(Number(text) || 0)} keyboardType="numeric" style={styles.studyDurationInput} />
              <Text style={styles.durationLabel}>minutes</Text>
            </View>
            <Text style={styles.optionTitle}>NOTES</Text>
            <TextInput value={studyNotes} onChangeText={setStudyNotes} placeholder="Short study note" placeholderTextColor="#9A8E94" multiline style={styles.studyNotesInput} />
            <View style={styles.studyFormActions}>
              <Pressable style={styles.studyCancelButton} onPress={() => setStudyView('stats')}>
                <Text style={styles.studyCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.studySaveButton} onPress={saveStudySession}>
                <Text style={styles.studySaveText}>Save session</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      );
    }

    if (studyView === 'history') {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.studyContent} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹ Back</Text></Pressable>
          <Text style={styles.screenTitle}>Study History</Text>
          <View style={styles.studyTabs}>
            <Pressable style={styles.studyTab} onPress={() => setStudyView('stats')}>
              <Text style={styles.studyTabText}>Statistics</Text>
            </Pressable>
            <Pressable style={[styles.studyTab, styles.studyTabActive]} onPress={() => setStudyView('history')}>
              <Text style={styles.studyTabText}>History</Text>
            </Pressable>
          </View>
          <Pressable style={styles.studyLogButton} onPress={startStudyForm}>
            <Text style={styles.studyLogButtonText}>+ Log study</Text>
          </Pressable>
          {dateKeys.length === 0 ? (
            <View style={styles.studyEmptyCard}><Text style={styles.emptyTitle}>No study sessions yet</Text></View>
          ) : dateKeys.map((dateKey) => (
            <View key={dateKey} style={styles.studyHistoryDateCard}>
              <Text style={styles.studyHistoryDate}>{parseDisplayDate(dateKey)}</Text>
              {dateMap.get(dateKey).map((session) => (
                <View key={session.id} style={styles.historySessionRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historySubject}>{session.subject}</Text>
                    <Text style={styles.historyDuration}>{formatDuration(session.duration)}{session.notes ? ` · ${session.notes}` : ''}</Text>
                  </View>
                  <View style={styles.historyActions}>
                    <Pressable onPress={() => openStudyEdit(session)} style={styles.historyEdit}><Text style={styles.historyEditText}>Edit</Text></Pressable>
                    <Pressable onPress={() => deleteStudySession(session.id)} style={styles.historyDelete}><Text style={styles.historyDeleteText}>Delete</Text></Pressable>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      );
    }

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.studyContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹ Back</Text></Pressable>
        <Text style={styles.screenTitle}>Study / Statistics</Text>
        <View style={styles.studyTabs}>
          <Pressable style={[styles.studyTab, styles.studyTabActive]} onPress={() => setStudyView('stats')}>
            <Text style={styles.studyTabText}>Statistics</Text>
          </Pressable>
          <Pressable style={styles.studyTab} onPress={() => setStudyView('history')}>
            <Text style={styles.studyTabText}>History</Text>
          </Pressable>
        </View>
        <Pressable style={styles.studyLogButton} onPress={startStudyForm}>
          <Text style={styles.studyLogButtonText}>+ Log study</Text>
        </Pressable>

        <View style={styles.studyStatsGrid}>
          <View style={styles.studyMetricCard}>
            <Text style={styles.studyMetricLabel}>Today's total</Text>
            <Text style={styles.studyMetricValue}>{formatDuration(todayMinutes)}</Text>
          </View>
          <View style={styles.studyMetricCard}>
            <Text style={styles.studyMetricLabel}>This week's total</Text>
            <Text style={styles.studyMetricValue}>{formatDuration(weekMinutes)}</Text>
          </View>
        </View>

        <View style={styles.studyCard}>
          <Text style={styles.studySectionTitle}>🔥 {streak} day study streak</Text>
        </View>

        <View style={styles.studyCard}>
          <Text style={styles.studySectionTitle}>Study by subject</Text>
          {sortedSubjects.length === 0 ? <Text style={styles.emptyText}>No study data yet.</Text> : sortedSubjects.map((subject) => (
            <View key={subject} style={styles.subjectRow}>
              <Text style={styles.subjectName}>{subject}</Text>
              <Text style={styles.subjectDuration}>{formatDuration(subjectTotals[subject])}</Text>
            </View>
          ))}
        </View>

        <View style={styles.studyCard}>
          <Text style={styles.studySectionTitle}>Recent study record</Text>
          {recentSessions.length === 0 ? <Text style={styles.emptyText}>No study sessions yet.</Text> : recentSessions.map((session) => (
            <View key={session.id} style={styles.recentSessionRow}>
              <Text style={styles.recentDate}>{parseDisplayDate(session.date)}</Text>
              <Text style={styles.recentSubject}>{session.subject}</Text>
              <Text style={styles.recentDuration}>{formatDuration(session.duration)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.studyCard}>
          <Text style={styles.studySectionTitle}>Weekly statistics</Text>
          <View style={styles.weekRow}>
            {currentWeekDays.map((dateKey) => {
              const dateObj = new Date(dateKey.split('-')[0], Number(dateKey.split('-')[1]) - 1, Number(dateKey.split('-')[2]));
              const dayMinutes = studySessions
                .filter((session) => session.date === dateKey)
                .reduce((total, session) => total + Number(session.duration || 0), 0);
              const maxDayMinutes = Math.max(...studySessions.map((x) => Number(x.duration || 0)), 60);
              const height = Math.max(8, Math.round((dayMinutes / maxDayMinutes) * 50));
              const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
              return (
                <View key={dateKey} style={styles.weekDayCol}>
                  <View style={styles.weekBarWrap}>
                    <View style={[styles.weekBar, { height }]} />
                  </View>
                  <Text style={styles.weekDayText}>{dayName}</Text>
                  <Text style={styles.weekDurationText}>{formatDuration(dayMinutes)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  }


  const editorToolbarItems = type === 'Diary'
    ? ['📅 Date', '🎨 Style', '🔤 Text', '😊 Icon', '✨ Decor', '📸 Photo', '📌 Options']
    : type === 'List'
      ? ['🎨 Style', '🔤 Text', '😊 Icon', '✨ Decor', '📸 Photo', '📌 Options']
      : ['🎨 Style', '🔤 Text', '😊 Icon', '✨ Decor', '📸 Photo', '📌 Options'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹ Back</Text></Pressable>
      <Text style={styles.screenTitle}>{editingPage ? 'Edit your page ♡' : 'Make it yours ♡'}</Text>

      <View style={[styles.preview, { backgroundColor: pageColour }]}>
        <Text style={styles.previewIcon}>{icon}</Text>
        {type === 'Diary' && date && <Text style={styles.diaryDate}>{date}</Text>}
        <TextInput value={title} onChangeText={updateTitle} placeholder={type === 'Diary' ? 'A little title...' : type === 'List' ? 'What are you planning?' : 'Give your page a title...'} placeholderTextColor="#9A8E94" style={[styles.titleInput, getFontStyle()]} />
        {Platform.OS === 'web' ? (
          <TextInput value={body} onChangeText={(value) => updateBody(value)} multiline placeholder={type === 'Diary' ? 'How was your day? What are you thinking about? ♡' : type === 'List' ? '☐ Write your first thing here...' : 'Start writing...'} placeholderTextColor="#9A8E94" style={[styles.bodyInput, getFontStyle()]} />
        ) : (
          <View style={styles.richEditorContainer}>
            <RichEditor
              ref={richEditorRef}
              initialContentHTML={bodyHtml || makeRichBody(body)}
              placeholder={type === 'Diary' ? 'How was your day? What are you thinking about? ♡' : type === 'List' ? '☐ Write your first thing here...' : 'Start writing...'}
              onChange={(html) => updateBody(html)}
              editorStyle={{ backgroundColor: 'transparent', color: '#4A4145', contentCSSText: 'font-family: sans-serif;', initialCSSText: 'font-family: sans-serif;' }}
              style={styles.richEditorContent}
              disabled={false}
              useContainer={true}
              initialHeight={160}
            />
          </View>
        )}
        {selectedDecorations.length > 0 && <Text style={styles.decorationPreview}>{selectedDecorations.join(' ')}</Text>}
      </View>

      {type !== 'List' && photoUri ? (
        <View style={styles.photoPreviewBox}>
          <Image source={{ uri: photoUri }} style={styles.photoPreviewImage} />
          <Pressable style={styles.removePhotoButton} onPress={removePhoto}>
            <Text style={styles.removePhotoText}>Remove Photo</Text>
          </Pressable>
        </View>
      ) : null}

      {Platform.OS !== 'web' && (
        <View style={styles.richToolbarWrap}>
          <RichToolbar
            getEditor={() => richEditorRef}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.alignLeft,
              actions.alignCenter,
              actions.alignRight,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.fontSize,
              actions.fontName,
              actions.setForeColor,
              actions.setHiliteColor,
            ]}
            iconTint="#8A7B82"
            selectedIconTint="#A1545B"
            selectedButtonStyle={{ backgroundColor: '#F7D6E0' }}
            disabledButtonStyle={{ opacity: 0.6 }}
            onPressAddImage={() => choosePhoto()}
            onInsertLink={() => {}}
          />
        </View>
      )}

      <View style={styles.toolbarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
          {editorToolbarItems.map((item) => {
            const section = item.replace(/^[^\w]+\s/, '').trim();
            const itemKey = item;
            const isOpen = expandedToolbar === section;
            return (
              <Pressable key={itemKey} onPress={() => toggleToolbar(section)} style={[styles.toolbarButton, isOpen && styles.toolbarButtonActive]}>
                <Text style={styles.toolbarButtonText}>{item}</Text>
              </Pressable>
            );
          })}
          <Pressable key="undo" onPress={undoEditorText} disabled={editorUndoStack.length === 0} style={[styles.toolbarButton, editorUndoStack.length === 0 && styles.toolbarButtonDisabled]}>
            <Text style={[styles.toolbarButtonText, editorUndoStack.length === 0 && styles.toolbarButtonTextDisabled]}>↶ Undo</Text>
          </Pressable>
          <Pressable key="redo" onPress={redoEditorText} disabled={editorRedoStack.length === 0} style={[styles.toolbarButton, editorRedoStack.length === 0 && styles.toolbarButtonDisabled]}>
            <Text style={[styles.toolbarButtonText, editorRedoStack.length === 0 && styles.toolbarButtonTextDisabled]}>↷ Redo</Text>
          </Pressable>
        </ScrollView>

        {expandedToolbar && (
          <View style={styles.expandedPanel}>
            {expandedToolbar === 'Date' && type === 'Diary' && (
              <View style={styles.toolbarOptionsSection}>
                <Text style={styles.optionTitle}>DIARY DATE</Text>
                <View style={styles.dateRow}>
                  <TextInput value={date} onChangeText={setDate} placeholder="25 December 2026" placeholderTextColor="#9A8E94" style={styles.dateInput} />
                  <Pressable style={styles.todayButton} onPress={() => setDate(getToday())}>
                    <Text style={styles.todayButtonText}>Today</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {expandedToolbar === 'Photo' && type !== 'List' && (
              <View style={styles.toolbarOptionsSection}>
                <Text style={styles.optionTitle}>PHOTO</Text>
                <View style={styles.photoOptionsRow}>
                  <Pressable style={styles.photoActionButton} onPress={choosePhoto}>
                    <Text style={styles.photoActionText}>Add Photo</Text>
                  </Pressable>
                  {photoUri ? (
                    <Pressable style={styles.photoActionButton} onPress={removePhoto}>
                      <Text style={styles.photoActionText}>Remove Photo</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}

            {expandedToolbar === 'Style' && (
              <View style={styles.toolbarOptionsSection}>
                <Text style={styles.optionTitle}>PAGE COLOUR & DESIGN</Text>
                <View style={styles.optionRow}>
                  {[COLORS.cream, COLORS.pink, COLORS.blue, COLORS.lilac, COLORS.sage, COLORS.yellow].map((colour) => (
                    <Pressable key={colour} onPress={() => setPageColour(colour)} style={[styles.colourCircle, { backgroundColor: colour }, pageColour === colour && styles.selectedColour]} />
                  ))}
                </View>
                <View style={styles.themeRow}>
                  {DESIGN_THEME_LIST.map((name) => (
                    <Pressable key={name} onPress={() => {
                      const theme = DESIGN_THEMES[name];
                      setPageColour(theme.pageColour);
                    }} style={[styles.themeButton, pageColour === DESIGN_THEMES[name].pageColour && styles.selectedThemeButton]}>
                      <Text style={styles.themeButtonText}>{DESIGN_THEMES[name].label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {expandedToolbar === 'Text' && (
              <View style={styles.toolbarOptionsSection}>
                <Text style={styles.optionTitle}>TEXT STYLE</Text>

                <Text style={styles.optionSubtitle}>Font</Text>
                <View style={styles.styleRow}>
                  {FONT_OPTIONS_LIST.map((item) => (
                    <Pressable key={item} onPress={() => {
                      setFont(item);
                      setFontFamily(item);
                      if (Platform.OS !== 'web') {
                        applyRichEditorMethod('fontName', FONT_OPTIONS[item].family);
                      }
                    }} style={[styles.styleButton, font === item && styles.selectedStyle]}>
                      <Text style={font === item ? styles.selectedStyleText : styles.styleText}>{FONT_OPTIONS[item].label}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.optionSubtitle}>Size</Text>
                <View style={styles.styleRow}>
                  {FONT_SIZE_OPTIONS.map((item) => (
                    <Pressable key={item} onPress={() => {
                      setFontSize(item);
                      if (Platform.OS !== 'web') {
                        const map = { Small: 3, Normal: 4, Large: 5, Heading: 6 };
                        applyRichEditorMethod('fontSize', map[item] || 4);
                      }
                    }} style={[styles.styleButton, fontSize === item && styles.selectedStyle]}>
                      <Text style={fontSize === item ? styles.selectedStyleText : styles.styleText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.optionSubtitle}>Formatting</Text>
                <View style={styles.styleRow}>
                  <Pressable onPress={() => {
                    setBold(!bold);
                    if (Platform.OS !== 'web') applyRichEditorMethod('bold');
                  }} style={[styles.styleButton, bold && styles.selectedStyle]}>
                    <Text style={bold ? styles.selectedStyleText : styles.styleText}>Bold</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    setItalic(!italic);
                    if (Platform.OS !== 'web') applyRichEditorMethod('italic');
                  }} style={[styles.styleButton, italic && styles.selectedStyle]}>
                    <Text style={italic ? styles.selectedStyleText : styles.styleText}>Italic</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    setUnderline(!underline);
                    if (Platform.OS !== 'web') applyRichEditorMethod('underline');
                  }} style={[styles.styleButton, underline && styles.selectedStyle]}>
                    <Text style={underline ? styles.selectedStyleText : styles.styleText}>Underline</Text>
                  </Pressable>
                </View>

                <Text style={styles.optionSubtitle}>Alignment</Text>
                <View style={styles.styleRow}>
                  {TEXT_ALIGN_OPTIONS.map((item) => (
                    <Pressable key={item} onPress={() => {
                      setTextAlign(item);
                      if (Platform.OS !== 'web') {
                        if (item === 'left') applyRichEditorMethod('alignLeft');
                        if (item === 'center') applyRichEditorMethod('alignCenter');
                        if (item === 'right') applyRichEditorMethod('alignRight');
                      }
                    }} style={[styles.styleButton, textAlign === item && styles.selectedStyle]}>
                      <Text style={textAlign === item ? styles.selectedStyleText : styles.styleText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.optionSubtitle}>Highlight</Text>
                <View style={styles.optionRow}>
                  {HIGHLIGHT_NAMES.map((name) => (
                    <Pressable key={name} onPress={() => {
                      setHighlightColor(name);
                      if (Platform.OS !== 'web') applyRichEditorMethod('highlightColor', HIGHLIGHT_PALETTE[name]);
                    }} style={[styles.colourCircle, { backgroundColor: HIGHLIGHT_PALETTE[name] }, highlightColor === name && styles.selectedColour]} />
                  ))}
                </View>

                <Text style={styles.optionSubtitle}>Text colour</Text>
                <View style={styles.optionRow}>
                  {TEXT_COLOUR_NAMES.map((name) => (
                    <Pressable key={name} onPress={() => {
                      setTextColor(name);
                      if (Platform.OS !== 'web') applyRichEditorMethod('textColor', TEXT_COLOUR_PALETTE[name]);
                    }} style={[styles.colourCircle, { backgroundColor: TEXT_COLOUR_PALETTE[name] }, textColor === name && styles.selectedColour]} />
                  ))}
                </View>

                <Text style={styles.optionSubtitle}>List style</Text>
                <View style={styles.styleRow}>
                  <Pressable onPress={() => {
                    setListStyle('none');
                  }} style={[styles.styleButton, listStyle === 'none' && styles.selectedStyle]}>
                    <Text style={listStyle === 'none' ? styles.selectedStyleText : styles.styleText}>Plain</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    setListStyle('bullet');
                    if (Platform.OS !== 'web') applyRichEditorMethod('bullet');
                  }} style={[styles.styleButton, listStyle === 'bullet' && styles.selectedStyle]}>
                    <Text style={listStyle === 'bullet' ? styles.selectedStyleText : styles.styleText}>Bullet</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    setListStyle('numbered');
                    if (Platform.OS !== 'web') applyRichEditorMethod('numbered');
                  }} style={[styles.styleButton, listStyle === 'numbered' && styles.selectedStyle]}>
                    <Text style={listStyle === 'numbered' ? styles.selectedStyleText : styles.styleText}>Numbered</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {expandedToolbar === 'Icon' && (
              <View style={styles.toolbarOptionsSection}>
                <Text style={styles.optionTitle}>PAGE ICON</Text>
                <View style={styles.emojiRow}>
                  {emojis.map((item) => (
                    <Pressable key={item} onPress={() => setIcon(item)} style={[styles.emojiButton, icon === item && styles.selectedEmoji]}>
                      <Text style={styles.emojiText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {expandedToolbar === 'Decor' && (
              <View style={styles.toolbarOptionsSection}>
                <Text style={styles.optionTitle}>DECORATIONS</Text>
                <View style={styles.decorationGrid}>
                  {decorations.map((item) => (
                    <Pressable key={item} onPress={() => toggleDecoration(item)} style={[styles.decorationButton, selectedDecorations.includes(item) && styles.selectedDecoration]}>
                      <Text style={styles.decorationText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {expandedToolbar === 'Options' && (
              <View style={styles.toolbarOptionsSection}>
                <Text style={styles.optionTitle}>CATEGORY</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((item) => (
                    <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryButton, category === item && styles.selectedCategory]}>
                      <Text style={category === item ? styles.selectedCategoryText : styles.categoryText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {type === 'List' && (
        <View style={styles.taskSection}>
          <Text style={styles.optionTitle}>TO-DO LIST</Text>
          <View style={styles.taskAddRow}>
            <TextInput value={taskInput} onChangeText={setTaskInput} placeholder="Add a task..." placeholderTextColor="#9A8E94" style={styles.taskInput} />
            <Pressable style={styles.taskAddButton} onPress={addTask}><Text style={styles.taskAddText}>+</Text></Pressable>
          </View>
          {tasks.length === 0 ? <Text style={styles.emptyTasksText}>No tasks yet</Text> : tasks.map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <Pressable onPress={() => toggleTask(task.id)} style={[styles.taskCheck, task.completed && styles.taskCheckDone]}><Text style={styles.taskCheckText}>{task.completed ? '✓' : ''}</Text></Pressable>
              <Text style={[styles.taskText, task.completed && styles.taskTextDone]}>{task.text}</Text>
              <Pressable onPress={() => deleteTask(task.id)}><Text style={styles.taskDelete}>×</Text></Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.saveButton} onPress={savePage}>
        <Text style={styles.saveButtonText}>{editingPage ? 'Save changes' : 'Save page'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcome: { flex: 1, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', padding: 30 },
  logo: { fontSize: 54, fontWeight: '700', color: COLORS.text },
  tagline: { fontSize: 18, color: '#8A7B82', marginTop: 14, textAlign: 'center' },
  mainButton: { backgroundColor: COLORS.pink, borderRadius: 22, paddingVertical: 14, paddingHorizontal: 26, marginTop: 70 },
  mainButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  container: { flex: 1, backgroundColor: COLORS.cream },
  homeContent: { padding: 24, paddingTop: 48, paddingBottom: 80 },
  greeting: { fontSize: 22, color: COLORS.text },
  homeTitle: { fontSize: 28, color: COLORS.text, fontWeight: '600', marginTop: 8 },
  newPageButton: { backgroundColor: COLORS.white, borderRadius: 22, padding: 14, alignItems: 'center', marginTop: 18, marginBottom: 10 },
  newPageText: { fontSize: 16, color: COLORS.text, fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 14, marginTop: 14 },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },
  diaryButton: { backgroundColor: COLORS.pink, borderRadius: 22, padding: 14, alignItems: 'center', marginTop: 14 },
  diaryButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  filterScroll: { marginTop: 14, marginBottom: 4 },
  categoryFilterScroll: { marginBottom: 8 },
  categoryFilterButton: { marginTop: 4 },
  filterButton: { backgroundColor: COLORS.white, borderRadius: 18, paddingVertical: 9, paddingHorizontal: 14, marginRight: 7 },
  selectedFilter: { backgroundColor: COLORS.pink },
  filterText: { color: COLORS.text, fontSize: 13 },
  selectedFilterText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },

  templateFeatureButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 18, marginTop: 10, marginBottom: 14, borderWidth: 1, borderColor: '#EADFDA', shadowColor: '#B49EA6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 5, elevation: 2 },
  templateFeatureIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.sage, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  templateFeatureIcon: { fontSize: 22 },
  templateFeatureTextWrap: { flex: 1 },
  templateFeatureTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  templateFeatureSubtitle: { color: '#8A7B82', fontSize: 14, marginTop: 4 },
  studyFeatureButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 18, marginTop: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EADFDA', shadowColor: '#B49EA6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 5, elevation: 2 },
  studyFeatureIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.pink, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  studyFeatureIcon: { fontSize: 22 },
  studyFeatureTextWrap: { flex: 1 },
  studyFeatureTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  studyFeatureSubtitle: { color: '#8A7B82', fontSize: 14, marginTop: 4 },
  templatesContent: { padding: 24, paddingTop: 60, paddingBottom: 80 },
  templateIntro: { color: '#8A7B82', fontSize: 15, fontWeight: '500', marginBottom: 16 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  templateCard: { backgroundColor: COLORS.white, borderRadius: 22, padding: 16, width: '48%', marginBottom: 12, borderWidth: 1, borderColor: '#EADFDA' },
  templateCardTop: { flexDirection: 'row', alignItems: 'center' },
  templateCardIcon: { fontSize: 22, marginRight: 8 },
  templateCardTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  templateCardSubtitle: { color: '#8A7B82', fontSize: 12, marginTop: 8, lineHeight: 18 },
  authContent: { padding: 24, paddingTop: 60, paddingBottom: 80 },
  authCard: { backgroundColor: COLORS.white, borderRadius: 26, padding: 22, borderWidth: 1, borderColor: '#EADFDA' },
  authTabs: { flexDirection: 'row', marginBottom: 16 },
  authTab: { flex: 1, backgroundColor: '#FFFDF8', borderRadius: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EADFDA', marginRight: 8 },
  authTabActive: { backgroundColor: COLORS.pink },
  authTabText: { color: COLORS.text, fontWeight: '600' },
  authTabTextActive: { color: COLORS.text, fontWeight: '700' },
  authInput: { backgroundColor: '#FFFDFB', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: '#EADFDA', marginBottom: 12 },
  authPrimaryButton: { backgroundColor: COLORS.pink, borderRadius: 16, padding: 15, alignItems: 'center', marginTop: 16 },
  authPrimaryButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  authDeleteButton: { backgroundColor: '#FFF7F8', borderRadius: 16, padding: 15, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#D7A7AB' },
  authDeleteButtonText: { color: '#9B6878', fontWeight: '700', fontSize: 15 },
  authError: { color: '#A1545B', fontSize: 13, marginTop: 10, fontWeight: '600' },
  authMessage: { color: '#6B7C63', fontSize: 13, marginTop: 10, fontWeight: '600' },
  authGreeting: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  authEmail: { color: '#8A7B82', fontSize: 14, marginTop: 8 },
  homeTopStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accountMiniButton: { backgroundColor: COLORS.white, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: '#EADFDA' },
  accountMiniButtonText: { color: COLORS.text, fontWeight: '700' },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 9 },
  themeButton: { backgroundColor: COLORS.white, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#EADFDA' },
  selectedThemeButton: { backgroundColor: COLORS.pink, borderColor: '#C89AA8' },
  themeButtonText: { color: COLORS.text, fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginTop: 25, marginBottom: 14 },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 30, alignItems: 'center' },
  emptyEmoji: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  emptyText: { color: '#887B81', marginTop: 6, textAlign: 'center' },
  pageCard: { borderRadius: 24, padding: 20, marginBottom: 15 },
  pageHeader: { flexDirection: 'row', alignItems: 'center' },
  pageIcon: { fontSize: 30, marginRight: 12 },
  typeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageType: { fontSize: 12, color: '#8A7C82', textTransform: 'uppercase', letterSpacing: 1 },
  favouriteIcon: { fontSize: 24, color: '#9B6878', paddingLeft: 10 },
  pageTitle: { fontSize: 20, color: COLORS.text, marginTop: 3 },
  pageCategory: { fontSize: 11, color: '#8A7B82', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  pageDate: { fontSize: 12, color: '#887B81', marginTop: 4 },
  pagePreview: { fontSize: 14, color: '#665B60', marginTop: 15, lineHeight: 20 },
  savedDecorations: { fontSize: 20, marginTop: 12 },
  deleteHint: { fontSize: 11, color: '#9A8E94', marginTop: 14, textAlign: 'right' },
  createContent: { padding: 24, paddingTop: 60, paddingBottom: 50 },
  back: { fontSize: 16, color: '#7D6D74', marginBottom: 25 },
  screenTitle: { fontSize: 30, fontWeight: '600', color: COLORS.text, marginBottom: 25 },
  createCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 22, marginBottom: 15 },
  createEmoji: { fontSize: 28 },
  createTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginTop: 8 },
  createSubtitle: { color: '#887B81', marginTop: 5 },
  editorContent: { padding: 24, paddingTop: 60, paddingBottom: 60 },
  preview: { borderRadius: 28, padding: 24, minHeight: 330 },
  previewIcon: { fontSize: 28, marginBottom: 8 },
  diaryDate: { fontSize: 13, color: '#8A7B82', marginBottom: 10 },
  titleInput: { fontSize: 26, color: COLORS.text, marginBottom: 15 },
  bodyInput: { fontSize: 16, color: COLORS.text, minHeight: 150, textAlignVertical: 'top', lineHeight: 24 },
  decorationPreview: { fontSize: 23, marginTop: 15, lineHeight: 32 },
  photoPreviewBox: { marginTop: 14, alignItems: 'center', backgroundColor: '#FFFDF8', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#EADFDA' },
  photoPreviewImage: { width: '100%', height: 180, borderRadius: 16, resizeMode: 'cover', backgroundColor: '#F6EDEB' },
  removePhotoButton: { backgroundColor: COLORS.pink, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, marginTop: 10 },
  removePhotoText: { color: COLORS.text, fontWeight: '600' },
  toolbarWrap: { marginTop: 12, backgroundColor: '#FFFDF8', borderRadius: 20, padding: 8, borderWidth: 1, borderColor: '#EADFDA' },
  toolbarRow: { alignItems: 'center', paddingVertical: 2 },
  toolbarButton: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderWidth: 1, borderColor: '#F4DCE4' },
  toolbarButtonActive: { backgroundColor: COLORS.pink, borderColor: '#C89AA8' },
  toolbarButtonDisabled: { backgroundColor: '#F8F3F1', borderColor: '#EADFDA', opacity: 0.72 },
  toolbarButtonText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  toolbarButtonTextDisabled: { color: '#9A8E94' },
  expandedPanel: { backgroundColor: '#FCF7F4', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginTop: 8, borderWidth: 1, borderColor: '#EADFDA' },
  toolbarOptionsSection: { marginTop: 4 },
  photoOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  photoActionButton: { backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#EADFDA' },
  photoActionText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14 },
  todayButton: { backgroundColor: COLORS.pink, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginLeft: 8 },
  todayButtonText: { color: COLORS.text, fontWeight: '600' },
  optionTitle: { fontSize: 12, letterSpacing: 1.3, color: '#8A7B82', fontWeight: '600', marginTop: 28, marginBottom: 12 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  colourCircle: { width: 40, height: 40, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  selectedColour: { borderWidth: 3, borderColor: COLORS.text },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryButton: { backgroundColor: COLORS.white, borderRadius: 18, paddingVertical: 9, paddingHorizontal: 13, marginRight: 8, marginBottom: 8 },
  selectedCategory: { backgroundColor: COLORS.pink },
  categoryText: { color: COLORS.text, fontSize: 12 },
  selectedCategoryText: { color: COLORS.text, fontWeight: '600', fontSize: 12 },
  styleRow: { flexDirection: 'row', flexWrap: 'wrap' },
  styleButton: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: COLORS.white, borderRadius: 18, marginRight: 8, marginBottom: 8 },
  selectedStyle: { backgroundColor: COLORS.pink },
  styleText: { color: COLORS.text },
  selectedStyleText: { color: COLORS.text, fontWeight: '600' },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap' },
  emojiButton: { width: 48, height: 48, backgroundColor: COLORS.white, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 8 },
  selectedEmoji: { backgroundColor: COLORS.pink },
  emojiText: { fontSize: 23 },
  decorationGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  decorationButton: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 8 },
  selectedDecoration: { backgroundColor: COLORS.pink },
  decorationText: { fontSize: 23 },
  taskSection: { marginTop: 16 },
  taskAddRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  taskInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 15 },
  taskAddButton: { backgroundColor: COLORS.pink, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, marginLeft: 8 },
  taskAddText: { color: COLORS.text, fontWeight: '600' },
  emptyTasksText: { color: '#887B81', fontSize: 13, marginTop: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#E7DCE1' },
  taskCheck: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#9A8E94', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  taskCheckDone: { backgroundColor: COLORS.pink, borderColor: COLORS.text },
  taskCheckText: { color: COLORS.text, fontWeight: '600' },
  taskText: { flex: 1, color: COLORS.text, fontSize: 15 },
  taskTextDone: { textDecorationLine: 'line-through', color: '#8A7B82' },
  taskDelete: { color: '#9B6878', fontSize: 22, paddingLeft: 12 },
  saveButton: { backgroundColor: COLORS.pink, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 25 },
  saveButtonText: { color: COLORS.text, fontWeight: '600', fontSize: 16 },
  cardActionRow: { flexDirection: 'row', alignItems: 'center' },
  pinButton: { paddingRight: 8 },
  pinnedIcon: { color: COLORS.text, fontSize: 22 },
  unpinnedIcon: { color: '#8A7B82', fontSize: 22 },
  calendarContent: { padding: 24, paddingTop: 60, paddingBottom: 80 },
  calendarTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  calendarArrow: { backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16 },
  calendarArrowText: { fontSize: 22, color: COLORS.text },
  calendarMonthText: { fontSize: 22, color: COLORS.text, fontWeight: '600' },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calendarWeekDay: { flex: 1, textAlign: 'center', color: '#8A7B82', fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  calendarDayCell: { width: '13.5%', height: 56, borderRadius: 14, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  calendarBlankCell: { width: '13.5%', height: 56, marginBottom: 8 },
  calendarOutsideMonth: { opacity: 0.5 },
  calendarHasEntry: { backgroundColor: COLORS.pink },
  calendarDayText: { color: COLORS.text, fontSize: 14 },
  calendarEntryDot: { color: '#9B6878', fontSize: 12, marginTop: 4 },
  studyContent: { padding: 24, paddingTop: 60, paddingBottom: 80 },
  studyTabs: { flexDirection: 'row', marginBottom: 12 },
  studyTab: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, paddingVertical: 10, alignItems: 'center', marginRight: 8 },
  studyTabActive: { backgroundColor: COLORS.pink },
  studyTabText: { color: COLORS.text, fontWeight: '600' },
  studyLogButton: { backgroundColor: COLORS.pink, borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 12 },
  studyLogButtonText: { color: COLORS.text, fontWeight: '700' },
  studyStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  studyMetricCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, flex: 1, marginRight: 10, marginBottom: 10 },
  studyMetricLabel: { color: '#8A7B82', fontSize: 12, fontWeight: '600' },
  studyMetricValue: { color: COLORS.text, fontSize: 20, marginTop: 8, fontWeight: '700' },
  studyCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 12 },
  studySectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 10 },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  subjectName: { color: COLORS.text, fontWeight: '600' },
  subjectDuration: { color: '#8A7B82' },
  recentSessionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  recentDate: { color: '#8A7B82', fontSize: 12 },
  recentSubject: { color: COLORS.text, fontWeight: '600', flex: 1, marginLeft: 8 },
  recentDuration: { color: COLORS.text, fontWeight: '600' },
  weekRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  weekDayCol: { alignItems: 'center', flex: 1 },
  weekBarWrap: { height: 70, width: 22, justifyContent: 'flex-end' },
  weekBar: { width: 18, borderRadius: 10, backgroundColor: COLORS.pink, minHeight: 8 },
  weekDayText: { color: '#8A7B82', fontSize: 11, marginTop: 8 },
  weekDurationText: { color: '#8A7B82', fontSize: 10 },
  studyEmptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16 },
  studyHistoryDateCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 12, marginBottom: 12 },
  studyHistoryDate: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  historySessionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#EADFDA', paddingTop: 10 },
  historySubject: { color: COLORS.text, fontWeight: '600' },
  historyDuration: { color: '#8A7B82', fontSize: 12, marginTop: 5 },
  historyActions: { flexDirection: 'row', alignItems: 'center' },
  historyEdit: { backgroundColor: COLORS.blue, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  historyEditText: { color: COLORS.text, fontWeight: '600' },
  historyDelete: { backgroundColor: COLORS.pink, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  historyDeleteText: { color: COLORS.text, fontWeight: '600' },
  studyFormCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18 },
  studySubjectRow: { flexDirection: 'row', flexWrap: 'wrap' },
  studySubjectButton: { backgroundColor: '#FDF8F6', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  studySubjectButtonActive: { backgroundColor: COLORS.pink },
  studySubjectText: { color: COLORS.text, fontSize: 12 },
  studySubjectTextActive: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  studyInput: { backgroundColor: '#FFFDFB', borderRadius: 14, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: '#EADFDA' },
  studyDurationInput: { flex: 1, backgroundColor: '#FFFDFB', borderRadius: 14, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: '#EADFDA' },
  durationRow: { flexDirection: 'row', alignItems: 'center' },
  durationLabel: { color: '#8A7B82', marginHorizontal: 8 },
  studyNotesInput: { backgroundColor: '#FFFDFB', borderRadius: 14, padding: 12, color: COLORS.text, fontSize: 14, minHeight: 90, textAlignVertical: 'top', borderWidth: 1, borderColor: '#EADFDA' },
  studyFormActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 },
  studyCancelButton: { backgroundColor: COLORS.white, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
  studyCancelText: { color: COLORS.text, fontWeight: '600' },
  studySaveButton: { backgroundColor: COLORS.pink, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  studySaveText: { color: COLORS.text, fontWeight: '700' },
});
