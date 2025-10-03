import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  decimal, 
  boolean,
  jsonb,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum для типов специалистов
export const specialistTypeEnum = pgEnum('specialist_type', [
  'nanny',
  'psychologist', 
  'tutor',
  'speech_therapist',
  'defectologist'
]);

// Карта типов специалистов для отображения русских названий
export const SPECIALIST_TYPE_MAP = {
  nanny: 'Няня',
  psychologist: 'Психолог',
  tutor: 'Репетитор', 
  speech_therapist: 'Логопед',
  defectologist: 'Дефектолог'
} as const;

export type SpecialistType = keyof typeof SPECIALIST_TYPE_MAP;

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - supports multiple roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone").unique(),
  roles: jsonb("roles").notNull().default('[]'), // Array of roles: ['parent', 'nanny']
  activeRole: varchar("active_role").notNull().default("parent"), // Currently active role
  isPhoneVerified: boolean("is_phone_verified").default(false),
  hasStartedOnboarding: boolean("has_started_onboarding").default(false), // Нажимал ли на "продолжить заполнение"
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Phone verification codes table
export const verificationCodes = pgTable("verification_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone").notNull(),
  code: varchar("code").notNull(),
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Auth attempts table - отслеживание попыток для эскалации OTP -> Voice -> SMS
export const authAttempts = pgTable("auth_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone").notNull(),
  currentMethod: varchar("current_method").notNull().default("otp"), // 'otp', 'voice', 'sms'
  otpAttempts: integer("otp_attempts").notNull().default(0),
  voiceAttempts: integer("voice_attempts").notNull().default(0),
  smsAttempts: integer("sms_attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow(),
  sessionId: varchar("session_id"), // ID сессии для связки с Sigma ProPush
  expiresAt: timestamp("expires_at").notNull(), // Время сброса попыток
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auth logs table - логи попыток авторизации
export const authLogs = pgTable("auth_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone").notNull(),
  method: varchar("method").notNull(), // 'flashcall', 'sms', 'voice'
  status: varchar("status").notNull(), // 'sent', 'failed', 'pending'
  scriptStatus: integer("script_status"), // HTTP статус от Sigma API
  code: varchar("code"), // отправленный код
  requestId: varchar("request_id"), // ID запроса от Sigma
  price: decimal("price", { precision: 10, scale: 2 }), // стоимость от Sigma
  errorMessage: text("error_message"), // ошибка если есть
  userAgent: text("user_agent"), // браузер пользователя
  ipAddress: varchar("ip_address"), // IP адрес
  createdAt: timestamp("created_at").defaultNow(),
});

