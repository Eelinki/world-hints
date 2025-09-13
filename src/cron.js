import 'dotenv/config';
import Database from "better-sqlite3";
import process from "node:process";
import * as countryList from 'country-list';
import OpenAI from 'openai';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const db = new Database('worldhints.db');

// select today's game
const today = db.prepare("SELECT id FROM games WHERE date = date('now')").get();

if (today) {
    // today's game already exists
    process.exit(0);
}

// create new game
const countryCodes = Array.from(Object.keys(countryList.getCodeList()));
const randomCountryCode = countryCodes[Math.floor(Math.random() * countryCodes.length)];
const randomCountryName = countryList.getName(randomCountryCode);

const insert = db.prepare("INSERT INTO games (date, country) VALUES (date('now'), :country)");
const gameId = insert.run({
    country: randomCountryCode
}).lastInsertRowid;

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

const prompt = `Come up with 6 random hints about ${randomCountryName}, ordered from very hard to easy. Do not reveal the country name or any dead giveaways.`;

const Hint = z.object({
    difficulty: z.number(),
    content: z.string(),
});

const Hints = z.object({
    hints: z.array(Hint)
});

const gptResponse = await client.responses.parse({
    model: 'gpt-5-nano',
    input: prompt,
    text: {
        format: zodTextFormat(Hints, 'hints')
    }
});

const hintInsert = db.prepare('INSERT INTO hints (game_id, difficulty, content) VALUES (:gameId, :difficulty, :content)');

const insertMany = db.transaction((hints) => {
    for (const hint of hints) {
        hint.gameId = gameId;
        console.log(hint)
        hintInsert.run(hint);
    }
});

insertMany(gptResponse.output_parsed['hints']);