import ready from '../events/ready.js';
import interactionCreate from '../events/interactionCreate.js';
import rateLimited from '../events/rateLimited.js';
import error from '../events/error.js';

const events = [ready, interactionCreate, rateLimited, error];

export function loadEvents(client) {
  for (const event of events) {
    const emitter = event.rest ? client.rest : client;
    emitter[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args, client));
  }
}
