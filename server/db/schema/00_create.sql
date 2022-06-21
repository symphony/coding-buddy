DROP TABLE IF EXISTS avatars,
languages,
users,
private_chat_rooms,
messages,
favorites,
private_chat_members,
user_language
CASCADE;

CREATE TABLE avatars (
  id SERIAL PRIMARY KEY NOT NULL,
  avatar_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE languages (
  id SERIAL PRIMARY KEY NOT NULL,
  language_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_id INTEGER REFERENCES avatars(id) ON DELETE CASCADE NOT NULL
);

-- language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE
-- room = all private
CREATE TABLE private_chat_rooms (
  id SERIAL PRIMARY KEY NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY NOT NULL,
  message VARCHAR(255) NOT NULL,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  private_chat_rooms_id INTEGER REFERENCES private_chat_rooms(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY NOT NULL,
  added_by INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  added INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE private_chat_members (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  private_chat_rooms_id INTEGER REFERENCES private_chat_rooms(id) ON DELETE CASCADE
);

CREATE TABLE user_language (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE
);