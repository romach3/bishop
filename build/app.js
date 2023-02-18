import { Commands } from './bot/commands.js';
import { Bot } from './bot/bot.js';
import { Sessions } from './bot/sessions/sessions.js';
import { Start } from './bot/commands/start.js';
import { Observer } from './bot/commands/observer.js';
import { AI } from './ai/ai.js';
import { config } from './config.js';
import { Reset } from './bot/commands/reset.js';
const setExitHook = (hook) => {
    const hooks = [
        'exit',
        'SIGINT',
        'SIGUSR1',
        'SIGUSR2',
        'uncaughtException',
        'SIGTERM'
    ];
    hooks.forEach((eventType) => {
        process.on(eventType, hook);
    });
};
void (async () => {
    const ai = new AI(config.openAIKey);
    const commands = new Commands();
    commands
        .add(new Start())
        .add(new Reset())
        .add(new Observer());
    const sessions = new Sessions();
    setExitHook(() => sessions.save());
    setInterval(() => sessions.save(), 30000);
    const bot = new Bot({
        key: config.tgKey,
        commands,
        sessions: sessions.load(),
        ai,
    });
    await bot.launch();
})();
