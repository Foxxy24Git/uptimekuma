const Database = require('better-sqlite3');
const d = new Database('D:/uptime-kuma-master/kuma-production-import-20261019.db', { readonly: true });

console.log("=== CHECK DB BACKUP D:\\uptime-kuma-master\\kuma-production-import-20261019.db ===");
const totalMonitor = d.prepare("SELECT count(*) as c FROM monitor").get().c;
console.log("Total monitors in database:", totalMonitor);

const groups = d.prepare("SELECT id, name FROM monitor WHERE type = 'group'").all();
console.log("Total groups:", groups.length);

console.log("\nBreakdown per group:");
for (const g of groups) {
  const count = d.prepare("SELECT count(*) as c FROM monitor WHERE parent = ?").get(g.id).c;
  console.log(`- [${g.id}] ${g.name.trim()}: ${count} monitors`);
}

const noGroup = d.prepare("SELECT count(*) as c FROM monitor WHERE parent IS NULL AND type != 'group'").get().c;
console.log(`- Tanpa Group: ${noGroup} monitors`);

const statusPages = d.prepare("SELECT id, title, slug FROM status_page").all();
console.log("\nStatus Pages:", statusPages);

const users = d.prepare("SELECT id, username FROM user").all();
console.log("\nUsers:", users);

d.close();
