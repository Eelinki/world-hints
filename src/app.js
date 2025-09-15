import {ErrorHandler, RegexMatch, Ryys} from "ryys";
import Game from "./game.js";
import Database from "better-sqlite3";


const db = new Database('./data/worldhints.db');

const routes = new RegexMatch([
    ['/$', new Game(db)],
]);

const router = new ErrorHandler(routes);

const ryys = new Ryys({
    handler: router,
});

ryys.listen(3000);