// Parent profiles table - профили родителей
export const parentProfiles = pgTable("parent_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  childrenInfo: jsonb("children_info"), // информация о детях
  preferredAgeRange: jsonb("preferred_age_range"), // предпочитаемый возраст няни
  address: text("address"),
  district: varchar("district"),
  profileCompleted: boolean("profile_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nanny profiles table - анкеты нянь (расширенная схема)
export const nannyProfiles = pgTable("nanny_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Личная информация
  firstName: varchar("first_name"),
  middleName: varchar("middle_name"),
  birthDate: varchar("birth_date"), // YYYY-MM-DD
  citizenship: varchar("citizenship"),
  city: varchar("city").notNull().default("Казань"),
  district: varchar("district"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Профессиональная информация
  bio: text("bio"),
  experience: integer("experience"), // лет опыта
  specialistType: specialistTypeEnum("specialist_type").notNull().default("nanny"), // тип специалиста
  specialization: varchar("specialization"), // детский сад, начальная школа и т.д.
  education: varchar("education"), // тип образования
  
  // Специализация и навыки (JSONB для гибкости)
  ageGroups: jsonb("age_groups"), // возрастные группы
  basicDuties: jsonb("basic_duties"), // основные обязанности
  additionalDuties: jsonb("additional_duties"), // дополнительные обязанности  
  medicalSkills: jsonb("medical_skills"), // медицинские навыки
  pedagogicalMethods: jsonb("pedagogical_methods"), // педагогические методы
  languages: jsonb("languages"), // языки [{ language, level }]
  
  // Документы и проверки
  documentsInfo: jsonb("documents_info"), // информация о документах
  documentsUploaded: boolean("documents_uploaded").default(false),
  
  // Расписание и тарифы
  schedule: jsonb("schedule"), // график работы по дням
  ratesInfo: jsonb("rates_info"), // тарифы и условия оплаты
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }), // основная ставка
  minOrderHours: integer("min_order_hours"), // минимальный заказ в часах
  
  // Дополнительная информация
  additionalInfo: jsonb("additional_info"), // аллергии, животные, самозанятость и т.д.
  agreements: jsonb("agreements"), // согласия пользователя
  
  // ЧПУ URL
  slug: varchar("slug", { length: 255 }).unique(), // для красивых URLs
  
  // Системные поля
  moderationStatus: varchar("moderation_status").default("inactive"), // inactive, pending_review, verified, active
  profileCompleted: boolean("profile_completed").default(false),
  profileCompleteness: integer("profile_completeness").default(0), // процент заполнения
  subscriptionStatus: varchar("subscription_status").default("unpaid"), // unpaid, paid, expired
  
  // Timestamps (сохраняем старые поля для совместимости)
  availability: jsonb("availability"), // legacy - расписание доступности
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy nannies table - для обратной совместимости
export const nannies = pgTable("nannies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bio: text("bio"),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  age: integer("age"),
  experience: integer("experience"), // часы опыта
  rating: decimal("rating", { precision: 2, scale: 1 }), // рейтинг от 0 до 5
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }), // цена за час
  description: text("description"),
  profileImageUrl: varchar("profile_image_url"),
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  city: varchar("city").notNull().default("Казань"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nanny skills - навыки нянь
export const nannySkills = pgTable("nanny_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nannyId: varchar("nanny_id").notNull().references(() => nannies.id),
  skill: varchar("skill").notNull(), // например: "Первая помощь", "Готовка", "Уборка"
});

// Service types - типы услуг
export const serviceTypes = pgTable("service_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 8, scale: 2 }),
});

