import db from '../db/database.js';

export function findAllUsers() {
  return db
    .prepare('SELECT id, name, email, role FROM users ORDER BY name ASC')
    .all();
}

export function findUserById(id) {
  return db
    .prepare('SELECT id, name, email, role FROM users WHERE id = @id')
    .get({ id });
}
