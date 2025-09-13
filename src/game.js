import {Response} from "ryys";
import * as countryList from 'country-list';

export default class Game {
    #db;

    constructor(db) {
        this.#db = db;
    }

    async handle(request) {
        const query = this.#db.prepare(`
            SELECT g.id, g.date, g.country, json_group_array(json_object('difficulty', h.difficulty, 'content', h.content))
            FROM games g
                     LEFT JOIN hints h ON g.id = h.game_id
            WHERE g.date = date('now')
            GROUP BY g.id
            LIMIT 1
        `);
        const game = query.get();
        game.countryFull = countryList.getName(game.country);

        return new Response(200).html('');
    }
}