// Orders table - заказы (актуализированная схема согласно спецификации)
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  nannyId: varchar("nanny_id").references(() => nannies.id),
  
  // Шаг 1: Основные параметры услуги
  serviceType: varchar("service_type").notNull(), // на час / на период / с проживанием / на постоянной основе
  serviceSubtype: varchar("service_subtype"), // краткосрочная / долгосрочная
  purposeText: text("purpose_text"), // цель обращения (для дальнейшего мапинга)
  
  // Дата и время
  startDate: varchar("start_date").notNull(), // YYYY-MM-DD формат
  endDate: varchar("end_date"), // если есть
  startTime: varchar("start_time"), // HH:MM формат
  endTime: varchar("end_time"), // HH:MM формат
  
  // Место оказания услуги
  city: varchar("city").notNull().default("Казань"),
  address: text("address").notNull(),
  metro: varchar("metro"), // ближайшее метро
  district: varchar("district"), // район
  floor: varchar("floor"), // этаж
  entrance: varchar("entrance"), // подъезд
  
  // Шаг 2: Дети и задачи
  childrenCount: integer("children_count").notNull().default(1),
  childrenAges: jsonb("ages"), // массив возрастов - используем имя колонки ages из БД
  childrenGenders: jsonb("children_genders"), // массив полов (M/F)
  tasks: jsonb("tasks"), // массив основных задач
  additionalTasks: jsonb("additional_tasks"), // массив дополнительных задач
  additionalTasksOther: text("additional_tasks_other"), // другие дополнительные задачи
  healthFeatures: jsonb("health_features"), // массив особенностей здоровья
  healthFeaturesOther: text("health_features_other"), // другие особенности здоровья
  pets: varchar("pets"), // домашние животные
  specialNeeds: text("special_needs"), // особые потребности
  
  medicalBookRequired: boolean("medical_book_required").default(false),
  recommendationsRequired: boolean("recommendations_required").default(false), 
  medicalEducationRequired: boolean("medical_education_required").default(false),
  preferredAgeMin: integer("preferred_age_min"),
  preferredAgeMax: integer("preferred_age_max"),
  russianLevelRequired: varchar("russian_level_required"), // native, fluent, intermediate
  educationLevel: varchar("education_level"), // среднее, высшее, педагогическое
  experienceYears: integer("experience_years"), // лет опыта
  paymentType: varchar("payment_type").default("fixed"), // fixed, negotiable
  paymentMethod: varchar("payment_method"), // наличные, карта, счет
  citizenship: varchar("citizenship"), // гражданство няни
  maritalStatus: varchar("marital_status"), // семейное положение няни
  
  // Контактная информация (из авторизации)
  phone: varchar("phone").notNull(),
  messenger: varchar("messenger"), // telegram, whatsapp
  email: varchar("email"),
  
  // Поля для заказа на другого человека
  recipientPhone: varchar("recipient_phone"), // телефон получателя
  isOtherPersonOrder: boolean("is_other_person_order").default(false), // заказ на другого человека
  otherPersonName: varchar("other_person_name"), // имя другого человека
  otherPersonPhone: varchar("other_person_phone"), // телефон другого человека
  
  // Системные поля
  orderNumber: varchar("order_number").unique(), // уникальный номер заказа типа I-431
  status: varchar("status").notNull().default("published"), // published, negotiating, confirmed, active, pending_completion, completed, cancelled
  totalPrice: decimal("total_price", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table - отзывы
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  nannyId: varchar("nanny_id").notNull().references(() => nannies.id),
  rating: integer("rating").notNull(), // от 1 до 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order counters table - для генерации уникальных номеров заказов
export const orderCounters = pgTable("order_counters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  letterPrefix: varchar("letter_prefix").notNull().unique(), // первая буква имени клиента на латинице
  lastNumber: integer("last_number").notNull().default(0), // последний использованный номер
  startNumber: integer("start_number").notNull(), // начальный номер для этой буквы
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FAQ table
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").default(true),
});

