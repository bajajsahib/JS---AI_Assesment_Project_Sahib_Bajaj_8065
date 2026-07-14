import db from './database.js';

const now = () => new Date().toISOString();

const users = [
  { name: 'Sahib Bajaj', email: 'sahib.bajaj@company.com', role: 'admin' },
  { name: 'Bob Smith', email: 'bob@company.com', role: 'agent' },
  { name: 'Carol Davis', email: 'carol@company.com', role: 'agent' },
  { name: 'David Wilson', email: 'david@company.com', role: 'agent' },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (name, email, role) VALUES (@name, @email, @role)'
);

for (const user of users) {
  insertUser.run(user);
}

const ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;

if (ticketCount === 0) {
  const insertTicket = db.prepare(`
    INSERT INTO tickets (title, description, priority, status, assigned_to, created_by, created_at, updated_at)
    VALUES (@title, @description, @priority, @status, @assigned_to, @created_by, @created_at, @updated_at)
  `);

  const tickets = [
    {
      title: 'Cannot access VPN',
      description: 'User reports VPN connection fails after password reset.',
      priority: 'High',
      status: 'Open',
      assigned_to: 2,
      created_by: 1,
    },
    {
      title: 'Printer offline on Floor 3',
      description: 'Shared printer shows offline status since yesterday.',
      priority: 'Medium',
      status: 'In Progress',
      assigned_to: 3,
      created_by: 1,
    },
    {
      title: 'Email sync delay',
      description: 'Outlook taking 30+ minutes to sync new messages.',
      priority: 'Low',
      status: 'Resolved',
      assigned_to: 2,
      created_by: 4,
    },
  ];

  const timestamp = now();
  for (const ticket of tickets) {
    insertTicket.run({ ...ticket, created_at: timestamp, updated_at: timestamp });
  }

  const insertComment = db.prepare(`
    INSERT INTO comments (ticket_id, message, created_by, created_at)
    VALUES (@ticket_id, @message, @created_by, @created_at)
  `);

  insertComment.run({
    ticket_id: 1,
    message: 'Requested user to restart VPN client.',
    created_by: 2,
    created_at: now(),
  });

  insertComment.run({
    ticket_id: 2,
    message: 'Checked network cable — reseated connection.',
    created_by: 3,
    created_at: now(),
  });
}

console.log('Seed completed successfully.');
