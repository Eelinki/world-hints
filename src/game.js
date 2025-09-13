import {Response} from "ryys";
import * as countries from "./countries.js";

export default class Game {
    #db;

    constructor(db) {
        this.#db = db;
    }

    async handle(request) {
        const query = this.#db.prepare(`
            SELECT g.id, g.date, g.country, json_group_array(json_object('difficulty', h.difficulty, 'content', h.content)) as hints
            FROM games g
                     LEFT JOIN hints h ON g.id = h.game_id
            WHERE g.date = date('now')
            GROUP BY g.id
            LIMIT 1
        `);
        const game = query.get();
        game.countryFull = countries.getName(game.country);

        game.hints = JSON.parse(game.hints);
        game.countries = countries.countries;

        return new Response(200).html(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>World Hints #${game.id}</title>
                
                <link rel="stylesheet" href="/static/styles.css" />
                <script type="module">
                    window.game = ${JSON.stringify(game)};
                </script>
                <script src="/static/main.js" type="module" defer></script>
            </head>
            <body>
                <dialog id="win">
                    <button class="close-modal square">&times;</button>
                    <h1>Nice!</h1>
                    <h3>World Hints #${game.id}</h3>
                    <p>Today's country was ${game.countryFull}.</p>
                    <p>Come back tomorrow for a new puzzle.</p>
                    <button class="share button">Share</button>
                </dialog>
                <dialog id="settings">
                    <button class="close-modal square">&times;</button>
                    <h1>Settings</h1>
                    <p>Reset game state. You will lose all saved games!</p>
                    <button class="reset button">Reset</button>
                </dialog>
                <dialog id="info">
                    <button class="close-modal square">&times;</button>
                    <h1>World Hints</h1>
                    <p>All hints are AI-generated.</p>
                    <hr>
                    <p>If you have any feedback or suggestions, you can contact me at</p>
                    <p><a href="mailto:worldhints@marraskuu.ee">worldhints@marraskuu.ee</a></p>
                    <p><a href="https://github.com/Eelinki" target="_blank">GitHub</a></p>
                </dialog>
                <div class="app">
                    <header>
                        <h1>World Hints #${game.id}</h1>
                        <div class="buttons">
                            <button class="show-settings square" data-dialog="settings">⚙</button>
                            <button class="show-info square" data-dialog="info">?</button>
                        </div>
                    </header>
                    <p>Guess the country based on the clues provided. You'll start with one hint, and for every incorrect guess, you'll receive a new hint,
                    up to a maximum of six hints. Your goal is to correctly identify the country using as few hints as possible.</p>
                    <form autocomplete="off" class="guess-form">
                        <label>
                            <input type="text" list="country-list" />
                        </label>
                        <datalist id="country-list">
                            ${Object.entries(countries.countries).map(([_code, name]) => (
                                `<option value="${name}">${name}</option>`
                            )).join('\n')}
                        </datalist>
                        <input type="submit" value="Guess">
                    </form>
                    <h2>Hints</h2>
                    <ul class="hints-list">
                    </ul>
                    <h2>Your guesses</h2>
                    <ul class="guesses-list">
                    </ul>
                </div>
            </body>
            </html>
        `);
    }
}