// Nanny Applications - отклики нянь на заказы
export const nannyApplications = pgTable("nanny_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  nannyId: varchar("nanny_id").notNull().references(() => nannyProfiles.id),
  message: text("message"), // сообщение от няни
  proposedRate: decimal("proposed_rate", { precision: 8, scale: 2 }), // предложенная ставка
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Favorites table - избранные няни
export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  nannyId: varchar("nanny_id").notNull().references(() => nannyProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Избранные заказы для нянь
export const orderFavorites = pgTable("order_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id), // ID няни
  orderId: varchar("order_id").notNull().references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas для orderFavorites
export const insertOrderFavoriteSchema = createInsertSchema(orderFavorites);
export type InsertOrderFavorite = z.infer<typeof insertOrderFavoriteSchema>;
export type OrderFavorite = typeof orderFavorites.$inferSelect;

// Messages - чат между заказчиком и няней
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  orderId: varchar("order_id").notNull(), // Сделаем обязательным для совместимости с БД
  conversationId: varchar("conversation_id").notNull(), // для группировки сообщений
  content: text("content").notNull(),
  message_type: varchar("message_type").default("text"), // text, image, file (соответствует БД)
  is_read: boolean("is_read").default(false), // прочитано или нет (соответствует БД)
  is_pending: boolean("is_pending").default(false), // для неоплаченных сообщений
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations table для группировки чатов
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  nannyId: varchar("nanny_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  lastMessageId: varchar("last_message_id").references(() => messages.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  clientUnreadCount: integer("client_unread_count").default(0),
  nannyUnreadCount: integer("nanny_unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Agreements - договоренности между клиентом и няней
export const orderAgreements = pgTable("order_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  nannyId: varchar("nanny_id").notNull().references(() => nannyProfiles.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  
  // Детали договоренности
  agreedRate: decimal("agreed_rate", { precision: 8, scale: 2 }).notNull(),
  agreedTerms: text("agreed_terms"), // дополнительные условия
  
  // Подтверждения сторон
  confirmedByClient: boolean("confirmed_by_client").default(false),
  confirmedByNanny: boolean("confirmed_by_nanny").default(false),
  
  // Временные параметры
  scheduledStartTime: timestamp("scheduled_start_time"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  
  // Статусы
  status: varchar("status").notNull().default("pending"), // pending, confirmed, active, completed, cancelled
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Offers - предложения заказов специалистам
export const orderOffers = pgTable("order_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  nannyId: varchar("nanny_id").notNull().references(() => nannyProfiles.id),
  userId: varchar("user_id").notNull().references(() => users.id), // кто предложил заказ
  message: text("message"), // персональное сообщение
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, expired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications - уведомления
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // sms, push, email, in_app
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawal requests - запросы на вывод средств
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bankDetails: jsonb("bank_details"), // реквизиты для перевода
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, rejected
  adminNotes: text("admin_notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table - для Kafka offset logs
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(), // order.created, nanny.responded, payment.success, chat.message
  payload: jsonb("payload").notNull(),
  userId: varchar("user_id").references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const nannyRelations = relations(nannies, ({ many }) => ({
  skills: many(nannySkills),
  orders: many(orders),
  reviews: many(reviews),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  orders: many(orders),
  reviews: many(reviews),
  parentProfile: one(parentProfiles, {
    fields: [users.id],
    references: [parentProfiles.userId],
  }),
  nannyProfile: one(nannyProfiles, {
    fields: [users.id],
    references: [nannyProfiles.userId],
  }),
}));

export const parentProfileRelations = relations(parentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [parentProfiles.userId],
    references: [users.id],
  }),
}));

export const nannyProfileRelations = relations(nannyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [nannyProfiles.userId],
    references: [users.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  nanny: one(nannies, {
    fields: [orders.nannyId],
    references: [nannies.id],
  }),
  reviews: many(reviews),
  applications: many(nannyApplications),
  offers: many(orderOffers),
}));

export const orderAgreementRelations = relations(orderAgreements, ({ one }) => ({
  order: one(orders, {
    fields: [orderAgreements.orderId],
    references: [orders.id],
  }),
  nanny: one(nannyProfiles, {
    fields: [orderAgreements.nannyId],
    references: [nannyProfiles.id],
  }),
  client: one(users, {
    fields: [orderAgreements.clientId],
    references: [users.id],
  }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  nanny: one(nannies, {
    fields: [reviews.nannyId],
    references: [nannies.id],
  }),
}));

export const nannySkillRelations = relations(nannySkills, ({ one }) => ({
  nanny: one(nannies, {
    fields: [nannySkills.nannyId],
    references: [nannies.id],
  }),
}));

export const nannyApplicationRelations = relations(nannyApplications, ({ one }) => ({
  order: one(orders, {
    fields: [nannyApplications.orderId],
    references: [orders.id],
  }),
  nanny: one(nannyProfiles, {
    fields: [nannyApplications.nannyId],
    references: [nannyProfiles.id],
  }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  order: one(orders, {
    fields: [messages.orderId],
    references: [orders.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParentProfileSchema = createInsertSchema(parentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNannySchema = createInsertSchema(nannies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().optional(), // Делаем userId опциональным
  totalPrice: z.number().optional().or(z.string().optional()), // Принимаем как число или строку
});

export const insertOrderAgreementSchema = createInsertSchema(orderAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertFAQSchema = createInsertSchema(faqs).omit({
  id: true,
});

export const insertNannyApplicationSchema = createInsertSchema(nannyApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNannyProfileSchema = createInsertSchema(nannyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertOrderOfferSchema = createInsertSchema(orderOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuthAttemptSchema = createInsertSchema(authAttempts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User Favorites schema
export const insertFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ParentProfile = typeof parentProfiles.$inferSelect;
export type InsertParentProfile = z.infer<typeof insertParentProfileSchema>;

export type Nanny = typeof nannies.$inferSelect;
export type InsertNanny = z.infer<typeof insertNannySchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFAQSchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type NannySkill = typeof nannySkills.$inferSelect;

export type NannyApplication = typeof nannyApplications.$inferSelect;
export type InsertNannyApplication = z.infer<typeof insertNannyApplicationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NannyProfile = typeof nannyProfiles.$inferSelect;
export type InsertNannyProfile = z.infer<typeof insertNannyProfileSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type OrderOffer = typeof orderOffers.$inferSelect;
export type InsertOrderOffer = z.infer<typeof insertOrderOfferSchema>;

export type Favorite = typeof userFavorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type AuthAttempt = typeof authAttempts.$inferSelect;
export type InsertAuthAttempt = z.infer<typeof insertAuthAttemptSchema>;

// Blog Articles
export const articles = pgTable('articles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  ageGroup: varchar('age_group', { length: 50 }),
  authorName: varchar('author_name', { length: 255 }),
  authorCredentials: text('author_credentials'),
  authorBio: text('author_bio'),
  publishedAt: timestamp('published_at').defaultNow(),
  readTime: varchar('read_time', { length: 20 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  imageUrl: text('image_url'),
  viewsCount: integer('views_count').default(0),
  isFeatured: boolean('is_featured').default(false),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  createdAt: true,
  updatedAt: true,
  viewsCount: true,
});
export const selectArticleSchema = createInsertSchema(articles);
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Article Categories
export const articleCategories = pgTable('article_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 7 }),
  icon: varchar('icon', { length: 50 }),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertArticleCategorySchema = createInsertSchema(articleCategories).omit({
  createdAt: true,
});
export const selectArticleCategorySchema = createInsertSchema(articleCategories);
export type ArticleCategory = typeof articleCategories.$inferSelect;
export type InsertArticleCategory = z.infer<typeof insertArticleCategorySchema>;

// Article Tags
export const articleTags = pgTable('article_tags', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const articleTagRelations = pgTable('article_tag_relations', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => articleTags.id, { onDelete: 'cascade' }),
});

export const insertArticleTagSchema = createInsertSchema(articleTags).omit({
  createdAt: true,
});
export const selectArticleTagSchema = createInsertSchema(articleTags);
export type ArticleTag = typeof articleTags.$inferSelect;
export type InsertArticleTag = z.infer<typeof insertArticleTagSchema>;

// Auth logs schema
export const insertAuthLogSchema = createInsertSchema(authLogs).omit({
  createdAt: true,
});
export const selectAuthLogSchema = createInsertSchema(authLogs);
export type AuthLog = typeof authLogs.$inferSelect;
export type InsertAuthLog = z.infer<typeof insertAuthLogSchema>;

// =============================================================================
// V2 UI HELPER TYPES
// =============================================================================
// These types are designed to support V2 client screens without changing DB structure

// Order Status Types for UI Display
export const ORDER_STATUS_MAP = {
  published: 'Опубликован',
  negotiating: 'На согласовании', 
  confirmed: 'Подтвержден',
  active: 'Активный',
  pending_completion: 'Ожидает завершения',
  completed: 'Завершен',
  cancelled: 'Отменен'
} as const;

export const APPLICATION_STATUS_MAP = {
  pending: 'Ожидает ответа',
  accepted: 'Принят',
  rejected: 'Отклонен'
} as const;

export const MODERATION_STATUS_MAP = {
  inactive: 'Неактивна',
  pending_review: 'На модерации',
  verified: 'Проверена',
  active: 'Активна',
  rejected: 'Отклонена'
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_MAP;
export type ApplicationStatus = keyof typeof APPLICATION_STATUS_MAP;
export type ModerationStatus = keyof typeof MODERATION_STATUS_MAP;

// Search Filter Types for V2 Nanny Search Screen
export interface NannySearchFilters {
  specialistTypes?: SpecialistType[];
  ageGroups?: string[];
  experienceMin?: number;
  experienceMax?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  city?: string;
  district?: string;
  hasDocuments?: boolean;
  languages?: string[];
  basicDuties?: string[];
  additionalDuties?: string[];
  medicalSkills?: string[];
  availability?: {
    [key: string]: { from: string; to: string; enabled: boolean };
  };
}

// Order Filter Types for V2 Order Screens  
export interface OrderFilters {
  status?: OrderStatus[];
  serviceType?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  childrenCount?: number;
  ageGroups?: string[];
}

// UI State Types for Form Management
export interface FormState<T = any> {
  data: T;
  isLoading: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
}

// API Response Wrapper Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// V2 Screen-Specific Data Types
export interface NannyCardData {
  id: string;
  firstName: string;
  lastName?: string;
  profileImageUrl?: string;
  specialistType: SpecialistType;
  experience: number;
  hourlyRate: string;
  city: string;
  district?: string;
  rating?: number;
  isVerified?: boolean;
  isFavorite: boolean;
  ageGroups?: string[];
  basicDuties?: string[];
  bio?: string;
}

export interface OrderCardData {
  id: string;
  orderNumber: string;
  serviceType: string;
  startDate: string;
  startTime?: string;
  endTime?: string;
  address: string;
  childrenCount: number;
  childrenAges?: number[];
  status: OrderStatus;
  totalPrice?: string;
  applicationsCount?: number;
  createdAt: string;
  isUrgent?: boolean;
  tasks?: string[];
}

export interface ApplicationCardData {
  id: string;
  orderId: string;
  orderNumber: string;
  message?: string;
  proposedRate?: string;
  status: ApplicationStatus;
  createdAt: string;
  order: {
    serviceType: string;
    startDate: string;
    address: string;
    childrenCount: number;
    tasks?: string[];
  };
}

// Chat/Message Types for V2
export interface ConversationData {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  orderId?: string;
  orderNumber?: string;
}

// Notification Types for V2
export interface NotificationData {
  id: string;
  type: 'order' | 'application' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Feature Flag Types (for V2 rollout)
export interface FeatureFlags {
  MOBILE_ORDERS_V2: boolean;
  MOBILE_FIND_NANNY_V2: boolean;
  MOBILE_RESPONSES_V2: boolean;
  MOBILE_PROFILE_V2: boolean;
  MOBILE_CHAT_V2: boolean;
}

// Validation Schemas for V2 Forms
export const nannySearchFiltersSchema = z.object({
  specialistTypes: z.array(z.enum(['nanny', 'psychologist', 'tutor', 'speech_therapist', 'defectologist'])).optional(),
  ageGroups: z.array(z.string()).optional(),
  experienceMin: z.number().min(0).optional(),
  experienceMax: z.number().min(0).optional(), 
  hourlyRateMin: z.number().min(0).optional(),
  hourlyRateMax: z.number().min(0).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  hasDocuments: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  basicDuties: z.array(z.string()).optional(),
  additionalDuties: z.array(z.string()).optional(),
  medicalSkills: z.array(z.string()).optional(),
  availability: z.record(z.object({
    from: z.string(),
    to: z.string(), 
    enabled: z.boolean()
  })).optional()
});

export const orderFiltersSchema = z.object({
  status: z.array(z.enum(['published', 'negotiating', 'confirmed', 'active', 'pending_completion', 'completed', 'cancelled'])).optional(),
  serviceType: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  city: z.string().optional(),
  childrenCount: z.number().min(1).optional(),
  ageGroups: z.array(z.string()).optional()
});

export type NannySearchFiltersInput = z.infer<typeof nannySearchFiltersSchema>;
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;
