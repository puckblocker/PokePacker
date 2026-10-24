---
--- one admin
--- 3 to 5 buyers
--- 3 to 5 sellers
--- 10 products
---

INSERT INTO account (username, password_hash, email, status, type, denial_reason)
VALUES
    ('admin_poke',     '$2b$10$bq9Nf606EAm.0Vu7xIxJ.uQSke53HgmhwkhRPXB76g6uDe5b7lsDm', 'poke@example.com',         'approved', 'admin' , '[null]' ),
    ('seller_mads',    '$2b$10$oJxIwl3IdgWn8LLWp2ylcOztApogLwSc5OW4nTtlSep.XIoB7GZsu', 'madison@example.com',      'approved', 'seller' , '[null]'),
    ('seller_nath',    '$2b$10$/6R5W2x4SOFHHoxJ9gu36ua/h2.0qMbdVBFa6PVlYztkv8B13hC1m', 'nath@example.com',         'approved', 'seller' , '[null]'),
    ('seller_bray',    '$2b$10$bWjZwHV3aZJBIa2xUHTQOOTXadcAryQyDcW6olk/Az24ZYrj7JuNK', 'brayden@example.com',      'approved', 'seller' , '[null]'),
    ('seller_seth',    '$2b$10$wmyQm.20Gt8CfG6iL2N8Z.26P8JoEC5JaH6DJmjgVRKGNnGNLh9HK', 'seth@example.com',         'pending',  'seller' , '[null]'),
    ('seller_snorlax', '$2b$10$vBKtTfV74drDqa5xETMOleSN9aOEJvTsk0m2SZ1r5XsTYx48P5xH6', 'snorlax@example.com',      'denied',   'seller' , '[null]'),
    ('charizardfan1',  '$2b$10$8MIHDro2TpEus1RF4azvOOYzxSmCCwcKYlAf1PuMpkMAq1hz3raPm', 'charizardfan@example.com', 'approved', 'buyer' , '[null]' ),
    ('iluvpikachu',    '$2b$10$Snzao1VPeyIWSuq./NhKg.Ntbr0JMRxdCq/nPnvOQHyXUUcBEf3Na', 'pikachufan@example.com',   'approved', 'buyer' , '[null]' ),
    ('eeveeiscute',    '$2b$10$X9KeD1/r.Tjq.oBmNy88Ue8c5LGFKC28JdsQUZY9NnSQrSA3xzCXm', 'eeveefan@example.com',     'pending',  'buyer' , '[null]' ),
    ('mewtwoisbest',   '$2b$10$edjOMv9.nC4lh7Wiq.yIReDSs0fkdG.Cf.X4b/SuQ5PxpeieVhz2a', 'mewtwofan@example.com',    'banned',   'buyer' , '[null]' );

INSERT INTO listing (seller_id, listing_name, quantity, condition, price, image, description, status)
VALUES (2, 'Eevee - 116/128 (30th Celebration) (Cosmos)', 1, 'moderate',   2400, '/tests/img_src/eevee_1.jpg',   'SUPER DETAILED DESCRIPTION', 'active'),
       (2, 'Psyduck - 226/217',                           1, 'moderate',   3585, '/tests/img_src/psyduck.jpg',   'SUPER DETAILED DESCRIPTION', 'active'),
       (2, 'Bulbasaur - 133/132',                         1, 'moderate',   1563, '/tests/img_src/bulbasaur.jpg',   'SUPER DETAILED DESCRIPTION', 'pending'),
       (3, 'Wigglypuff - 105/094',                        1, 'moderate',   470,  '/tests/img_src/wigglypuff.jpg', 'SUPER DETAILED DESCRIPTION', 'active'),
       (3, 'Maushold - 146/128',                          1, 'mint',       1092, '/tests/img_src/maushold.jpg',   'SUPER DETAILED DESCRIPTION', 'removed'),
       (3, 'Mega Kangaskhan ex - 104/132',                1, 'mint',       284,  '/tests/img_src/mega_kangaskhan.jpg', 'SUPER DETAILED DESCRIPTION', 'active'),
       (3, 'Pikachu ex - 054/128',                        1, 'damaged',    124,  '/tests/img_src/pikachu_ex.jpg',       'SUPER DETAILED DESCRIPTION', 'active'),
       (4, 'Kommo-o - 143/128',                           1, 'mint',       140,  '/tests/img_src/kommo.jpg',            'SUPER DETAILED DESCRIPTION', 'pending'),
       (4, 'Jirachi ex - 102/128',                        1, 'mint',       48,   '/tests/img_src/jirachi.jpg',          'SUPER DETAILED DESCRIPTION', 'active'),
       (4, 'Meowth ex - 062/088',                         1, 'damaged',    156,  '/tests/img_src/meowth_ex.jpg',        'SUPER DETAILED DESCRIPTION', 'removed');
    
INSERT INTO cart (account_id, listing_id, quantity)
VALUES  (7, 4, 1),
        (7, 9, 1),
        (8, 1, 1),
        (8, 6, 1),
        (9, 2, 1);

INSERT INTO orders (account_id, status) 
VALUES (7, 'delivered'),
       (7, 'paid'),
       (7, 'pending'),
       (8, 'shipped'),
       (8, 'pending'),
       (9, 'cancelled');