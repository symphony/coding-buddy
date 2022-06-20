DROP TABLE IF EXISTS users
CASCADE;
DROP TABLE IF EXISTS private_chats
CASCADE;
DROP TABLE IF EXISTS private_chats_rooms
CASCADE;
DROP TABLE IF EXISTS favorites
CASCADE;
DROP TABLE IF EXISTS avatars
CASCADE;
DROP TABLE IF EXISTS languages
CASCADE;
DROP TABLE IF EXISTS messages
CASCADE;
DROP TABLE IF EXISTS user_language
CASCADE;
DROP TABLE IF EXISTS private_chat_members
CASCADE;

CREATE TABLE avatars
(
  id SERIAL PRIMARY KEY NOT NULL,
  avatar_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE languages
(
  id SERIAL PRIMARY KEY NOT NULL,
  language_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE users
(
  id SERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_id INTEGER REFERENCES avatars(id) ON DELETE CASCADE NOT NULL
);
-- language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE

-- room = all private
CREATE TABLE private_chats_rooms
(
  id SERIAL PRIMARY KEY NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE messages
(
  id SERIAL PRIMARY KEY NOT NULL,
  message VARCHAR(255) NOT NULL,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  private_chats_rooms_id INTEGER REFERENCES private_chats_rooms(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE favorites
(
  id SERIAL PRIMARY KEY NOT NULL,
  added_by INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  added INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE private_chat_members
(
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  private_chats_rooms_id INTEGER REFERENCES private_chats_rooms(id) ON DELETE CASCADE
);

CREATE TABLE user_language
(
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE
);