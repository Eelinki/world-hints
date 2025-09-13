CREATE TABLE games (
    `id` INTEGER PRIMARY KEY,
    `date` DATE NOT NULL,
    `country` TEXT NOT NULL
);

CREATE TABLE hints (
    `id` INTEGER PRIMARY KEY,
    `game_id` INTEGER REFERENCES games (`id`),
    `difficulty` INTEGER NOT NULL,
    `content` TEXT NOT NULL
);